import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  AlertCircle,
  Target,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useStorage';
import { calculateBMI, calculateNutritionGoal } from '@/utils/nutritionCalc';
import type { IUserProfile } from '@/data/types';
import { cn } from '@/lib/utils';

const DIETARY_OPTIONS = [
  { id: 'high_purine', label: '痛风/低嘌呤' },
  { id: 'lactose_intolerant', label: '乳糖不耐' },
  { id: 'gluten_free', label: '无麸质' },
  { id: 'nut_allergy', label: '坚果过敏' },
  { id: 'seafood_allergy', label: '海鲜过敏' },
  { id: 'egg_allergy', label: '鸡蛋过敏' },
  { id: 'vegetarian', label: '素食' },
  { id: 'low_salt', label: '低盐' },
];

export default function ProfileFormPage() {
  const navigate = useNavigate();
  const { profile, saveProfile } = useProfile();

  // 表单状态
  const [gender, setGender] = useState<'male' | 'female'>(profile?.gender || 'male');
  const [age, setAge] = useState<string>(profile?.age?.toString() || '');
  const [height, setHeight] = useState<string>(profile?.height?.toString() || '');
  const [weight, setWeight] = useState<string>(profile?.weight?.toString() || '');
  const [bodyFat, setBodyFat] = useState<string>(profile?.bodyFat?.toString() || '');
  const [trainingFrequency, setTrainingFrequency] = useState<string>(
    profile?.trainingFrequency || 'moderate',
  );
  const [trainingIntensity, setTrainingIntensity] = useState<string>(
    profile?.trainingIntensity || 'moderate',
  );
  const [goal, setGoal] = useState<string>(profile?.goal || 'bulk');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    profile?.dietaryRestrictions || [],
  );
  const [customRestrictions, setCustomRestrictions] = useState<string>(
    profile?.customRestrictions || '',
  );
  const [isSaving, setIsSaving] = useState(false);

  // 本地暂存（中途退出回填）—— 用 scopedStorage
  useEffect(() => {
    const draft = {
      gender,
      age,
      height,
      weight,
      bodyFat,
      trainingFrequency,
      trainingIntensity,
      goal,
      dietaryRestrictions,
      customRestrictions,
    };
    // 非空字段才暂存
    if (age || height || weight) {
      try {
        sessionStorage.setItem('profile_draft', JSON.stringify(draft));
      } catch {}
    }
  }, [gender, age, height, weight, bodyFat, trainingFrequency, trainingIntensity, goal, dietaryRestrictions, customRestrictions]);

  // 验证
  const ageNum = Number(age);
  const heightNum = Number(height);
  const weightNum = Number(weight);
  const bodyFatNum = bodyFat ? Number(bodyFat) : null;

  const ageValid = ageNum >= 14 && ageNum <= 80;
  const heightValid = heightNum >= 120 && heightNum <= 220;
  const weightValid = weightNum >= 30 && weightNum <= 200;
  const bodyFatValid = !bodyFat || (bodyFatNum !== null && bodyFatNum >= 5 && bodyFatNum <= 50);

  const isFormValid =
    !!gender &&
    ageValid &&
    heightValid &&
    weightValid &&
    bodyFatValid &&
    !!trainingFrequency &&
    !!trainingIntensity &&
    !!goal;

  // 实时 BMI
  const bmi = useMemo(() => {
    if (!heightValid || !weightValid) return null;
    return calculateBMI(weightNum, heightNum);
  }, [heightNum, weightNum, heightValid, weightValid]);

  // 实时目标预览
  const goalPreview = useMemo(() => {
    if (!isFormValid) return null;
    return calculateNutritionGoal(
      gender,
      ageNum,
      heightNum,
      weightNum,
      trainingFrequency as any,
      trainingIntensity as any,
      goal as any,
      bodyFatNum !== null,
    );
  }, [gender, ageNum, heightNum, weightNum, trainingFrequency, trainingIntensity, goal, bodyFatNum, isFormValid]);

  const toggleDietary = (id: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    if (!isFormValid) {
      toast.error('请检查填写项');
      return;
    }
    setIsSaving(true);

    const newProfile: IUserProfile = {
      gender,
      age: ageNum,
      height: heightNum,
      weight: weightNum,
      bodyFat: bodyFatNum,
      trainingFrequency: trainingFrequency as IUserProfile['trainingFrequency'],
      trainingIntensity: trainingIntensity as IUserProfile['trainingIntensity'],
      goal: goal as IUserProfile['goal'],
      dietaryRestrictions,
      customRestrictions: customRestrictions.trim() || undefined,
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProfile(newProfile);
    sessionStorage.removeItem('profile_draft');
    toast.success(profile ? '档案已更新' : '建档成功');
    setTimeout(() => {
      navigate('/profile');
    }, 600);
  };

  const bmiStatus = useMemo(() => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: '偏瘦', color: 'text-info' };
    if (bmi < 24) return { label: '正常', color: 'text-success' };
    if (bmi < 28) return { label: '超重', color: 'text-warning' };
    return { label: '肥胖', color: 'text-destructive' };
  }, [bmi]);

  return (
    <div className="space-y-4 px-4 py-4">
      {/* 标题 */}
      <div>
        <h1 className="text-xl font-bold">{profile ? '编辑档案' : '建立档案'}</h1>
        <p className="text-xs text-muted-foreground">
          身体数据越准确，AI 搭配越贴合你的目标
        </p>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-sm font-semibold">基本信息</h2>

          {/* 性别 */}
          <div>
            <Label className="mb-1.5 block">性别 <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={cn(
                  'rounded-xl border p-3 text-sm font-medium transition-colors',
                  gender === 'male'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-primary/30',
                )}
              >
                男
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={cn(
                  'rounded-xl border p-3 text-sm font-medium transition-colors',
                  gender === 'female'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-primary/30',
                )}
              >
                女
              </button>
            </div>
          </div>

          {/* 年龄/身高/体重 */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="mb-1.5 block">年龄 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="岁"
                  className={cn(!ageValid && age && 'border-destructive')}
                />
                {!ageValid && age && (
                  <span className="absolute -bottom-4 left-0 text-[10px] text-destructive">
                    14-80
                  </span>
                )}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">身高 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="cm"
                  className={cn(!heightValid && height && 'border-destructive')}
                />
                {!heightValid && height && (
                  <span className="absolute -bottom-4 left-0 text-[10px] text-destructive">
                    120-220
                  </span>
                )}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">体重 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="kg"
                  className={cn(!weightValid && weight && 'border-destructive')}
                />
                {!weightValid && weight && (
                  <span className="absolute -bottom-4 left-0 text-[10px] text-destructive">
                    30-200
                  </span>
                )}
              </div>
            </div>
          </div>
          {(!ageValid && age) || (!heightValid && height) || (!weightValid && weight) ? (
            <div className="h-4" />
          ) : null}

          {/* 体脂率（可选） */}
          <div>
            <Label className="mb-1.5 block">
              体脂率 <span className="text-xs text-muted-foreground">(可选，填了更准)</span>
            </Label>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="%"
                className={cn(!bodyFatValid && bodyFat && 'border-destructive')}
              />
              {!bodyFatValid && bodyFat && (
                <span className="absolute -bottom-4 left-0 text-[10px] text-destructive">
                  5-50
                </span>
              )}
            </div>
            {bodyFat && bodyFatValid && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                不填时结果会标注"体脂为估算"
              </p>
            )}
          </div>
          {!bodyFatValid && bodyFat && <div className="h-4" />}

          {/* BMI 实时展示 */}
          {bmi !== null && bmiStatus && (
            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
              <div className="text-sm">
                <span className="text-muted-foreground">BMI</span>
                <span className="ml-2 text-lg font-bold tabular-nums">{bmi.toFixed(1)}</span>
              </div>
              <Badge variant="outline" className={cn('font-medium', bmiStatus.color)}>
                {bmiStatus.label}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 训练与目标 */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-sm font-semibold">训练与目标</h2>

          <div>
            <Label className="mb-1.5 block">训练频率 <span className="text-destructive">*</span></Label>
            <Select value={trainingFrequency} onValueChange={setTrainingFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="选择频率" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">久坐少动（基本不练）</SelectItem>
                <SelectItem value="light">每周 1-3 次</SelectItem>
                <SelectItem value="moderate">每周 3-5 次</SelectItem>
                <SelectItem value="heavy">每周 6-7 次</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block">训练强度 <span className="text-destructive">*</span></Label>
            <Select value={trainingIntensity} onValueChange={setTrainingIntensity}>
              <SelectTrigger>
                <SelectValue placeholder="选择强度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">轻松（有氧/轻重量）</SelectItem>
                <SelectItem value="moderate">适中（正常训练）</SelectItem>
                <SelectItem value="high">吃力（大重量/高强度）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block">
              目标 <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'bulk', label: '增肌', icon: '💪' },
                { id: 'cut', label: '减脂', icon: '🔥' },
                { id: 'maintain', label: '维持', icon: '⚖️' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border p-3 text-sm font-medium transition-colors',
                    goal === g.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card hover:border-primary/30',
                  )}
                >
                  <span className="text-lg">{g.icon}</span>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 忌口偏好 */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">忌口与偏好</h2>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>
                  {dietaryRestrictions.length > 0
                    ? `已选 ${dietaryRestrictions.length} 项`
                    : '选择忌口'}
                </span>
                <ChevronDown className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>选择忌口</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                {DIETARY_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Checkbox
                      checked={dietaryRestrictions.includes(opt.id)}
                      onCheckedChange={() => toggleDietary(opt.id)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <div>
            <Label className="mb-1.5 block">其他偏好（可选）</Label>
            <Textarea
              placeholder="例如：不吃香菜、喜欢辣、不喝奶茶..."
              value={customRestrictions}
              onChange={(e) => setCustomRestrictions(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* 目标预览 */}
      {goalPreview && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Target className="size-4 text-primary" />
              目标预览（每日）
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-lg bg-card p-2">
                <div className="text-lg font-bold text-foreground tabular-nums">
                  {Math.round(goalPreview.targetKcal)}
                </div>
                <div className="text-[10px] text-muted-foreground">kcal</div>
              </div>
              <div className="rounded-lg bg-card p-2">
                <div className="text-lg font-bold text-primary tabular-nums">
                  {goalPreview.proteinG.toFixed(0)}
                </div>
                <div className="text-[10px] text-muted-foreground">蛋白 g</div>
              </div>
              <div className="rounded-lg bg-card p-2">
                <div className="text-lg font-bold text-foreground tabular-nums">
                  {goalPreview.fatG.toFixed(0)}
                </div>
                <div className="text-[10px] text-muted-foreground">脂肪 g</div>
              </div>
              <div className="rounded-lg bg-card p-2">
                <div className="text-lg font-bold text-foreground tabular-nums">
                  {goalPreview.carbsG.toFixed(0)}
                </div>
                <div className="text-[10px] text-muted-foreground">碳水 g</div>
              </div>
            </div>
            {goalPreview.isSafetyFloorApplied && (
              <div className="flex items-start gap-2 text-xs text-warning">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <span>已触安全下限（男1500/女1200 kcal），已按下限值取值</span>
              </div>
            )}
            {goalPreview.isEstimatedBodyFat && (
              <p className="text-[11px] text-muted-foreground">
                * 体脂未填写，结果为估算值
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 免责声明 */}
      <Card className="border-dashed border-warning/30">
        <CardContent className="p-3 text-[11px] text-muted-foreground">
          <p>
            本应用提供的饮食建议为一般性参考，不构成医疗或营养诊断。孕妇、慢性病患者、进食障碍者、未成年人请咨询专业人士。
          </p>
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <div className="sticky bottom-0 z-10 -mx-4 bg-gradient-to-t from-background via-background to-transparent px-4 pb-4 pt-8">
        <Button
          size="lg"
          className="w-full"
          onClick={handleSave}
          disabled={!isFormValid || isSaving}
        >
          {profile ? '保存修改' : '完成建档'}
        </Button>
        {!isFormValid && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            请检查必填项是否完整
          </p>
        )}
      </div>
    </div>
  );
}
