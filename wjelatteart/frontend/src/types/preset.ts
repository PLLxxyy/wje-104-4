import { Layer } from "./layer";

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  layerData: Layer[];
}

