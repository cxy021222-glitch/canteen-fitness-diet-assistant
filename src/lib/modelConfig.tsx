/** 模型配置 Context：厂商 → 模型两级选择 + 按厂商保存 API 凭据 + 连通性测试 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ModelConfig, ModelCreds, ModelKind, VendorEntry } from '@/data/models';
import {
  DEFAULT_MODEL_CONFIG,
  MODEL_STORAGE_KEY,
  VENDORS,
  findModel,
  findVendor,
} from '@/data/models';
import { testConnection, type ConnResult } from '@/lib/api';

interface ModelConfigContextValue {
  config: ModelConfig;
  /** 某类的可选厂商 */
  vendorsOf: (kind: ModelKind) => VendorEntry[];
  /** 当前厂商对象 */
  vendorOf: (kind: ModelKind) => VendorEntry;
  /** 当前模型对象 */
  modelOf: (kind: ModelKind) => ReturnType<typeof findModel>;
  /** 当前厂商的凭据 */
  credsOf: (kind: ModelKind) => ModelCreds;
  setVendor: (kind: ModelKind, vendorId: string) => void;
  setModel: (kind: ModelKind, modelId: string) => void;
  setCreds: (kind: ModelKind, patch: Partial<ModelCreds>) => void;
  toggleOffline: (v: boolean) => void;
  /** 某类是否已配置好可调用 */
  ready: (kind: ModelKind) => boolean;
  labelOf: (kind: ModelKind) => string;
  /** 测试某类当前厂商的连通性 */
  probe: (kind: ModelKind) => Promise<ConnResult>;
  /** 清空某厂商的 Key */
  clearCreds: (vendorId: string) => void;
}

const ModelConfigContext = createContext<ModelConfigContextValue | null>(null);

function loadConfig(): ModelConfig {
  try {
    const raw = localStorage.getItem(MODEL_STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_MODEL_CONFIG);
    const parsed = JSON.parse(raw) as Partial<ModelConfig>;
    // 迁移旧结构（v1: config[kind].creds）
    const legacy = parsed as unknown as Record<string, { creds?: ModelCreds }>;
    const creds: Record<string, ModelCreds> = { ...(parsed.creds ?? {}) };
    for (const kind of ['asr', 'llm', 'image'] as ModelKind[]) {
      const c = legacy[kind]?.creds;
      const v = parsed[kind]?.vendorId;
      if (c?.apiKey && v && !creds[v]) creds[v] = c;
    }
    return {
      asr: { ...DEFAULT_MODEL_CONFIG.asr, ...parsed.asr },
      llm: { ...DEFAULT_MODEL_CONFIG.llm, ...parsed.llm },
      image: { ...DEFAULT_MODEL_CONFIG.image, ...parsed.image },
      creds,
      offlineMode: parsed.offlineMode ?? true,
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

  const vendorsOf = useCallback((kind: ModelKind) => VENDORS[kind], []);

  const vendorOf = useCallback(
    (kind: ModelKind) => {
      const v = findVendor(kind, config[kind].vendorId);
      return v ?? VENDORS[kind][0];
    },
    [config],
  );

  const modelOf = useCallback((kind: ModelKind) => findModel(config[kind].modelId), [config]);

  const credsOf = useCallback(
    (kind: ModelKind): ModelCreds => config.creds[config[kind].vendorId] ?? { apiKey: '' },
    [config],
  );

  /** 切厂商：自动落到该厂商的第一个模型 */
  const setVendor = useCallback((kind: ModelKind, vendorId: string) => {
    const vendor = VENDORS[kind].find((v) => v.id === vendorId);
    if (!vendor) return;
    const first = vendor.models[0];
    setConfig((prev) => ({
      ...prev,
      [kind]: { vendorId, modelId: `${vendorId}::${first.id}` },
    }));
  }, []);

  const setModel = useCallback((kind: ModelKind, modelId: string) => {
    const m = findModel(modelId);
    if (!m) return;
    setConfig((prev) => ({ ...prev, [kind]: { vendorId: m.vendorId, modelId } }));
  }, []);

  const setCreds = useCallback((kind: ModelKind, patch: Partial<ModelCreds>) => {
    setConfig((prev) => {
      const vid = prev[kind].vendorId;
      const current = prev.creds[vid] ?? { apiKey: '' };
      return { ...prev, creds: { ...prev.creds, [vid]: { ...current, ...patch } } };
    });
  }, []);

  const clearCreds = useCallback((vendorId: string) => {
    setConfig((prev) => {
      const next = { ...prev.creds };
      delete next[vendorId];
      return { ...prev, creds: next };
    });
  }, []);

  const toggleOffline = useCallback((v: boolean) => {
    setConfig((prev) => ({ ...prev, offlineMode: v }));
  }, []);

  const ready = useCallback(
    (kind: ModelKind) => !config.offlineMode && !!config.creds[config[kind].vendorId]?.apiKey,
    [config],
  );

  const labelOf = useCallback(
    (kind: ModelKind) => {
      const m = findModel(config[kind].modelId);
      return m ? `${m.vendor} · ${m.name}` : '未选择';
    },
    [config],
  );

  const probe = useCallback(
    (kind: ModelKind): Promise<ConnResult> => testConnection(config, config[kind].vendorId, kind),
    [config],
  );

  const value = useMemo<ModelConfigContextValue>(
    () => ({ config, vendorsOf, vendorOf, modelOf, credsOf, setVendor, setModel, setCreds, toggleOffline, ready, labelOf, probe, clearCreds }),
    [config, vendorsOf, vendorOf, modelOf, credsOf, setVendor, setModel, setCreds, toggleOffline, ready, labelOf, probe, clearCreds],
  );

  return <ModelConfigContext.Provider value={value}>{children}</ModelConfigContext.Provider>;
}

export function useModelConfig() {
  const ctx = useContext(ModelConfigContext);
  if (!ctx) throw new Error('useModelConfig must be used inside ModelConfigProvider');
  return ctx;
}
