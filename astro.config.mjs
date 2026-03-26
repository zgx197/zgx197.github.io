import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://zgx197.top',  // 自定义域名
  base: '/',  // 根路径部署
  integrations: [tailwind()],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
  // 输出静态文件到 dist 目录
  output: 'static',
});
