import { ToolType } from "../../../constants/enums";
import { Point } from "../../../types/stroke";
import styles from "./styles.module.css";

interface StatusBarProps {
  toolType: ToolType;
  brushSize: number;
  opacity: number;
  pointer: Point | null;
}

export const StatusBar = ({
  toolType,
  brushSize,
  opacity,
  pointer
}: StatusBarProps): JSX.Element => (
  <footer className={styles.statusBar}>
    <span>{toolType} / {brushSize}px / {Math.round(opacity * 100)}%</span>
    <span>{pointer ? `x:${Math.round(pointer.x)} y:${Math.round(pointer.y)}` : "坐标: -"}</span>
    <span>缩放 100%</span>
  </footer>
);

