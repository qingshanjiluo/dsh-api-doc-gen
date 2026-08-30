import React from 'react';
import { createSettingsCard } from '@deepseek-ai/dsh-settings';

export default createSettingsCard({
  title: 'api-doc-gen',
  description: 'API 文档生成器',
  config: [
    { key: 'enabled', type: 'boolean', label: '启用插件', default: true },
    { key: 'outputFormat', type: 'select', label: '输出格式', options: ['markdown', 'html', 'json'], default: 'markdown' },
    { key: 'title', type: 'string', label: '文档标题', default: 'API Documentation' },
  ],
});
