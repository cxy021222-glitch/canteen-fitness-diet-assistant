import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, GitBranch, Search, Star, Terminal, Wrench } from 'lucide-react';
import { SKILL_CATEGORIES, SKILL_REPOS } from '@/data/skills';
import { ActionButton, Chip, Note, PageHead, Panel } from '@/components/ui-kit';
import { cn } from '@/lib/utils';

function formatStars(stars: number) {
  return stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : String(stars);
}

export default function SkillsPage() {
  const [category, setCategory] = useState<(typeof SKILL_CATEGORIES)[number]>('全部');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return SKILL_REPOS.filter((repo) => {
      const matchesCategory = category === '全部' || repo.category === category;
      const matchesKeyword = !keyword || `${repo.repo} ${repo.name} ${repo.description}`.toLowerCase().includes(keyword);
      return matchesCategory && matchesKeyword;
    });
  }, [category, query]);

  const totalStars = SKILL_REPOS.reduce((sum, repo) => sum + repo.stars, 0);
  const connected = SKILL_REPOS.filter((repo) => repo.note.startsWith('已接入')).length;

  return (
    <div className="animate-fade-up">
      <PageHead
        eyebrow="System · Skill Registry"
        title="从 GitHub 收来的 16 件工具。"
        description="每个 Skill 都对应一个明确工位。检索时间 2026-11-20，星数为检索时快照；选型优先看任务匹配度，而不是星数。"
        actions={
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <GitBranch className="size-3.5" />
            {SKILL_REPOS.length} 个仓库 · ★ {formatStars(totalStars)} 总计
          </div>
        }
      />

      <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel eyebrow="Stack · 最小接入栈" title="四行命令，跑通本地链路" bodyClassName="p-4">
          <div className="overflow-x-auto rounded-[2px] bg-[#1d1812] px-4 py-3 font-mono text-[10.5px] leading-[2] text-[#d9cbb1]">
            <div><span className="text-[#7f8f6a]">$</span> pip install -U funasr modelscope faster-whisper</div>
            <div><span className="text-[#7f8f6a]">$</span> pip install -U pyannote.audio weasyprint pypandoc</div>
            <div><span className="text-[#7f8f6a]">$</span> brew install typst pandoc &nbsp;<span className="text-[#8f8574]"># 或 cargo install typst-cli</span></div>
            <div><span className="text-[#7f8f6a]">$</span> npx pagedjs-cli manuscript.html -o proof.pdf</div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="border border-border/70 bg-[#faf6ec] px-2.5 py-2">
              <div className="label text-[7px] text-muted-foreground">已接入</div>
              <div className="mt-0.5 font-mono text-[15px] text-ink">{connected}</div>
            </div>
            <div className="border border-border/70 bg-[#faf6ec] px-2.5 py-2">
              <div className="label text-[7px] text-muted-foreground">可接入</div>
              <div className="mt-0.5 font-mono text-[15px] text-ink">{SKILL_REPOS.length - connected}</div>
            </div>
            <div className="border border-border/70 bg-[#faf6ec] px-2.5 py-2">
              <div className="label text-[7px] text-muted-foreground">类目</div>
              <div className="mt-0.5 font-mono text-[15px] text-ink">{SKILL_CATEGORIES.length - 1}</div>
            </div>
          </div>
          <Note tone="gold">接入前核对 License：GPL 系（如 Pandoc）用于内部工具无碍，若对外分发需评估合规。</Note>
        </Panel>

        <div className="border border-border/80 bg-[#1d1812] p-5 text-[#efe6d5]">
          <div className="label text-[8px] text-[#a08f74]">Selection principle</div>
          <div className="mt-2 font-serif text-[18px] leading-snug">能本地跑的，不上云；能规则做的，不用模型。</div>
          <p className="mt-3 text-[10.5px] leading-relaxed text-[#b7a88d]">
            方言识别是例外：开源覆盖不足时，明确路由到云端方言引擎，并在界面标注“云端增强”，让成本与隐私可预期。
          </p>
          <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-[9px] text-[#8f8574]">
            <Wrench className="size-3" /> 星数截至 2026-11-20
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-3 border border-border/80 bg-card px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-[2px] border border-border bg-[#faf6ec] px-2.5 py-1.5">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索仓库、能力或场景，例如：方言 / 排版 / Whisper"
            className="w-full bg-transparent text-[11px] outline-none placeholder:text-[#a99c87]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SKILL_CATEGORIES.map((item) => (
            <Chip key={item} active={category === item} onClick={() => setCategory(item)}>{item}</Chip>
          ))}
        </div>
        <span className="shrink-0 text-[10px] text-muted-foreground">{filtered.length} 个结果</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((repo) => (
          <article key={repo.id} className="paper-card grain flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-[2px] border border-border bg-[#f7f0e1]">
                  <Terminal className="size-3.5 text-[#8c7a5d]" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-mono text-[11.5px] font-medium">{repo.repo}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[9px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Star className="size-2.5 text-gold" /> {formatStars(repo.stars)}</span>
                    <span>{repo.language}</span>
                    <span className="text-border">/</span>
                    <span>{repo.license}</span>
                  </div>
                </div>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-[2px] px-1.5 py-0.5 text-[8.5px]',
                  repo.category === '语音'
                    ? 'bg-[#29434e]/[0.07] text-[#29434e]'
                    : repo.category === '图像'
                      ? 'bg-seal/[0.07] text-seal'
                      : repo.category === '排版'
                        ? 'bg-gold/[0.1] text-[#7a5a2c]'
                        : 'bg-olive/[0.08] text-olive',
                )}
              >
                {repo.category}
              </span>
            </div>

            <p className="mt-3 flex-1 text-[10.5px] leading-relaxed text-muted-foreground">{repo.description}</p>

            <div className="mt-3 flex flex-wrap gap-1">
              {repo.usedBy.map((user) => (
                <span key={user} className="rounded-full border border-border bg-[#faf6ec] px-1.5 py-0.5 text-[8.5px] text-[#6c5c45]">
                  {user}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-dashed border-border pt-2.5">
              <span className={cn('flex items-center gap-1 text-[9px]', repo.note.startsWith('已接入') ? 'text-olive' : 'text-gold')}>
                {repo.note.startsWith('已接入') ? <Check className="size-3" /> : <ArrowUpRight className="size-3" />}
                {repo.note.replace('已接入：', '').replace('可接入：', '')}
              </span>
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[9px] text-seal hover:underline"
              >
                仓库 <ArrowUpRight className="size-2.5" />
              </a>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="border border-dashed border-border bg-card py-14 text-center">
          <div className="font-serif text-[14px]">没有匹配的 Skill</div>
          <p className="mt-1 text-[10.5px] text-muted-foreground">换个关键词，或查看全部分类。</p>
          <ActionButton size="sm" className="mt-3" onClick={() => { setQuery(''); setCategory('全部'); }}>
            清除筛选
          </ActionButton>
        </div>
      )}

      <div className="mt-6">
        <Note tone="muted">
          <span className="font-medium">关于 Skill 的边界：</span>
          这些仓库提供的是能力底座，不是可直接出版的成品。真正决定回忆录质量的，仍然是访谈素材的密度、人工校对与讲述者本人的确认。
        </Note>
      </div>
    </div>
  );
}
