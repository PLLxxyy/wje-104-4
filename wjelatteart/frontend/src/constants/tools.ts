import { Brush, Eraser, LucideIcon, PaintBucket } from "lucide-react";
import { ToolType } from "./enums";

export interface ToolOption {
  type: ToolType;
  label: string;
  icon: LucideIcon;
}

export const TOOL_OPTIONS: readonly ToolOption[] = [
  { type: ToolType.BRUSH, label: "画笔", icon: Brush },
  { type: ToolType.ERASER, label: "橡皮擦", icon: Eraser },
  { type: ToolType.FILL, label: "填充", icon: PaintBucket }
];

