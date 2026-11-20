import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PageHead({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="label mb-2 text-[9px] text-seal">{eyebrow}</div>
        <h1 className="font-serif text-[30px] leading-tight tracking-[0.02em] text-ink sm:text-[34px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  eyebrow,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn('paper-card grain relative', className)}>
      {(title || action || eyebrow) && (
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
          <div className="min-w-0">
            {eyebrow && <div className="label mb-1 text-[8px] text-muted-foreground">{eyebrow}</div>}
            {title && <div className="truncate font-serif text-[14px] font-semibold tracking-wide">{title}</div>}
          </div>
          {action}
        </div>
      )}
      <div className={cn('relative', bodyClassName ?? 'p-4')}>{children}</div>
    </section>
  );
}

type ActionVariant = 'primary' | 'outline' | 'ghost' | 'dark';

export function ActionButton({
  children,
  variant = 'outline',
  size = 'md',
  loading,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ActionVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}) {
  const variants: Record<ActionVariant, string> = {
    primary:
      'bg-seal text-[#fdf7ec] border border-[#8f2f23] hover:bg-[#933124] active:bg-[#7f291e] shadow-[0_1px_0_rgba(255,255,255,.18)_inset]',
    outline: 'bg-card text-foreground border border-border hover:border-[#b9a98d] hover:bg-[#f3ecdd] active:bg-[#ece3d1]',
    ghost: 'bg-transparent text-muted-foreground border border-transparent hover:bg-[#efe7d7] hover:text-foreground',
    dark: 'bg-ink text-[#f6efe2] border border-black hover:bg-[#2a241c] active:bg-[#0f0c09]',
  };
  const sizes = {
    sm: 'h-7 px-2.5 text-[11px] gap-1.5',
    md: 'h-9 px-3.5 text-[12px] gap-2',
    lg: 'h-11 px-5 text-[13px] gap-2',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-[3px] font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="size-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export function Chip({
  children,
  active,
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        active
          ? 'border-seal/40 bg-seal/10 text-seal'
          : 'border-border bg-card text-muted-foreground hover:border-[#b9a98d] hover:text-foreground',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Bar({ value, tone = 'seal', className }: { value: number; tone?: 'seal' | 'olive' | 'ink'; className?: string }) {
  const colors = { seal: 'bg-seal', olive: 'bg-olive', ink: 'bg-ink' };
  return (
    <div className={cn('h-[4px] w-full overflow-hidden rounded-full bg-[#e3d9c7]', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colors[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function StatusDot({ tone = 'olive', pulse }: { tone?: 'olive' | 'seal' | 'gold' | 'muted'; pulse?: boolean }) {
  const colors = { olive: 'bg-olive', seal: 'bg-seal', gold: 'bg-gold', muted: 'bg-[#b9b0a0]' };
  return <span className={cn('inline-block size-1.5 rounded-full', colors[tone], pulse && 'animate-soft-pulse')} />;
}

export function Metric({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div>
      <div className="label text-[8px] text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-[18px] font-medium tracking-tight text-ink">{value}</div>
      {hint && <div className="mt-0.5 text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function KeyValue({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-dashed border-border/70 py-2 text-[11.5px] last:border-0">
      <span className="shrink-0 text-muted-foreground">{k}</span>
      <span className="text-right text-foreground">{v}</span>
    </div>
  );
}

export function Note({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'seal' | 'gold' }) {
  const styles = {
    muted: 'border-border bg-[#f4edde] text-muted-foreground',
    seal: 'border-seal/25 bg-seal/[0.055] text-[#7f3226]',
    gold: 'border-gold/30 bg-gold/[0.08] text-[#7a5a2c]',
  };
  return (
    <div className={cn('rounded-[2px] border px-3 py-2 text-[11px] leading-relaxed', styles[tone])}>{children}</div>
  );
}

export function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-border" />
      {label && <span className="label text-[8px] text-muted-foreground">{label}</span>}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
