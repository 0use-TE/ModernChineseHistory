# 史纲 · 时序

面向2027考研政治的中国近现代史复习网页，使用 HTML、CSS 和原生 JavaScript 实现，无需安装依赖或构建。

- 首页时间轴大纲：7个历史阶段、21个关键节点，点击进入阶段或事件详情。
- 77个重要事件：时间、历史意义、易错说法与正确辨析。
- 搜索、阶段筛选、待复习、掌握标记与随机判断自测。
- 浏览器本地保存进度，支持手机布局和打印。

## 在线访问

[打开史纲 · 时序](https://0use.net/ModernChineseHistory/)

本仓库通过 `.github/workflows/pages.yml` 部署到 GitHub Pages。推送到 `main` 后自动检查 JavaScript 语法，并将 `dist/` 目录发布为站点根目录；也可在 Actions 中手动运行工作流。Pages 的 Source 应设置为 **GitHub Actions**。

## 本地运行

```sh
python -m http.server 8080 --directory dist
```

在浏览器打开 http://localhost:8080 。

## 文件

| 文件 | 用途 |
| --- | --- |
| `dist/index.html` | 网页入口 |
| `dist/style.css` | 页面样式及响应式布局 |
| `dist/app.js` | 大纲、搜索、筛选、进度和自测 |
| `dist/data.js` | 历史事件和参考资料 |
| `dist/assets/history-logo.png` | Logo 与浏览器图标 |
| `logo-prompt.txt` | Logo 的生成提示词 |

## 内容说明

资料核验日期为2026年11月11日。已核实高教社2027版考试大纲的书目信息，尚未获取大纲完整内容逐条对照，因此不能声称已覆盖所有2027考点变更。内容按稳定史纲主线整理，近年会议作为时政联系拓展。“核心”是复习建议，易错辨析及判断题是自编练习，不代表真题频次统计或押题。具体参考链接可在页面“资料说明”中查看。
