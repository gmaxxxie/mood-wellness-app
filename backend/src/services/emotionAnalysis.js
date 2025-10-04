const { prisma } = require('../database/client');

class EmotionAnalysisService {
  constructor() {
    // PANAS量表权重 - 基于科学研究的系数
    this.panasWeights = {
      positive_affect: {
        enthusiastic: 0.85,
        alert: 0.75,
        determined: 0.8,
        excited: 0.9,
        inspired: 0.88,
        strong: 0.78,
        active: 0.82,
      },
      negative_affect: {
        distressed: 0.85,
        upset: 0.8,
        nervous: 0.83,
        anxious: 0.88,
        irritable: 0.75,
        hostile: 0.82,
        afraid: 0.87,
      },
    };

    // 情绪强度阈值
    this.intensityThresholds = {
      low: { min: 1, max: 3 },
      moderate: { min: 4, max: 6 },
      high: { min: 7, max: 10 },
    };
  }

  /**
   * 分析用户评估响应并确定情绪状态
   * @param {Object} responses - 用户的问题回答
   * @param {string} assessmentType - 评估类型 ('quick', 'detailed', 'voice')
   * @returns {Object} 情绪分析结果
   */
  async analyzeEmotion(responses, assessmentType = 'quick') {
    try {
      const questions = await this.getAssessmentQuestions();
      const emotionScores = await this.calculateEmotionScores(responses, questions);
      const primaryEmotion = await this.determinePrimaryEmotion(emotionScores);
      const intensityLevel = this.calculateIntensityLevel(emotionScores);
      const confidenceScore = this.calculateConfidenceScore(responses, emotionScores);

      return {
        emotion_scores: emotionScores,
        primary_emotion: primaryEmotion,
        secondary_emotion: await this.determineSecondaryEmotion(emotionScores, primaryEmotion),
        intensity_level: intensityLevel,
        confidence_score: confidenceScore,
        analysis_type: assessmentType,
        recommendations: await this.getInitialRecommendations(primaryEmotion),
      };
    } catch (error) {
      console.error('Emotion analysis error:', error);
      throw new Error('Failed to analyze emotion');
    }
  }

  /**
   * 计算各情绪维度的得分
   * @param {Object} responses - 用户回答
   * @param {Array} questions - 问题列表
   * @returns {Object} 情绪得分对象
   */
  async calculateEmotionScores(responses, questions) {
    const scores = {
      positive_affect: 0,
      negative_affect: 0,
      anxiety: 0,
      depression: 0,
      stress: 0,
      energy: 0,
      control: 0,
    };

    let categoryWeights = {
      positive_affect: 0,
      negative_affect: 0,
      anxiety: 0,
      depression: 0,
      stress: 0,
      energy: 0,
      control: 0,
    };

    // 遍历用户回答，计算加权得分
    for (const [questionId, response] of Object.entries(responses)) {
      const question = questions.find((q) => q.id.toString() === questionId);
      if (!question) {
        continue;
      }

      const category = question.category;
      const weight = question.weight || 1.0;
      const normalizedScore = this.normalizeResponse(response, question);

      scores[category] += normalizedScore * weight;
      categoryWeights[category] += weight;
    }

    // 标准化得分 (0-1范围)
    for (const category in scores) {
      if (categoryWeights[category] > 0) {
        scores[category] = scores[category] / categoryWeights[category] / 5; // 假设最大值为5
        scores[category] = Math.max(0, Math.min(1, scores[category])); // 确保在0-1范围内
      }
    }

    return scores;
  }

  /**
   * 标准化用户回答
   * @param {*} response - 用户回答
   * @param {Object} question - 问题对象
   * @returns {number} 标准化得分
   */
  normalizeResponse(response, question) {
    switch (question.question_type) {
      case 'scale':
        return parseFloat(response) || 0;
      case 'multiple_choice':
        // 根据选项转换为数值
        return this.convertChoiceToScore(response, question);
      case 'boolean':
        return response ? 5 : 1;
      default:
        return 0;
    }
  }

