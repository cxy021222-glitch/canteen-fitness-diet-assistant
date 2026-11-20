import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AudioLines,
  Check,
  FileAudio,
  Info,
  Mic,
  Square,
  Trash2,
  Upload,
  Waves,
} from 'lucide-react';
import { DIALECTS } from '@/data/agents';
import { useWorkbench } from '@/lib/store';
import type { AudioTrack } from '@/data/types';
import { ActionButton, Chip, KeyValue, Metric, Note, PageHead, Panel, StatusDot } from '@/components/ui-kit';
import { cn } from '@/lib/utils';

const ROUTING: Record<string, { primary: string; cloud: string; note: string }> = {
  普通话: { primary: 'Paraformer-large', cloud: '阿里云通用', note: '本地可离线，标点恢复稳定' },
  粤语: { primary: 'SenseVoice-Small', cloud: '阿里云粤语', note: '粤语词表与书面语映射' },
  四川话: { primary: 'SenseVoice-Small', cloud: '阿里云四川话', note: '川渝口音，保留方言词注释' },
  '吴语（上海话）': { primary: 'Whisper large-v3', cloud: '讯飞吴语', note: '开源模型弱，建议云端增强' },
  闽南语: { primary: 'Whisper large-v3', cloud: '讯飞闽南语', note: '需人工抽检，专有名词建词表' },
  东北话: { primary: 'Paraformer-large', cloud: '阿里云东北话', note: '接近普通话，识别成本最低' },
  客家话: { primary: 'Whisper large-v3', cloud: '讯飞客家话', note: '建议双引擎交叉校验' },
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m} 分钟`;
}

export default function CapturePage() {
  const { project, update, setDialect, startTranscription } = useWorkbench();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [recording, setRecording] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: 56 }, (_, i) => 0.25 + Math.abs(Math.sin(i * 1.7)) * 0.4));
  const [notice, setNotice] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
      setLevels(Array.from({ length: 56 }, (_, i) => 0.2 + Math.random() * 0.8 * (0.5 + Math.abs(Math.sin(i + Date.now() / 260)))));
    }, 180);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const toggleRecording = async () => {
    if (recording) {
      setRecording(false);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const track: AudioTrack = {
        id: `au-${Date.now()}`,
        name: demoMode ? '演示录音 · 新访谈' : `新录音 · ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`,
        duration: Math.max(seconds, 8),
        sizeLabel: `${Math.max(1, Math.round(seconds * 0.11))} MB`,
        recordedAt: new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16),
        dialect: project.dialect,
        kind: 'record',
        status: 'ready',
      };
      update({ tracks: [track, ...project.tracks] });
      setNotice(`已保存「${track.name}」，时长 ${formatTime(track.duration)}。`);
      setSeconds(0);
      setDemoMode(false);
      return;
    }

    setNotice('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setDemoMode(false);
    } catch {
      setDemoMode(true);
      setNotice('未获得麦克风权限，已切换为演示录音：界面与流程保持一致。');
    }
    setSeconds(0);
    setRecording(true);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const created: AudioTrack[] = [];
    for (const file of Array.from(files)) {
      const duration = await new Promise<number>((resolve) => {
        const audio = document.createElement('audio');
        audio.preload = 'metadata';
        audio.onloadedmetadata = () => resolve(Number.isFinite(audio.duration) ? Math.round(audio.duration) : 600);
        audio.onerror = () => resolve(600);
        audio.src = URL.createObjectURL(file);
      });
      created.push({
        id: `au-${Date.now()}-${created.length}`,
        name: file.name.replace(/\.[^.]+$/, ''),
        duration,
        sizeLabel: `${Math.max(1, Math.round(file.size / 1024 / 1024))} MB`,
        recordedAt: new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16),
        dialect: project.dialect,
        kind: 'import',
        status: 'ready',
      });
    }
    update({ tracks: [...created, ...project.tracks] });
    setNotice(`已导入 ${created.length} 个音频文件，方言标记为「${project.dialect}」，可随时修改。`);
  };

  const removeTrack = (id: string) => {
    update({ tracks: project.tracks.filter((track) => track.id !== id) });
  };

  const routing = ROUTING[project.dialect] ?? ROUTING['普通话'];
  const total = project.tracks.reduce((sum, track) => sum + track.duration, 0);

  return (
    <div className="animate-fade-up">
      <PageHead
        eyebrow="Stage 01 · Capture"
        title="先让声音留下来。"
        description="导入已有录音，或直接开始一场访谈。方言、说话人数量与录音质量都会影响后续识别路径，采集时只需标记一次。"
        actions={
          <>
            <ActionButton onClick={() => inputRef.current?.click()}>
              <Upload className="size-3.5" /> 导入音频
            </ActionButton>
            <ActionButton variant="primary" onClick={() => navigate('/transcript')}>
              去转写 <AudioLines className="size-3.5" />
            </ActionButton>
          </>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept="audio/*,video/*"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Panel eyebrow="Recorder · 一键录音" title="访谈录音台" bodyClassName="p-0">
            <div className="relative overflow-hidden px-5 pb-5 pt-6">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(166,57,43,.09),transparent_70%)]" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <StatusDot tone={recording ? 'seal' : 'olive'} pulse={recording} />
                  {recording ? '正在录音' : '设备就绪'}
                  {demoMode && recording && <span className="rounded-[2px] bg-gold/15 px-1.5 py-0.5 text-[9px] text-[#7a5a2c]">演示模式</span>}
                  {params.get('record') === '1' && !recording && (
                    <span className="rounded-[2px] bg-seal/10 px-1.5 py-0.5 text-[9px] text-seal">点击下方按钮开始</span>
                  )}
                </div>
                <div className="font-mono text-[26px] tracking-tight text-ink">{formatTime(seconds)}</div>
              </div>

              <div className="relative mt-5 flex h-28 items-center justify-center gap-[3px] overflow-hidden border-y border-dashed border-border/80 bg-[#f8f2e6] px-3">
                {levels.map((level, index) => (
                  <span
                    key={index}
                    className={cn('w-[3px] rounded-full transition-[height] duration-150', recording ? 'bg-seal/75' : 'bg-[#c9bba1]')}
                    style={{ height: `${Math.round(level * 88)}px`, opacity: recording ? 0.95 : 0.55 }}
                  />
                ))}
                {!recording && (
                  <div className="absolute inset-0 grid place-items-center bg-[#f8f2e6]/40">
                    <span className="label text-[8px] text-[#9b8b73]">等待声音</span>
                  </div>
                )}
              </div>

              <div className="relative mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-2">
                  <select
                    value={project.dialect}
                    onChange={(event) => setDialect(event.target.value)}
                    className="h-9 rounded-[3px] border border-border bg-card px-3 text-[12px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {DIALECTS.map((dialect) => (
                      <option key={dialect} value={dialect}>{dialect}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1.5 rounded-[3px] border border-border bg-card px-2.5 py-2 text-[10px] text-muted-foreground">
                    <Waves className="size-3" /> 48 kHz / 单声道
                  </div>
                </div>

                <button
                  onClick={toggleRecording}
                  className={cn(
                    'inline-flex h-11 items-center gap-2 rounded-full px-5 text-[13px] font-medium text-[#fdf7ec] transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal/50 focus-visible:ring-offset-2',
                    recording ? 'bg-ink hover:bg-[#2a241c]' : 'bg-seal hover:bg-[#943125] active:scale-[0.99]',
                  )}
                >
                  {recording ? <Square className="size-3.5" /> : <Mic className="size-4" />}
                  {recording ? `结束并保存 ${formatTime(seconds)}` : '开始录音'}
                </button>
              </div>

              {notice && (
                <div className="mt-4 flex items-start gap-2 border border-gold/30 bg-gold/[0.07] px-3 py-2 text-[11px] text-[#7a5a2c]">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  {notice}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 divide-x divide-border/70 border-t border-border/70 bg-[#f8f2e5]">
              {[
                ['素材段数', `${project.tracks.length} 段`],
                ['累计时长', formatDuration(total)],
                ['待转写', `${project.tracks.filter((track) => track.status === 'ready').length} 段`],
              ].map(([label, value]) => (
                <div key={label} className="px-4 py-3">
                  <div className="label text-[8px] text-muted-foreground">{label}</div>
                  <div className="mt-1 font-mono text-[15px] text-ink">{value}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="Library · 素材库"
            title="本项目的访谈录音"
            action={<span className="text-[10px] text-muted-foreground">点选可修改方言标记</span>}
            bodyClassName="p-0"
          >
            <div className="divide-y divide-border/70">
              {project.tracks.map((track, index) => (
                <div key={track.id} className="group flex items-center gap-3 px-4 py-3.5">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-[#f4ecdc] font-mono text-[10px] text-[#8c7a5d]">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-medium">{track.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{formatTime(track.duration)}</span>
                      <span className="text-border">/</span>
                      <span>{track.sizeLabel}</span>
                      <span className="text-border">/</span>
                      <span>{track.recordedAt}</span>
                      <span className="rounded-[2px] bg-[#efe6d4] px-1.5 py-0.5 text-[9px] text-[#7a6a52]">
                        {track.kind === 'record' ? '现场录音' : '导入文件'}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-[2px]">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <span
                          key={i}
                          className="w-[2px] rounded-full bg-[#cbbda3]"
                          style={{ height: `${3 + Math.abs(Math.sin((i + index) * 0.9)) * 10}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <select
                    value={track.dialect}
                    onChange={(event) => {
                      const dialect = event.target.value;
                      update({
                        tracks: project.tracks.map((item) => (item.id === track.id ? { ...item, dialect } : item)),
                      });
                    }}
                    className="hidden h-7 rounded-[2px] border border-border bg-card px-1.5 text-[10px] text-muted-foreground sm:block"
                  >
                    {DIALECTS.map((dialect) => (
                      <option key={dialect} value={dialect}>{dialect}</option>
                    ))}
                  </select>
                  <span className="flex items-center gap-1 text-[10px] text-olive">
                    <Check className="size-3" />
                    {track.status === 'transcribed' ? '已转写' : '待转写'}
                  </span>
                  <button
                    onClick={() => removeTrack(track.id)}
                    className="rounded p-1.5 text-[#b9a98d] opacity-0 transition-opacity hover:bg-seal/10 hover:text-seal group-hover:opacity-100"
                    aria-label="删除素材"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => inputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 border-t border-dashed border-border py-4 text-[11px] text-muted-foreground transition-colors hover:bg-[#f8f2e5] hover:text-foreground"
            >
              <Upload className="size-3.5" /> 拖入或点击导入更多音频（WAV / M4A / MP3）
            </button>
          </Panel>

          <div className="flex items-center justify-between border border-border/80 bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <FileAudio className="size-3.5 text-[#a08f74]" />
              采集完成后，进入转写台确认说话人与方言，再执行气口清理。
            </div>
            <ActionButton
              variant="primary"
              size="sm"
              onClick={() => {
                startTranscription();
                navigate('/transcript');
              }}
            >
              开始 AI 转写 <AudioLines className="size-3" />
            </ActionButton>
          </div>
        </div>

        <div className="space-y-5">
          <Panel eyebrow="Dialect routing" title="方言识别路由" bodyClassName="p-4">
            <div className="flex flex-wrap gap-1.5">
              {DIALECTS.map((dialect) => (
                <Chip key={dialect} active={project.dialect === dialect} onClick={() => setDialect(dialect)}>
                  {dialect}
                </Chip>
              ))}
            </div>
            <div className="mt-4 space-y-1">
              <KeyValue k="主引擎" v={routing.primary} />
              <KeyValue k="云端增强" v={routing.cloud} />
              <KeyValue k="兜底" v="Whisper large-v3-turbo" />
            </div>
            <Note tone="gold">{routing.note}。转写完成后，低置信度片段会自动标黄，等待人工确认。</Note>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Metric label="识别" value="96.4%" hint="平均置信度" />
              <Metric label="说话人" value="2" hint="自动分离" />
              <Metric label="方言词" value="9" hint="已注释" />
            </div>
          </Panel>

          <Panel eyebrow="Field notes" title="访谈采集清单" bodyClassName="p-4">
            <div className="space-y-3">
              {[
                ['授权与用途', '录音前确认口述授权、出版范围与署名方式。'],
                ['一人一段', '每位讲述者单独成段，避免多人抢话。'],
                ['方言标注', '采集时标记方言，系统会自动路由识别引擎。'],
                ['留白比追问重要', '允许沉默，气口本身就是叙事的一部分。'],
              ].map(([title, desc], index) => (
                <div key={title} className="flex gap-3">
                  <span className="font-mono text-[9px] text-[#b9a98d]">0{index + 1}</span>
                  <div>
                    <div className="text-[11.5px] font-medium">{title}</div>
                    <div className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel eyebrow="Privacy" title="素材合规" bodyClassName="p-4">
            <Note tone="seal">
              音频仅用于本项目转写，默认保存在本机，不会上传到公共模型训练集。交付前请签署《口述授权书》，并对涉及第三方的隐私内容做化名处理。
            </Note>
          </Panel>
        </div>
      </div>
    </div>
  );
}
