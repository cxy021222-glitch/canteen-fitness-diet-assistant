import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Layers,
  Loader2,
  PackageCheck,
  Printer,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { IMAGE_STYLES } from '@/data/presets';
import { LAYOUT_PRESETS } from '@/data/presets';
import { useWorkbench } from '@/lib/store';
import { ActionButton, Chip, KeyValue, Metric, Note, PageHead, Panel, StatusDot } from '@/components/ui-kit';
import { Artwork } from '@/components/Artwork';
import { cn } from '@/lib/utils';

export default function PublishPage() {
  const {
    project,
    setLayout,
    setCoverField,
    generateCover,
    generatingCover,
    setIllustrationStyle,
    generateIllustration,
    generatingIllustration,
  } = useWorkbench();
  const navigate = useNavigate();
  const [previewIndex, setPreviewIndex] = useState(2);
  const layout = LAYOUT_PRESETS.find((item) => item.id === project.layout) ?? LAYOUT_PRESETS[0];
  const activeStyle = IMAGE_STYLES.find((item) => item.id === project.cover.style) ?? IMAGE_STYLES[0];
  const previewChapter = project.chapters[previewIndex];
  const previewIllustration = project.illustrations.find((item) => item.chapterId === previewChapter?.id);
  const readyImages = project.illustrations.filter((item) => item.status === 'ready').length;

  return (
    <div className="animate-fade-up">
      <PageHead
        eyebrow="Stage 05 · Publish"
        title="让它像一本书，而不像一份文件。"
        description="选开本、定封面、生成章节插图。版式与图像共享同一套风格变量，改一处，整本书一起变。"
        actions={
          <>
            <ActionButton onClick={() => generateCover()}>
              <RefreshCw className="size-3.5" /> 重生成封面
            </ActionButton>
            <ActionButton variant="primary" onClick={() => navigate('/deliver')}>
              导出入印包 <ArrowRight className="size-3.5" />
            </ActionButton>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Panel eyebrow="Cover studio" title="封面设计" bodyClassName="p-4">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#2b241b]">
              <Artwork
                variant="cover"
                styleId={project.cover.style}
                seed={project.cover.seed}
                className={cn('transition-opacity duration-500', generatingCover && 'opacity-40 blur-[1px]')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17130e]/92 via-transparent to-[#17130e]/20" />
              {generatingCover && (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[10px] text-[#f6efe2] backdrop-blur">
                    <Loader2 className="size-3 animate-spin" /> 画师正在留白……
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 top-5 px-5 text-center">
                <div className="mx-auto h-px w-8 bg-[#e6d8bd]/60" />
                <div className="label mt-2 text-[7px] text-[#d8c7a9]">口述回忆录</div>
              </div>
              <div className="absolute inset-x-0 bottom-0 px-5 pb-6 text-[#f8f2e6]">
                <h2 className="font-serif text-[30px] font-bold leading-tight tracking-[0.12em]">{project.cover.title}</h2>
                <p className="mt-2 text-[10.5px] leading-relaxed text-[#e0d2b8]">{project.cover.subtitle}</p>
                <div className="mt-5 flex items-end justify-between">
                  <div className="text-[9px] tracking-[0.18em] text-[#b7a88d]">{project.cover.author}</div>
                  <div className="seal-stamp px-1.5 py-0.5 text-[8px]">拾光</div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metric label="开本" value={layout.name.split(' ')[0]} hint={layout.size} />
              <Metric label="风格" value={activeStyle.name} hint={activeStyle.en} />
              <Metric label="安全区" value="通过" hint="上 1/3 留白" />
            </div>

            <div className="mt-4 space-y-2">
              <label className="block">
                <span className="label text-[8px] text-muted-foreground">书名</span>
                <input
                  value={project.cover.title}
                  onChange={(event) => setCoverField('title', event.target.value)}
                  className="mt-1 h-8 w-full rounded-[2px] border border-border bg-[#faf6ec] px-2.5 font-serif text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>
              <label className="block">
                <span className="label text-[8px] text-muted-foreground">副标题</span>
                <input
                  value={project.cover.subtitle}
                  onChange={(event) => setCoverField('subtitle', event.target.value)}
                  className="mt-1 h-8 w-full rounded-[2px] border border-border bg-[#faf6ec] px-2.5 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>
            </div>

            <div className="mt-3">
              <div className="label mb-2 text-[8px] text-muted-foreground">封面画风</div>
              <div className="grid grid-cols-3 gap-1.5">
                {IMAGE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setCoverField('style', style.id)}
                    className={cn(
                      'border px-1.5 py-1.5 text-left transition-colors',
                      project.cover.style === style.id ? 'border-seal/40 bg-[#fbf4e7]' : 'border-border/80 bg-card hover:border-[#b9a98d]',
                    )}
                  >
                    <div className="flex gap-0.5">
                      {style.palette.map((color) => (
                        <span key={color} className="size-2 rounded-full" style={{ background: color }} />
                      ))}
                    </div>
                    <div className="mt-1 text-[9.5px]">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <ActionButton
              variant="primary"
              className="mt-3 w-full"
              loading={generatingCover}
              onClick={() => generateCover(project.cover.style)}
            >
              <Sparkles className="size-3.5" /> 按「{activeStyle.name}」重新生成
            </ActionButton>
            <div className="mt-2 text-[9px] leading-relaxed text-muted-foreground">
              Prompt 已内置“上方留白”约束，书名与作者信息由版式层叠加，不依赖模型生成文字。
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel
            eyebrow="Layout · 开本与版式"
            title="选择一种拿在手里的重量"
            action={<span className="text-[10px] text-muted-foreground">{layout.features.join(' · ')}</span>}
            bodyClassName="p-4"
          >
            <div className="grid gap-2 sm:grid-cols-3">
              {LAYOUT_PRESETS.map((preset) => {
                const active = preset.id === project.layout;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setLayout(preset.id)}
                    className={cn(
                      'border p-3 text-left transition-all',
                      active ? 'border-seal/40 bg-[#fbf4e7]' : 'border-border/80 bg-card hover:border-[#b9a98d]',
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-serif text-[14px] font-medium">{preset.name}</div>
                        <div className="mt-0.5 font-mono text-[9px] text-muted-foreground">{preset.size}</div>
                      </div>
                      {active ? (
                        <span className="grid size-4 place-items-center rounded-full bg-seal text-white"><Check className="size-2.5" /></span>
                      ) : (
                        <span className="size-4 rounded-full border border-border" />
                      )}
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{preset.description}</p>
                    <div className="mt-2 grid grid-cols-3 gap-1 border-t border-dashed border-border/80 pt-2 text-[8.5px] text-muted-foreground">
                      <span>正文 {preset.bodySize}</span>
                      <span>行距 {preset.leading}</span>
                      <span>{preset.pages} 页</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[2px] bg-[#2a241c] px-4 py-5 sm:px-8 sm:py-7">
              <div className="mb-3 flex items-center justify-between text-[9px] text-[#a89a82]">
                <span className="label">Spread preview · 对开预览</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewIndex((index) => (index - 1 + project.chapters.length) % project.chapters.length)}
                    className="rounded-full border border-white/15 p-1 text-[#c7b99f] hover:bg-white/10"
                  >
                    <ChevronLeft className="size-3" />
                  </button>
                  <span className="font-mono">{String(previewIndex + 1).padStart(2, '0')} / 05</span>
                  <button
                    onClick={() => setPreviewIndex((index) => (index + 1) % project.chapters.length)}
                    className="rounded-full border border-white/15 p-1 text-[#c7b99f] hover:bg-white/10"
                  >
                    <ChevronRight className="size-3" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-[1px] shadow-[0_18px_50px_-20px_rgba(0,0,0,.7)]">
                <div className="relative aspect-[148/210] overflow-hidden bg-[#e8dfcd]">
                  <Artwork
                    variant="scene"
                    styleId={previewIllustration?.style ?? project.cover.style}
                    index={previewChapter?.index ?? 1}
                    seed={previewIllustration?.seed ?? project.cover.seed}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-3 pt-8 text-[8px] text-[#f4ecdc]">
                    插图 · {previewChapter?.title} · {IMAGE_STYLES.find((s) => s.id === (previewIllustration?.style ?? 'watercolor'))?.name}
                  </div>
                  <div className="absolute bottom-1.5 left-3 text-[7px] text-white/70">014</div>
                </div>
                <div className="relative aspect-[148/210] overflow-hidden bg-[#fbf7ee] px-5 py-5 sm:px-7">
                  <div className="text-center">
                    <div className="label text-[6px] text-[#a2907a]">第 {previewChapter?.index} 章</div>
                    <div className="mt-1 font-serif text-[15px] font-bold tracking-[0.08em]">{previewChapter?.title}</div>
                    <div className="mt-0.5 text-[6.5px] tracking-[0.2em] text-[#9b8b73]">{previewChapter?.period}</div>
                  </div>
                  <p className="mt-4 font-serif text-[7.5px] leading-[2.1] text-[#3a332a]">
                    {previewChapter?.body.slice(0, 150) || '这一章还没有落笔，执笔人正在根据口述补写。'}
                    <span className="text-seal"> …</span>
                  </p>
                  <div className="absolute bottom-2 right-3 text-[7px] text-[#9b8b73]">015</div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="开本尺寸" value={layout.size} hint="成品" />
              <Metric label="正文" value={layout.bodySize} hint={`行距 ${layout.leading}`} />
              <Metric label="预估页数" value={layout.pages} hint="含扉页/版权页" />
              <Metric label="图片" value={`${readyImages + 1} / 6`} hint="插图 + 封面" />
            </div>
          </Panel>

          <Panel
            eyebrow="Illustration studio"
            title="章节插图"
            action={
              <div className="flex flex-wrap gap-1">
                {IMAGE_STYLES.slice(0, 4).map((style) => (
                  <Chip key={style.id} active={project.illustrationStyle === style.id} onClick={() => setIllustrationStyle(style.id)}>
                    {style.name}
                  </Chip>
                ))}
              </div>
            }
            bodyClassName="p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {project.chapters.map((chapter) => {
                const illustration = project.illustrations.find((item) => item.chapterId === chapter.id);
                const loading = generatingIllustration === chapter.id || illustration?.status === 'loading';
                const style = IMAGE_STYLES.find((item) => item.id === (illustration?.style ?? project.illustrationStyle));
                return (
                  <div key={chapter.id} className="group overflow-hidden border border-border/80 bg-card">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e0ce]">
                      {illustration ? (
                        <Artwork
                          variant="scene"
                          styleId={illustration.style}
                          index={chapter.index}
                          seed={illustration.seed}
                          className={cn('transition-all duration-500', loading && 'scale-105 opacity-40 blur-sm')}
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-[10px] text-[#a08f74]">
                          <div className="text-center">
                            <ImageIcon className="mx-auto mb-1 size-5 opacity-50" />
                            尚未配图
                          </div>
                        </div>
                      )}
                      {loading && (
                        <div className="absolute inset-0 grid place-items-center">
                          <div className="flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[9px] text-white backdrop-blur">
                            <Loader2 className="size-2.5 animate-spin" /> 绘制中
                          </div>
                        </div>
                      )}
                      <div className="absolute left-2 top-2 rounded-[2px] bg-black/45 px-1.5 py-0.5 text-[8px] text-white backdrop-blur">
                        CH {String(chapter.index).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="truncate font-serif text-[11.5px]">{chapter.title}</span>
                        <span className="label text-[7px] text-muted-foreground">{style?.name}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[8.5px] text-muted-foreground">
                          {loading ? '正在统一人物与画风' : illustration ? '4:3 · 300 dpi' : '从本章抽取场景'}
                        </span>
                        <button
                          onClick={() => generateIllustration(chapter.id, project.illustrationStyle)}
                          className="inline-flex items-center gap-1 text-[9px] text-seal hover:underline"
                        >
                          {illustration ? '重画' : '生成'} <ChevronRight className="size-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="border border-dashed border-border bg-[#f8f2e5] p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#6c5c45]">
                  <Layers className="size-3" /> 统一性检查
                </div>
                <div className="mt-2 space-y-1">
                  <KeyValue k="画风" v={IMAGE_STYLES.find((s) => s.id === project.illustrationStyle)?.name} />
                  <KeyValue k="人物卡" v="陈守义 / 母亲 / 周文娟" />
                  <KeyValue k="统一 LoRA" v="sanxian-1970-v2" />
                </div>
                <Note tone="muted">同一人物在不同章节由外貌卡约束，避免“换脸”。</Note>
              </div>
            </div>
          </Panel>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_300px]">
            <Panel eyebrow="Print estimate" title="印制预估" bodyClassName="p-4">
              <div className="space-y-1">
                <KeyValue k="内文纸" v="80g 米黄双胶纸" />
                <KeyValue k="封面" v="精装 · 布面裱纸 · 烫哑金" />
                <KeyValue k="装订" v="锁线胶装" />
                <KeyValue k="印量" v="50 册（家族赠阅）" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Metric label="单册成本" value="¥38" hint="含印刷装订" />
                <Metric label="总预估" value="¥1,900" hint="50 册" />
                <Metric label="交期" value="7 天" hint="数码印刷" />
              </div>
            </Panel>

            <div className="flex flex-col justify-between border border-border/80 bg-[#1d1812] p-4 text-[#efe6d5]">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-[#d8c7a9]">
                  <Printer className="size-3.5" /> 付印前检查
                </div>
                <p className="mt-2 font-serif text-[13px] leading-relaxed">“一本回忆录的完成，不是文件导出成功，而是讲述者点头说：这就是我。”</p>
              </div>
              <div className="mt-4 space-y-1.5 text-[10px] text-[#b7a88d]">
                <div className="flex items-center gap-1.5"><StatusDot tone="olive" /> 封面安全区通过</div>
                <div className="flex items-center gap-1.5"><StatusDot tone="gold" /> 2 处事实待家属确认</div>
                <div className="flex items-center gap-1.5"><StatusDot tone="seal" /> 第 5 章仍为草稿</div>
              </div>
              <ActionButton variant="outline" className="mt-4 bg-transparent text-[#efe6d5]" onClick={() => navigate('/deliver')}>
                <PackageCheck className="size-3.5" /> 进入交付
              </ActionButton>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[9px] text-muted-foreground">
            <BookOpen className="size-3" /> 当前版式：{layout.name} · {layout.size} · 正文 {layout.bodySize}
          </div>
        </div>
      </div>
    </div>
  );
}
