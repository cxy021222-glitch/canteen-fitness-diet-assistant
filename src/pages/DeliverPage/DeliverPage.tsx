import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Circle,
  Download,
  FileCode2,
  FileText,
  FolderGit2,
  Github,
  Loader2,
  Printer,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { buildBundle, downloadText, pushToGitHub, type PushResult } from '@/lib/deliver';
import { createZip } from '@/lib/zip';
import { useWorkbench } from '@/lib/store';
import { LAYOUT_PRESETS, NARRATIVE_PRESETS, TONE_PRESETS } from '@/data/presets';
import { ActionButton, Divider, KeyValue, Metric, Note, PageHead, Panel, StatusDot } from '@/components/ui-kit';
import { Artwork } from '@/components/Artwork';
import { cn } from '@/lib/utils';

function formatSize(content: string) {
  const bytes = new Blob([content]).size;
  return bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
}

export default function DeliverPage() {
  const { project, cloneDemoProject } = useWorkbench();
  const bundle = useMemo(() => buildBundle(project), [project]);
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('cxy021222-glitch');
  const [repo, setRepo] = useState('memoir-atelier-output');
  const [branch, setBranch] = useState('main');
  const [pushing, setPushing] = useState(false);
  const [results, setResults] = useState<PushResult[]>([]);
  const [checks, setChecks] = useState<Record<string, boolean>>({
    audio: true,
    names: false,
    quote: true,
    privacy: false,
    authorization: false,
  });

  const readyCount = Object.values(checks).filter(Boolean).length;

  const downloadZip = () => {
    const zip = createZip(bundle.map((file) => ({ path: file.path, content: file.content })));
    const url = URL.createObjectURL(zip);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.meta.title}-入印包.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const openPrintable = () => {
    const html = bundle.find((file) => file.kind === 'html')?.content ?? '';
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const push = async () => {
    if (!token.trim() || !owner.trim() || !repo.trim()) return;
    setPushing(true);
    setResults([]);
    const output = await pushToGitHub({
      owner: owner.trim(),
      repo: repo.trim(),
      token: token.trim(),
      branch: branch.trim() || 'main',
      files: bundle,
      message: `memoir: ${project.meta.title} 自动归档`,
    });
    setResults(output);
    setPushing(false);
  };

  const narrative = NARRATIVE_PRESETS.find((item) => item.id === project.narrative);
  const tone = TONE_PRESETS.find((item) => item.id === project.tone);
  const layout = LAYOUT_PRESETS.find((item) => item.id === project.layout);

  return (
    <div className="animate-fade-up">
      <PageHead
        eyebrow="Deliver · 交付与归档"
        title="把书交出去，也把过程留下来。"
        description="手稿、书稿、工程文件与智能体运行记录一并归档。可下载入印包，也可直接推送到你的 GitHub 仓库留档。"
        actions={
          <>
            <ActionButton onClick={() => downloadText(`${project.meta.title}-手稿.md`, bundle[0].content, 'text/markdown;charset=utf-8')}>
              <Download className="size-3.5" /> 下载手稿
            </ActionButton>
            <ActionButton variant="primary" onClick={downloadZip}>
              <Download className="size-3.5" /> 打包下载入印包
            </ActionButton>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-5">
          <Panel
            eyebrow="Bundle · 交付包"
            title="四份文件，一条可追溯的链路"
            action={<span className="text-[10px] text-muted-foreground">{bundle.length} 个文件 · ZIP 无压缩</span>}
            bodyClassName="p-0"
          >
            <div className="divide-y divide-border/70">
              {bundle.map((file) => {
                const Icon = file.kind === 'json' ? FileCode2 : file.kind === 'html' ? FileText : FileText;
                return (
                  <div key={file.path} className="flex items-center gap-3 px-4 py-3.5">
                    <div className="grid size-9 shrink-0 place-items-center rounded-[2px] border border-border bg-[#f7f0e1]">
                      <Icon className="size-4 text-[#8c7a5d]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-medium">{file.label}</div>
                      <div className="mt-0.5 font-mono text-[9.5px] text-muted-foreground">{file.path} · {formatSize(file.content)}</div>
                    </div>
                    <span className="hidden items-center gap-1 text-[9px] text-olive sm:flex"><Check className="size-3" /> 已生成</span>
                    <button
                      onClick={() => downloadText(file.path.split('/').pop() ?? 'file.txt', file.content, file.kind === 'json' ? 'application/json' : file.kind === 'html' ? 'text/html;charset=utf-8' : 'text/markdown;charset=utf-8')}
                      className="inline-flex items-center gap-1 rounded-[2px] border border-border px-2 py-1 text-[10px] text-muted-foreground hover:border-[#b9a98d] hover:text-foreground"
                    >
                      <Download className="size-3" /> 下载
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-[#f8f2e5] px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <ShieldCheck className="size-3.5 text-olive" />
                包含封面、5 章正文、插图 Prompt 与运行时元数据
              </div>
              <div className="flex gap-2">
                <ActionButton size="sm" onClick={openPrintable}>
                  <Printer className="size-3" /> 可打印书稿
                </ActionButton>
                <ActionButton size="sm" variant="dark" onClick={downloadZip}>
                  <Download className="size-3" /> 下载 ZIP
                </ActionButton>
              </div>
            </div>
          </Panel>

          <Panel
            eyebrow="GitHub · 归档"
            title="推送到你的仓库"
            action={
              <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                <FolderGit2 className="size-3" /> 使用 Contents API
              </span>
            }
            bodyClassName="p-4"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block">
                <span className="label text-[8px] text-muted-foreground">Owner</span>
                <input
                  value={owner}
                  onChange={(event) => setOwner(event.target.value)}
                  className="mt-1 h-8 w-full rounded-[2px] border border-border bg-[#faf6ec] px-2.5 font-mono text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>
              <label className="block">
                <span className="label text-[8px] text-muted-foreground">Repository</span>
                <input
                  value={repo}
                  onChange={(event) => setRepo(event.target.value)}
                  className="mt-1 h-8 w-full rounded-[2px] border border-border bg-[#faf6ec] px-2.5 font-mono text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="label text-[8px] text-muted-foreground">Personal Access Token（仅本次使用，不落盘）</span>
                <input
                  type="password"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="ghp_… 或 github_pat_…"
                  className="mt-1 h-8 w-full rounded-[2px] border border-border bg-[#faf6ec] px-2.5 font-mono text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>
              <label className="block">
                <span className="label text-[8px] text-muted-foreground">Branch</span>
                <input
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                  className="mt-1 h-8 w-full rounded-[2px] border border-border bg-[#faf6ec] px-2.5 font-mono text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>
              <div className="flex items-end">
                <ActionButton variant="primary" className="w-full" onClick={push} loading={pushing} disabled={!token.trim()}>
                  <Github className="size-3.5" /> 推送 {bundle.length} 个文件
                </ActionButton>
              </div>
            </div>
            <Note tone="gold">
              仓库需提前创建，Token 需要 <span className="font-mono">contents:write</span> 权限。文件会写入 <span className="font-mono">deliverables/</span>，同名文件将创建新提交。
            </Note>
            {results.length > 0 && (
              <div className="mt-3 space-y-1.5 border border-border/80 bg-[#faf6ec] p-3">
                {results.map((result) => (
                  <div key={result.path} className="flex items-center justify-between gap-2 text-[10px]">
                    <span className="flex items-center gap-1.5 font-mono text-muted-foreground">
                      {result.ok ? <CheckCircle2 className="size-3 text-olive" /> : <Circle className="size-3 text-seal" />}
                      {result.path}
                    </span>
                    {result.commitUrl ? (
                      <a href={result.commitUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-seal hover:underline">
                        查看提交 <ArrowUpRight className="size-2.5" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">{result.message}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel eyebrow="Human review" title="交付前，人要看一遍" bodyClassName="p-4">
            <div className="space-y-2">
              {[
                ['audio', '讲述者已通读全文并确认事实'],
                ['names', '亲属姓名与称谓已逐一核对'],
                ['quote', '所有引语均来自原始录音，无虚构补写'],
                ['privacy', '第三方隐私内容已化名或删除'],
                ['authorization', '口述授权书与出版范围已签署'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setChecks((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className={cn(
                    'flex w-full items-center gap-2.5 border px-3 py-2.5 text-left text-[11px] transition-colors',
                    checks[key] ? 'border-olive/30 bg-olive/[0.05] text-ink' : 'border-border/80 bg-card text-muted-foreground hover:border-[#b9a98d]',
                  )}
                >
                  {checks[key] ? <CheckCircle2 className="size-4 text-olive" /> : <Circle className="size-4 text-[#c0b39c]" />}
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>人工确认 {readyCount} / 5</span>
              <span className={readyCount === 5 ? 'text-olive' : 'text-gold'}>{readyCount === 5 ? '可进入印刷' : '未完成，可先内部归档'}</span>
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel eyebrow="Colophon" title="项目档案" bodyClassName="p-4">
            <div className="mb-3 aspect-[3/2] overflow-hidden">
              <Artwork variant="cover" styleId={project.cover.style} seed={project.cover.seed} />
            </div>
            <div className="space-y-1">
              <KeyValue k="书名" v={project.meta.title} />
              <KeyValue k="口述" v={`${project.meta.subject}（${project.meta.subjectAge} 岁）`} />
              <KeyValue k="整理" v={project.meta.host} />
              <KeyValue k="地点" v={project.meta.place} />
              <KeyValue k="结构" v={narrative?.name} />
              <KeyValue k="文风" v={tone?.name} />
              <KeyValue k="开本" v={`${layout?.name} · ${layout?.size}`} />
            </div>
            <Divider label="SCALE" />
            <div className="grid grid-cols-3 gap-2">
              <Metric label="章节" value={project.chapters.length} hint="5 章" />
              <Metric label="字数" value={project.wordCount.toLocaleString()} hint="正文" />
              <Metric label="插图" value={project.illustrations.length + 1} hint="含封面" />
            </div>
          </Panel>

          <Panel eyebrow="Records" title="归档记录" bodyClassName="p-4">
            <div className="space-y-3 border-l border-[#d4c6ac] pl-3 text-[10px] text-muted-foreground">
              {[
                ['11-16', '采集第一次访谈 · 42 分钟'],
                ['11-17', '完成三次访谈与方言标注'],
                ['11-18', '气口清理与故事主干抽取'],
                ['今天', `生成《${project.meta.title}》入印包`],
              ].map(([date, text]) => (
                <div key={date} className="relative">
                  <span className="absolute -left-[17px] top-1.5 size-1.5 rounded-full bg-[#b09a76]" />
                  <span className="font-mono text-[9px] text-[#a08f74]">{date}</span>
                  <div className="mt-0.5">{text}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Note tone="muted">
            <span className="flex items-center gap-1.5 font-medium"><ShieldCheck className="size-3" /> 归档说明</span>
            本交付物由 AI 辅助整理，所有事实、称谓与引语需经讲述者及家属确认后方可印刷或公开传播。
          </Note>

          <div className="flex items-center justify-between border border-border/80 bg-card px-3 py-2">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <StatusDot tone="olive" /> 项目已自动保存
            </span>
            <button onClick={cloneDemoProject} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-seal">
              <RotateCcw className="size-3" /> 克隆演示项目
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
