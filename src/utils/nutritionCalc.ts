// EXPORTS: calculateBMI, calculateBMR, calculateActivityFactor, calculateTDEE, calculateTargetKcal, calculateMacros, calculateNutritionGoal, getSafetyFloor
import type {
  Gender,
  GoalType,
  INutritionGoal,
  TrainingFrequency,
  TrainingIntensity,
} from '@/data/types';

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function calculateBMR(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  // Mifflin-St Jeor formula
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

export function getActivityFactorBase(freq: TrainingFrequency): number {
  switch (freq) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'heavy':
      return 1.725;
    default:
      return 1.2;
  }
}

export function calculateActivityFactor(
  freq: TrainingFrequency,
  intensity: TrainingIntensity,
): number {
  const base = getActivityFactorBase(freq);
  // 训练强度小幅修正
  let adjustment = 0;
  if (intensity === 'high') adjustment = 0.05;
  if (intensity === 'low') adjustment = -0.05;
  return Number((base + adjustment).toFixed(3));
}

export function calculateTDEE(
  bmr: number,
  activityFactor: number,
  workoutIntensity?: 'easy' | 'moderate' | 'hard' | null,
  hasWorkout?: boolean,
): number {
  let factor = activityFactor;
  // 如果当天有训练，再小幅加成
  if (hasWorkout) {
    if (workoutIntensity === 'hard') factor += 0.05;
    else if (workoutIntensity === 'moderate') factor += 0.03;
    else if (workoutIntensity === 'easy') factor += 0.01;
  }
  return Math.round(bmr * factor);
}

export function getSafetyFloor(gender: Gender): number {
  return gender === 'male' ? 1500 : 1200;
}

export function calculateTargetKcal(
  tdee: number,
  goal: GoalType,
  gender: Gender,
): { targetKcal: number; isSafetyFloorApplied: boolean; safetyFloorNote?: string } {
  let target = tdee;
  if (goal === 'bulk') target = tdee + 250;
  else if (goal === 'cut') target = tdee - 400;

  const floor = getSafetyFloor(gender);
  const isSafetyFloorApplied = goal === 'cut' && target < floor;
  if (isSafetyFloorApplied) {
    return {
      targetKcal: floor,
      isSafetyFloorApplied: true,
      safetyFloorNote: `减脂目标已触安全下限（${gender === 'male' ? '男性' : '女性'}${floor} kcal/天），按下限取值，请勿长期低于此值。`,
    };
  }
  return { targetKcal: target, isSafetyFloorApplied: false };
}

export function calculateMacros(
  weightKg: number,
  targetKcal: number,
  goal: GoalType,
): { proteinG: number; fatG: number; carbsG: number } {
  // 蛋白 g/kg：增肌中值2.0、减脂中值1.8、维持中值1.5
  let proteinPerKg = 2.0;
  if (goal === 'cut') proteinPerKg = 1.8;
  else if (goal === 'maintain') proteinPerKg = 1.5;

  // 脂肪 g/kg：中值 0.9
  const fatPerKg = 0.9;

  const proteinG = Math.round(weightKg * proteinPerKg);
  const fatG = Math.round(weightKg * fatPerKg);
  const carbsG = Math.round((targetKcal - proteinG * 4 - fatG * 9) / 4);

  return { proteinG, fatG, carbsG: Math.max(0, carbsG) };
}

export function calculateNutritionGoal(
  gender: Gender,
  age: number,
  heightCm: number,
  weightKg: number,
  freq: TrainingFrequency,
  intensity: TrainingIntensity,
  goal: GoalType,
  hasBodyFat: boolean,
  workoutIntensity?: 'easy' | 'moderate' | 'hard' | null,
  hasWorkout?: boolean,
): INutritionGoal {
  const bmi = calculateBMI(weightKg, heightCm);
  const bmr = calculateBMR(gender, weightKg, heightCm, age);
  const activityFactor = calculateActivityFactor(freq, intensity);
  const tdee = calculateTDEE(bmr, activityFactor, workoutIntensity, hasWorkout);
  const targetResult = calculateTargetKcal(tdee, goal, gender);
  const macros = calculateMacros(weightKg, targetResult.targetKcal, goal);

  return {
    bmi,
    bmr,
    tdee,
    targetKcal: targetResult.targetKcal,
    proteinG: macros.proteinG,
    fatG: macros.fatG,
    carbsG: macros.carbsG,
    isEstimatedBodyFat: !hasBodyFat,
    isSafetyFloorApplied: targetResult.isSafetyFloorApplied,
    safetyFloorNote: targetResult.safetyFloorNote,
    activityFactor,
  };
}
