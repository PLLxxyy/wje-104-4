export const APP_NAME = "咖啡拉花模拟器";
export const APP_TAGLINE = "在数字画布上创作你的专属拉花艺术";

export const CANVAS_SIZE = {
  width: 800,
  height: 800,
  cupCenter: 400,
  cupRadius: 350,
  innerRadius: 310,
  thumbnailWidth: 200
} as const;

export const STORAGE_KEYS = {
  artworks: "wjelatteart.artworks",
  theme: "wjelatteart.theme"
} as const;

export const DEFAULT_TOOL_SETTINGS = {
  brushSize: 12,
  opacity: 0.86,
  flowSpeed: 72,
  color: "#FFF8E1"
} as const;

export const BRUSH_LIMITS = {
  minSize: 1,
  maxSize: 50,
  minOpacity: 0.08,
  maxOpacity: 1,
  minFlow: 10,
  maxFlow: 100,
  basePointDistance: 8,
  eraserMultiplier: 1.25
} as const;

export const HISTORY_LIMITS = {
  maxSteps: 50
} as const;

export const EXPORT_SCALES = [1, 2, 4] as const;
export const HOME_RECENT_LIMIT = 3;

export const ROUTES = {
  home: "/",
  editor: "/editor",
  gallery: "/gallery"
} as const;

export const DEFAULT_LAYER_NAMES = {
  foam: "奶泡层",
  etching: "雕花层",
  accent: "点缀层"
} as const;

export const UI_TEXT = {
  storageFull: "本地存储空间不足，请清理旧作品后重试。",
  storageReadFailed: "读取本地作品失败，已使用空列表继续。",
  exportFailed: "导出 PNG 失败，请稍后重试。",
  saveSuccess: "作品已保存到本地。",
  loadTemplateSuccess: "预设模板已载入。",
  deleteLayerBlocked: "至少需要保留一个图层。",
  canvasFailed: "画布渲染失败，请刷新页面后重试。"
} as const;
