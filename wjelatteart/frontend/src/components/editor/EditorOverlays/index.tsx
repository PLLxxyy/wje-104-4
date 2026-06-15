import { EXPORT_SCALES } from "../../../constants/app";
import { PRESET_TEMPLATES } from "../../../constants/presets";
import { PresetTemplate } from "../../../types/preset";
import { ExportScale } from "../../../utils/export";
import { ConfirmDialog } from "../../common/ConfirmDialog";
import { ExportDialog } from "../ExportDialog";
import { PresetGallery } from "../PresetGallery";
import styles from "./styles.module.css";

interface EditorOverlaysProps {
  notice: string;
  presetOpen: boolean;
  exportOpen: boolean;
  exporting: boolean;
  selectedScale: ExportScale;
  confirmOpen: boolean;
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel: string;
  onPresetSelect: (template: PresetTemplate) => void;
  onPresetClose: () => void;
  onScaleChange: (scale: ExportScale) => void;
  onExport: () => void;
  onExportClose: () => void;
  onConfirm: () => void;
  onCancelConfirm: () => void;
}

export const DEFAULT_EXPORT_SCALE = EXPORT_SCALES[0];

export const EditorOverlays = ({
  notice,
  presetOpen,
  exportOpen,
  exporting,
  selectedScale,
  confirmOpen,
  confirmTitle,
  confirmDescription,
  confirmLabel,
  onPresetSelect,
  onPresetClose,
  onScaleChange,
  onExport,
  onExportClose,
  onConfirm,
  onCancelConfirm
}: EditorOverlaysProps): JSX.Element => (
  <>
    {notice ? <div className={styles.toast} role="status">{notice}</div> : null}
    <PresetGallery
      open={presetOpen}
      templates={PRESET_TEMPLATES}
      onSelect={onPresetSelect}
      onClose={onPresetClose}
    />
    <ExportDialog
      open={exportOpen}
      exporting={exporting}
      selectedScale={selectedScale}
      onScaleChange={onScaleChange}
      onExport={onExport}
      onClose={onExportClose}
    />
    <ConfirmDialog
      open={confirmOpen}
      title={confirmTitle}
      description={confirmDescription}
      confirmLabel={confirmLabel}
      onConfirm={onConfirm}
      onCancel={onCancelConfirm}
    />
  </>
);

