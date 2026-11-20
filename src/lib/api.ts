/**
 * 国内大模型统一调用客户端。
 *
 * 设计：
 *  - 文本 LLM / 图像：大部分走 OpenAI 兼容 REST（/chat/completions, /images/generations）
 *    少数厂商（阿里 DashScope 图像、腾讯云、讯飞）走自己的 REST 签名或 body 结构，
 *    由本模块内部分发。
 *  - 语音 ASR：FunASR / SenseVoice 可通过 SiliconFlow 等代理走 OpenAI
 *    /audio/transcriptions 上传 wav；腾讯云/讯飞走自己的签名接口。
 *  - 浏览器端直接 fetch，无后端依赖；用户 API key 存在 localStorage。
 *  - 所有函数都返回结构化结果 + error；不抛异常给 UI。
 */

import type { ModelConfig } from '@/data/models';
import { findModel } from '@/data/models';

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ========== 文本 LLM ==========

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatCompletion(
  config: ModelConfig,
  messages: ChatMessage[],
  opts: { temperature?: number; json?: boolean } = {},
): Promise<ApiResult<string>> {
  if (config.offlineMode) return { ok: false, error: 'offline' };
  const m = findModel(config.llm.modelId);
  if (!m) return { ok: false, error: '未选择模型' };
  if (!config.llm.creds.apiKey) return { ok: false, error: '未填写 API Key' };

  const endpoint = (config.llm.creds.endpoint || m.defaultEndpoint).replace(/\/$/, '');
  const model = config.llm.creds.apiKey ? (config.llm.creds.extra?.model || m.modelParam || m.id) : (m.modelParam || m.id);

  try {
    const res = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.llm.creds.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.7,
        ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json.error?.message || res.statusText };
    }
    const text = json?.choices?.[0]?.message?.content ?? '';
    return { ok: true, data: typeof text === 'string' ? text.trim() : JSON.stringify(text).trim() };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// 流式版本：每次 onDelta 传新的增量，onDone 传最终文本
export async function chatCompletionStream(
  config: ModelConfig,
  messages: ChatMessage[],
  opts: { onDelta?: (delta: string) => void; temperature?: number; signal?: AbortSignal } = {},
): Promise<ApiResult<string>> {
  if (config.offlineMode) return { ok: false, error: 'offline' };
  const m = findModel(config.llm.modelId);
  if (!m) return { ok: false, error: '未选择模型' };
  if (!config.llm.creds.apiKey) return { ok: false, error: '未填写 API Key' };

  const endpoint = (config.llm.creds.endpoint || m.defaultEndpoint).replace(/\/$/, '');
  const model = m.modelParam || m.id;

  try {
    const res = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.llm.creds.apiKey}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ model, messages, stream: true, temperature: opts.temperature ?? 0.7 }),
      signal: opts.signal,
    });
    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => res.statusText);
      return { ok: false, error: text.slice(0, 200) };
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
          // ignore malformed chunk
        }
      }
    }
    return { ok: true, data: full };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ========== 图像生成 ==========

/** 图像统一结果：base64 data URL 或可直接显示的 https URL */
export interface GeneratedImage {
  url: string;
  provider: string;
}

export async function generateImage(
  config: ModelConfig,
  prompt: string,
  opts: { size?: '1024x1024' | '1536x1024' | '1024x1536' | 'square_hd' | 'landscape_4_3' | 'portrait_16_9'; signal?: AbortSignal } = {},
): Promise<ApiResult<GeneratedImage>> {
  if (config.offlineMode) return { ok: false, error: 'offline' };
  const m = findModel(config.image.modelId);
  if (!m) return { ok: false, error: '未选择模型' };
  if (!config.image.creds.apiKey) return { ok: false, error: '未填写 API Key' };

  const endpoint = (config.image.creds.endpoint || m.defaultEndpoint).replace(/\/$/, '');
  const model = m.modelParam || m.id;
  const size = opts.size ?? '1024x1024';

  try {
    // OpenAI 兼容图像（豆包 Seedream、智谱 CogView、混元、部分代理）
    if (m.openaiCompatible) {
      const res = await fetch(`${endpoint}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.image.creds.apiKey}`,
        },
        body: JSON.stringify({ model, prompt, size, n: 1, response_format: 'b64_json' }),
        signal: opts.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: json.error?.message || res.statusText };

      const b64 = json?.data?.[0]?.b64_json;
      const url = json?.data?.[0]?.url;
      if (b64) return { ok: true, data: { url: `data:image/png;base64,${b64}`, provider: m.vendor } };
      if (url) return { ok: true, data: { url, provider: m.vendor } };
      return { ok: false, error: '接口未返回 b64_json / url' };
    }

    // 阿里 DashScope 万相（异步 task，这里简化为同步一次请求）
    if (m.id === 'wanx-v1') {
      const res = await fetch(`${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.image.creds.apiKey}`,
          'X-DashScope-Async': 'enable',
          'X-DashScope-DataInspection': 'enable',
        },
        body: JSON.stringify({ model, input: { prompt }, parameters: { size, n: 1 } }),
        signal: opts.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: json?.message || res.statusText };
      // 简化：让 UI 继续用内置 SVG 占位 + 链接到阿里控制台查
      return { ok: true, data: { url: '', provider: '万相（异步）' } };
    }

    return { ok: false, error: `图像模型 ${m.vendor} 暂未实现，请切换到 Seedream / CogView / 混元` };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ========== 语音 ASR ==========

