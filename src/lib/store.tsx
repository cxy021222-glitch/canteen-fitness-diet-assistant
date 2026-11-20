import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createInitialProject, createEmptyProject, CH5_DRAFT } from '@/data/demoProject';
import { buildCoverPrompt, buildIllustrationPrompt, STORE_KEY, PROJECT_KEY_PREFIX, DEMO_PROJECT_ID, TONE_PRESETS, NARRATIVE_PRESETS } from '@/data/presets';
import type { Chapter, Project, ProjectStore, ProjectSummary, TranscriptLine } from '@/data/types';
import { cleanTranscript, type CleanLevel } from '@/lib/fillers';
import { useModelConfig } from '@/lib/modelConfig';
import { chatCompletionStream, generateImage, transcribeAudio, type ChatMessage, type GeneratedImage } from '@/lib/api';

type TranscribeState = 'idle' | 'running' | 'done';

interface WorkbenchContextValue {
  /** 当前激活的完整项目 */
  project: Project;
  /** 所有项目的轻量列表（含当前激活 id） */
  store: ProjectStore;
  summaries: ProjectSummary[];
  activeId: string;
  update: (patch: Partial<Project>) => void;
  setDialect: (dialect: string) => void;
  setNarrative: (id: string) => void;
  setTone: (id: string) => void;
  setLayout: (id: string) => void;
  setIllustrationStyle: (id: string) => void;
  setCoverField: (field: 'title' | 'subtitle' | 'author' | 'style', value: string) => void;
  cleanLevel: CleanLevel;
  setCleanLevel: (level: CleanLevel) => void;
  cleaned: ReturnType<typeof cleanTranscript>;
  visibleLines: number;
  transcribeState: TranscribeState;
  transcribeProgress: number;
  startTranscription: () => void;
  generatingChapter: string | null;
  generateChapter: (chapterId: string) => void;
  updateChapterBody: (chapterId: string, body: string) => void;
  generateCover: (styleOverride?: string) => void;
  generatingCover: boolean;
  generateIllustration: (chapterId: string, styleOverride?: string) => void;
  generatingIllustration: string | null;
  // ---- 多项目管理 ----
  switchProject: (id: string) => void;
  newProject: (title: string, subtitle?: string) => string;
  cloneDemoProject: () => string;
  deleteProject: (id: string) => void;
  renameProject: (id: string, title: string) => void;
  savedAt: string;
  /** 最近一次 API 调用错误（UI 展示用） */
  apiError: string | null;
  clearApiError: () => void;
}

const WorkbenchContext = createContext<WorkbenchContextValue | null>(null);

function projectKey(id: string) {
  return PROJECT_KEY_PREFIX + id;
}

function readStore(): ProjectStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as ProjectStore;
  } catch {
    // ignore
  }
  return { activeId: DEMO_PROJECT_ID, summaries: [] };
}

