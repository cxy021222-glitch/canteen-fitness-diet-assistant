import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Boxes,
  CircleAlert,
  Cpu,
  Languages,
  Layers,
  Sparkles,
  Timer,
  Wallet,
  Wrench,
} from 'lucide-react';
import { AGENTS, STAGES } from '@/data/agents';
import { ActionButton, Chip, Note, PageHead, Panel, StatusDot } from '@/components/ui-kit';
import { cn } from '@/lib/utils';
import type { StageId } from '@/data/types';

export default function AgentsPage() {
  const [filter, setFilter] = useState<StageId | 'all'>('all');
  const shown = filter === 'all' ? AGENTS : AGENTS.filter((agent) => agent.stage === filter);

  return (
    <div className="animate-fade-up">
      <PageHead
        eyebrow="System · Agent Matrix"
        title="十二个智能体，一条从声音到书的流水线。"
        description="不追求“一个万能模型”，而是把任务拆成可替换的工位：轻任务用本地小模型，判断任务用长上下文大模型，创作任务用双模型分工。"
        actions={
          <Link to="/skills">
            <ActionButton variant="primary">
              <Wrench className="size-3.5" /> 查看 Skill 仓库
            </ActionButton>
          </Link>
        }
      />

      <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['智能体', '12', '覆盖 5 个工位'],
          ['方言路由', '7', '含粤语 / 吴语 / 闽南语'],
          ['模型层级', '3', '本地小模型 / 通用大模型 / 图像模型'],
          ['失败兜底', '12', '每个工位都有离线方案'],
        ].map(([label, value, hint]) => (
          <div key={label} className="paper-card px-4 py-3.5">
            <div className="label text-[8px] text-muted-foreground">{label}</div>
            <div className="mt-1 font-mono text-[26px] leading-none text-ink">{value}</div>
            <div className="mt-1.5 text-[10px] text-muted-foreground">{hint}</div>
          </div>
        ))}
      </div>

      <Panel
        eyebrow="Orchestration · 编排图"
        title="五个工位，接力交付"
        action={<span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><Sparkles className="size-3 text-gold" /> 支持任意工位人工接管</span>}
        bodyClassName="p-5"
      >
        <div className="grid gap-3 md:grid-cols-5">
          {STAGES.map((stage, index) => {
            const stageAgents = AGENTS.filter((agent) => agent.stage === stage.id);
            return (
              <div key={stage.id} className="relative">
                <div className="border border-border/80 bg-card p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[18px] leading-none" style={{ color: stage.color }}>{stage.no}</span>
                    <span className="label text-[7.5px] text-muted-foreground">{stageAgents.length} AGENTS</span>
                  </div>
                  <div className="mt-2 font-serif text-[14px] font-semibold">{stage.name}</div>
                  <div className="mt-0.5 text-[9px] leading-relaxed text-muted-foreground">{stage.description}</div>
                  <div className="mt-3 space-y-1.5 border-t border-dashed border-border/70 pt-2">
                    {stageAgents.map((agent) => (
                      <div key={agent.id} className="flex items-center gap-1.5 text-[9.5px]">
                        <StatusDot tone={agent.status === 'running' ? 'seal' : agent.status === 'warm' ? 'gold' : 'olive'} pulse={agent.status === 'running'} />
                        <span className="font-mono text-[8px] text-[#b9a98d]">{agent.code}</span>
                        <span className="truncate text-[#5f5445]">{agent.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {index < STAGES.length - 1 && (
                  <ArrowRight className="absolute -right-[9px] top-1/2 z-10 hidden size-3.5 -translate-y-1/2 text-[#c4b69d] md:block" />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-dashed border-border pt-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><Cpu className="size-3" /> 本地优先：VAD / 分离 / 排版</span>
          <span className="flex items-center gap-1.5"><Languages className="size-3" /> 方言路由：按口音选引擎</span>
          <span className="flex items-center gap-1.5"><Layers className="size-3" /> 双模型：长文撰写 + 中文润色</span>
        </div>
      </Panel>

      <div className="mb-3 mt-6 flex flex-wrap items-center gap-1.5">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>全部工位</Chip>
        {STAGES.map((stage) => (
          <Chip key={stage.id} active={filter === stage.id} onClick={() => setFilter(stage.id)}>
            {stage.no} {stage.name}
          </Chip>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground">{shown.length} 个智能体</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((agent) => {
          const stage = STAGES.find((item) => item.id === agent.stage);
          return (
            <article key={agent.id} className="paper-card grain flex flex-col p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="grid size-8 place-items-center rounded-[2px] font-mono text-[10px]"
                    style={{ background: stage?.soft, color: stage?.color }}
                  >
                    {agent.code}
                  </span>
                  <div>
                    <div className="font-serif text-[15px] font-semibold">{agent.name}</div>
                    <div className="text-[9px] text-muted-foreground">{stage?.name} · {agent.role}</div>
                  </div>
                </div>
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px]',
                    agent.status === 'running'
                      ? 'border-seal/25 bg-seal/[0.06] text-seal'
                      : agent.status === 'warm'
                        ? 'border-gold/30 bg-gold/[0.07] text-[#7a5a2c]'
                        : 'border-olive/25 bg-olive/[0.05] text-olive',
                  )}
                >
                  <StatusDot tone={agent.status === 'running' ? 'seal' : agent.status === 'warm' ? 'gold' : 'olive'} pulse={agent.status === 'running'} />
                  {agent.status === 'running' ? '运行中' : agent.status === 'warm' ? '预热' : '就绪'}
                </span>
              </div>

              <p className="mt-3 text-[10.5px] leading-relaxed text-muted-foreground">{agent.description}</p>

              <div className="mt-3 border border-border/80 bg-[#faf6ec] p-3">
                <div className="label text-[7.5px] text-[#a2907a]">推荐模型</div>
                <div className="mt-1 text-[11px] font-medium leading-snug text-ink">{agent.model}</div>
                <div className="mt-1.5 flex items-start gap-1 text-[9.5px] leading-relaxed text-muted-foreground">
                  <CircleAlert className="mt-0.5 size-2.5 shrink-0" />
                  <span><span className="text-[#7a6a52]">兜底：</span>{agent.fallback}</span>
                </div>
              </div>

              <p className="mt-2 text-[9.5px] leading-relaxed text-[#7b6a50]">{agent.modelReason}</p>

              {agent.dialects && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {agent.dialects.map((dialect) => (
                    <span key={dialect} className="rounded-[2px] bg-[#29434e]/[0.06] px-1.5 py-0.5 text-[8.5px] text-[#29434e]">{dialect}</span>
                  ))}
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-dashed border-border pt-2.5 text-[9px]">
                <div>
                  <div className="label text-[7px] text-muted-foreground">输入</div>
                  <div className="mt-0.5 text-[#5f5445]">{agent.inputs.join(' / ')}</div>
                </div>
                <div>
                  <div className="label text-[7px] text-muted-foreground">输出</div>
                  <div className="mt-0.5 text-[#5f5445]">{agent.outputs.join(' / ')}</div>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-2.5 text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1"><Timer className="size-2.5" /> {agent.latency}</span>
                <span className="flex items-center gap-1"><Wallet className="size-2.5" /> {agent.cost}</span>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {agent.skills.map((skill) => (
                  <Link
                    key={skill}
                    to="/skills"
                    className="rounded-full border border-border bg-card px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground hover:border-[#b9a98d] hover:text-foreground"
                  >
                    {skill}
                  </Link>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          {
            title: '为什么不是一个模型到底',
            icon: Cpu,
            text: '语音切片、声纹聚类、排版是确定性任务，用 10MB 级小模型即可，既快又省；把它们交给大模型只会增加成本与不确定性。',
          },
          {
            title: '方言不是“加个开关”',
            icon: Languages,
            text: '不同方言的开源支持差异很大。粤语、川渝可自托管；吴语、闽南语、客家话需要云端引擎，再用手工词表与人工抽检兜底。',
          },
          {
            title: '创作需要双模型',
            icon: Layers,
            text: '长文结构与风格一致性由 Claude 负责，中文口语与方言节奏由 Qwen 二次润色。分工后，文字更像本人，而不是“标准书面语”。',
          },
        ].map((item) => (
          <div key={item.title} className="border border-border/80 bg-card p-4">
            <div className="flex items-center gap-2 text-[12px] font-medium"><item.icon className="size-3.5 text-seal" /> {item.title}</div>
            <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Note tone="seal">
          <span className="flex items-center gap-1.5 font-medium"><Boxes className="size-3" /> 编排原则</span>
          每个工位都接受“人工接管”：修改转写、锁定结构、手改正文、换封面，都不需要重跑全流程。智能体只负责把下一步变短。
        </Note>
      </div>
    </div>
  );
}
