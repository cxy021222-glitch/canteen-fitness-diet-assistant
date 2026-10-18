// ---- plugin:canteen_dish_visual_recognition_1 ----
// ============================================================
// 插件 canteen_dish_visual_recognition_1 (食堂菜品视觉识别) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export type CanteenDishVisualRecognitionOneInput = {
  /** 待识别的食堂菜品照片 */
  dish_images: string[];
};

/**
 * const input: CanteenDishVisualRecognitionOneInput = { dish_images };
 * capabilityClient.load('canteen_dish_visual_recognition_1').callStream<CanteenDishVisualRecognitionOneOutput>('imageUnderstanding', input)
 * 每个 chunk 就是下面这个扁平对象，字段名与 CanteenDishVisualRecognitionOneOutput 一致，外面没有 data / choices / message 包装：
 *   {"content":"示例文本","reasoningContent":"","response":"示例文本"}
 * 返回值可能是 AsyncIterable<chunk>，也可能是 { output: AsyncIterable<chunk> }，取流前先归一化。
 * 逐段累加：
 *   for await (const chunk of stream) { result += chunk.content ?? ''; }
 */
export type CanteenDishVisualRecognitionOneOutput = {
  content: string;
  reasoningContent?: string;
  response?: string;
};
// ---- end:canteen_dish_visual_recognition_1 ----

// ---- plugin:ai_diet_plan_generation_1 ----
// ============================================================
// 插件 ai_diet_plan_generation_1 (AI饮食规划生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export type AiDietPlanGenerationOneInput = {
  /** 已登记的零食补给信息 */
  registered_snacks?: string;
  /** 用户忌口信息，包含食物过敏、饮食禁忌、宗教饮食限制等 */
  dietary_restrictions: string;
  /** 餐次安排信息，包含每日餐次数量、各餐次时间安排等 */
  meal_schedule: string;
  /** 用户个人档案信息，包含年龄、性别、体重、身高、健康状况、运动习惯等 */
  user_profile: string;
  /** 营养目标宏量指标，包含每日所需热量、蛋白质、碳水化合物、脂肪等摄入量要求 */
  nutrition_target: string;
  /** 可用菜品及对应营养成分信息 */
  available_dishes: string;
};

/**
 * const input: AiDietPlanGenerationOneInput = { registered_snacks, dietary_restrictions, meal_schedule, ... };
 * capabilityClient.load('ai_diet_plan_generation_1').callStream<AiDietPlanGenerationOneOutput>('textGenerate', input)
 * 每个 chunk 就是下面这个扁平对象，字段名与 AiDietPlanGenerationOneOutput 一致，外面没有 data / choices / message 包装：
 *   {"response":"示例文本","content":"示例文本"}
 * 返回值可能是 AsyncIterable<chunk>，也可能是 { output: AsyncIterable<chunk> }，取流前先归一化。
 * 逐段累加：
 *   for await (const chunk of stream) { result += chunk.response ?? ''; }
 */
export type AiDietPlanGenerationOneOutput = {
  response?: string;
  content: string;
};
// ---- end:ai_diet_plan_generation_1 ----