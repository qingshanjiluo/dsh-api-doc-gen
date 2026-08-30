# dsh-api-doc-gen

> DeepSeek Harness API 文档生成器

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 功能特性

- 📄 **OpenAPI/Swagger**: 自动生成 OpenAPI 3.0 规范文档
- 🔍 **路由扫描**: 自动发现 Express/FastAPI/Go 路由
- 📝 **Markdown 导出**: 生成可读的 Markdown API 文档

## 📦 安装

```bash
npm install dsh-api-doc-gen
```

## 🛠️ 工具

| 工具名 | 描述 | 参数 |
|--------|------|------|
| `api_doc_scan` | 扫描 API 端点 | `path` |
| `api_doc_generate` | 生成文档 | `path`, `format` |
| `api_doc_preview` | 预览文档 | `path` |

## 📋 命令

- `/apidoc scan` — 扫描端点
- `/apidoc generate` — 生成文档
- `/apidoc preview` — 预览

## ⚙️ 配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enabled` | boolean | `true` | 启用插件 |
| `outputFormat` | string | `markdown` | 输出格式 |
| `title` | string | `API Documentation` | 文档标题 |

## 📄 License

MIT
