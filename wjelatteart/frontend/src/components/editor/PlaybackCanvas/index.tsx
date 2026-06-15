import { useEffect, useRef } from "react";
import { CANVAS_SIZE } from "../../../constants/app";
import { Layer } from "../../../types/layer";
import { ThemeMode } from "../../../types/theme";
import { drawCupBase, renderLayers } from "../../../utils/canvas";
import styles from "./styles.module.css";

interface PlaybackCanvasProps {
  width: number;
  height: number;
  layers: Layer[];
  theme: ThemeMode;
}

export const PlaybackCanvas = ({
  width,
  height,
  layers,
  theme
}: PlaybackCanvasProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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
      renderLayers(context, layers);
    } catch {
      console.error("回放画布渲染失败");
    }
  }, [layers, theme, width, height]);

  return (
    <section className={styles.workspace} aria-label="咖啡拉花回放画布">
      <div className={styles.canvasFrame}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={CANVAS_SIZE.width}
          height={CANVAS_SIZE.height}
          aria-label="回放画布"
        />
        <div className={styles.playbackBadge} aria-label="回放模式">
          <span className={styles.badgeDot} />
          回放模式
        </div>
      </div>
    </section>
  );
};
