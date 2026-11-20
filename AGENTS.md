# 拾光 · 回忆录工坊 — 产品与设计规范

> 本文件是本仓库的长期约束。新增页面、组件、文案时，必须遵循此处的产品边界、视觉语言与数据约定。

## 一、产品定位

- **产品**：面向口述回忆录生产的智能体矩阵 + 一体化可视化工作台（Web，桌面优先，兼顾移动端）。
- **用户**：回忆录整理者 / 家属 / 小型出版工作室；讲述者多为 60–90 岁长者，录音可能为方言。
- **核心价值**：把「访谈录音 → 可付印书稿」这条链路拆成 12 个职责单一的智能体，用一条可视化流水线串起来，每一步都可查看、可修改、可回退。
- **界面语言**：中文；英文仅用于 `label` 小字标签（如 `Stage 01 · Capture`）。

## 二、流水线与路由

| 阶段 | 路由 | 页面 | 负责智能体 |
|---|---|---|---|
| 工作台 | `/` | `WorkbenchPage` | 全局 |
| 01 采集 | `/capture` | `CapturePage` | A01 声音清道夫、A02 方言听写员 |
| 02 转写 | `/transcript` | `TranscriptPage` | A03 角色分辨师、A04 气口编辑 |
| 03 编排 | `/compose` | `ComposePage` | A05 故事勘探员、A06 结构建筑师 |
| 04 撰写 | `/write` | `WritePage` | A07 执笔人、A08 事实校对 |
| 05 出版 | `/publish` | `PublishPage` | A09 封面画师、A10 插图师、A11 版面匠 |
| 交付 | `/deliver` | `DeliverPage` | A12 出版管家 |
| 智能体矩阵 | `/agents` | `AgentsPage` | 全量说明 |
| 开源技能 | `/skills` | `SkillsPage` | 全量说明 |

## 三、功能约束

- **采集**：必须支持一键录音（`getUserMedia`）与音频文件导入；无麦克风权限时降级为演示录音并明确标注；每条录音可切换方言（四川话 / 东北话 / 粤语 / 闽南语 / 吴语 / 河南话 / 陕西话 / 普通话）。
- **转写**：逐句流式出现；每句显示说话人、时间、置信度；低置信度（<0.8）必须可复核；气口清理提供「轻 / 标准 / 深」三档，并展示清理前后字数与删除条数；方言词单独标注。
- **编排**：必须提供至少 5 套叙事结构（编年体 / 双线并行 / 主题式 / 口述实录 / 书信体）与 5 种文风（克制纪实 / 温暖抒情 / 文学散文 / 幽默口语 / 史诗厚重）；故事主干包含 logline、主题、时间轴、人物 / 地点 / 物件、金句、章节骨架。
- **撰写**：逐章生成时必须可见流式过程；正文可在纸面编辑器中直接修改；切换文风后可按新文风重写；事实校对单独成块。
- **出版**：封面与插图均提供 6 种画风（木刻版画 / 水彩纪事 / 银盐胶片 / 水墨留白 / 复古丝网印 / 油画肖像）；3 种开本（A5 精装 / 32 开文库 / 16 开画册）；提供对开预览与章节插图网格。
- **交付**：导出 Markdown、自包含 HTML 书稿、project.json、agent-run.json；支持 ZIP 打包；支持填入 GitHub Token 后经 Contents API 推送。
- **不做**：登录注册、云端同步、社区、电商、真实支付、多用户协作。

## 四、数据与状态

- 全局状态：`src/lib/store.tsx` 的 `WorkbenchProvider` / `useWorkbench`，持久化到 `localStorage` key `memoir-atelier-project-v1`。
- 演示项目：`src/data/demoProject.ts`《炉火与远方》，5 章、23 句转写、5 张插图、6 句金句；第 5 章初始为待写，正文草稿在 `CH5_DRAFT`。
- 核心类型：`src/data/types.ts`（`Project` / `Chapter` / `TranscriptLine` / `AudioTrack` / `CoverDesign` / `Illustration` / `StorySpine`）。
- 图像不使用远程 URL：由 `src/components/Artwork.tsx` 的 `artworkSvg(variant, styleId, index, seed)` 生成内联 SVG；`cover.seed` / `illustration.seed` 控制版本变化。新增画风必须同时更新 `SPECS` 与 `src/data/presets.ts` 的 `IMAGE_STYLES`。

## 五、视觉语言（不得漂移）

- **方向**：私人档案馆 / 纸上编辑室。暖纸、墨黑、印章红，细线、纸纹、页码、竖排点缀。
- **色彩**：
  - 背景 `--background` 暖纸 `hsl(40 33% 95%)`；卡片 `hsl(42 45% 98%)`
  - 文字 `--foreground` 墨 `hsl(32 16% 12%)`；次级 `--muted-foreground` `hsl(32 8% 42%)`
  - 主色 `--primary` 印章红 `hsl(7 55% 40%)`；边界 `--border` `hsl(36 16% 82%)`
  - 自定义语义色：`ink #1b1712`、`paper #f6f0e4`、`seal #a6392b`、`indigo #29434e`、`olive #54654b`、`gold #a8824a`
  - 禁止引入第二套主色（蓝紫渐变、荧光绿等）；状态色只用 seal / olive / gold。
- **字体**：标题与正文 `Noto Serif SC`（`font-serif`），界面 `Noto Sans SC`（`font-sans`），标签与数字 `Space Grotesk`（`font-mono`）。
- **圆角**：克制，`rounded-[1px]` ~ `rounded-sm`；按钮为直角或 2px 微圆角，不使用大圆角药丸。
- **阴影**：极轻，靠 1px 边框与纸纹分层；不用彩色光晕。
- **动效**：`animate-fade-up` 入场、`animate-soft-pulse` 生成中、`animate-blink` 光标；时长 200–600ms，禁止弹跳与缩放花活。
- **组件**：页面级通用件在 `src/components/ui-kit.tsx`（`PageHead` / `Panel` / `ActionButton` / `Chip` / `Bar` / `Metric` / `KeyValue` / `Note` / `Divider`）。`src/components/ui/*` 为 shadcn 基础件，**不得修改**。
- **反模式**：通用 SaaS 后台感、彩色图标墙、卡片大圆角+彩色阴影、无 focus 态的按钮、把红色用在非品牌语义处。

## 六、工程约定

- 入口 `src/index.tsx` 不改；路由集中在 `src/app.tsx`。
- 新增文件使用现有路径别名 `@/`。
- 每次改动后必须通过 `npx tsc -p tsconfig.app.json --noEmit` 与 `npm run build`。
- 不引入新的重型依赖；ZIP 打包用自写 `src/lib/zip.ts`。
- 所有面向用户的营养 / 医疗类表述不适用于本产品；但回忆录内容涉及创伤记忆时，界面需保留「需经讲述者与家属确认」的提示。
