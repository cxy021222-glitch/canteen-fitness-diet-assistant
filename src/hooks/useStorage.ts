// EXPORTS: useProfile, useDailyLog, useSnackLog, useWorkoutLog, useCustomFoods, PROFILE_KEY, DAILY_LOG_KEY, SNACK_LOG_KEY, WORKOUT_LOG_KEY, CUSTOM_FOODS_KEY, PROFILE_DRAFT_KEY
import { useState, useEffect, useCallback } from 'react';
import { scopedStorage, logger } from '@lark-apaas/client-toolkit-lite';
import type {
  IUserProfile,
  IDailyLog,
  ISnackEntry,
  IWorkoutLog,
  ICustomFood,
  IMealEntry,
} from '@/data/types';

const PROFILE_KEY = 'canteen_fit_profile';
const PROFILE_DRAFT_KEY = 'canteen_fit_profile_draft';
const DAILY_LOG_KEY_PREFIX = 'canteen_fit_daily_log_';
const SNACK_LOG_KEY_PREFIX = 'canteen_fit_snack_log_';
const WORKOUT_LOG_KEY_PREFIX = 'canteen_fit_workout_';
const CUSTOM_FOODS_KEY = 'canteen_fit_custom_foods';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

export function getDailyLogKey(date?: string): string {
  return `${DAILY_LOG_KEY_PREFIX}${date || getTodayKey()}`;
}
export function getSnackLogKey(date?: string): string {
  return `${SNACK_LOG_KEY_PREFIX}${date || getTodayKey()}`;
}
export function getWorkoutLogKey(date?: string): string {
  return `${WORKOUT_LOG_KEY_PREFIX}${date || getTodayKey()}`;
}

function createEmptyDailyLog(date: string): IDailyLog {
  return {
    date,
    meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
  };
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = scopedStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    logger.error('storage read error:', String(e));
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    scopedStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    logger.error('storage write error:', String(e));
  }
}

// Profile
export function useProfile() {
  const [profile, setProfile] = useState<IUserProfile | null>(null);

  useEffect(() => {
    const p = safeGet<IUserProfile | null>(PROFILE_KEY, null);
    setProfile(p);
  }, []);

  const saveProfile = useCallback((p: IUserProfile) => {
    safeSet(PROFILE_KEY, p);
    setProfile(p);
  }, []);

  const clearProfile = useCallback(() => {
    scopedStorage.removeItem(PROFILE_KEY);
    setProfile(null);
  }, []);

  const saveDraft = useCallback((draft: Partial<IUserProfile>) => {
    safeSet(PROFILE_DRAFT_KEY, draft);
  }, []);

  const loadDraft = useCallback((): Partial<IUserProfile> | null => {
    return safeGet<Partial<IUserProfile> | null>(PROFILE_DRAFT_KEY, null);
  }, []);

  const clearDraft = useCallback(() => {
    scopedStorage.removeItem(PROFILE_DRAFT_KEY);
  }, []);

  return { profile, saveProfile, clearProfile, saveDraft, loadDraft, clearDraft };
}

// Daily Log
export function useDailyLog(date?: string) {
  const [dailyLog, setDailyLog] = useState<IDailyLog | null>(null);
  const key = getDailyLogKey(date);

  useEffect(() => {
    const d = safeGet<IDailyLog | null>(key, null);
    if (d) {
      setDailyLog(d);
    } else {
      const empty = createEmptyDailyLog(date || getTodayKey());
      setDailyLog(empty);
      safeSet(key, empty);
    }
  }, [key, date]);

  const addMealEntry = useCallback(
    (mealType: IMealEntry['mealType'], entry: IMealEntry) => {
      setDailyLog((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          meals: {
            ...prev.meals,
            [mealType]: [...prev.meals[mealType], entry],
          },
        };
        safeSet(key, next);
        return next;
      });
    },
    [key],
  );

  const removeMealEntry = useCallback(
    (mealType: IMealEntry['mealType'], entryId: string) => {
      setDailyLog((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          meals: {
            ...prev.meals,
            [mealType]: prev.meals[mealType].filter((e) => e.id !== entryId),
          },
        };
        safeSet(key, next);
        return next;
      });
    },
    [key],
  );

  const updateMealEntryPortion = useCallback(
    (
      mealType: IMealEntry['mealType'],
      entryId: string,
      portion: IMealEntry['portion'],
      nutrition: IMealEntry['nutrition'],
    ) => {
      setDailyLog((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          meals: {
            ...prev.meals,
            [mealType]: prev.meals[mealType].map((e) =>
              e.id === entryId ? { ...e, portion, nutrition } : e,
            ),
          },
        };
        safeSet(key, next);
        return next;
      });
    },
    [key],
  );

  return { dailyLog, addMealEntry, removeMealEntry, updateMealEntryPortion, setDailyLog };
}

// Snack Log
export function useSnackLog(date?: string) {
  const [snackLog, setSnackLog] = useState<ISnackEntry[]>([]);
  const key = getSnackLogKey(date);

  useEffect(() => {
    const list = safeGet<ISnackEntry[]>(key, []);
    setSnackLog(list);
  }, [key]);

  const addSnack = useCallback(
    (entry: ISnackEntry) => {
      setSnackLog((prev) => {
        const next = [...prev, entry];
        safeSet(key, next);
        return next;
      });
    },
    [key],
  );

  const removeSnack = useCallback(
    (id: string) => {
      setSnackLog((prev) => {
        const next = prev.filter((s) => s.id !== id);
        safeSet(key, next);
        return next;
      });
    },
    [key],
  );

  const updateSnackPortion = useCallback(
    (
      id: string,
      portion: ISnackEntry['portion'],
      nutrition: ISnackEntry['nutrition'],
    ) => {
      setSnackLog((prev) => {
        const next = prev.map((s) =>
          s.id === id ? { ...s, portion, nutrition } : s,
        );
        safeSet(key, next);
        return next;
      });
    },
    [key],
  );

  return { snackLog, addSnack, removeSnack, updateSnackPortion };
}

// Workout Log
export function useWorkoutLog(date?: string) {
  const [workoutLog, setWorkoutLog] = useState<IWorkoutLog | null>(null);
  const key = getWorkoutLogKey(date);

  useEffect(() => {
    const w = safeGet<IWorkoutLog | null>(key, null);
    if (!w) {
      const empty: IWorkoutLog = {
        date: date || getTodayKey(),
        hasWorkout: false,
        bodyParts: [],
        intensity: 'moderate',
      };
      setWorkoutLog(empty);
    } else {
      setWorkoutLog(w);
    }
  }, [key, date]);

  const saveWorkout = useCallback(
    (w: IWorkoutLog) => {
      safeSet(key, w);
      setWorkoutLog(w);
    },
    [key],
  );

  return { workoutLog, saveWorkout };
}

// Custom Foods
export function useCustomFoods() {
  const [customFoods, setCustomFoods] = useState<ICustomFood[]>([]);

  useEffect(() => {
    const list = safeGet<ICustomFood[]>(CUSTOM_FOODS_KEY, []);
    setCustomFoods(list);
  }, []);

  const addCustomFood = useCallback((food: ICustomFood) => {
    setCustomFoods((prev) => {
      const next = [...prev, food];
      safeSet(CUSTOM_FOODS_KEY, next);
      return next;
    });
  }, []);

  return { customFoods, addCustomFood };
}

export { getTodayKey };
