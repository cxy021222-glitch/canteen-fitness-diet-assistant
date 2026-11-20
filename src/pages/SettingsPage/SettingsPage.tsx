import { useState } from 'react';
import { Settings2, AudioLines, Feather, ImageIcon, Sparkles, CheckCircle2, AlertCircle, Plug, Shield, RotateCcw } from 'lucide-react';
import { PageHead, Panel, Chip, ActionButton } from '@/components/ui-kit';
import { useModelConfig, listModels } from '@/lib/modelConfig';
import { pingModel } from '@/lib/api';
import type { ModelEntry } from '@/data/models';

type Tab = 'asr' | 'llm' | 'image';

const TABS: { id: Tab; label: string; sub: string; icon: typeof AudioLines }[] = [
  { id: 'asr', label: '语音转写', sub: 'ASR · 支持方言', icon: AudioLines },
  { id: 'llm', label: '文本生成', sub: 'LLM · 流式章节撰写', icon: Feather },
  { id: 'image', label: '图像生成', sub: '文生图 · 封面 / 插图', icon: ImageIcon },
];

const KIND_LABEL: Record<Tab, string> = { asr: '语音 ASR', llm: '文本 LLM', image: '图像生成' };

export default function SettingsPage() {
  const { config, setModel, setCreds, toggleOffline, ready, labelOf } = useModelConfig();
  const [tab, setTab] = useState<Tab>('llm');
  const [pingState, setPingState] = useState<Partial<Record<Tab, string>>>({});
  const [pingLoading, setPingLoading] = useState<Partial<Record<Tab, boolean>>>({});

  const current = config[tab];
  const models = listModels(tab);
  const selected = models.find((m) => m.id === current.modelId) ?? models[0];

  const onPing = async (kind: Tab) => {
    setPingLoading((p) => ({ ...p, [kind]: true }));
    setPingState((p) => ({ ...p, [kind]: undefined }));
    const res = await pingModel(config, kind);
    setPingLoading((p) => ({ ...p, [kind]: false }));
    setPingState((p) => ({ ...p, [kind]: res.ok ? `✅ ${res.data}` : `❌ ${res.error}` }));
  };

  const onReset = () => {
    if (!confirm('清空所有 API Key 并切回离线演示？')) return;
    for (const k of ['asr', 'llm', 'image'] as Tab[]) setCreds(k, { apiKey: '', endpoint: undefined });
    toggleOffline(true);
    setPingState({});
  };

  return (
    <div className="space-y-6">
      <PageHead
        eyebrow="MODEL SETTINGS"
        title="模型设置"
        description="选模型 · 填 API · 切中文大模型"
        actions={<Settings2 className="size-4 text-muted-foreground" />}
      />

      {/* 顶部：总开关 + 三方就绪状态 */}
      <div className="grid gap-3 lg:grid-cols-4">
        <Panel title="离线演示模式" eyebrow="OFFLINE">
          <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
            开启时，工作台用内置模拟内容演示完整流程，不调用任何 API。关闭后才会尝试真模型。
          </p>
          <button
            onClick={() => toggleOffline(!config.offlineMode)}
            className={
              'mt-3 inline-flex items-center gap-2 rounded-[1px] border px-3 py-2 text-[11px] transition-colors ' +
              (config.offlineMode
                ? 'border-border bg-card text-foreground hover:bg-border/40'
                : 'border-seal bg-seal text-white hover:opacity-90')
            }
          >
            {config.offlineMode ? <Shield className="size-3.5" /> : <Plug className="size-3.5" />}
            {config.offlineMode ? '开启 · 离线演示' : '关闭 · 使用真实 API'}
          </button>
          <button
            onClick={onReset}
            className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-seal"
          >
            <RotateCcw className="size-3" /> 全部重置
          </button>
        </Panel>

        {(['asr', 'llm', 'image'] as Tab[]).map((kind) => {
          const ok = ready(kind);
          return (
            <Panel key={kind} title={KIND_LABEL[kind]} eyebrow={kind.toUpperCase()}>
              <div className="flex items-center gap-2">
                {ok ? (
                  <CheckCircle2 className="size-4 text-olive" />
                ) : (
                  <AlertCircle className="size-4 text-muted-foreground" />
                )}
                <span className="text-[12px]">
                  {ok ? 'API 已就绪' : config.offlineMode ? '离线演示中' : '待配置 API'}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground truncate">{labelOf(kind)}</div>
            </Panel>
          );
        })}
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              'relative inline-flex items-center gap-2 px-4 py-2 text-[12px] transition-colors ' +
              (tab === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')
            }
          >
            <t.icon className="size-3.5" />
            <span className="font-medium">{t.label}</span>
            <span className="hidden text-[10px] text-muted-foreground sm:inline">{t.sub}</span>
            {tab === t.id && <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-seal" />}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        {/* 左侧：模型选择 */}
        <Panel title="选择模型" eyebrow="MODEL">
          <div className="space-y-1.5">
            {models.map((m: ModelEntry) => {
              const sel = current.modelId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setModel(tab, m.id)}
                  className={
                    'block w-full rounded-[1px] border px-3 py-2 text-left transition-colors ' +
                    (sel ? 'border-seal bg-seal/[0.07]' : 'border-border hover:bg-card')
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className={'text-[12px] font-medium ' + (sel ? 'text-seal' : 'text-foreground')}>
                      {m.vendor} · {m.name}
                    </span>
                    {sel && <span className="label text-[9px] text-seal">当前</span>}
                  </div>
                  {m.modelParam && (
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{m.modelParam}</div>
                  )}
                  {m.dialects?.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.dialects.slice(0, 6).map((d) => (
                        <span key={d} className="rounded-sm border border-border/70 px-1.5 py-0 text-[9px] text-muted-foreground">
                          {d}
                        </span>
                      ))}
                      {m.dialects.length > 6 && (
                        <span className="rounded-sm border border-border/70 px-1.5 py-0 text-[9px] text-muted-foreground">
                          +{m.dialects.length - 6}
                        </span>
                      )}
                    </div>
                  ) : null}
                  {m.note && <div className="mt-1 text-[10px] text-muted-foreground">{m.note}</div>}
                </button>
              );
            })}
          </div>
        </Panel>

        {/* 右侧：API 配置 + 测试 */}
        <div className="space-y-4">
          <Panel title="API 配置" eyebrow="CREDENTIALS">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label block pb-1 text-[10px] tracking-[0.18em] text-muted-foreground">
                  API Key（sk-... 或 Bearer Token）
                </label>
                <input
                  type="password"
                  value={current.creds.apiKey}
                  onChange={(e) => setCreds(tab, { apiKey: e.target.value })}
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                  className="w-full rounded-[1px] border border-border bg-card px-3 py-2 font-mono text-[12px] focus:border-seal focus:outline-none"
                />
              </div>

              {(selected?.modelParam?.startsWith('ep-') || selected?.id === 'doubao-pro') && (
                <div>
                  <label className="label block pb-1 text-[10px] tracking-[0.18em] text-muted-foreground">
                    火山方舟推理接入点 ID
                  </label>
                  <input
                    value={current.creds.extra?.model ?? ''}
                    onChange={(e) =>
                      setCreds(tab, { extra: { ...current.creds.extra, model: e.target.value } })
                    }
                    placeholder="ep-2025xxxx-xxxxx"
                    className="w-full rounded-[1px] border border-border bg-card px-3 py-2 font-mono text-[12px] focus:border-seal focus:outline-none"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="label block pb-1 text-[10px] tracking-[0.18em] text-muted-foreground">
                  Base URL（可覆盖默认值）
                </label>
                <input
                  value={current.creds.endpoint ?? selected.defaultEndpoint}
                  onChange={(e) => setCreds(tab, { endpoint: e.target.value })}
                  placeholder={selected.defaultEndpoint}
                  className="w-full rounded-[1px] border border-border bg-card px-3 py-2 font-mono text-[12px] focus:border-seal focus:outline-none"
                />
                <div className="mt-1 text-[10px] text-muted-foreground">
                  默认：<span className="font-mono">{selected.defaultEndpoint}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
              <ActionButton
                variant={ready(tab) ? 'primary' : 'outline'}
                onClick={() => onPing(tab)}
                disabled={!!pingLoading[tab]}
                loading={!!pingLoading[tab]}
              >
                <Sparkles className="size-3.5" />
                {pingLoading[tab] ? '测试中…' : '测试连通性'}
              </ActionButton>
              <div className="text-[11px] text-muted-foreground">
                {pingState[tab] ?? '输入 API Key 后点一下测试是否能调通'}
              </div>
            </div>
          </Panel>

          <Panel title="模型能力" eyebrow="CAPABILITY">
            <div className="flex flex-wrap gap-2">
              <Chip className="border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                OpenAI Chat 兼容: {selected.openaiCompatible ? '是' : '否'}
              </Chip>
              <Chip className="border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                默认模型: <span className="font-mono">{selected.modelParam ?? '—'}</span>
              </Chip>
              {selected.dialects?.length && (
                <Chip className="border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  方言: {selected.dialects.slice(0, 6).join('、')}
                </Chip>
              )}
              <Chip className="border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                端点: <span className="font-mono">{selected.defaultEndpoint}</span>
              </Chip>
            </div>
          </Panel>

          <Panel title="说明" eyebrow="NOTE">
            <ul className="space-y-1 text-[12px] text-muted-foreground leading-relaxed list-disc pl-4">
              <li>API Key 仅存浏览器 localStorage，不上传服务器；清空浏览器数据即删除。</li>
              <li>未开启「离线演示」且已填 API Key 时，章节生成、封面/插图、转写均会调用真实模型；未填 Key 自动降级为本地模拟。</li>
              <li>生成的回忆录内容需经讲述者与家属确认后方可付印。</li>
              <li>如遇 CORS 拦截（浏览器报错），请换用 SiliconFlow / 智谱 / 阿里 DashScope 等开放跨域的 API 代理。</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
