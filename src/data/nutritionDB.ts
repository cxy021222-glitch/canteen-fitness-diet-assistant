// EXPORTS: INutritionItem, NUTRITION_DB, SNACK_DB, getFoodById, searchFoods, getPortionNutrition

export type PortionSize = 'small' | 'medium' | 'large';
export type FoodCategory = 'dish' | 'snack' | 'supplement';

export interface IPortionNutrition {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  gram: number;
}

export interface INutritionItem {
  id: string;
  name: string;
  category: FoodCategory;
  per100g: { kcal: number; protein: number; fat: number; carbs: number };
  portions: {
    small: IPortionNutrition;
    medium: IPortionNutrition;
    large: IPortionNutrition;
  };
  tags?: string[];
}

// 食堂菜品营养库（常见中餐，基于真实数据估算）
export const NUTRITION_DB: INutritionItem[] = [
  // 蛋白类主菜
  {
    id: 'F001',
    name: '清蒸鸡胸肉',
    category: 'dish',
    per100g: { kcal: 165, protein: 31, fat: 3.6, carbs: 0 },
    portions: {
      small: { kcal: 132, protein: 24.8, fat: 2.9, carbs: 0, gram: 80 },
      medium: { kcal: 198, protein: 37.2, fat: 4.3, carbs: 0, gram: 120 },
      large: { kcal: 264, protein: 49.6, fat: 5.8, carbs: 0, gram: 160 },
    },
    tags: ['高蛋白', '低脂', '鸡胸'],
  },
  {
    id: 'F002',
    name: '番茄炒蛋',
    category: 'dish',
    per100g: { kcal: 105, protein: 6.5, fat: 7, carbs: 4 },
    portions: {
      small: { kcal: 126, protein: 7.8, fat: 8.4, carbs: 4.8, gram: 120 },
      medium: { kcal: 189, protein: 11.7, fat: 12.6, carbs: 7.2, gram: 180 },
      large: { kcal: 252, protein: 15.6, fat: 16.8, carbs: 9.6, gram: 240 },
    },
    tags: ['家常菜', '鸡蛋'],
  },
  {
    id: 'F003',
    name: '红烧鸡腿',
    category: 'dish',
    per100g: { kcal: 210, protein: 22, fat: 13, carbs: 3 },
    portions: {
      small: { kcal: 210, protein: 22, fat: 13, carbs: 3, gram: 100 },
      medium: { kcal: 294, protein: 30.8, fat: 18.2, carbs: 4.2, gram: 140 },
      large: { kcal: 378, protein: 39.6, fat: 23.4, carbs: 5.4, gram: 180 },
    },
    tags: ['高蛋白', '鸡腿'],
  },
  {
    id: 'F004',
    name: '香煎巴沙鱼',
    category: 'dish',
    per100g: { kcal: 130, protein: 22, fat: 4, carbs: 0 },
    portions: {
      small: { kcal: 130, protein: 22, fat: 4, carbs: 0, gram: 100 },
      medium: { kcal: 195, protein: 33, fat: 6, carbs: 0, gram: 150 },
      large: { kcal: 260, protein: 44, fat: 8, carbs: 0, gram: 200 },
    },
    tags: ['高蛋白', '低脂', '鱼肉'],
  },
  {
    id: 'F005',
    name: '卤牛肉',
    category: 'dish',
    per100g: { kcal: 210, protein: 30, fat: 10, carbs: 1 },
    portions: {
      small: { kcal: 105, protein: 15, fat: 5, carbs: 0.5, gram: 50 },
      medium: { kcal: 168, protein: 24, fat: 8, carbs: 0.8, gram: 80 },
      large: { kcal: 231, protein: 33, fat: 11, carbs: 1.1, gram: 110 },
    },
    tags: ['高蛋白', '牛肉'],
  },
  {
    id: 'F006',
    name: '宫保鸡丁',
    category: 'dish',
    per100g: { kcal: 170, protein: 15, fat: 10, carbs: 8 },
    portions: {
      small: { kcal: 170, protein: 15, fat: 10, carbs: 8, gram: 100 },
      medium: { kcal: 255, protein: 22.5, fat: 15, carbs: 12, gram: 150 },
      large: { kcal: 340, protein: 30, fat: 20, carbs: 16, gram: 200 },
    },
    tags: ['中辣', '鸡肉'],
  },
  {
    id: 'F007',
    name: '青椒肉丝',
    category: 'dish',
    per100g: { kcal: 140, protein: 12, fat: 8, carbs: 5 },
    portions: {
      small: { kcal: 140, protein: 12, fat: 8, carbs: 5, gram: 100 },
      medium: { kcal: 210, protein: 18, fat: 12, carbs: 7.5, gram: 150 },
      large: { kcal: 280, protein: 24, fat: 16, carbs: 10, gram: 200 },
    },
    tags: ['猪肉', '微辣'],
  },
  {
    id: 'F008',
    name: '麻婆豆腐',
    category: 'dish',
    per100g: { kcal: 120, protein: 8, fat: 7, carbs: 6 },
    portions: {
      small: { kcal: 144, protein: 9.6, fat: 8.4, carbs: 7.2, gram: 120 },
      medium: { kcal: 216, protein: 14.4, fat: 12.6, carbs: 10.8, gram: 180 },
      large: { kcal: 288, protein: 19.2, fat: 16.8, carbs: 14.4, gram: 240 },
    },
    tags: ['豆制品', '辣', '植物蛋白'],
  },
  // 素菜
  {
    id: 'F101',
    name: '清炒西兰花',
    category: 'dish',
    per100g: { kcal: 40, protein: 3, fat: 2, carbs: 4 },
    portions: {
      small: { kcal: 60, protein: 4.5, fat: 3, carbs: 6, gram: 150 },
      medium: { kcal: 80, protein: 6, fat: 4, carbs: 8, gram: 200 },
      large: { kcal: 120, protein: 9, fat: 6, carbs: 12, gram: 300 },
    },
    tags: ['素菜', '高纤维'],
  },
  {
    id: 'F102',
    name: '蒜蓉油麦菜',
    category: 'dish',
    per100g: { kcal: 35, protein: 2, fat: 2, carbs: 3 },
    portions: {
      small: { kcal: 52, protein: 3, fat: 3, carbs: 4.5, gram: 150 },
      medium: { kcal: 70, protein: 4, fat: 4, carbs: 6, gram: 200 },
      large: { kcal: 105, protein: 6, fat: 6, carbs: 9, gram: 300 },
    },
    tags: ['素菜', '绿叶菜'],
  },
  {
    id: 'F103',
    name: '醋溜土豆丝',
    category: 'dish',
    per100g: { kcal: 90, protein: 2, fat: 3, carbs: 15 },
    portions: {
      small: { kcal: 135, protein: 3, fat: 4.5, carbs: 22.5, gram: 150 },
      medium: { kcal: 180, protein: 4, fat: 6, carbs: 30, gram: 200 },
      large: { kcal: 270, protein: 6, fat: 9, carbs: 45, gram: 300 },
    },
    tags: ['素菜', '高碳水'],
  },
  {
    id: 'F104',
    name: '番茄炒鸡蛋',
    category: 'dish',
    per100g: { kcal: 105, protein: 6.5, fat: 7, carbs: 4 },
    portions: {
      small: { kcal: 126, protein: 7.8, fat: 8.4, carbs: 4.8, gram: 120 },
      medium: { kcal: 189, protein: 11.7, fat: 12.6, carbs: 7.2, gram: 180 },
      large: { kcal: 252, protein: 15.6, fat: 16.8, carbs: 9.6, gram: 240 },
    },
    tags: ['家常菜', '鸡蛋'],
  },
  {
    id: 'F105',
    name: '凉拌黄瓜',
    category: 'dish',
    per100g: { kcal: 20, protein: 1, fat: 1, carbs: 2 },
    portions: {
      small: { kcal: 30, protein: 1.5, fat: 1.5, carbs: 3, gram: 150 },
      medium: { kcal: 40, protein: 2, fat: 2, carbs: 4, gram: 200 },
      large: { kcal: 60, protein: 3, fat: 3, carbs: 6, gram: 300 },
    },
    tags: ['素菜', '低卡'],
  },
  {
    id: 'F106',
    name: '炒小白菜',
    category: 'dish',
    per100g: { kcal: 30, protein: 2, fat: 1.5, carbs: 3 },
    portions: {
      small: { kcal: 45, protein: 3, fat: 2.25, carbs: 4.5, gram: 150 },
      medium: { kcal: 60, protein: 4, fat: 3, carbs: 6, gram: 200 },
      large: { kcal: 90, protein: 6, fat: 4.5, carbs: 9, gram: 300 },
    },
    tags: ['素菜', '绿叶菜'],
  },
  // 主食
  {
    id: 'F201',
    name: '白米饭',
    category: 'dish',
    per100g: { kcal: 116, protein: 2.6, fat: 0.3, carbs: 25.9 },
    portions: {
      small: { kcal: 174, protein: 3.9, fat: 0.45, carbs: 38.85, gram: 150 },
      medium: { kcal: 232, protein: 5.2, fat: 0.6, carbs: 51.8, gram: 200 },
      large: { kcal: 348, protein: 7.8, fat: 0.9, carbs: 77.7, gram: 300 },
    },
    tags: ['主食', '高碳水'],
  },
  {
    id: 'F202',
    name: '杂粮饭',
    category: 'dish',
    per100g: { kcal: 120, protein: 4, fat: 1, carbs: 24 },
    portions: {
      small: { kcal: 180, protein: 6, fat: 1.5, carbs: 36, gram: 150 },
      medium: { kcal: 240, protein: 8, fat: 2, carbs: 48, gram: 200 },
      large: { kcal: 360, protein: 12, fat: 3, carbs: 72, gram: 300 },
    },
    tags: ['主食', '粗粮'],
  },
  {
    id: 'F203',
    name: '馒头',
    category: 'dish',
    per100g: { kcal: 223, protein: 7, fat: 1.1, carbs: 47 },
    portions: {
      small: { kcal: 223, protein: 7, fat: 1.1, carbs: 47, gram: 100 },
      medium: { kcal: 334.5, protein: 10.5, fat: 1.65, carbs: 70.5, gram: 150 },
      large: { kcal: 446, protein: 14, fat: 2.2, carbs: 94, gram: 200 },
    },
    tags: ['主食', '面食'],
  },
  {
    id: 'F204',
    name: '牛肉面',
    category: 'dish',
    per100g: { kcal: 130, protein: 8, fat: 4, carbs: 15 },
    portions: {
      small: { kcal: 325, protein: 20, fat: 10, carbs: 37.5, gram: 250 },
      medium: { kcal: 455, protein: 28, fat: 14, carbs: 52.5, gram: 350 },
      large: { kcal: 585, protein: 36, fat: 18, carbs: 67.5, gram: 450 },
    },
    tags: ['主食', '面食', '牛肉'],
  },
  // 早餐
  {
    id: 'F301',
    name: '茶叶蛋',
    category: 'dish',
    per100g: { kcal: 140, protein: 12, fat: 9, carbs: 1 },
    portions: {
      small: { kcal: 70, protein: 6, fat: 4.5, carbs: 0.5, gram: 50 },
      medium: { kcal: 84, protein: 7.2, fat: 5.4, carbs: 0.6, gram: 60 },
      large: { kcal: 140, protein: 12, fat: 9, carbs: 1, gram: 100 },
    },
    tags: ['高蛋白', '鸡蛋', '早餐'],
  },
  {
    id: 'F302',
    name: '豆浆',
    category: 'dish',
    per100g: { kcal: 30, protein: 2, fat: 1.5, carbs: 2 },
    portions: {
      small: { kcal: 75, protein: 5, fat: 3.75, carbs: 5, gram: 250 },
      medium: { kcal: 90, protein: 6, fat: 4.5, carbs: 6, gram: 300 },
      large: { kcal: 120, protein: 8, fat: 6, carbs: 8, gram: 400 },
    },
    tags: ['豆制品', '早餐', '植物蛋白'],
  },
  {
    id: 'F303',
    name: '包子（肉包）',
    category: 'dish',
    per100g: { kcal: 230, protein: 8, fat: 8, carbs: 32 },
    portions: {
      small: { kcal: 184, protein: 6.4, fat: 6.4, carbs: 25.6, gram: 80 },
      medium: { kcal: 276, protein: 9.6, fat: 9.6, carbs: 38.4, gram: 120 },
      large: { kcal: 368, protein: 12.8, fat: 12.8, carbs: 51.2, gram: 160 },
    },
    tags: ['主食', '早餐'],
  },
  {
    id: 'F304',
    name: '燕麦粥',
    category: 'dish',
    per100g: { kcal: 70, protein: 2.5, fat: 1, carbs: 12 },
    portions: {
      small: { kcal: 175, protein: 6.25, fat: 2.5, carbs: 30, gram: 250 },
      medium: { kcal: 245, protein: 8.75, fat: 3.5, carbs: 42, gram: 350 },
      large: { kcal: 315, protein: 11.25, fat: 4.5, carbs: 54, gram: 450 },
    },
    tags: ['主食', '早餐', '粗粮'],
  },
  // 油炸/高热量
  {
    id: 'F401',
    name: '炸鸡块',
    category: 'dish',
    per100g: { kcal: 290, protein: 18, fat: 20, carbs: 10 },
    portions: {
      small: { kcal: 145, protein: 9, fat: 10, carbs: 5, gram: 50 },
      medium: { kcal: 290, protein: 18, fat: 20, carbs: 10, gram: 100 },
      large: { kcal: 435, protein: 27, fat: 30, carbs: 15, gram: 150 },
    },
    tags: ['油炸', '高热量', '鸡肉'],
  },
];

