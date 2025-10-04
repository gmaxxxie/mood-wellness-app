const axios = require('axios');
const assert = require('assert');

class APITester {
  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.testResults = [];
  }

  // 记录测试结果
  logResult(testName, passed, details = '') {
    this.testResults.push({
      test: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}${details ? ': ' + details : ''}`);
  }

  // 测试健康检查端点
  async testHealthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/api/health`);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.status, 'healthy');
      
      this.logResult('健康检查端点', true, `响应时间: ${response.headers['x-response-time'] || 'N/A'}`);
      return true;
    } catch (error) {
      this.logResult('健康检查端点', false, error.message);
      return false;
    }
  }

  // 测试获取评估问题
  async testGetQuestions() {
    try {
      const response = await axios.get(`${this.baseURL}/api/assessment/questions`);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert(Array.isArray(response.data.data));
      assert(response.data.data.length > 0);
      
      // 验证问题结构
      const question = response.data.data[0];
      assert(question.hasOwnProperty('id'));
      assert(question.hasOwnProperty('question_text_zh'));
      assert(question.hasOwnProperty('question_type'));
      
      this.logResult('获取评估问题', true, `获取到${response.data.data.length}个问题`);
      return response.data.data;
    } catch (error) {
      this.logResult('获取评估问题', false, error.message);
      return null;
    }
  }

  // 测试获取情绪标签
  async testGetEmotionTags() {
    try {
      const response = await axios.get(`${this.baseURL}/api/assessment/tags`);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert(Array.isArray(response.data.data));
      
      this.logResult('获取情绪标签', true, `获取到${response.data.data.length}个标签组`);
      return response.data.data;
    } catch (error) {
      this.logResult('获取情绪标签', false, error.message);
      return null;
    }
  }

  // 测试情绪分析提交
  async testEmotionAnalysis() {
    try {
      const testResponses = {
        '1': '4',  // PANAS积极情感问题
        '2': '3',  
        '4': '3',  // PANAS消极情感问题
        '5': '2',
        '7': '1',  // PHQ-2抑郁筛查
        '8': '1',
        '9': '2',  // GAD-2焦虑筛查
        '10': '1'
      };

      const testMetadata = {
        responseTimes: [5, 8, 12, 6, 15, 10, 8, 7], // 模拟回答时间
        userAgent: 'test-client',
        startTime: Date.now() - 300000 // 5分钟前开始
      };

      const response = await axios.post(`${this.baseURL}/api/assessment/submit`, {
        responses: testResponses,
        assessment_type: 'detailed',
        metadata: testMetadata,
        user_id: 1
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert(response.data.data.hasOwnProperty('primary_emotion'));
      assert(response.data.data.hasOwnProperty('intensity_level'));
      assert(response.data.data.hasOwnProperty('confidence_score'));
      
      const analysisData = response.data.data;
      this.logResult('情绪分析提交', true, 
        `主要情绪ID: ${analysisData.primary_emotion}, 强度: ${analysisData.intensity_level}/10, 置信度: ${Math.round(analysisData.confidence_score * 100)}%`);
      
      return analysisData;
    } catch (error) {
      this.logResult('情绪分析提交', false, error.message);
      return null;
    }
  }

  // 测试语音情绪分析
  async testVoiceAnalysis() {
    try {
      const testTranscriptions = [
        '我今天感觉很不错，工作顺利，心情愉快',
        '最近压力很大，总是担心各种事情',
        '今天又被老板批评了，真的很生气',
        '感觉很累，什么都不想做，没有动力'
      ];

      const results = [];
      for (const transcription of testTranscriptions) {
        const response = await axios.post(`${this.baseURL}/api/assessment/voice-analysis`, {
          transcription,
          user_id: 1,
          audio_metadata: { duration: 5000, language: 'zh-CN' }
        });

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data.success, true);
        assert(response.data.data.hasOwnProperty('detected_emotion'));
        assert(response.data.data.hasOwnProperty('intensity_level'));
        
        results.push(response.data.data);
      }

      this.logResult('语音情绪分析', true, `测试了${results.length}个语音样本`);
      return results;
    } catch (error) {
      this.logResult('语音情绪分析', false, error.message);
      return null;
    }
  }

  // 测试解决方案推荐
  async testSolutionRecommendations() {
    try {
      const response = await axios.post(`${this.baseURL}/api/solution/recommendations`, {
        emotion_id: 4, // 恐惧/焦虑情绪
        intensity_level: 7,
        user_preferences: {
          preferred_types: [1, 3], // 呼吸练习和正念
          time_limit: 15
        },
        limit: 6
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert(Array.isArray(response.data.data.recommendations));
      assert(response.data.data.recommendations.length > 0);

      // 验证推荐结构
      const recommendation = response.data.data.recommendations[0];
      assert(recommendation.hasOwnProperty('id'));
      assert(recommendation.hasOwnProperty('title'));
      assert(recommendation.hasOwnProperty('type'));
      assert(recommendation.hasOwnProperty('recommendation_score'));

      this.logResult('解决方案推荐', true, 
        `获取到${response.data.data.recommendations.length}个推荐方案`);
      
      return response.data.data.recommendations;
    } catch (error) {
      this.logResult('解决方案推荐', false, error.message);
      return null;
    }
  }

  // 测试解决方案使用记录
  async testSolutionUsage() {
    try {
      const response = await axios.post(`${this.baseURL}/api/solution/usage`, {
        solution_id: 1,
        user_id: 1,
        assessment_id: 1,
        effectiveness_rating: 4,
        user_feedback: '这个方法很有帮助，让我感到更放松了',
        completed: true
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert(response.data.data.hasOwnProperty('recommendation_id'));

      this.logResult('解决方案使用记录', true, '使用记录保存成功');
      return true;
    } catch (error) {
      this.logResult('解决方案使用记录', false, error.message);
      return false;
    }
  }

  // 测试获取解决方案类型
  async testGetSolutionTypes() {
    try {
      const response = await axios.get(`${this.baseURL}/api/solution/types`);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert(Array.isArray(response.data.data));

      this.logResult('获取解决方案类型', true, 
        `获取到${response.data.data.length}种解决方案类型`);
      
      return response.data.data;
    } catch (error) {
      this.logResult('获取解决方案类型', false, error.message);
      return null;
    }
  }

  // 测试情绪统计
  async testEmotionStats() {
    try {
      const response = await axios.get(`${this.baseURL}/api/emotion/stats?timeRange=7d`);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert(response.data.data.hasOwnProperty('emotion_distribution'));

      this.logResult('情绪统计', true, '统计数据获取成功');
      return response.data.data;
    } catch (error) {
      this.logResult('情绪统计', false, error.message);
      return null;
    }
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🧪 开始API功能测试...');
    console.log('=' .repeat(50));

    const tests = [
      this.testHealthCheck,
      this.testGetQuestions,
      this.testGetEmotionTags,
      this.testEmotionAnalysis,
      this.testVoiceAnalysis,
      this.testSolutionRecommendations,
      this.testSolutionUsage,
      this.testGetSolutionTypes,
      this.testEmotionStats
    ];

    let passedCount = 0;
    let totalCount = tests.length;

    for (const test of tests) {
      try {
        const result = await test.call(this);
        if (result !== false && result !== null) {
          passedCount++;
        }
      } catch (error) {
        console.log(`❌ 测试执行错误: ${error.message}`);
      }
      
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n📊 测试结果汇总:');
    console.log(`通过: ${passedCount}/${totalCount}`);
    console.log(`成功率: ${Math.round(passedCount / totalCount * 100)}%`);

    return {
      passed: passedCount,
      total: totalCount,
      results: this.testResults,
      success: passedCount === totalCount
    };
  }

  // 生成测试报告
  generateReport(results) {
    const timestamp = new Date().toLocaleString('zh-CN');
    const successRate = Math.round(results.passed / results.total * 100);
    
    return `
# API测试报告

## 测试概览
- **测试时间**: ${timestamp}
- **测试项目**: ${results.total}
- **通过项目**: ${results.passed}
- **成功率**: ${successRate}%

## 详细结果

${this.testResults.map(result => 
  `### ${result.test}
- **状态**: ${result.passed ? '✅ 通过' : '❌ 失败'}
- **详情**: ${result.details || 'N/A'}
- **时间**: ${result.timestamp}
`).join('\n')}

## 建议
${successRate === 100 ? 
  '🎉 所有API测试均通过，可以进行下一步测试!' : 
  '⚠️ 部分测试失败，请检查失败项目并修复后重新测试。'}
`;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const tester = new APITester();
  
  tester.runAllTests().then(results => {
    console.log('\n📝 生成测试报告...');
    const report = tester.generateReport(results);
    
    const fs = require('fs');
    fs.writeFileSync('api_test_report.md', report);
    console.log('✅ API测试报告已保存: api_test_report.md');
    
    process.exit(results.success ? 0 : 1);
  }).catch(error => {
    console.error('❌ 测试执行失败:', error.message);
    process.exit(1);
  });
}

module.exports = APITester;