# 拾光 · 回忆录工坊（Memoir Atelier）

一套面向「口述回忆录」生产的智能体矩阵与一体化可视化工作台：把工作人员与讲述者的访谈录音，走完 **采集 → 转写 → 编排 → 撰写 → 出版 → 交付** 的完整链路，最终产出一本可付印的书稿。

演示项目：《炉火与远方》—— 陈守义口述 · 一位三线建设者的六十年。

---

## 一、它解决什么

传统回忆录整理依赖人工听录音、删气口、提炼故事、分章、排版、配图，周期长且高度依赖个人经验。本工作台把这条链路拆成 12 个职责单一的智能体，由一条可视化流水线串起来：

| 工位 | 智能体 | 职责 | 模型选型 | 开源 Skill / 依赖 |
|---|---|---|---|---|
| 01 采集 Capture | A01 声音清道夫 | 去噪、分段、切掉静音与串音 | Silero VAD + FRCRN | `snakers4/silero-vad` |
| | A02 方言听写员 | 方言语音转文字，输出逐句时间轴与置信度 | SenseVoice-Small + Paraformer-large；Whisper large-v3-turbo 兜底 | `FunAudioLLM/SenseVoice`、`modelscope/FunASR`、`openai/whisper` |
| 02 转写 Transcript | A03 角色分辨师 | 区分采访者 / 讲述者，处理抢话与重叠 | pyannote.audio 3.1 + CAM++ | `pyannote/pyannote-audio`、`modelscope/3D-Speaker` |
| | A04 气口编辑 | 删除「嗯、那个、就是说」、重复与半截句 | Qwen3-32B + 规则库 | 自建 `src/lib/fillers.ts` 规则 |
| | A05 故事勘探员 | 提炼 logline、主题、人物、地点、物件、金句 | Claude Sonnet 4.5 | `anthropics/skills` |
| 03 编排 Compose | A06 结构建筑师 | 时间轴、章节骨架、五种叙事结构 | Claude Sonnet 4.5 + 模板库 | `anthropics/skills` |
| 04 撰写 Write | A07 执笔人 | 按文风与结构扩写章节正文 | Claude Sonnet 4.5 + Qwen3-Max | `awesome-claude-skills` |
| | A08 事实校对 | 人名、年份、地点、称谓一致性核对 | GLM-4.6 + 规则校验 | — |
| 05 出版 Publish | A09 封面画师 | 封面构图与六种画风 | Seedream 4.0 / FLUX.1-dev | `black-forest-labs/flux`、`huggingface/diffusers` |
| | A10 插图师 | 章节插图，风格与封面统一 | FLUX.1-dev + LoRA | `black-forest-labs/flux` |
| | A11 版面匠 | 开本、版心、页眉、目录、对开预览 | Typst 0.13 + Paged.js | `typst/typst`、`pagedjs/pagedjs` |
| | A12 出版管家 | 打包、PDF、GitHub 归档 | Pandoc + WeasyPrint + GitHub API | `jgm/pandoc`、`Kozea/WeasyPrint` |

> 方言不是「附加功能」，而是 A02 的一等需求：支持四川话、东北话、粤语、闽南语、吴语、河南话、陕西话等，识别结果带逐句置信度，低置信度句子进入人工复核队列。
>
> 完整矩阵与选型理由在工作台内 `/agents` 页；GitHub 仓库检索结果与接入命令在 `/skills` 页。

---

## 二、工作流

1. **采集** `/capture`：一键录音（浏览器麦克风）或导入音频文件；自动按方言路由到对应识别模型；可逐条修改方言标注。
2. **转写** `/transcript`：逐句流式转写，标出说话人、置信度、方言词；三档气口清理（轻 / 标准 / 深），实时对比清理前后字数。
3. **编排** `/compose`：从素材中提炼故事主干——logline、主题、时间轴、人物 / 地点 / 物件、金句；选 5 套叙事结构与 5 种叙事文风。
4. **撰写** `/write`：按章节骨架逐字生成正文；可随时切换文风重写；写作指令（细节 / 对白 / 景物 / 克制）与事实校对并列。
5. **出版** `/publish`：6 种封面 / 插图风格、3 种开本、A5 对开预览、章节插图网格、印制预估。
6. **交付** `/deliver`：导出 Markdown、自包含 HTML 书稿、project.json、agent-run.json，打包 ZIP，或填入 Token 直接推送到 GitHub。

所有状态保存在浏览器 `localStorage`（`memoir-atelier-project-v1`），刷新不丢；「我的 / 交付」页可重置回演示项目。

---

## 三、本地运行

```bash
npm install
npm run dev      # http://localhost:8001
npm run build    # 生产构建
npm run typecheck
```

技术栈：React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + lucide-react + react-router-dom。

---

## 四、设计语言

「私人档案馆 / 纸上编辑室」：暖纸底 `#f6f0e4`、墨黑 `#1b1712`、印章红 `#a6392b`、靛青、橄榄、旧金；Noto Serif SC 标题与正文、Noto Sans SC 界面、Space Grotesk 标签与数字；细线、纸纹、印章、页码。六个页面共享同一套色板与材质，只在版式上变化。

---

## 五、图像说明

封面与章节插图由 `src/components/Artwork.tsx` 的本地矢量引擎绘制：同一套场景几何按六种画风（木刻版画 / 水彩纪事 / 银盐胶片 / 水墨留白 / 复古丝网印 / 油画肖像）渲染为 SVG，离线可用、可随风格即时切换，并直接内联进导出的 HTML 书稿。

生产环境可将 `artworkSvg()` 替换为真实的文生图调用（Seedream / FLUX），`prompt` 字段已按画风拼装完毕，可直接作为模型入参。

---

## 六、目录

```
src/
├── app.tsx                 # 9 条路由
├── components/
│   ├── WorkbenchShell.tsx  # 侧栏 / 顶栏 / 移动端导航
│   ├── Artwork.tsx         # 六画风矢量插图引擎
│   └── ui-kit.tsx          # 页面级通用组件
├── data/
│   ├── agents.ts           # 12 个智能体 + 5 个工位
│   ├── skills.ts           # GitHub Skill 仓库
│   ├── presets.ts          # 叙事 / 文风 / 画风 / 开本
│   ├── demoProject.ts      # 演示项目《炉火与远方》
│   └── types.ts
├── lib/
│   ├── store.tsx           # 全局状态 + localStorage
│   ├── fillers.ts          # 气口清理规则
│   ├── deliver.ts          # Markdown / HTML / GitHub 推送
│   └── zip.ts              # 手写 ZIP 打包
└── pages/                  # 工作台 / 采集 / 转写 / 编排 / 撰写 / 出版 / 交付 / 智能体 / 技能
```

---

## 七、边界与免责

- 所有转写与撰写结果均为辅助草稿，人名、年份、事件需经讲述者与家属确认后方可付印。
- 不提供医疗、心理、法律建议；涉及创伤记忆时应由专业访谈人员在场。
- 演示项目为虚构示例，用于展示流水线。
