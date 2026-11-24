import { useState } from 'react';
import {
  Settings2,
  AudioLines,
  Feather,
  ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plug,
  Shield,
  RotateCcw,
  ExternalLink,
  Loader2,
  ScanSearch,
} from 'lucide-react';
import { PageHead, Panel, ActionButton } from '@/components/ui-kit';
import { useModelConfig } from '@/lib/modelConfig';
import type { ConnResult } from '@/lib/api';
import type { ModelKind } from '@/data/models';

const TABS: { id: ModelKind; label: string; sub: string; icon: typeof AudioLines }[] = [
  { id: 'asr', label: '语音转写', sub: 'ASR · 支持方言', icon: AudioLines },
  { id: 'llm', label: '文本生成', sub: 'LLM · 流式撰写', icon: Feather },
  { id: 'image', label: '图像生成', sub: '文生图 · 封面插图', icon: ImageIcon },
];

const KIND_LABEL: Record<ModelKind, string> = { asr: '语音 ASR', llm: '文本 LLM', image: '图像生成' };

function StageBar({ result }: { result?: ConnResult }) {
  if (!result) return null;
  const steps = [
    { key: 'network', label: '网络可达', ok: result.reachable },
    { key: 'auth', label: '鉴权通过', ok: result.authorized },
    { key: 'done', label: '接口可用', ok: result.ok },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div
              className={
                'flex items-center gap-1 rounded-[1px] border px-2 py-1 text-[10px] ' +
                (s.ok ? 'border-olive/40 bg-olive/10 text-olive' : 'border-border bg-card text-muted-foreground')
              }
            >
              {s.ok ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
              {s.label}
            </div>
            {i < steps.length - 1 && <span className="text-[10px] text-muted-foreground">→</span>}
          </div>
        ))}
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">{result.latencyMs}ms</span>
      </div>
      <p className={'text-[11px] leading-relaxed ' + (result.ok ? 'text-olive' : 'text-seal')}>{result.message}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { config, vendorsOf, vendorOf, modelOf, credsOf, setVendor, setModel, setCreds, toggleOffline, ready, labelOf, probe, clearCreds } =
    useModelConfig();
  const [tab, setTab] = useState<ModelKind>('llm');
  const [results, setResults] = useState<Partial<Record<ModelKind, ConnResult>>>({});
  const [loading, setLoading] = useState<Partial<Record<ModelKind, boolean>>>({});
  const [batchLoading, setBatchLoading] = useState(false);

  const vendors = vendorsOf(tab);
  const vendor = vendorOf(tab);
  const model = modelOf(tab);
  const creds = credsOf(tab);

  const runProbe = async (kind: ModelKind) => {
    setLoading((p) => ({ ...p, [kind]: true }));
    const r = await probe(kind);
    setLoading((p) => ({ ...p, [kind]: false }));
    setResults((p) => ({ ...p, [kind]: r }));
  };

  const runAll = async () => {
    setBatchLoading(true);
    for (const kind of ['asr', 'llm', 'image'] as ModelKind[]) {
      setLoading((p) => ({ ...p, [kind]: true }));
      const r = await probe(kind);
      setResults((p) => ({ ...p, [kind]: r }));
      setLoading((p) => ({ ...p, [kind]: false }));
    }
    setBatchLoading(false);
  };

  const onReset = () => {
    if (!confirm('清空所有厂商的 API Key 并切回离线演示？')) return;
    for (const v of [...vendorsOf('asr'), ...vendorsOf('llm'), ...vendorsOf('image')]) clearCreds(v.id);
    toggleOffline(true);
    setResults({});
  };

  return (
    <div className="space-y-6">
      <PageHead
        eyebrow="MODEL SETTINGS"
        title="模型设置"
        description="每家厂商可选多个模型 · 填 API Key · 三段式连通性检测"
        actions={
          <ActionButton variant="outline" onClick={runAll} disabled={batchLoading} loading={batchLoading}>
            <ScanSearch className="size-3.5" />
            {batchLoading ? '全量测试中…' : '全部测试'}
          </ActionButton>
        }
      />

      {/* 三类就绪状态 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Panel title="离线演示模式" eyebrow="OFFLINE">
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            开启后用内置内容演示全流程；关闭并填好 Key 才会调真实模型。
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
            {config.offlineMode ? '开启 · 离线演示' : '关闭 · 真实 API'}
          </button>
          <button onClick={onReset} className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-seal">
            <RotateCcw className="size-3" /> 全部重置
          </button>
        </Panel>

        {(['asr', 'llm', 'image'] as ModelKind[]).map((kind) => {
          const ok = ready(kind);
          const r = results[kind];
          return (
            <Panel key={kind} title={KIND_LABEL[kind]} eyebrow={kind.toUpperCase()}>
              <div className="flex items-center gap-2">
                {ok ? <CheckCircle2 className="size-4 text-olive" /> : <AlertCircle className="size-4 text-muted-foreground" />}
                <span className="text-[12px]">
                  {ok ? 'API 已就绪' : config.offlineMode ? '离线演示中' : '待配置 API'}
                </span>
              </div>
              <div className="mt-1 truncate text-[11px] text-muted-foreground">{labelOf(kind)}</div>
              {r ? (
                <div className={'mt-2 flex items-center gap-1 text-[10px] ' + (r.ok ? 'text-olive' : 'text-seal')}>
                  {r.ok ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                  {r.stage === 'network' ? '网络不通' : r.stage === 'auth' ? '鉴权未通过' : '通过'} · {r.latencyMs}ms
                </div>
              ) : (
                <button onClick={() => runProbe(kind)} className="mt-2 inline-flex items-center gap-1 text-[10px] text-seal hover:underline">
                  <ScanSearch className="size-3" /> 测试这项
                </button>
              )}
            </Panel>
          );
        })}
      </div>

      {/* Tab */}
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

      <div className="grid gap-4 xl:grid-cols-[220px_1fr_340px]">
        {/* 厂商 */}
        <Panel title="厂商" eyebrow="VENDOR">
          <div className="space-y-1">
            {vendors.map((v) => {
              const sel = vendor.id === v.id;
              const hasCreds = !!config.creds[v.id]?.apiKey;
              return (
                <button
                  key={v.id}
                  onClick={() => setVendor(tab, v.id)}
                  className={
                    'flex w-full items-center gap-2 rounded-[1px] border px-2.5 py-2 text-left text-[11px] transition-colors ' +
                    (sel ? 'border-seal bg-seal/[0.07] text-seal' : 'border-border text-foreground hover:bg-card')
                  }
                >
                  <span className="min-w-0 flex-1 truncate">{v.shortName}</span>
                  <span className="shrink-0 text-[9px] text-muted-foreground">{v.models.length} 个</span>
                  {hasCreds && <span className="size-1.5 shrink-0 rounded-full bg-olive" title="已填 Key" />}
                </button>
              );
            })}
          </div>
        </Panel>

        {/* 模型列表 */}
        <Panel title={`${vendor.name} · 可选模型`} eyebrow="MODELS">
          <div className="space-y-1.5">
            {vendor.models.map((m) => {
              const gid = `${vendor.id}::${m.id}`;
              const sel = config[tab].modelId === gid;
              return (
                <button
                  key={m.id}
                  onClick={() => setModel(tab, gid)}
                  className={
                    'block w-full rounded-[1px] border px-3 py-2 text-left transition-colors ' +
                    (sel ? 'border-seal bg-seal/[0.06]' : 'border-border hover:bg-card')
                  }
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={'text-[12px] font-medium ' + (sel ? 'text-seal' : 'text-foreground')}>{m.name}</span>
                    {sel && <span className="label text-[9px] text-seal">当前</span>}
                    {m.contextWindow && (
                      <span className="rounded-sm border border-border/70 px-1.5 text-[9px] text-muted-foreground">
                        {m.contextWindow}
                      </span>
                    )}
                    {m.pricing && <span className="text-[9px] text-muted-foreground">{m.pricing}</span>}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{m.modelParam}</div>
                  {m.dialects?.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.dialects.slice(0, 7).map((d) => (
                        <span key={d} className="rounded-sm border border-border/70 px-1.5 text-[9px] text-muted-foreground">
                          {d}
                        </span>
                      ))}
                      {m.dialects.length > 7 && (
                        <span className="rounded-sm border border-border/70 px-1.5 text-[9px] text-muted-foreground">
                          +{m.dialects.length - 7}
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

        {/* 凭据 + 测试 */}
        <div className="space-y-4">
          <Panel title="API 配置" eyebrow={vendor.shortName}>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="label text-[10px] tracking-[0.18em] text-muted-foreground">API Key</label>
                  {vendor.keyUrl && (
                    <a
                      href={vendor.keyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 text-[9px] text-seal hover:underline"
                    >
                      去申请 <ExternalLink className="size-2.5" />
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  value={creds.apiKey}
                  onChange={(e) => setCreds(tab, { apiKey: e.target.value })}
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                  className="mt-1 w-full rounded-[1px] border border-border bg-card px-2.5 py-1.5 font-mono text-[11px] focus:border-seal focus:outline-none"
                />
              </div>

              {(vendor.id === 'doubao' || vendor.id === 'doubao-image' || model?.modelParam?.startsWith('ep-')) && (
                <div>
                  <label className="label text-[10px] tracking-[0.18em] text-muted-foreground">推理接入点 ID（ep-...）</label>
                  <input
                    value={creds.extra?.model ?? ''}
                    onChange={(e) => setCreds(tab, { extra: { ...creds.extra, model: e.target.value } })}
                    placeholder="ep-2025xxxx-xxxxx"
                    className="mt-1 w-full rounded-[1px] border border-border bg-card px-2.5 py-1.5 font-mono text-[11px] focus:border-seal focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="label text-[10px] tracking-[0.18em] text-muted-foreground">Base URL</label>
                <input
                  value={creds.endpoint ?? vendor.defaultEndpoint}
                  onChange={(e) => setCreds(tab, { endpoint: e.target.value })}
                  placeholder={vendor.defaultEndpoint}
                  className="mt-1 w-full rounded-[1px] border border-border bg-card px-2.5 py-1.5 font-mono text-[10px] focus:border-seal focus:outline-none"
                />
                <div className="mt-1 truncate text-[9px] text-muted-foreground">默认：{vendor.defaultEndpoint}</div>
              </div>

              <ActionButton
                variant={ready(tab) ? 'primary' : 'outline'}
                onClick={() => runProbe(tab)}
                disabled={!!loading[tab]}
                className="w-full justify-center"
              >
                {loading[tab] ? <Loader2 className="size-3.5 animate-spin" /> : <ScanSearch className="size-3.5" />}
                {loading[tab] ? '检测中…' : '测试连通性'}
              </ActionButton>
            </div>
          </Panel>

          <Panel title="检测结果" eyebrow="DIAGNOSTICS">
            {results[tab] ? (
              <StageBar result={results[tab]} />
            ) : (
              <p className="text-[11px] text-muted-foreground">
                点「测试连通性」分三段检测：先看网络能否到达，再看 Key 是否有效，最后确认接口可用。
                未填 Key 时只能测出网络是否可达。
              </p>
            )}
          </Panel>

          <Panel title="模型能力" eyebrow="CAPABILITY">
            <div className="space-y-1.5 text-[10px] text-muted-foreground">
              <div>厂商：{vendor.name}</div>
              <div>模型：{model?.name ?? '—'}</div>
              <div className="font-mono">参数：{model?.modelParam ?? '—'}</div>
              <div>OpenAI 兼容：{vendor.openaiCompatible ? '是' : '否（需专用签名）'}</div>
              {model?.pricing && <div>价格：{model.pricing}</div>}
            </div>
          </Panel>

          <Panel title="说明" eyebrow="NOTE">
            <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-muted-foreground">
              <li>API Key 只存浏览器 localStorage，不上传服务器。</li>
              <li>每个厂商的 Key 独立保存，切换厂商不会丢失。</li>
              <li>浏览器直接调用会受 CORS 限制；若被拦，请用 SiliconFlow / 阿里百炼 这类开放跨域的端点。</li>
              <li>生成内容需经讲述者与家属确认后方可付印。</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
