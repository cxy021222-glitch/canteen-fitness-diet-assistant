import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomTabBar from '@/components/BottomTabBar';
import { cn } from '@/lib/utils';

// 餐次中文名映射
export const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

// 二级页面标题映射
const PAGE_TITLES: Record<string, string> = {
  '/plan/meal': '餐次详情',
  '/plan/photo': '拍照识别',
  '/profile/form': '个人档案',
  '/profile/workout': '训练记录',
};

function getPageTitle(pathname: string, params: Record<string, string>): string {
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(prefix)) {
      if (prefix === '/plan/meal' && params.mealType) {
        return MEAL_TYPE_LABELS[params.mealType] || title;
      }
      return title;
    }
  }
  return '';
}

function isSubPage(pathname: string): boolean {
  const topLevel = ['/', '/plan', '/snack', '/profile'];
  return !topLevel.includes(pathname);
}

export function Layout() {
  const { pathname } = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const sub = isSubPage(pathname);
  const title = getPageTitle(pathname, params);

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-background">
      {/* 二级页面顶部导航栏 */}
      {sub && (
        <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-border/40 bg-background/90 px-4 backdrop-blur-md">
          <Button
            variant="ghost"
            size="icon"
            className="!absolute left-1 h-8 w-8"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="mx-auto text-sm font-semibold">{title}</h1>
          <div className="w-8" />
        </header>
      )}

      {/* 主内容区 */}
      <main
        className={cn(
          'flex-1',
          sub ? 'pb-4' : 'pb-20', // 一级页面留底部 tabbar 空间
        )}
      >
        <Outlet />
      </main>

      {/* 底部 TabBar（仅一级页面显示） */}
      {!sub && <BottomTabBar />}
    </div>
  );
}
