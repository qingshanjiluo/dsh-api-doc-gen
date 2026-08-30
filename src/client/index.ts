import React from 'react';
const NS = 'api-doc-gen';
const zh = { title: 'API 文档生成', description: 'OpenAPI/Swagger 文档自动生成', enabled: '启用插件', outputFormat: '输出格式', title: '文档标题' };
const en = { title: 'API Doc Generator', description: 'OpenAPI/Swagger doc auto-generation', enabled: 'Enable plugin', outputFormat: 'Output format', title: 'Doc title' };
export const inject = ['settingsScope', 'slots', 'locale'];
export function apply(ctx: any) {
  ctx.effect?.(() => ctx.locale?.register?.(NS, { zh, en }), 'dsh-api-doc-gen: locale');
  ctx.effect?.(() => { ctx.slots?.inject?.('settings.plugin.item', function* () { yield ctx.slots.register({ name: 'settings.plugin.item', key: NS, locale: NS, inject: () => ({}) }, Card); }); }, 'dsh-api-doc-gen: settings');
}
function Card(props: any) {
  const { scope, t } = props;
  const [open, setOpen] = React.useState(false);
  return React.createElement('li', null,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer' }, onClick: () => setOpen(!open) },
      React.createElement('strong', null, '📄 ', t('title')),
      React.createElement('span', { style: { fontSize: '12px', color: '#888' } }, open ? '▲' : '▼')),
    open ? React.createElement('div', { style: { padding: '8px 0', borderTop: '1px solid #333' } },
      React.createElement('label', { style: { display: 'flex', gap: '8px', cursor: 'pointer', marginBottom: '8px' } },
        React.createElement('input', { type: 'checkbox', checked: scope?.get?.('enabled') ?? true, onChange: (e: any) => scope?.set?.('enabled', e.target.checked) }), t('enabled'))) : null);
}
