/**
 * 国内大模型统一调用客户端。
 *
 * - 文本 / 图像 / ASR 大部分走 OpenAI 兼容 REST；
 * - 凭据按「厂商」维度保存（config.creds[vendorId]），切换模型不丢 Key；
 * - testConnection 分三段探测：网络可达 → 鉴权通过 → 业务可用。
 */

import type { ModelConfig, ModelCreds, ModelKind } from '@/data/models';
import { findModel } from '@/data/models';

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** 连通性探测结果 */
export interface ConnResult {
  ok: boolean;
  /** 网络（DNS/TCP/TLS）是否可达 */
  reachable: boolean;
  /** 鉴权是否通过 */
  authorized: boolean;
  /** 耗时（毫秒） */
  latencyMs: number;
  /** 结论文案 */
  message: string;
  /** 卡在哪一段 */
  stage: 'network' | 'auth' | 'done';
}

function credsOf(config: ModelConfig, vendorId: string): ModelCreds {
  return config.creds[vendorId] ?? { apiKey: '' };
}

// ========== 文本 LLM ==========

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatCompletionStream(
  config: ModelConfig,
  messages: ChatMessage[],
  opts: { onDelta?: (delta: string) => void; temperature?: number; signal?: AbortSignal } = {},
): Promise<ApiResult<string>> {
  if (config.offlineMode) return { ok: false, error: 'offline' };
  const m = findModel(config.llm.modelId);
  if (!m) return { ok: false, error: '未选择模型' };
  const creds = credsOf(config, m.vendorId);
  if (!creds.apiKey) return { ok: false, error: '未填写 API Key' };

  const endpoint = (creds.endpoint || m.defaultEndpoint).replace(/\/$/, '');
  // 豆包/火山方舟需要把推理接入点 ID 填进 model 参数
  const model = creds.extra?.model || m.modelParam;

  try {
    const res = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creds.apiKey}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ model, messages, stream: true, temperature: opts.temperature ?? 0.7 }),
      signal: opts.signal,
    });
    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => res.statusText);
      return { ok: false, error: `HTTP ${res.status} · ${text.slice(0, 200)}` };
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let full = '';
    let buf = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const j = JSON.parse(data);
          const delta: string = j?.choices?.[0]?.delta?.content ?? '';
          if (delta) {
            full += delta;
            opts.onDelta?.(delta);
          }
        } catch {
          // 忽略不完整分片
        }
      }
    }
    return { ok: true, data: full };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ========== 图像生成 ==========

export interface GeneratedImage {
  url: string;
  provider: string;
}