function writeStore(store: ProjectStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function readProject(id: string): Project | null {
  try {
    const raw = localStorage.getItem(projectKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
}

function writeProject(p: Project) {
  localStorage.setItem(projectKey(p.id), JSON.stringify(p));
}

function buildSummary(p: Project, isDemo = false): ProjectSummary {
  return {
    id: p.id,
    title: p.meta.title || p.cover.title || '未命名项目',
    subtitle: p.meta.subtitle || p.cover.subtitle || '',
    subject: p.meta.subject,
    coverTitle: p.cover.title,
    chapterCount: p.chapters.length,
    wordCount: p.wordCount,
    createdAt: p.meta.createdAt,
    updatedAt: new Date().toISOString(),
    isDemo,
  };
}

function countWords(text: string) {
  return text.replace(/\s/g, '').length;
}

function composeChapter(chapter: Chapter, base: string, toneId: string, narrativeId: string) {
  const tone = TONE_PRESETS.find((item) => item.id === toneId) ?? TONE_PRESETS[0];
  const narrative = NARRATIVE_PRESETS.find((item) => item.id === narrativeId) ?? NARRATIVE_PRESETS[0];
  const opening = tone.openings[chapter.index - 1] ?? '';
  const body = ` ${base}`.trim();

  if (narrativeId === 'epistolary') {
    return `孩子：\n\n${opening}\n\n${body}\n\n——你的爷爷，写于攀枝花`;
  }
  if (narrativeId === 'oral-history') {
    return `【根据访谈录音整理 · ${chapter.period}】\n\n${opening}\n\n${body}`;
  }
  if (narrativeId === 'thematic') {
    return `${opening}\n\n${body}\n\n（本章属于「${narrative.essence}」结构）`;
  }
  return `${opening}\n\n${body}`;
}

function genId(prefix = 'proj') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

/** 引导性初始化：用户第一次进来时，自动放一个 demo 和一个空白 */
function bootstrap(): { store: ProjectStore; project: Project } {
  const store = readStore();
  let summaries = [...store.summaries];

  // 1) 确保 demo 项目存在（内容是最新的 createInitialProject）
  let demoProject = readProject(DEMO_PROJECT_ID);
  if (!demoProject) {
    demoProject = createInitialProject();
    writeProject(demoProject);
  }
  if (!summaries.find((s) => s.id === DEMO_PROJECT_ID)) {
    summaries.unshift(buildSummary(demoProject, true));
  }

  // 2) 如果列表仍为空（极端情况），再补一个空白项目
  if (summaries.length === 0) {
    const emptyId = genId();
    const empty = createEmptyProject(emptyId, '未命名项目');
    writeProject(empty);
    summaries.push(buildSummary(empty));
  }

  // 3) 确保 activeId 有效
  let activeId = store.activeId;
  if (!summaries.find((s) => s.id === activeId)) {
    activeId = summaries[0].id;
  }

  writeStore({ activeId, summaries });

  // 4) 读激活项目内容，不存在就回退 demo
  let active = readProject(activeId);
  if (!active) {
    active = demoProject ?? createInitialProject();
    writeProject(active);
  }
  return { store: { activeId, summaries }, project: active };
}

export function WorkbenchProvider({ children }: { children: ReactNode }) {
  const { config, ready: modelReady } = useModelConfig();
  const boot = useMemo(bootstrap, []);
  const [project, setProject] = useState<Project>(boot.project);
  const [store, setStore] = useState<ProjectStore>(boot.store);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cleanLevel, setCleanLevel] = useState<CleanLevel>('standard');
  const [visibleLines, setVisibleLines] = useState(() => boot.project.transcript.length);
  const [transcribeState, setTranscribeState] = useState<TranscribeState>('done');
  const [transcribeProgress, setTranscribeProgress] = useState(100);
  const [generatingChapter, setGeneratingChapter] = useState<string | null>(null);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [generatingIllustration, setGeneratingIllustration] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState('刚刚');
  // 每个项目单独维护 baseBodies（章节流式生成的底稿）
  const baseBodies = useRef<Record<string, Record<string, string>>>({});
  const timers = useRef<number[]>([]);

  // 初始化当前项目的 baseBodies
  useEffect(() => {
    if (!baseBodies.current[project.id]) {
      baseBodies.current[project.id] = Object.fromEntries(
        project.chapters.map((c) => [c.id, c.id === 'ch5' && project.id === DEMO_PROJECT_ID ? CH5_DRAFT : c.body]),
      );
    }
  }, [project.id, project.chapters]);

  // 项目内容变化：写 localStorage + 更新 summary
  useEffect(() => {
    const id = project.id;
    const timeout = window.setTimeout(() => {
      const next = { ...project, wordCount: project.chapters.reduce((sum, c) => sum + countWords(c.body), 0), lastSaved: '刚刚' };
      writeProject(next);
      setProject(next);

      setStore((prev) => {
        const summaries = prev.summaries.map((s) => {
          if (s.id !== id) return s;
          const fresh = buildSummary(next, s.isDemo);
          return { ...s, ...fresh, updatedAt: new Date().toISOString() };
        });
        const newStore = { ...prev, summaries };
        writeStore(newStore);
        return newStore;
      });
      setSavedAt('刚刚');
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [project]);

  useEffect(() => {
    return () => timers.current.forEach((timer) => window.clearInterval(timer));
  }, []);

  // ---------- 多项目管理 ----------

  const switchProject = useCallback((id: string) => {
    if (id === project.id) return;
    const next = readProject(id);
    if (!next) return;
    setProject(next);
    setVisibleLines(next.transcript.length);
    setTranscribeState(next.transcript.length ? 'done' : 'idle');
    setTranscribeProgress(next.transcript.length ? 100 : 0);
    setSavedAt('刚刚');
    setStore((prev) => {
      const newStore = { ...prev, activeId: id };
      writeStore(newStore);
      return newStore;
    });
  }, [project.id]);

  const newProject = useCallback((title: string, subtitle?: string): string => {
    const id = genId();
    const fresh = createEmptyProject(id, title || '未命名项目', subtitle);
    writeProject(fresh);
    setStore((prev) => {
      const summaries = [buildSummary(fresh), ...prev.summaries];
      const newStore = { activeId: id, summaries };
      writeStore(newStore);
      return newStore;
    });
    setProject(fresh);
    setVisibleLines(0);
    setTranscribeState('idle');
    setTranscribeProgress(0);
    return id;
  }, []);

  const cloneDemoProject = useCallback((): string => {
    const demo = readProject(DEMO_PROJECT_ID) ?? createInitialProject();
    const id = genId();
    const cloned: Project = { ...structuredClone(demo), id };
    cloned.meta.title = `${cloned.meta.title}（副本）`;
    cloned.meta.createdAt = new Date().toISOString();
    cloned.lastSaved = '刚刚';
    writeProject(cloned);
    setStore((prev) => {
      const summaries = [buildSummary(cloned), ...prev.summaries];
      const newStore = { activeId: id, summaries };
      writeStore(newStore);
      return newStore;
    });
    setProject(cloned);
    setVisibleLines(cloned.transcript.length);
    setTranscribeState('done');
    setTranscribeProgress(100);
    return id;
  }, []);

  const deleteProject = useCallback((id: string) => {
    if (id === DEMO_PROJECT_ID) return; // 保护 demo
    localStorage.removeItem(projectKey(id));
    setStore((prev) => {
      const summaries = prev.summaries.filter((s) => s.id !== id);
      let activeId = prev.activeId;
      if (activeId === id) {
        activeId = summaries[0]?.id ?? DEMO_PROJECT_ID;
      }
      const newStore = { activeId, summaries };
      writeStore(newStore);
      // 激活项目变了就加载
      if (activeId !== prev.activeId) {
        const next = readProject(activeId) ?? createInitialProject();
        setProject(next);
        setVisibleLines(next.transcript.length);
        setTranscribeState(next.transcript.length ? 'done' : 'idle');
        setTranscribeProgress(next.transcript.length ? 100 : 0);
      }
      return newStore;
    });
  }, []);

  const renameProject = useCallback((id: string, title: string) => {
    if (!title.trim()) return;
    setStore((prev) => {
      const summaries = prev.summaries.map((s) => (s.id === id ? { ...s, title: title.trim() } : s));
      const newStore = { ...prev, summaries };
      writeStore(newStore);
      return newStore;
    });
    if (project.id === id) {
      setProject((prev) => ({
        ...prev,
        meta: { ...prev.meta, title: title.trim() },
        cover: { ...prev.cover, title: title.trim() },
      }));
    }
  }, [project.id]);

  // ---------- 原有单项目操作 ----------

  const update = useCallback((patch: Partial<Project>) => {
    setProject((prev) => ({ ...prev, ...patch }));
  }, []);

  const setDialect = useCallback((dialect: string) => update({ dialect }), [update]);
  const setNarrative = useCallback((narrative: string) => update({ narrative }), [update]);
  const setTone = useCallback((tone: string) => update({ tone }), [update]);
  const setLayout = useCallback((layout: string) => update({ layout }), [update]);
  const setIllustrationStyle = useCallback(
    (illustrationStyle: string) => update({ illustrationStyle }),
    [update],
  );

  const setCoverField = useCallback(
    (field: 'title' | 'subtitle' | 'author' | 'style', value: string) => {
      setProject((prev) => ({
        ...prev,
        cover: {
          ...prev.cover,
          [field]: value,
          ...(field === 'style' ? { status: 'idle' as const } : {}),
        },
        ...(field === 'title' ? { meta: { ...prev.meta, title: value } } : {}),
      }));
    },
    [],
  );

  const startTranscription = useCallback(() => {
    const total = project.transcript.length;
    if (total === 0) return;
    setTranscribeState('running');
    setTranscribeProgress(0);
    setVisibleLines(0);
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      const next = Math.min(total, Math.ceil((step / 26) * total));
      setVisibleLines(next);
      setTranscribeProgress(Math.round((next / total) * 100));
      if (next >= total) {
        window.clearInterval(timer);
        setTranscribeState('done');
        setTranscribeProgress(100);
        setProject((prev) => ({
          ...prev,
          cleaned: false,
          tracks: prev.tracks.map((track) => ({ ...track, status: 'transcribed' })),
        }));
      }
    }, 110);
    timers.current.push(timer);
  }, [project.transcript.length]);

  const updateChapterBody = useCallback((chapterId: string, body: string) => {
    setProject((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, body, words: countWords(body), status: body.trim() ? 'done' : 'empty' }
          : chapter,
      ),
    }));
  }, []);

  const generateChapter = useCallback(
    async (chapterId: string) => {
      const chapter = project.chapters.find((item) => item.id === chapterId);
      if (!chapter || generatingChapter) return;
      setGeneratingChapter(chapterId);

      // —— 真 API 路径 ——
      if (modelReady('llm')) {
        setApiError(null);
        setProject((prev) => ({
          ...prev,
          chapters: prev.chapters.map((item) =>
            item.id === chapterId ? { ...item, body: '', words: 0, status: 'draft' } : item,
          ),
        }));

        const messages: ChatMessage[] = [
          {
            role: 'system',
            content: `你是一位中文口述回忆录执笔者。讲述者信息：${project.meta.subject || '（未填写）'} · ${project.meta.subjectAge || '?'} 岁；整理者：${project.meta.host || '（未填写）'}。
请保持第一人称、克制、有温度。文风：${project.tone}。结构：${project.narrative}。只输出本章正文，不要标题、不要前言、不要注释。`,
          },
        ];

        // 拼上下文：本章大纲 + 已有相邻章节（若存在）
        const prev = project.chapters.find((c) => c.index === chapter.index - 1);
        const outlineContext = project.story?.outline?.find((o) => o.id === chapterId);
        const userContent = [
          `章节标题：${chapter.title}`,
          `章节时段：${chapter.period}`,
          `章节摘要：${chapter.summary}`,
          outlineContext?.keyEvents?.length ? `关键事件：${outlineContext.keyEvents.join('、')}` : '',
          prev?.body ? `前一章最后一段（供衔接）：\n${prev.body.slice(-200)}` : '',
          '',
          '请写本章的完整正文，800-1200 字。',
        ]
          .filter(Boolean)
          .join('\n');
        messages.push({ role: 'user', content: userContent });

        try {
          let streamed = '';
          const result = await chatCompletionStream(config, messages, {
            onDelta: (delta) => {
              streamed += delta;
              const body = streamed;
              setProject((prev) => ({
                ...prev,
                chapters: prev.chapters.map((item) =>
                  item.id === chapterId
                    ? { ...item, body, words: countWords(body), status: 'draft' as const }
                    : item,
                ),
              }));
            },
          });
          if (!result.ok) {
            setApiError(`LLM 调用失败：${result.error}`);
          }
          setProject((prev) => ({
            ...prev,
            chapters: prev.chapters.map((item) =>
              item.id === chapterId
                ? { ...item, status: 'done' as const, words: countWords(result.data ?? streamed) }
                : item,
            ),
          }));
        } catch (err) {
          setApiError(`LLM 调用异常：${(err as Error).message}`);
        }
        setGeneratingChapter(null);
        return;
      }

      // —— 离线模拟路径 ——
      const base = (baseBodies.current[project.id]?.[chapterId]) ?? chapter.body;
      const full = composeChapter(chapter, base, project.tone, project.narrative);
      let index = 0;
      setProject((prev) => ({
        ...prev,
        chapters: prev.chapters.map((item) =>
          item.id === chapterId ? { ...item, body: '', status: 'draft' } : item,
        ),
      }));
      const timer = window.setInterval(() => {
        index += 3;
        const slice = full.slice(0, index);
        setProject((prev) => ({
          ...prev,
          chapters: prev.chapters.map((item) =>
            item.id === chapterId
              ? { ...item, body: slice, words: countWords(slice), status: 'draft' as const }
              : item,
          ),
        }));
        if (index >= full.length) {
          window.clearInterval(timer);
          setGeneratingChapter(null);
          setProject((prev) => ({
            ...prev,
            chapters: prev.chapters.map((item) =>
              item.id === chapterId
                ? { ...item, body: full, words: countWords(full), status: 'done' as const }
                : item,
            ),
          }));
        }
      }, 26);
      timers.current.push(timer);
    },
    [project.chapters, project.tone, project.narrative, project.meta, project.story, generatingChapter, project.id, config, modelReady],
  );

  const generateCover = useCallback(async (styleOverride?: string) => {
    const styleId = styleOverride ?? project.cover.style;
    setGeneratingCover(true);
    setProject((prev) => ({ ...prev, cover: { ...prev.cover, style: styleId, status: 'loading', error: undefined } }));

    const prompt = buildCoverPrompt(styleId, project.cover.title, project.cover.subtitle);

    if (modelReady('image')) {
      setApiError(null);
      const size = styleId === 'woodcut' || styleId === 'watercolor' ? 'portrait_16_9' : 'portrait_16_9';
      const result = await generateImage(config, `${prompt}, cover edition ${Date.now() % 97}`, { size });
      if (result.ok) {
        setProject((prev) => ({
          ...prev,
          cover: {
            ...prev.cover,
            status: 'ready',
            imageUrl: result.data?.url,
            prompt,
            seed: (prev.cover.seed + 1) % 90,
          },
        }));
      } else {
        setApiError(`图像调用失败：${result.error}`);
        setProject((prev) => ({ ...prev, cover: { ...prev.cover, status: 'error', error: result.error } }));
      }
      setGeneratingCover(false);
      return;
    }

    // 离线模拟
    const timer = window.setTimeout(() => {
      setProject((prev) => ({
        ...prev,
        cover: { ...prev.cover, prompt, seed: (prev.cover.seed + 1) % 90, status: 'ready' },
      }));
      setGeneratingCover(false);
    }, 1400);
    timers.current.push(timer);
  }, [project.cover.style, project.cover.title, project.cover.subtitle, config, modelReady]);

  const generateIllustration = useCallback(
    async (chapterId: string, styleOverride?: string) => {
      const chapter = project.chapters.find((item) => item.id === chapterId);
      if (!chapter) return;
      const styleId = styleOverride ?? project.illustrationStyle;
      setGeneratingIllustration(chapterId);
      setProject((prev) => {
        const exists = prev.illustrations.some((item) => item.chapterId === chapterId);
        return {
          ...prev,
          illustrationStyle: styleId,
          illustrations: exists
            ? prev.illustrations.map((item) =>
                item.chapterId === chapterId ? { ...item, status: 'loading', style: styleId, error: undefined } : item,
              )
            : [
                ...prev.illustrations,
                {
                  id: `il-${chapterId}`,
                  chapterId,
                  chapterTitle: chapter.title,
                  prompt: '',
                  seed: chapter.index,
                  style: styleId,
                  status: 'loading',
                },
              ],
        };
      });

      const scene = `a scene from a Chinese memoir chapter titled "${chapter.title}": ${chapter.summary}`;
      const prompt = `${buildIllustrationPrompt(styleId, scene)}, edition ${Date.now() % 89}`;

      if (modelReady('image')) {
        setApiError(null);
        const result = await generateImage(config, prompt, { size: 'landscape_4_3' });
        if (result.ok) {
          setProject((prev) => ({
            ...prev,
            illustrations: prev.illustrations.map((item) =>
              item.chapterId === chapterId
                ? { ...item, status: 'ready', imageUrl: result.data?.url, prompt, seed: (item.seed + 1) % 90 }
                : item,
            ),
          }));
        } else {
          setApiError(`图像调用失败：${result.error}`);
          setProject((prev) => ({
            ...prev,
            illustrations: prev.illustrations.map((item) =>
              item.chapterId === chapterId ? { ...item, status: 'error', error: result.error } : item,
            ),
          }));
        }
        setGeneratingIllustration(null);
        return;
      }

      // 离线模拟
      const timer = window.setTimeout(() => {
        setProject((prev) => ({
          ...prev,
          illustrations: prev.illustrations.map((item) =>
            item.chapterId === chapterId
              ? { ...item, prompt, seed: (item.seed + 1) % 90, style: styleId, status: 'ready' }
              : item,
          ),
        }));
        setGeneratingIllustration(null);
      }, 1600);
      timers.current.push(timer);
    },
    [project.chapters, project.illustrationStyle, config, modelReady],
  );

  const cleaned = useMemo(
    () => cleanTranscript(project.transcript, cleanLevel),
    [project.transcript, cleanLevel],
  );

  const value: WorkbenchContextValue = {
    project,
    store,
    summaries: store.summaries,
    activeId: store.activeId,
    update,
    setDialect,
    setNarrative,
    setTone,
    setLayout,
    setIllustrationStyle,
    setCoverField,
    cleanLevel,
    setCleanLevel,
    cleaned,
    visibleLines,
    transcribeState,
    transcribeProgress,
    startTranscription,
    generatingChapter,
    generateChapter,
    updateChapterBody,
    generateCover,
    generatingCover,
    generateIllustration,
    generatingIllustration,
    switchProject,
    newProject,
    cloneDemoProject,
    deleteProject,
    renameProject,
    savedAt,
    apiError,
    clearApiError: () => setApiError(null),
  };

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
}

export function useWorkbench() {
  const context = useContext(WorkbenchContext);
  if (!context) throw new Error('useWorkbench must be used inside WorkbenchProvider');
  return context;
}
