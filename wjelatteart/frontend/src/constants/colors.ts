export const PRESET_COLORS = {
  espresso: "#3E2723",
  cream: "#FFF8E1",
  foam: "#EFEBE9",
  milk: "#F5F5F5",
  crema: "#C47C4A",
  sage: "#6F8F72",
  ceramic: "#476A75"
} as const;

export const COLOR_LABELS: Record<keyof typeof PRESET_COLORS, string> = {
  espresso: "浓缩咖啡色",
  cream: "奶白色",
  foam: "奶泡色",
  milk: "牛奶色",
  crema: "焦糖油脂色",
  sage: "鼠尾草绿",
  ceramic: "陶瓷蓝"
};

