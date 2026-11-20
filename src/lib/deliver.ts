import type { Project } from '@/data/types';
import { LAYOUT_PRESETS, NARRATIVE_PRESETS, TONE_PRESETS } from '@/data/presets';
import { artworkSvg } from '@/components/Artwork';

export interface BundleFile {
  path: string;
  content: string;
  kind: 'markdown' | 'html' | 'json';
  label: string;
}

export function buildMarkdown(project: Project) {
  const { meta, chapters, story } = project;
  const lines: string[] = [
    `# ${meta.title}`,
    '',
    `> ${meta.subtitle}`,
    '',
    `**口述**：${meta.subject}\u3000**整理**：${meta.host}\u3000**地点**：${meta.place}`,
    '',
    '---',
    '',
  ];
  if (story) {
    lines.push('## 内容提要', '', story.logline, '', '---', '');
  }
  chapters.forEach((chapter) => {
    lines.push(`## 第${chapter.index}章\u3000${chapter.title}`, '', `*${chapter.period}*`, '', chapter.body || '（待撰写）', '', '---', '');
  });
  lines.push(
    '',
    '## 版权与说明',
    '',
    '本书依据口述访谈整理，人物与事件均经讲述者确认。营养、医疗等专业内容不在本书范围内。',
    '',
    `整理时间：${meta.createdAt}`,
    '',
  );
  return lines.join('\n');
}

