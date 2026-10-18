import { useNavigate } from 'react-router-dom';
import { User, Target, Dumbbell, ChevronRight, Shield, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useStorage';

const GOAL_LABELS: Record<string, string> = {
  bulk: '增肌',
  cut: '减脂',
  maintain: '维持',
};

const FREQ_LABELS: Record<string, string> = {
  sedentary: '久坐少动',
  light: '每周1-3次',
  moderate: '每周3-5次',
  heavy: '每周6-7次',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile } = useProfile();

  return (
    <div className="space-y-4 px-4 py-4">
      {/* 个人信息卡 */}
      <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="size-7" />
            </div>
            <div>
              {profile ? (
                <>
                  <div className="text-lg font-bold">
                    {profile.gender === 'male' ? '男' : '女'} · {profile.age}岁
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {profile.height}cm · {profile.weight}kg
                    {profile.bodyFat && ` · 体脂${profile.bodyFat}%`}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold">还未建档</div>
                  <div className="text-xs text-muted-foreground">建档后才能使用 AI 饮食规划</div>
                </>
              )}
            </div>
          </div>

          {profile && (
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">
                <Target className="mr-1 size-3" />
                {GOAL_LABELS[profile.goal] || profile.goal}
              </Badge>
              <Badge variant="outline">
                <Dumbbell className="mr-1 size-3" />
                {FREQ_LABELS[profile.trainingFrequency] || profile.trainingFrequency}
              </Badge>
              {profile.dietaryRestrictions?.length! > 0 && (
                <Badge variant="outline" className="border-warning/40 text-warning">
                  {profile.dietaryRestrictions?.length} 项忌口
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 功能入口 */}
      <div className="space-y-2">
        <Card
          className="cursor-pointer transition-colors hover:border-primary/30"
          onClick={() => navigate('/profile/form')}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium">个人档案</div>
              <div className="text-xs text-muted-foreground">
                {profile ? '编辑身体数据与目标' : '立即建档开始规划'}
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-colors hover:border-primary/30"
          onClick={() => navigate('/profile/workout')}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent">
              <Dumbbell className="size-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-medium">训练记录</div>
              <div className="text-xs text-muted-foreground">记录今日训练，微调当日目标</div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="cursor-default">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-medium">营养计算说明</div>
              <div className="text-xs text-muted-foreground">
                Mifflin-St Jeor BMR × 活动系数
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 免责声明 */}
      <Card className="border-dashed border-warning/30">
        <CardContent className="space-y-2 p-4 text-xs">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Shield className="size-4 text-primary" />
            健康免责声明
          </div>
          <p className="text-muted-foreground">
            本应用提供的饮食建议为一般性参考，不构成医疗或营养诊断，不能替代医生或注册营养师的专业意见。
          </p>
          <ul className="space-y-1 pl-4 list-disc text-muted-foreground">
            <li>所有营养数值均为估算，食堂实际烹饪可能有差异</li>
            <li>孕妇、慢性病患者、进食障碍者、未成年人请咨询专业人士</li>
            <li>不对增肌/减脂效果做任何承诺，体重变化受多种因素影响</li>
          </ul>
          <div className="flex items-start gap-2 pt-1 text-warning">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>减脂期间不得低于安全下限（男1500/女1200 kcal/天）</span>
          </div>
        </CardContent>
      </Card>

      {/* 版本信息 */}
      <div className="pt-2 text-center text-[11px] text-muted-foreground">
        食堂餐训 v1.0.0 · 面向健身大学生
      </div>
      <div className="h-4" />
    </div>
  );
}
