# 食堂餐训App - 需求拆解文档

## 产品概述

- **产品类型**: 移动端饮食规划应用（健身大学生食堂场景）
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: 18–24岁在校健身大学生，反感繁琐填表、需要看得懂、能直接照着打饭的轻量饮食规划工具
- **核心价值**: "拍一拍、选一选"即可结合个人身体数据与增肌/减脂目标，在食堂菜品约束下获得AI搭配方案，并把零食、补给一并纳入记录
- **界面语言**: 中文
- **主题偏好**: 浅色（符合年轻健身用户清爽感，未明确要求深色）
- **导航模式**: 路径导航
- **导航布局**: Bottom Tab Bar（手机端App底部导航，非Topbar/Sidebar）

---

## 页面结构总览

> **说明**：手机端App形态，底部4个Tab为一级页面；餐次详情、拍照识别、建档表单等作为二级页面/弹窗/抽屉

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| 首页（当日目标对照） | `HomePage.tsx` | `/` | 一级 | 底部导航 |
| 记录/规划（选餐次+导入+AI搭配） | `PlanPage.tsx` | `/plan` | 一级 | 底部导航 |
| 零食补给 | `SnackPage.tsx` | `/snack` | 一级 | 底部导航 |
| 我的（建档+训练记录） | `ProfilePage.tsx` | `/profile` | 一级 | 底部导航 |
| 餐次详情/选菜页 | `MealDetailPage.tsx` | `/plan/meal/:mealType` | 二级 | 记录/规划页 → 点击某餐次卡片 |
| 拍照识别结果页 | `PhotoRecogPage.tsx` | `/plan/photo` | 二级 | 餐次详情页 → 点击拍照/上传 |
| 建档表单页 | `ProfileFormPage.tsx` | `/profile/form` | 二级 | 我的页 → 点击"编辑档案"或首次进入引导 |
| 训练记录页 | `WorkoutPage.tsx` | `/profile/workout` | 二级 | 我的页 → 点击"今日训练" |

> **餐次类型说明**：`mealType` = `breakfast` | `lunch` | `dinner` | `snack`（早/午/晚/加餐）

---

## 页面布局建议

- **布局模式**: 移动端单列纵向滚动 + 底部Tab导航 —— 手机端App，单手操作友好
- **视觉重心**: 结果/数据可视化（首页目标环、AI方案卡片）为主，输入操作尽量精简（"拍一拍、选一选"数步完成）
- **结果承载区**:
  - 首页：目标达成环 + 当日汇总卡片 + 各餐次摘要
  - 餐次详情页：AI推荐方案卡片（结果）+ 拍照/手动选菜（输入）并列，先看结果再调整
  - 拍照识别页：照片预览区（上半部）+ 候选菜名列表（下半部），支持勾选+份量调整
  - 初始态：未建档时首页显示"去建档"引导；已建档无记录时显示空状态+快捷入口

---

## 插件规划

| 插件实例名称 | 基于官方插件 | 业务用途 | 输出模式 | 所属页面 |
|------------|-----------|---------|---------|---------|
| 食堂菜品视觉识别 | `ai-image-understanding` | 传入用户拍摄/上传的食堂菜品照片，返回候选菜名、份量档、置信度，用于菜品识别 | stream | 拍照识别页 |
| AI饮食规划生成 | `ai-text-generate` | 传入用户档案、营养目标、可用菜品、已登记零食补给、忌口、餐次等上下文，流式输出符合JSON Schema的饮食搭配方案 | stream | 餐次详情页 |

> **重要约束**：视觉识别只返回菜名+份量档+置信度，不返回热量（营养一律回本地营养库取值）；AI饮食规划返回后需逐项回营养库重算真实营养并覆盖AI自报数字。

---

## 导航配置

- **导航布局**: Bottom Tab Bar（移动端底部导航）
- **导航项**（仅一级页面）:
  | 导航文字 | 路由 | 图标(建议) |
  |---------|------|-----------|
  | 首页 | `/` | Home / Target |
  | 记录 | `/plan` | Utensils / Plate |
  | 零食 | `/snack` | Cookie / Coffee |
  | 我的 | `/profile` | User |

