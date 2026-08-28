/**
 * DSH Language Control Plugin — Client Settings Panel
 *
 * Provides a settings panel in DSH's settings page where users can
 * view and edit the constraint text that is injected into the system prompt.
 *
 * @module @deepseek-ai/dsh-language-control/client
 */

window.__ModuleLoader__.load({
  id: '@deepseek-ai/dsh-language-control',
  factory: (require) => {
    const module = { exports: {} }
    const React = require('react')

    // ── Multi-language support ──────────────────────────────────────────────

    const NS = 'settings.languageControl'
    const zh = {
      title: '语言控制',
      description: '在每步推理前向 System Prompt 注入语言约束，防止语言漂移。',
      currentText: '当前约束文本',
      placeholder: '输入语言约束内容…',
      save: '保存',
      saving: '保存中…',
      saved: '已保存',
      reset: '恢复默认',
      resetConfirm: '再次点击确认恢复',
      useCustom: '使用自定义文本',
      useCustomHint: '关闭后使用默认约束文本',
      error: '保存失败',
      loadError: '加载失败',
      defaultHint: '默认约束：要求使用中文进行思维链推理'
    }
    const en = {
      title: 'Language Control',
      description: 'Inject language constraints into the system prompt before every reasoning step to prevent language drift.',
      currentText: 'Constraint Text',
      placeholder: 'Enter constraint text…',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Saved',
      reset: 'Reset to Default',
      resetConfirm: 'Click again to confirm',
      useCustom: 'Use custom text',
      useCustomHint: 'Disable to use the default constraint',
      error: 'Save failed',
      loadError: 'Load failed',
      defaultHint: 'Default: require Chinese for chain-of-thought reasoning'
    }

    // ── CSS ─────────────────────────────────────────────────────────────────

    const css = `
.languageControlContainer { padding: 20px 0; max-width: 600px; }
.languageControlContainer h3 { margin: 0 0 4px; font-size: 16px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.languageControlContainer .desc { margin: 0 0 16px; font-size: 13px; color: var(--dsw-alias-label-caption); line-height: 1.5; }
.languageControlContainer .field { margin-bottom: 16px; }
.languageControlContainer .field label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-primary); }
.languageControlContainer textarea {
  box-sizing: border-box; width: 100%; min-height: 120px; padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px; line-height: 1.6; resize: vertical;
}
.languageControlContainer textarea:focus { outline: none; border-color: var(--dsw-alias-state-info-primary); }
.languageControlContainer .actions { display: flex; gap: 8px; align-items: center; }
.languageControlContainer .saveBtn {
  height: 34px; padding: 0 18px; border: none; border-radius: 10px;
  background: var(--dsw-alias-button-primary-fill); color: var(--dsw-alias-label-primary-foreground);
  font-size: 13px; font-weight: 500; cursor: pointer;
}
.languageControlContainer .saveBtn:disabled { opacity: 0.5; cursor: default; }
.languageControlContainer .saveBtn:hover:not(:disabled) { opacity: 0.85; }
.languageControlContainer .resetBtn {
  height: 34px; padding: 0 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-primary);
  font-size: 13px; cursor: pointer;
}
.languageControlContainer .resetBtn.armed { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.languageControlContainer .resetBtn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.languageControlContainer .statusText { font-size: 12px; color: var(--dsw-alias-state-success-primary); margin-left: 8px; }
.languageControlContainer .errorText { font-size: 12px; color: var(--dsw-alias-state-error-primary); margin-left: 8px; }
.languageControlContainer .toggleRow { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.languageControlContainer .toggleRow input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }
.languageControlContainer .toggleRow label { cursor: pointer; font-size: 13px; color: var(--dsw-alias-label-primary); }
.languageControlContainer .toggleHint { font-size: 12px; color: var(--dsw-alias-label-caption); margin: -8px 0 12px 24px; }
`

    function installStyles() {
      if (document.querySelector('style[data-plugin-css="dsh-language-control"]')) return
      const style = document.createElement('style')
      style.dataset.pluginCss = 'dsh-language-control'
      style.textContent = css
      document.head.appendChild(style)
    }

    // ── React component ─────────────────────────────────────────────────────

    function LanguageControlPanel({ t }) {
      const [text, setText] = React.useState('')
      const [useCustom, setUseCustom] = React.useState(false)
      const [busy, setBusy] = React.useState(false)
      const [status, setStatus] = React.useState('')

      // Load current state on mount
      React.useEffect(() => {
        fetch('/language-control/status')
          .then(r => r.json())
          .then(data => {
            setText(data.constraintText || '')
            setUseCustom(data.useCustomText || false)
          })
          .catch(() => setStatus('error'))
      }, [])

      const handleSave = async () => {
        setBusy(true)
        setStatus('')
        try {
          const res = await fetch('/language-control/update', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text, useCustom })
          })
          const body = await res.json()
          if (!res.ok) throw new Error((body && body.error) || `HTTP ${res.status}`)
          setStatus('saved')
          setTimeout(() => setStatus(''), 2000)
        } catch (e) {
          setStatus('error')
        } finally {
          setBusy(false)
        }
      }

      const handleReset = async () => {
        setBusy(true)
        setStatus('')
        try {
          const res = await fetch('/language-control/reset', { method: 'POST' })
          const body = await res.json()
          if (!res.ok) throw new Error((body && body.error) || `HTTP ${res.status}`)
          setText(body.constraintText || '')
          setUseCustom(false)
          setStatus('saved')
          setTimeout(() => setStatus(''), 2000)
        } catch (e) {
          setStatus('error')
        } finally {
          setBusy(false)
        }
      }

      return React.createElement('div', { className: 'languageControlContainer' },
        React.createElement('h3', null, '语言控制'),
        React.createElement('p', { className: 'desc' }, '在每步推理前向 System Prompt 注入语言约束，防止语言漂移。'),

        React.createElement('div', { className: 'toggleRow' },
          React.createElement('input', { type: 'checkbox', id: 'lc-use-custom', checked: useCustom, onChange: (e) => setUseCustom(e.target.checked) }),
          React.createElement('label', { htmlFor: 'lc-use-custom' }, '使用自定义文本')
        ),
        React.createElement('p', { className: 'toggleHint' }, useCustom ? '' : '默认约束：要求使用中文进行思维链推理'),

        React.createElement('div', { className: 'field' },
          React.createElement('label', { htmlFor: 'lc-text' }, '当前约束文本'),
          React.createElement('textarea', { id: 'lc-text', value: text, onChange: (e) => setText(e.target.value), placeholder: '输入语言约束内容…', disabled: !useCustom })
        ),

        React.createElement('div', { className: 'actions' },
          React.createElement('button', { className: 'saveBtn', disabled: busy, onClick: handleSave }, busy ? '保存中…' : '保存'),
          React.createElement('button', { className: 'resetBtn', disabled: busy, onClick: handleReset }, '恢复默认'),
          status === 'saved' ? React.createElement('span', { className: 'statusText' }, '已保存') : null,
          status === 'error' ? React.createElement('span', { className: 'errorText' }, '保存失败') : null
        )
      )
    }

    // ── Plugin entry ────────────────────────────────────────────────────────

    const inject = ['slots', 'locale']

    function apply(ctx) {
      installStyles()

      // Register locale
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-language-control: locale')
      const t = ctx.locale.bind(NS)

      // Register settings section
      ctx.slots.inject('settings.section', () =>
        ctx.slots.register(
          {
            name: 'settings.section',
            id: 'language-control',
            order: 50,
            label: () => t('title'),
            inject: () => ({ t })
          },
          LanguageControlPanel
        )
      )
    }

    module.exports = { apply, inject }
    return module.exports
  }
})