  /**
   * 将多选答案转换为得分
   * @param {string} choice - 用户选择
   * @param {Object} question - 问题对象
   * @returns {number} 得分
   */
  convertChoiceToScore(choice, question) {
    const options = question.options?.options || question.options?.options_zh || [];
    const index = options.indexOf(choice);

    if (index === -1) {
      return 0;
    }

    // 根据问题类型调整得分逻辑
    if (question.category === 'energy') {
      return index + 1; // 1-5得分
    } else if (question.category === 'situational') {
      // 情境问题根据严重程度得分
      const severityMap = {
        'Work/Study stress': 4,
        'Relationship issues': 4,
        'Health concerns': 5,
        'Financial worries': 4,
        'Social situations': 3,
        'No specific trigger': 1,
        Other: 3,
      };
      return severityMap[choice] || 3;
    }

    return index + 1;
  }

  /**
   * 确定主要情绪
   * @param {Object} emotionScores - 情绪得分
   * @returns {number} 主要情绪的ID
   */
  async determinePrimaryEmotion(emotionScores) {
    // 根据PANAS和其他量表得分确定主要情绪
    const { positive_affect, negative_affect, anxiety, depression, stress } = emotionScores;

    // 获取情绪类别映射
    const emotions = await prisma.emotion_categories.findMany({
      where: { is_primary: true },
    });

    let primaryEmotionId = 1; // 默认为快乐

    // 检查消极情绪
    if (depression > 0.6) {
      primaryEmotionId = emotions.find((e) => e.name === 'sadness')?.id || 2;
    } else if (anxiety > 0.6 || stress > 0.6) {
      primaryEmotionId = emotions.find((e) => e.name === 'fear')?.id || 4;
    } else if (negative_affect > 0.7) {
      primaryEmotionId = emotions.find((e) => e.name === 'anger')?.id || 3;
    } else if (positive_affect > 0.6) {
      primaryEmotionId = emotions.find((e) => e.name === 'happiness')?.id || 1;
    } else {
      // 中性状态，选择得分最高的情绪
      const scoreMap = {
        [emotions.find((e) => e.name === 'happiness')?.id || 1]: positive_affect,
        [emotions.find((e) => e.name === 'sadness')?.id || 2]: depression,
        [emotions.find((e) => e.name === 'anger')?.id || 3]: negative_affect * 0.8,
        [emotions.find((e) => e.name === 'fear')?.id || 4]: Math.max(anxiety, stress),
      };

      primaryEmotionId = Object.entries(scoreMap).reduce((a, b) =>
        scoreMap[a[0]] > scoreMap[b[0]] ? a : b
      )[0];
    }

    return parseInt(primaryEmotionId);
  }

  /**
   * 确定次要情绪
   * @param {Object} emotionScores - 情绪得分
   * @param {number} primaryEmotionId - 主要情绪ID
   * @returns {number} 次要情绪的ID
   */
  async determineSecondaryEmotion(emotionScores, primaryEmotionId) {
    // 获取扩展情绪类别
    const secondaryEmotions = await prisma.emotion_categories.findMany({
      where: {
        is_primary: false,
        id: { not: primaryEmotionId },
      },
    });

    const { anxiety, stress, negative_affect } = emotionScores;

    // 根据得分确定次要情绪
    if (anxiety > 0.4) {
      return secondaryEmotions.find((e) => e.name === 'anxiety')?.id;
    } else if (stress > 0.4) {
      return secondaryEmotions.find((e) => e.name === 'stress')?.id;
    } else if (negative_affect > 0.4) {
      return secondaryEmotions.find((e) => e.name === 'frustration')?.id;
    }

    return null;
  }

