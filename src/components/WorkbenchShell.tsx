import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Archive,
  AudioLines,
  BookOpenText,
  Boxes,
  ChevronDown,
  Feather,
  FilePlus2,
  GitBranch,
  LayoutDashboard,
  Mic,
  PackageCheck,
  PenLine,
  Settings2,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkbench } from '@/lib/store';
import { Artwork } from '@/components/Artwork';
import { useState } from 'react';

interface NavEntry {
  to: string;
  label: string;
  en: string;
  icon: LucideIcon;
  exact?: boolean;
}

const PIPELINE: NavEntry[] = [
  { to: '/', label: '工作台', en: 'OVERVIEW', icon: LayoutDashboard, exact: true },
  { to: '/capture', label: '01 采集台', en: 'CAPTURE', icon: Mic },
  { to: '/transcript', label: '02 转写台', en: 'TRANSCRIBE', icon: AudioLines },
  { to: '/compose', label: '03 编排室', en: 'COMPOSE', icon: Boxes },
  { to: '/write', label: '04 撰写室', en: 'WRITE', icon: PenLine },
  { to: '/publish', label: '05 出版工坊', en: 'PUBLISH', icon: BookOpenText },
  { to: '/deliver', label: '交付与归档', en: 'DELIVER', icon: PackageCheck },
];

const SYSTEM: NavEntry[] = [
  { to: '/agents', label: '智能体矩阵', en: 'AGENT MATRIX', icon: Sparkles },
  { to: '/skills', label: 'Skill 仓库', en: 'SKILL REGISTRY', icon: GitBranch },
  { to: '/settings', label: '模型设置', en: 'MODEL SETTINGS', icon: Settings2 },
];

const TITLES: Record<string, string> = {
  '/': '工作台',
  '/capture': '01 采集台',
  '/transcript': '02 转写台',
  '/compose': '03 编排室',
  '/write': '04 撰写室',
  '/publish': '05 出版工坊',
  '/deliver': '交付与归档',
  '/agents': '智能体矩阵',
  '/skills': 'Skill 仓库',
  '/settings': '模型设置',
};

function NavItem({ item }: { item: NavEntry }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.exact}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-colors',
          isActive
            ? 'bg-[#f6f0e4] text-[#1b1712]'
            : 'text-[#b9ae9a] hover:bg-white/[0.06] hover:text-[#efe7d8]',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full',
              isActive ? 'bg-seal' : 'bg-transparent',
            )}
          />
          <Icon className={cn('size-[15px] shrink-0', isActive ? 'text-seal' : 'text-[#8f8574]')} strokeWidth={1.8} />
          <span className="flex-1">{item.label}</span>
          {isActive && <span className="label text-[8px] tracking-[0.18em] text-[#9b8f7c]">{item.en}</span>}
        </>
      )}
    </NavLink>
  );
}

