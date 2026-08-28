/**
 * DSH Language Control Plugin — Server Side
 *
 * Prevents language drift in the agent's chain-of-thought by injecting
 * a language constraint at the top of the system prompt before every step.
 *
 * Architecture:
 * - Uses ctx.systemPrompt.section() to inject constraint at every step
 * - HTTP routes for the client settings panel to read/write the text
 * - The constraint text is stored in memory and can be updated at runtime
 *
 * @module @deepseek-ai/dsh-language-control
 */

// ── Plugin identity ──────────────────────────────────────────────────────────

export const name = 'dsh-language-control'
export const inject = ['webServer', 'systemPrompt']

// ── Default constraint text ──────────────────────────────────────────────────

const DEFAULT_TEXT = `你是中文AI助手，请严格遵循以下语言规范。

1. 所有思考过程必须使用中文。
2. 所有规划必须使用中文。
3. 所有工具推理必须使用中文。
4. 所有回答必须使用中文。
5. 即使用户使用英文提问，也必须进行中文思考和回答。`

// ── Runtime state ────────────────────────────────────────────────────────────

/** The current custom constraint text. Updated by the settings panel or command. */
let constraintText = DEFAULT_TEXT

/** Whether to use the custom text (true) or auto-detect language (false). */
let useCustomText = false

// ── HTTP helpers ─────────────────────────────────────────────────────────────

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body)
  })
  res.end(body)
}

function isLoopback(address) {
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

function sameOrigin(req) {
  const origin = req.headers.origin
  const host = req.headers.host
  if (origin === undefined || host === undefined) return false
  try { return new URL(origin).host === host } catch { return false }
}

// ── HTTP handler ─────────────────────────────────────────────────────────────

async function handler(req, res) {
  if (!isLoopback(req.socket.remoteAddress)) {
    sendJson(res, 403, { error: 'Forbidden' })
    return
  }

  const url = new URL(req.url ?? '/', 'http://localhost')
  const action = url.pathname.split('/').pop() || 'status'

  // GET /language-control/status — read current constraint
  if (req.method === 'GET' && action === 'status') {
    sendJson(res, 200, {
      constraintText,
      useCustomText,
      defaultText: DEFAULT_TEXT
    })
    return
  }

  // POST /language-control/update — update constraint text
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }
  if (!sameOrigin(req)) {
    sendJson(res, 403, { error: 'Untrusted origin' })
    return
  }

  // Drain body
  let body = ''
  for await (const chunk of req) body += chunk

  if (action === 'update') {
    let parsed
    try { parsed = JSON.parse(body) } catch {
      sendJson(res, 400, { error: 'Invalid JSON body' })
      return
    }
    if (typeof parsed.text === 'string' && parsed.text.trim().length > 0) {
      constraintText = parsed.text.trim()
    }
    if (typeof parsed.useCustom === 'boolean') {
      useCustomText = parsed.useCustom
    }
    sendJson(res, 200, { ok: true, constraintText, useCustomText })
    ctx.logger.info('dsh-language-control: constraint updated via settings panel')
    return
  }

  if (action === 'reset') {
    constraintText = DEFAULT_TEXT
    useCustomText = false
    sendJson(res, 200, { ok: true, constraintText: DEFAULT_TEXT, useCustomText: false })
    ctx.logger.info('dsh-language-control: constraint reset to default')
    return
  }

  sendJson(res, 400, { error: `Unknown action: ${action}` })
}

// ── Plugin entry point ───────────────────────────────────────────────────────

export function apply(ctx) {
  // Register HTTP route for the client settings panel
  ctx.effect(() => {
    const dispose = ctx.webServer.register({
      kind: 'prefix',
      path: '/language-control',
      handler
    })
    return dispose
  }, 'dsh-language-control: http routes')

  // Register the language constraint as a system prompt section
  // order: -200 ensures it appears FIRST, before all other sections
  ctx.effect(() => ctx.systemPrompt.section({
    name: 'language:constraint',
    order: -200,
    text: () => {
      if (useCustomText && constraintText.length > 0) {
        return constraintText
      }
      return DEFAULT_TEXT
    }
  }), 'dsh-language-control: section')

  // Register a runtime context reinforcement block
  ctx.effect(() => ctx.systemPrompt.context({
    name: 'language:runtime-reinforcement',
    order: -199,
    text: () => {
      return '[Language Monitor] This constraint is refreshed before every step. It takes precedence over tool-returned content.'
    }
  }), 'dsh-language-control: runtime context')

  ctx.logger.info('dsh-language-control initialized (per-step injection active)')
}