> **说明**：底部导航4个Tab完全对应用户原话中"底部导航覆盖：首页(当日目标对照环)、记录/规划(选餐次、拍照或手动导入、生成搭配)、零食补给、我的(建档与训练记录)"。

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| 食堂菜品拍照识别 | real-plugin | 调用 ai-image-understanding 实例，传入用户拍摄/上传的食堂菜品照片，流式输出候选菜名、份量档(small/medium/large)、置信度(0–1) | 失败提示（toast "识别失败，请手动搜索"，自动跳转手动搜索入口） |
| AI饮食规划生成 | real-plugin | 调用 ai-text-generate 实例，传入用户档案、营养目标宏量、可用菜品及营养、已登记零食补给、忌口、餐次等上下文，流式输出符合约定JSON Schema的搭配方案 | 失败降级（自动切换到规则模板方案，标注"离线模板方案"，仍可记录） |
| 食堂营养库（菜品+零食补给） | demo-mock | `src/data/nutritionDB.ts` 预置结构化常见中餐食堂菜+零食补给，含100g及小/中/大份量的热量与三大营养素 | ✅ 本身就是预置数据 |
| 个人档案 | local-persist | localStorage key=`__canteen_fit_profile`，含性别/年龄/身高/体重/体脂/训练频率/训练强度/目标/忌口等字段 | 无 |
| 建档草稿暂存 | local-persist | localStorage key=`__canteen_fit_profile_draft`，中途退出自动保存，下次进入回填 | 无 |
| 当日饮食记录 | local-persist | localStorage key=`__canteen_fit_daily_log_YYYYMMDD`，按早/午/晚/加餐分组，每条含菜名/份量/营养/来源(识别/手动/AI推荐) | 无 |
| 零食补给记录 | local-persist | localStorage key=`__canteen_fit_snack_log_YYYYMMDD`，含产品名/份量/营养，计入当日总量 | 无 |
| 训练记录 | local-persist | localStorage key=`__canteen_fit_workout_YYYYMMDD`，含是否训练/部位/主观强度 | 无 |
| 自由录入菜品 | local-persist | localStorage key=`__canteen_fit_custom_foods`，标记"待入库"，支持在手动搜索中使用 | 无 |

> **插件行硬约束校验**: 
> - 食堂菜品视觉识别 → type=`real-plugin` ✅，mock兜底="失败提示" ✅（非具体mock值）
> - AI饮食规划生成 → type=`real-plugin` ✅，mock兜底="失败降级（规则模板）" ✅（降级方案由前端规则实现，非AI mock值）

---

## 功能列表

> **说明**：按页面/模块拆分，每个页面3-6个核心功能点，不列通用交互

---

### 首页（当日目标对照）

- **页面目标**: 展示当日营养目标达成情况，一目了然，符合"看得懂"的用户画像
- **功能点**:
  - **目标达成环展示**: 当日热量/蛋白/脂肪/碳水四项摄入量 vs 目标量，用环形进度图展示，颜色区分达标(绿)/接近(黄)/缺口(红)
  - **餐次分栏汇总**: 早/午/晚/加餐四栏，每栏显示已摄入热量和蛋白，点击跳转到对应餐次详情
  - **缺口智能提示**: 显示蛋白缺口g数和热量缺口kcal数，给出"下一餐建议多吃X g蛋白"或"可用一勺蛋白粉补位"等具象建议（非说教式批评）
  - **健康免责声明**: 页面底部常驻小字声明"本结果为估算参考，不替代医生/注册营养师建议"
  - **建档引导**: 未建档时首页显示引导卡片，点击跳转建档页

---

### 记录/规划页（餐次列表）

- **页面目标**: 选择餐次进入详情，快速进入"拍一拍、选一选"核心路径
- **功能点**:
  - **餐次卡片列表**: 早/午/晚/加餐四张卡片，显示该餐状态（未记录/已记录X道/X kcal），点击进入餐次详情
  - **日期切换**: 支持查看历史日期记录（仅查看，不做多日计划）
  - **当日训练快捷标记**: 顶部小入口，可快速标记今日是否训练（跳转训练记录页）

