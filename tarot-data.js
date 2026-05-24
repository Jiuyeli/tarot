// --- Tarot Data ---
const majorArcanaData = [
    { name: "愚者", nameEn: "The Fool", imgName: "0-愚人.jpg", keywords: ["新的开始", "冒险", "天真", "盲目"], meaning_upright: "一段新旅程的开始，充满未知的可能性，需要信心和勇气。", meaning_reversed: "鲁莽的行动，计划不周，逃避责任，错失良机。", description: "一位年轻人站在悬崖边缘，目光向往着天空，身旁有一只小白狗在提醒他。" },
    { name: "魔术师", nameEn: "The Magician", imgName: "1-魔术师.jpg", keywords: ["创造力", "显化", "意志力", "潜能"], meaning_upright: "你拥有实现目标所需的所有资源和能力，是采取行动的时刻。", meaning_reversed: "才华被滥用，缺乏专注，操纵他人，潜能未被激发。", description: "魔术师高举权杖，面前的桌子上摆放着代表四元素的圣杯、宝剑、星币和权杖。" },
    { name: "女祭司", nameEn: "The High Priestess", imgName: "2-女祭司.jpg", keywords: ["直觉", "潜意识", "神秘", "内在智慧"], meaning_upright: "倾听内心的声音，相信你的直觉，有些事情仍在酝酿之中。", meaning_reversed: "忽视直觉，隐藏的秘密，肤浅的认知，情绪被压抑。", description: "女祭司端坐在两根柱子之间，手持卷轴，背后是结满石榴的帷幕。" },
    { name: "女皇", nameEn: "The Empress", imgName: "3-女皇.jpg", keywords: ["丰收", "母性", "创造力", "自然"], meaning_upright: "生命的孕育与丰收，充满爱与关怀的环境，物质与精神的富足。", meaning_reversed: "过度保护，创造力受阻，依赖他人，忽视自身需求。", description: "女皇头戴星辰皇冠，身穿华丽长袍，坐在茂密森林中的柔软宝座上。" },
    { name: "皇帝", nameEn: "The Emperor", imgName: "4-皇帝.jpg", keywords: ["权威", "结构", "控制", "父性"], meaning_upright: "建立秩序与规则，展现领导力，稳固的基础和理性的判断。", meaning_reversed: "暴政，死板，缺乏自律，滥用权力，失去控制。", description: "皇帝威严地坐在饰有公羊头的石座上，手持代表权力的十字球和权杖。" },
    { name: "教皇", nameEn: "The Hierophant", imgName: "5-教皇.jpg", keywords: ["信仰", "传统", "精神导师", "教育"], meaning_upright: "遵循传统与社会规范，寻求精神指导，学习与传承知识。", meaning_reversed: "挑战权威，打破常规，盲目顺从，思想僵化。", description: "教皇坐在神殿中，向两名信徒传授智慧，手结宗教印印记。" },
    { name: "恋人", nameEn: "The Lovers", imgName: "6-恋人.jpg", keywords: ["爱情", "和谐", "选择", "价值观"], meaning_upright: "深厚的感情联系，重要的选择，价值观的契合，美好的关系。", meaning_reversed: "关系失和，错误的选择，价值观冲突，逃避责任。", description: "亚当和夏娃站在伊甸园中，天使在上方祝福他们，背后是生命之树和知识之树。" },
    { name: "战车", nameEn: "The Chariot", imgName: "7-战车.jpg", keywords: ["意志", "胜利", "控制", "决心"], meaning_upright: "通过坚定的意志和自律克服困难，取得胜利，掌控前进的方向。", meaning_reversed: "失去方向，充满挫折感，失控，被冲突阻碍。", description: "一位战士驾驭着由一黑一白两只斯芬克斯拉动的战车，准备出征。" },
    { name: "力量", nameEn: "Strength", imgName: "8-力量.jpg", keywords: ["勇气", "耐心", "同情心", "内在力量"], meaning_upright: "以柔克刚的内在力量，通过耐心和爱心驯服内心的野兽。", meaning_reversed: "自我怀疑，软弱，屈服于恐惧，缺乏自控力。", description: "一位温柔的女性平静地安抚着一头狮子，她的头顶有着无限的符号。" },
    { name: "隐士", nameEn: "The Hermit", imgName: "9-隐士.jpg", keywords: ["内省", "孤独", "寻求指引", "智慧"], meaning_upright: "暂时退离喧嚣，向内寻找答案，深刻的自我反省和精神指引。", meaning_reversed: "过度孤立，逃避现实，拒绝他人帮助，感到迷茫。", description: "隐士独自站在雪山之巅，手持一盏装有六芒星的灯笼，照亮前方的路。" },
    { name: "命运之轮", nameEn: "Wheel of Fortune", imgName: "10-命运之轮.jpg", keywords: ["转折点", "命运", "循环", "运气"], meaning_upright: "生命中的重大转折，命运的推动，好运降临，无法避免的改变。", meaning_reversed: "运气不佳，抗拒改变，陷入僵局，无法掌控局势。", description: "巨大的轮盘在天空中旋转，四周环绕着代表四元素的神秘生物。" },
    { name: "正义", nameEn: "Justice", imgName: "11-正义.jpg", keywords: ["公平", "真相", "因果", "法律"], meaning_upright: "公平客观的裁决，为自己的行为负责，寻求真理与平衡。", meaning_reversed: "不公，偏见，逃避责任，不诚实的决定。", description: "正义女神端坐着，一手持剑代表裁决，一手持天平代表衡量。" },
    { name: "倒吊人", nameEn: "The Hanged Man", imgName: "12-倒吊人.jpg", keywords: ["牺牲", "暂停", "新视角", "顺从"], meaning_upright: "暂时的停滞，为了更高目标而做出的牺牲，换个角度看问题。", meaning_reversed: "无谓的牺牲，抗拒改变，陷入停滞，自私自利。", description: "一名男子被倒吊在T型树上，但他神情平静，头部有智慧的光环。" },
    { name: "死神", nameEn: "Death", imgName: "13-死神.jpg", keywords: ["结束", "转变", "重生", "放下"], meaning_upright: "旧事物的结束与新事物的开始，深刻的转变，放下不再服务于你的东西。", meaning_reversed: "抗拒改变，无法放下过去，停滞不前，恐惧结束。", description: "骑着白马的骷髅骑士宣告着不可避免的终结，远方太阳正在升起。" },
    { name: "节制", nameEn: "Temperance", imgName: "14-节制.jpg", keywords: ["平衡", "中庸", "耐心", "融合"], meaning_upright: "寻找生活中的平衡，耐心地整合不同元素，内心平静与和谐。", meaning_reversed: "极端，失衡，缺乏耐心，冲突与混乱。", description: "一位天使一只脚在水中，一只脚在岸上，将水在两个圣杯间倒来倒去。" },
    { name: "恶魔", nameEn: "The Devil", imgName: "15-恶魔.jpg", keywords: ["束缚", "沉迷", "物质主义", "阴暗面"], meaning_upright: "被物质或欲望束缚，不健康的沉迷，面对内心的恐惧与阴暗面。", meaning_reversed: "摆脱束缚，重获自由，克服瘾症，觉醒。", description: "恶魔坐在黑色立方体上，下方用松散的锁链拴着一男一女。" },
    { name: "塔", nameEn: "The Tower", imgName: "16-高塔.jpg", keywords: ["剧变", "灾难", "毁灭", "觉醒"], meaning_upright: "突如其来的毁灭性改变，建立在虚假基础上的事物崩塌，随之而来的觉醒。", meaning_reversed: "避免灾难，恐惧改变，拖延不可避免的结局。", description: "高塔被闪电击中，燃起熊熊大火，两个人从塔上坠落。" },
    { name: "星星", nameEn: "The Star", imgName: "17-星星.jpg", keywords: ["希望", "灵感", "治愈", "平静"], meaning_upright: "经历风暴后的平静与希望，充满灵感与指引，灵魂的治愈。", meaning_reversed: "绝望，缺乏信心，失去灵感，感到气馁。", description: "一位裸体女子在池水和陆地上倾倒圣水，天空中闪烁着七颗小星和一颗大星。" },
    { name: "月亮", nameEn: "The Moon", imgName: "18-月亮.jpg", keywords: ["幻觉", "恐惧", "潜意识", "直觉"], meaning_upright: "事物并非表面所见，隐藏的恐惧与不安，需要依靠直觉穿越迷雾。", meaning_reversed: "真相大白，克服恐惧，摆脱困惑，情绪平复。", description: "一轮满月悬挂在夜空，下方有狼和狗在嚎叫，一只龙虾从水中爬出。" },
    { name: "太阳", nameEn: "The Sun", imgName: "19-太阳.jpg", keywords: ["成功", "活力", "欢乐", "真相"], meaning_upright: "充满活力与欢乐，取得巨大的成功，真相大白，积极乐观的能量。", meaning_reversed: "短暂的悲伤，成功被延迟，过度乐观，缺乏热情。", description: "一个充满活力的孩子骑在白马上，身后是向日葵，上方是灿烂的太阳。" },
    { name: "审判", nameEn: "Judgement", imgName: "20-审判.jpg", keywords: ["觉醒", "重生", "内心的召唤", "宽恕"], meaning_upright: "倾听内心的召唤，深刻的自我觉醒，宽恕过去，迈向新的生命阶段。", meaning_reversed: "自我怀疑，忽视召唤，无法释怀，恐惧审判。", description: "大天使吹响号角，死者从棺木中站起，迎接新的精神生命。" },
    { name: "世界", nameEn: "The World", imgName: "21-世界.jpg", keywords: ["圆满", "达成", "旅行", "整体"], meaning_upright: "一个重要阶段的完美结束，目标的达成，内心的完整与和谐。", meaning_reversed: "未完成，缺乏成就感，拖延，感到空虚。", description: "一位女子在花环中起舞，四周环绕着代表四元素的神秘生物，象征着完美的循环。" }
];

