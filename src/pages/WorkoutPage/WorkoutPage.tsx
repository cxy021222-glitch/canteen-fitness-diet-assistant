import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Check, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkoutLog } from '@/hooks/useStorage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { IWorkoutLog } from '@/data/types';

const BODY_PARTS = [
  '胸部', '背部', '肩部', '手臂', '腿部', '核心', '有氧', 'HIIT',
];

const INTENSITIES = [
  { id: 'easy', label: '轻松', desc: '有氧/轻重量' },
  { id: 'moderate', label: '适中', desc: '正常训练' },
  { id: 'hard', label: '吃力', desc: '大重量/高强度' },
] as const;

export default function WorkoutPage() {
  const navigate = useNavigate();
  const { workoutLog, saveWorkout } = useWorkoutLog();

  const [hasWorkout, setHasWorkout] = useState(workoutLog?.hasWorkout ?? false);
  const [bodyParts, setBodyParts] = useState<string[]>(workoutLog?.bodyParts || []);
  const [intensity, setIntensity] = useState<IWorkoutLog['intensity']>(
    workoutLog?.intensity || 'moderate',
  );

  const togglePart = (part: string) => {
    setBodyParts((prev) =>
      prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part],
    );
  };

  const handleSave = () => {
    const log: IWorkoutLog = {
      date: new Date().toISOString().split('T')[0],
      hasWorkout,
      bodyParts: hasWorkout ? bodyParts : [],
      intensity: hasWorkout ? intensity : 'moderate',
    };
    saveWorkout(log);
    toast.success(hasWorkout ? '训练已记录' : '已标记为休息日');
    setTimeout(() => navigate('/profile'), 500);
  };

  return (
    <div className="space-y-4 px-4 py-4">
      <div>
        <h1 className="text-xl font-bold">训练记录</h1>
        <p className="text-xs text-muted-foreground">
          记录今日训练，小幅修正当日活动系数
        </p>
      </div>

      {/* 今日是否训练 */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">今天有训练吗？</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setHasWorkout(true)}
              className={cn(
                'rounded-xl border p-4 text-center transition-colors',
                hasWorkout
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card hover:border-primary/30',
              )}
            >
              <Dumbbell className="mx-auto mb-2 size-6" />
              <div className="text-sm font-medium">有训练</div>
            </button>
            <button
              onClick={() => setHasWorkout(false)}
              className={cn(
                'rounded-xl border p-4 text-center transition-colors',
                !hasWorkout
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card hover:border-primary/30',
              )}
            >
              <span className="mx-auto mb-2 block text-2xl">🛌</span>
              <div className="text-sm font-medium">休息日</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {hasWorkout && (
        <>
          {/* 训练部位 */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">训练部位</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-2">
                {BODY_PARTS.map((part) => {
                  const selected = bodyParts.includes(part);
                  return (
                    <button
                      key={part}
                      onClick={() => togglePart(part)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs transition-colors',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card hover:border-primary/30',
                      )}
                    >
                      {selected && <Check className="mr-1 inline size-3" />}
                      {part}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 主观强度 */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">主观强度</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
              {INTENSITIES.map((int) => (
                <button
                  key={int.id}
                  onClick={() => setIntensity(int.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors',
                    intensity === int.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30',
                  )}
                >
                  <div>
                    <div className="text-sm font-medium">{int.label}</div>
                    <div className="text-xs text-muted-foreground">{int.desc}</div>
                  </div>
                  {intensity === int.id && (
                    <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" />
                    </div>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* 说明 */}
      <Card className="border-dashed">
        <CardContent className="flex items-start gap-3 p-4 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="space-y-1">
            <p>训练记录仅用于小幅修正当日活动系数：</p>
            <ul className="list-disc space-y-0.5 pl-4">
              <li>休息日 → 活动系数 -0.1</li>
              <li>正常训练日 → 维持原有系数</li>
              <li>高强度日 → 活动系数 +0.05</li>
            </ul>
            <p className="pt-1">不生成训练动作计划，本期仅记录</p>
          </div>
        </CardContent>
      </Card>

      {/* 保存 */}
      <Button size="lg" className="w-full" onClick={handleSave}>
        保存今日训练
      </Button>

      <div className="h-4" />
    </div>
  );
}