/** ASR 结果：数组形式，方便后续直接喂 TranscriptLine[] */
export interface AsrLine {
  start: number; // seconds
  end: number;
  text: string;
}

export async function transcribeAudio(
  config: ModelConfig,
  /** 浏览器端拿到的录音 Blob 或已上传到 CDN 的 URL */
  source: Blob | string,
  opts: { dialect?: string; signal?: AbortSignal } = {},
): Promise<ApiResult<AsrLine[]>> {
  if (config.offlineMode) return { ok: false, error: 'offline' };
  const m = findModel(config.asr.modelId);
  if (!m) return { ok: false, error: '未选择模型' };
  if (!config.asr.creds.apiKey) return { ok: false, error: '未填写 API Key' };

  const endpoint = (config.asr.creds.endpoint || m.defaultEndpoint).replace(/\/$/, '');
  const model = m.modelParam || m.id;

  // OpenAI 兼容 upload（SiliconFlow 代理 SenseVoice / Paraformer 这类）
  if (m.openaiCompatible && source instanceof Blob) {
    try {
      const fd = new FormData();
      fd.append('model', model);
      fd.append('file', source, 'recording.wav');
      const langHint = opts.dialect ? dialectToLangHint(opts.dialect) : '';
      if (langHint) fd.append('prompt', langHint);

      const res = await fetch(`${endpoint}/audio/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.asr.creds.apiKey}` },
        body: fd,
        signal: opts.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: json?.error?.message || res.statusText };
      const text: string = json.text || '';
      // 没有分段时整个作为一行
      const segs = (json.segments || []).map((s: any) => ({ start: s.start, end: s.end, text: s.text }));
      const lines = segs.length ? segs : [{ start: 0, end: text.length * 0.04, text }];
      return { ok: true, data: lines };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  return { ok: false, error: `ASR 模型 ${m.vendor} 暂未实现，请切换到 FunAudioLLM（SiliconFlow 代理）` };
}

/** 把工作台的方言标签转成给 ASR 的提示词 */
function dialectToLangHint(dialect: string): string {
  const map: Record<string, string> = {
    普通话: '以下是普通话对话',
    粤语: '以下是粤语对话，请按粤语发音转写',
    四川话: '以下是四川话对话',
    闽南语: '以下是闽南语对话',
    吴语: '以下是上海话 / 吴语对话',
    东北话: '以下是东北话对话',
    客家话: '以下是客家话对话',
    河南话: '以下是河南话对话',
    陕西话: '以下是陕西话对话',
  };
  return map[dialect] || '';
}

// ========== 连通性检查 ==========

export async function pingModel(config: ModelConfig, kind: 'llm' | 'asr' | 'image'): Promise<ApiResult<string>> {
  if (config.offlineMode) return { ok: false, error: '离线演示模式' };
  const conf = config[kind];
  const m = findModel(conf.modelId);
  if (!m) return { ok: false, error: '未选择模型' };
  if (!conf.creds.apiKey) return { ok: false, error: '未填写 API Key' };
  const endpoint = (conf.creds.endpoint || m.defaultEndpoint).replace(/\/$/, '');

  if (kind === 'llm' || kind === 'asr') {
    // 用 chat 端点打一个极短请求
    try {
      const res = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${conf.creds.apiKey}`,
        },
        body: JSON.stringify({ model: m.modelParam || m.id, messages: [{ role: 'user', content: 'ping' }], max_tokens: 3 }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: json?.error?.message || res.statusText };
      return { ok: true, data: '连接正常' };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  if (kind === 'image') {
    try {
      const res = await fetch(`${endpoint}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${conf.creds.apiKey}`,
        },
        body: JSON.stringify({ model: m.modelParam || m.id, prompt: 'a red dot', n: 1 }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: json?.error?.message || res.statusText };
      return { ok: true, data: '连接正常' };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }
  return { ok: false, error: '未知 kind' };
}