const TAROT_DECK = [];
majorArcanaData.forEach((card, index) => {
    TAROT_DECK.push({ id: index, type: 'major', suit: null, suitName: null, element: null, ...card });
});

const suits = [
    { id: "Wands", name: "权杖", element: "火", meaning: "行动、热情、创造力" },
    { id: "Cups", name: "圣杯", element: "水", meaning: "情感、人际、直觉" },
    { id: "Swords", name: "宝剑", element: "风", meaning: "思想、冲突、挑战" },
    { id: "Pentacles", name: "星币", element: "土", meaning: "物质、财富、现实" }
];
const minorNamesMap = [
    { name: "ACE", fileRank: "1" },
    { name: "2", fileRank: "2" },
    { name: "3", fileRank: "3" },
    { name: "4", fileRank: "4" },
    { name: "5", fileRank: "5" },
    { name: "6", fileRank: "6" },
    { name: "7", fileRank: "7" },
    { name: "8", fileRank: "8" },
    { name: "9", fileRank: "9" },
    { name: "10", fileRank: "10" },
    { name: "侍从(Page)", fileRank: "侍从" },
    { name: "骑士(Knight)", fileRank: "骑士" },
    { name: "王后(Queen)", fileRank: "皇后" },
    { name: "国王(King)", fileRank: "国王" }
];

