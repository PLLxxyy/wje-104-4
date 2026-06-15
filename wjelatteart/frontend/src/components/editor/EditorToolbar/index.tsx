import {
  ArrowLeft,
  Download,
  Edit3,
  FolderOpen,
  Play,
  Redo2,
  Save,
  Sparkles,
  Undo2
} from "lucide-react";
import { ThemeToggle } from "../../common/ThemeToggle";
import styles from "./styles.module.css";

interface EditorToolbarProps {
  artworkName: string;
  canUndo: boolean;
  canRedo: boolean;
  isPlaybackMode: boolean;
  strokeCount: number;
  onNameChange: (name: string) => void;
  onHome: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenPresets: () => void;
  onSave: () => void;
  onOpenExport: () => void;
  onOpenGallery: () => void;
  onTogglePlayback: () => void;
}

export const EditorToolbar = ({
  artworkName,
  canUndo,
  canRedo,
  isPlaybackMode,
  strokeCount,
  onNameChange,
  onHome,
  onUndo,
  onRedo,
  onOpenPresets,
  onSave,
  onOpenExport,
  onOpenGallery,
  onTogglePlayback
}: EditorToolbarProps): JSX.Element => (
  <header className={styles.toolbar}>
    <button type="button" onClick={onHome} title="返回首页">
      <ArrowLeft size={18} aria-hidden="true" />
      首页
    </button>
    <input
      className={styles.nameInput}
      value={artworkName}
      onChange={(event) => onNameChange(event.target.value)}
      aria-label="作品名称"
    />
    <button type="button" onClick={onUndo} disabled={!canUndo} title="撤销 Ctrl+Z">
      <Undo2 size={18} aria-hidden="true" />
      撤销
    </button>
    <button type="button" onClick={onRedo} disabled={!canRedo} title="重做 Ctrl+Y">
      <Redo2 size={18} aria-hidden="true" />
      重做
    </button>
    <button type="button" onClick={onOpenPresets} title="预设模板">
      <Sparkles size={18} aria-hidden="true" />
      预设
    </button>
    <button type="button" onClick={onSave} title="保存作品">
      <Save size={18} aria-hidden="true" />
      保存
    </button>
    <button type="button" onClick={onOpenExport} title="导出 PNG">
      <Download size={18} aria-hidden="true" />
      导出
    </button>
    <button type="button" onClick={onOpenGallery} title="打开作品集">
      <FolderOpen size={18} aria-hidden="true" />
      作品集
    </button>
    <button
      type="button"
      onClick={onTogglePlayback}
      title={isPlaybackMode ? "返回编辑模式" : "进入回放模式"}
      disabled={!isPlaybackMode && strokeCount === 0}
      className={isPlaybackMode ? styles.activeButton : undefined}
    >
      {isPlaybackMode ? (
        <>
          <Edit3 size={18} aria-hidden="true" />
          编辑
        </>
      ) : (
        <>
          <Play size={18} aria-hidden="true" />
          回放
        </>
      )}
    </button>
    <ThemeToggle />
  </header>
);

