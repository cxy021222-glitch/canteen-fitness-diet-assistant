/** 模型配置 Context：选择模型 + 填 API key + 覆盖 endpoint */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ModelConfig, ModelCreds } from '@/data/models';
import { DEFAULT_MODEL_CONFIG, MODEL_STORAGE_KEY, ALL_MODELS, findModel } from '@/data/models';

interface ModelConfigContextValue {
  config: ModelConfig;
  setModel: (kind: 'asr' | 'llm' | 'image', modelId: string) => void;
  setCreds: (kind: 'asr' | 'llm' | 'image', creds: Partial<ModelCreds>) => void;
  toggleOffline: (v: boolean) => void;
  /** 某个维度是否配好了可调用的 API */
  ready: (kind: 'asr' | 'llm' | 'image') => boolean;
  /** 友好的模型标签："厂商 · 展示名" */
  labelOf: (kind: 'asr' | 'llm' | 'image') => string;
}

const ModelConfigContext = createContext<ModelConfigContextValue | null>(null);

function loadConfig(): ModelConfig {
  try {
    const raw = localStorage.getItem(MODEL_STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_MODEL_CONFIG);
    const parsed = JSON.parse(raw) as ModelConfig;
    return {
      ...DEFAULT_MODEL_CONFIG,
      ...parsed,
      asr: { ...DEFAULT_MODEL_CONFIG.asr, ...parsed.asr, creds: { ...DEFAULT_MODEL_CONFIG.asr.creds, ...parsed.asr.creds } },
      llm: { ...DEFAULT_MODEL_CONFIG.llm, ...parsed.llm, creds: { ...DEFAULT_MODEL_CONFIG.llm.creds, ...parsed.llm.creds } },
      image: { ...DEFAULT_MODEL_CONFIG.image, ...parsed.image, creds: { ...DEFAULT_MODEL_CONFIG.image.creds, ...parsed.image.creds } },
    };
  } catch {
    return structuredClone(DEFAULT_MODEL_CONFIG);
  }
}

export function ModelConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ModelConfig>(loadConfig);

  useEffect(() => {
    localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const setModel = useCallback((kind: 'asr' | 'llm' | 'image', modelId: string) => {
    setConfig((prev) => ({ ...prev, [kind]: { ...prev[kind], modelId } }));
  }, []);

  const setCreds = useCallback((kind: 'asr' | 'llm' | 'image', creds: Partial<ModelCreds>) => {
    setConfig((prev) => ({
      ...prev,
      [kind]: { ...prev[kind], creds: { ...prev[kind].creds, ...creds } },
    }));
  }, []);

  const toggleOffline = useCallback((v: boolean) => {
    setConfig((prev) => ({ ...prev, offlineMode: v }));
  }, []);

  const ready = useCallback(
    (kind: 'asr' | 'llm' | 'image') => !config.offlineMode && !!config[kind].creds.apiKey,
    [config],
  );

  const labelOf = useCallback(
    (kind: 'asr' | 'llm' | 'image') => {
      const m = findModel(config[kind].modelId);
      return m ? `${m.vendor} · ${m.name}` : '未选择';
    },
    [config],
  );

  const value = useMemo<ModelConfigContextValue>(
    () => ({ config, setModel, setCreds, toggleOffline, ready, labelOf }),
    [config, setModel, setCreds, toggleOffline, ready, labelOf],
  );

  return <ModelConfigContext.Provider value={value}>{children}</ModelConfigContext.Provider>;
}

export function useModelConfig() {
  const ctx = useContext(ModelConfigContext);
  if (!ctx) throw new Error('useModelConfig must be used inside ModelConfigProvider');
  return ctx;
}

/** 列出某个维度可用的模型供下拉 */
export function listModels(kind: 'asr' | 'llm' | 'image') {
  return ALL_MODELS.filter((m) => m.kind === kind);
}
