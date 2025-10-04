const express = require('express');
const router = express.Router();
const { prisma } = require('../database/client');

// 获取所有情绪分类
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.emotion_categories.findMany({
      include: {
        emotion_tags: {
          select: {
            id: true,
            tag_name: true,
            tag_name_zh: true,
            intensity_level: true,
          },
        },
      },
      orderBy: [{ is_primary: 'desc' }, { id: 'asc' }],
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching emotion categories:', error);
    res.status(500).json({
      success: false,
      error: '获取情绪分类失败',
    });
  }
});

// 获取情绪统计信息
router.get('/stats', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;

    let dateFilter = {};
    const now = new Date();

    switch (timeRange) {
      case '1d':
        dateFilter = { gte: new Date(now - 24 * 60 * 60 * 1000) };
        break;
      case '7d':
        dateFilter = { gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
        break;
      default:
        dateFilter = { gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
    }

    // 获取情绪分布统计
    const emotionStats = await prisma.user_assessments.groupBy({
      by: ['primary_emotion'],
      where: { created_at: dateFilter },
      _count: { primary_emotion: true },
      _avg: { intensity_level: true },
    });

    // 获取情绪分类信息
    const categories = await prisma.emotion_categories.findMany({
      select: { id: true, name: true, name_zh: true, color_code: true },
    });

    const statsWithNames = emotionStats
      .map((stat) => {
        const category = categories.find((c) => c.id === stat.primary_emotion);
        return {
          emotion_id: stat.primary_emotion,
          emotion_name: category?.name_zh || category?.name || 'Unknown',
          color: category?.color_code || '#808080',
          count: stat._count.primary_emotion,
          avg_intensity: Math.round(stat._avg.intensity_level * 10) / 10,
        };
      })
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        time_range: timeRange,
        emotion_distribution: statsWithNames,
        total_assessments: emotionStats.reduce((sum, stat) => sum + stat._count.primary_emotion, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching emotion stats:', error);
    res.status(500).json({
      success: false,
      error: '获取情绪统计失败',
    });
  }
});

module.exports = router;
