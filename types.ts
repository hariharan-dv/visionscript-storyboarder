
export enum StylePreset {
  CINEMATIC = 'Cinematic',
  NOIR = 'Noir',
  ANIME = 'Anime',
  SKETCH = 'Sketch'
}

export enum AspectRatio {
  ULTRAWIDE = '2.39:1',
  WIDESCREEN = '16:9',
  PORTRAIT = '9:16'
}

export interface Panel {
  panel_id: number;
  shot_type: string;
  image_prompt: string;
  continuity_focus: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

export interface SceneMetadata {
  location: string;
  time: string;
  global_style: string;
}

export interface Project {
  id: string;
  title: string;
  script: string;
  heroAsset: string;
  style: StylePreset;
  aspectRatio: AspectRatio;
  metadata?: SceneMetadata;
  panels: Panel[];
  createdAt: number;
}