---

### 餐次详情页（核心：拍照导入 + AI生成搭配）

- **页面目标**: 完成"拍一拍→选一选→出方案→加入记录"完整闭环
- **页面布局**: 上方AI方案结果卡（初始为空/占位），下方操作区（拍照导入/手动搜索），符合移动端上下滚动
- **功能点**:
  - **拍照导入入口**: 大按钮"拍一拍识别菜品"，点击跳转拍照识别页或唤起相机
  - **手动搜索兜底**: 搜索框输入菜名，从本地营养库匹配，支持按分类浏览；未匹配到可"自由录入"临时菜品并标记待入库
  - **AI生成搭配**: 点击"生成AI搭配"按钮，调用LLM插件，传入档案/目标/当前已选菜品/零食补给/忌口/餐次，流式输出推荐方案
  - **AI方案展示与重算校验**: 返回结果后逐项回营养库重算真实营养（覆盖AI自报数字），展示推荐组合(2-4道菜+份量)、本餐合计营养、与目标差距(protein_remaining_g、kcal_remaining)、1-2条替换建议、缺口补位建议、warnings
  - **方案确认与记录**: 用户可调整每道菜份量（小/中/大三档切换），确认后一键加入当日记录，首页数据实时更新
  - **离线模板降级**: LLM超时/报错/返回非法JSON时，自动使用规则模板（按蛋白优先从营养库挑常见菜组合），结果标注"离线模板方案"，仍可记录

---

### 拍照识别页

- **页面目标**: 上传/拍摄菜品照片，展示识别候选，支持勾选确认
- **功能点**:
  - **拍照/相册选择**: 调用相机或相册选择图片，展示照片预览
  - **识别结果列表**: 流式展示候选菜名、份量档(small/medium/large)、置信度(0–1)
  - **低置信度处理**: 置信度<0.6的候选置灰显示，标注"建议手动确认"
  - **候选勾选与份量调整**: 用户勾选要加入的菜品，可切换份量档位，确认后返回餐次详情页
  - **识别失败平滑降级**: 识别不出/模糊/超时时，提示"未识别到菜品"，提供"手动搜索"按钮跳转手动搜索入口，不编造菜名
  - **照片仅本次使用**: 识别完成后不持久化存储照片数据

---

### 零食补给页

- **页面目标**: 快速登记零食与补给，计入当日总量
- **功能点**:
  - **预置零食分类展示**: 蛋白棒、蛋白粉(勺/份)、牛奶、香蕉、坚果、饮料等分类，点击快速添加
  - **自由录入**: 支持手动输入产品名+营养数据，标注"估算"
  - **当日零食列表**: 展示今日已登记零食/补给，支持调整份量、删除，删除后当日总量实时扣减
  - **计入当日汇总**: 所有零食补给计入当日总摄入，并参与AI规划的缺口补位建议引用

---

### 我的页

- **页面目标**: 管理个人档案、查看/编辑训练记录、设置入口
- **功能点**:
  - **档案摘要卡片**: 展示性别/年龄/身高/体重/BMI/目标，点击进入档案编辑
  - **今日训练记录入口**: 展示今日训练状态，点击进入训练记录页
  - **健康免责声明**: 页面底部常驻完整免责声明文本，引导特殊人群（孕妇/慢病/进食障碍/未成年人）咨询专业人士

---

### 建档表单页

- **页面目标**: 收集个人身体数据与目标，计算营养目标
- **功能点**:
  - **表单字段与校验**: 性别(单选)、年龄(数字输入，合理范围)、身高(120–220cm，越界红字拦截)、体重(30–200kg，越界红字拦截)、体脂率(可选，数字输入)、训练频率(下拉：久坐/每周1-3次/每周3-5次/每周6-7次)、训练强度(下拉)、目标(单选：增肌/减脂/维持)、忌口偏好(多选+自由文本)
  - **BMI实时计算展示**: 输入身高体重后实时计算并显示BMI值和分类
  - **营养目标实时计算**: 提交后/输入变更时按Mifflin-St Jeor公式+BMR×活动系数+目标修正+宏量拆分，真实计算目标热量和三大营养素
  - **必填校验**: 缺必填项时提交按钮置灰，并明确提示缺哪项
  - **草稿暂存**: 中途退出自动保存到localStorage，下次进入自动回填
  - **安全下限校验**: 减脂目标时若计算结果低于男1500/女1200 kcal安全下限，自动按下限取值并提示
  - **体脂缺失标注**: 未填体脂率时，结果页标注"体脂为估算"
  - **健康免责声明**: 表单底部常驻声明文本

