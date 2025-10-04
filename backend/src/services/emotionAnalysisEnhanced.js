const { prisma } = require('../database/client');

class EmotionAnalysisService {
  constructor() {
    // 基础情绪映射
    this.emotionMap = {
      1: 'happiness',
      2: 'sadness',
      3: 'anger',
      4: 'fear',
      5: 'surprise',
      6: 'disgust',
    };
  }

  /**
   * 获取评估问题
   */
  async getAssessmentQuestions() {
    return await prisma.assessment_questions.findMany({
      where: { is_active: true },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * 计算基础情绪得分
   */
  async calculateEmotionScores(responses, _questions) {
    const scores = {
      happiness: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
    };

    // 简单的评分逻辑
    Object.keys(responses).forEach((key) => {
      const value = parseFloat(responses[key]) || 0;
      if (value > 7) {
        scores.happiness += 0.3;
      } else if (value < 3) {
        scores.sadness += 0.3;
        scores.anger += 0.2;
      } else if (value < 5) {
        scores.fear += 0.2;
      }
    });

    return scores;
  }

  /**
   * 分析语言模式
   */
  async analyzeLinguisticPatterns(responses) {
    const totalResponses = responses ? Object.keys(responses).length : 0;
    const confidence = Math.min(0.5 + totalResponses * 0.05, 0.9);

    return {
      indicators: ['positive', 'neutral'],
      confidence,
    };
  }

  /**
   * 分析行为模式
   */
  analyzeBehaviorPatterns(_responses, _metadata) {
    return {
      patterns: ['normal_response_time'],
      indicators: ['engaged'],
    };
  }

  /**
   * 分析认知模式
   */
  analyzeCognitivePatterns(_responses) {
    return {
      biases: ['none_detected'],
      patterns: ['balanced_thinking'],
    };
  }

  /**
   * 推断情绪状态
   */
  inferEmotionalState(analyses) {
    const finalScores = analyses.basic;
    return {
      finalScores,
      reasoning: ['基于回答模式分析', '综合多维度指标'],
      language: analyses.language,
      behavior: analyses.behavior,
      cognitive: analyses.cognitive,
    };
  }

  /**
   * 确定主要情绪
   */
  async determinePrimaryEmotionEnhanced(inferredEmotion) {
    const scores = inferredEmotion.finalScores;
    let maxEmotion = 'happiness';
    let maxScore = scores.happiness;

    Object.keys(scores).forEach((emotion) => {
      if (scores[emotion] > maxScore) {
        maxScore = scores[emotion];
        maxEmotion = emotion;
      }
    });

    // 返回对应的情绪分类ID
    const emotionCategories = await prisma.emotion_categories.findMany({
      where: { is_primary: true },
    });

    const matchedPrimary = emotionCategories.find((category) => {
      return category.name?.toLowerCase() === maxEmotion;
    });

    if (matchedPrimary) {
      return matchedPrimary.id;
    }

    const fallback = Object.entries(this.emotionMap).find(([, name]) => name === maxEmotion);

    return fallback ? parseInt(fallback[0], 10) : emotionCategories[0]?.id || 1;
  }

  /**
   * 确定次要情绪
   */
  async determineSecondaryEmotion(scores, primaryId) {
    const primaryEmotionName = this.emotionMap[primaryId];
    const sortedEmotions = Object.entries(scores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([name]) => name);

    const secondaryName = sortedEmotions.find((name) => name !== primaryEmotionName);
    if (!secondaryName) {
      return primaryId;
    }

    const matched = Object.entries(this.emotionMap).find(([, name]) => name === secondaryName);
    return matched ? parseInt(matched[0], 10) : primaryId;
  }

  /**
   * 计算强度等级
   */
  calculateIntensityLevelEnhanced(inferredEmotion) {
    const scores = Object.values(inferredEmotion.finalScores);
    const maxScore = Math.max(...scores);
    return Math.min(Math.max(Math.round(maxScore * 10), 1), 10);
  }

  /**
   * 计算置信度
   */
  calculateConfidenceEnhanced(inferredEmotion, responses) {
    const responseCount = responses ? Object.keys(responses).length : 0;
    return Math.min((responseCount / 10) * 0.8 + 0.2, 1.0);
  }

  /**
   * 获取上下文推荐
   */
  async getContextualRecommendations(emotionId, intensity, inferredEmotion) {
    if (!emotionId) {
      return {
        primary_recommendations: [],
        contextual_adjustments: ['未识别到主要情绪，建议重新进行评估以获取更准确的推荐。'],
        rationale: inferredEmotion.reasoning,
      };
    }

    const mappings = await prisma.emotion_solution_mapping.findMany({
      where: { emotion_category_id: emotionId },
      include: {
        solution: {
          include: { solution_type: true },
        },
      },
      orderBy: [{ effectiveness_weight: 'desc' }, { priority_order: 'asc' }],
    });

    const normalizedIntensity = Number.isFinite(intensity) ? intensity : 5;

    const recommendations = mappings
      .map((mapping) => {
        if (!mapping.solution) {
          return null;
        }

        let score = Number(mapping.effectiveness_weight) || 1;
        const difficulty = mapping.solution.difficulty_level || 3;

        if (normalizedIntensity >= 7 && difficulty <= 2) {
          score += 0.3;
        }

        if (normalizedIntensity <= 4 && difficulty >= 3) {
          score += 0.2;
        }

        return {
          id: mapping.solution.id,
          title: mapping.solution.title_zh || mapping.solution.title,
          description: mapping.solution.description_zh || mapping.solution.description,
          instructions: mapping.solution.instructions_zh || mapping.solution.instructions,
          type: {
            id: mapping.solution.solution_type?.id,
            name:
              mapping.solution.solution_type?.type_name_zh ||
              mapping.solution.solution_type?.type_name,
            icon: mapping.solution.solution_type?.icon,
            color: mapping.solution.solution_type?.color,
          },
          duration_minutes: mapping.solution.duration_minutes,
          difficulty_level: difficulty,
          effectiveness_score: mapping.solution.effectiveness_score,
          tags: mapping.solution.tags,
          resource_url: mapping.solution.resource_url,
          recommendation_score: Math.round(score * 100) / 100,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, 4);

    const contextualAdjustments = [];

    if (normalizedIntensity >= 7) {
      contextualAdjustments.push(
        '当前情绪强度较高，优先选择时长较短、操作步骤简单的方案帮助快速稳定情绪。'
      );
    } else if (normalizedIntensity <= 3) {
      contextualAdjustments.push('情绪强度适中，可以尝试更深入或进阶的舒缓练习以巩固情绪弹性。');
    }

    const behaviorPatterns = Array.isArray(inferredEmotion?.behavior?.patterns)
      ? inferredEmotion.behavior.patterns
      : [];

    if (behaviorPatterns.length && !behaviorPatterns.includes('normal_response_time')) {
      contextualAdjustments.push('回答节奏存在波动，建议在使用方案时专注呼吸，慢慢进入练习节奏。');
    }

    if (!contextualAdjustments.length) {
      contextualAdjustments.push(
        '可按个人喜好从推荐列表中进行尝试，并记录使用后感受以便持续优化。'
      );
    }

    return {
      primary_recommendations: recommendations,
      contextual_adjustments: contextualAdjustments,
      rationale: inferredEmotion.reasoning,
    };
  }

  /**
   * 增强的情绪分析主方法
   */
  async analyzeEmotionEnhanced(responses, metadata = {}, assessmentType = 'quick') {
    try {
      // 1. 基础情绪得分计算
      const questions = await this.getAssessmentQuestions();
      const basicScores = await this.calculateEmotionScores(responses, questions);

      // 2. 语言模式分析
      const languageAnalysis = await this.analyzeLinguisticPatterns(responses);

      // 3. 行为模式分析
      const behaviorAnalysis = this.analyzeBehaviorPatterns(responses, metadata);

      // 4. 认知模式推断
      const cognitiveAnalysis = this.analyzeCognitivePatterns(responses);

      // 5. 综合推断情绪状态
      const inferredEmotion = this.inferEmotionalState({
        basic: basicScores,
        language: languageAnalysis,
        behavior: behaviorAnalysis,
        cognitive: cognitiveAnalysis,
      });

      const primaryEmotion = await this.determinePrimaryEmotionEnhanced(inferredEmotion);
      const intensityLevel = this.calculateIntensityLevelEnhanced(inferredEmotion);
      const confidenceScore = this.calculateConfidenceEnhanced(inferredEmotion, responses);

      return {
        emotion_scores: inferredEmotion.finalScores,
        primary_emotion: primaryEmotion,
        secondary_emotion: await this.determineSecondaryEmotion(
          inferredEmotion.finalScores,
          primaryEmotion
        ),
        intensity_level: intensityLevel,
        confidence_score: confidenceScore,
        analysis_details: {
          language_indicators: languageAnalysis.indicators,
          behavior_patterns: behaviorAnalysis.patterns,
          cognitive_biases: cognitiveAnalysis.biases,
          inference_reasoning: inferredEmotion.reasoning,
        },
        recommendations: await this.getContextualRecommendations(
          primaryEmotion,
          intensityLevel,
          inferredEmotion
        ),
        analysis_type: assessmentType,
      };
    } catch (error) {
      console.error('Enhanced emotion analysis error:', error);
      throw new Error('Failed to analyze emotion with enhanced method');
    }
  }

  /**
   * 语音情绪分析
   */
  async analyzeVoiceEmotion(input) {
    const transcription = typeof input === 'string' ? input : input?.transcription || '';

    if (!transcription.trim()) {
      return {
        detected_emotion: 'neutral',
        intensity_level: 1,
        confidence_score: 0.2,
        keyword_matches: {},
        transcription: '',
      };
    }

    const emotionKeywords = {
      happiness: ['开心', '高兴', '快乐', '兴奋', '满足', 'good', 'great', 'happy', 'wonderful'],
      sadness: ['难过', '伤心', '沮丧', '失望', '痛苦', 'sad', 'upset', 'depressed'],
      anger: ['生气', '愤怒', '烦躁', '恼火', '气', 'angry', 'mad', 'frustrated'],
      fear: ['害怕', '担心', '紧张', '焦虑', '恐惧', 'worried', 'anxious', 'nervous'],
      stress: ['压力', '疲惫', '累', '紧绷', '忙不过来', 'stressed', 'overwhelmed'],
      surprise: ['惊讶', '意外', '没想到', 'surprised'],
    };

    const normalized = transcription.toLowerCase();
    const matches = {};

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      matches[emotion] = keywords.reduce((count, keyword) => {
        const normalizedKeyword = keyword.toLowerCase();
        return (
          count +
          (normalized.includes(normalizedKeyword) || transcription.includes(keyword) ? 1 : 0)
        );
      }, 0);
    });

    const sorted = Object.entries(matches).sort(([, a], [, b]) => b - a);
    const [topEmotion, topScore] = sorted[0] || ['neutral', 0];
    const totalMatches = sorted.reduce((sum, [, value]) => sum + value, 0);

    const intensity = Math.min(Math.max(topScore * 2, totalMatches ? 2 : 1), 10);
    const confidence = totalMatches ? Math.min(topScore / totalMatches + 0.3, 1) : 0.3;

    return {
      detected_emotion: topEmotion,
      intensity_level: intensity,
      confidence_score: Math.round(confidence * 100) / 100,
      keyword_matches: matches,
      transcription,
    };
  }
}

module.exports = EmotionAnalysisService;
