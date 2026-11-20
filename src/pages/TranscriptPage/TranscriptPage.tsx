import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  AudioLines,
  Check,
  CircleAlert,
  Eraser,
  Languages,
  RefreshCw,
  Scissors,
  Sparkles,
  Users,
} from 'lucide-react';
import { DIALECTS } from '@/data/agents';
import { useWorkbench } from '@/lib/store';
import { CLEAN_LEVEL_LABEL, dialectWordCount, type CleanLevel } from '@/lib/fillers';
import { ActionButton, Bar, Chip, KeyValue, Metric, Note, PageHead, Panel, StatusDot } from '@/components/ui-kit';
import { cn } from '@/lib/utils';

function stamp(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

const ENGINE_BY_DIALECT: Record<string, string> = {
  普通话: 'Paraformer-large',
  粤语: 'SenseVoice-Small',
  四川话: 'SenseVoice-Small',
  '吴语（上海话）': 'Whisper large-v3',
  闽南语: 'Whisper large-v3',
  东北话: 'Paraformer-large',
  客家话: 'Whisper large-v3',
};

export default function TranscriptPage() {
  const {
    project,
    cleaned,
    cleanLevel,
    setCleanLevel,
    setDialect,
    update,
    visibleLines,
    transcribeState,
    transcribeProgress,
    startTranscription,
  } = useWorkbench();
  const navigate = useNavigate();
  const [showOriginal, setShowOriginal] = useState(false);
  const [notice, setNotice] = useState('');

  const lines = useMemo(
    () => (project.cleaned && !showOriginal ? cleaned.lines : project.transcript).slice(0, Math.max(visibleLines, 0)),
    [project.cleaned, project.transcript, cleaned.lines, showOriginal, visibleLines],
  );
  const lowConfidence = project.transcript.filter((line) => line.confidence < 0.85);
  const dialectWords = dialectWordCount(project.transcript);
  const totalMinutes = Math.round(project.tracks.reduce((sum, track) => sum + track.duration, 0) / 60) || 132;

  const runClean = () => {
    update({ cleaned: true, transcript: cleaned.lines });
    setNotice(`已执行「${CLEAN_LEVEL_LABEL[cleanLevel]}」清理：删除 ${cleaned.removed} 处语气词与重复起句，保留 ${cleaned.lines.length} 句有效口述。`);
  };

  return (
    <div className="animate-fade-up">
      <PageHead
        eyebrow="Stage 02 · Transcribe"
        title="先听见，再删繁。"
        description="方言识别、说话人分离与气口清理在同一张工作台上完成。左侧逐句校对，右侧控制清洗强度；每一处删除都可回溯到原音。"
        actions={
          <>
            <ActionButton onClick={startTranscription} loading={transcribeState === 'running'}>
              <RefreshCw className="size-3.5" /> 重新转写
            </ActionButton>
            <ActionButton variant="primary" onClick={() => navigate('/compose')}>
              提取故事主干 <ArrowRight className="size-3.5" />
            </ActionButton>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 border border-border/80 bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <Languages className="size-3.5 text-[#8c7a5d]" />
          <span className="text-[11px] text-muted-foreground">方言</span>
          <select
            value={project.dialect}
            onChange={(event) => setDialect(event.target.value)}
            className="h-7 rounded-[2px] border border-border bg-[#faf6ec] px-2 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {DIALECTS.map((dialect) => <option key={dialect} value={dialect}>{dialect}</option>)}
          </select>
        </div>
        <span className="hidden h-4 w-px bg-border sm:block" />
        <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
          <StatusDot tone="olive" /> {ENGINE_BY_DIALECT[project.dialect] ?? 'SenseVoice'} · 置信度 96.4%
        </div>
        <span className="hidden h-4 w-px bg-border sm:block" />
        <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
          <Users className="size-3" /> 说话人 2 · 自动分离
        </div>
        <div className="ml-auto flex items-center gap-2">
          {transcribeState === 'running' && (
            <div className="flex items-center gap-2">
              <span className="label text-[8px] text-seal">转写中 {transcribeProgress}%</span>
              <Bar value={transcribeProgress} className="w-24" />
            </div>
          )}
          <Chip active={!showOriginal} onClick={() => setShowOriginal(false)}>
            {project.cleaned ? '清理后' : '当前稿'}
          </Chip>
          <Chip active={showOriginal} onClick={() => setShowOriginal(true)}>对照原文</Chip>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Panel
            eyebrow="Transcript · 逐句校对"
            title={`${project.tracks.length} 段访谈 · ${project.transcript.length} 句 · ${totalMinutes} 分钟`}
            action={<span className="text-[10px] text-muted-foreground">点击句子可定位原音（演示）</span>}
            bodyClassName="p-0"
          >
            <div className="max-h-[640px] divide-y divide-border/60 overflow-y-auto">
              {lines.length === 0 && (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-[11px] text-muted-foreground">
                  <AudioLines className="size-5 animate-soft-pulse text-seal" />
                  正在听写第一句……
                </div>
              )}
              {lines.map((line) => {
                const isGuest = line.speaker === 'guest';
                const low = line.confidence < 0.85;
                return (
                  <div key={line.id} className="group flex gap-3 px-4 py-3.5 transition-colors hover:bg-[#faf5e9]">
                    <div className="w-10 shrink-0 pt-0.5">
                      <span
                        className={cn(
                          'inline-grid size-7 place-items-center rounded-full border font-serif text-[10px]',
                          isGuest
                            ? 'border-seal/25 bg-seal/[0.07] text-seal'
                            : 'border-[#29434e]/20 bg-[#29434e]/[0.06] text-[#29434e]',
                        )}
                      >
                        {isGuest ? '述' : '访'}
                      </span>
                      <div className="mt-1 text-center font-mono text-[9px] text-[#b1a48e]">{stamp(line.start)}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-muted-foreground">{isGuest ? project.meta.subject : project.meta.host}</span>
                        <span
                          className={cn(
                            'rounded-[2px] px-1 py-0.5 font-mono text-[8.5px]',
                            low ? 'bg-gold/15 text-[#7a5a2c]' : 'bg-olive/10 text-olive',
                          )}
                        >
                          {line.confidence.toFixed(2)}
                        </span>
                        {line.dialectWord && (
                          <span className="rounded-[2px] border border-[#29434e]/20 px-1 py-0.5 text-[8.5px] text-[#29434e]">
                            方言词 · {line.dialectWord}
                          </span>
                        )}
                        {low && <span className="text-[8.5px] text-gold">建议人工确认</span>}
                      </div>
                      <p
                        className={cn(
                          'mt-1.5 font-serif text-[14px] leading-[1.9] text-ink',
                          low && 'decoration-gold/60 decoration-dotted underline-offset-4',
                          low && 'underline',
                        )}
                      >
                        {line.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-border/70 bg-[#f8f2e5] px-4 py-2.5 text-[10px] text-muted-foreground">
              <span>共 {project.transcript.length} 句 · 方言词 {dialectWords} 处 · 低置信度 {lowConfidence.length} 句</span>
              <span className="flex items-center gap-1"><Check className="size-3 text-olive" /> 自动标点已恢复</span>
            </div>
          </Panel>

          <div className="grid gap-5 md:grid-cols-2">
            <Panel eyebrow="Low confidence" title="需要人耳复核的句子" bodyClassName="p-4">
              <div className="space-y-3">
                {lowConfidence.slice(0, 4).map((line) => (
                  <div key={line.id} className="border-l-2 border-gold/60 pl-3">
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                      <span className="font-mono">{stamp(line.start)}</span>
                      <span>置信度 {line.confidence.toFixed(2)}</span>
                    </div>
                    <p className="mt-1 font-serif text-[12px] leading-relaxed text-ink">{line.text}</p>
                  </div>
                ))}
              </div>
              <Note tone="gold">方言词与专有名词最容易被误听。建议请家属或本地人听一遍，再把确认后的词加入项目词表。</Note>
            </Panel>

            <Panel eyebrow="Vocabulary" title="项目方言词表" bodyClassName="p-4">
              <div className="flex flex-wrap gap-1.5">
                {['啥子', '屋头', '心头', '娃儿', '里头', '不得灭', '噻', '嘛'].map((word) => (
                  <span key={word} className="rounded-full border border-[#29434e]/20 bg-[#29434e]/[0.05] px-2 py-1 font-serif text-[11px] text-[#29434e]">
                    {word}
                  </span>
                ))}
              </div>
              <div className="mt-4 space-y-1">
                <KeyValue k="词表来源" v="自动抽取 + 人工确认" />
                <KeyValue k="方言片区" v="川渝 · 自贡—攀枝花" />
                <KeyValue k="专有名词" v="自贡盐井 / 渡口 / 攀钢" />
              </div>
              <Note>词表会作为约束传入转写与撰写智能体，避免后文把“屋头”改写成“家里”而丢失语感。</Note>
            </Panel>
          </div>
        </div>

        <div className="space-y-5">
          <Panel eyebrow="Cleaner · 气口编辑" title="把口头语，变成句子" bodyClassName="p-4">
            <div className="grid grid-cols-3 gap-1 rounded-[3px] border border-border bg-[#f3ecdd] p-1">
              {(['soft', 'standard', 'deep'] as CleanLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setCleanLevel(level)}
                  className={cn(
                    'rounded-[2px] py-1.5 text-[11px] transition-colors',
                    cleanLevel === level ? 'bg-card text-ink shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {CLEAN_LEVEL_LABEL[level]}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="删除语气词" value={cleaned.removed} hint="处" />
              <Metric label="文本压缩" value={`${cleaned.ratio}%`} hint={`${cleaned.originalChars} → ${cleaned.cleanedChars} 字`} />
            </div>
            <div className="mt-4 border border-border/80 bg-[#faf6ec] p-3">
              <div className="label mb-2 text-[8px] text-muted-foreground">Before / After</div>
              <p className="text-[10.5px] leading-relaxed text-muted-foreground line-through decoration-seal/40">
                {project.transcript[3]?.text}
              </p>
              <p className="mt-2 border-t border-dashed border-border pt-2 font-serif text-[12px] leading-relaxed text-ink">
                {cleaned.lines[3]?.text}
              </p>
            </div>
            <ActionButton variant="primary" className="mt-3 w-full" onClick={runClean} loading={transcribeState === 'running'}>
              <Eraser className="size-3.5" /> 执行气口清理
            </ActionButton>
            {project.cleaned && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-olive">
                <Check className="size-3" /> 已应用「{CLEAN_LEVEL_LABEL[cleanLevel]}」清理
              </div>
            )}
            {notice && <Note tone="muted">{notice}</Note>}
          </Panel>

          <Panel eyebrow="Pipeline" title="本环节的智能体" bodyClassName="p-4">
            <div className="space-y-3">
              {[
                { code: 'A02', name: '方言听写员', desc: 'SenseVoice + Paraformer 路由', icon: AudioLines, status: '已完成' },
                { code: 'A03', name: '角色分辨师', desc: 'pyannote + CAM++ 声纹校验', icon: Users, status: '已完成' },
                { code: 'A04', name: '气口编辑', desc: 'Qwen3-32B + 规则库', icon: Scissors, status: '运行中' },
              ].map((agent) => (
                <div key={agent.code} className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-[2px] border border-border bg-[#f7f0e1]">
                    <agent.icon className="size-3.5 text-[#7b6a50]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11.5px]">
                      <span className="font-mono text-[9px] text-[#b9a98d]">{agent.code}</span>
                      {agent.name}
                    </div>
                    <div className="truncate text-[9.5px] text-muted-foreground">{agent.desc}</div>
                  </div>
                  <span className={cn('text-[9px]', agent.status === '运行中' ? 'text-seal' : 'text-olive')}>{agent.status}</span>
                </div>
              ))}
            </div>
          </Panel>

          <div className="border border-seal/20 bg-seal/[0.035] p-4">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#7f3226]">
              <CircleAlert className="size-3.5" /> 校对原则
            </div>
            <p className="mt-2 text-[10.5px] leading-relaxed text-[#7f3226]/80">
              清理的是语气词与重复，不是讲述者的性格。凡是涉及年份、地名、人名与亲属称谓的改动，都要回听原音确认。
            </p>
            <ActionButton variant="outline" size="sm" className="mt-3" onClick={() => navigate('/compose')}>
              <Sparkles className="size-3" /> 已校对，去抽取故事
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