let cardId = 22;
suits.forEach(suit => {
    minorNamesMap.forEach((rankObj, index) => {
        TAROT_DECK.push({
            id: cardId++,
            name: `${suit.name}${rankObj.name}`,
            nameEn: `${rankObj.name} of ${suit.id}`,
            imgName: `${suit.name}${rankObj.fileRank}.jpg`,
            type: 'minor',
            suit: suit.id,
            suitName: suit.name,
            element: suit.element,
            keywords: [suit.element, suit.meaning, "小阿尔卡纳"],
            meaning_upright: `${suit.name}代表的${suit.meaning}能量在正位时的展现，意味着相关的积极发展。`,
            meaning_reversed: `${suit.name}代表的${suit.meaning}能量在逆位时的受阻，可能遇到相关的挑战。`,
            description: `一张展现了${suit.name}元素的牌，画面中包含了代表该元素的符号和场景。`
        });
    });
});

const SPREADS = {
    single: { name: "Single Card", cardCount: 1, positions: ["当下指引"], description: "快速获取当下最需要的启示，适合日常抽牌或明确的具体问题。" },
    two: { name: "Two Cards", cardCount: 2, positions: ["现状/问题", "建议/对策"], description: "简单直接的指引，帮助你看清当前局势并给出行动建议。" },
    three: { name: "Three Cards", cardCount: 3, positions: ["过去", "现在", "未来"], description: "洞察事件的发展脉络，了解过去的影响、当前的处境以及未来的趋势。" },
    relationship: { name: "Relationship", cardCount: 4, positions: ["你的状态", "对方状态", "关系现状", "未来发展"], description: "专门用于探索两人之间的关系状态、互动模式及未来走向。" },
    choice: { name: "Crossroads", cardCount: 4, positions: ["当前处境", "选择A的发展", "选择B的发展", "最终建议"], description: "当你面临两难选择时，揭示不同道路可能带来的结果。" },
    elements: { name: "Four Elements", cardCount: 4, positions: ["火·行动", "水·情感", "风·思维", "土·物质"], description: "全方位分析你的能量状态，平衡内在的行动力、情绪、理智与现实基础。" },
    career: { name: "Career Path", cardCount: 5, positions: ["目前状态", "潜在机会", "面临挑战", "未来发展", "综合建议"], description: "剖析你的职业发展道路，发现潜在机遇并应对职场挑战。" },
    hexagram: { name: "Hexagram", cardCount: 7, positions: ["过去", "现在", "未来", "阻碍", "环境", "建议", "结果"], description: "深入剖析复杂问题，揭示隐藏的阻碍与环境因素，并给出明确的行动建议。" },
    celtic: { name: "Celtic Cross", cardCount: 10, positions: ["现状", "阻碍", "基础", "过去", "目标", "未来", "自我", "环境", "希望/恐惧", "结果"], description: "最经典且全面的牌阵，层层剥开问题的核心，提供深度的灵魂指引与最终的走向预判。" },
    daily: { name: "Daily Fortune", cardCount: 1, positions: ["今日指引"], description: "专属每日运势，快速获取当天的核心建议与能量提醒。" },
    yesno: { name: "Yes Or No", cardCount: 3, positions: ["问题核心", "肯定方向", "否定方向"], description: "针对明确的是非问题，直观给出答案与背后逻辑。" },
    weekly: { name: "Weekly Fortune", cardCount: 6, positions: ["周一", "周二", "周三", "周四", "周五", "周末"], description: "预判一周整体运势，合理规划工作、生活与社交。" },
    venus: { name: "Venus Love", cardCount: 8, positions: ["你的想法", "对方想法", "你的行动", "对方行动", "关系优势", "关系隐患", "外部影响", "最终走向"], description: "经典情感牌阵，深度解析亲密关系的全方位状态与未来。" },
    breakup: { name: "Breakup & Repair", cardCount: 5, positions: ["分手原因", "你的状态", "对方状态", "复合可能", "最终建议"], description: "专注分手/冷战场景，分析复合概率与最佳处理方式。" },
    study: { name: "Study Luck", cardCount: 5, positions: ["学习现状", "优势能力", "薄弱环节", "提升方法", "考试结果"], description: "专为学生/备考者设计，分析学习状态与提分路径。" },
    wealth: { name: "Wealth Analysis", cardCount: 5, positions: ["财运现状", "正财来源", "偏财机会", "破财风险", "守财建议"], description: "全面分析个人财运，挖掘收入机会，规避财务风险。" },
    threechoices: { name: "Three Choices", cardCount: 5, positions: ["核心问题", "选择A", "选择B", "选择C", "最优解"], description: "面对三项选择时，清晰对比各路径结果，找到最佳决策。" },
    innerself: { name: "Inner Self", cardCount: 5, positions: ["外在表现", "内在真实", "隐藏情绪", "核心需求", "自我和解"], description: "探索内心真实世界，化解自我内耗，找到与自己和解的方式。" },
    growthblock: { name: "Growth Block", cardCount: 4, positions: ["卡点现状", "形成原因", "突破关键", "成长方向"], description: "找到人生/成长中的瓶颈，破解阻碍，明确前进方向。" },
    horseshoe: { name: "Horseshoe", cardCount: 6, positions: ["过去影响", "现在状态", "未来趋势", "助力因素", "阻碍因素", "最终结果"], description: "经典马蹄形牌阵，通用型运势分析，适配绝大多数问题。" },
    monthly: { name: "Monthly Fortune", cardCount: 8, positions: ["上旬", "中旬", "下旬", "事业重点", "财运重点", "情感重点", "人际提醒", "本月建议"], description: "精细化月度运势规划，全方位指导当月生活与决策。" }
};

const SPREAD_CATEGORIES = {
    quick:    { name: "Quick", description: "当下时刻的快捷指引", spreads: ["single", "two"] },
    daily:    { name: "Daily", description: "每日运势规划", spreads: ["daily", "weekly", "monthly"] },
    love:     { name: "Love", description: "感情关系", spreads: ["relationship", "venus", "breakup"] },
    career:   { name: "Career", description: "事业财富分析", spreads: ["career", "wealth"] },
    growth:   { name: "Growth", description: "决策成长分析", spreads: ["three", "choice", "threechoices", "growthblock", "innerself"] },
    deep:     { name: "Deep", description: "多维度分析复杂问题", spreads: ["elements", "yesno", "study", "horseshoe", "hexagram"] },
    master:   { name: "Master", description: "传统经典牌阵", spreads: ["celtic"] }
};
