import { CANVAS_SIZE } from "../constants/app";
import { Layer } from "../types/layer";
import { ThemeMode } from "../types/theme";
import { renderArtworkToCanvas } from "./canvas";

export const createArtworkThumbnail = (layers: Layer[], theme: ThemeMode): string => {
  const scale = CANVAS_SIZE.thumbnailWidth / CANVAS_SIZE.width;
  const canvas = renderArtworkToCanvas(
    layers,
    CANVAS_SIZE.width,
    CANVAS_SIZE.height,
    scale,
    theme
  );
  return canvas.toDataURL("image/jpeg", 0.86);
};