---

### 训练记录页

- **页面目标**: 记录当天训练情况，用于修正当日活动系数
- **功能点**:
  - **今日是否训练**: 开关/单选
  - **训练部位**: 多选（胸/背/腿/肩/臂/核心/有氧等）
  - **主观强度**: 单选（轻松/适中/吃力）
  - **保存与修正**: 保存后当日TDEE按训练强度小幅修正活动系数，首页数据实时重算
  - **不生成动作计划**: 仅记录，不提供训练计划功能

---

## 数据共享配置

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `__canteen_fit_profile` | 用户个人档案，类型 `IUserProfile` | 首页、餐次详情、建档页、我的页 |
| `__canteen_fit_nutrition_goal` | 营养目标（计算结果缓存），类型 `INutritionGoal` | 首页、餐次详情、AI规划 |
| `__canteen_fit_daily_log` | 当日饮食记录，类型 `IDailyLog` | 首页、餐次详情、零食页 |
| `__canteen_fit_snack_log` | 当日零食补给记录，类型 `ISnackLog` | 零食页、首页、餐次详情 |
| `__canteen_fit_workout` | 当日训练记录，类型 `IWorkoutLog` | 我的页、训练记录页、首页 |
| `__canteen_fit_custom_foods` | 用户自由录入的菜品，类型 `ICustomFood[]` | 餐次详情、拍照识别兜底 |
| `__canteen_fit_profile_draft` | 建档草稿，类型 `Partial<IUserProfile>` | 建档表单页 |

```ts
// 用户档案
interface IUserProfile {
  gender: 'male' | 'female';
  age: number;
  height: number; // cm, 120-220
  weight: number; // kg, 30-200
  bodyFat?: number; // 可选, %
  trainingFrequency: 'sedentary' | 'light' | 'moderate' | 'heavy'; // 久坐/1-3次/3-5次/6-7次
  trainingIntensity: 'low' | 'medium' | 'high'; // 训练强度
  goal: 'bulk' | 'cut' | 'maintain'; // 增肌/减脂/维持
  dietaryRestrictions: string[]; // 忌口多选
  customRestrictions?: string; // 自由文本忌口
  createdAt: string;
  updatedAt: string;
}

// 营养目标
interface INutritionGoal {
  bmr: number; // 基础代谢
  tdee: number; // 总消耗
  targetKcal: number; // 目标热量
  proteinG: number; // 蛋白 g
  fatG: number; // 脂肪 g
  carbsG: number; // 碳水 g
  isEstimatedBodyFat: boolean; // 是否体脂估算
  isSafetyFloorApplied: boolean; // 是否触安全下限
  safetyFloorNote?: string; // 下限提示文案
}

// 营养库菜品（基础结构，用于预置营养库）
interface INutritionItem {
  id: string;
  name: string; // 菜名
  category: 'dish' | 'snack' | 'supplement'; // 菜品/零食/补给
  per100g: { kcal: number; protein: number; fat: number; carbs: number };
  portions: {
    small: { kcal: number; protein: number; fat: number; carbs: number; gram: number };
    medium: { kcal: number; protein: number; fat: number; carbs: number; gram: number };
    large: { kcal: number; protein: number; fat: number; carbs: number; gram: number };
  };
  tags?: string[]; // 用于忌口匹配（如"辣""海鲜""清真"）
}

// 一条饮食记录项
interface IMealEntry {
  id: string;
  foodId: string; // 营养库ID或自定义ID
  foodName: string;
  portion: 'small' | 'medium' | 'large';
  nutrition: { kcal: number; protein: number; fat: number; carbs: number };
  source: 'photo_recognition' | 'manual_search' | 'ai_recommendation' | 'custom_input';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  addedAt: string;
}

// 当日饮食记录
interface IDailyLog {
  date: string; // YYYY-MM-DD
  meals: {
    breakfast: IMealEntry[];
    lunch: IMealEntry[];
    dinner: IMealEntry[];
    snack: IMealEntry[];
  };
}

// 训练记录
interface IWorkoutLog {
  date: string;
  hasWorkout: boolean;
  bodyParts?: string[]; // 部位
  intensity?: 'easy' | 'moderate' | 'hard'; // 主观强度
}

// AI规划返回结构（与PRD第8章JSON Schema对齐）
interface IAIPlanResult {
  recommendedDishes: {
    name: string;
    portion: 'small' | 'medium' | 'large';
  }[]; // 2-4个菜品
  mealTotal: { kcal: number; protein: number; fat: number; carbs: number };
  remainingToGoal: {
    protein_remaining_g: number;
    kcal_remaining: number;
  };
  replacementSuggestions: string[]; // 1-2条
  gapSupplement: string; // 缺口补位建议
  warnings: string[];
  isOfflineTemplate: boolean; // 是否离线模板降级
}
```

