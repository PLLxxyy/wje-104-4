import { v4 as uuidv4 } from "uuid";
import { CANVAS_SIZE, DEFAULT_LAYER_NAMES } from "./app";
import { PRESET_COLORS } from "./colors";
import { ToolType } from "./enums";
import { Layer } from "../types/layer";
import { Point, Stroke } from "../types/stroke";
import { PresetTemplate } from "../types/preset";

const CENTER = CANVAS_SIZE.cupCenter;
const BASE_TIME = 1_700_000_000_000;
const DEFAULT_OPACITY = 0.9;
const FINE_OPACITY = 0.74;
const THUMBNAIL_SIZE = 200;

type PointTuple = [number, number];

const createPoint = (x: number, y: number, index: number): Point => ({
  x,
  y,
  timestamp: BASE_TIME + index * 16
});

const bezierPoint = (
  start: PointTuple,
  controlA: PointTuple,
  controlB: PointTuple,
  end: PointTuple,
  t: number
): PointTuple => {
  const u = 1 - t;
  const x =
    u * u * u * start[0] +
    3 * u * u * t * controlA[0] +
    3 * u * t * t * controlB[0] +
    t * t * t * end[0];
  const y =
    u * u * u * start[1] +
    3 * u * u * t * controlA[1] +
    3 * u * t * t * controlB[1] +
    t * t * t * end[1];
  return [x, y];
};

const bezier = (
  start: PointTuple,
  controlA: PointTuple,
  controlB: PointTuple,
  end: PointTuple,
  samples: number
): Point[] =>
  Array.from({ length: samples }, (_, index) => {
    const t = index / (samples - 1);
    const [x, y] = bezierPoint(start, controlA, controlB, end, t);
    return createPoint(x, y, index);
  });

const sineBranch = (
  start: PointTuple,
  end: PointTuple,
  amplitude: number,
  samples: number,
  phase: number
): Point[] =>
  Array.from({ length: samples }, (_, index) => {
    const t = index / (samples - 1);
    const x = start[0] + (end[0] - start[0]) * t;
    const y =
      start[1] +
      (end[1] - start[1]) * t +
      Math.sin(t * Math.PI + phase) * amplitude;
    return createPoint(x, y, index);
  });

const ellipseArc = (
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  startAngle: number,
  endAngle: number,
  samples: number
): Point[] =>
  Array.from({ length: samples }, (_, index) => {
    const t = index / (samples - 1);
    const angle = startAngle + (endAngle - startAngle) * t;
    return createPoint(
      centerX + Math.cos(angle) * radiusX,
      centerY + Math.sin(angle) * radiusY,
      index
    );
  });

const createStroke = (
  points: Point[],
  color: string,
  size: number,
  opacity: number = DEFAULT_OPACITY
): Stroke => ({
  id: uuidv4(),
  points,
  color,
  size,
  opacity,
  toolType: ToolType.BRUSH
});

const createLayer = (name: string, strokes: Stroke[], opacity = 1): Layer => ({
  id: uuidv4(),
  name,
  visible: true,
  opacity,
  strokes
});

const createThumbnail = (accent: string, secondary: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${THUMBNAIL_SIZE}" height="${THUMBNAIL_SIZE}" viewBox="0 0 ${THUMBNAIL_SIZE} ${THUMBNAIL_SIZE}"><rect width="${THUMBNAIL_SIZE}" height="${THUMBNAIL_SIZE}" fill="#f1dfc8"/><circle cx="100" cy="100" r="86" fill="#3E2723"/><circle cx="100" cy="100" r="73" fill="#7d4d33"/><path d="M100 50 C62 76 61 128 100 151 C139 128 138 76 100 50Z" fill="${accent}" opacity=".9"/><path d="M100 61 C79 86 82 121 100 136 C118 121 121 86 100 61Z" fill="${secondary}" opacity=".75"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const createLeafLayers = (): Layer[] => {
  const strokes: Stroke[] = [
    createStroke(bezier([CENTER, 615], [CENTER - 20, 500], [CENTER + 12, 330], [CENTER, 185], 42), PRESET_COLORS.cream, 15)
  ];

  for (let index = 0; index < 8; index += 1) {
    const y = 560 - index * 43;
    const spread = 90 + index * 12;
    const size = 13 - index * 0.65;
    strokes.push(
      createStroke(
        bezier([CENTER, y], [CENTER - spread * 0.55, y - 28], [CENTER - spread, y - 64], [CENTER - 28, y - 86], 32),
        PRESET_COLORS.cream,
        size
      ),
      createStroke(
        bezier([CENTER, y], [CENTER + spread * 0.55, y - 28], [CENTER + spread, y - 64], [CENTER + 28, y - 86], 32),
        PRESET_COLORS.cream,
        size
      )
    );
  }

  strokes.push(createStroke(bezier([CENTER - 44, 620], [CENTER - 5, 570], [CENTER + 4, 520], [CENTER + 34, 470], 30), PRESET_COLORS.foam, 6, FINE_OPACITY));
  return [createLayer(DEFAULT_LAYER_NAMES.foam, strokes)];
};

