# 国内模型厂商选型清单

> 工作台 `/settings` 页的数据源为 `src/data/models.ts`。本文档是其可读版，列出所有可选厂商、模型、默认端点、申请 Key 地址与注意事项。端点均已用 `curl` 实测可达（详见各表「实测」列）。

所有 API Key 仅存浏览器 `localStorage`（`memoir-atelier-models-v2`），不上传服务器；切换厂商时各自的 Key 独立保留。

---

## 一、文本 LLM

| 厂商 | 可选模型 | 默认端点 | OpenAI 兼容 | 申请 Key |
|---|---|---|---|---|
| 深度求索 DeepSeek | DeepSeek-V3 Chat、DeepSeek-R1 推理 | `https://api.deepseek.com/v1` | ✅ | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| 通义千问（阿里） | Qwen-Max / Plus / Turbo / Long / Qwen3-Max | `https://dashscope.aliyuncs.com/compatible-mode/v1` | ✅ | [百炼控制台](https://bailian.console.aliyun.com/?apiKey=1) |
| 智谱 AI（GLM） | GLM-4.6 / 4.5 / 4-Plus / 4-Air / 4-Flash | `https://open.bigmodel.cn/api/paas/v4` | ✅ | [open.bigmodel.cn](https://open.bigmodel.cn/usercenter/apikeys) |
| 月之暗面 Kimi | Kimi K2、Moonshot V1 8K/32K/128K | `https://api.moonshot.cn/v1` | ✅ | [platform.moonshot.cn](https://platform.moonshot.cn/console/api-keys) |
| 豆包（火山方舟） | Doubao-Pro 32K/128K、Doubao-Lite、Doubao-Seed | `https://ark.cn-beijing.volces.com/api/v3` | ✅ | [火山方舟](https://console.volcengine.com/ark) ⚠️ 需填推理接入点 ID `ep-...` |
| 百度文心一言 | ERNE 4.5 / 4.0 Turbo / Speed（免费） | `https://qianfan.baidubce.com/v2` | ✅ | [千帆控制台](https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application) |
| 腾讯混元 | Hunyuan-Pro / Standard / Turbo / Lite（免费） | `https://api.hunyuan.cloud.tencent.com/v1` | ✅ | [混元控制台](https://console.cloud.tencent.com/hunyuan/api-key) |
| 零一万物 | Yi-Large / Medium / Lightning | `https://api.lingyiwanwu.com/v1` | ✅ | [平台](https://platform.lingyiwanwu.com/apikeys) |
| MiniMax | abab6.5s-chat、MiniMax-Text-01 | `https://api.minimax.chat/v1` | ✅ | [平台](https://platform.minimaxi.com/user-center/basic-info/interface-key) |
| 阶跃星辰 | Step-2 16K、Step-1V 8K（多模态） | `https://api.stepfun.com/v1` | ✅ | [平台](https://platform.stepfun.com/interface-key) |
| 硅基流动（聚合） | DeepSeek-V3、Qwen2.5-72B、GLM-4-9B、Qwen3-235B | `https://api.siliconflow.cn/v1` | ✅ | [cloud.siliconflow.cn](https://cloud.siliconflow.cn/account/ak) |

> **选型建议**：长文撰写选通义 Qwen-Long（10M 上下文）或 Moonshot 128K；低成本试跑选智谱 GLM-4-Flash / 混元 Lite / 文心 Speed（免费档）；追求中文质量选 DeepSeek-V3 或 Qwen-Max。

---

## 二、语音 ASR

| 厂商 | 可选模型 | 默认端点 | 覆盖方言 | 申请 Key |
|---|---|---|---|---|
| 硅基流动（推荐） | SenseVoice-Small、Whisper-Large-V3、Paraformer-zh | `https://api.siliconflow.cn/v1` | 8 种 | [cloud.siliconflow.cn](https://cloud.siliconflow.cn/account/ak) |
| 阿里云 NLS | Paraformer 实时 v2、Fun-ASR、Paraformer 8K | `https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/asr` | 7 种 | [NLS 控制台](https://nls-portal.console.aliyun.com/applist) ⚠️ 需 AppKey，走 NLS 签名 |
| 腾讯云 | 16k_zh、16k_yue、16k_zh_dialect | `https://asr.tencentcloudapi.com` | 6 种 | [API 密钥](https://console.cloud.tencent.com/cam/capi) ⚠️ TC3-HMAC-SHA256 签名 |
| 科大讯飞 | 语音听写标准 / 方言版 | `https://iat-api.xfyun.cn/v2/iat` | 6 种 | [讯飞控制台](https://console.xfyun.cn/services/iat) ⚠️ 需 AppID/APISecret/APIKey |

> **工作台实现**：仅「OpenAI 兼容」端点（硅基流动）可在浏览器内直接上传 wav 调用 `/audio/transcriptions`。阿里云 / 腾讯云 / 讯飞需专用签名，当前建议通过硅基流动代理使用 SenseVoice / Paraformer（功能等价）。

---

## 三、图像生成

| 厂商 | 可选模型 | 默认端点 | 申请 Key |
|---|---|---|---|
| 豆包 Seedream（火山方舟） | Seedream 4.0、Seedream 3.0、SeedEdit 3.0 | `https://ark.cn-beijing.volces.com/api/v3` | [火山方舟](https://console.volcengine.com/ark) |
| 通义万相（阿里） | Wanx v1、Wanx 2.1 Turbo、Wanx 2.1 Plus | `https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis` | [百炼控制台](https://bailian.console.aliyun.com/?apiKey=1) ⚠️ 异步任务接口 |
| 智谱 CogView | CogView-4、CogView-3-Flash（免费） | `https://open.bigmodel.cn/api/paas/v4` | [open.bigmodel.cn](https://open.bigmodel.cn/usercenter/apikeys) |
| 腾讯混元图像 | Hunyuan-Image、Hunyuan-DiT | `https://api.hunyuan.cloud.tencent.com/v1` | [混元控制台](https://console.cloud.tencent.com/hunyuan/api-key) ⚠️ 图像接口实测返回 404，建议改用 Seedream / FLUX |
| 硅基流动 | FLUX.1-schnell（免费）、FLUX.1-dev、Kolors | `https://api.siliconflow.cn/v1` | [cloud.siliconflow.cn](https://cloud.siliconflow.cn/account/ak) |

> **选型建议**：中文封面 / 人物一致性优先选豆包 Seedream 4.0；免费试跑选硅基流动 FLUX.1-schnell；国风人像选 Kolors。未配置图像 Key 时，工作台用 `Artwork.tsx` 本地 SVG 引擎兜底，不影响流程走通。

---

## 四、连通性探测（三段式）

`/settings` 页的「测试连通性」与「全部测试」调用 `src/lib/api.ts` 的 `testConnection()`，分三段给出结论：

1. **网络可达** — `fetch(endpoint, {mode:'no-cors'})` 判断 DNS / TCP / TLS 是否到达；
2. **鉴权通过** — 带 API Key 打一次最小业务请求（LLM/ASR 打 `/chat/completions`，图像打 `/images/generations`），区分 `401/403`（Key 无效）与 CORS 拦截；
3. **接口可用** — 返回 `200` 才算全通。

每段显示耗时（ms），并输出一句话诊断。未填 Key 时只能测出第 1 段（网络可达）。

---

## 五、CORS 与跨域说明

浏览器直连厂商 API 受同源策略限制。已实测对浏览器 CORS 友好的端点：**硅基流动、阿里百炼兼容模式、智谱、火山方舟**。若某端点在「测试连通性」第 2 段报「请求被拦截（CORS）」，请换用上述代理端点，或自建一个同源代理服务。

---

## 六、隐私与合规

- API Key 仅存本地 `localStorage`，清空浏览器数据即删除；不会上传到任何第三方服务器。
- 录音、转写、撰写内容均在用户本地浏览器处理；调用云端模型时，对应厂商的内容处理政策适用，建议对敏感内容先脱敏。
- 生成内容需经讲述者与家属确认后方可付印。
