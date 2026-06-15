import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { CanvasWorkspaceHandle } from "../../components/editor/CanvasWorkspace";
import { DEFAULT_EXPORT_SCALE, EditorOverlays } from "../../components/editor/EditorOverlays";
import { EditorToolbar } from "../../components/editor/EditorToolbar";
import { EditorWorkArea } from "../../components/editor/EditorWorkArea";
import { StatusBar } from "../../components/editor/StatusBar";
import { ToolPanelValue } from "../../components/editor/ToolPanel";
import { ROUTES, UI_TEXT } from "../../constants/app";
import { createDefaultLayers } from "../../constants/presets";
import { useHistory } from "../../hooks/useHistory";
import { useLayerHistoryControls } from "../../hooks/useLayerHistoryControls";
import { useArtworkStore } from "../../stores/useArtworkStore";
import { useLayerStore } from "../../stores/useLayerStore";
import { useThemeStore } from "../../stores/useThemeStore";
import { useToolStore } from "../../stores/useToolStore";
import { Artwork } from "../../types/artwork";
import { Layer } from "../../types/layer";
import { PresetTemplate } from "../../types/preset";
import { Point, Stroke } from "../../types/stroke";
import { cloneLayers } from "../../utils/canvas";
import { downloadBlob, ExportScale } from "../../utils/export";
import { createArtworkThumbnail } from "../../utils/thumbnail";
import styles from "./styles.module.css";

type DialogKind = "layer" | "preset" | undefined;

const toDownloadName = (name: string): string =>
  `${name.trim().replace(/\s+/g, "-") || "latte-art"}-${dayjs().format("YYYYMMDD-HHmm")}.png`;

