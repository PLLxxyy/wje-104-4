import { BRUSH_LIMITS } from "../../../constants/app";
import { COLOR_LABELS, PRESET_COLORS } from "../../../constants/colors";
import { ToolType } from "../../../constants/enums";
import { TOOL_OPTIONS } from "../../../constants/tools";
import styles from "./styles.module.css";

export interface ToolPanelValue {
  toolType: ToolType;
  brushSize: number;
  color: string;
  opacity: number;
  flowSpeed: number;
}

interface ToolPanelProps extends ToolPanelValue {
  onChange: (value: Partial<ToolPanelValue>) => void;
}

export const ToolPanel = ({
  toolType,
  brushSize,
  color,
  opacity,
  flowSpeed,
  onChange
}: ToolPanelProps): JSX.Element => (
  <aside className={styles.panel} aria-label="工具面板">
    <header>
      <p>Tools</p>
      <h2>拉花工具</h2>
    </header>

    <div className={styles.toolGrid} role="group" aria-label="工具类型">
      {TOOL_OPTIONS.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          className={type === toolType ? styles.activeTool : styles.toolButton}
          type="button"
          onClick={() => onChange({ toolType: type })}
          title={label}
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>

    <label className={styles.control}>
      <span>画笔大小 {brushSize}px</span>
      <input
        type="range"
        min={BRUSH_LIMITS.minSize}
        max={BRUSH_LIMITS.maxSize}
        value={brushSize}
        onChange={(event) => onChange({ brushSize: Number(event.target.value) })}
      />
    </label>

    <label className={styles.control}>
      <span>透明度 {Math.round(opacity * 100)}%</span>
      <input
        type="range"
        min={BRUSH_LIMITS.minOpacity}
        max={BRUSH_LIMITS.maxOpacity}
        step="0.01"
        value={opacity}
        onChange={(event) => onChange({ opacity: Number(event.target.value) })}
      />
    </label>

    <label className={styles.control}>
      <span>流量速度 {flowSpeed}%</span>
      <input
        type="range"
        min={BRUSH_LIMITS.minFlow}
        max={BRUSH_LIMITS.maxFlow}
        value={flowSpeed}
        onChange={(event) => onChange({ flowSpeed: Number(event.target.value) })}
      />
    </label>

    <div className={styles.palette} aria-label="预设颜色">
      {Object.entries(PRESET_COLORS).map(([key, value]) => (
        <button
          key={key}
          className={value === color ? styles.activeSwatch : styles.swatch}
          type="button"
          style={{ backgroundColor: value }}
          onClick={() => onChange({ color: value })}
          aria-label={COLOR_LABELS[key as keyof typeof COLOR_LABELS]}
          title={COLOR_LABELS[key as keyof typeof COLOR_LABELS]}
        />
      ))}
    </div>

    <label className={styles.colorInput}>
      <span>自定义颜色</span>
      <input type="color" value={color} onChange={(event) => onChange({ color: event.target.value })} />
    </label>
  </aside>
);
