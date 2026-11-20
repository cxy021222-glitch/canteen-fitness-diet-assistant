import type { TranscriptLine } from '@/data/types';

const LEADING = /^(嗯+|啊+|呃+|额+|哦+|唉+|唔+|哎+)[，、。…\s]*/;
const INTERJECTION = /(^|[，。！？；\s])(嗯+|啊+|呃+|额+|哦+|唉+|唔+|哎+)(?=[，、。…！？；\s]|$)/g;
const DISCOURSE = [
  /那个[，、]?/g,
  /就是说[，、]?/g,
  /然后呢[，、]?/g,
  /你知道吧[，、]?/g,
  /怎么说呢[，、]?/g,
  /反正[，、]?/g,
  /这个这个[，、]?/g,
  /我跟你讲[，、]?/g,
];
const SOFT_TAIL = /(嘛|噻|哈|嘞|噻|哟)(?=[。！？，；]|$)/g;
const DIALECT_SOFT = /(心头|屋头|娃儿|啥子|里头|不得)/g;
const REPEAT = /([\u4e00-\u9fa5]{1,3})\1{1,}/g;

export type CleanLevel = 'soft' | 'standard' | 'deep';

export const CLEAN_LEVEL_LABEL: Record<CleanLevel, string> = {
  soft: '保守',
  standard: '标准',
  deep: '精修',
};

function cleanOne(text: string, level: CleanLevel): { text: string; removed: number } {
  let next = text.trim();
  let removed = 0;

  const stripLeading = next.replace(LEADING, () => {
    removed += 1;
    return '';
  });
  next = stripLeading;

  const withoutInterjections = next.replace(INTERJECTION, (match, prefix: string) => {
    removed += 1;
    return prefix;
  });
  next = withoutInterjections;

  if (level !== 'soft') {
    for (const pattern of DISCOURSE) {
      next = next.replace(pattern, () => {
        removed += 1;
        return '';
      });
    }
  }

  if (level === 'deep') {
    next = next.replace(SOFT_TAIL, () => {
      removed += 1;
      return '';
    });
    next = next.replace(REPEAT, (match) => {
      removed += 1;
      return match.slice(0, 3);
    });
  }

  next = next
    .replace(/[，、]{2,}/g, '，')
    .replace(/。{2,}/g, '。')
    .replace(/…{2,}/g, '……')
    .replace(/^[，、。；：\s]+/, '')
    .replace(/\s+([，。！？；：])/g, '$1')
    .trim();

  return { text: next, removed };
}

export function cleanTranscript(lines: TranscriptLine[], level: CleanLevel) {
  let removed = 0;
  const originalChars = lines.reduce((sum, line) => sum + line.text.length, 0);
  const cleaned = lines.map((line) => {
    const result = cleanOne(line.text, level);
    removed += result.removed;
    return { ...line, text: result.text };
  });
  const cleanedChars = cleaned.reduce((sum, line) => sum + line.text.length, 0);
  return {
    lines: cleaned,
    removed,
    originalChars,
    cleanedChars,
    ratio: originalChars > 0 ? Math.round(((originalChars - cleanedChars) / originalChars) * 100) : 0,
  };
}

export function dialectWordCount(lines: TranscriptLine[]): number {
  return lines.reduce((sum, line) => sum + (line.text.match(DIALECT_SOFT)?.length ?? 0), 0);
}
