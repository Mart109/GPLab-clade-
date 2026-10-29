export type Kind = 'txt' | 'rect' | 'oval' | 'img' | 'ln' | 'chart';
export type Anim = 'none' | 'fade' | 'slide' | 'zoom';
export type Trans = 'none' | 'fade' | 'slide' | 'zoom';
export type ChartKind = 'bar' | 'pie' | 'line';
export type BgPat = 'none' | 'dots' | 'lines' | 'grid';
export type Align = 'left' | 'center' | 'right';

interface Base {
  id: string;
  kind: Kind;
  x: number; y: number; w: number; h: number; rot: number;
  anim?: Anim;
  delay?: number;
  shadow?: boolean;
  opa?: number;
  isDecor?: boolean; // <--- Для декоративных фонов
}

export interface TxtEl extends Base {
  kind: 'txt';
  s: string;
  fs: number;
  col: string;
  bold?: boolean;
  italic?: boolean;
  align?: Align;
  list?: 'none' | 'bullet' | 'number';
  stroke?: string;
  strokeW?: number;
}

export interface RectEl extends Base {
  kind: 'rect';
  fill: string;
  grad2?: string;
  rad?: number;
  stroke?: string;
  strokeW?: number;
}

export interface OvalEl extends Base {
  kind: 'oval';
  fill: string;
  grad2?: string;
  stroke?: string;
  strokeW?: number;
}

export interface ImgEl extends Base { kind: 'img'; src: string; }
export interface LnEl extends Base { kind: 'ln'; pts: number[]; col: string; wd: number; }

export interface ChartEl extends Base {
  kind: 'chart';
  ctype: ChartKind;
  data: number[];
  labels: string[];
  colors: string[];
}

export type El = TxtEl | RectEl | OvalEl | ImgEl | LnEl | ChartEl;

export interface Sld {
  id: string;
  bg: string;
  pat?: BgPat;
  patCol?: string;
  els: El[];
  note?: string;
  trans?: Trans;
}

export interface Doc {
  id: string;
  name: string;
  slides: Sld[];
}