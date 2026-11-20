/** 国内可用模型注册表 —— 语音 ASR / 文本 LLM / 图像生成 */

export type ModelKind = 'asr' | 'llm' | 'image';

export interface ModelEntry {
  /** 内部 id，用户配置时存这个 */
  id: string;
  /** 厂商 */
  vendor: string;
  /** 模型显示名 */
  name: string;
  /** 对应 API 的 model 参数（某些厂商需要） */
  modelParam?: string;
  kind: ModelKind;
  /** 厂商 API 的默认 base URL（用户可改） */
  defaultEndpoint: string;
  /** 是否走 OpenAI 兼容接口（大部分国内厂商都兼容） */
  openaiCompatible?: boolean;
  /** 特殊：图像（文生图）接口路径 */
  imagePath?: string;
  /** 方言支持（ASR 专用） */
  dialects?: string[];
  /** 备注 */
  note?: string;
}

// ========= 语音 ASR =========
export const ASR_MODELS: ModelEntry[] = [
  {
    id: 'aliyun-parafomer',
    vendor: '阿里云',
    name: 'Paraformer-large（FunASR）',
    modelParam: 'paraformer-v2',
    kind: 'asr',
    defaultEndpoint: 'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/asr',
    dialects: ['普通话', '粤语', '四川话', '闽南语', '吴语', '东北话', '客家话'],
    note: '阿里达摩院开源 Paraformer，FunASR 生态里最常用',
  },
  {
    id: 'sensevoice-small',
    vendor: 'FunAudioLLM',
    name: 'SenseVoice-Small（零样本多语种）',
    modelParam: 'iic/SenseVoiceSmall',
    kind: 'asr',
    defaultEndpoint: 'https://api.siliconflow.cn/v1/audio/transcriptions',
    openaiCompatible: true,
    dialects: ['普通话', '粤语', '四川话', '闽南语', '吴语', '东北话', '河南话', '陕西话'],
    note: '通过 SiliconFlow 一键接入，支持热词',
  },
  {
    id: 'tencent-asr',
    vendor: '腾讯云',
    name: '腾讯云 实时/一句话 ASR',
    kind: 'asr',
    defaultEndpoint: 'https://asr.tencentcloudapi.com',
    note: '走腾讯云 TC3-HMAC-SHA256 签名，需 SecretId / SecretKey',
  },
  {
    id: 'iflytek-asr',
    vendor: '科大讯飞',
    name: '讯飞 语音听写',
    kind: 'asr',
    defaultEndpoint: 'https://iat-api.xfyun.cn/v2/iat',
    dialects: ['普通话', '粤语', '四川话'],
    note: '走 HMAC-SHA256 签名，需 AppID / APISecret / APIKey',
  },
];

// ========= 文本 LLM =========
export const LLM_MODELS: ModelEntry[] = [
  {
    id: 'deepseek-v3',
    vendor: '深度求索',
    name: 'DeepSeek V3',
    modelParam: 'deepseek-chat',
    kind: 'llm',
    defaultEndpoint: 'https://api.deepseek.com/v1',
    openaiCompatible: true,
  },
  {
    id: 'qwen-plus',
    vendor: '通义（阿里）',
    name: '通义 Qwen-Plus',
    modelParam: 'qwen-plus',
    kind: 'llm',
    defaultEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    openaiCompatible: true,
  },
  {
    id: 'qwen-max',
    vendor: '通义（阿里）',
    name: '通义 Qwen-Max',
    modelParam: 'qwen-max',
    kind: 'llm',
    defaultEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    openaiCompatible: true,
  },
  {
    id: 'glm-4',
    vendor: '智谱 AI',
    name: 'GLM-4',
    modelParam: 'glm-4',
    kind: 'llm',
    defaultEndpoint: 'https://open.bigmodel.cn/api/paas/v4',
    openaiCompatible: true,
  },
  {
    id: 'glm-4-air',
    vendor: '智谱 AI',
    name: 'GLM-4-Air（极速低成本）',
    modelParam: 'glm-4-air',
    kind: 'llm',
    defaultEndpoint: 'https://open.bigmodel.cn/api/paas/v4',
    openaiCompatible: true,
  },
  {
    id: 'moonshot-v1-8k',
    vendor: '月之暗面',
    name: 'Moonshot V1',
    modelParam: 'moonshot-v1-8k',
    kind: 'llm',
    defaultEndpoint: 'https://api.moonshot.cn/v1',
    openaiCompatible: true,
  },
  {
    id: 'doubao-pro',
    vendor: '豆包（字节）',
    name: 'Doubao Pro',
    modelParam: 'ep-xxxxxxxxxxxx-xxxxx',
    kind: 'llm',
    defaultEndpoint: 'https://ark.cn-beijing.volces.com/api/v3',
    openaiCompatible: true,
    note: '需要先在火山方舟创建推理接入点 (endpoint id) 作为 modelParam',
  },
  {
    id: 'yuan2',
    vendor: '零一万物',
    name: 'Yi-Large / Yi-Pro',
    modelParam: 'yi-large',
    kind: 'llm',
    defaultEndpoint: 'https://api.lingyiwanwu.com/v1',
    openaiCompatible: true,
  },
];

