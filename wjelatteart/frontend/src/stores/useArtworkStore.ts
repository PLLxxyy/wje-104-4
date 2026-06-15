import dayjs from "dayjs";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { STORAGE_KEYS } from "../constants/app";
import { PRESET_COLORS } from "../constants/colors";
import { ToolType } from "../constants/enums";
import { PRESET_TEMPLATES } from "../constants/presets";
import { storage } from "../hooks/useLocalStorage";
import { Artwork } from "../types/artwork";
import { Layer } from "../types/layer";
import { Stroke } from "../types/stroke";
import { cloneLayers } from "../utils/canvas";
import { createArtworkThumbnail } from "../utils/thumbnail";

interface ArtworkState {
  artworks: Artwork[];
  lastError?: string;
  saveArtwork: (artwork: Artwork) => boolean;
  deleteArtwork: (artworkId: string) => boolean;
  getArtworkById: (artworkId: string) => Artwork | undefined;
  clearError: () => void;
}

const createDetailStroke = (x: number, y: number): Stroke => ({
  id: uuidv4(),
  points: [
    { x: x - 12, y: y - 8, timestamp: Date.now() },
    { x, y, timestamp: Date.now() + 16 },
    { x: x + 12, y: y + 8, timestamp: Date.now() + 32 }
  ],
  color: PRESET_COLORS.milk,
  size: 5,
  opacity: 0.72,
  toolType: ToolType.BRUSH
});

const withExtraLayer = (layers: Layer[], strokes: Stroke[]): Layer[] => [
  ...cloneLayers(layers, true),
  {
    id: uuidv4(),
    name: "点缀层",
    visible: true,
    opacity: 0.82,
    strokes
  }
];

const safeThumbnail = (layers: Layer[], fallback: string): string => {
  try {
    return createArtworkThumbnail(layers, "light");
  } catch {
    return fallback;
  }
};

const createExampleArtworks = (): Artwork[] => {
  const leafTemplate = PRESET_TEMPLATES.find((template) => template.id === "leaf") ?? PRESET_TEMPLATES[0];
  const swanTemplate = PRESET_TEMPLATES.find((template) => template.id === "swan") ?? PRESET_TEMPLATES[0];
  const leafLayers = withExtraLayer(leafTemplate.layerData, [
    createDetailStroke(348, 510),
    createDetailStroke(452, 468)
  ]);
  const swanLayers = withExtraLayer(swanTemplate.layerData, [
    createDetailStroke(580, 238),
    createDetailStroke(505, 536),
    createDetailStroke(440, 584)
  ]);

  return [
    {
      id: uuidv4(),
      name: "晨光叶片",
      layers: leafLayers,
      thumbnail: safeThumbnail(leafLayers, leafTemplate.thumbnail),
      createdAt: dayjs().subtract(3, "day").toISOString(),
      updatedAt: dayjs().subtract(3, "day").toISOString()
    },
    {
      id: uuidv4(),
      name: "天鹅湖畔",
      layers: swanLayers,
      thumbnail: safeThumbnail(swanLayers, swanTemplate.thumbnail),
      createdAt: dayjs().subtract(1, "day").toISOString(),
      updatedAt: dayjs().subtract(1, "day").toISOString()
    }
  ];
};

const loadInitialArtworks = (): { artworks: Artwork[]; error?: string } => {
  const result = storage.getItem<Artwork[]>(STORAGE_KEYS.artworks, []);
  if (result.value.length > 0) {
    return { artworks: result.value, error: result.error };
  }
  const examples = createExampleArtworks();
  const writeResult = storage.setItem(STORAGE_KEYS.artworks, examples);
  return {
    artworks: examples,
    error: result.error ?? writeResult.error
  };
};

const persistArtworks = (artworks: Artwork[]): { artworks: Artwork[]; lastError?: string } => {
  const writeResult = storage.setItem(STORAGE_KEYS.artworks, artworks);
  return {
    artworks,
    lastError: writeResult.error
  };
};

const initialState = loadInitialArtworks();

export const useArtworkStore = create<ArtworkState>((set, get) => ({
  artworks: initialState.artworks,
  lastError: initialState.error,
  saveArtwork: (artwork: Artwork): boolean => {
    const currentArtworks = get().artworks;
    const nextArtworks = currentArtworks.some((item) => item.id === artwork.id)
      ? currentArtworks.map((item) => (item.id === artwork.id ? artwork : item))
      : [artwork, ...currentArtworks];
    const persisted = persistArtworks(nextArtworks);
    set(persisted);
    return persisted.lastError === undefined;
  },
  deleteArtwork: (artworkId: string): boolean => {
    const nextArtworks = get().artworks.filter((artwork) => artwork.id !== artworkId);
    const persisted = persistArtworks(nextArtworks);
    set(persisted);
    return persisted.lastError === undefined;
  },
  getArtworkById: (artworkId: string): Artwork | undefined =>
    get().artworks.find((artwork) => artwork.id === artworkId),
  clearError: (): void => set({ lastError: undefined })
}));

