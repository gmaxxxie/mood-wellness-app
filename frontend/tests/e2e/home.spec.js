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
];

test.describe('首页体验', () => {
  test('加载首页并可跳转到评估页', async ({ page }) => {
    await page.route('**/api/assessment/questions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockQuestions }),
      });
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { name: '情绪舒缓应用' })).toBeVisible();
    await expect(page.getByText('通过智能情绪分析，找到最适合你的心理舒缓方案')).toBeVisible();

    await page.getByRole('button', { name: '开始情绪评估' }).click();

    await expect(page).toHaveURL(/\/assessment/);
    await expect(page.getByRole('heading', { name: '情绪评估问卷' })).toBeVisible();
  });
});
