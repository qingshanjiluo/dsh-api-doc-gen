/**
 * dsh-api-doc-gen — API文档生成器
 *
 * 功能：
 * 1. 路由扫描
 * 2. OpenAPI生成
 * 3. Markdown文档
 *
 * 工具：api_doc_scan, api_doc_generate, api_doc_preview
 * 命令：/apidoc
 * 配置：enabled
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { z } from 'zod';

export const name = 'dsh-api-doc-gen';
export const inject = ['settings', 'tools', 'commands'];

const configSchema = z.object({
  enabled: z.boolean().default(true),
  outputFormat: z.enum(['markdown', 'openapi', 'both']).default('markdown'),
  title: z.string().default('API Documentation'),
});

type Config = z.infer<typeof configSchema>;

interface Endpoint { method: string; path: string; description: string; params: string[]; returnType: string; file: string; line: number; }

function detectLanguage(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return ext.includes('ts') ? 'typescript' : 'javascript';
  if (['.py'].includes(ext)) return 'python';
  if (['.go'].includes(ext)) return 'go';
  if (['.rs'].includes(ext)) return 'rust';
  return 'unknown';
}

function extractEndpoints(content: string, lang: string, filePath: string): Endpoint[] {
  const endpoints: Endpoint[] = [];
  const lines = content.split('\n');
  const routePatterns: { regex: RegExp; method: string }[] = [
    { regex: /\.(get|post|put|patch|delete|options|head)\s*\(\s*['"`]([^'"`]+)['"`]/gi, method: '' },
    { regex: /@(Get|Post|Put|Patch|Delete|Options|Head)\s*\(\s*['"`]([^'"`]+)['"`]/gi, method: '' },
    { regex: /app\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi, method: '' },
    { regex: /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi, method: '' },
  ];
  for (let i = 0; i < lines.length; i++) {
    for (const { regex } of routePatterns) {
      let match;
      const re = new RegExp(regex.source, regex.flags);
      while ((match = re.exec(lines[i])) !== null) {
        const method = match[1].toUpperCase();
        const path = match[2];
        const desc = (lines[i + 1]?.match(/\/\/\s*(.+)/) || lines[i - 1]?.match(/\/\/\s*(.+)/) || ['', ''])[1];
        endpoints.push({ method, path, description: desc.trim(), params: [], returnType: 'any', file: filePath, line: i + 1 });
      }
    }
  }
  return endpoints;
}

function generateMarkdownDoc(endpoints: Endpoint[], title: string): string {
  const lines = [`# ${title}`, '', `> 自动生成于 ${new Date().toISOString()}`, '', '## 端点列表', ''];
  const grouped: Record<string, Endpoint[]> = {};
  for (const ep of endpoints) {
    const base = ep.path.split('/').slice(0, 3).join('/') || '/';
    if (!grouped[base]) grouped[base] = [];
    grouped[base].push(ep);
  }
  for (const [group, eps] of Object.entries(grouped)) {
    lines.push(`### ${group}`, '');
    for (const ep of eps) {
      lines.push(`#### \`${ep.method} ${ep.path}\``);
      if (ep.description) lines.push(ep.description);
      lines.push(`- 文件: \`${ep.file}:${ep.line}\``, '');
    }
  }
  return lines.join('\n');
}

function generateOpenAPI(endpoints: Endpoint[], title: string): any {
  const paths: Record<string, any> = {};
  for (const ep of endpoints) {
    if (!paths[ep.path]) paths[ep.path] = {};
    paths[ep.path][ep.method.toLowerCase()] = {
      summary: ep.description || `${ep.method} ${ep.path}`,
      responses: { '200': { description: '成功' } },
    };
  }
  return { openapi: '3.0.0', info: { title, version: '1.0.0' }, paths };
}

function scanProject(dir: string): Endpoint[] {
  const endpoints: Endpoint[] = [];
  const ignore = ['node_modules', '.git', 'dist', 'build', '__pycache__'];
  function walk(d: string) {
    try {
      for (const item of readdirSync(d, { withFileTypes: true })) {
        if (ignore.includes(item.name)) continue;
        const fullPath = join(d, item.name);
        if (item.isDirectory()) { walk(fullPath); continue; }
        const lang = detectLanguage(fullPath);
        if (lang === 'unknown') continue;
        try {
          const content = readFileSync(fullPath, 'utf-8');
          endpoints.push(...extractEndpoints(content, lang, fullPath));
        } catch { /* skip */ }
      }
    } catch { /* skip */ }
  }
  walk(dir);
  return endpoints;
}

