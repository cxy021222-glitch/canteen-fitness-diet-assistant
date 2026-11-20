import type { ImageStyle, LayoutPreset, NarrativePreset, TonePreset } from './types';

export const NARRATIVE_PRESETS: NarrativePreset[] = [
  {
    id: 'chronicle',
    name: '编年体',
    en: 'CHRONICLE',
    essence: '顺流而下',
    description: '按时间顺序推进，从童年写到当下。线索清晰、阅读门槛最低，适合第一次整理口述的委托人。',
    bestFor: '时间跨度大、重大节点清晰的生平',
    chapterOrder: [0, 1, 2, 3, 4],
    connector: '那一年，……',
  },
  {
    id: 'double-line',
    name: '双线并行',
    en: 'DOUBLE THREAD',
    essence: '此岸与彼岸',
    description: '一条线写晚年返乡，一条线写少年离乡，两条时间线交替推进，在“炉火”处汇合。',
    bestFor: '有强烈今昔对照、迁徙与返乡经验的讲述者',
    chapterOrder: [4, 1, 0, 2, 3],
    connector: '而在另一边，……',
  },
  {
    id: 'thematic',
    name: '主题式',
    en: 'THEMATIC',
    essence: '五盏灯',
    description: '不按年份切分，而以“盐、火车、炉火、木箱、归途”五个意象组织章节，情绪更集中。',
    bestFor: '细节丰富、情感浓度高，但时间线较碎的素材',
    chapterOrder: [0, 2, 3, 1, 4],
    connector: '说到这盏灯，……',
  },
  {
    id: 'oral-history',
    name: '口述实录',
    en: 'ORAL HISTORY',
    essence: '原声档案',
    description: '保留访谈的问答结构与口语节奏，只做轻度整理，让读者直接听见讲述者的声音。',
    bestFor: '希望保留原始语感、供家族与研究者存档',
    chapterOrder: [0, 1, 2, 3, 4],
    connector: '问：…… 答：……',
  },
  {
    id: 'epistolary',
    name: '书信体',
    en: 'LETTERS',
    essence: '写给未出生的人',
    description: '以“写给孙辈的信”为框架，每章是一封信，称呼与落款固定，适合作为家族传承读本。',
    bestFor: '希望把回忆录作为礼物留给下一代的委托人',
    chapterOrder: [0, 1, 2, 3, 4],
    connector: '孩子，等你读到这封信的时候，……',
  },
];

export const TONE_PRESETS: TonePreset[] = [
  {
    id: 'restrained',
    name: '克制纪实',
    en: 'RESTRAINED',
    description: '少形容词，多用动作与物件说话。适合希望“像档案一样可信”的回忆录。',
    sample: '母亲没有抬头，只说了一句：路上小心。',
    keywords: ['白描', '短句', '不煽情'],
    openings: [
      '记忆里的第一样东西，是盐。',
      '出发那天，天还没有亮。',
      '炉子点着的时候，所有人都没有说话。',
      '那只木箱，是我们家最像样的一件家具。',
      '人老了，梦就短了，常常只梦到一段路。',
    ],
  },
  {
    id: 'warm',
    name: '温暖抒情',
    en: 'WARM',
    description: '允许光线、气味与温度进入文字，把细节写成可触摸的记忆。',
    sample: '灶膛里的火苗舔着锅底，把母亲的脸照得忽明忽暗。',
    keywords: ['感官', '光影', '余温'],
    openings: [
      '很多年以后，我还能闻到那股咸味。',
      '那天的雾很重，像谁把一床旧棉被搭在了山上。',
      '火光跃起来的一瞬间，我听见自己的心跳。',
      '木头的香气，一直留到很多年以后。',
      '傍晚的光斜斜地照进来，把屋子照成旧照片的颜色。',
    ],
  },
  {
    id: 'literary',
    name: '文学散文',
    en: 'LITERARY',
    description: '讲究节奏与意象，允许适度的想象性描写，但不改变事实骨架。',
    sample: '山把天空挤成一条缝，火车就从那条缝里钻了进去。',
    keywords: ['意象', '长句', '留白'],
    openings: [
      '盐是白的，白得像一场没有落下来的雪。',
      '火车把故乡甩在身后，像甩下一件穿旧的衣服。',
      '火是有脾气的，你哄它，它就亮；你怠慢它，它就暗。',
      '山里的日子，是被一件件小东西缝起来的。',
      '归途比来路短，记忆却比来路长。',
    ],
  },
  {
    id: 'colloquial',
    name: '幽默口语',
    en: 'COLLOQUIAL',
    description: '保留方言词与自嘲式的幽默，读起来像坐在老人身边听他摆龙门阵。',
    sample: '她说我这个人，嘴巴硬，心头软，跟炉子一个脾气。',
    keywords: ['方言', '自嘲', '短打'],
    openings: [
      '我这辈子，跟盐巴打的第一场交道，是被它腌了一身。',
      '十五岁那年，我头一回坐火车，晕得连自己姓啥子都忘了。',
      '人家说炼钢苦，我说不苦，就是有点费鞋。',
      '我们那口木箱，丑是丑，结实得很，比婚姻还牢靠。',
      '退休那天，我把安全帽带回家，挂在墙上，像挂一幅画。',
    ],
  },
  {
    id: 'epic',
    name: '史诗厚重',
    en: 'EPIC',
    description: '把个人命运放进时代背景中书写，强调迁徙、建设与一代人的共同经验。',
    sample: '那一代人把青春埋进山里，山便有了温度。',
    keywords: ['时代', '群像', '纵深'],
    openings: [
      '一九四三年的中国，盐是紧俏的，命也是。',
      '一九五八年的那列火车上，坐着一整代人的命运。',
      '高炉点火的那一年，很多人的青春一起被点燃。',
      '三线，是一个地图上找不到、却改变了许多人一生的词。',
      '时代往前走，把一些人留在原地，也把一些人送回了家。',
    ],
  },
];