// 零食与补给库
export const SNACK_DB: INutritionItem[] = [
  {
    id: 'S001',
    name: '乳清蛋白粉（一勺）',
    category: 'supplement',
    per100g: { kcal: 380, protein: 76, fat: 7, carbs: 6 },
    portions: {
      small: { kcal: 114, protein: 22.8, fat: 2.1, carbs: 1.8, gram: 30 },
      medium: { kcal: 114, protein: 22.8, fat: 2.1, carbs: 1.8, gram: 30 },
      large: { kcal: 228, protein: 45.6, fat: 4.2, carbs: 3.6, gram: 60 },
    },
    tags: ['补给', '高蛋白', '一勺30g'],
  },
  {
    id: 'S002',
    name: '蛋白棒',
    category: 'snack',
    per100g: { kcal: 400, protein: 30, fat: 12, carbs: 35 },
    portions: {
      small: { kcal: 240, protein: 18, fat: 7.2, carbs: 21, gram: 60 },
      medium: { kcal: 240, protein: 18, fat: 7.2, carbs: 21, gram: 60 },
      large: { kcal: 400, protein: 30, fat: 12, carbs: 35, gram: 100 },
    },
    tags: ['零食', '高蛋白'],
  },
  {
    id: 'S003',
    name: '牛奶（250ml）',
    category: 'snack',
    per100g: { kcal: 54, protein: 3.2, fat: 3.2, carbs: 3.4 },
    portions: {
      small: { kcal: 135, protein: 8, fat: 8, carbs: 8.5, gram: 250 },
      medium: { kcal: 135, protein: 8, fat: 8, carbs: 8.5, gram: 250 },
      large: { kcal: 270, protein: 16, fat: 16, carbs: 17, gram: 500 },
    },
    tags: ['乳制品', '饮品'],
  },
  {
    id: 'S004',
    name: '香蕉',
    category: 'snack',
    per100g: { kcal: 89, protein: 1.1, fat: 0.3, carbs: 23 },
    portions: {
      small: { kcal: 89, protein: 1.1, fat: 0.3, carbs: 23, gram: 100 },
      medium: { kcal: 107, protein: 1.3, fat: 0.4, carbs: 27.6, gram: 120 },
      large: { kcal: 134, protein: 1.7, fat: 0.5, carbs: 34.5, gram: 150 },
    },
    tags: ['水果', '高碳水'],
  },
  {
    id: 'S005',
    name: '混合坚果（一小把）',
    category: 'snack',
    per100g: { kcal: 600, protein: 20, fat: 50, carbs: 20 },
    portions: {
      small: { kcal: 180, protein: 6, fat: 15, carbs: 6, gram: 30 },
      medium: { kcal: 180, protein: 6, fat: 15, carbs: 6, gram: 30 },
      large: { kcal: 300, protein: 10, fat: 25, carbs: 10, gram: 50 },
    },
    tags: ['坚果', '高脂'],
  },
  {
    id: 'S006',
    name: '即食鸡胸肉肠',
    category: 'snack',
    per100g: { kcal: 120, protein: 20, fat: 3, carbs: 2 },
    portions: {
      small: { kcal: 60, protein: 10, fat: 1.5, carbs: 1, gram: 50 },
      medium: { kcal: 72, protein: 12, fat: 1.8, carbs: 1.2, gram: 60 },
      large: { kcal: 120, protein: 20, fat: 3, carbs: 2, gram: 100 },
    },
    tags: ['高蛋白', '低脂'],
  },
  {
    id: 'S007',
    name: '无糖酸奶',
    category: 'snack',
    per100g: { kcal: 59, protein: 10, fat: 1, carbs: 3 },
    portions: {
      small: { kcal: 106, protein: 18, fat: 1.8, carbs: 5.4, gram: 180 },
      medium: { kcal: 118, protein: 20, fat: 2, carbs: 6, gram: 200 },
      large: { kcal: 177, protein: 30, fat: 3, carbs: 9, gram: 300 },
    },
    tags: ['乳制品', '高蛋白'],
  },
  {
    id: 'S008',
    name: '蛋白饮料',
    category: 'supplement',
    per100g: { kcal: 40, protein: 7, fat: 0.5, carbs: 2 },
    portions: {
      small: { kcal: 140, protein: 24.5, fat: 1.75, carbs: 7, gram: 350 },
      medium: { kcal: 140, protein: 24.5, fat: 1.75, carbs: 7, gram: 350 },
      large: { kcal: 200, protein: 35, fat: 2.5, carbs: 10, gram: 500 },
    },
    tags: ['补给', '高蛋白', '饮品'],
  },
];

// 合并全部菜品用于搜索
export const ALL_FOODS: INutritionItem[] = [...NUTRITION_DB, ...SNACK_DB];

export function getFoodById(id: string): INutritionItem | undefined {
  return ALL_FOODS.find((f) => f.id === id);
}

export function getPortionNutrition(
  food: INutritionItem,
  portion: PortionSize,
): IPortionNutrition {
  return food.portions[portion];
}

export function searchFoods(keyword: string): INutritionItem[] {
  if (!keyword.trim()) return NUTRITION_DB;
  const k = keyword.toLowerCase();
  return ALL_FOODS.filter(
    (f) =>
      f.name.toLowerCase().includes(k) ||
      (f.tags && f.tags.some((t) => t.toLowerCase().includes(k))),
  );
}

export function searchDishOnly(keyword: string): INutritionItem[] {
  if (!keyword.trim()) return NUTRITION_DB;
  const k = keyword.toLowerCase();
  return NUTRITION_DB.filter(
    (f) =>
      f.name.toLowerCase().includes(k) ||
      (f.tags && f.tags.some((t) => t.toLowerCase().includes(k))),
  );
}