export function apply(ctx: any, config: Config) {
  if (!config.enabled) return;

  ctx.effect(() => ctx.tools.register({
    name: 'api_doc_scan',
    description: '扫描项目中的 API 端点（Express/FastAPI/Go 路由）。',
    parameters: { path: { type: 'string', description: '项目路径（默认当前目录）' } },
    output: { schema: { type: 'json' }, render: (_a: unknown, v: unknown) => {
      const eps = v as Endpoint[];
      if (eps.length === 0) return [{ type: 'text', text: '📭 未发现 API 端点' }];
      return [{ type: 'text', text: `## 🔍 发现 ${eps.length} 个端点\n` + eps.map(e => `- \`${e.method} ${e.path}\` (${e.file}:${e.line})`).join('\n') }];
    }},
    async execute(args: { path?: string }) { return scanProject(resolve(args.path || '.')); },
  }), 'dsh-api-doc-gen: scan');

  ctx.effect(() => ctx.tools.register({
    name: 'api_doc_generate',
    description: '生成 API 文档（OpenAPI/Markdown）。',
    parameters: { path: { type: 'string', description: '项目路径' }, format: { type: 'string', description: '格式：markdown | openapi' } },
    output: { schema: { type: 'json' }, render: (_a: unknown, v: unknown) => {
      const doc = v;
      if (typeof doc === 'string') return [{ type: 'text', text: doc }];
      return [{ type: 'text', text: '```json\n' + JSON.stringify(doc, null, 2).substring(0, 3000) + '\n```' }];
    }},
    async execute(args: { path?: string; format?: string }) {
      const endpoints = scanProject(resolve(args.path || '.'));
      const fmt = args.format || config.outputFormat;
      if (fmt === 'openapi') return generateOpenAPI(endpoints, config.title);
      return generateMarkdownDoc(endpoints, config.title);
    },
  }), 'dsh-api-doc-gen: generate');

  ctx.effect(() => ctx.tools.register({
    name: 'api_doc_preview',
    description: '预览生成的 API 文档。',
    parameters: { path: { type: 'string', description: '项目路径' } },
    output: { schema: { type: 'text' }, render: (_a: unknown, v: unknown) => [{ type: 'text', text: v as string }] },
    async execute(args: { path?: string }) {
      const endpoints = scanProject(resolve(args.path || '.'));
      return generateMarkdownDoc(endpoints, config.title);
    },
  }), 'dsh-api-doc-gen: preview');

  ctx.effect(() => ctx.commands.register({
    name: 'apidoc',
    description: 'API 文档生成',
    input: { hint: 'scan | generate | preview' },
    async handler(invocation: any) {
      const parts = invocation.rawInput.trim().split(/\s+/).filter(Boolean);
      const cmd = parts[0] || 'scan';
      if (cmd === 'scan' || cmd === 'generate' || cmd === 'preview') {
        const endpoints = scanProject('.');
        return { kind: 'text', text: `发现 ${endpoints.length} 个端点` };
      }
      return { kind: 'text', text: `用法: /apidoc scan|generate|preview` };
    },
  }), 'dsh-api-doc-gen: command');

  ctx.inject(['settings'], (sctx: any) => {
    const { settingsNamespace } = require('@deepseek-ai/dsh-settings');
    sctx.settings.register(settingsNamespace('api-doc-gen'), configSchema, { base: config, expose: true, applies: 'live' });
  });
}