export const IMAGE_STYLES: ImageStyle[] = [
  {
    id: 'woodcut',
    name: '木刻版画',
    en: 'WOODCUT',
    description: '刀刻线条与单色套印，克制、有力，适合时代感强的题材。',
    palette: ['#1c1917', '#a6392b', '#e8ddc7'],
    prompt: 'woodcut print, bold carved contours, limited palette of ink black and vermilion on warm paper, grain texture, flat shapes, no text',
  },
  {
    id: 'watercolor',
    name: '水彩纪事',
    en: 'WATERCOLOR',
    description: '湿画法与晕染边缘，温柔地处理记忆中的光线与天气。',
    palette: ['#b7c4b1', '#d9b48f', '#f2e8d5'],
    prompt: 'soft watercolor illustration, wet-on-wet washes, muted earth tones, visible paper grain, gentle light, no text',
  },
  {
    id: 'film',
    name: '银盐胶片',
    en: 'SILVER FILM',
    description: '黑白纪实摄影质感，颗粒、暗角与自然光，像从旧相册里取出的一页。',
    palette: ['#2b2b2b', '#8c8579', '#e7e2d8'],
    prompt: '1970s black and white documentary photograph, 35mm film grain, natural light, slight vignette, candid composition, no text',
  },
  {
    id: 'ink',
    name: '水墨留白',
    en: 'INK WASH',
    description: '墨色浓淡与大面积留白，适合表达山、雾、迁徙与离别。',
    palette: ['#1f2421', '#6f7a72', '#f4efe4'],
    prompt: 'traditional Chinese ink wash painting, minimal composition, generous negative space, rice paper texture, misty mountains, no text',
  },
  {
    id: 'risograph',
    name: '复古丝网印',
    en: 'RISOGRAPH',
    description: '双色错版与粗颗粒，带一点旧印刷品的温度，适合家族读本。',
    palette: ['#c05a3e', '#2f4a56', '#efe6d2'],
    prompt: 'vintage risograph print, two-color overprint with slight misregistration, coarse grain, flat illustration, warm paper, no text',
  },
  {
    id: 'oil',
    name: '油画肖像',
    en: 'OIL PAINT',
    description: '厚涂笔触与暖色光影，适合人物与室内场景，情绪更饱满。',
    palette: ['#7a3b2e', '#b58a5a', '#2e2a23'],
    prompt: 'expressive oil painting, thick visible brush strokes, warm chiaroscuro lighting, muted palette, painterly texture, no text',
  },
];

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'a5-hardcover',
    name: 'A5 精装',
    size: '148 × 210 mm',
    description: '最通用的家族回忆录开本，单手可持，适合精装赠予亲友。',
    bodySize: '10.5 pt',
    leading: '1.75',
    pages: 248,
    features: ['章节扉页', '单栏正文', '页眉年份', '彩插 4 页'],
  },
  {
    id: 'pocket',
    name: '32 开文库',
    size: '130 × 185 mm',
    description: '轻巧的口袋读本，字号收紧，适合作为随身读物与平装版。',
    bodySize: '9.5 pt',
    leading: '1.6',
    pages: 196,
    features: ['紧凑版心', '双色印刷', '无扉页插图', '轻质纸'],
  },
  {
    id: 'quarto',
    name: '16 开画册',
    size: '210 × 285 mm',
    description: '图文并重的纪念画册，插图可跨页呈现，适合作为家族档案。',
    bodySize: '11 pt',
    leading: '1.8',
    pages: 168,
    features: ['跨页插图', '图注系统', '年表附页', '硬壳函套'],
  },
];

export const ILLUSTRATION_STYLE_DEFAULT = 'watercolor';

export const STORAGE_KEY = 'memoir-atelier-project-v1';

export const COVER_SAFE_PROMPT =
  'editorial book cover artwork, 1960s Chinese industrial mountain valley at dusk, a lone worker silhouette in front of a blast furnace, power lines and mist, generous empty space at upper third for typography, no text, no letters';

export function buildCoverPrompt(styleId: string, title: string, subtitle: string) {
  const style = IMAGE_STYLES.find((item) => item.id === styleId) ?? IMAGE_STYLES[0];
  return `${COVER_SAFE_PROMPT}, ${style.prompt}, inspired by themes of ${title} ${subtitle}`;
}

export function buildIllustrationPrompt(styleId: string, scene: string) {
  const style = IMAGE_STYLES.find((item) => item.id === styleId) ?? IMAGE_STYLES[0];
  return `${scene}, ${style.prompt}, consistent character design, 1960s China, no text`;
}

/** 演示项目固定 id，localStorage key 的项目子目录 */
export const DEMO_PROJECT_ID = 'proj-demo-fire';
/** 空白模板 id（不作为真项目存，只是 createEmptyProject 的 seed） */
export const EMPTY_PROJECT_ID = 'proj-empty-template';
/** 项目列表 localStorage key */
export const STORE_KEY = 'memoir-atelier-store-v1';
/** 单个项目内容 localStorage key 前缀 */
export const PROJECT_KEY_PREFIX = 'memoir-atelier-project-v1-';
