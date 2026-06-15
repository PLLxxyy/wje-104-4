import { Layer } from "./layer";

export interface Artwork {
  id: string;
  name: string;
  layers: Layer[];
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
}

