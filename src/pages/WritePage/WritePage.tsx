import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlignLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Eye,
  Feather,
  FileCheck2,
  PencilLine,
  Play,
  Quote,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react';
import { DEMO_FACTS } from '@/data/demoProject';
import { TONE_PRESETS } from '@/data/presets';
import { useWorkbench } from '@/lib/store';
import { ActionButton, Bar, Chip, Metric, Note, PageHead, Panel, StatusDot } from '@/components/ui-kit';
import { cn } from '@/lib/utils';

const TWEAKS = [
  { id: 'sensory', label: '细节增强', icon: Sparkles },
  { id: 'dialogue', label: '对白还原', icon: Quote },
  { id: 'scenery', label: '加一段景物', icon: Feather },
  { id: 'restrain', label: '再克制些', icon: AlignLeft },
];

const SENSORY = [
  '屋里的灯泡只有十五瓦，光落下来，把每个人的影子都拉得很长。',
  '窗缝里灌进来的风带着煤灰味，落在牙上，咯吱作响。',
  '她说话的时候，手里一直捻着围裙的角，捻得发白。',
];
const SCENERY = [
  '山里的雾是从江面起来的，先是薄薄一层，后来就把整座山都含住了。',
  '傍晚的时候，高炉的烟和云连在一起，分不清哪一块是天。',
  '冬天来得早，屋檐下结着冰凌，太阳一照，滴滴答答地化。',
];

