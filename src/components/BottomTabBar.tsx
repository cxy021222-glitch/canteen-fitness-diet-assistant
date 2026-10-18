import { NavLink, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, Cookie, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: Home },
  { path: '/plan', label: '记录', icon: UtensilsCrossed },
  { path: '/snack', label: '零食', icon: Cookie },
  { path: '/profile', label: '我的', icon: User },
];

export default function BottomTabBar() {
  const { pathname } = useLocation();

  // 仅在一级路由页面显示底部导航
  const isTopLevel =
    pathname === '/' ||
    pathname === '/plan' ||
    pathname === '/snack' ||
    pathname === '/profile';

  if (!isTopLevel) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? pathname === '/'
              : pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors',
              )}
            >
              <Icon
                className={cn(
                  'size-5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
      {/* 底部安全区 */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
