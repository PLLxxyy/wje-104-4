import { create } from "zustand";
import { DEFAULT_TOOL_SETTINGS } from "../constants/app";
import { ToolType } from "../constants/enums";

interface ToolState {
  toolType: ToolType;
  brushSize: number;
  color: string;
  opacity: number;
  flowSpeed: number;
  setToolType: (toolType: ToolType) => void;
  setBrushSize: (brushSize: number) => void;
  setColor: (color: string) => void;
  setOpacity: (opacity: number) => void;
  setFlowSpeed: (flowSpeed: number) => void;
}

export const useToolStore = create<ToolState>((set) => ({
  toolType: ToolType.BRUSH,
  brushSize: DEFAULT_TOOL_SETTINGS.brushSize,
  color: DEFAULT_TOOL_SETTINGS.color,
  opacity: DEFAULT_TOOL_SETTINGS.opacity,
  flowSpeed: DEFAULT_TOOL_SETTINGS.flowSpeed,
  setToolType: (toolType: ToolType): void => set({ toolType }),
  setBrushSize: (brushSize: number): void => set({ brushSize }),
  setColor: (color: string): void => set({ color }),
  setOpacity: (opacity: number): void => set({ opacity }),
  setFlowSpeed: (flowSpeed: number): void => set({ flowSpeed })
}));

