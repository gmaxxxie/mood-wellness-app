import { test, expect } from '@playwright/test';

const mockQuestions = [
  {
    id: 1,
    question_text: 'How positive do you feel right now?',
    question_text_zh: '此刻你的积极情绪有多强？',
    question_type: 'scale',
    category: 'positive_affect',
    options: {
      scale: { min: 1, max: 5 },
      labels_zh: ['非常低', '较低', '一般', '较高', '非常高'],
    },
    weight: 1,
  },
  {
    id: 2,
    question_text: 'What is currently impacting your mood?',
    question_text_zh: '当前影响你情绪的主要因素是什么？',
    question_type: 'multiple_choice',
    category: 'situational',
    options: {
      options_zh: ['工作压力', '人际关系', '健康问题', '暂无特别原因'],
    },
    weight: 1,
  },
];

const mockAnalysis = {
  assessment_id: 101,
  emotion_scores: {
    happiness: 0.7,
    sadness: 0.2,
    anger: 0.1,
    fear: 0.1,
    surprise: 0.2,
    disgust: 0.05,
  },
  primary_emotion: 1,
  secondary_emotion: 5,
  intensity_level: 5,
  confidence_score: 0.82,
  analysis_details: {
    language_indicators: ['positive'],
    behavior_patterns: ['normal_response_time'],
    cognitive_biases: ['none_detected'],
    inference_reasoning: ['示例推理：积极情绪占比较高'],
  },
  recommendations: {
    primary_recommendations: [
      {
        id: 1,
        title: '三分钟深呼吸练习',
        description: '通过节奏呼吸快速稳定情绪。',
        instructions: '按照4-7-8节奏进行呼吸练习。',
        type: {
          id: 1,
          name: '呼吸练习',
          icon: 'self_improvement',
          color: '#6B73FF',
        },
        duration_minutes: 3,
        difficulty_level: 1,
        effectiveness_score: 0.85,
        tags: ['呼吸', '减压'],
        resource_url: 'https://example.com/breathe',
        recommendation_score: 1.3,
      },
    ],
    contextual_adjustments: ['保持深呼吸节奏，帮助巩固积极情绪。'],
    rationale: ['根据回答匹配到低强度方案。'],
  },
  timestamp: new Date().toISOString(),
};

const mockSolutionRecommendations = {
  success: true,
  data: {
    recommendations: mockAnalysis.recommendations.primary_recommendations,
    total_available: 1,
    criteria: {
      emotion_id: 1,
      intensity_level: 5,
      user_preferences: {},
    },
  },
};

test.describe('情绪评估流程', () => {
  test('完成快速评估并查看推荐方案', async ({ page }) => {
    await page.route('**/api/assessment/questions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockQuestions }),
      });
    });

    await page.route('**/api/assessment/submit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockAnalysis }),
      });
    });

    await page.route('**/api/solution/recommendations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSolutionRecommendations),
      });
    });

    await page.goto('/assessment');

    await expect(page.getByRole('heading', { name: '情绪评估问卷' })).toBeVisible();

    await page.locator('label').filter({ hasText: '非常高' }).click();
    await page.locator('label').filter({ hasText: '工作压力' }).click();

    await page.getByRole('button', { name: '提交评估' }).click();

    await expect(page).toHaveURL(/\/results/);
    await expect(page.getByRole('heading', { name: '你的情绪分析结果' })).toBeVisible();
    await expect(page.getByText('快乐', { exact: true })).toBeVisible();
    await expect(page.getByText('5/10', { exact: true })).toBeVisible();
    await expect(page.getByText('置信度: 82%')).toBeVisible();

    await page.getByRole('button', { name: '查看推荐方案' }).click();
    await expect(page).toHaveURL(/\/solutions/);

    await expect(page.getByRole('heading', { name: '推荐的舒缓方案' })).toBeVisible();
    await expect(page.getByText('三分钟深呼吸练习')).toBeVisible();
  });
});
