import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Layer } from "../../../types/layer";
import styles from "./styles.module.css";

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onSelect: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onAdd: () => void;
  onDelete: (layerId: string) => void;
  onReorder: (layerId: string, direction: "up" | "down") => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
}

export const LayerPanel = ({
  layers,
  activeLayerId,
  onSelect,
  onToggleVisibility,
  onAdd,
  onDelete,
  onReorder,
  onOpacityChange
}: LayerPanelProps): JSX.Element => (
  <aside className={styles.panel} aria-label="图层面板">
    <header className={styles.header}>
      <div>
        <p>Layers</p>
        <h2>图层</h2>
      </div>
      <button type="button" onClick={onAdd} title="新建图层" aria-label="新建图层">
        <Plus size={18} aria-hidden="true" />
      </button>
    </header>

    <div className={styles.list}>
      {[...layers].reverse().map((layer, reverseIndex) => {
        const layerIndex = layers.length - 1 - reverseIndex;
        const isActive = layer.id === activeLayerId;
        return (
          <article key={layer.id} className={isActive ? styles.activeLayer : styles.layer}>
            <button className={styles.layerTitle} type="button" onClick={() => onSelect(layer.id)}>
              <span>{layer.name}</span>
              <small>{layer.strokes.length} 笔</small>
            </button>
            <div className={styles.row}>
              <button
                type="button"
                onClick={() => onToggleVisibility(layer.id)}
                title={layer.visible ? "隐藏图层" : "显示图层"}
                aria-label={layer.visible ? "隐藏图层" : "显示图层"}
              >
                {layer.visible ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={() => onReorder(layer.id, "up")}
                disabled={layerIndex === layers.length - 1}
                title="上移"
                aria-label="上移图层"
              >
                <ArrowUp size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onReorder(layer.id, "down")}
                disabled={layerIndex === 0}
                title="下移"
                aria-label="下移图层"
              >
                <ArrowDown size={16} aria-hidden="true" />
              </button>
              <button
                className={styles.deleteButton}
                type="button"
                onClick={() => onDelete(layer.id)}
                title="删除图层"
                aria-label="删除图层"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
            <label className={styles.opacityControl}>
              <span>不透明度 {Math.round(layer.opacity * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={layer.opacity}
                onChange={(event) => onOpacityChange(layer.id, Number(event.target.value))}
              />
            </label>
          </article>
        );
      })}
    </div>
  </aside>
);

