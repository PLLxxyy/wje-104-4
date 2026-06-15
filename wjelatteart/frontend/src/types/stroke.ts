import { ToolType } from "../constants/enums";

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  toolType: ToolType;
}