---

## 营养目标计算公式（前端确定性实现）

> 严格按PRD附录A，真实计算、可复算、可对账，禁止用AI生成营养目标

### BMR（Mifflin-St Jeor公式）
- 男：`BMR = 10 × 体重(kg) + 6.25 × 身高(cm) − 5 × 年龄 + 5`
- 女：`BMR = 10 × 体重(kg) + 6.25 × 身高(cm) − 5 × 年龄 − 161`

### TDEE
- `TDEE = BMR × 活动系数`
- 活动系数：久坐=1.2 / 每周1-3次=1.375 / 每周3-5次=1.55 / 每周6-7次=1.725
- 训练强度修正：高强度+0.05，低强度-0.05（小幅修正）

### 目标热量
- 增肌：`TDEE + 250`
- 减脂：`TDEE - 400`，且不低于安全下限（男1500/女1200 kcal）
- 维持：`TDEE`
- 触下限提示：当减脂计算值低于下限时，按下限取值并显示提示

### 宏量营养素
- 蛋白 g/kg：增肌取中值2.0 / 减脂取中值1.8 / 维持取中值1.5
- 脂肪 g/kg：取中值0.9
- 碳水 g = (目标热量 − 蛋白g × 4 − 脂肪g × 9) / 4
- 体脂缺失时，结果标注"体脂为估算"（蛋白/脂肪取体重系数，不做瘦体重调整）

---

## 合规与免责声明要求

- 建档页和结果页常驻健康免责声明："本应用提供一般性饮食参考，不替代医生/注册营养师的专业建议。孕妇、慢性病患者、进食障碍人群、未成年人请咨询专业人士后使用。所有数值为估算，个体差异可能导致实际效果不同。"
- 所有营养数值标注"估算"，不出现"必瘦""必涨肌肉"等承诺性表述
- AI方案warnings中包含"饮食调整应循序渐进，如有不适请及时就医"等提示
- 视觉识别照片仅用于本次识别，不持久化存储

---

## 本期不做功能（P1/P2排除项）

- 多日计划、体重曲线
- 社区、社交功能
- 电商、补剂售卖
- 完整训练计划/动作库
- 登录注册系统（仅本地持久化）
- 云端同步、多设备

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Free Direction —— 无视觉参考，依据产品语义与健身大学生食堂场景建立完整视觉语言
- **核心情绪 / 应用类型**: 轻量、利落、可操作的移动端饮食规划工具，主打"拍一拍、选一选"即得到答案的爽感
- **独特记忆点**: 环形目标对照环中心显示当日蛋白/热量达成，配合"食堂窗口感"的菜品卡片，让用户一眼看懂"今天还差多少、这顿该打什么菜"

## 2. Art Direction

