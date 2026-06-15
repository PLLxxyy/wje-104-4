import { forwardRef, useImperativeHandle } from "react";
import { CANVAS_SIZE } from "../../../constants/app";
import { ToolType } from "../../../constants/enums";
import { useCanvas } from "../../../hooks/useCanvas";
import { Layer } from "../../../types/layer";
import { Point, Stroke } from "../../../types/stroke";
import { ThemeMode } from "../../../types/theme";
import styles from "./styles.module.css";

export interface CanvasToolSettings {
  toolType: ToolType;
  color: string;
  brushSize: number;
  opacity: number;
  flowSpeed: number;
}

export interface CanvasWorkspaceHandle {
  clearCanvas: () => void;
  exportCanvas: (scale: number, type: "image/png" | "image/jpeg", quality?: number) => Promise<Blob>;
}

interface CanvasWorkspaceProps {
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string;
  tool: CanvasToolSettings;
  theme: ThemeMode;
  onStrokeComplete: (stroke: Stroke) => void;
  onPointerPosition: (point: Point | null) => void;
  onError: (message: string) => void;
}

export const CanvasWorkspace = forwardRef<CanvasWorkspaceHandle, CanvasWorkspaceProps>(
  (
    {
      width,
      height,
      layers,
      activeLayerId,
      tool,
      theme,
      onStrokeComplete,
      onPointerPosition,
      onError
    },
    ref
  ): JSX.Element => {
    const { canvasRef, clearCanvas, exportCanvas } = useCanvas({
      width,
      height,
      layers,
      activeLayerId,
      toolType: tool.toolType,
      color: tool.color,
      brushSize: tool.brushSize,
      opacity: tool.opacity,
      flowSpeed: tool.flowSpeed,
      theme,
      onStrokeComplete,
      onPointerPosition,
      onError
    });

    useImperativeHandle(
      ref,
      () => ({
        clearCanvas,
        exportCanvas: (scale: number, type: "image/png" | "image/jpeg", quality?: number) =>
          exportCanvas({ scale, type, quality })
      }),
      [clearCanvas, exportCanvas]
    );

    return (
      <section className={styles.workspace} aria-label="咖啡拉花画布">
        <div className={styles.canvasFrame}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={CANVAS_SIZE.width}
            height={CANVAS_SIZE.height}
            aria-label="可绘制咖啡杯画布"
          />
        </div>
      </section>
    );
  }
);

CanvasWorkspace.displayName = "CanvasWorkspace";

