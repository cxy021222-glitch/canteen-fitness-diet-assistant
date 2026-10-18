import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Target, AlertTriangle, Plus, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile, useDailyLog, useSnackLog, useWorkoutLog } from '@/hooks/useStorage';
import { calculateNutritionGoal } from '@/utils/nutritionCalc';
import {
  sumDailyNutrition,
  calcRemainingToGoal,
  getAchievementStatus,
  type AchievementStatus,
} from '@/utils/planUtils';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<AchievementStatus, string> = {
  exceed: 'text-warning',
  reach: 'text-success',
  close: 'text-warning',
  gap: 'text-destructive',
};

const STATUS_LABELS: Record<AchievementStatus, string> = {
  exceed: '已超',
  reach: '达标',
  close: '接近',
  gap: '缺口',
};

const MEAL_LABELS = [
  { key: 'breakfast', label: '早餐' },
  { key: 'lunch', label: '午餐' },
  { key: 'dinner', label: '晚餐' },
  { key: 'snack', label: '加餐' },
] as const;

// 环形进度组件
function ProgressRing({
  percent,
  size = 160,
  strokeWidth = 12,
  color = 'hsl(var(--primary))',
  label,
  value,
  unit,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  value: number;
  unit: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percent, 200) / 200) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
        <span className="mt-0.5 text-xs font-medium text-primary">{label}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { dailyLog } = useDailyLog();
  const { snackLog } = useSnackLog();
  const { workoutLog } = useWorkoutLog();

  const goal = useMemo(() => {
    if (!profile) return null;
    return calculateNutritionGoal(
      profile.gender,
      profile.age,
      profile.height,
      profile.weight,
      profile.trainingFrequency,
      profile.trainingIntensity,
      profile.goal,
      !!profile.bodyFat,
      workoutLog?.intensity,
      workoutLog?.hasWorkout,
    );
  }, [profile, workoutLog]);

  const consumed = useMemo(() => {
    if (!dailyLog) return { kcal: 0, protein: 0, fat: 0, carbs: 0 };
    return sumDailyNutrition(dailyLog, snackLog);
  }, [dailyLog, snackLog]);

  const remaining = useMemo(() => {
    if (!goal) return { kcal: 0, protein: 0, fat: 0, carbs: 0 };
    return calcRemainingToGoal(consumed, goal);
  }, [consumed, goal]);

  const kcalStatus = useMemo(() => getAchievementStatus(consumed.kcal, goal?.targetKcal || 1), [consumed.kcal, goal?.targetKcal]);
  const proteinStatus = useMemo(() => getAchievementStatus(consumed.protein, goal?.proteinG || 1), [consumed.protein, goal?.proteinG]);

  // 未建档状态
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background px-4 pt-8">
        <div className="flex flex-col items-center pt-12 text-center">
          <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10">
            <Target className="size-10 text-primary" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">食堂餐训</h1>
          <p className="mb-10 max-w-xs text-sm text-muted-foreground">
            拍一拍、选一选，AI 帮你在食堂吃出增肌减脂好身材
          </p>

          <Button size="lg" onClick={() => navigate('/profile/form')} className="w-full max-w-xs">
            <UserPlus className="mr-2 size-5" />
            开始建档
          </Button>

          <p className="mt-8 max-w-xs text-[11px] leading-relaxed text-muted-foreground">
            本应用提供一般性饮食参考，不替代医生/注册营养师的专业建议。
            孕妇、慢性病患者、进食障碍人群、未成年人请咨询专业人士后使用。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-4">
      {/* 顶部问候 + 目标概览卡 */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                今日目标 · {profile.goal === 'bulk' ? '增肌' : profile.goal === 'cut' ? '减脂' : '维持'}
              </div>
              <div className="text-xs text-muted-foreground">
                {goal?.targetKcal} kcal · 蛋白 {goal?.proteinG}g
              </div>
            </div>
            <Badge variant="outline" className="bg-background/50">
              <Flame className="mr-1 size-3 text-primary" />
              目标
            </Badge>
          </div>

          {/* 双环展示：热量 + 蛋白 */}
          <div className="flex items-center justify-around py-2">
            <ProgressRing
              percent={kcalStatus.percent}
              size={130}
              strokeWidth={10}
              color={
                kcalStatus.status === 'reach'
                  ? 'hsl(var(--success))'
                  : kcalStatus.status === 'close'
                    ? 'hsl(var(--warning))'
                    : kcalStatus.status === 'exceed'
                      ? profile.goal === 'cut'
                        ? 'hsl(var(--destructive))'
                        : 'hsl(var(--warning))'
                      : 'hsl(var(--primary))'
              }
              label={`${STATUS_LABELS[kcalStatus.status]}`}
              value={consumed.kcal}
              unit={`/ ${goal?.targetKcal} kcal`}
            />
            <ProgressRing
              percent={proteinStatus.percent}
              size={130}
              strokeWidth={10}
              color={
                proteinStatus.status === 'reach'
                  ? 'hsl(var(--success))'
                  : proteinStatus.status === 'close'
                    ? 'hsl(var(--warning))'
                    : 'hsl(var(--primary))'
              }
              label={`蛋白${STATUS_LABELS[proteinStatus.status]}`}
              value={Math.round(consumed.protein)}
              unit={`/ ${goal?.proteinG} g`}
            />
          </div>

          {goal?.isSafetyFloorApplied && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-warning/10 p-2 text-xs text-warning-foreground">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <span>{goal.safetyFloorNote}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 缺口提示卡 */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-2 text-sm font-semibold">今日缺口</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className={cn('text-lg font-bold tabular-nums', remaining.kcal >= 0 ? 'text-foreground' : 'text-warning')}>
                {remaining.kcal >= 0 ? remaining.kcal : Math.abs(remaining.kcal)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {remaining.kcal >= 0 ? 'kcal 剩余' : 'kcal 超'}
              </div>
            </div>
            <div>
              <div className={cn('text-lg font-bold tabular-nums', remaining.protein >= 0 ? 'text-primary' : 'text-success')}>
                {remaining.protein >= 0 ? remaining.protein : Math.abs(remaining.protein)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {remaining.protein >= 0 ? '蛋白 g 剩' : '蛋白 g 超'}
              </div>
            </div>
            <div>
              <div className="text-lg font-bold tabular-nums text-muted-foreground">
                {Math.abs(remaining.fat)}
              </div>
              <div className="text-[10px] text-muted-foreground">脂肪 g</div>
            </div>
            <div>
              <div className="text-lg font-bold tabular-nums text-muted-foreground">
                {Math.abs(remaining.carbs)}
              </div>
              <div className="text-[10px] text-muted-foreground">碳水 g</div>
            </div>
          </div>
          {remaining.protein > 10 && (
            <div className="mt-3 rounded-lg bg-primary/10 p-2 text-xs text-primary-foreground/80">
              💡 蛋白还差 {remaining.protein}g，下一餐可以多加一道高蛋白菜，或来一勺蛋白粉补位
            </div>
          )}
          {profile.goal === 'cut' && remaining.kcal < 0 && (
            <div className="mt-3 rounded-lg bg-warning/10 p-2 text-xs">
              ⚠️ 今日热量已超 {Math.abs(remaining.kcal)} kcal，下餐注意控油控量
            </div>
          )}
        </CardContent>
      </Card>

      {/* 餐次概览 */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">今日餐次</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-primary"
              onClick={() => navigate('/plan')}
            >
              查看全部
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MEAL_LABELS.map((meal) => {
              const entries = dailyLog?.meals[meal.key] || [];
              const mealKcal = entries.reduce((sum, e) => sum + e.nutrition.kcal, 0);
              const mealProtein = entries.reduce((sum, e) => sum + e.nutrition.protein, 0);
              const hasEntries = entries.length > 0;
              return (
                <button
                  key={meal.key}
                  onClick={() => navigate(`/plan/meal/${meal.key}`)}
                  className={cn(
                    'flex flex-col items-start rounded-xl border p-3 text-left transition-colors',
                    hasEntries
                      ? 'border-border bg-card hover:border-primary/50'
                      : 'border-dashed border-border/50 bg-muted/30 hover:bg-muted/50',
                  )}
                >
                  <span className="text-sm font-medium">{meal.label}</span>
                  {hasEntries ? (
                    <>
                      <span className="mt-1 text-lg font-bold tabular-nums">
                        {Math.round(mealKcal)} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        蛋白 {Math.round(mealProtein)}g · {entries.length} 道
                      </span>
                    </>
                  ) : (
                    <span className="mt-1 flex items-center text-xs text-muted-foreground">
                      <Plus className="mr-1 size-3" />
                      未记录
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 训练状态小卡片 */}
      <Card className="cursor-pointer" onClick={() => navigate('/profile/workout')}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-base">🏋️</span>
            </div>
            <div>
              <div className="text-sm font-medium">今日训练</div>
              <div className="text-xs text-muted-foreground">
                {workoutLog?.hasWorkout
                  ? `已记录 · ${workoutLog.intensity === 'hard' ? '吃力' : workoutLog.intensity === 'easy' ? '轻松' : '适中'}`
                  : '未记录'}
              </div>
            </div>
          </div>
          <Badge variant={workoutLog?.hasWorkout ? 'default' : 'outline'}>
            {workoutLog?.hasWorkout ? '已练' : '去标记'}
          </Badge>
        </CardContent>
      </Card>

      {/* 免责声明 */}
      <p className="px-2 pb-4 text-center text-[10px] leading-relaxed text-muted-foreground">
        本结果为估算参考，不替代医生/注册营养师的专业建议。
        {goal?.isEstimatedBodyFat && '体脂数据缺失，结果为估算值。'}
      </p>
    </div>
  );
}
