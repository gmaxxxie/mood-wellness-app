export const CATEGORY_METADATA = {
  positive_affect: {
    label: '积极情感',
    description: '关注积极情绪与资源状态，例如活力、满足感。',
  },
  negative_affect: {
    label: '消极情感',
    description: '探索紧张、烦躁、低落等负向体验，便于找出缓解路径。',
  },
  anxiety: {
    label: '焦虑体验',
    description: '聚焦担忧、紧绷与警觉感，评估焦虑强度。',
  },
  depression: {
    label: '抑郁体验',
    description: '观察兴趣降低与情绪低落的频率与持续性。',
  },
  situational: {
    label: '情境触发',
    description: '梳理当前事件或情境对情绪的直接影响。',
  },
  energy: {
    label: '精力状态',
    description: '了解身心能量水平，为调节策略提供依据。',
  },
  control: {
    label: '情绪控制力',
    description: '评估对情绪自我调节的信心与掌控感。',
  },
  cognitive_appraisal: {
    label: '认知评价',
    description: '识别思维模式，观察是否存在灾难化或正向重塑。',
  },
  environment: {
    label: '环境影响',
    description: '衡量身处环境（噪音、支持度等）对情绪造成的作用。',
  },
};

export const CATEGORY_LABELS = Object.fromEntries(
  Object.entries(CATEGORY_METADATA).map(([key, value]) => [key, value.label])
);

export const CATEGORY_DESCRIPTIONS = Object.fromEntries(
  Object.entries(CATEGORY_METADATA)
    .filter(([, value]) => Boolean(value.description))
    .map(([key, value]) => [key, value.description])
);

export const ASSESSMENT_FLOW = {
  stageOne: {
    categories: ['situational', 'energy', 'control'],
    label: '第 1 轮 · 身体与行为初筛',
    description: '先从身体感受与行为倾向入手，帮助你快速定位可能的情绪触发点。',
    triggers: {
      highStress: ['工作/学习压力', '家庭/亲子责任', '子女学习压力', '人际关系问题', '经济担忧', '社交场合', '健康担忧'],
      environment: ['工作/学习压力', '家庭/亲子责任', '子女学习压力', '社交场合', '健康担忧'],
      cognitive: ['没有特定原因', '其他'],
    },
  },
  stageTwo: {
    fallbackCategories: [
      'positive_affect',
      'negative_affect',
      'anxiety',
      'depression',
      'cognitive_appraisal',
      'environment',
    ],
    maxQuestionsPerCategory: 2,
    rules: [
      {
        id: 'environment_focus',
        categories: ['environment', 'negative_affect'],
        predicate: ({ environmentCue }) => environmentCue === true,
      },
      {
        id: 'cognitive_focus',
        categories: ['cognitive_appraisal', 'depression'],
        predicate: ({ cognitiveCue }) => cognitiveCue === true,
      },
      {
        id: 'low_control_or_energy_or_stress',
        categories: ['negative_affect', 'anxiety', 'depression', 'environment'],
        predicate: ({ controlScore, energyScore, highStressTrigger }) =>
          (Number.isFinite(controlScore) && controlScore <= 2) ||
          (Number.isFinite(energyScore) && energyScore <= 2) ||
          highStressTrigger === true,
      },
      {
        id: 'high_control_and_energy',
        categories: ['positive_affect'],
        predicate: ({ controlScore, energyScore }) =>
          Number.isFinite(controlScore) &&
          Number.isFinite(energyScore) &&
          controlScore >= 4 &&
          energyScore >= 4,
      },
      {
        id: 'default_balance',
        categories: ['positive_affect', 'negative_affect'],
        predicate: () => true,
      },
    ],
  },
};
