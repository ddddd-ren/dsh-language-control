# dsh-language-control

> **让 Agent 的思考过程也自动使用中文。**
> A DSH plugin that makes the agent think, plan and reason in Chinese — automatically.

DSH 插件：在每步推理前向 System Prompt 最顶部注入语言约束，防止 Agent 的思维链（chain-of-thought）在工具返回英文内容后发生"语言漂移"（language drift）。

A DSH plugin that injects a language constraint at the top of the system prompt before every reasoning step, preventing language drift in the agent's chain-of-thought after tool calls return foreign-language content.

## 功能特性 / Features

- 每步刷新约束：不是会话开始时注入一次，而是**每次推理前重新注入**到 System Prompt 最顶部（order: -200），优先级最高，不被工具返回内容稀释
- 中文思考强制：约束要求链式推理、规划、工具调用推理、内部思考全部使用中文，即使工具返回英文内容
- 可视化设置面板：在 DSH 设置 → 插件中可编辑约束文本、切换自定义/默认、一键恢复默认
- 无依赖、零配置、即装即用

## 安装 / Install

```sh
dsh plugin --profile web add @deepseek-ai/dsh-language-control
```

或从 DSH 应用市场（dsh-market）中搜索 language-control 一键安装。

## 使用 / Usage

插件安装后自动生效，无需额外操作。每次 Agent 推理 step 前，System Prompt 最顶部会注入语言约束（默认要求中文思考与回答）。

可在 **DSH 设置 → 插件 → 语言控制（Language Control）** 中：
- 编辑自定义约束文本并保存
- 关闭自定义文本，使用默认约束
- 恢复默认文本

## 工作原理 / How it works

| 层 | 机制 |
|---|---|
| 注入时机 | `systemPrompt.section()`，每次 `assemble()` 重新求值（即每个推理 step 前） |
| 注入位置 | `order: -200`，System Prompt 第一行 |
| 服务端 | 注册 HTTP 路由 `/language-control/{status,update,reset}` 读写约束文本 |
| 客户端 | `dsh.client.inject` 注册设置面板到 `settings.section` |

## 许可证 / License

MIT