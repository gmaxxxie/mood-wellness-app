const express = require('express');
const router = express.Router();
const { prisma } = require('../database/client');

// 获取推荐解决方案
router.post('/recommendations', async (req, res) => {
  try {
    const { emotion_id, intensity_level, user_preferences = {}, limit = 6 } = req.body;

    if (!emotion_id) {
      return res.status(400).json({
        success: false,
        error: '情绪ID不能为空',
      });
    }

    // 获取基于情绪的解决方案映射
    const mappings = await prisma.emotion_solution_mapping.findMany({
      where: { emotion_category_id: parseInt(emotion_id) },
      include: {
        solution: {
          include: {
            solution_type: true,
          },
        },
      },
      orderBy: [{ effectiveness_weight: 'desc' }, { priority_order: 'asc' }],
    });

    // 根据用户偏好和强度等级过滤和排序
    let recommendations = mappings.map((mapping) => {
      const solution = mapping.solution;
      let score = mapping.effectiveness_weight;

      // 根据强度等级调整推荐
      if (intensity_level >= 7 && solution.difficulty_level <= 2) {
        score += 0.2; // 高强度情绪偏好简单方法
      } else if (intensity_level <= 4 && solution.difficulty_level >= 3) {
        score += 0.1; // 低强度情绪可以尝试复杂方法
      }

      // 根据用户偏好调整
      if (
        user_preferences.preferred_types &&
        user_preferences.preferred_types.includes(solution.type_id)
      ) {
        score += 0.3;
      }

      if (user_preferences.time_limit && solution.duration_minutes <= user_preferences.time_limit) {
        score += 0.1;
      }

      return {
        id: solution.id,
        title: solution.title_zh || solution.title,
        description: solution.description_zh || solution.description,
        instructions: solution.instructions_zh || solution.instructions,
        type: {
          id: solution.solution_type.id,
          name: solution.solution_type.type_name_zh || solution.solution_type.type_name,
          icon: solution.solution_type.icon,
          color: solution.solution_type.color,
        },
        duration_minutes: solution.duration_minutes,
        difficulty_level: solution.difficulty_level,
        effectiveness_score: solution.effectiveness_score,
        tags: solution.tags,
        resource_url: solution.resource_url,
        recommendation_score: score,
      };
    });

    // 排序并限制数量
    recommendations.sort((a, b) => b.recommendation_score - a.recommendation_score);
    recommendations = recommendations.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        recommendations,
        total_available: mappings.length,
        criteria: {
          emotion_id: parseInt(emotion_id),
          intensity_level,
          user_preferences,
        },
      },
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: '获取推荐失败',
    });
  }
});

// 获取所有解决方案类型
router.get('/types', async (req, res) => {
  try {
    const types = await prisma.solution_types.findMany({
      select: {
        id: true,
        type_name: true,
        type_name_zh: true,
        description: true,
        icon: true,
        color: true,
      },
      orderBy: { id: 'asc' },
    });

    res.json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error('Error fetching solution types:', error);
    res.status(500).json({
      success: false,
      error: '获取解决方案类型失败',
    });
  }
});

// 获取特定类型的所有解决方案
router.get('/by-type/:typeId', async (req, res) => {
  try {
    const { typeId } = req.params;
    const { difficulty, duration } = req.query;

    let whereClause = {
      type_id: parseInt(typeId),
      is_active: true,
    };

    if (difficulty) {
      whereClause.difficulty_level = parseInt(difficulty);
    }

    if (duration) {
      whereClause.duration_minutes = { lte: parseInt(duration) };
    }

    const solutions = await prisma.solutions.findMany({
      where: whereClause,
      include: {
        solution_type: true,
      },
      orderBy: [{ effectiveness_score: 'desc' }, { usage_count: 'desc' }],
    });

    const formattedSolutions = solutions.map((solution) => ({
      id: solution.id,
      title: solution.title_zh || solution.title,
      description: solution.description_zh || solution.description,
      instructions: solution.instructions_zh || solution.instructions,
      type: {
        name: solution.solution_type.type_name_zh || solution.solution_type.type_name,
        icon: solution.solution_type.icon,
        color: solution.solution_type.color,
      },
      duration_minutes: solution.duration_minutes,
      difficulty_level: solution.difficulty_level,
      effectiveness_score: solution.effectiveness_score,
      usage_count: solution.usage_count,
      tags: solution.tags,
      resource_url: solution.resource_url,
    }));

    res.json({
      success: true,
      data: formattedSolutions,
    });
  } catch (error) {
    console.error('Error fetching solutions by type:', error);
    res.status(500).json({
      success: false,
      error: '获取解决方案失败',
    });
  }
});

