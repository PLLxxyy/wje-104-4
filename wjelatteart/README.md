# 咖啡拉花模拟器

咖啡拉花模拟器 —— 在数字画布上创作你的专属拉花艺术。

## 项目主要功能

- HTML Canvas 连续绘图，支持鼠标和触控操作
- 画笔、橡皮擦、填充工具切换
- 画笔大小、颜色、透明度、流量速度调节
- 多图层新增、删除、显隐、排序和不透明度调节
- Ctrl+Z 撤销、Ctrl+Y / Ctrl+Shift+Z 重做
- 5 个内置拉花模板，可二次创作
- localStorage 保存/加载作品，首次自动注入示例作品
- PNG 导出，支持 1x、2x、4x 尺寸

## 快速启动方式

```bash
cd wje-104/wjelatteart
npm install
npm run dev
# 访问 http://localhost:28604
```

## 访问地址

开发模式：`http://localhost:28604`

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18 | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Zustand | 4.x | 状态管理 |
| Vite | 5.x | 构建工具 |
| React Router | 6.x | 路由管理 |
| HTML Canvas | - | 绘图渲染 |

## 项目目录结构

```text
wjelatteart/
├── .gitignore
├── Dockerfile
├── index.html
├── nginx.conf
├── package.json
├── README.md
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── frontend/src/
    ├── App.tsx
    ├── main.tsx
    ├── components/
    ├── constants/
    ├── hooks/
    ├── pages/
    ├── router/
    ├── stores/
    ├── styles/
    ├── types/
    └── utils/
```

## 使用说明

画布操作：进入编辑器后，在咖啡杯区域按下鼠标或触控笔并移动即可绘制连续笔画。

工具切换：左侧工具面板可切换画笔、橡皮擦、填充工具；橡皮擦只影响当前图层。

参数调节：使用滑块调节画笔大小、透明度、流量速度；可选择预设色或自定义颜色。

图层管理：右侧图层面板支持新建、删除、显隐、上移、下移和不透明度调节；至少保留一个图层。

预设模板加载：点击顶部“预设”选择模板，确认后会替换当前画布内容。

撤销/重做操作：点击顶部按钮，或使用 `Ctrl+Z` 撤销、`Ctrl+Y` / `Ctrl+Shift+Z` 重做。

保存和导出：点击“保存”写入浏览器 localStorage；点击“导出”选择倍率并下载 PNG。

## 生产构建

```bash
npm run build
```

构建产物会生成到 `dist/` 目录，可使用任意静态文件服务器托管。也可以使用附带的 `Dockerfile` 与 `nginx.conf` 部署 SPA 路由。

## License

MIT