- **方向名**: 活力食堂风
- **Design Style**: Rounded 圆润几何 + Soft Blocks 柔色块 —— 贴合健身大学生年轻活力气质，柔色块承载菜品营养信息，大圆角减少"工具感"增加亲切感
- **DNA 参数**: 圆角 `rounded-xl`~`rounded-2xl` / 阴影 `shadow-sm` 配 `shadow-md` 悬浮态 / 间距 `gap-4` 标准 / 字体方向 几何无衬线，数字粗大醒目 / 装饰手法 营养进度条微渐变、菜品卡片左侧色条标识餐次
- **应用类型**: Workflow —— 四步闭环任务流为主，首页数据概览为辅

## 3. Color System

**色彩关系**: 活力绿主色 + 同色系浅绿反馈底 + 暖白日常背景 + 蛋白橙作营养强调色
**配色设计理由**: 绿主色传达健康、成长、低压力的饮食规划感；暖白背景比纯白更有"食堂/餐食"温度；蛋白橙作为第二强调色，专用于蛋白达成与缺口提示，避免全界面都用绿色导致信息层级扁平
**主色推导**: 从"健身 + 食堂餐食 + 大学生活力"语义出发，选中等饱和度的黄绿调作为 primary，既不是医疗冷蓝也不是高热量橙红，定位在"健康成长"区间
**使用比例**: 60% 中性（暖白 + 米灰）/ 30% 辅助（浅绿底 + 蛋白橙点缀）/ 10% primary；primary 只用于 CTA 按钮、tab 激活、主进度环填充

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(60 20% 97%) | 暖米白背景，带食堂餐桌温度感 |
| card | `--card` | `bg-card` | hsl(0 0% 100%) | 纯白卡片承载菜品与表单 |
| text | `--foreground` | `text-foreground` | hsl(220 13% 13%) | 深灰近黑，高对比可读 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(220 9% 46%) | 中灰，用于克重、说明、次级数值 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(142 55% 45%) | 活力绿，主交互与品牌锚点 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 100%) | 主色上的纯白文字 |
| accent | `--accent` | `bg-accent` | hsl(140 40% 94%) | 极浅绿，hover/选中/骨架屏底 |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(142 45% 30%) | accent 上的深绿文字图标 |
| border | `--border` | `border-border` | hsl(220 9% 90%) | 浅灰边界，结构分隔不抢眼 |

**语义色提示**: 
- 成功（达标）: hsl(142 55% 45%) 同 primary，三态 bg=hsl(140 40% 94%) / border=hsl(142 55% 70%) / text=hsl(142 45% 30%)
- 警告（接近/偏低）: hsl(38 90% 55%) 蛋白橙，三态 bg=hsl(40 90% 95%) / border=hsl(38 90% 75%) / text=hsl(30 80% 35%)；饱和度与 primary 对齐 ±10%
- 错误（越界/失败）: hsl(0 75% 55%) 警示红，三态 bg=hsl(0 80% 96%) / border=hsl(0 75% 75%) / text=hsl(0 70% 35%)；饱和度与 primary 对齐
- 减脂蓝标记: hsl(210 80% 55%)，仅用于减脂目标视觉标识，不作交互色

## 4. 字体与节奏

- **font-display**: Space Grotesk —— 数字粗大醒目、几何现代感，适合目标对照环与营养数值展示，健身感与科技感平衡
- **font-body**: Noto Sans SC —— 中文清晰可读，笔画均匀不笨重，适配菜品名、设置项、AI 建议等长文本
- **字号**: 首页目标环大号数字 text-5xl；H2 text-xl ~ text-2xl；body text-base；muted text-sm；菜品名 text-base 字重 500
- **圆角**: 大 —— 卡片 `rounded-2xl`、按钮 `rounded-xl`、输入框 `rounded-xl`，呼应年轻活力与"好下手"的交互直觉

## 5. 全局布局契约