export async function generateImage(
  config: ModelConfig,
  prompt: string,
  opts: { size?: string; signal?: AbortSignal } = {},
): Promise<ApiResult<GeneratedImage>> {
  if (config.offlineMode) return { ok: false, error: 'offline' };
  const m = findModel(config.image.modelId);
  if (!m) return { ok: false, error: '未选择模型' };
  const creds = credsOf(config, m.vendorId);
  if (!creds.apiKey) return { ok: false, error: '未填写 API Key' };

  const endpoint = (creds.endpoint || m.defaultEndpoint).replace(/\/$/, '');
  const model = creds.extra?.model || m.modelParam;
  const size = opts.size ?? '1024x1024';

  try {
    if (m.openaiCompatible) {
      const res = await fetch(`${endpoint}/images/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${creds.apiKey}` },
        body: JSON.stringify({ model, prompt, size, n: 1, response_format: 'b64_json' }),
        signal: opts.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: json.error?.message || `HTTP ${res.status}` };
      const b64 = json?.data?.[0]?.b64_json;
      const url = json?.data?.[0]?.url;
      if (b64) return { ok: true, data: { url: `data:image/png;base64,${b64}`, provider: m.vendor } };
      if (url) return { ok: true, data: { url, provider: m.vendor } };
      return { ok: false, error: '接口未返回 b64_json / url' };
    }

    // 阿里 DashScope 万相（异步任务）
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creds.apiKey}`,
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({ model, input: { prompt }, parameters: { size, n: 1 } }),
      signal: opts.signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.message || `HTTP ${res.status}` };
    return { ok: true, data: { url: '', provider: '万相（异步任务已提交）' } };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ========== 语音 ASR ==========

export interface AsrLine {
  start: number;
  end: number;
  text: string;
}

export async function transcribeAudio(
  config: ModelConfig,
  source: Blob | string,
  opts: { dialect?: string; signal?: AbortSignal } = {},
): Promise<ApiResult<AsrLine[]>> {
  if (config.offlineMode) return { ok: false, error: 'offline' };
  const m = findModel(config.asr.modelId);
  if (!m) return { ok: false, error: '未选择模型' };
  const creds = credsOf(config, m.vendorId);
  if (!creds.apiKey) return { ok: false, error: '未填写 API Key' };

  const endpoint = (creds.endpoint || m.defaultEndpoint).replace(/\/$/, '');
  const model = creds.extra?.model || m.modelParam;

  if (!(source instanceof Blob)) {
    return { ok: false, error: '请先在采集页录音或导入音频文件' };
  }
  if (!m.openaiCompatible) {
    return { ok: false, error: `${m.vendor} 需要专用签名接口，请在设置页改填 SiliconFlow / 阿里百炼 兼容地址` };
  }

  try {
    const fd = new FormData();
    fd.append('model', model);
    fd.append('file', source, 'recording.wav');
    const hint = opts.dialect ? dialectHint(opts.dialect) : '';
    if (hint) fd.append('prompt', hint);

    const res = await fetch(`${endpoint}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${creds.apiKey}` },
      body: fd,
      signal: opts.signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error?.message || `HTTP ${res.status}` };
    const text: string = json.text || '';
    const segs = (json.segments || []).map((s: { start: number; end: number; text: string }) => ({
      start: s.start,
      end: s.end,
      text: s.text,
    }));
    return { ok: true, data: segs.length ? segs : [{ start: 0, end: text.length * 0.04, text }] };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

function dialectHint(dialect: string): string {
  const map: Record<string, string> = {
    普通话: '以下为普通话对话',
    粤语: '以下为粤语对话，请按粤语发音转写',
    四川话: '以下为四川话对话',
    闽南语: '以下为闽南语对话',
    吴语: '以下为上海话 / 吴语对话',
    东北话: '以下为东北话对话',
    客家话: '以下为客家话对话',
    河南话: '以下为河南话对话',
    陕西话: '以下为陕西话对话',
  };
  return map[dialect] || '';
}

// ========== 连通性测试 ==========

/**
 * 三段式探测：
 *  1. 网络层：no-cors 请求 endpoint，判断 DNS / TCP / TLS 是否通；
 *  2. 鉴权层：带 Key 打一次最小业务请求，看 401/403；
 *  3. 结论：全通 / 可达但 Key 无效 / 网络不通。
 * 无 Key 时只做第 1 段（只能确认网络可达）。
 */
export async function testConnection(
  config: ModelConfig,
  vendorId: string,
  kind: ModelKind,
): Promise<ConnResult> {
  const started = Date.now();
  const modelId =
    kind === 'llm' ? config.llm.modelId : kind === 'asr' ? config.asr.modelId : config.image.modelId;
  const m = findModel(modelId);
  if (!m) {
    return { ok: false, reachable: false, authorized: false, latencyMs: 0, message: '未选择模型', stage: 'network' };
  }
  const creds = credsOf(config, vendorId);
  const endpoint = (creds.endpoint || m.defaultEndpoint).replace(/\/$/, '');

  // ---- 第 1 段：网络可达性 ----
  try {
    await fetch(endpoint, { method: 'GET', mode: 'no-cors', cache: 'no-store' });
  } catch (err) {
    return {
      ok: false,
      reachable: false,
      authorized: false,
      latencyMs: Date.now() - started,
      message: `网络不可达：${(err as Error).message}。请检查网络或端点地址。`,
      stage: 'network',
    };
  }
  const netMs = Date.now() - started;

  if (!creds.apiKey) {
    return {
      ok: false,
      reachable: true,
      authorized: false,
      latencyMs: netMs,
      message: `网络已连通（${netMs}ms），但未填写 API Key，无法验证鉴权。`,
      stage: 'auth',
    };
  }

  // ---- 第 2 段：鉴权 ----
  try {
    let res: Response;
    if (kind === 'image') {
      res = await fetch(`${endpoint}/images/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${creds.apiKey}` },
        body: JSON.stringify({ model: creds.extra?.model || m.modelParam, prompt: 'a red dot', n: 1, size: '1024x1024' }),
      });
    } else {
      res = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${creds.apiKey}` },
        body: JSON.stringify({
          model: creds.extra?.model || m.modelParam,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 3,
        }),
      });
    }
    const latencyMs = Date.now() - started;
    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        reachable: true,
        authorized: false,
        latencyMs,
        message: `网络可达（${netMs}ms），但鉴权失败（HTTP ${res.status}）：API Key 无效或无权限。`,
        stage: 'auth',
      };
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return {
        ok: false,
        reachable: true,
        authorized: false,
        latencyMs,
        message: `网络可达（${netMs}ms），接口返回 HTTP ${res.status}：${body.slice(0, 120)}`,
        stage: 'auth',
      };
    }
    return {
      ok: true,
      reachable: true,
      authorized: true,
      latencyMs,
      message: `全部通过：网络 ${netMs}ms，鉴权正常，接口可用（共 ${latencyMs}ms）。`,
      stage: 'done',
    };
  } catch (err) {
    return {
      ok: false,
      reachable: true,
      authorized: false,
      latencyMs: Date.now() - started,
      message: `网络可达但请求被拦截：${(err as Error).message}（常见原因：CORS 跨域限制）。`,
      stage: 'auth',
    };
  }
}

/** 无 Key 的纯网络探测（供批量测试用） */
export async function probeEndpoint(endpoint: string): Promise<{ reachable: boolean; latencyMs: number; error?: string }> {
  const started = Date.now();
  const url = endpoint.replace(/\/$/, '');
  try {
    await fetch(url, { method: 'GET', mode: 'no-cors', cache: 'no-store' });
    return { reachable: true, latencyMs: Date.now() - started };
  } catch (err) {
    return { reachable: false, latencyMs: Date.now() - started, error: (err as Error).message };
  }
}
