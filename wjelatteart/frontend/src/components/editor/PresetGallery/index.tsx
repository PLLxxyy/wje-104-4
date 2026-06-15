import { X } from "lucide-react";
import { PresetTemplate } from "../../../types/preset";
import styles from "./styles.module.css";

interface PresetGalleryProps {
  open: boolean;
  templates: PresetTemplate[];
  onSelect: (template: PresetTemplate) => void;
  onClose: () => void;
}

export const PresetGallery = ({
  open,
  templates,
  onSelect,
  onClose
}: PresetGalleryProps): JSX.Element | null => {
  if (!open) {
    return null;
  }

  return (
    <div className={styles.backdrop} role="presentation">
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="preset-title">
        <header className={styles.header}>
          <div>
            <p>Templates</p>
            <h2 id="preset-title">预设模板</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭预设模板">
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className={styles.grid}>
          {templates.map((template) => (
            <button key={template.id} className={styles.card} type="button" onClick={() => onSelect(template)}>
              <img src={template.thumbnail} alt={`${template.name} 模板缩略图`} />
              <span>{template.name}</span>
              <small>{template.description}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

