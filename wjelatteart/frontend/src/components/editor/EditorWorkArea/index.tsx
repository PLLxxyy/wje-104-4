import { RefObject } from "react";
import { CANVAS_SIZE } from "../../../constants/app";
import { Layer } from "../../../types/layer";
import { Point, Stroke } from "../../../types/stroke";
import { ThemeMode } from "../../../types/theme";
import { CanvasWorkspace, CanvasWorkspaceHandle } from "../CanvasWorkspace";
import { LayerPanel } from "../LayerPanel";
import { ToolPanel, ToolPanelValue } from "../ToolPanel";
import styles from "./styles.module.css";

interface EditorWorkAreaProps {
  canvasRef: RefObject<CanvasWorkspaceHandle>;
  tool: ToolPanelValue;
  layers: Layer[];
  activeLayerId: string;
  theme: ThemeMode;
  onToolChange: (value: Partial<ToolPanelValue>) => void;
  onStrokeComplete: (stroke: Stroke) => void;
  onPointerPosition: (point: Point | null) => void;
  onCanvasError: (message: string) => void;
  onSelectLayer: (layerId: string) => void;
  onToggleLayerVisibility: (layerId: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (layerId: string) => void;
  onReorderLayer: (layerId: string, direction: "up" | "down") => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
}

export const EditorWorkArea = ({
  canvasRef,
  tool,
  layers,
  activeLayerId,
  theme,
  onToolChange,
  onStrokeComplete,
  onPointerPosition,
  onCanvasError,
  onSelectLayer,
  onToggleLayerVisibility,
  onAddLayer,
  onDeleteLayer,
  onReorderLayer,
  onLayerOpacityChange
}: EditorWorkAreaProps): JSX.Element => (
  <section className={styles.editorGrid}>
    <ToolPanel
      toolType={tool.toolType}
      brushSize={tool.brushSize}
      color={tool.color}
      opacity={tool.opacity}
      flowSpeed={tool.flowSpeed}
      onChange={onToolChange}
    />
    <CanvasWorkspace
      ref={canvasRef}
      width={CANVAS_SIZE.width}
      height={CANVAS_SIZE.height}
      layers={layers}
      activeLayerId={activeLayerId}
      theme={theme}
      tool={tool}
      onStrokeComplete={onStrokeComplete}
      onPointerPosition={onPointerPosition}
      onError={onCanvasError}
    />
    <LayerPanel
      layers={layers}
      activeLayerId={activeLayerId}
      onSelect={onSelectLayer}
      onToggleVisibility={onToggleLayerVisibility}
      onAdd={onAddLayer}
      onDelete={onDeleteLayer}
      onReorder={onReorderLayer}
      onOpacityChange={onLayerOpacityChange}
    />
  </section>
);

