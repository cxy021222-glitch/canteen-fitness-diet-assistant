// EXPORTS: IUserProfile, INutritionGoal, IMealEntry, IDailyLog, ISnackEntry, IWorkoutLog, ICustomFood, IAIPlanResult, MealType, TrainingFrequency, TrainingIntensity, GoalType, PortionSize

import type { PortionSize } from './nutritionDB';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type TrainingFrequency = 'sedentary' | 'light' | 'moderate' | 'heavy';
export type TrainingIntensity = 'low' | 'medium' | 'high';
export type GoalType = 'bulk' | 'cut' | 'maintain';
export type Gender = 'male' | 'female';
export type EntrySource =
  | 'photo_recognition'
  | 'manual_search'
  | 'ai_recommendation'
  | 'custom_input';

export interface IUserProfile {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  bodyFat?: number;
  trainingFrequency: TrainingFrequency;
  trainingIntensity: TrainingIntensity;
  goal: GoalType;
  dietaryRestrictions: string[];
  customRestrictions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INutritionGoal {
  bmi: number;
  bmr: number;
  tdee: number;
  targetKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  isEstimatedBodyFat: boolean;
  isSafetyFloorApplied: boolean;
  safetyFloorNote?: string;
  activityFactor: number;
}

export interface IMealEntry {
  id: string;
  foodId: string;
  foodName: string;
  portion: PortionSize;
  nutrition: { kcal: number; protein: number; fat: number; carbs: number };
  source: EntrySource;
  mealType: MealType;
  addedAt: string;
  isCustom?: boolean;
}

export interface IDailyLog {
  date: string;
  meals: {
    breakfast: IMealEntry[];
    lunch: IMealEntry[];
    dinner: IMealEntry[];
    snack: IMealEntry[];
  };
}

export interface ISnackEntry {
  id: string;
  foodId: string;
  foodName: string;
  portion: PortionSize;
  nutrition: { kcal: number; protein: number; fat: number; carbs: number };
  source: 'preset' | 'custom_input';
  addedAt: string;
  isCustom?: boolean;
}

export interface IWorkoutLog {
  date: string;
  hasWorkout: boolean;
  bodyParts: string[];
  intensity: 'easy' | 'moderate' | 'hard';
}

export interface ICustomFood {
  id: string;
  name: string;
  category: 'dish' | 'snack';
  per100g: { kcal: number; protein: number; fat: number; carbs: number };
  isPendingReview: boolean;
  createdAt: string;
}

export interface IAIPlanDish {
  foodId?: string;
  name: string;
  portion: PortionSize;
  kcal?: number;
  protein_g?: number;
  fat_g?: number;
  carb_g?: number;
}

export interface IAIPlanResult {
  recommendedDishes: IAIPlanDish[];
  mealTotal: { kcal: number; protein: number; fat: number; carbs: number };
  remainingToGoal: {
    protein_remaining_g: number;
    kcal_remaining: number;
  };
  replacementSuggestions: string[];
  gapSupplement: string;
  warnings: string[];
  isOfflineTemplate: boolean;
}