// ========= 图像生成 =========
export const IMAGE_MODELS: ModelEntry[] = [
  {
    id: 'seedream-4',
    vendor: '豆包（字节）',
    name: 'Seedream 4.0',
    modelParam: 'seedream-4.0',
    kind: 'image',
    defaultEndpoint: 'https://api.coze.cn/v1/images/generations',
    openaiCompatible: true,
    note: '也可用火山方舟 endpoint；支持 1024x1024 / 1536x1024 等尺寸',
  },
  {
    id: 'wanx-v1',
    vendor: '通义（阿里）',
    name: '通义万相 Wanx',
    modelParam: 'wanx-v1',
    kind: 'image',
    defaultEndpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
    imagePath: '',
  },
  {
    id: 'cogview-4',
    vendor: '智谱 AI',
    name: 'CogView-4',
    modelParam: 'cogview-4',
    kind: 'image',
    defaultEndpoint: 'https://open.bigmodel.cn/api/paas/v4',
    openaiCompatible: true,
  },
  {
    id: 'hunyuan-image',
    vendor: '混元（腾讯）',
    name: '混元图像生成',
    modelParam: 'hunyuan-image',
    kind: 'image',
    defaultEndpoint: 'https://api.hunyuan.cloud.tencent.com/v1/images/generations',
    openaiCompatible: true,
  },
];

export const ALL_MODELS = [...ASR_MODELS, ...LLM_MODELS, ...IMAGE_MODELS];

export function findModel(id: string): ModelEntry | undefined {
  return ALL_MODELS.find((m) => m.id === id);
}

/** 用户当前的模型配置 */
export interface ModelSelection {
  asrId: string;
  llmId: string;
  imageId: string;
}

/** 用户填的 API 凭据 */
export interface ModelCreds {
  // 通用 OpenAI 兼容 key
  apiKey: string;
  // 部分厂商额外要求（腾讯云 SecretId、讯飞 AppID 等）
  extra?: Record<string, string>;
  // 用户可覆盖默认 endpoint
  endpoint?: string;
}

/** 完整模型设置：选的哪个模型 + 对应的 key 与 endpoint */
export interface ModelConfig {
  asr: { modelId: string; creds: ModelCreds };
  llm: { modelId: string; creds: ModelCreds };
  image: { modelId: string; creds: ModelCreds };
  /** 未填 key 时走模拟，填了就走真 API */
  offlineMode: boolean;
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  asr: { modelId: 'sensevoice-small', creds: { apiKey: '' } },
  llm: { modelId: 'deepseek-v3', creds: { apiKey: '' } },
  image: { modelId: 'seedream-4', creds: { apiKey: '' } },
  offlineMode: true, // 默认离线演示
};

export const MODEL_STORAGE_KEY = 'memoir-atelier-models-v1';