const createHeartLayers = (): Layer[] => {
  const creamStrokes: Stroke[] = [];
  const foamStrokes: Stroke[] = [];

  for (let index = 0; index < 6; index += 1) {
    const inset = index * 18;
    creamStrokes.push(
      createStroke(
        bezier([CENTER, 570 - inset], [CENTER - 180 + inset, 505 - inset], [CENTER - 170 + inset, 285 + inset], [CENTER, 360 + inset * 0.2], 38),
        PRESET_COLORS.cream,
        18 - index
      ),
      createStroke(
        bezier([CENTER, 570 - inset], [CENTER + 180 - inset, 505 - inset], [CENTER + 170 - inset, 285 + inset], [CENTER, 360 + inset * 0.2], 38),
        PRESET_COLORS.cream,
        18 - index
      )
    );
  }

  for (let index = 0; index < 4; index += 1) {
    foamStrokes.push(
      createStroke(
        ellipseArc(CENTER, 445, 54 + index * 18, 88 + index * 12, Math.PI * 1.18, Math.PI * 1.82, 34),
        index % 2 === 0 ? PRESET_COLORS.foam : PRESET_COLORS.milk,
        6,
        FINE_OPACITY
      )
    );
  }

  return [
    createLayer(DEFAULT_LAYER_NAMES.foam, creamStrokes),
    createLayer(DEFAULT_LAYER_NAMES.etching, foamStrokes, 0.86)
  ];
};

const createSwanLayers = (): Layer[] => {
  const body: Stroke[] = [
    createStroke(bezier([315, 525], [390, 455], [530, 455], [602, 535], 46), PRESET_COLORS.cream, 24),
    createStroke(bezier([330, 565], [420, 615], [545, 610], [615, 535], 46), PRESET_COLORS.cream, 18),
    createStroke(bezier([540, 505], [495, 410], [465, 300], [548, 228], 48), PRESET_COLORS.cream, 14),
    createStroke(bezier([548, 228], [585, 203], [615, 226], [588, 256], 30), PRESET_COLORS.milk, 9)
  ];
  const details: Stroke[] = [];

  for (let index = 0; index < 10; index += 1) {
    details.push(
      createStroke(
        bezier([350 + index * 18, 540 - index * 4], [396 + index * 10, 497 - index * 8], [464 + index * 9, 492 + index * 8], [552 - index * 8, 552 + index * 4], 32),
        index % 2 === 0 ? PRESET_COLORS.foam : PRESET_COLORS.cream,
        8,
        0.78
      )
    );
  }

  for (let index = 0; index < 8; index += 1) {
    details.push(
      createStroke(
        sineBranch([380, 592 - index * 17], [535, 575 - index * 9], 12 - index * 0.8, 26, index * 0.35),
        PRESET_COLORS.milk,
        5,
        0.64
      )
    );
  }

  return [
    createLayer(DEFAULT_LAYER_NAMES.foam, body),
    createLayer(DEFAULT_LAYER_NAMES.etching, details, 0.9)
  ];
};

