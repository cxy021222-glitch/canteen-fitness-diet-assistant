import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Loader2, AlertCircle, Plus, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { toast } from 'sonner';
import { capabilityClient, logger } from '@lark-apaas/client-toolkit-lite';
import {
  NUTRITION_DB,
  getPortionNutrition,
  type PortionSize,
} from '@/data/nutritionDB';
import { cn } from '@/lib/utils';

const PORTION_LABELS: Record<PortionSize, string> = {
  small: '小份',
  medium: '中份',
  large: '大份',
};

interface RecognitionCandidate {
  name: string;
  portion: PortionSize;
  confidence: number;
  matchedFoodId?: string;
  kcal?: number;
}

export default function PhotoRecogPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [candidates, setCandidates] = useState<RecognitionCandidate[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<Set<number>>(new Set());
  const [portions, setPortions] = useState<Record<number, PortionSize>>({});
  const [recognizeFailed, setRecognizeFailed] = useState(false);
  const [failReason, setFailReason] = useState('');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setCandidates([]);
    setSelectedIdx(new Set());
    setPortions({});
    setRecognizeFailed(false);
  }, []);

  const startRecognition = useCallback(async () => {
    if (!selectedFile) {
      toast.error('请先选择照片');
      return;
    }
    setIsRecognizing(true);
    setRecognizeFailed(false);
    setCandidates([]);
    setSelectedIdx(new Set());

    try {
      const executor = (capabilityClient as any).load('canteen_dish_visual_recognition_1');
      let fullText = '';

      const stream = (executor as any).callStream('imageUnderstanding', {
        dish_images: [selectedFile],
      });

      for await (const chunk of stream) {
        const piece = chunk.content ?? '';
        if (piece) {
          fullText += piece;
        }
      }

      logger.info('Recognition raw result length:', fullText.length);

      // 解析 JSON
      const parsed = parseCandidates(fullText);
      if (!parsed || parsed.length === 0) {
        setRecognizeFailed(true);
        setFailReason('未识别到菜品，请检查照片是否清晰');
        toast.error('未识别到菜品');
        return;
      }

      // 匹配营养库
      const enriched: RecognitionCandidate[] = parsed.map((c: any) => {
        const name = c.name || '';
        const nameLower = name.toLowerCase().trim();
        const matched = NUTRITION_DB.find(
          (f) =>
            f.name.toLowerCase() === nameLower ||
            f.name.toLowerCase().includes(nameLower) ||
            nameLower.includes(f.name.toLowerCase()),
        );
        return {
          name: matched?.name || name,
          portion: (c.portion === 'small' || c.portion === 'large') ? c.portion : 'medium',
          confidence: typeof c.confidence === 'number' ? c.confidence : 0.5,
          matchedFoodId: matched?.id,
          kcal: matched ? getPortionNutrition(matched, c.portion || 'medium').kcal : undefined,
        };
      });

      setCandidates(enriched);
      // 默认选中高置信度的
      const defaultSelected = new Set<number>();
      const defaultPortions: Record<number, PortionSize> = {};
      enriched.forEach((c, i) => {
        if (c.confidence >= 0.6 && c.matchedFoodId) {
          defaultSelected.add(i);
          defaultPortions[i] = c.portion;
        }
      });
      setSelectedIdx(defaultSelected);
      setPortions(defaultPortions);
    } catch (e) {
      logger.error('Recognition failed:', String(e));
      setRecognizeFailed(true);
      setFailReason('识别服务暂时不可用');
      toast.error('识别失败，可手动搜索');
    } finally {
      setIsRecognizing(false);
    }
  }, [selectedFile]);

  function parseCandidates(text: string): any[] | null {
    try {
      // 尝试直接解析
      const obj = JSON.parse(text.trim());
      if (obj.candidates && Array.isArray(obj.candidates)) {
        return obj.candidates;
      }
      return null;
    } catch {
      // 尝试提取 JSON
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const obj = JSON.parse(match[0]);
          if (obj.candidates && Array.isArray(obj.candidates)) {
            return obj.candidates;
          }
          return null;
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  const toggleSelect = (idx: number) => {
    setSelectedIdx((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
    // 初始化份量
    setPortions((prev) => {
      if (prev[idx]) return prev;
      return { ...prev, [idx]: candidates[idx]?.portion || 'medium' };
    });
  };

  const adjustPortion = (idx: number, delta: number) => {
    setPortions((prev) => {
      const current = prev[idx] || 'medium';
      const portions: PortionSize[] = ['small', 'medium', 'large'];
      const currentIdx = portions.indexOf(current);
      const nextIdx = Math.max(0, Math.min(2, currentIdx + delta));
      return { ...prev, [idx]: portions[nextIdx] };
    });
  };

  // 确认并返回餐次详情页 — 这里通过 localStorage 暂存识别结果
  const confirmSelection = useCallback(() => {
    if (selectedIdx.size === 0) {
      toast.error('请至少勾选一道菜');
      return;
    }
    // 将结果存到 sessionStorage，返回餐次页时读取
    const selected = Array.from(selectedIdx).map((i) => {
      const c = candidates[i];
      const portion = portions[i] || 'medium';
      const food = c.matchedFoodId
        ? NUTRITION_DB.find((f) => f.id === c.matchedFoodId)
        : null;
      const nutri = food
        ? getPortionNutrition(food, portion)
        : { kcal: c.kcal || 0, protein: 0, fat: 0, carbs: 0, gram: 0 };
      return {
        foodId: c.matchedFoodId || `custom_${i}`,
        name: c.name,
        portion,
        nutrition: nutri,
        source: 'photo_recognition' as const,
      };
    });

    sessionStorage.setItem('photo_recognition_result', JSON.stringify(selected));
    toast.success(`已选 ${selected.length} 道菜`);
    navigate(-1);
  }, [selectedIdx, candidates, portions, navigate]);

  return (
    <div className="space-y-4 px-4 py-4">
      {/* 照片预览区 */}
      <div className="overflow-hidden rounded-2xl border border-dashed border-border/60 bg-muted/20">
        {selectedImage ? (
          <div className="relative aspect-square">
            <Image src={selectedImage} alt="待识别菜品" className="h-full w-full object-cover" />
            {isRecognizing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Loader2 className="size-8 animate-spin" />
                  <span className="text-sm">AI 识别中...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex aspect-square flex-col items-center justify-center p-6 text-center">
            <Camera className="mb-3 size-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              拍一张食堂菜品的照片，AI 帮你识别菜名和份量
            </p>
          </div>
        )}
      </div>

      {/* 拍照/上传按钮 */}
      <div className="grid grid-cols-2 gap-3">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />
        <Button size="lg" onClick={() => cameraInputRef.current?.click()}>
          <Camera className="mr-2 size-4" />
          拍照
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 size-4" />
          相册选择
        </Button>
      </div>

      {/* 开始识别按钮 */}
      {selectedImage && !isRecognizing && candidates.length === 0 && !recognizeFailed && (
        <Button size="lg" className="w-full" onClick={startRecognition}>
          开始识别
        </Button>
      )}

      {/* 识别失败 */}
      {recognizeFailed && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 size-5 text-warning" />
            <div className="flex-1">
              <p className="text-sm font-medium">识别失败</p>
              <p className="text-xs text-muted-foreground">{failReason}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedImage(null)}>
                  重拍
                </Button>
                <Button size="sm" onClick={() => navigate(-1)}>
                  手动搜索
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 识别结果 */}
      {candidates.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              识别结果
              <Badge variant="outline" className="ml-2">
                {candidates.length} 道候选
              </Badge>
            </h3>
            <span className="text-xs text-muted-foreground">点击勾选要加入的菜</span>
          </div>

          <div className="space-y-2">
            {candidates.map((c, i) => {
              const isSelected = selectedIdx.has(i);
              const lowConfidence = c.confidence < 0.6;
              const portion = portions[i] || 'medium';
              return (
                <div
                  key={i}
                  onClick={() => !lowConfidence && toggleSelect(i)}
                  className={cn(
                    'rounded-xl border p-3 transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : lowConfidence
                        ? 'border-border/50 bg-muted/20 opacity-70'
                        : 'border-border bg-card hover:border-primary/30',
                    lowConfidence ? 'cursor-not-allowed' : 'cursor-pointer',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'flex size-5 items-center justify-center rounded-full border-2 transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border',
                        )}
                      >
                        {isSelected && <Check className="size-3" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{c.name}</span>
                          {!c.matchedFoodId && (
                            <Badge variant="outline" className="text-[10px]">
                              未匹配
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>置信度 {Math.round(c.confidence * 100)}%</span>
                          {c.kcal && <span>· 约 {c.kcal} kcal</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustPortion(i, -1);
                        }}
                        disabled={portion === 'small'}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-10 text-center text-xs">{PORTION_LABELS[portion]}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustPortion(i, 1);
                        }}
                        disabled={portion === 'large'}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  {lowConfidence && (
                    <p className="mt-1.5 pl-7 text-[11px] text-warning">
                      置信度低，建议手动确认或搜索
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={confirmSelection}
            disabled={selectedIdx.size === 0}
          >
            确认加入（{selectedIdx.size} 道）
          </Button>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
