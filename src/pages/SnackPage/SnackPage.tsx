import { useState, useMemo } from 'react';
import { Plus, Trash2, Cookie, Zap, Apple } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useSnackLog } from '@/hooks/useStorage';
import {
  SNACK_DB,
  getPortionNutrition,
  type INutritionItem,
  type PortionSize,
} from '@/data/nutritionDB';
import type { ISnackEntry } from '@/data/types';
import { sumNutrition } from '@/utils/planUtils';

const CATEGORIES = [
  { key: 'all', label: '全部', icon: Cookie },
  { key: 'supplement', label: '补给', icon: Zap },
  { key: 'snack', label: '零食/水果', icon: Apple },
];

export default function SnackPage() {
  const { snackLog, addSnack, removeSnack } = useSnackLog();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [customProtein, setCustomProtein] = useState('');

  const filteredSnacks = useMemo(() => {
    let list = SNACK_DB;
    if (activeCategory !== 'all') {
      list = list.filter((s) => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.tags && s.tags.some((t) => t.toLowerCase().includes(q))),
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const totalSum = useMemo(() => sumNutrition(snackLog), [snackLog]);

  const handleAddSnack = (snack: INutritionItem) => {
    const nutri = getPortionNutrition(snack, 'medium');
    const entry: ISnackEntry = {
      id: `snack_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      foodId: snack.id,
      foodName: snack.name,
      portion: 'medium',
      nutrition: nutri,
      source: 'preset',
      addedAt: new Date().toISOString(),
    };
    addSnack(entry);
    toast.success(`已添加 ${snack.name}`);
  };

  const handleAddCustom = () => {
    if (!customName.trim()) {
      toast.error('请填写名称');
      return;
    }
    const kcal = Number(customKcal) || 0;
    const protein = Number(customProtein) || 0;
    const entry: ISnackEntry = {
      id: `custom_${Date.now()}`,
      foodId: `custom_${Date.now()}`,
      foodName: customName,
      portion: 'medium',
      nutrition: { kcal, protein, fat: 0, carbs: 0 },
      source: 'custom_input',
      addedAt: new Date().toISOString(),
      isCustom: true,
    };
    addSnack(entry);
    setCustomDialogOpen(false);
    setCustomName('');
    setCustomKcal('');
    setCustomProtein('');
    toast.success('已添加（估算）');
  };

  return (
    <div className="space-y-4 px-4 py-4">
      {/* 标题 + 今日汇总 */}
      <div>
        <h1 className="text-xl font-bold">零食补给</h1>
        <p className="text-xs text-muted-foreground">计入当日总量，AI 规划时也会用来补位</p>
      </div>

      {/* 今日零食汇总 */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-background">
        <CardContent className="p-4">
          <div className="mb-2 text-sm font-medium">今日零食补给</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold tabular-nums">{Math.round(totalSum.kcal)}</div>
              <div className="text-xs text-muted-foreground">kcal</div>
            </div>
            <div className="flex gap-4 text-right text-xs">
              <div>
                <div className="font-semibold text-primary">{totalSum.protein.toFixed(1)}</div>
                <div className="text-muted-foreground">蛋白 g</div>
              </div>
              <div>
                <div className="font-semibold">{totalSum.fat.toFixed(1)}</div>
                <div className="text-muted-foreground">脂肪 g</div>
              </div>
              <div>
                <div className="font-semibold">{totalSum.carbs.toFixed(1)}</div>
                <div className="text-muted-foreground">碳水 g</div>
              </div>
            </div>
          </div>
          {snackLog.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">共 {snackLog.length} 条</div>
          )}
        </CardContent>
      </Card>

      {/* 今日已登记 */}
      {snackLog.length > 0 && (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">今日已登记</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {snackLog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm">{entry.foodName}</span>
                    {entry.isCustom && (
                      <Badge variant="outline" className="text-[10px]">
                        估算
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {Math.round(entry.nutrition.kcal)} kcal · 蛋白 {entry.nutrition.protein.toFixed(1)}g
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeSnack(entry.id)}
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 添加零食 */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>添加零食补给</span>
            <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Plus className="mr-1 size-3.5" />
                  自由录入
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>自由录入</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div>
                    <Label>名称</Label>
                    <Input
                      placeholder="如：巧克力蛋白棒"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>热量 (kcal)</Label>
                      <Input
                        type="number"
                        placeholder="大约"
                        value={customKcal}
                        onChange={(e) => setCustomKcal(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>蛋白 (g)</Label>
                      <Input
                        type="number"
                        placeholder="大约"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    自由录入的零食标记为"估算"，不保证精确
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCustomDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleAddCustom}>添加</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          {/* 搜索框 */}
          <div className="relative">
            <Input
              placeholder="搜索零食补给..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 分类 Tab */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger key={cat.key} value={cat.key} className="text-xs">
                    <Icon className="mr-1.5 size-3.5" />
                    {cat.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* 列表 */}
          <div className="grid grid-cols-2 gap-2">
            {filteredSnacks.map((snack) => (
              <button
                key={snack.id}
                onClick={() => handleAddSnack(snack)}
                className="flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <span className="text-sm font-medium">{snack.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {getPortionNutrition(snack, 'medium').kcal} kcal · 蛋白{' '}
                  {getPortionNutrition(snack, 'medium').protein.toFixed(1)}g
                </span>
                <span className="mt-0.5 flex items-center text-[10px] text-primary">
                  <Plus className="mr-0.5 size-3" />
                  添加
                </span>
              </button>
            ))}
          </div>

          {filteredSnacks.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              没有匹配结果
            </div>
          )}
        </CardContent>
      </Card>

      <div className="h-4" />
    </div>
  );
}