// 记录解决方案使用和反馈
router.post('/usage', async (req, res) => {
  try {
    const { solution_id, user_id, assessment_id, effectiveness_rating, user_feedback, completed } =
      req.body;

    if (!solution_id) {
      return res.status(400).json({
        success: false,
        error: '解决方案ID不能为空',
      });
    }

    // 获取或创建测试用户
    let actualUserId = null;
    if (user_id) {
      const user = await prisma.users.findUnique({
        where: { id: parseInt(user_id) },
      });
      if (user) {
        actualUserId = parseInt(user_id);
      } else {
        // 如果用户不存在，创建一个默认测试用户
        const testUser = await prisma.users.upsert({
          where: { username: 'test_user' },
          update: {},
          create: {
            username: 'test_user',
            email: 'test@example.com',
            password_hash: 'test_hash',
          },
        });
        actualUserId = testUser.id;
      }
    }

    // 记录使用情况
    const recommendation = await prisma.recommendations.create({
      data: {
        user_id: actualUserId,
        assessment_id: assessment_id ? parseInt(assessment_id) : null,
        solution_id: parseInt(solution_id),
        is_accepted: true,
        completed_at: completed ? new Date() : null,
        effectiveness_rating: effectiveness_rating ? parseInt(effectiveness_rating) : null,
        user_feedback,
      },
    });

    // 更新解决方案使用计数
    await prisma.solutions.update({
      where: { id: parseInt(solution_id) },
      data: {
        usage_count: { increment: 1 },
      },
    });

    // 如果有效果评分，更新平均效果分数
    if (effectiveness_rating) {
      const allRatings = await prisma.recommendations.findMany({
        where: {
          solution_id: parseInt(solution_id),
          effectiveness_rating: { not: null },
        },
        select: { effectiveness_rating: true },
      });

      const avgRating =
        allRatings.reduce((sum, r) => sum + r.effectiveness_rating, 0) / allRatings.length;

      await prisma.solutions.update({
        where: { id: parseInt(solution_id) },
        data: {
          effectiveness_score: avgRating / 5, // 转换为0-1范围
        },
      });
    }

    res.json({
      success: true,
      data: {
        recommendation_id: recommendation.id,
        message: '使用记录已保存',
      },
    });
  } catch (error) {
    console.error('Error recording solution usage:', error);
    res.status(500).json({
      success: false,
      error: '记录使用情况失败',
    });
  }
});

// 获取解决方案详情
router.get('/:solutionId', async (req, res) => {
  try {
    const { solutionId } = req.params;

    const solution = await prisma.solutions.findUnique({
      where: { id: parseInt(solutionId) },
      include: {
        solution_type: true,
      },
    });

    if (!solution) {
      return res.status(404).json({
        success: false,
        error: '解决方案不存在',
      });
    }

    // 获取用户反馈统计
    const feedbackStats = await prisma.recommendations.groupBy({
      by: ['effectiveness_rating'],
      where: {
        solution_id: parseInt(solutionId),
        effectiveness_rating: { not: null },
      },
      _count: { effectiveness_rating: true },
    });

    const formattedSolution = {
      id: solution.id,
      title: solution.title_zh || solution.title,
      description: solution.description_zh || solution.description,
      instructions: solution.instructions_zh || solution.instructions,
      type: {
        id: solution.solution_type.id,
        name: solution.solution_type.type_name_zh || solution.solution_type.type_name,
        icon: solution.solution_type.icon,
        color: solution.solution_type.color,
      },
      duration_minutes: solution.duration_minutes,
      difficulty_level: solution.difficulty_level,
      effectiveness_score: solution.effectiveness_score,
      usage_count: solution.usage_count,
      tags: solution.tags,
      resource_url: solution.resource_url,
      feedback_stats: feedbackStats,
    };

    res.json({
      success: true,
      data: formattedSolution,
    });
  } catch (error) {
    console.error('Error fetching solution details:', error);
    res.status(500).json({
      success: false,
      error: '获取解决方案详情失败',
    });
  }
});

module.exports = router;
