const express = require('express');
const { body, validationResult } = require('express-validator');
const EmotionAnalysisService = require('../services/emotionAnalysisEnhanced');
const router = express.Router();
const { prisma } = require('../database/client');
const emotionService = new EmotionAnalysisService();

// 获取评估问题
router.get('/questions', async (req, res) => {
  try {
    const questions = await prisma.assessment_questions.findMany({
      where: { is_active: true },
      select: {
        id: true,
        question_text: true,
        question_text_zh: true,
        question_type: true,
        category: true,
        options: true,
        weight: true,
      },
      orderBy: { id: 'asc' },
    });

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: '获取问题失败',
    });
  }
});

// 获取情绪标签
router.get('/tags', async (req, res) => {
  try {
    const tags = await prisma.emotion_tags.findMany({
      include: {
        emotion_category: {
          select: {
            name: true,
            name_zh: true,
            color_code: true,
          },
        },
      },
      orderBy: [{ category_id: 'asc' }, { intensity_level: 'desc' }],
    });

    // 按类别分组
    const groupedTags = tags.reduce((groups, tag) => {
      const categoryId = tag.category_id;
      if (!groups[categoryId]) {
        groups[categoryId] = {
          category: tag.emotion_category,
          tags: [],
        };
      }
      groups[categoryId].tags.push({
        id: tag.id,
        name: tag.tag_name_zh || tag.tag_name,
        intensity: tag.intensity_level,
      });
      return groups;
    }, {});

    res.json({
      success: true,
      data: Object.values(groupedTags),
    });
  } catch (error) {
    console.error('Error fetching emotion tags:', error);
    res.status(500).json({
      success: false,
      error: '获取情绪标签失败',
    });
  }
});

// 提交评估并获取分析结果
router.post(
  '/submit',
  [
    body('responses').isObject().withMessage('回答数据必须是对象'),
    body('assessment_type')
      .optional()
      .isIn(['quick', 'detailed', 'voice'])
      .withMessage('评估类型无效'),
    body('metadata').optional().isObject().withMessage('元数据必须是对象'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: '数据验证失败',
          details: errors.array(),
        });
      }

      const { responses, assessment_type = 'quick', metadata = {}, user_id } = req.body;

      // 执行增强的情绪分析
      const analysis = await emotionService.analyzeEmotionEnhanced(
        responses,
        metadata,
        assessment_type
      );

      // 保存评估记录
      let assessmentRecord = null;
      if (user_id) {
        assessmentRecord = await prisma.user_assessments.create({
          data: {
            user_id: parseInt(user_id),
            assessment_type,
            responses: responses,
            emotion_scores: analysis.emotion_scores,
            primary_emotion: analysis.primary_emotion,
            secondary_emotion: analysis.secondary_emotion,
            intensity_level: analysis.intensity_level,
            confidence_score: analysis.confidence_score,
          },
        });
      }

      res.json({
        success: true,
        data: {
          assessment_id: assessmentRecord?.id,
          ...analysis,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error processing assessment:', error);
      res.status(500).json({
        success: false,
        error: '情绪分析处理失败',
        message: error.message,
      });
    }
  }
);

// 语音情绪分析
router.post(
  '/voice-analysis',
  [body('transcription').notEmpty().withMessage('语音转录文本不能为空')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: '数据验证失败',
          details: errors.array(),
        });
      }

      const { transcription, user_id, audio_metadata: _audio_metadata } = req.body;

      // 语音情绪分析
      const voiceAnalysis = await emotionService.analyzeVoiceEmotion(transcription);

      // 保存语音记录
      if (user_id) {
        await prisma.voice_records.create({
          data: {
            user_id: parseInt(user_id),
            transcription,
            emotion_analysis: voiceAnalysis,
            processing_status: 'completed',
          },
        });
      }

      res.json({
        success: true,
        data: voiceAnalysis,
      });
    } catch (error) {
      console.error('Error processing voice analysis:', error);
      res.status(500).json({
        success: false,
        error: '语音情绪分析失败',
      });
    }
  }
);

// 获取用户历史评估
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const assessments = await prisma.user_assessments.findMany({
      where: { user_id: parseInt(userId) },
      include: {
        primary_emotion_category: {
          select: {
            name: true,
            name_zh: true,
            color_code: true,
          },
        },
        secondary_emotion_category: {
          select: {
            name: true,
            name_zh: true,
            color_code: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    res.json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({
      success: false,
      error: '获取评估历史失败',
    });
  }
});

module.exports = router;
