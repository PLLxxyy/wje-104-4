import { useCallback, useEffect } from "react";
import { Layer } from "../types/layer";
import { cloneLayers } from "../utils/canvas";

interface LayerHistoryControlsOptions {
  undo: () => Layer[] | undefined;
  redo: () => Layer[] | undefined;
  setLayers: (layers: Layer[]) => void;
}

interface LayerHistoryControls {
  undoLayers: () => void;
  redoLayers: () => void;
}

export const useLayerHistoryControls = ({
  undo,
  redo,
  setLayers
}: LayerHistoryControlsOptions): LayerHistoryControls => {
  const undoLayers = useCallback((): void => {
    const restoredLayers = undo();
    if (restoredLayers) {
      setLayers(cloneLayers(restoredLayers));
    }
  }, [setLayers, undo]);

  const redoLayers = useCallback((): void => {
    const restoredLayers = redo();
    if (restoredLayers) {
      setLayers(cloneLayers(restoredLayers));
    }
  }, [redo, setLayers]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const modifierPressed = event.ctrlKey || event.metaKey;
      if (!modifierPressed) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undoLayers();
      }
      if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        redoLayers();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [redoLayers, undoLayers]);

  return { undoLayers, redoLayers };
};

