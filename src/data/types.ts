export type StageId = 'capture' | 'transcript' | 'compose' | 'write' | 'publish';

export interface Agent {
  id: string;
  code: string;
  name: string;
  stage: StageId;
  role: string;
  description: string;
  model: string;
  fallback: string;
  modelReason: string;
  skills: string[];
  dialects?: string[];
  inputs: string[];
  outputs: string[];
  latency: string;
  cost: string;
  status: 'ready' | 'running' | 'warm';
  tone: string;
}

export interface SkillRepo {
  id: string;
  repo: string;
  name: string;
  description: string;
  stars: number;
  language: string;
  category: '语音' | '文本' | '图像' | '排版' | '文档';
  url: string;
  usedBy: string[];
  license: string;
  note: string;
}

export interface TranscriptLine {
  id: string;
  speaker: 'host' | 'guest';
  start: number;
  text: string;
  confidence: number;
  dialectWord?: string;
}

export interface AudioTrack {
  id: string;
  name: string;
  duration: number;
  sizeLabel: string;
  recordedAt: string;
  dialect: string;
  kind: 'record' | 'import';
  status: 'ready' | 'transcribed';
}

export interface TimelineEvent {
  year: string;
  title: string;
  detail: string;
}

export interface StoryEntity {
  name: string;
  role: string;
  kind: 'person' | 'place' | 'object';
}

export interface OutlineItem {
  id: string;
  title: string;
  period: string;
  summary: string;
  keyEvents: string[];
}

export interface StorySpine {
  logline: string;
  themes: string[];
  timeline: TimelineEvent[];
  entities: StoryEntity[];
  quotes: { text: string; source: string }[];
  outline: OutlineItem[];
  coverage: number;
}

export interface Chapter {
  id: string;
  index: number;
  title: string;
  period: string;
  summary: string;
  body: string;
  words: number;
  status: 'draft' | 'done' | 'empty';
}

export interface Illustration {
  id: string;
  chapterId: string;
  chapterTitle: string;
  prompt: string;
  seed: number;
  style: string;
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** 真实图像 URL（base64 data URL 或 https URL）—— 模型 API 返回时填入 */
  imageUrl?: string;
  /** 模型返回的原始错误 */
  error?: string;
}

export interface CoverDesign {
  title: string;
  subtitle: string;
  author: string;
  style: string;
  prompt: string;
  seed: number;
  status: 'idle' | 'loading' | 'ready' | 'error';
  imageUrl?: string;
  error?: string;
}

export interface ProjectMeta {
  title: string;
  subtitle: string;
  subject: string;
  subjectAge: number;
  host: string;
  place: string;
  createdAt: string;
}

export interface Project {
  id: string;
  meta: ProjectMeta;
  tracks: AudioTrack[];
  transcript: TranscriptLine[];
  dialect: string;
  cleaned: boolean;
  story: StorySpine | null;
  narrative: string;
  tone: string;
  chapters: Chapter[];
  cover: CoverDesign;
  illustrations: Illustration[];
  layout: string;
  illustrationStyle: string;
  wordCount: number;
  lastSaved: string;
}

/** 项目列表里只存轻量元信息，完整内容按 id 分开存 */
export interface ProjectSummary {
  id: string;
  title: string;
  subtitle: string;
  subject: string;
  coverTitle: string;
  chapterCount: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface ProjectStore {
  activeId: string;
  summaries: ProjectSummary[];
}

export type NarrativePreset = {
  id: string;
  name: string;
  en: string;
  essence: string;
  description: string;
  bestFor: string;
  chapterOrder: number[];
  connector: string;
};

export type TonePreset = {
  id: string;
  name: string;
  en: string;
  description: string;
  sample: string;
  keywords: string[];
  openings: string[];
};

export type ImageStyle = {
  id: string;
  name: string;
  en: string;
  description: string;
  palette: string[];
  prompt: string;
};

export type LayoutPreset = {
  id: string;
  name: string;
  size: string;
  description: string;
  bodySize: string;
  leading: string;
  pages: number;
  features: string[];
};