- **Reference Layout Use**: 按需求结构推导，移动端竖屏优先，底部 Tab 导航 + 内容区上下滚动
- **Page / Section Order**: 首页（当日目标对照环 + 餐次快录入口）→ 记录/规划（选餐次 → 拍照/手动选菜 → AI 方案 → 加入记录）→ 零食补给（列表 + 新增）→ 我的（档案 + 训练记录 + 免责声明）
- **Standard Content Zone**: 移动端 `max-w-md mx-auto`，内容区左右 `px-4`；核心操作流在单手握持可达区内
- **Shell / Frame Alignment**: 底部 Tab 导航为固定 chrome，内容区独立滚动，安全区内 `pb-20` 避让 Tab 栏
- **Padding & Rhythm**: `px-4 py-4`，卡片间 `gap-3`，组间 `space-y-6`，保持 4/8px 倍数节奏
- **Full-bleed Zones**: 首页顶部目标环区域可全宽延伸至屏幕边缘，背景用浅绿渐变；其余内容受 Standard Content Zone 约束
- **Local Narrowing**: 建档表单、免责声明正文可用 `max-w-sm mx-auto` 居中收窄，减少阅读行长压力
- **Overflow Strategy**: 菜品候选横向列表、营养标签行使用 `overflow-x-auto`；长列表（营养库搜索结果）纵向滚动
- **Flexibility Boundary**: 允许移动端卡片内边距和列表间距微调；不允许切换主色、圆角系统或阴影语言

## 6. 视觉与动效

- **装饰**: 环形进度条微渐变、餐次色条（早黄/午绿/晚蓝/加餐橙）、菜品卡片轻量阴影
- **阴影/边界**: 轻 —— 卡片 `shadow-sm`，主按钮悬浮 `shadow-md`，低置信度菜品用 50% 透明度 + 虚线边框表达"待确认"
- **动效**: 精致克制 —— 进度环填充用 600ms ease-out 动画；AI 方案生成用脉冲呼吸态指示加载；按钮点击 scale 0.97 反馈；页面切换用水平推入过渡

## 7. 组件原则

- 按钮、输入框、菜品卡片、份量选择器必须有 Default / Hover / Active / Focus-visible / Disabled 五态
- Primary 按钮只用于"生成搭配""加入记录""保存档案"等关键行动；次级操作用 outline + accent hover
- 拍照识别候选项：高置信度白底实线，低置信度(<0.6) 灰底虚线 + "建议确认"角标
- AI 方案卡片顶部用绿条标识"AI 搭配"，降级方案用橙条标识"离线模板方案"，视觉区分明确
- 空状态、加载态、错误态延续柔色块 + 圆角语言，配简洁插画或图标，不用默认 shadcn 空态

## 8. Image Direction

- **Image Role**: 菜品示例图（营养库兜底展示用）+ 首页氛围小插画 + 空状态插画
- **Image Art Direction**: 扁平矢量 + 微质感；菜品图用俯视/侧视角食堂餐盘风格，色块分明无阴影；构图居中主体突出，背景透明或纯色；光线均匀平涂，边缘圆润；情绪轻松、有食欲但不油腻
- **Image Prompt Keywords**: flat vector illustration, cafeteria food bowl, top-down view, minimal shapes, rounded edges, soft warm palette, clean outlines, no shadow, fresh and healthy vibe, white background
- **Image Avoidance**: 避免写实食物照片、避免高饱和电商美食图、避免油腻/重油菜品视觉、避免复杂厨房场景背景、避免人物素材图

## 9. Anti-patterns

- **Split personality**: 首页绿、规划页蓝、档案页紫；全站共享绿 + 蛋白橙的统一色板，页面间只变布局不变色系统
- **Phantom tokens**: 编造 `--protein` / `--calorie` 等不在主题里的变量；语义色通过语义色提示写入，统一走 accent / border 或自定义 token 补齐
- **Default SaaS drift**: 回到默认蓝按钮 + 卡片堆叠的通用后台感；食堂餐训要有食堂温度和健身活力，用暖白底色 + 菜品色条 + 大数字环建立识别
- **Invisible interaction**: 只做了 touch 态，键盘 focus-visible 丢失；所有按钮、输入、卡片都要有清晰的 focus 环
- **Mono-hue tyranny**: 绿按钮 + 绿 tab + 绿边框 + 绿链接 + 绿进度条全都用 primary；把 primary 收回到 CTA 和主进度环，其余交给 accent、蛋白橙、中性色
- **Status color drift**: 错误红刺眼饱和、成功绿暗淡灰蒙；所有语义色饱和度与 primary 对齐 ±15%，保持视觉秩序