  /**
   * 计算情绪强度等级
   * @param {Object} emotionScores - 情绪得分
   * @returns {number} 强度等级 (1-10)
   */
  calculateIntensityLevel(emotionScores) {
    const maxScore = Math.max(...Object.values(emotionScores));

    // 将0-1的得分转换为1-10的强度等级
    const intensity = Math.ceil(maxScore * 10);
    return Math.max(1, Math.min(10, intensity));
  }

  /**
   * 计算置信度得分
   * @param {Object} responses - 用户回答
   * @param {Object} emotionScores - 情绪得分
   * @returns {number} 置信度 (0-1)
   */
  calculateConfidenceScore(responses, emotionScores) {
    const responseCount = Object.keys(responses).length;
    const scoreVariance = this.calculateVariance(Object.values(emotionScores));

    // 基于回答数量和得分一致性计算置信度
    const completenessScore = Math.min(responseCount / 10, 1); // 假设10个问题为完整
    const consistencyScore = Math.max(0, 1 - scoreVariance * 2); // 方差越小，一致性越高

    return completenessScore * 0.6 + consistencyScore * 0.4;
  }

  /**
   * 计算数组的方差
   * @param {Array} values - 数值数组
   * @returns {number} 方差
   */
  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * 获取评估问题
   * @returns {Array} 问题列表
   */
  async getAssessmentQuestions() {
    return await prisma.assessment_questions.findMany({
      where: { is_active: true },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * 获取初步推荐
   * @param {number} emotionId - 情绪ID
   * @returns {Array} 推荐列表
   */
  async getInitialRecommendations(emotionId) {
    const mappings = await prisma.emotion_solution_mapping.findMany({
      where: { emotion_category_id: emotionId },
      include: {
        solution: {
          include: { solution_type: true },
        },
      },
      orderBy: [{ effectiveness_weight: 'desc' }, { priority_order: 'asc' }],
      take: 4, // 返回前4个推荐
    });

    return mappings.map((mapping) => ({
      solution_id: mapping.solution.id,
      title: mapping.solution.title_zh || mapping.solution.title,
      type: mapping.solution.solution_type.type_name_zh,
      duration: mapping.solution.duration_minutes,
      difficulty: mapping.solution.difficulty_level,
      effectiveness_weight: mapping.effectiveness_weight,
      tags: mapping.solution.tags,
    }));
  }

  /**
   * 语音情绪分析 (简化版本)
   * @param {string} transcription - 语音转文字
   * @returns {Object} 情绪分析结果
   */
  async analyzeVoiceEmotion(transcription) {
    // 简化的关键词情绪分析
    const emotionKeywords = {
      happiness: [
        '开心',
        '高兴',
        '快乐',
        '兴奋',
        '满足',
        '好',
        '棒',
        'amazing',
        'happy',
        'great',
        'wonderful',
      ],
      sadness: ['难过', '伤心', '沮丧', '失望', '痛苦', 'sad', 'upset', 'disappointed', 'hurt'],
      anger: ['生气', '愤怒', '烦躁', '恼火', '气', 'angry', 'frustrated', 'annoyed', 'mad'],
      fear: ['害怕', '担心', '紧张', '焦虑', '恐惧', 'scared', 'worried', 'anxious', 'nervous'],
      stress: ['压力', '累', '疲惫', '忙', 'overwhelmed', 'stressed', 'tired', 'exhausted'],
    };

    const scores = {};
    const text = transcription.toLowerCase();

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      scores[emotion] = keywords.reduce((count, keyword) => {
        return count + (text.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
    }

    const maxEmotion = Object.entries(scores).reduce((a, b) =>
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];
    const intensity = Math.min(Math.max(scores[maxEmotion] * 2, 1), 10);

    return {
      detected_emotion: maxEmotion,
      intensity_level: intensity,
      confidence_score: Math.min(scores[maxEmotion] / 5, 1),
      keyword_matches: scores,
    };
  }
}

module.exports = EmotionAnalysisService;