export function WorkbenchShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { project, savedAt, summaries, activeId, switchProject, newProject, cloneDemoProject, deleteProject } = useWorkbench();
  const done = project.chapters.filter((chapter) => chapter.status === 'done').length;
  const progress = Math.round(((done + project.illustrations.filter((i) => i.status === 'ready').length) / 9) * 100);
  const title = TITLES[location.pathname] ?? '工作台';
  const [open, setOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleNew = () => {
    const t = newTitle.trim();
    if (!t) return;
    newProject(t);
    setNewTitle('');
    setShowNew(false);
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col bg-[#17130e] text-[#efe7d8] lg:flex">
        <div className="flex items-center gap-3 px-5 pb-6 pt-6">
          <div className="grid size-9 place-items-center rounded-[3px] bg-seal text-[15px] font-bold text-[#f8f1e4]">拾</div>
          <div className="leading-tight">
            <div className="font-serif text-[15px] tracking-[0.18em]">拾光</div>
            <div className="label mt-0.5 text-[8px] text-[#8f8574]">Memoir Atelier</div>
          </div>
        </div>

        <div className="mx-4 mb-5">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex w-full gap-3 border border-white/10 bg-white/[0.035] p-3 text-left transition-colors hover:bg-white/[0.06]"
          >
            <div className="h-[54px] w-[42px] shrink-0 overflow-hidden rounded-[2px] bg-[#2a241c]">
              <Artwork variant="cover" styleId={project.cover.style} seed={project.cover.seed} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="truncate font-serif text-[13px] tracking-wide">{project.meta.title}</div>
                <ChevronDown className={cn('size-3 shrink-0 text-[#9b8f7c] transition-transform', open && 'rotate-180')} />
              </div>
              <div className="mt-1 truncate text-[10px] text-[#9b8f7c]">
                {project.meta.subject ? `${project.meta.subject} · ${project.meta.subjectAge} 岁` : '未填写讲述者'}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-[3px] flex-1 bg-white/10">
                  <div className="h-full bg-[#c9a86a]" style={{ width: `${progress}%` }} />
                </div>
                <span className="label text-[8px] text-[#c9a86a]">{progress}%</span>
              </div>
            </div>
          </button>

          {open && (
            <div className="mt-2 border border-white/10 bg-[#1c1711]">
              <div className="label px-3 py-2 text-[8px] text-[#6f6657]">项目列表 · {summaries.length} 个</div>
              <ul className="max-h-[180px] space-y-0.5 overflow-y-auto px-2 pb-2">
                {summaries.map((s) => (
                  <li key={s.id}>
                    <div
                      className={cn(
                        'group flex items-center gap-2 rounded-sm px-2 py-1.5 text-[11px]',
                        s.id === activeId ? 'bg-[#f6f0e4]/[0.08] text-[#efe7d8]' : 'text-[#b9ae9a] hover:bg-white/[0.04]',
                      )}
                    >
                      <button onClick={() => { switchProject(s.id); setOpen(false); }} className="min-w-0 flex-1 truncate text-left">
                        <span className="truncate">{s.isDemo && '★ '}{s.title}</span>
                        <span className="ml-1 text-[8px] text-[#8f8574]">{s.chapterCount} 章 · {s.wordCount} 字</span>
                      </button>
                      {!s.isDemo && (
                        <button
                          onClick={(e) => { e.stopPropagation(); if (confirm(`删除项目「${s.title}」？此操作不可撤销。`)) deleteProject(s.id); }}
                          className="opacity-0 transition-opacity hover:text-seal group-hover:opacity-100"
                          title="删除"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-white/10 p-2">
                {showNew ? (
                  <div className="space-y-2">
                    <input
                      autoFocus
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNew()}
                      placeholder="项目标题"
                      className="w-full rounded-sm border border-white/10 bg-[#2a241c] px-2 py-1 text-[11px] text-[#efe7d8] placeholder:text-[#6f6657] focus:border-[#c9a86a] focus:outline-none"
                    />
                    <div className="flex gap-1.5">
                      <button onClick={handleNew} className="flex-1 rounded-sm bg-[#c9a86a] px-2 py-1 text-[10px] font-medium text-[#17130e] hover:bg-[#d9b87a]">创建</button>
                      <button onClick={() => { setShowNew(false); setNewTitle(''); }} className="flex-1 rounded-sm border border-white/10 px-2 py-1 text-[10px] text-[#b9ae9a] hover:bg-white/[0.04]">取消</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setShowNew(true)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-sm border border-white/10 px-2 py-1.5 text-[10px] text-[#b9ae9a] hover:bg-white/[0.04] hover:text-[#efe7d8]"
                    >
                      <FilePlus2 className="size-3" /> 新建空白
                    </button>
                    <button
                      onClick={() => { cloneDemoProject(); setOpen(false); }}
                      className="flex flex-1 items-center justify-center gap-1 rounded-sm border border-white/10 px-2 py-1.5 text-[10px] text-[#c9a86a] hover:bg-white/[0.04]"
                    >
                      ★ 克隆演示
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-2 pb-4">
          <div>
            <div className="label px-3 pb-2 text-[8px] text-[#6f6657]">创作流水线</div>
            <div className="space-y-0.5">
              {PIPELINE.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </div>
          </div>
          <div>
            <div className="label px-3 pb-2 text-[8px] text-[#6f6657]">系统</div>
            <div className="space-y-0.5">
              {SYSTEM.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </div>
          </div>
        </nav>

        <div className="mx-4 mb-4 border-t border-white/10 pt-3 text-[10px] text-[#8f8574]">
          <div className="flex items-center gap-2">
            <span className="size-1.5 animate-soft-pulse rounded-full bg-[#8fae6e]" />
            方言 ASR 路由就绪
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[#6f6657]">
            <Archive className="size-3" />
            本地留档 · v1.0
          </div>
        </div>
      </aside>

      <div className="lg:pl-[232px]">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
          <div className="flex h-14 items-center gap-4 px-5 lg:px-8">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Wand2 className="size-3.5 text-seal" />
              <span className="hidden sm:inline">回忆录工坊</span>
              <span className="hidden text-border sm:inline">/</span>
              <span className="font-medium text-foreground">{title}</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground md:flex">
                <span className="size-1.5 rounded-full bg-olive" />
                自动保存 · {savedAt}
              </div>
              <div className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] text-muted-foreground sm:flex">
                <Sparkles className="size-3 text-gold" />
                12 个智能体在岗
              </div>
              <div className="flex items-center gap-2">
                <div className="grid size-7 place-items-center rounded-full border border-border bg-[#efe6d4] font-serif text-[11px] text-[#6b5b43]">
                  林
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto border-t border-border/60 px-3 py-2 lg:hidden">
            {[...PIPELINE, ...SYSTEM].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'whitespace-nowrap rounded-full border px-3 py-1 text-[11px]',
                    isActive ? 'border-seal bg-seal text-white' : 'border-border bg-card text-muted-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </header>

        <main className="mx-auto max-w-[1360px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function StageBadge({ no, color, soft, children }: { no: string; color: string; soft: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[2px] px-2 py-1 text-[10px]" style={{ background: soft, color }}>
      <span className="font-mono">{no}</span>
      {children}
    </span>
  );
}

export function MicroLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('label text-[9px] text-muted-foreground', className)}>{children}</div>;
}

export function Ornament() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#b9a98d]">
      <span className="h-px w-5 bg-current" />
      <Feather className="size-3" />
      <span className="h-px w-5 bg-current" />
    </span>
  );
}
