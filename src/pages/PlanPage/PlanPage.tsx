import { useNavigate } from 'react-router-dom';
import { Camera, Search, Plus, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile, useDailyLog } from '@/hooks/useStorage';

const MEALS = [
  { key: 'breakfast', label: '早餐', icon: '🌅', time: '07:00 - 09:00' },
  { key: 'lunch', label: '午餐', icon: '🍱', time: '11:30 - 13:30' },
  { key: 'dinner', label: '晚餐', icon: '🍜', time: '17:30 - 19:30' },
  { key: 'snack', label: '加餐', icon: '🍎', time: '随时' },
] as const;

export default function PlanPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { dailyLog } = useDailyLog();

  return (
    <div className="space-y-4 px-4 py-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">记录饮食</h1>
          <p className="text-xs text-muted-foreground">拍一拍、选一选，快速记录今天吃了啥</p>
        </div>
      </div>

      {/* 未建档提示 */}
      {!profile && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-sm">
              <div className="font-medium">先建档再规划</div>
              <div className="text-xs text-muted-foreground">建档后 AI 才能按你的目标搭配</div>
            </div>
            <Button size="sm" onClick={() => navigate('/profile/form')}>
              去建档
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="default"
          size="lg"
          className="h-20 flex-col gap-1 text-base"
          onClick={() => navigate('/plan/photo')}
        >
          <Camera className="size-6" />
          拍照识别
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="h-20 flex-col gap-1 text-base"
          onClick={() => navigate('/plan/meal/lunch')}
        >
          <Search className="size-6" />
          手动选菜
        </Button>
      </div>

      {/* 餐次列表 */}
      <div className="space-y-2">
        <h2 className="pt-2 text-sm font-semibold text-muted-foreground">今日餐次</h2>
        {MEALS.map((meal) => {
          const entries = dailyLog?.meals[meal.key as keyof typeof dailyLog.meals] || [];
          const count = entries.length;
          const totalKcal = entries.reduce((s, e) => s + e.nutrition.kcal, 0);
          const totalProtein = entries.reduce((s, e) => s + e.nutrition.protein, 0);

          return (
            <Card
              key={meal.key}
              className="cursor-pointer transition-colors hover:border-primary/30"
              onClick={() => navigate(`/plan/meal/${meal.key}`)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {meal.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{meal.label}</span>
                    {count > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {count} 道
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{meal.time}</div>
                  {count > 0 ? (
                    <div className="mt-1 flex items-center gap-3 text-xs">
                      <span className="tabular-nums">
                        <span className="font-semibold text-foreground">{Math.round(totalKcal)}</span>
                        <span className="text-muted-foreground"> kcal</span>
                      </span>
                      <span className="tabular-nums">
                        蛋白{' '}
                        <span className="font-semibold text-primary">{Math.round(totalProtein)}</span>
                        <span className="text-muted-foreground"> g</span>
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-muted-foreground">还没记录，去打饭吧</div>
                  )}
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 使用小提示 */}
      <Card className="mt-4 border-dashed border-primary/30 bg-primary/5">
        <CardContent className="space-y-2 p-4 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">💡 快速上手</div>
          <ul className="space-y-1 pl-4 list-disc">
            <li>拍一张食堂菜品照片，AI 自动识别候选菜名</li>
            <li>勾选想吃的，一键生成搭配方案</li>
            <li>零食补给也能记，一起计入当日总量</li>
          </ul>
        </CardContent>
      </Card>

      <div className="h-4" />
    </div>
  );
}
