import { Download, X } from "lucide-react";
import { EXPORT_SCALES } from "../../../constants/app";
import { ExportScale } from "../../../utils/export";
import styles from "./styles.module.css";

interface ExportDialogProps {
  open: boolean;
  exporting: boolean;
  selectedScale: ExportScale;
  onScaleChange: (scale: ExportScale) => void;
  onExport: () => void;
  onClose: () => void;
}

export const ExportDialog = ({
  open,
  exporting,
  selectedScale,
  onScaleChange,
  onExport,
  onClose
}: ExportDialogProps): JSX.Element | null => {
  if (!open) {
    return null;
  }

  return (
    <div className={styles.backdrop} role="presentation">
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="export-title">
        <header className={styles.header}>
          <div>
            <p>Export</p>
            <h2 id="export-title">导出 PNG</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭导出面板">
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className={styles.scaleGrid} role="group" aria-label="导出尺寸">
          {EXPORT_SCALES.map((scale) => (
            <button
              key={scale}
              className={scale === selectedScale ? styles.activeScale : styles.scaleButton}
              type="button"
              onClick={() => onScaleChange(scale)}
            >
              {scale}x
            </button>
          ))}
        </div>
        <button className={styles.exportButton} type="button" onClick={onExport} disabled={exporting}>
          <Download size={18} aria-hidden="true" />
          {exporting ? "导出中" : "下载 PNG"}
        </button>
      </section>
    </div>
  );
};

