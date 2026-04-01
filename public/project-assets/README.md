# Project Asset Layout

本地项目截图目录按项目类型分开维护：

- 工作项目: `public/project-assets/work/<project-slug>/images/`
- 开源项目: `public/project-assets/open-source/<project-slug>/images/`

当前页面会自动扫描 `images/` 目录中的图片文件，无需手动改 manifest。

支持格式：`png`、`jpg`、`jpeg`、`webp`、`gif`、`avif`

约定：
- 首张图片会作为项目详情页主图显示。
- 所有图片会进入下方图片轮播。
- 如果目录下没有图片，页面会显示“图片待上传”。
- 旧的 `public/project-assets/<slug>/manifest.json` 仍然兼容，可继续保留。
