import { EXPORT_SCALES } from "../constants/app";
import { Layer } from "../types/layer";
import { ThemeMode } from "../types/theme";
import { renderArtworkToCanvas } from "./canvas";

export type ExportScale = (typeof EXPORT_SCALES)[number];

export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Canvas export produced an empty file."));
      },
      type,
      quality
    );
  });

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const exportArtworkPng = async (
  layers: Layer[],
  width: number,
  height: number,
  scale: ExportScale,
  theme: ThemeMode,
  filename: string
): Promise<void> => {
  const canvas = renderArtworkToCanvas(layers, width, height, scale, theme);
  const blob = await canvasToBlob(canvas, "image/png");
  downloadBlob(blob, filename);
};

