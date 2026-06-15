import { AlertTriangle } from "lucide-react";
import styles from "./styles.module.css";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  onConfirm,
  onCancel
}: ConfirmDialogProps): JSX.Element | null => {
  if (!open) {
    return null;
  }

  return (
    <div className={styles.backdrop} role="presentation">
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <AlertTriangle className={styles.icon} size={24} aria-hidden="true" />
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        <div className={styles.actions}>
          <button type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={styles.confirmButton} type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
};

