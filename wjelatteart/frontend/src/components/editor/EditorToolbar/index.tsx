import {
  ArrowLeft,
  Download,
  FolderOpen,
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
  onNameChange: (name: string) => void;
  onHome: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenPresets: () => void;
  onSave: () => void;
  onOpenExport: () => void;
  onOpenGallery: () => void;
}

export const EditorToolbar = ({
  artworkName,
  canUndo,
  canRedo,
  onNameChange,
  onHome,
  onUndo,
  onRedo,
  onOpenPresets,
  onSave,
  onOpenExport,
  onOpenGallery
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
    <ThemeToggle />
  </header>
);

