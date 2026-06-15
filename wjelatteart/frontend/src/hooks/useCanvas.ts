import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { BRUSH_LIMITS } from "../constants/app";
import { ToolType } from "../constants/enums";
import { Layer } from "../types/layer";
import { Point, Stroke } from "../types/stroke";
import { ThemeMode } from "../types/theme";
import {
  distanceBetweenPoints,
  drawCupBase,
  getCanvasPoint,
  isInsideCup,
  renderArtworkToCanvas,
  renderLayers
} from "../utils/canvas";
import { canvasToBlob } from "../utils/export";

export interface CanvasExportOptions {
  scale: number;
  type: "image/png" | "image/jpeg";
  quality?: number;
}

export interface UseCanvasOptions {
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string;
  toolType: ToolType;
  color: string;
  brushSize: number;
  opacity: number;
  flowSpeed: number;
  theme: ThemeMode;
  onStrokeComplete: (stroke: Stroke) => void;
  onPointerPosition: (point: Point | null) => void;
  onError: (message: string) => void;
}

export interface UseCanvasResult {
  canvasRef: RefObject<HTMLCanvasElement>;
  clearCanvas: () => void;
  exportCanvas: (options: CanvasExportOptions) => Promise<Blob>;
}

export const useCanvas = ({
  width,
  height,
  layers,
  activeLayerId,
  toolType,
  color,
  brushSize,
  opacity,
  flowSpeed,
  theme,
  onStrokeComplete,
  onPointerPosition,
  onError
}: UseCanvasOptions): UseCanvasResult => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draftStroke, setDraftStroke] = useState<Stroke | undefined>();
  const draftStrokeRef = useRef<Stroke | undefined>();
  const pointerIdRef = useRef<number | undefined>();

  const render = useCallback(
    (draft?: Stroke): void => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      try {
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Canvas context is not available.");
        }
        drawCupBase(context, width, height, theme);
        renderLayers(context, layers, draft, activeLayerId);
      } catch {
        onError("画布渲染失败，请刷新页面后重试。");
      }
    },
    [activeLayerId, height, layers, onError, theme, width]
  );

  useEffect(() => {
    render(draftStroke);
  }, [draftStroke, render]);

  const shouldAppendPoint = useCallback(
    (points: Point[], nextPoint: Point): boolean => {
      if (points.length === 0) {
        return true;
      }
      const previousPoint = points[points.length - 1];
      const distance = distanceBetweenPoints(previousPoint, nextPoint);
      const flowRatio = flowSpeed / BRUSH_LIMITS.maxFlow;
      const minimumDistance = Math.max(1, BRUSH_LIMITS.basePointDistance * (1.1 - flowRatio));
      return distance >= minimumDistance;
    },
    [flowSpeed]
  );

  const completeStroke = useCallback(
    (stroke: Stroke): void => {
      if (stroke.points.length === 0) {
        return;
      }
      onStrokeComplete(stroke);
      setDraftStroke(undefined);
      draftStrokeRef.current = undefined;
    },
    [onStrokeComplete]
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent): void => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const point = getCanvasPoint(event, canvas, width, height);
      if (!isInsideCup(point)) {
        return;
      }
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      pointerIdRef.current = event.pointerId;
      onPointerPosition(point);

      const stroke: Stroke = {
        id: uuidv4(),
        points: [point],
        color,
        size: toolType === ToolType.ERASER ? brushSize * BRUSH_LIMITS.eraserMultiplier : brushSize,
        opacity,
        toolType
      };

      if (toolType === ToolType.FILL) {
        completeStroke(stroke);
        return;
      }

      draftStrokeRef.current = stroke;
      setDraftStroke(stroke);
    },
    [brushSize, color, completeStroke, height, onPointerPosition, opacity, toolType, width]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent): void => {
      const canvas = canvasRef.current;
      const currentStroke = draftStrokeRef.current;
      if (!canvas || !currentStroke || pointerIdRef.current !== event.pointerId) {
        return;
      }
      const point = getCanvasPoint(event, canvas, width, height);
      onPointerPosition(point);
      if (!isInsideCup(point) || !shouldAppendPoint(currentStroke.points, point)) {
        return;
      }
      const nextStroke: Stroke = {
        ...currentStroke,
        points: [...currentStroke.points, point]
      };
      draftStrokeRef.current = nextStroke;
      setDraftStroke(nextStroke);
    },
    [height, onPointerPosition, shouldAppendPoint, width]
  );

  const handlePointerEnd = useCallback(
    (event: PointerEvent): void => {
      const canvas = canvasRef.current;
      const currentStroke = draftStrokeRef.current;
      if (!canvas || pointerIdRef.current !== event.pointerId) {
        return;
      }
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      pointerIdRef.current = undefined;
      if (currentStroke && currentStroke.points.length > 0) {
        completeStroke(currentStroke);
      }
      onPointerPosition(null);
    },
    [completeStroke, onPointerPosition]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }
    canvas.width = width;
    canvas.height = height;
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerEnd);
    canvas.addEventListener("pointercancel", handlePointerEnd);
    canvas.addEventListener("pointerleave", handlePointerEnd);
    render();

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerEnd);
      canvas.removeEventListener("pointercancel", handlePointerEnd);
      canvas.removeEventListener("pointerleave", handlePointerEnd);
    };
  }, [handlePointerDown, handlePointerEnd, handlePointerMove, height, render, width]);

  const clearCanvas = useCallback((): void => {
    render();
  }, [render]);

  const exportCanvas = useCallback(
    async ({ scale, type, quality }: CanvasExportOptions): Promise<Blob> => {
      const exportTarget = renderArtworkToCanvas(layers, width, height, scale, theme);
      return canvasToBlob(exportTarget, type, quality);
    },
    [height, layers, theme, width]
  );

  return {
    canvasRef,
    clearCanvas,
    exportCanvas
  };
};