export const Editor = (): JSX.Element => {
  const navigate = useNavigate();
  const { artworkId } = useParams();
  const canvasRef = useRef<CanvasWorkspaceHandle>(null);
  const [artworkName, setArtworkName] = useState("未命名拉花");
  const [currentArtworkId, setCurrentArtworkId] = useState<string | undefined>();
  const [pointer, setPointer] = useState<Point | null>(null);
  const [notice, setNotice] = useState<string>("");
  const [presetOpen, setPresetOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<PresetTemplate | undefined>();
  const [pendingLayerId, setPendingLayerId] = useState<string | undefined>();
  const [dialogKind, setDialogKind] = useState<DialogKind>();
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedScale, setSelectedScale] = useState<ExportScale>(DEFAULT_EXPORT_SCALE);
  const { theme } = useThemeStore();
  const toolStore = useToolStore();
  const layers = useLayerStore((state) => state.layers);
  const activeLayerId = useLayerStore((state) => state.activeLayerId);
  const setLayers = useLayerStore((state) => state.setLayers);
  const selectLayer = useLayerStore((state) => state.selectLayer);
  const addLayer = useLayerStore((state) => state.addLayer);
  const deleteLayer = useLayerStore((state) => state.deleteLayer);
  const toggleLayerVisibility = useLayerStore((state) => state.toggleLayerVisibility);
  const setLayerOpacity = useLayerStore((state) => state.setLayerOpacity);
  const moveLayer = useLayerStore((state) => state.moveLayer);
  const saveArtwork = useArtworkStore((state) => state.saveArtwork);
  const getArtworkById = useArtworkStore((state) => state.getArtworkById);
  const {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear
  } = useHistory<Layer[]>(cloneLayers(createDefaultLayers()));
  const { undoLayers, redoLayers } = useLayerHistoryControls({ undo, redo, setLayers });

  const syncLayers = useCallback(
    (nextLayers: Layer[], recordHistory: boolean): void => {
      setLayers(nextLayers);
      if (recordHistory) {
        pushState(cloneLayers(nextLayers));
      }
    },
    [pushState, setLayers]
  );

  useEffect(() => {
    const existingArtwork = artworkId ? getArtworkById(artworkId) : undefined;
    const nextLayers = existingArtwork ? cloneLayers(existingArtwork.layers) : cloneLayers(createDefaultLayers());
    setArtworkName(existingArtwork?.name ?? "未命名拉花");
    setCurrentArtworkId(existingArtwork?.id);
    setLayers(nextLayers);
    clear(cloneLayers(nextLayers));
  }, [artworkId, clear, getArtworkById, setLayers]);

  const showNotice = useCallback((message: string): void => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }, []);

  const handleToolChange = (value: Partial<ToolPanelValue>): void => {
    if (value.toolType) {
      toolStore.setToolType(value.toolType);
    }
    if (value.brushSize !== undefined) {
      toolStore.setBrushSize(value.brushSize);
    }
    if (value.color) {
      toolStore.setColor(value.color);
    }
    if (value.opacity !== undefined) {
      toolStore.setOpacity(value.opacity);
    }
    if (value.flowSpeed !== undefined) {
      toolStore.setFlowSpeed(value.flowSpeed);
    }
  };

  const handleStrokeComplete = useCallback(
    (stroke: Stroke): void => {
      const currentState = useLayerStore.getState();
      const nextLayers = currentState.layers.map((layer) =>
        layer.id === currentState.activeLayerId
          ? { ...layer, strokes: [...layer.strokes, stroke] }
          : layer
      );
      syncLayers(nextLayers, true);
    },
    [syncLayers]
  );

  const commitStoreAction = (action: () => boolean | void): void => {
    const result = action();
    if (result === false) {
      return;
    }
    pushState(cloneLayers(useLayerStore.getState().layers));
  };

  const handleDeleteLayerRequest = (layerId: string): void => {
    if (layers.length <= 1) {
      showNotice(UI_TEXT.deleteLayerBlocked);
      return;
    }
    setPendingLayerId(layerId);
    setDialogKind("layer");
  };

  const confirmDialog = (): void => {
    if (dialogKind === "layer" && pendingLayerId) {
      commitStoreAction(() => deleteLayer(pendingLayerId));
      setPendingLayerId(undefined);
      setDialogKind(undefined);
    }
    if (dialogKind === "preset" && pendingTemplate) {
      const nextLayers = cloneLayers(pendingTemplate.layerData, true);
      syncLayers(nextLayers, true);
      setPendingTemplate(undefined);
      setDialogKind(undefined);
      showNotice(UI_TEXT.loadTemplateSuccess);
    }
  };

  const cancelDialog = (): void => {
    setPendingLayerId(undefined);
    setPendingTemplate(undefined);
    setDialogKind(undefined);
  };

  const handlePresetSelect = (template: PresetTemplate): void => {
    setPresetOpen(false);
    setPendingTemplate(template);
    setDialogKind("preset");
  };

  const handleSave = (): void => {
    const requestedName = window.prompt("请输入作品名称", artworkName);
    if (requestedName === null) {
      return;
    }
    const trimmedName = requestedName.trim() || "未命名拉花";
    const existingArtwork = currentArtworkId ? getArtworkById(currentArtworkId) : undefined;
    let thumbnail = "";
    try {
      thumbnail = createArtworkThumbnail(layers, theme);
    } catch {
      showNotice(UI_TEXT.canvasFailed);
      return;
    }
    const now = dayjs().toISOString();
    const artwork: Artwork = {
      id: existingArtwork?.id ?? currentArtworkId ?? uuidv4(),
      name: trimmedName,
      layers: cloneLayers(layers),
      thumbnail,
      createdAt: existingArtwork?.createdAt ?? now,
      updatedAt: now
    };
    const saved = saveArtwork(artwork);
    if (!saved) {
      const error = useArtworkStore.getState().lastError ?? UI_TEXT.storageFull;
      showNotice(error);
      return;
    }
    setArtworkName(trimmedName);
    setCurrentArtworkId(artwork.id);
    showNotice(UI_TEXT.saveSuccess);
    if (!existingArtwork) {
      navigate(`${ROUTES.editor}/${artwork.id}`, { replace: true });
    }
  };

  const handleExport = async (): Promise<void> => {
    if (!canvasRef.current) {
      showNotice(UI_TEXT.exportFailed);
      return;
    }
    setExporting(true);
    try {
      const blob = await canvasRef.current.exportCanvas(selectedScale, "image/png");
      downloadBlob(blob, toDownloadName(artworkName));
      setExportOpen(false);
    } catch {
      showNotice(UI_TEXT.exportFailed);
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className={styles.editorShell}>
      <EditorToolbar
        artworkName={artworkName}
        canUndo={canUndo}
        canRedo={canRedo}
        onNameChange={setArtworkName}
        onHome={() => navigate(ROUTES.home)}
        onUndo={undoLayers}
        onRedo={redoLayers}
        onOpenPresets={() => setPresetOpen(true)}
        onSave={handleSave}
        onOpenExport={() => setExportOpen(true)}
        onOpenGallery={() => navigate(ROUTES.gallery)}
      />

      <EditorWorkArea
        canvasRef={canvasRef}
        tool={{
          toolType: toolStore.toolType,
          color: toolStore.color,
          brushSize: toolStore.brushSize,
          opacity: toolStore.opacity,
          flowSpeed: toolStore.flowSpeed
        }}
        layers={layers}
        activeLayerId={activeLayerId}
        theme={theme}
        onToolChange={handleToolChange}
        onStrokeComplete={handleStrokeComplete}
        onPointerPosition={setPointer}
        onCanvasError={showNotice}
        onSelectLayer={selectLayer}
        onToggleLayerVisibility={(layerId) => commitStoreAction(() => toggleLayerVisibility(layerId))}
        onAddLayer={() => commitStoreAction(() => addLayer())}
        onDeleteLayer={handleDeleteLayerRequest}
        onReorderLayer={(layerId, direction) => commitStoreAction(() => moveLayer(layerId, direction))}
        onLayerOpacityChange={(layerId, opacity) =>
          commitStoreAction(() => setLayerOpacity(layerId, opacity))
        }
      />

      <StatusBar
        toolType={toolStore.toolType}
        brushSize={toolStore.brushSize}
        opacity={toolStore.opacity}
        pointer={pointer}
      />

      <EditorOverlays
        notice={notice}
        presetOpen={presetOpen}
        exportOpen={exportOpen}
        exporting={exporting}
        selectedScale={selectedScale}
        confirmOpen={dialogKind !== undefined}
        confirmTitle={dialogKind === "preset" ? "载入预设模板" : "删除图层"}
        confirmDescription={
          dialogKind === "preset"
            ? "载入模板会替换当前画布内容。继续操作前请确认当前作品已保存。"
            : "删除后该图层的笔画会从当前编辑状态移除。"
        }
        confirmLabel={dialogKind === "preset" ? "载入模板" : "删除图层"}
        onPresetSelect={handlePresetSelect}
        onPresetClose={() => setPresetOpen(false)}
        onScaleChange={setSelectedScale}
        onExport={handleExport}
        onExportClose={() => setExportOpen(false)}
        onConfirm={confirmDialog}
        onCancelConfirm={cancelDialog}
      />
    </main>
  );
};
