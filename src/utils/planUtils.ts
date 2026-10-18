// EXPORTS: sumNutrition, calcRemainingToGoal, getAchievementStatus, generateRuleBasedPlan
import type { IMealEntry, ISnackEntry, IAIPlanResult, INutritionGoal, MealType, IAIPlanDish } from '@/data/types';
import { NUTRITION_DB, ALL_FOODS, getPortionNutrition, type INutritionItem, type PortionSize } from '@/data/nutritionDB';

export interface NutritionSum {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export function sumNutrition(
  entries: { nutrition: { kcal: number; protein: number; fat: number; carbs: number } }[],
): NutritionSum {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.nutrition.kcal,
      protein: acc.protein + e.nutrition.protein,
      fat: acc.fat + e.nutrition.fat,
      carbs: acc.carbs + e.nutrition.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

export function sumDailyNutrition(dailyLog: {
  meals: { breakfast: IMealEntry[]; lunch: IMealEntry[]; dinner: IMealEntry[]; snack: IMealEntry[] };
}, snackLog: ISnackEntry[]): NutritionSum {
  const allMeals = [
    ...dailyLog.meals.breakfast,
    ...dailyLog.meals.lunch,
    ...dailyLog.meals.dinner,
    ...dailyLog.meals.snack,
  ];
  const mealSum = sumNutrition(allMeals);
  const snackSum = sumNutrition(snackLog);
  return {
    kcal: mealSum.kcal + snackSum.kcal,
    protein: mealSum.protein + snackSum.protein,
    fat: mealSum.fat + snackSum.fat,
    carbs: mealSum.carbs + snackSum.carbs,
  };
}

export function calcRemainingToGoal(
  consumed: NutritionSum,
  goal: INutritionGoal,
): { kcal: number; protein: number; fat: number; carbs: number } {
  return {
    kcal: Math.round(goal.targetKcal - consumed.kcal),
    protein: Math.round(goal.proteinG - consumed.protein),
    fat: Math.round(goal.fatG - consumed.fat),
    carbs: Math.round(goal.carbsG - consumed.carbs),
  };
}

export type AchievementStatus = 'exceed' | 'reach' | 'close' | 'gap';

export function getAchievementStatus(
  consumed: number,
  goal: number,
): { status: AchievementStatus; percent: number } {
  if (goal <= 0) return { status: 'gap', percent: 0 };
  const percent = Math.round((consumed / goal) * 100);
  if (percent >= 110) return { status: 'exceed', percent: Math.min(percent, 200) };
  if (percent >= 90) return { status: 'reach', percent };
  if (percent >= 60) return { status: 'close', percent };
  return { status: 'gap', percent };
}

// 按餐次分配目标比例
export function getMealTargetRatio(mealType: MealType): number {
  switch (mealType) {
    case 'breakfast':
      return 0.25;
    case 'lunch':
      return 0.35;
    case 'dinner':
      return 0.3;
    case 'snack':
      return 0.1;
    default:
      return 0.25;
  }
}

// 规则模板降级方案：按蛋白优先 + 热量控制，从营养库中挑常见菜组合
export function generateRuleBasedPlan(
  mealType: MealType,
  goal: INutritionGoal,
  availableFoods: INutritionItem[],
  currentConsumed: NutritionSum,
  onHandSnacks: ISnackEntry[],
): IAIPlanResult {
  const ratio = getMealTargetRatio(mealType);
  const mealKcalTarget = Math.round(goal.targetKcal * ratio);
  const mealProteinTarget = Math.round(goal.proteinG * ratio);

  // 从可用菜品或默认库中筛选
  const pool = availableFoods.length > 0 ? availableFoods : NUTRITION_DB;

  // 按蛋白/热量比排序（高性价比）
  const sorted = [...pool].sort((a, b) => {
    const ra = a.per100g.protein / Math.max(a.per100g.kcal, 1);
    const rb = b.per100g.protein / Math.max(b.per100g.kcal, 1);
    return rb - ra;
  });

  const selected: IAIPlanDish[] = [];
  let totalKcal = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  // 选1-2道高蛋白主菜
  const proteinDishes = sorted.filter((f) => f.per100g.protein >= 8 && f.category === 'dish').slice(0, 2);
  // 选1道素菜
  const veggie = sorted.find((f) => f.per100g.kcal <= 80 && f.category === 'dish');
  // 选1道主食
  const staple = pool.find((f) => f.tags?.includes('主食'));

  const portion: PortionSize = 'medium';

  // 根据目标选菜
  const dishes: INutritionItem[] = [];
  if (proteinDishes[0]) dishes.push(proteinDishes[0]);
  if (mealKcalTarget > 400 && proteinDishes[1]) dishes.push(proteinDishes[1]);
  if (veggie) dishes.push(veggie);
  if (staple && goal.carbsG > 100) dishes.push(staple);

  // 取中份并回库算营养
  for (const d of dishes.slice(0, 4)) {
    const nutri = getPortionNutrition(d, portion);
    selected.push({
      foodId: d.id,
      name: d.name,
      portion,
      kcal: nutri.kcal,
      protein_g: nutri.protein,
      fat_g: nutri.fat,
      carb_g: nutri.carbs,
    });
    totalKcal += nutri.kcal;
    totalProtein += nutri.protein;
    totalFat += nutri.fat;
    totalCarbs += nutri.carbs;
  }

  // 计算缺口
  const remainingKcal = Math.round(mealKcalTarget - totalKcal);
  const remainingProtein = Math.round(mealProteinTarget - totalProtein);

  // 生成建议
  const suggestions: string[] = [];
  if (remainingProtein > 10) {
    suggestions.push(`蛋白还差约 ${remainingProtein}g，可加一份高蛋白菜或一勺蛋白粉`);
  }
  if (remainingKcal > 200) {
    suggestions.push('热量偏低，可适当加量或配主食');
  }
  if (remainingKcal < -200) {
    suggestions.push('热量偏高，可减一份菜或换小份');
  }
  if (suggestions.length === 0) {
    suggestions.push('方案合理，可根据口味调整');
  }

  // 缺口补位
  let gapSupplement = '';
  if (remainingProtein > 15 && onHandSnacks.some((s) => s.foodName.includes('蛋白粉'))) {
    gapSupplement = '可用一勺乳清蛋白粉（约22g蛋白）补足蛋白缺口';
  } else if (remainingProtein > 10) {
    gapSupplement = '蛋白缺口建议下餐多吃一道高蛋白菜';
  } else if (remainingKcal > 300) {
    gapSupplement = '热量缺口可用香蕉或坚果补充';
  } else {
    gapSupplement = '整体均衡，按方案执行即可';
  }

  return {
    recommendedDishes: selected,
    mealTotal: {
      kcal: Math.round(totalKcal),
      protein: Math.round(totalProtein),
      fat: Math.round(totalFat),
      carbs: Math.round(totalCarbs),
    },
    remainingToGoal: {
      protein_remaining_g: remainingProtein,
      kcal_remaining: remainingKcal,
    },
    replacementSuggestions: suggestions,
    gapSupplement,
    warnings: [
      '此为离线模板方案，仅供参考。',
      '饮食调整应循序渐进，如有不适请及时就医。',
    ],
    isOfflineTemplate: true,
  };
}

// AI 返回结果后，逐项回营养库重算真实营养并覆盖 AI 自报数字
export function recalculateAIPlanWithDB(
  plan: IAIPlanResult,
  goal: INutritionGoal,
  mealType: MealType,
  onHandSnacks: ISnackEntry[],
): IAIPlanResult {
  const ratio = getMealTargetRatio(mealType);
  const mealKcalTarget = Math.round(goal.targetKcal * ratio);
  const mealProteinTarget = Math.round(goal.proteinG * ratio);

  let totalKcal = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  const recalculatedDishes = plan.recommendedDishes.map((dish) => {
    // 尝试按名匹配营养库
    let food: INutritionItem | undefined;
    if (dish.foodId) {
      food = ALL_FOODS.find((f) => f.id === dish.foodId);
    }
    if (!food) {
      // 按名称模糊匹配
      const name = dish.name.toLowerCase().trim();
      food = ALL_FOODS.find(
        (f) =>
          f.name.toLowerCase() === name ||
          f.name.toLowerCase().includes(name) ||
          name.includes(f.name.toLowerCase()),
      );
    }

    if (food) {
      const nutri = getPortionNutrition(food, dish.portion);
      totalKcal += nutri.kcal;
      totalProtein += nutri.protein;
      totalFat += nutri.fat;
      totalCarbs += nutri.carbs;
      return {
        foodId: food.id,
        name: food.name,
        portion: dish.portion,
        kcal: nutri.kcal,
        protein_g: nutri.protein,
        fat_g: nutri.fat,
        carb_g: nutri.carbs,
      };
    }

    // 匹配不到就保留原值
    totalKcal += dish.kcal || 0;
    totalProtein += dish.protein_g || 0;
    totalFat += dish.fat_g || 0;
    totalCarbs += dish.carb_g || 0;
    return dish;
  });

  const remainingKcal = Math.round(mealKcalTarget - totalKcal);
  const remainingProtein = Math.round(mealProteinTarget - totalProtein);

  // 智能缺口补位建议
  let gapSupplement = plan.gapSupplement;
  if (!gapSupplement || gapSupplement.length < 2) {
    if (remainingProtein > 15 && onHandSnacks.some((s) => s.foodName.includes('蛋白粉'))) {
      gapSupplement = '可用一勺乳清蛋白粉（约22g蛋白）补足蛋白缺口';
    } else if (remainingProtein > 10) {
      gapSupplement = `蛋白还差约 ${remainingProtein}g，下一餐多吃一道高蛋白菜`;
    } else if (remainingKcal > 200) {
      gapSupplement = `热量还差约 ${remainingKcal} kcal，可加一份主食或水果`;
    } else if (remainingKcal < -200) {
      gapSupplement = `热量超了约 ${Math.abs(remainingKcal)} kcal，下餐可适当减量`;
    } else {
      gapSupplement = '整体均衡，按方案执行即可';
    }
  }

  const warnings = plan.warnings || [];
  if (!warnings.some((w) => w.includes('饮食调整'))) {
    warnings.push('饮食调整应循序渐进，如有不适请及时就医。');
  }

  return {
    ...plan,
    recommendedDishes: recalculatedDishes,
    mealTotal: {
      kcal: Math.round(totalKcal),
      protein: Math.round(totalProtein),
      fat: Math.round(totalFat),
      carbs: Math.round(totalCarbs),
    },
    remainingToGoal: {
      protein_remaining_g: remainingProtein,
      kcal_remaining: remainingKcal,
    },
    gapSupplement,
    warnings,
  };
}
