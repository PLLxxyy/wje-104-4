import { v4 as uuidv4 } from "uuid";
import { CANVAS_SIZE } from "../constants/app";
import { PRESET_COLORS } from "../constants/colors";
import { ToolType } from "../constants/enums";
import { Layer } from "../types/layer";
import { Point, Stroke } from "../types/stroke";
import { ThemeMode } from "../types/theme";

export const clonePoint = (point: Point): Point => ({
  x: point.x,
  y: point.y,
  pressure: point.pressure,
  timestamp: point.timestamp
});

export const cloneStroke = (stroke: Stroke, regenerateId = false): Stroke => ({
  id: regenerateId ? uuidv4() : stroke.id,
  points: stroke.points.map(clonePoint),
  color: stroke.color,
  size: stroke.size,
  opacity: stroke.opacity,
  toolType: stroke.toolType
});

export const cloneLayer = (layer: Layer, regenerateId = false): Layer => ({
  id: regenerateId ? uuidv4() : layer.id,
  name: layer.name,
  visible: layer.visible,
  opacity: layer.opacity,
  strokes: layer.strokes.map((stroke) => cloneStroke(stroke, regenerateId))
});

export const cloneLayers = (layers: Layer[], regenerateIds = false): Layer[] =>
  layers.map((layer) => cloneLayer(layer, regenerateIds));

export const createCanvasElement = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const getCanvasPoint = (
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): Point => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * width;
  const y = ((event.clientY - rect.top) / rect.height) * height;
  return {
    x: Math.max(0, Math.min(width, x)),
    y: Math.max(0, Math.min(height, y)),
    pressure: event.pressure > 0 ? event.pressure : undefined,
    timestamp: Date.now()
  };
};

export const isInsideCup = (point: Point): boolean => {
  const dx = point.x - CANVAS_SIZE.cupCenter;
  const dy = point.y - CANVAS_SIZE.cupCenter;
  return Math.sqrt(dx * dx + dy * dy) <= CANVAS_SIZE.innerRadius;
};

const clipToCup = (context: CanvasRenderingContext2D): void => {
  context.beginPath();
  context.arc(
    CANVAS_SIZE.cupCenter,
    CANVAS_SIZE.cupCenter,
    CANVAS_SIZE.innerRadius,
    0,
    Math.PI * 2
  );
  context.clip();
};

export const drawCupBase = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: ThemeMode
): void => {
  context.clearRect(0, 0, width, height);
  context.fillStyle = theme === "dark" ? "#211815" : "#F4E5D0";
  context.fillRect(0, 0, width, height);

  const saucer = context.createRadialGradient(
    CANVAS_SIZE.cupCenter,
    CANVAS_SIZE.cupCenter,
    CANVAS_SIZE.innerRadius * 0.58,
    CANVAS_SIZE.cupCenter,
    CANVAS_SIZE.cupCenter,
    CANVAS_SIZE.cupRadius
  );
  saucer.addColorStop(0, theme === "dark" ? "#4B372E" : "#FFF9EA");
  saucer.addColorStop(0.72, theme === "dark" ? "#2F231E" : "#E8CDA8");
  saucer.addColorStop(1, theme === "dark" ? "#16100E" : "#B88B60");

  context.beginPath();
  context.arc(CANVAS_SIZE.cupCenter, CANVAS_SIZE.cupCenter, CANVAS_SIZE.cupRadius, 0, Math.PI * 2);
  context.fillStyle = saucer;
  context.fill();

  const coffee = context.createRadialGradient(
    CANVAS_SIZE.cupCenter - 80,
    CANVAS_SIZE.cupCenter - 120,
    40,
    CANVAS_SIZE.cupCenter,
    CANVAS_SIZE.cupCenter,
    CANVAS_SIZE.innerRadius
  );
  coffee.addColorStop(0, theme === "dark" ? "#8B5A3C" : "#9B6440");
  coffee.addColorStop(0.52, PRESET_COLORS.espresso);
  coffee.addColorStop(1, theme === "dark" ? "#1B0E0A" : "#2B1712");

  context.beginPath();
  context.arc(CANVAS_SIZE.cupCenter, CANVAS_SIZE.cupCenter, CANVAS_SIZE.innerRadius, 0, Math.PI * 2);
  context.fillStyle = coffee;
  context.fill();

  context.lineWidth = 12;
  context.strokeStyle = theme === "dark" ? "#D8B184" : "#FFFBEC";
  context.stroke();
};

export const drawStroke = (context: CanvasRenderingContext2D, stroke: Stroke): void => {
  if (stroke.points.length === 0) {
    return;
  }

  context.save();
  clipToCup(context);
  context.globalAlpha = stroke.opacity;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = stroke.color;
  context.fillStyle = stroke.color;
  context.lineWidth = stroke.size;
  context.globalCompositeOperation =
    stroke.toolType === ToolType.ERASER ? "destination-out" : "source-over";

  if (stroke.toolType === ToolType.FILL) {
    context.beginPath();
    context.arc(
      CANVAS_SIZE.cupCenter,
      CANVAS_SIZE.cupCenter,
      CANVAS_SIZE.innerRadius,
      0,
      Math.PI * 2
    );
    context.fill();
    context.restore();
    return;
  }

  if (stroke.points.length === 1) {
    const [point] = stroke.points;
    context.beginPath();
    context.arc(point.x, point.y, stroke.size / 2, 0, Math.PI * 2);
    context.fill();
    context.restore();
    return;
  }

  context.beginPath();
  context.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let index = 1; index < stroke.points.length; index += 1) {
    const previous = stroke.points[index - 1];
    const current = stroke.points[index];
    const midX = (previous.x + current.x) / 2;
    const midY = (previous.y + current.y) / 2;
    context.quadraticCurveTo(previous.x, previous.y, midX, midY);
  }
  const last = stroke.points[stroke.points.length - 1];
  context.lineTo(last.x, last.y);
  context.stroke();
  context.restore();
};

export const renderLayers = (
  context: CanvasRenderingContext2D,
  layers: Layer[],
  draftStroke?: Stroke,
  draftLayerId?: string
): void => {
  layers.forEach((layer) => {
    if (!layer.visible) {
      return;
    }
    const layerCanvas = createCanvasElement(context.canvas.width, context.canvas.height);
    const layerContext = layerCanvas.getContext("2d");
    if (!layerContext) {
      return;
    }
    layer.strokes.forEach((stroke) => drawStroke(layerContext, stroke));
    if (draftStroke && layer.id === draftLayerId) {
      drawStroke(layerContext, draftStroke);
    }
    context.save();
    context.globalAlpha = layer.opacity;
    context.drawImage(layerCanvas, 0, 0);
    context.restore();
  });
};

export const renderArtworkToCanvas = (
  layers: Layer[],
  width: number,
  height: number,
  scale: number,
  theme: ThemeMode,
  draftStroke?: Stroke,
  draftLayerId?: string
): HTMLCanvasElement => {
  const canvas = createCanvasElement(width * scale, height * scale);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context is not available.");
  }
  context.scale(scale, scale);
  drawCupBase(context, width, height, theme);
  renderLayers(context, layers, draftStroke, draftLayerId);
  return canvas;
};

export const distanceBetweenPoints = (from: Point, to: Point): number => {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return Math.sqrt(dx * dx + dy * dy);
};