export function buildBookHtml(project: Project) {
  const { meta, chapters, cover } = project;
  const chapterHtml = chapters
    .map((chapter) => {
      const illustration = project.illustrations.find((item) => item.chapterId === chapter.id);
      const figure = illustration
        ? `<figure class="figure">${artworkSvg('scene', illustration.style, chapter.index, illustration.seed)}</figure>`
        : '';
      return `
      <section class="chapter">
        <div class="chapter-no">第 ${chapter.index} 章</div>
        <h2>${chapter.title}</h2>
        <div class="period">${chapter.period}</div>
        ${figure}
        ${chapter.body
          ? chapter.body
              .split(/\n\n+/)
              .map((paragraph, index) => `<p class="${index === 0 ? 'first' : ''}">${paragraph}</p>`)
              .join('')
          : '<p class="empty">（本章待撰写）</p>'}
      </section>`;
    })
    .join('');
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${meta.title} · ${meta.subtitle}</title>
<style>
  :root { --paper:#f6f0e4; --ink:#1b1712; --seal:#a6392b; --muted:#7a7166; --line:#d8cdb9; }
  * { box-sizing:border-box; }
  body { margin:0; background:#e9e1d2; color:var(--ink); font-family:"Noto Serif SC","Songti SC",serif; }
  .book { max-width:720px; margin:0 auto; background:var(--paper); padding:0 0 80px; box-shadow:0 30px 80px rgba(0,0,0,.16); }
  .cover { position:relative; aspect-ratio:3/4; overflow:hidden; background:#2b241b; }
  .cover svg { position:absolute; inset:0; width:100%; height:100%; display:block; }
  .cover .veil { position:absolute; inset:0; background:linear-gradient(180deg,rgba(27,23,18,.12),rgba(27,23,18,.62)); }
  .cover .text { position:absolute; left:44px; right:44px; bottom:52px; color:#f8f2e6; }
  .cover h1 { font-size:52px; letter-spacing:.12em; margin:0 0 12px; font-weight:900; }
  .cover .sub { font-size:16px; opacity:.9; letter-spacing:.08em; }
  .cover .author { margin-top:26px; font-size:13px; letter-spacing:.18em; opacity:.8; }
  .toc { padding:56px 56px 24px; border-bottom:1px solid var(--line); }
  .toc h3 { font-size:13px; letter-spacing:.32em; color:var(--muted); font-weight:500; }
  .toc li { list-style:none; display:flex; justify-content:space-between; padding:9px 0; border-bottom:1px dotted var(--line); font-size:15px; }
  .chapter { padding:56px; border-bottom:1px solid var(--line); }
  .chapter-no { font-size:11px; letter-spacing:.3em; color:var(--seal); }
  .chapter h2 { font-size:30px; margin:10px 0 6px; letter-spacing:.06em; }
  .period { font-size:12px; color:var(--muted); letter-spacing:.16em; margin-bottom:26px; }
  .chapter p { font-size:16.5px; line-height:2; text-indent:2em; margin:0 0 16px; }
  .chapter p.first::first-letter { float:left; font-size:54px; line-height:.86; padding:6px 10px 0 0; color:var(--seal); font-weight:700; }
  .figure { position:relative; margin:0 0 30px; aspect-ratio:4/3; overflow:hidden; border:1px solid var(--line); }
  .figure svg { position:absolute; inset:0; width:100%; height:100%; display:block; }
  .empty { color:var(--muted); }
  .colophon { padding:40px 56px; font-size:12px; color:var(--muted); line-height:1.9; }
  @media print { body { background:#fff } .book { box-shadow:none; max-width:none } .chapter { page-break-after:always; } }
</style>
</head>
<body>
<div class="book">
  <div class="cover">
    ${artworkSvg('cover', cover.style, 1, cover.seed)}
    <div class="veil"></div>
    <div class="text">
      <h1>${cover.title}</h1>
      <div class="sub">${cover.subtitle}</div>
      <div class="author">${cover.author}</div>
    </div>
  </div>
  <div class="toc">
    <h3>目\u3000录</h3>
    <ul>
      ${chapters.map((chapter) => `<li><span>第${chapter.index}章\u3000${chapter.title}</span><span>${chapter.period}</span></li>`).join('')}
    </ul>
  </div>
  ${chapterHtml}
  <div class="colophon">
    ${meta.title} · ${meta.subtitle}<br/>
    ${meta.subject} 口述，${meta.host} 整理<br/>
    由「拾光 · 回忆录工坊」智能体矩阵辅助整理 · ${new Date().toLocaleDateString('zh-CN')}
  </div>
</div>
</body>
</html>`;
}

export function buildBundle(project: Project): BundleFile[] {
  const narrative = NARRATIVE_PRESETS.find((item) => item.id === project.narrative);
  const tone = TONE_PRESETS.find((item) => item.id === project.tone);
  const layout = LAYOUT_PRESETS.find((item) => item.id === project.layout);
  const agentRun = {
    project: project.meta,
    generatedAt: new Date().toISOString(),
    narrative,
    tone,
    layout,
    pipeline: [
      { stage: 'capture', agents: ['A01'], outputs: project.tracks.map((track) => track.name) },
      { stage: 'transcript', agents: ['A02', 'A03', 'A04'], lines: project.transcript.length },
      { stage: 'compose', agents: ['A05', 'A06'], chapters: project.chapters.length },
      { stage: 'write', agents: ['A07', 'A08'], words: project.wordCount },
      { stage: 'publish', agents: ['A09', 'A10', 'A11', 'A12'], layout: layout?.name, cover: project.cover.style },
    ],
    disclaimer:
      '本交付物由 AI 辅助整理，事实与称谓需经讲述者及家属确认后方可印刷出版。',
  };
  return [
    { path: 'deliverables/manuscript.md', content: buildMarkdown(project), kind: 'markdown', label: '手稿 Markdown' },
    { path: 'deliverables/book.html', content: buildBookHtml(project), kind: 'html', label: '可打印书稿 HTML' },
    { path: 'deliverables/project.json', content: JSON.stringify(project, null, 2), kind: 'json', label: '项目工程文件' },
    { path: 'deliverables/agent-run.json', content: JSON.stringify(agentRun, null, 2), kind: 'json', label: '智能体运行记录' },
  ];
}

export function downloadText(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toBase64(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export interface PushResult {
  path: string;
  ok: boolean;
  message: string;
  commitUrl?: string;
}

export async function pushToGitHub(options: {
  owner: string;
  repo: string;
  token: string;
  branch: string;
  files: BundleFile[];
  message: string;
}): Promise<PushResult[]> {
  const { owner, repo, token, branch, files, message } = options;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
  const results: PushResult[] = [];
  for (const file of files) {
    try {
      let sha: string | undefined;
      const check = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${branch}`, { headers });
      if (check.ok) {
        const data = (await check.json()) as { sha?: string };
        sha = data.sha;
      }
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `${message} · ${file.label}`,
          content: toBase64(file.content),
          branch,
          ...(sha ? { sha } : {}),
        }),
      });
      const payload = (await response.json()) as { commit?: { html_url?: string }; message?: string };
      results.push({
        path: file.path,
        ok: response.ok,
        message: response.ok ? '已提交' : payload.message ?? '提交失败',
        commitUrl: payload.commit?.html_url,
      });
    } catch (error) {
      results.push({ path: file.path, ok: false, message: error instanceof Error ? error.message : '网络错误' });
    }
  }
  return results;
}