export default function WritePage() {
  const { project, updateChapterBody, generateChapter, generatingChapter, setTone } = useWorkbench();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('ch3');
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const chapter = project.chapters.find((item) => item.id === activeId) ?? project.chapters[0];
  const tone = TONE_PRESETS.find((item) => item.id === project.tone) ?? TONE_PRESETS[0];
  const isGenerating = generatingChapter === chapter.id;
  const totalWords = useMemo(() => project.chapters.reduce((sum, item) => sum + item.body.replace(/\s/g, '').length, 0), [project.chapters]);
  const paragraphs = chapter.body.split(/\n\n+/).filter(Boolean);

  const applyTweak = (id: string) => {
    const pool = id === 'sensory' ? SENSORY : id === 'scenery' ? SCENERY : null;
    if (!pool) {
      setNotice(id === 'dialogue' ? '已请执笔人标出可还原为对白的 3 处叙述，待确认。' : '已把“克制”写入本轮风格约束，重写时生效。');
      return;
    }
    const sentence = pool[Math.floor(Math.random() * pool.length)];
    updateChapterBody(chapter.id, chapter.body ? `${chapter.body}\n\n${sentence}` : sentence);
    setNotice(id === 'sensory' ? '已补写一处感官细节，可继续删改。' : '已补写一段景物，注意不要压过人物。');
  };

  return (
    <div className="animate-fade-up">
      <PageHead
        eyebrow="Stage 04 · Write"
        title="让讲述者，重新开口。"
        description="执笔人只做两件事：把口述里的事实写清楚，把没说完的话补完整。每一章都可以重写、编辑、核对，直到语气像本人。"
        actions={
          <>
            <ActionButton onClick={() => setEditing((value) => !value)}>
              {editing ? <Eye className="size-3.5" /> : <PencilLine className="size-3.5" />}
              {editing ? '阅读视图' : '手动编辑'}
            </ActionButton>
            <ActionButton variant="primary" onClick={() => navigate('/publish')}>
              去出版工坊 <ArrowRight className="size-3.5" />
            </ActionButton>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[218px_minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <Panel eyebrow="Chapters" title="书稿目录" bodyClassName="p-2">
            <div className="space-y-1">
              {project.chapters.map((item) => {
                const active = item.id === chapter.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveId(item.id);
                      setEditing(false);
                      setNotice('');
                    }}
                    className={cn(
                      'w-full border px-3 py-2.5 text-left transition-colors',
                      active ? 'border-seal/30 bg-[#fbf4e7]' : 'border-transparent hover:bg-[#f7f0e1]',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-[#b9a98d]">CH {String(item.index).padStart(2, '0')}</span>
                      <span className="flex items-center gap-1 text-[8.5px] text-muted-foreground">
                        <StatusDot tone={item.status === 'done' ? 'olive' : item.status === 'draft' ? 'gold' : 'muted'} />
                        {item.status === 'done' ? '已定稿' : item.status === 'draft' ? '草稿' : '待写'}
                      </span>
                    </div>
                    <div className="mt-1 font-serif text-[12.5px] font-medium">{item.title}</div>
                    <div className="mt-1 flex items-center justify-between text-[9px] text-muted-foreground">
                      <span>{item.period}</span>
                      <span>{item.body.replace(/\s/g, '').length} 字</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Panel>

          <div className="border border-border/80 bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="label text-[8px] text-muted-foreground">全书进度</span>
              <span className="font-mono text-[11px] text-ink">{totalWords.toLocaleString()} 字</span>
            </div>
            <Bar value={Math.round((totalWords / 6000) * 100)} className="mt-2" />
            <div className="mt-2 text-[9.5px] text-muted-foreground">目标 6,000 字 · 约 24 页正文</div>
            <div className="mt-3 flex items-center gap-1.5 border-t border-dashed border-border pt-3 text-[9.5px] text-olive">
              <Target className="size-3" /> 每章 900–1,400 字，保持呼吸感
            </div>
          </div>

          <Note tone="seal">
            写作边界：不虚构未发生的事件；不替讲述者下判断；涉及他人生平的内容需取得同意。
          </Note>
        </div>

        <div className="paper-card grain overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="seal-stamp px-1.5 py-0.5 text-[8px]">第 {chapter.index} 章</span>
              <span className="font-serif text-[12px] text-muted-foreground">{chapter.period}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><FileCheck2 className="size-3" /> {chapter.status === 'done' ? '已校对' : '未校对'}</span>
              <span className="font-mono">{chapter.body.replace(/\s/g, '').length} 字</span>
            </div>
          </div>

          <article className="writing-paper min-h-[620px] px-7 py-8 sm:px-12">
            <div className="mb-6 border-b border-dashed border-border pb-4 text-center">
              <div className="label text-[8px] text-[#a2907a]">Chapter {String(chapter.index).padStart(2, '0')}</div>
              <h2 className="mt-2 font-serif text-[28px] font-bold tracking-[0.08em]">{chapter.title}</h2>
              <div className="mt-2 text-[10px] tracking-[0.24em] text-muted-foreground">{chapter.period}</div>
            </div>

            {editing ? (
              <textarea
                value={chapter.body}
                onChange={(event) => updateChapterBody(chapter.id, event.target.value)}
                className="min-h-[460px] w-full resize-none border-0 bg-transparent font-serif text-[15.5px] leading-[2.05] text-ink outline-none focus-visible:ring-0"
                placeholder="从这里开始写……"
                spellCheck={false}
              />
            ) : chapter.body ? (
              <div>
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={cn(
                      'mb-4 font-serif text-[15.5px] leading-[2.05] tracking-[0.01em] text-ink',
                      index === 0 && 'drop-cap',
                    )}
                  >
                    {paragraph}
                    {isGenerating && index === paragraphs.length - 1 && (
                      <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-blink bg-seal align-middle" />
                    )}
                  </p>
                ))}
              </div>
            ) : (
              <div className="grid min-h-[360px] place-items-center text-center">
                <div>
                  <div className="mx-auto grid size-11 place-items-center rounded-full border border-dashed border-[#c9bba1]">
                    <Feather className="size-4 text-[#a2907a]" />
                  </div>
                  <div className="mt-3 font-serif text-[15px]">这一章还没有落笔。</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">执笔人会依据第 5 章大纲与本人口述补写。</p>
                  <ActionButton variant="primary" size="sm" className="mt-4" onClick={() => generateChapter(chapter.id)}>
                    <Play className="size-3" /> 生成本章
                  </ActionButton>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-3 text-[9px] text-muted-foreground">
              <span>拾光 · 回忆录工坊</span>
              <span className="font-mono">{String(chapter.index + 12).padStart(3, '0')}</span>
            </div>
          </article>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-[#f8f2e5] px-5 py-3">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <StatusDot tone={isGenerating ? 'seal' : 'olive'} pulse={isGenerating} />
              {isGenerating ? `执笔人正在写 · ${tone.name}` : `当前风格 · ${tone.name}`}
            </div>
            <div className="flex items-center gap-2">
              <ActionButton
                size="sm"
                onClick={() => {
                  setNotice('');
                  generateChapter(chapter.id);
                }}
                loading={isGenerating}
              >
                <Wand2 className="size-3" /> {chapter.body ? '按当前风格重写' : '让执笔人写'}
              </ActionButton>
              <ActionButton
                size="sm"
                variant="primary"
                onClick={() => {
                  updateChapterBody(chapter.id, chapter.body);
                  setNotice('本章已保存，可以进入出版工坊排版。');
                }}
              >
                <CheckCircle2 className="size-3" /> 保存本章
              </ActionButton>
            </div>
          </div>
          {notice && <div className="border-t border-border/70 px-5 py-2"><Note tone="muted">{notice}</Note></div>}
        </div>

        <div className="space-y-5">
          <Panel eyebrow="Tone · 文风" title="这一章怎么说" bodyClassName="p-4">
            <div className="flex flex-wrap gap-1.5">
              {TONE_PRESETS.map((preset) => (
                <Chip key={preset.id} active={preset.id === project.tone} onClick={() => setTone(preset.id)}>
                  {preset.name}
                </Chip>
              ))}
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted-foreground">{tone.description}</p>
            <div className="mt-2 border-l border-seal/30 pl-2.5 font-serif text-[11px] leading-relaxed text-[#7f3226]">“{tone.sample}”</div>
          </Panel>

          <Panel eyebrow="Writing moves" title="给执笔人的指令" bodyClassName="p-4">
            <div className="grid grid-cols-2 gap-2">
              {TWEAKS.map((tweak) => (
                <button
                  key={tweak.id}
                  onClick={() => applyTweak(tweak.id)}
                  className="flex items-center gap-1.5 rounded-[2px] border border-border bg-card px-2.5 py-2 text-[10.5px] text-muted-foreground transition-colors hover:border-[#b9a98d] hover:text-foreground"
                >
                  <tweak.icon className="size-3" /> {tweak.label}
                </button>
              ))}
            </div>
            <Note tone="gold">这些指令只作用于当前章节，不会改动其他章的语气。</Note>
          </Panel>

          <Panel eyebrow="Fact check · 事实校对" title="与口述对齐" bodyClassName="p-4">
            <div className="space-y-2">
              {DEMO_FACTS.map((fact) => (
                <div key={fact.label} className="flex items-start justify-between gap-2 border-b border-dashed border-border/70 pb-2 last:border-0">
                  <div>
                    <div className="text-[10px] text-muted-foreground">{fact.label}</div>
                    <div className="font-mono text-[11.5px] text-ink">{fact.value}</div>
                  </div>
                  <span className={cn('mt-0.5 flex items-center gap-1 text-[8.5px]', fact.check.includes('未提及') ? 'text-gold' : 'text-olive')}>
                    {fact.check.includes('未提及') ? <CircleAlert className="size-2.5" /> : <CheckCircle2 className="size-2.5" />}
                    {fact.check}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Metric label="一致性" value="98%" hint="前后文" />
              <Metric label="待确认" value="2" hint="亲属姓名" />
            </div>
          </Panel>

          <div className="border border-border/80 bg-[#f1e9d9] p-4">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#6c5c45]">
              <Feather className="size-3.5" /> 编辑手记
            </div>
            <p className="mt-2 font-serif text-[11px] leading-[1.9] text-[#7b6a50]">
              “炉火”在全书出现四次。第一次是灶膛，第二次是高炉，第三次是退休那天的炉子，最后是孙女说的那句“你一定很暖和”。不要把这个回环写破。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
