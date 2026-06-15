import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_LAYER_NAMES } from "../constants/app";
import { createDefaultLayers } from "../constants/presets";
import { Layer } from "../types/layer";
import { Stroke } from "../types/stroke";
import { cloneLayers } from "../utils/canvas";

interface LayerState {
  layers: Layer[];
  activeLayerId: string;
  setLayers: (layers: Layer[]) => void;
  selectLayer: (layerId: string) => void;
  addLayer: (name?: string) => void;
  deleteLayer: (layerId: string) => boolean;
  toggleLayerVisibility: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  moveLayer: (layerId: string, direction: "up" | "down") => void;
  addStrokeToActiveLayer: (stroke: Stroke) => void;
}

const initialLayers = createDefaultLayers();

const createEmptyLayer = (name: string): Layer => ({
  id: uuidv4(),
  name,
  visible: true,
  opacity: 1,
  strokes: []
});

export const useLayerStore = create<LayerState>((set, get) => ({
  layers: cloneLayers(initialLayers),
  activeLayerId: initialLayers[0].id,
  setLayers: (layers: Layer[]): void => {
    const clonedLayers = cloneLayers(layers);
    const currentActiveLayerId = get().activeLayerId;
    const nextActiveLayerId = clonedLayers.some((layer) => layer.id === currentActiveLayerId)
      ? currentActiveLayerId
      : clonedLayers[0]?.id ?? "";
    set({
      layers: clonedLayers,
      activeLayerId: nextActiveLayerId
    });
  },
  selectLayer: (layerId: string): void => set({ activeLayerId: layerId }),
  addLayer: (name?: string): void => {
    const layers = get().layers;
    const nextLayerName = name ?? `${DEFAULT_LAYER_NAMES.accent} ${layers.length + 1}`;
    const nextLayer = createEmptyLayer(nextLayerName);
    set({
      layers: [...layers, nextLayer],
      activeLayerId: nextLayer.id
    });
  },
  deleteLayer: (layerId: string): boolean => {
    const layers = get().layers;
    if (layers.length <= 1) {
      return false;
    }
    const nextLayers = layers.filter((layer) => layer.id !== layerId);
    set({
      layers: nextLayers,
      activeLayerId: get().activeLayerId === layerId ? nextLayers[nextLayers.length - 1].id : get().activeLayerId
    });
    return true;
  },
  toggleLayerVisibility: (layerId: string): void =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    })),
  setLayerOpacity: (layerId: string, opacity: number): void =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId ? { ...layer, opacity } : layer
      )
    })),
  moveLayer: (layerId: string, direction: "up" | "down"): void => {
    const layers = [...get().layers];
    const index = layers.findIndex((layer) => layer.id === layerId);
    const targetIndex = direction === "up" ? index + 1 : index - 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= layers.length) {
      return;
    }
    const [layer] = layers.splice(index, 1);
    layers.splice(targetIndex, 0, layer);
    set({ layers });
  },
  addStrokeToActiveLayer: (stroke: Stroke): void =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === state.activeLayerId
          ? { ...layer, strokes: [...layer.strokes, stroke] }
          : layer
      )
    }))
}));
