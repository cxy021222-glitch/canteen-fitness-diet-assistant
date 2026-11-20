import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  AudioLines,
  BookOpenText,
  Check,
  CircleDot,
  Clock3,
  FileAudio,
  ImageIcon,
  Mic,
  PenLine,
  Sparkles,
  Upload,
} from 'lucide-react';
import { AGENTS, STAGES } from '@/data/agents';
import { useWorkbench } from '@/lib/store';
import { ActionButton, Bar, Metric, Note, PageHead, Panel, StatusDot } from '@/components/ui-kit';
import { Artwork } from '@/components/Artwork';
import { cn } from '@/lib/utils';

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h} 小时 ${m} 分` : `${m} 分钟`;
}

export default function WorkbenchPage() {
  const { project, cleaned } = useWorkbench();
  const navigate = useNavigate();
  const totalMinutes = Math.round(project.tracks.reduce((sum, track) => sum + track.duration, 0) / 60);
  const doneChapters = project.chapters.filter((chapter) => chapter.status === 'done').length;
  const readyIllustrations = project.illustrations.filter((item) => item.status === 'ready').length;

  const metrics: Record<string, { value: string; hint: string; progress: number; status: string }> = {
    capture: {
      value: `${project.tracks.length} 段`,
      hint: `${totalMinutes} 分钟 · ${project.dialect}`,
      progress: 100,
      status: '已完成',
    },
    transcript: {
      value: `${project.transcript.length} 行`,
      hint: `气口清理 ${cleaned.ratio}%`,
      progress: 100,
      status: '已校准',
    },
    compose: {
      value: '5 章',
      hint: '时间轴 7 节点 · 4 主题',
      progress: 100,
      status: '结构锁定',
    },
    write: {
      value: `${project.wordCount.toLocaleString()} 字`,
      hint: `${doneChapters} / 5 章已成稿`,
      progress: Math.round((doneChapters / 5) * 100),
      status: doneChapters === 5 ? '已完稿' : '撰写中',
    },
    publish: {
      value: `${readyIllustrations + 1} 图`,
      hint: '封面 + 章节插图',
      progress: Math.round(((readyIllustrations + 1) / 6) * 100),
      status: '排版中',
    },
  };

  return (
    <div className="animate-fade-up">
      <PageHead
        eyebrow="Memoir Atelier · Workbench"
        title="把一段声音，编成一本书。"
        description="从访谈录音到可印刷的回忆录，12 个智能体在五个工位上接力。你可以随时接管任何一步，修改会实时写回项目。"
        actions={
          <>
            <ActionButton onClick={() => navigate('/capture')}>
              <Upload className="size-3.5" /> 导入音频
            </ActionButton>
            <ActionButton variant="primary" onClick={() => navigate('/capture?record=1')}>
              <Mic className="size-3.5" /> 一键录音
            </ActionButton>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_318px]">
        <div className="space-y-5">
          <Panel
            eyebrow="Pipeline · 今日进度"
            title="一条从声音到书的流水线"
            action={
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <StatusDot tone="seal" pulse />
                A07 执笔人正在工作
              </div>
            }
            bodyClassName="p-4"
          >
            <div className="grid gap-2 md:grid-cols-5">
              {STAGES.map((stage, index) => {
                const metric = metrics[stage.id];
                const isActive = stage.id === 'write';
                return (
                  <div key={stage.id} className="relative">
                    <Link
                      to={stage.href}
                      className={cn(
                        'group flex h-full flex-col justify-between border p-3 transition-all',
                        isActive
                          ? 'border-seal/30 bg-[#fbf6ea] shadow-[0_10px_28px_-24px_rgba(120,40,25,.55)]'
                          : 'border-border/80 bg-card hover:border-[#b9a98d] hover:bg-[#faf5e9]',
                      )}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="font-mono text-[20px] leading-none text-[#c8bba3]">{stage.no}</span>
                          <span
                            className="rounded-[2px] px-1.5 py-0.5 text-[9px]"
                            style={{ background: stage.soft, color: stage.color }}
                          >
                            {metric.status}
                          </span>
                        </div>
                        <div className="mt-3 font-serif text-[15px] font-semibold tracking-wide">{stage.name}</div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">{stage.description}</div>
                      </div>
                      <div className="mt-5">
                        <div className="font-mono text-[19px] leading-none text-ink">{metric.value}</div>
                        <div className="mt-1 text-[10px] text-muted-foreground">{metric.hint}</div>
                        <Bar value={metric.progress} tone={isActive ? 'seal' : 'olive'} className="mt-2.5" />
                      </div>
                    </Link>
                    {index < STAGES.length - 1 && (
                      <ArrowRight className="absolute -right-[9px] top-1/2 z-10 hidden size-3.5 -translate-y-1/2 text-[#c4b69d] md:block" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-border/80 pt-3">
              <span className="label text-[8px] text-muted-foreground">快捷动作</span>
              {[
                { label: '听一遍素材', to: '/capture', icon: FileAudio },
                { label: '校对转写', to: '/transcript', icon: AudioLines },
                { label: '调整结构', to: '/compose', icon: Sparkles },
                { label: '继续撰写', to: '/write', icon: PenLine },
                { label: '生成封面', to: '/publish', icon: ImageIcon },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-[#b9a98d] hover:text-foreground"
                >
                  <action.icon className="size-3" />
                  {action.label}
                </Link>
              ))}
            </div>
          </Panel>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <Panel
              eyebrow="Source · 访谈素材"
              title="三段口述，一百三十二分钟"
              action={
                <Link to="/capture" className="text-[10px] text-seal hover:underline">
                  进入采集台
                </Link>
              }
              bodyClassName="px-4 py-2"
            >
              <div className="divide-y divide-border/70">
                {project.tracks.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-3 py-3">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-[#f4ecdc]">
                      <AudioLines className="size-3.5 text-[#7b6a50]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-medium">{track.name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{formatDuration(track.duration)}</span>
                        <span className="text-border">/</span>
                        <span>{track.dialect}</span>
                        <span className="text-border">/</span>
                        <span>{track.recordedAt.slice(5)}</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-olive">
                      <Check className="size-3" /> 已转写
                    </span>
                    <span className="font-mono text-[10px] text-[#c0b39c]">0{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-border/80 py-2.5 text-[10px] text-muted-foreground">
                <span>总时长 {formatDuration(project.tracks.reduce((sum, track) => sum + track.duration, 0))}</span>
                <span>普通话 · 四川话 · 粤语路由</span>
              </div>
            </Panel>

            <Panel eyebrow="Outputs · 最近生成" title="书稿正在成形" bodyClassName="px-4 py-2">
              <div className="divide-y divide-border/70">
                {[
                  {
                    icon: BookOpenText,
                    title: `第 ${doneChapters} 章 · ${project.chapters[2]?.title ?? '炉火不熄'}`,
                    meta: `${project.chapters[2]?.words ?? 365} 字 · 执笔人 A07`,
                    to: '/write',
                  },
                  {
                    icon: ImageIcon,
                    title: `封面 · ${project.cover.style === 'woodcut' ? '木刻版画' : '自定义风格'}`,
                    meta: '3:4 主视觉 · 画师 A09',
                    to: '/publish',
                  },
                  {
                    icon: Sparkles,
                    title: '故事主干卡 · 7 个时间节点',
                    meta: '勘探员 A05 · 置信度 92%',
                    to: '/compose',
                  },
                  {
                    icon: FileAudio,
                    title: '第三次访谈 · 气口清理',
                    meta: `删除 ${cleaned.removed} 处口头语 · 编辑 A04`,
                    to: '/transcript',
                  },
                ].map((item) => (
                  <Link key={item.title} to={item.to} className="group flex items-center gap-3 py-3">
                    <div className="grid size-8 shrink-0 place-items-center rounded-[2px] border border-border bg-[#f7f0e1]">
                      <item.icon className="size-3.5 text-[#7b6a50]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] group-hover:text-seal">{item.title}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{item.meta}</div>
                    </div>
                    <ArrowRight className="size-3.5 text-[#c0b39c] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </Panel>
          </div>

          <Panel eyebrow="Quality · 交付检查" title="成书前的六道关" bodyClassName="p-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { label: '转写准确率', value: '96.4%', tone: 'olive' },
                { label: '事实待核', value: '2 处', tone: 'gold' },
                { label: '插图完成', value: `${readyIllustrations} / 5`, tone: 'seal' },
                { label: '封面安全区', value: '通过', tone: 'olive' },
                { label: '页数估算', value: '248 页', tone: 'olive' },
                { label: '授权与隐私', value: '待签署', tone: 'gold' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between border border-border/80 bg-card px-3 py-2.5">
                  <span className="text-[11px] text-muted-foreground">{item.label}</span>
                  <span className="flex items-center gap-1.5 font-mono text-[12px] text-ink">
                    <StatusDot tone={item.tone as 'olive' | 'gold' | 'seal'} />
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel bodyClassName="p-0" className="overflow-hidden">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#2b241b]">
              <Artwork variant="cover" styleId={project.cover.style} seed={project.cover.seed} className="opacity-95" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17130e]/90 via-[#17130e]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-[#f8f2e6]">
                <div className="label text-[8px] text-[#d8c7a9]">Cover · {project.cover.style}</div>
                <div className="mt-1.5 font-serif text-[26px] font-bold tracking-[0.1em]">{project.meta.title}</div>
                <div className="mt-1 text-[10px] text-[#d8c9ad]">{project.meta.subtitle}</div>
                <div className="mt-3 flex items-center justify-between text-[9px] text-[#b7a88d]">
                  <span>{project.cover.author}</span>
                  <span className="seal-stamp px-1.5 py-0.5 text-[8px]">待付印</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="grid grid-cols-3 gap-2">
                <Metric label="章节" value={doneChapters} hint="of 5" />
                <Metric label="字数" value={project.wordCount.toLocaleString()} hint="约 12 页" />
                <Metric label="插图" value={readyIllustrations} hint="of 5" />
              </div>
              <Bar value={Math.round(((doneChapters + readyIllustrations) / 10) * 100)} tone="seal" />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>整体完成度</span>
                <span className="font-mono text-ink">{Math.round(((doneChapters + readyIllustrations) / 10) * 100)}%</span>
              </div>
              <ActionButton variant="primary" className="w-full" onClick={() => navigate('/write')}>
                <PenLine className="size-3.5" /> 继续撰写第 5 章
              </ActionButton>
            </div>
          </Panel>

          <Panel
            eyebrow="Agents on duty"
            title="智能体在岗"
            action={<Link to="/agents" className="text-[10px] text-seal hover:underline">全部 12 个</Link>}
            bodyClassName="px-4 py-2"
          >
            <div className="divide-y divide-border/70">
              {AGENTS.filter((agent) => ['a02', 'a04', 'a07', 'a10'].includes(agent.id)).map((agent) => (
                <div key={agent.id} className="flex items-center gap-2.5 py-2.5">
                  <span className="font-mono text-[9px] text-[#b9a98d]">{agent.code}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11.5px]">{agent.name}</div>
                    <div className="truncate text-[9.5px] text-muted-foreground">{agent.model}</div>
                  </div>
                  <span
                    className={cn(
                      'flex items-center gap-1 text-[9px]',
                      agent.status === 'running' ? 'text-seal' : agent.status === 'warm' ? 'text-gold' : 'text-olive',
                    )}
                  >
                    <StatusDot tone={agent.status === 'running' ? 'seal' : agent.status === 'warm' ? 'gold' : 'olive'} pulse={agent.status === 'running'} />
                    {agent.status === 'running' ? '运行' : agent.status === 'warm' ? '预热' : '就绪'}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <div className="border border-border/80 bg-[#f1e9d9] p-4">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#6c5c45]">
              <Clock3 className="size-3.5" /> 今日工作记录
            </div>
            <div className="mt-3 space-y-2.5 border-l border-[#d4c6ac] pl-3 text-[10.5px] text-[#7b6a50]">
              {[
                ['10:42', 'A04 完成第三次访谈的气口清理'],
                ['10:51', 'A05 抽取故事主干，覆盖 92% 素材'],
                ['11:06', 'A07 开始撰写第 5 章'],
                ['11:18', 'A10 生成第 4 张章节插图'],
              ].map(([time, text]) => (
                <div key={time} className="relative">
                  <span className="absolute -left-[17px] top-1.5 size-1.5 rounded-full bg-[#b09a76]" />
                  <span className="font-mono text-[9px] text-[#a08f74]">{time}</span>
                  <div>{text}</div>
                </div>
              ))}
            </div>
            <Note tone="muted">
              所有修改自动保存在本地。成稿需经讲述者确认后，方可进入印刷与公开传播。
            </Note>
          </div>

          <div className="flex items-center justify-between px-1 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1"><CircleDot className="size-2.5" /> v1.0 · 本地优先</span>
            <span>MEMOIR ATELIER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