const createRoseLayers = (): Layer[] => {
  const petals: Stroke[] = [];
  const highlights: Stroke[] = [];

  for (let ring = 0; ring < 5; ring += 1) {
    const radiusX = 46 + ring * 34;
    const radiusY = 28 + ring * 24;
    const petalCount = 4 + ring;
    for (let petal = 0; petal < petalCount; petal += 1) {
      const angle = (Math.PI * 2 * petal) / petalCount + ring * 0.32;
      const x = CENTER + Math.cos(angle) * ring * 22;
      const y = CENTER + Math.sin(angle) * ring * 15;
      const start = angle - 0.92;
      const end = angle + 0.92;
      petals.push(
        createStroke(
          ellipseArc(x, y, radiusX, radiusY, start, end, 30),
          ring % 2 === 0 ? PRESET_COLORS.cream : PRESET_COLORS.foam,
          Math.max(5, 13 - ring),
          0.82
        )
      );
    }
  }

  for (let index = 0; index < 5; index += 1) {
    highlights.push(
      createStroke(
        bezier([CENTER - 120 + index * 40, CENTER + 130], [CENTER - 70 + index * 28, CENTER + 55], [CENTER + 20 + index * 16, CENTER + 75], [CENTER + 85 - index * 16, CENTER - 30], 30),
        PRESET_COLORS.milk,
        4,
        0.55
      )
    );
  }

  return [
    createLayer(DEFAULT_LAYER_NAMES.foam, petals),
    createLayer(DEFAULT_LAYER_NAMES.accent, highlights, 0.75)
  ];
};

const createFeatherLayers = (): Layer[] => {
  const strokes: Stroke[] = [
    createStroke(bezier([315, 610], [355, 500], [405, 355], [500, 210], 54), PRESET_COLORS.cream, 12)
  ];

  for (let index = 0; index < 7; index += 1) {
    const t = index / 6;
    const baseX = 330 + t * 150;
    const baseY = 570 - t * 300;
    const length = 120 - index * 8;
    strokes.push(
      createStroke(
        bezier([baseX, baseY], [baseX - length * 0.55, baseY - 18], [baseX - length, baseY - 42], [baseX - length * 0.35, baseY - 78], 28),
        PRESET_COLORS.cream,
        7,
        0.78
      ),
      createStroke(
        bezier([baseX + 18, baseY - 11], [baseX + length * 0.52, baseY - 38], [baseX + length * 0.92, baseY - 72], [baseX + length * 0.28, baseY - 98], 28),
        PRESET_COLORS.foam,
        7,
        0.76
      )
    );
  }

  return [createLayer(DEFAULT_LAYER_NAMES.foam, strokes)];
};

export const createDefaultLayers = (): Layer[] => [
  createLayer(DEFAULT_LAYER_NAMES.foam, [], 1)
];

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "leaf",
    name: "经典叶子",
    description: "最经典的基础拉花图案，从杯中心向两侧展开叶片形状。",
    thumbnail: createThumbnail(PRESET_COLORS.cream, PRESET_COLORS.foam),
    layerData: createLeafLayers()
  },
  {
    id: "heart",
    name: "心形",
    description: "浪漫的心形拉花，适合表达爱意。",
    thumbnail: createThumbnail(PRESET_COLORS.foam, PRESET_COLORS.cream),
    layerData: createHeartLayers()
  },
  {
    id: "swan",
    name: "天鹅",
    description: "优雅的天鹅造型，包含颈部曲线和翅膀展开。",
    thumbnail: createThumbnail(PRESET_COLORS.milk, PRESET_COLORS.cream),
    layerData: createSwanLayers()
  },
  {
    id: "rose",
    name: "玫瑰",
    description: "多层花瓣叠加组成的玫瑰花拉花。",
    thumbnail: createThumbnail(PRESET_COLORS.foam, PRESET_COLORS.milk),
    layerData: createRoseLayers()
  },
  {
    id: "feather",
    name: "羽毛",
    description: "轻盈飘逸的羽毛图案，主轴线加两侧细密分支。",
    thumbnail: createThumbnail(PRESET_COLORS.cream, PRESET_COLORS.milk),
    layerData: createFeatherLayers()
  }
];

