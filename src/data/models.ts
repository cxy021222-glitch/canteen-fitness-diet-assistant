/** 国内可用模型注册表 —— 二级结构：厂商（Vendor）→ 该厂商下的多个模型（Model） */

export type ModelKind = 'asr' | 'llm' | 'image';

/** 厂商下的单个模型 */
export interface ModelItem {
  /** 厂商内唯一 id */
  id: string;
  /** 显示名 */
  name: string;
  /** 传给 API 的 model 参数 */
  modelParam: string;
  /** 上下文窗口 / 能力，纯展示 */
  contextWindow?: string;
  /** 价格提示，纯展示 */
  pricing?: string;
  /** 方言支持（ASR 专用） */
  dialects?: string[];
  /** 备注 */
  note?: string;
}

/** 厂商 */
export interface VendorEntry {
  id: string;
  name: string;
  shortName: string;
  kind: ModelKind;
  /** 默认 base URL（用户可覆盖） */
  defaultEndpoint: string;
  openaiCompatible?: boolean;
  /** 控制台申请 Key 的地址 */
  keyUrl?: string;
  /** 该厂商下可选模型 */
  models: ModelItem[];
}

/** 扁平的模型条目（由 vendor + model 派生，供调用层使用） */
export interface ModelEntry {
  /** 全局唯一 id：`vendorId::modelId` */
  id: string;
  vendorId: string;
  vendor: string;
  name: string;
  modelParam: string;
  kind: ModelKind;
  defaultEndpoint: string;
  openaiCompatible?: boolean;
  keyUrl?: string;
  dialects?: string[];
  note?: string;
  contextWindow?: string;
  pricing?: string;
}

// ───────────────────────── 文本 LLM 厂商 ─────────────────────────

