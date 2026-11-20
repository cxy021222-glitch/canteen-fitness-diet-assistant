import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createInitialProject, CH5_DRAFT } from '@/data/demoProject';
import { buildCoverPrompt, buildIllustrationPrompt, STORAGE_KEY, TONE_PRESETS, NARRATIVE_PRESETS } from '@/data/presets';
import type { Chapter, Project } from '@/data/types';
import { cleanTranscript, type CleanLevel } from '@/lib/fillers';

type TranscribeState = 'idle' | 'running' | 'done';

interface WorkbenchContextValue {
  project: Project;
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
  resetDemo: () => void;
  savedAt: string;
}

const WorkbenchContext = createContext<WorkbenchContextValue | null>(null);

function loadProject(): Project {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProject();
    const parsed = JSON.parse(raw) as Project;
    const fallback = createInitialProject();
    return {
      ...fallback,
      ...parsed,
      meta: { ...fallback.meta, ...parsed.meta },
      cover: { ...fallback.cover, ...parsed.cover },
      chapters: parsed.chapters?.length ? parsed.chapters : fallback.chapters,
      illustrations: (parsed.illustrations?.length ? parsed.illustrations : fallback.illustrations).map((item, i) => ({
        seed: i + 1,
        ...item,
      })),
    };
  } catch {
    return createInitialProject();
  }
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

export function WorkbenchProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project>(() => loadProject());
  const [cleanLevel, setCleanLevel] = useState<CleanLevel>('standard');
  const [visibleLines, setVisibleLines] = useState(() => project.transcript.length);
  const [transcribeState, setTranscribeState] = useState<TranscribeState>('done');
  const [transcribeProgress, setTranscribeProgress] = useState(100);
  const [generatingChapter, setGeneratingChapter] = useState<string | null>(null);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [generatingIllustration, setGeneratingIllustration] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState('刚刚');
  const baseBodies = useRef<Record<string, string>>(
    Object.fromEntries(
      createInitialProject().chapters.map((chapter) => [chapter.id, chapter.id === 'ch5' ? CH5_DRAFT : chapter.body]),
    ),
  );
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const next = { ...project, wordCount: project.chapters.reduce((sum, c) => sum + countWords(c.body), 0), lastSaved: '刚刚' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSavedAt('刚刚');
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [project]);

  useEffect(() => {
    return () => timers.current.forEach((timer) => window.clearInterval(timer));
  }, []);

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
      }));
    },
    [],
  );

  const startTranscription = useCallback(() => {
    const total = project.transcript.length;
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
    (chapterId: string) => {
      const chapter = project.chapters.find((item) => item.id === chapterId);
      if (!chapter || generatingChapter) return;
      const base = baseBodies.current[chapterId] ?? chapter.body;
      const full = composeChapter(chapter, base, project.tone, project.narrative);
      setGeneratingChapter(chapterId);
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
    [project.chapters, project.tone, project.narrative, generatingChapter],
  );

  const generateCover = useCallback((styleOverride?: string) => {
    const styleId = styleOverride ?? project.cover.style;
    setGeneratingCover(true);
    setProject((prev) => ({ ...prev, cover: { ...prev.cover, style: styleId, status: 'loading' } }));
    const prompt = `${buildCoverPrompt(styleId, project.cover.title, project.cover.subtitle)}, edition ${Date.now() % 97}`;
    const timer = window.setTimeout(() => {
      setProject((prev) => ({
        ...prev,
        cover: { ...prev.cover, prompt, seed: (prev.cover.seed + 1) % 90, status: 'ready' },
      }));
      setGeneratingCover(false);
    }, 1400);
    timers.current.push(timer);
  }, [project.cover.style, project.cover.title, project.cover.subtitle]);

  const generateIllustration = useCallback(
    (chapterId: string, styleOverride?: string) => {
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
                item.chapterId === chapterId ? { ...item, status: 'loading', style: styleId } : item,
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
    [project.chapters, project.illustrationStyle],
  );

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    const fresh = createInitialProject();
    setProject(fresh);
    setVisibleLines(fresh.transcript.length);
    setTranscribeState('done');
    setTranscribeProgress(100);
    setSavedAt('刚刚');
    baseBodies.current = Object.fromEntries(
      fresh.chapters.map((chapter) => [chapter.id, chapter.id === 'ch5' ? CH5_DRAFT : chapter.body]),
    );
  }, []);

  const cleaned = useMemo(
    () => cleanTranscript(project.transcript, cleanLevel),
    [project.transcript, cleanLevel],
  );

  const value: WorkbenchContextValue = {
    project,
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
    resetDemo,
    savedAt,
  };

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
}

export function useWorkbench() {
  const context = useContext(WorkbenchContext);
  if (!context) throw new Error('useWorkbench must be used inside WorkbenchProvider');
  return context;
}
