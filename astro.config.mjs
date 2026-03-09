import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://zgx197.github.io',  // GitHub Pages 个人站点
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
