import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Camera,
  Search,
  Sparkles,
  Plus,
  Minus,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { capabilityClient, logger } from '@lark-apaas/client-toolkit-lite';
import { useProfile, useDailyLog } from '@/hooks/useStorage';
import {
  NUTRITION_DB,
  searchDishOnly,
  getPortionNutrition,
  type INutritionItem,
  type PortionSize,
} from '@/data/nutritionDB';
import type { IMealEntry, IAIPlanResult, IAIPlanDish } from '@/data/types';
import { calculateNutritionGoal } from '@/utils/nutritionCalc';
import {
  generateRuleBasedPlan,
  recalculateAIPlanWithDB,
  sumNutrition,
  calcRemainingToGoal,
  getMealTargetRatio,
} from '@/utils/planUtils';
import { cn } from '@/lib/utils';

const MEAL_LABELS: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

const PORTION_LABELS: Record<PortionSize, string> = {
  small: '小份',
  medium: '中份',
  large: '大份',
};

// 待选菜品项结构
interface PendingDish {
  foodId: string;
  name: string;
  portion: PortionSize;
  nutrition: { kcal: number; protein: number; fat: number; carbs: number };
  source: IMealEntry['source'];
}

export default function MealDetailPage() {
  const { mealType = 'lunch' } = useParams<{ mealType: string }>();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { dailyLog, addMealEntry } = useDailyLog();

  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDishes, setPendingDishes] = useState<PendingDish[]>([]);
  const [aiPlan, setAiPlan] = useState<IAIPlanResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');

  const searchResults = useMemo(() => searchDishOnly(searchQuery), [searchQuery]);

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
    );
  }, [profile]);

  const mealEntries = dailyLog?.meals[mealType as keyof typeof dailyLog.meals] || [];
  const currentMealSum = useMemo(() => sumNutrition(mealEntries), [mealEntries]);

  const pendingSum = useMemo(
    () =>
      sumNutrition(
        pendingDishes.map((d) => ({ nutrition: d.nutrition })),
      ),
    [pendingDishes],
  );

  const ratio = getMealTargetRatio(mealType as any);
  const mealKcalTarget = goal ? Math.round(goal.targetKcal * ratio) : 0;
  const mealProteinTarget = goal ? Math.round(goal.proteinG * ratio) : 0;

  // 添加待选菜品
  const addPendingDish = useCallback(
    (food: INutritionItem, portion: PortionSize = 'medium', source: PendingDish['source'] = 'manual_search') => {
      const nutri = getPortionNutrition(food, portion);
      setPendingDishes((prev) => [
        ...prev,
        {
          foodId: food.id,
          name: food.name,
          portion,
          nutrition: nutri,
          source,
        },
      ]);
    },
    [],
  );

  // 调整份量
  const adjustPortion = useCallback(
    (index: number, delta: number) => {
      setPendingDishes((prev) =>
        prev.map((d, i) => {
          if (i !== index) return d;
          const portions: PortionSize[] = ['small', 'medium', 'large'];
          const currentIdx = portions.indexOf(d.portion);
          const nextIdx = Math.max(0, Math.min(2, currentIdx + delta));
          const nextPortion = portions[nextIdx];
          const food = NUTRITION_DB.find((f) => f.id === d.foodId);
          const nutri = food ? getPortionNutrition(food, nextPortion) : d.nutrition;
          return { ...d, portion: nextPortion, nutrition: nutri };
        }),
      );
    },
    [],
  );

  const removePendingDish = useCallback((index: number) => {
    setPendingDishes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // 从拍照识别页返回时填充待选菜品
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('photo_recognition_result');
      if (raw) {
        const result = JSON.parse(raw) as PendingDish[];
        if (Array.isArray(result) && result.length > 0) {
          setPendingDishes((prev) => [...prev, ...result]);
          sessionStorage.removeItem('photo_recognition_result');
          toast.success(`已从照片添加 ${result.length} 道菜`);
        }
      }
    } catch {
      // ignore
    }
  }, [mealType]);

  // AI 生成搭配
  const generateAIPlan = useCallback(async () => {
    if (!profile || !goal) {
      toast.error('请先建档');
      return;
    }
    if (!pendingDishes.length && aiPlan?.recommendedDishes.length === 0) {
      // 没有选菜，使用默认营养库生成
    }

    setIsGenerating(true);
    setAiPlan(null);

    // 组装提示词
    const availableFoodsText = pendingDishes.length
      ? pendingDishes
          .map(
            (d) =>
              `- ${d.name} (${d.foodId}): 每份${d.nutrition.kcal}kcal, 蛋白${d.nutrition.protein}g, 脂肪${d.nutrition.fat}g, 碳水${d.nutrition.carbs}g`,
          )
          .join('\n')
      : NUTRITION_DB.slice(0, 15)
          .map(
            (f) =>
              `- ${f.name} (${f.id}): 每100g${f.per100g.kcal}kcal, 蛋白${f.per100g.protein}g, 脂肪${f.per100g.fat}g, 碳水${f.per100g.carbs}g`,
          )
          .join('\n');

    const userProfileText = `性别=${profile.gender === 'male' ? '男' : '女'}，年龄=${profile.age}，身高${profile.height}cm，体重${profile.weight}kg，训练频率=${profile.trainingFrequency}，强度=${profile.trainingIntensity}，目标=${
      profile.goal === 'bulk' ? '增肌' : profile.goal === 'cut' ? '减脂' : '维持'
    }`;

    const nutritionTargetText = `全日目标热量 ${goal.targetKcal}kcal，蛋白 ${goal.proteinG}g，脂肪 ${goal.fatG}g，碳水 ${goal.carbsG}g；当前餐次=${MEAL_LABELS[mealType]}`;

    const avoidText = [
      ...(profile.dietaryRestrictions || []),
      profile.customRestrictions || '',
    ]
      .filter(Boolean)
      .join('、');

    const prompt = `你是一名面向中国在校健身大学生的食堂饮食规划助手。用户只能在学校食堂就餐，预算有限、不会自己做饭。

硬性规则：
1. 只从 available_foods（食堂可得菜）中选择，不得推荐需要自己烹饪或校外专门购买的食材。
2. 增肌优先保证蛋白质达标并维持适度热量盈余；减脂优先控制总热量缺口、建议少油做法；维持以均衡为主。
3. 避开用户的忌口。
4. 给出 2-4 个菜品组成本餐，份量用 small/medium/large。
5. 只输出 JSON，不要 Markdown、解释或多余文字。
6. 不做疾病诊断，不承诺增重/减重斤数。
7. JSON 结构：{"meal":{"items":[{"food_id":"","name":"","portion":""}]},"gap":{"protein_remaining_g":0,"kcal_remaining":0},"suggestions":[],"warnings":[]}

【用户档案】${userProfileText}
【本餐目标参考】${nutritionTargetText}
【食堂可得菜品（含库内营养）】
${availableFoodsText}
【忌口/偏好】${avoidText || '无'}

请输出本餐搭配 JSON。`;

    try {
      const executor = (capabilityClient as any).load('ai_diet_plan_generation_1');
      let fullText = '';

      const stream = (executor as any).callStream('textGenerate', {
        user_profile: userProfileText,
        nutrition_target: nutritionTargetText,
        available_dishes: availableFoodsText,
        registered_snacks: '暂无',
        dietary_restrictions: avoidText || '无',
        meal_schedule: `餐次: ${MEAL_LABELS[mealType]}`,
      });

      for await (const chunk of stream) {
        const piece = chunk.content ?? '';
        if (piece) {
          fullText += piece;
        }
      }

      // 解析 JSON
      const parsed = parseAIPlanResponse(fullText);
      if (!parsed) {
        throw new Error('解析失败');
      }

      // 回营养库重算
      const recalculated = recalculateAIPlanWithDB(
        {
          recommendedDishes: parsed.meal.items.map((item: any) => ({
            foodId: item.food_id,
            name: item.name,
            portion: item.portion,
          })),
          mealTotal: { kcal: 0, protein: 0, fat: 0, carbs: 0 },
          remainingToGoal: parsed.gap || { protein_remaining_g: 0, kcal_remaining: 0 },
          replacementSuggestions: parsed.suggestions || [],
          gapSupplement: '',
          warnings: parsed.warnings || [],
          isOfflineTemplate: false,
        },
        goal,
        mealType as any,
        [],
      );

      setAiPlan(recalculated);
    } catch (e) {
      logger.error('AI plan generation failed:', String(e));
      toast.error('AI 规划不可用，已切换为离线模板方案');

      // 降级到规则模板
      const available = pendingDishes.length
        ? pendingDishes
            .map((d) => NUTRITION_DB.find((f) => f.id === d.foodId))
            .filter((f): f is INutritionItem => !!f)
        : NUTRITION_DB.slice(0, 12);

      const fallback = generateRuleBasedPlan(
        mealType as any,
        goal,
        available,
        currentMealSum,
        [],
      );
      setAiPlan(fallback);
    } finally {
      setIsGenerating(false);
    }
  }, [profile, goal, pendingDishes, mealType, aiPlan, currentMealSum]);

  // 解析 AI 返回的 JSON
  function parseAIPlanResponse(text: string): any {
    try {
      // 尝试直接解析
      return JSON.parse(text.trim());
    } catch {
      // 尝试提取 JSON 对象
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  // 添加 AI 方案到记录
  const addAiPlanToLog = useCallback(() => {
    if (!aiPlan) return;
    aiPlan.recommendedDishes.forEach((dish, idx) => {
      const entry: IMealEntry = {
        id: `ai_${Date.now()}_${idx}`,
        foodId: dish.foodId || 'custom',
        foodName: dish.name,
        portion: dish.portion,
        nutrition: {
          kcal: dish.kcal || 0,
          protein: dish.protein_g || 0,
          fat: dish.fat_g || 0,
          carbs: dish.carb_g || 0,
        },
        source: 'ai_recommendation',
        mealType: mealType as IMealEntry['mealType'],
        addedAt: new Date().toISOString(),
      };
      addMealEntry(mealType as IMealEntry['mealType'], entry);
    });
    toast.success('已加入当日记录');
    setAiPlan(null);
  }, [aiPlan, mealType, addMealEntry]);

  // 手动添加自定义菜
  const addCustomFood = useCallback(() => {
    if (!customName.trim() || !customKcal) {
      toast.error('请填写菜名和热量');
      return;
    }
    const kcalNum = Number(customKcal);
    const dish: PendingDish = {
      foodId: `custom_${Date.now()}`,
      name: customName,
      portion: 'medium',
      nutrition: { kcal: kcalNum, protein: 0, fat: 0, carbs: 0 },
      source: 'custom_input',
    };
    setPendingDishes((prev) => [...prev, dish]);
    setCustomDialogOpen(false);
    setCustomName('');
    setCustomKcal('');
    toast.success('已添加（待入库）');
  }, [customName, customKcal]);

  // 添加待选菜品到记录
  const addPendingToLog = useCallback(() => {
    if (!pendingDishes.length) {
      toast.error('还没选菜呢');
      return;
    }
    pendingDishes.forEach((d, idx) => {
      const entry: IMealEntry = {
        id: `manual_${Date.now()}_${idx}`,
        foodId: d.foodId,
        foodName: d.name,
        portion: d.portion,
        nutrition: d.nutrition,
        source: d.source,
        mealType: mealType as IMealEntry['mealType'],
        addedAt: new Date().toISOString(),
        isCustom: d.source === 'custom_input',
      };
      addMealEntry(mealType as IMealEntry['mealType'], entry);
    });
    setPendingDishes([]);
    toast.success(`已添加 ${pendingDishes.length} 道菜到${MEAL_LABELS[mealType]}`);
  }, [pendingDishes, mealType, addMealEntry]);

  // 删除已记录条目
  const { removeMealEntry } = useDailyLog();

  return (
    <div className="space-y-4 px-4 py-4">
      {/* 已记录的餐次内容 */}
      {mealEntries.length > 0 && (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">已记录 · {MEAL_LABELS[mealType]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {mealEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{entry.foodName}</span>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {PORTION_LABELS[entry.portion]}
                    </Badge>
                    {entry.source === 'ai_recommendation' && (
                      <Badge className="shrink-0 text-[10px]">AI推荐</Badge>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {Math.round(entry.nutrition.kcal)} kcal · 蛋白 {entry.nutrition.protein.toFixed(1)}g
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeMealEntry(mealType as any, entry.id)}
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 text-sm">
              <span className="text-muted-foreground">本餐合计</span>
              <span className="font-semibold tabular-nums">
                {Math.round(currentMealSum.kcal)} kcal · 蛋白 {currentMealSum.protein.toFixed(1)}g
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI 方案展示 */}
      {aiPlan && (
        <Card className={cn(aiPlan.isOfflineTemplate && 'border-warning/40 bg-warning/5')}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="size-4 text-primary" />
                {aiPlan.isOfflineTemplate ? '离线模板方案' : 'AI 搭配方案'}
              </CardTitle>
              {aiPlan.isOfflineTemplate && (
                <Badge variant="outline" className="border-warning/50 text-warning">
                  模板降级
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {aiPlan.recommendedDishes.map((dish, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{dish.name}</span>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {PORTION_LABELS[dish.portion]}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {dish.kcal} kcal · 蛋白 {dish.protein_g?.toFixed(1)}g
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-lg bg-muted/30 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">本餐合计</span>
                <span className="font-bold tabular-nums">
                  {aiPlan.mealTotal.kcal} kcal
                </span>
              </div>
              <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                <span>蛋白 {aiPlan.mealTotal.protein.toFixed(0)}g</span>
                <span>脂肪 {aiPlan.mealTotal.fat.toFixed(0)}g</span>
                <span>碳水 {aiPlan.mealTotal.carbs.toFixed(0)}g</span>
              </div>
            </div>

            {/* 缺口与建议 */}
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-muted-foreground">距本餐目标：</span>
                <span className={aiPlan.remainingToGoal.kcal_remaining >= 0 ? 'text-foreground' : 'text-warning'}>
                  热量 {aiPlan.remainingToGoal.kcal_remaining >= 0 ? '差' : '超'}{' '}
                  {Math.abs(aiPlan.remainingToGoal.kcal_remaining)} kcal
                </span>
                <span className="mx-2 text-muted-foreground">·</span>
                <span className={aiPlan.remainingToGoal.protein_remaining_g >= 0 ? 'text-primary' : 'text-success'}>
                  蛋白 {aiPlan.remainingToGoal.protein_remaining_g >= 0 ? '差' : '超'}{' '}
                  {Math.abs(aiPlan.remainingToGoal.protein_remaining_g)}g
                </span>
              </div>
              {aiPlan.replacementSuggestions.map((s, i) => (
                <div key={i} className="flex gap-1">
                  <span className="text-primary">💡</span>
                  <span>{s}</span>
                </div>
              ))}
              {aiPlan.gapSupplement && (
                <div className="flex gap-1 text-primary">
                  <span>🔋</span>
                  <span>{aiPlan.gapSupplement}</span>
                </div>
              )}
              {aiPlan.warnings.slice(0, 1).map((w, i) => (
                <div key={i} className="flex gap-1 text-muted-foreground">
                  <AlertCircle className="mt-0.5 size-3 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>

            <Button onClick={addAiPlanToLog} className="w-full">
              <Check className="mr-2 size-4" />
              确认加入当日记录
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 生成 AI 方案按钮 */}
      <Button
        size="lg"
        className="w-full"
        onClick={generateAIPlan}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            AI 正在搭配...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 size-4" />
            {aiPlan ? '重新生成方案' : '生成 AI 搭配方案'}
          </>
        )}
      </Button>
      <p className="-mt-2 text-center text-[10px] text-muted-foreground">
        目标：{mealKcalTarget} kcal · 蛋白 {mealProteinTarget}g
        {goal?.isEstimatedBodyFat && ' · 体脂估算'}
      </p>

      {/* 待选菜品 */}
      {pendingDishes.length > 0 && (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">已选菜品 ({pendingDishes.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {pendingDishes.map((d, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm">{d.name}</span>
                    {d.source === 'photo_recognition' && (
                      <Badge variant="outline" className="text-[10px]">识别</Badge>
                    )}
                    {d.source === 'custom_input' && (
                      <Badge variant="outline" className="text-[10px]">自定义</Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {Math.round(d.nutrition.kcal)} kcal · 蛋白 {d.nutrition.protein.toFixed(1)}g
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removePendingDish(i)}
                  >
                    <Trash2 className="size-3.5 text-muted-foreground" />
                  </Button>
                  <div className="flex items-center gap-1 rounded-md border bg-muted/30">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => adjustPortion(i, -1)}
                      disabled={d.portion === 'small'}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-10 text-center text-xs">{PORTION_LABELS[d.portion]}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => adjustPortion(i, 1)}
                      disabled={d.portion === 'large'}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 text-sm">
              <span className="text-muted-foreground">合计</span>
              <span className="font-semibold tabular-nums">
                {Math.round(pendingSum.kcal)} kcal · 蛋白 {pendingSum.protein.toFixed(1)}g
              </span>
            </div>
            <Button onClick={addPendingToLog} variant="secondary" className="w-full">
              加入{MEAL_LABELS[mealType]}记录
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tab：拍照 / 手动搜索 */}
      <Tabs defaultValue="search">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photo">
            <Camera className="mr-1.5 size-3.5" />
            拍照识别
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="mr-1.5 size-3.5" />
            手动搜索
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photo" className="mt-3">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <Camera className="size-8 text-primary" />
              </div>
              <p className="mb-1 text-sm font-medium">拍一张食堂菜品照片</p>
              <p className="mb-4 text-xs text-muted-foreground">
                AI 自动识别菜名和份量，勾选即可加入
              </p>
              <Button onClick={() => navigate('/plan/photo')}>
                <Camera className="mr-2 size-4" />
                拍照识别菜品
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="mt-3 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索菜品，如番茄炒蛋、清蒸鸡胸..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[400px] space-y-1.5 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                未找到匹配菜品
                <div className="mt-2">
                  <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-1 size-3.5" />
                        自由录入
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>自由录入菜品</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 py-2">
                        <div>
                          <Label>菜名</Label>
                          <Input
                            placeholder="如：红烧肉"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>每份热量 (kcal)</Label>
                          <Input
                            type="number"
                            placeholder="大约即可"
                            value={customKcal}
                            onChange={(e) => setCustomKcal(e.target.value)}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          自由录入的菜品会标记为"待入库"，营养为估算值
                        </p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCustomDialogOpen(false)}>
                          取消
                        </Button>
                        <Button onClick={addCustomFood}>添加</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              searchResults.map((food) => (
                <button
                  key={food.id}
                  onClick={() => addPendingDish(food, 'medium', 'manual_search')}
                  className="flex w-full items-center justify-between rounded-lg border p-2.5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{food.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {food.per100g.kcal} kcal/100g · 蛋白{food.per100g.protein}g
                    </div>
                  </div>
                  <Plus className="size-4 text-primary" />
                </button>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="h-4" />
    </div>
  );
}
