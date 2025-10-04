import React from 'react';
import { Container, Typography, Box, Button, Card, CardContent, Grid, LinearProgress, Divider, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Psychology, Assessment, History, Timeline } from '@mui/icons-material';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();

  const timeOfDay = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  })();

  const recentMoodData = [
    { day: '周一', mood: 70 },
    { day: '周二', mood: 65 },
    { day: '周三', mood: 85 },
    { day: '周四', mood: 60 },
    { day: '周五', mood: 75 },
    { day: '周六', mood: 90 },
    { day: '今天', mood: 0 }
  ];

  const quickActivities = [
    { id: 'breathing', name: '深呼吸练习', hint: '3 分钟', emoji: '🌬️' },
    { id: 'meditation', name: '正念冥想', hint: '5 分钟', emoji: '🧘' },
    { id: 'music', name: '舒缓音乐', hint: '10 分钟', emoji: '🎵' },
    { id: 'journal', name: '情绪日记', hint: '任意时长', emoji: '📝' }
  ];

  const handleQuickActivity = (activityId) => {
    switch (activityId) {
      case 'breathing':
      case 'meditation':
      case 'music':
      case 'journal':
        // 先占位交互，后续可接入实际功能或路由
        alert(`已开始：${activityId}`);
        break;
      default:
        break;
    }
  };

  const testAPI = async () => {
    try {
      console.log('测试API连接...');
      console.log('API URL: /api/health (通过Vite代理)');
      
      const response = await axios.get('/api/health');
      console.log('API测试成功:', response.data);
      alert('API连接测试成功!\n' + JSON.stringify(response.data));
    } catch (error) {
      console.error('API测试失败:', error);
      alert('API连接测试失败:\n' + error.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pb: 6 }}>
      {/* 顶部问候与主操作卡 */}
      <Box sx={{ pt: 4, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          {timeOfDay}，今天感觉怎么样？
        </Typography>
        <Typography variant="body2" color="text.secondary">
          让我们一起理解你的情绪状态
        </Typography>
      </Box>

      <Card sx={{ mb: 4, background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.light})`, color: '#fff' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>记录此刻心情</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>通过身体、想法、行为了解情绪</Typography>
            </Box>
            <Button variant="contained" color="inherit" onClick={() => navigate('/assessment')}>
              开始
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 近期情绪趋势 */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            近期情绪
          </Typography>
          <Stack spacing={1.5}>
            {recentMoodData.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ width: 40 }}>{item.day}</Typography>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress variant="determinate" value={item.mood} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                  <Typography variant="caption" sx={{ width: 32, textAlign: 'right' }}>{item.mood > 0 ? `${item.mood}%` : '-'}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">基于你的情绪记录生成的趋势分析</Typography>
        </CardContent>
      </Card>

      {/* 快捷练习 */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>快捷入口</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>选择一个舒缓练习开始</Typography>
          <Grid container spacing={2}>
            {quickActivities.map((act) => (
              <Grid item xs={6} key={act.id}>
                <Button
                  variant="outlined"
                  onClick={() => handleQuickActivity(act.id)}
                  sx={{
                    width: '100%',
                    height: 96,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    borderWidth: 2
                  }}
                >
                  <Box sx={{ fontSize: 22, mb: 0.5 }}>{act.emoji}</Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{act.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{act.hint}</Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* 底部导航占位 */}
      <Box sx={{ height: 80 }} />
      
      {/* 工具按钮 */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button 
          variant="outlined" 
          size="medium"
          onClick={testAPI}
          sx={{ px: 3 }}
        >
          测试API连接
        </Button>
      </Box>
    </Container>
  );
};

export default Home;