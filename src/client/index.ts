import React from 'react';

const NS = 'api-doc-gen';

const zh = {
  title: 'API 文档生成',
  description: 'OpenAPI/Swagger 文档自动生成',
  enabled: '启用插件',
  outputFormat: '输出格式',
  docTitle: '文档标题',
};

const en = {
  title: 'API Doc Generator',
  description: 'OpenAPI/Swagger doc auto-generation',
  enabled: 'Enable plugin',
  outputFormat: 'Output format',
  docTitle: 'Doc title',
};

export const inject = ['settingsScope', 'slots', 'locale'];

export function apply(ctx: any) {
  ctx.effect?.(() => ctx.locale?.register?.(NS, { zh, en }), `dsh-${NS}: locale`);
  ctx.effect?.(() => {
    ctx.slots?.inject?.('settings.plugin.item', function* () {
      yield ctx.slots.register({ name: 'settings.plugin.item', key: NS, locale: NS, inject: () => ({}) }, Card);
    });
  }, `dsh-${NS}: settings`);
}

function Card(props: any) {
  const { scope, t } = props;
  const [open, setOpen] = React.useState(false);
  const s = { background: '#1a1a2e', color: '#e0e0e0', borderRadius: '8px', padding: '12px', marginBottom: '8px', border: '1px solid #333' } as React.CSSProperties;
  const row = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer', borderRadius: '4px', transition: 'background 0.15s' } as React.CSSProperties;
  const label = { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' } as React.CSSProperties;
  const input = { background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #444', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', width: '100%' } as React.CSSProperties;

  return React.createElement('li', { className: `dsh-${NS}-card`, style: s },
    React.createElement('div', { style: row, onClick: () => setOpen(!open), onMouseEnter: (e: any) => e.currentTarget.style.background = '#252540', onMouseLeave: (e: any) => e.currentTarget.style.background = 'transparent' },
      React.createElement('div', null,
        React.createElement('strong', { style: { fontSize: '14px' } }, '\uD83D\uDCC4 ', t('title')),
        React.createElement('p', { style: { margin: '2px 0 0', fontSize: '12px', color: '#888' } }, t('description')),
      ),
      React.createElement('span', { style: { fontSize: '12px', color: '#888' } }, open ? '\u25B2' : '\u25BC'),
    ),
    open ? React.createElement('div', { style: { padding: '8px 0', borderTop: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '10px' } },
      React.createElement('label', { style: label },
        React.createElement('input', { type: 'checkbox', checked: scope?.get?.('enabled') ?? true, onChange: (e: any) => scope?.set?.('enabled', e.target.checked) }),
        t('enabled'),
      ),
      React.createElement('label', { style: { ...label, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' } },
        t('outputFormat'),
        React.createElement('select', { style: input, value: scope?.get?.('outputFormat') ?? 'openapi', onChange: (e: any) => scope?.set?.('outputFormat', e.target.value) },
          React.createElement('option', { value: 'openapi' }, 'OpenAPI'),
          React.createElement('option', { value: 'both' }, 'Both'),
        ),
      ),
      React.createElement('label', { style: { ...label, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' } },
        t('docTitle'),
        React.createElement('input', { type: 'text', style: input, value: scope?.get?.('docTitle') ?? 'API Documentation', onChange: (e: any) => scope?.set?.('docTitle', e.target.value) }),
      ),
    ) : null,
  );
}