export const LLM_VENDORS: VendorEntry[] = [
  {
    id: 'deepseek',
    name: '深度求索 DeepSeek',
    shortName: 'DeepSeek',
    kind: 'llm',
    defaultEndpoint: 'https://api.deepseek.com/v1',
    openaiCompatible: true,
    keyUrl: 'https://platform.deepseek.com/api_keys',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek-V3 Chat', modelParam: 'deepseek-chat', contextWindow: '64K', pricing: '¥1/M 输入 · ¥2/M 输出' },
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1 推理', modelParam: 'deepseek-reasoner', contextWindow: '64K', pricing: '¥4/M 输入 · ¥16/M 输出', note: '长链思考，适合复杂结构梳理，速度较慢' },
    ],
  },
  {
    id: 'qwen',
    name: '通义千问（阿里云）',
    shortName: '通义',
    kind: 'llm',
    defaultEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    openaiCompatible: true,
    keyUrl: 'https://bailian.console.aliyun.com/?apiKey=1',
    models: [
      { id: 'qwen-max', name: 'Qwen-Max', modelParam: 'qwen-max', contextWindow: '32K', pricing: '¥2.4/M 输入 · ¥9.6/M 输出' },
      { id: 'qwen-plus', name: 'Qwen-Plus', modelParam: 'qwen-plus', contextWindow: '131K', pricing: '¥0.8/M 输入 · ¥2/M 输出' },
      { id: 'qwen-turbo', name: 'Qwen-Turbo（极速）', modelParam: 'qwen-turbo', contextWindow: '1M', pricing: '¥0.3/M 输入 · ¥0.6/M 输出' },
      { id: 'qwen-long', name: 'Qwen-Long（超长文）', modelParam: 'qwen-long', contextWindow: '10M', pricing: '¥0.5/M 输入', note: '适合整本回忆录一次送入' },
      { id: 'qwen3-max', name: 'Qwen3-Max', modelParam: 'qwen3-max', contextWindow: '256K', pricing: '¥6/M 输入 · ¥24/M 输出' },
    ],
  },
  {
    id: 'zhipu',
    name: '智谱 AI（GLM）',
    shortName: '智谱',
    kind: 'llm',
    defaultEndpoint: 'https://open.bigmodel.cn/api/paas/v4',
    openaiCompatible: true,
    keyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
    models: [
      { id: 'glm-4.6', name: 'GLM-4.6', modelParam: 'glm-4.6', contextWindow: '200K', pricing: '¥2/M 输入 · ¥8/M 输出' },
      { id: 'glm-4.5', name: 'GLM-4.5', modelParam: 'glm-4.5', contextWindow: '128K', pricing: '¥2/M 输入 · ¥8/M 输出' },
      { id: 'glm-4-plus', name: 'GLM-4-Plus', modelParam: 'glm-4-plus', contextWindow: '128K', pricing: '¥5/M 输入 · ¥5/M 输出' },
      { id: 'glm-4-air', name: 'GLM-4-Air（低成本）', modelParam: 'glm-4-air', contextWindow: '128K', pricing: '¥0.5/M 输入' },
      { id: 'glm-4-flash', name: 'GLM-4-Flash（免费档）', modelParam: 'glm-4-flash', contextWindow: '128K', pricing: '免费' },
    ],
  },
  {
    id: 'moonshot',
    name: '月之暗面 Kimi',
    shortName: 'Kimi',
    kind: 'llm',
    defaultEndpoint: 'https://api.moonshot.cn/v1',
    openaiCompatible: true,
    keyUrl: 'https://platform.moonshot.cn/console/api-keys',
    models: [
      { id: 'kimi-k2', name: 'Kimi K2', modelParam: 'kimi-k2-0905-preview', contextWindow: '256K', pricing: '¥4/M 输入 · ¥16/M 输出' },
      { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K', modelParam: 'moonshot-v1-128k', contextWindow: '128K', pricing: '¥60/M 输入' },
      { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K', modelParam: 'moonshot-v1-32k', contextWindow: '32K', pricing: '¥24/M 输入' },
      { id: 'moonshot-v1-8k', name: 'Moonshot V1 8K', modelParam: 'moonshot-v1-8k', contextWindow: '8K', pricing: '¥12/M 输入' },
    ],
  },
  {
    id: 'doubao',
    name: '豆包（火山方舟）',
    shortName: '豆包',
    kind: 'llm',
    defaultEndpoint: 'https://ark.cn-beijing.volces.com/api/v3',
    openaiCompatible: true,
    keyUrl: 'https://console.volcengine.com/ark',
    models: [
      { id: 'doubao-pro-32k', name: 'Doubao-Pro 32K', modelParam: 'doubao-pro-32k', contextWindow: '32K', note: '火山方舟需填推理接入点 ID（ep-...）到「模型参数」' },
      { id: 'doubao-pro-128k', name: 'Doubao-Pro 128K', modelParam: 'doubao-pro-128k', contextWindow: '128K' },
      { id: 'doubao-lite-32k', name: 'Doubao-Lite 32K', modelParam: 'doubao-lite-32k', contextWindow: '32K', pricing: '低成本' },
      { id: 'doubao-seed-1.6', name: 'Doubao-Seed 1.6', modelParam: 'doubao-seed-1-6', contextWindow: '256K' },
    ],
  },
  {
    id: 'baidu',
    name: '百度文心一言',
    shortName: '文心',
    kind: 'llm',
    defaultEndpoint: 'https://qianfan.baidubce.com/v2',
    openaiCompatible: true,
    keyUrl: 'https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application',
    models: [
      { id: 'ernie-4.5', name: 'ERNIE 4.5', modelParam: 'ernie-4.5-8k-preview', contextWindow: '8K' },
      { id: 'ernie-4.0-turbo', name: 'ERNIE 4.0 Turbo', modelParam: 'ernie-4.0-turbo-8k', contextWindow: '8K' },
      { id: 'ernie-speed', name: 'ERNIE Speed（免费）', modelParam: 'ernie-speed-128k', contextWindow: '128K', pricing: '免费' },
    ],
  },
  {
    id: 'hunyuan',
    name: '腾讯混元',
    shortName: '混元',
    kind: 'llm',
    defaultEndpoint: 'https://api.hunyuan.cloud.tencent.com/v1',
    openaiCompatible: true,
    keyUrl: 'https://console.cloud.tencent.com/hunyuan/api-key',
    models: [
      { id: 'hunyuan-pro', name: 'Hunyuan-Pro', modelParam: 'hunyuan-pro', contextWindow: '32K' },
      { id: 'hunyuan-standard', name: 'Hunyuan-Standard', modelParam: 'hunyuan-standard', contextWindow: '32K' },
      { id: 'hunyuan-turbo', name: 'Hunyuan-Turbo', modelParam: 'hunyuan-turbo', contextWindow: '32K' },
      { id: 'hunyuan-lite', name: 'Hunyuan-Lite（免费）', modelParam: 'hunyuan-lite', contextWindow: '256K', pricing: '免费' },
    ],
  },
  {
    id: 'lingyi',
    name: '零一万物',
    shortName: '零一',
    kind: 'llm',
    defaultEndpoint: 'https://api.lingyiwanwu.com/v1',
    openaiCompatible: true,
    keyUrl: 'https://platform.lingyiwanwu.com/apikeys',
    models: [
      { id: 'yi-large', name: 'Yi-Large', modelParam: 'yi-large', contextWindow: '32K' },
      { id: 'yi-medium', name: 'Yi-Medium', modelParam: 'yi-medium', contextWindow: '16K' },
      { id: 'yi-lightning', name: 'Yi-Lightning（极速）', modelParam: 'yi-lightning', contextWindow: '16K' },
    ],
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    shortName: 'MiniMax',
    kind: 'llm',
    defaultEndpoint: 'https://api.minimax.chat/v1',
    openaiCompatible: true,
    keyUrl: 'https://platform.minimaxi.com/user-center/basic-info/interface-key',
    models: [
      { id: 'abab6.5s', name: 'abab6.5s-chat', modelParam: 'abab6.5s-chat', contextWindow: '245K' },
      { id: 'minimax-text-01', name: 'MiniMax-Text-01', modelParam: 'MiniMax-Text-01', contextWindow: '1M' },
    ],
  },
  {
    id: 'stepfun',
    name: '阶跃星辰',
    shortName: '阶跃',
    kind: 'llm',
    defaultEndpoint: 'https://api.stepfun.com/v1',
    openaiCompatible: true,
    keyUrl: 'https://platform.stepfun.com/interface-key',
    models: [
      { id: 'step-2-16k', name: 'Step-2 16K', modelParam: 'step-2-16k', contextWindow: '16K' },
      { id: 'step-1v-8k', name: 'Step-1V 8K（多模态）', modelParam: 'step-1v-8k', contextWindow: '8K' },
    ],
  },
  {
    id: 'siliconflow',
    name: '硅基流动 SiliconFlow（聚合）',
    shortName: '硅基',
    kind: 'llm',
    defaultEndpoint: 'https://api.siliconflow.cn/v1',
    openaiCompatible: true,
    keyUrl: 'https://cloud.siliconflow.cn/account/ak',
    models: [
      { id: 'deepseek-v3', name: 'DeepSeek-V3（托管）', modelParam: 'deepseek-ai/DeepSeek-V3', contextWindow: '64K' },
      { id: 'qwen2.5-72b', name: 'Qwen2.5-72B-Instruct', modelParam: 'Qwen/Qwen2.5-72B-Instruct', contextWindow: '32K' },
      { id: 'glm-4-9b', name: 'GLM-4-9B-Chat', modelParam: 'THUDM/glm-4-9b-chat', contextWindow: '128K', pricing: '免费额度' },
      { id: 'qwen3-235b', name: 'Qwen3-235B-A22B', modelParam: 'Qwen/Qwen3-235B-A22B', contextWindow: '128K' },
    ],
  },
];

// ───────────────────────── 语音 ASR 厂商 ─────────────────────────

export const ASR_VENDORS: VendorEntry[] = [
  {
    id: 'siliconflow-asr',
    name: '硅基流动 SiliconFlow',
    shortName: '硅基',
    kind: 'asr',
    defaultEndpoint: 'https://api.siliconflow.cn/v1',
    openaiCompatible: true,
    keyUrl: 'https://cloud.siliconflow.cn/account/ak',
    models: [
      {
        id: 'sensevoice-small',
        name: 'SenseVoice-Small',
        modelParam: 'FunAudioLLM/SenseVoiceSmall',
        contextWindow: '零样本多语种',
        dialects: ['普通话', '粤语', '四川话', '闽南语', '吴语', '东北话', '河南话', '陕西话'],
        note: '推荐首选：19 种语言 + 方言，带情感与事件标签',
      },
      {
        id: 'whisper-large-v3',
        name: 'Whisper-Large-V3（托管）',
        modelParam: 'openai/whisper-large-v3',
        dialects: ['普通话', '粤语', '四川话', '吴语'],
        note: '鲁棒性强，对嘈杂录音容错好',
      },
      {
        id: 'paraformer-zh',
        name: 'Paraformer-zh（中文优化）',
        modelParam: 'funasr/paraformer-zh',
        dialects: ['普通话'],
        note: '纯中文准确率高，速度最快',
      },
    ],
  },
  {
    id: 'aliyun-asr',
    name: '阿里云智能语音（NLS）',
    shortName: '阿里云',
    kind: 'asr',
    defaultEndpoint: 'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/asr',
    keyUrl: 'https://nls-portal.console.aliyun.com/applist',
    models: [
      { id: 'paraformer-v2', name: 'Paraformer 实时 v2', modelParam: 'paraformer-v2', dialects: ['普通话', '粤语', '四川话', '闽南语', '吴语', '东北话', '客家话'], note: '走阿里 NLS 签名，需 AppKey + Token' },
      { id: 'fun-asr', name: 'Fun-ASR', modelParam: 'fun-asr', dialects: ['普通话', '粤语', '四川话'], note: '阿里新一代端到端模型' },
      { id: 'paraformer-8k', name: 'Paraformer 8K（电话音质）', modelParam: 'paraformer-8k-v2', dialects: ['普通话'] },
    ],
  },
  {
    id: 'tencent-asr',
    name: '腾讯云语音识别',
    shortName: '腾讯云',
    kind: 'asr',
    defaultEndpoint: 'https://asr.tencentcloudapi.com',
    keyUrl: 'https://console.cloud.tencent.com/cam/capi',
    models: [
      { id: '16k-zh', name: '16k_zh（普通话）', modelParam: '16k_zh', dialects: ['普通话'] },
      { id: '16k-yue', name: '16k_yue（粤语）', modelParam: '16k_yue', dialects: ['粤语'] },
      { id: '16k-zh-dialect', name: '16k_zh_dialect（方言混合）', modelParam: '16k_zh_dialect', dialects: ['普通话', '粤语', '四川话', '闽南语', '吴语', '东北话'], note: 'TC3-HMAC-SHA256 签名，需 SecretId / SecretKey' },
    ],
  },
  {
    id: 'iflytek-asr',
    name: '科大讯飞',
    shortName: '讯飞',
    kind: 'asr',
    defaultEndpoint: 'https://iat-api.xfyun.cn/v2/iat',
    keyUrl: 'https://console.xfyun.cn/services/iat',
    models: [
      { id: 'iat-standard', name: '语音听写（标准）', modelParam: 'iat', dialects: ['普通话'], note: 'HMAC-SHA256 签名，需 AppID / APISecret / APIKey' },
      { id: 'iat-dialect', name: '语音听写（方言版）', modelParam: 'iat_dialect', dialects: ['普通话', '粤语', '四川话', '河南话', '东北话', '闽南语'] },
    ],
  },
];

// ───────────────────────── 图像生成厂商 ─────────────────────────

export const IMAGE_VENDORS: VendorEntry[] = [
  {
    id: 'doubao-image',
    name: '豆包 Seedream（火山方舟）',
    shortName: '豆包',
    kind: 'image',
    defaultEndpoint: 'https://ark.cn-beijing.volces.com/api/v3',
    openaiCompatible: true,
    keyUrl: 'https://console.volcengine.com/ark',
    models: [
      { id: 'seedream-4.0', name: 'Seedream 4.0', modelParam: 'doubao-seedream-4-0-250828', contextWindow: '4K 分辨率', note: '中文场景与人物一致性最强' },
      { id: 'seedream-3.0', name: 'Seedream 3.0', modelParam: 'doubao-seedream-3-0-t2i-250415', contextWindow: '2K 分辨率' },
      { id: 'seededit-3.0', name: 'SeedEdit 3.0（图生图）', modelParam: 'doubao-seededit-3-0-i2i-250628', note: '可基于已有封面做风格重绘' },
    ],
  },
  {
    id: 'qwen-image',
    name: '通义万相（阿里云）',
    shortName: '通义',
    kind: 'image',
    defaultEndpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
    keyUrl: 'https://bailian.console.aliyun.com/?apiKey=1',
    models: [
      { id: 'wanx-v1', name: 'Wanx v1', modelParam: 'wanx-v1', note: 'DashScope 异步任务接口' },
      { id: 'wanx2.1-turbo', name: 'Wanx 2.1 Turbo（极速）', modelParam: 'wanx2.1-t2i-turbo' },
      { id: 'wanx2.1-plus', name: 'Wanx 2.1 Plus（高质）', modelParam: 'wanx2.1-t2i-plus' },
    ],
  },
  {
    id: 'zhipu-image',
    name: '智谱 CogView',
    shortName: '智谱',
    kind: 'image',
    defaultEndpoint: 'https://open.bigmodel.cn/api/paas/v4',
    openaiCompatible: true,
    keyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
    models: [
      { id: 'cogview-4', name: 'CogView-4', modelParam: 'cogview-4-250304', contextWindow: '中文理解强' },
      { id: 'cogview-3-flash', name: 'CogView-3-Flash（免费）', modelParam: 'cogview-3-flash', pricing: '免费' },
    ],
  },
  {
    id: 'hunyuan-image',
    name: '腾讯混元图像',
    shortName: '混元',
    kind: 'image',
    defaultEndpoint: 'https://api.hunyuan.cloud.tencent.com/v1',
    openaiCompatible: true,
    keyUrl: 'https://console.cloud.tencent.com/hunyuan/api-key',
    models: [
      { id: 'hunyuan-image', name: 'Hunyuan-Image', modelParam: 'hunyuan-image', note: '实测该端点对图像接口返回 404，建议改用硅基流动 FLUX 或豆包 Seedream' },
      { id: 'hunyuan-dit', name: 'Hunyuan-DiT', modelParam: 'hunyuan-dit', note: '需确认控制台是否已开通图像生成' },
    ],
  },
  {
    id: 'siliconflow-image',
    name: '硅基流动（FLUX / Kolors）',
    shortName: '硅基',
    kind: 'image',
    defaultEndpoint: 'https://api.siliconflow.cn/v1',
    openaiCompatible: true,
    keyUrl: 'https://cloud.siliconflow.cn/account/ak',
    models: [
      { id: 'flux-schnell', name: 'FLUX.1-schnell（极速免费）', modelParam: 'black-forest-labs/FLUX.1-schnell', pricing: '免费' },
      { id: 'flux-dev', name: 'FLUX.1-dev', modelParam: 'black-forest-labs/FLUX.1-dev' },
      { id: 'kolors', name: 'Kolors（可图）', modelParam: 'Kwai-Kolors/Kolors', note: '中文人像与国风表现好' },
    ],
  },
];

/** 按 kind 取厂商列表 */
export const VENDORS: Record<ModelKind, VendorEntry[]> = {
  llm: LLM_VENDORS,
  asr: ASR_VENDORS,
  image: IMAGE_VENDORS,
};

/** 把 vendor + model 摊平成 ModelEntry */
function flatten(vendors: VendorEntry[]): ModelEntry[] {
  return vendors.flatMap((v) =>
    v.models.map((m) => ({
      id: `${v.id}::${m.id}`,
      vendorId: v.id,
      vendor: v.name,
      name: m.name,
      modelParam: m.modelParam,
      kind: v.kind,
      defaultEndpoint: v.defaultEndpoint,
      openaiCompatible: v.openaiCompatible,
      keyUrl: v.keyUrl,
      dialects: m.dialects,
      note: m.note,
      contextWindow: m.contextWindow,
      pricing: m.pricing,
    })),
  );
}

export const LLM_MODELS = flatten(LLM_VENDORS);
export const ASR_MODELS = flatten(ASR_VENDORS);
export const IMAGE_MODELS = flatten(IMAGE_VENDORS);
export const ALL_MODELS = [...LLM_MODELS, ...ASR_MODELS, ...IMAGE_MODELS];

export function findModel(id: string): ModelEntry | undefined {
  return ALL_MODELS.find((m) => m.id === id);
}

export function findVendor(kind: ModelKind, vendorId: string): VendorEntry | undefined {
  return VENDORS[kind].find((v) => v.id === vendorId);
}

/** 从全局 id 拆出 vendorId */
export function vendorIdOf(modelId: string): string {
  return modelId.split('::')[0] ?? '';
}

/** 用户填的 API 凭据（按厂商维度存，一个厂商一份 Key） */
export interface ModelCreds {
  apiKey: string;
  extra?: Record<string, string>;
  endpoint?: string;
}

/** 完整模型设置：每类选的厂商 + 模型；凭据按厂商 id 分别保存 */
export interface ModelConfig {
  asr: { vendorId: string; modelId: string };
  llm: { vendorId: string; modelId: string };
  image: { vendorId: string; modelId: string };
  /** vendorId -> 该厂商的 API Key / 自定义 endpoint */
  creds: Record<string, ModelCreds>;
  offlineMode: boolean;
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  asr: { vendorId: 'siliconflow-asr', modelId: 'siliconflow-asr::sensevoice-small' },
  llm: { vendorId: 'deepseek', modelId: 'deepseek::deepseek-chat' },
  image: { vendorId: 'doubao-image', modelId: 'doubao-image::seedream-4.0' },
  creds: {},
  offlineMode: true,
};

export const MODEL_STORAGE_KEY = 'memoir-atelier-models-v2';
