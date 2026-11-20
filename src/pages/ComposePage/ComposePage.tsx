import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookMarked,
  Check,
  ChevronRight,
  Compass,
  Feather,
  GitBranch,
  Layers,
  MapPin,
  Quote,
  Users,
} from 'lucide-react';
import { NARRATIVE_PRESETS, TONE_PRESETS } from '@/data/presets';
import { useWorkbench } from '@/lib/store';
import { ActionButton, Bar, Chip, Note, PageHead, Panel, StatusDot } from '@/components/ui-kit';
import { cn } from '@/lib/utils';

export default function ComposePage() {
  const { project, setNarrative, setTone, update } = useWorkbench();
  const navigate = useNavigate();
  const [locked, setLocked] = useState(true);
  const story = project.story;
  const narrative = NARRATIVE_PRESETS.find((item) => item.id === project.narrative) ?? NARRATIVE_PRESETS[0];
  const tone = TONE_PRESETS.find((item) => item.id === project.tone) ?? TONE_PRESETS[0];

  const ordered = narrative.chapterOrder
    .map((index) => story?.outline[index])
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (!story) {
    return (
      <div className="animate-fade-up">
        <PageHead eyebrow="Stage 03 · Compose" title="还没有故事主干。" description="先完成转写与校对，再让故事勘探员从口述中抽取时间线、人物与可成书的章节。" />
        <ActionButton variant="primary" onClick={() => navigate('/transcript')}>回到转写台</ActionButton>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHead
        eyebrow="Stage 03 · Compose"
        title="先搭骨架，再添血肉。"
        description="勘探员把数万字口述压缩成一条故事线，结构建筑师给出五种叙事方案。你可以切换结构、调整语气，再进入撰写。"
        actions={
          <>
            <ActionButton onClick={() => update({ story: { ...story, coverage: Math.min(99, story.coverage + 1) } })}>
              <Compass className="size-3.5" /> 重新抽取
            </ActionButton>
            <ActionButton
              variant="primary"
              onClick={() => {
                setLocked(true);
                navigate('/write');
              }}
            >
              锁定结构，进入撰写 <ArrowRight className="size-3.5" />
            </ActionButton>
          </>
        }
      />

      <Panel
        eyebrow="Narrative structure · 叙事方案"
        title="选择这本书的讲法"
        action={<span className="text-[10px] text-muted-foreground">当前：{narrative.name} · {narrative.essence}</span>}
        bodyClassName="p-4"
      >
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {NARRATIVE_PRESETS.map((preset) => {
            const active = preset.id === project.narrative;
            return (
              <button
                key={preset.id}
                onClick={() => setNarrative(preset.id)}
                className={cn(
                  'group relative flex h-full flex-col border p-3 text-left transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  active
                    ? 'border-seal/40 bg-[#fbf4e7] shadow-[0_12px_30px_-26px_rgba(120,40,25,.7)]'
                    : 'border-border/80 bg-card hover:border-[#b9a98d] hover:bg-[#faf5e9]',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="label text-[8px] text-[#a2907a]">{preset.en}</span>
                  {active ? (
                    <span className="grid size-4 place-items-center rounded-full bg-seal text-white"><Check className="size-2.5" /></span>
                  ) : (
                    <span className="size-4 rounded-full border border-border" />
                  )}
                </div>
                <div className="mt-2 font-serif text-[16px] font-semibold tracking-wide">{preset.name}</div>
                <div className="mt-0.5 font-serif text-[11px] text-seal">{preset.essence}</div>
                <p className="mt-2 flex-1 text-[10px] leading-relaxed text-muted-foreground">{preset.description}</p>
                <div className="mt-2 border-t border-dashed border-border/80 pt-2 text-[9px] text-[#9b8b73]">适合：{preset.bestFor}</div>
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <div className="paper-card relative overflow-hidden bg-[#1d1812] p-5 text-[#efe6d5]">
            <div className="absolute right-4 top-4 font-serif text-[64px] leading-none text-white/[0.06]">“</div>
            <div className="label text-[8px] text-[#a08f74]">Logline · 一句话故事</div>
            <p className="mt-3 max-w-2xl font-serif text-[19px] leading-[1.9] tracking-wide">{story.logline}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {story.themes.map((theme) => (
                <span key={theme} className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-[#c7b99f]">
                  {theme}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-3">
              <span className="label text-[8px] text-[#8f8574]">素材覆盖</span>
              <div className="h-[3px] flex-1 bg-white/10">
                <div className="h-full bg-[#c9a86a]" style={{ width: `${story.coverage}%` }} />
              </div>
              <span className="font-mono text-[11px] text-[#c9a86a]">{story.coverage}%</span>
              <span className="text-[9px] text-[#8f8574]">10 段未采用</span>
            </div>
          </div>

          <Panel
            eyebrow="Story spine · 时间轴"
            title="七个节点，一条人命"
            action={<span className="text-[10px] text-muted-foreground">1943 — 2023</span>}
            bodyClassName="p-5"
          >
            <div className="relative border-l border-[#d8cbb4] pl-5">
              {story.timeline.map((event, index) => (
                <div key={event.year + event.title} className={cn('relative pb-5', index === story.timeline.length - 1 && 'pb-0')}>
                  <span className="absolute -left-[25px] top-1 grid size-3 place-items-center rounded-full border border-[#b9a98d] bg-card">
                    <span className="size-1 rounded-full bg-seal" />
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[12px] text-seal">{event.year}</span>
                    <span className="font-serif text-[13.5px] font-medium">{event.title}</span>
                  </div>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">{event.detail}</p>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid gap-5 md:grid-cols-2">
            <Panel eyebrow="People & places" title="人物、地点与物件" bodyClassName="p-4">
              <div className="flex flex-wrap gap-1.5">
                {story.entities.map((entity) => (
                  <span
                    key={entity.name}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10.5px]',
                      entity.kind === 'person'
                        ? 'border-seal/20 bg-seal/[0.04] text-[#7f3226]'
                        : entity.kind === 'place'
                          ? 'border-[#29434e]/20 bg-[#29434e]/[0.05] text-[#29434e]'
                          : 'border-gold/30 bg-gold/[0.07] text-[#7a5a2c]',
                    )}
                  >
                    {entity.kind === 'person' ? <Users className="size-2.5" /> : entity.kind === 'place' ? <MapPin className="size-2.5" /> : <BookMarked className="size-2.5" />}
                    {entity.name}
                    <span className="opacity-60">· {entity.role}</span>
                  </span>
                ))}
              </div>
            </Panel>

            <Panel eyebrow="Quotes · 金句" title="值得保留的原话" bodyClassName="p-4">
              <div className="space-y-3">
                {story.quotes.map((quote) => (
                  <div key={quote.text} className="border-l border-seal/40 pl-3">
                    <p className="font-serif text-[12px] leading-[1.8] text-ink">{quote.text}</p>
                    <div className="mt-1 flex items-center gap-1 text-[8.5px] text-muted-foreground"><Quote className="size-2.5" />{quote.source}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <div className="space-y-5">
          <Panel
            eyebrow="Tone · 叙事风格"
            title="用谁的声音来讲"
            action={<span className="text-[10px] text-seal">{tone.name}</span>}
            bodyClassName="p-4"
          >
            <div className="space-y-2">
              {TONE_PRESETS.map((preset) => {
                const active = preset.id === project.tone;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setTone(preset.id)}
                    className={cn(
                      'w-full border p-3 text-left transition-colors',
                      active ? 'border-seal/35 bg-[#fbf4e7]' : 'border-border/70 bg-card hover:border-[#b9a98d]',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-[13px] font-medium">{preset.name}</span>
                        <span className="label text-[7.5px] text-[#a2907a]">{preset.en}</span>
                      </div>
                      {active && <StatusDot tone="seal" />}
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{preset.description}</p>
                    {active && (
                      <div className="mt-2 border-t border-dashed border-border/80 pt-2 font-serif text-[11.5px] leading-relaxed text-[#7f3226]">
                        “{preset.sample}”
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel
            eyebrow="Outline · 章节骨架"
            title={`${ordered.length} 章 · 约 ${project.wordCount.toLocaleString()} 字`}
            action={
              <button
                onClick={() => setLocked((value) => !value)}
                className={cn('inline-flex items-center gap-1 text-[10px]', locked ? 'text-olive' : 'text-seal')}
              >
                {locked ? <><Layers className="size-3" /> 结构已锁定</> : <><GitBranch className="size-3" /> 待确认</>}
              </button>
            }
            bodyClassName="p-0"
          >
            <div className="divide-y divide-border/60">
              {ordered.map((item, displayIndex) => (
                <div key={item.id} className="group flex gap-3 px-4 py-3">
                  <div className="w-7 shrink-0 text-center">
                    <div className="font-mono text-[15px] text-[#c0b39c]">{String(displayIndex + 1).padStart(2, '0')}</div>
                    <div className="mt-0.5 text-[8px] text-muted-foreground">原 {item.id.replace('ch', '')}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-serif text-[13px] font-medium">{item.title}</span>
                      <span className="shrink-0 font-mono text-[9px] text-muted-foreground">{item.period}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">{item.summary}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.keyEvents.slice(0, 3).map((event) => (
                        <span key={event} className="rounded-[2px] bg-[#f1e8d7] px-1.5 py-0.5 text-[8.5px] text-[#7a6a52]">{event}</span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="mt-3 size-3.5 shrink-0 text-[#c0b39c]" />
                </div>
              ))}
            </div>
            <div className="border-t border-border/70 bg-[#f8f2e5] px-4 py-2.5 text-[10px] text-muted-foreground">
              {narrative.name} · 章节顺序已按「{narrative.essence}」重排
            </div>
          </Panel>

          <Note tone="muted">
            <span className="flex items-center gap-1.5"><Feather className="size-3" /> 结构不是牢笼。</span>
            进入撰写室后，仍可随时切换风格、重写单章；已确认的事实与引语不会被改动。
          </Note>

          {!locked && (
            <ActionButton variant="primary" className="w-full" onClick={() => setLocked(true)}>
              确认这套结构
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}
