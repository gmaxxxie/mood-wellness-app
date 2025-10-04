const express = require('express');
const router = express.Router();
const { prisma } = require('../database/client');

// 获取用户统计信息
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await prisma.user_statistics.findUnique({
      where: { user_id: parseInt(userId) },
      include: {
        favorite_solution_type_relation: {
          select: {
            type_name_zh: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: stats || {
        user_id: parseInt(userId),
        total_assessments: 0,
        total_recommendations_used: 0,
        average_mood_improvement: 0,
        streak_days: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: '获取用户统计失败',
    });
  }
});

module.exports = router;
