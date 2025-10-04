import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  CalendarToday,
  Psychology,
  Favorite,
  Timeline,
  Assessment,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { api } from '../services/api';

const UserHistory = ({ userId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState(null);
  const [emotionTrend, setEmotionTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserHistory();
      fetchUserStats();
      fetchEmotionTrend();
    }
  }, [userId]);

  // 获取用户历史记录
  const fetchUserHistory = async () => {
    try {
      const response = await api.assessment.getHistory(userId, { limit: 50 });
      setAssessments(response.data || []);
    } catch (error) {
      console.error('Error fetching user history:', error);
      setError('获取历史记录失败');
    }
  };

  // 获取用户统计
  const fetchUserStats = async () => {
    try {
      const response = await api.user.getStats(userId);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // 获取情绪趋势数据
  const fetchEmotionTrend = async () => {
    try {
      const response = await api.emotion.getStats({ timeRange: '30d' });
      const trendData = assessments.slice(-14).map((assessment, index) => ({
        date: dayjs(assessment.created_at).format('MM/DD'),
        intensity: assessment.intensity_level,
        confidence: Math.round(assessment.confidence_score * 100),
        emotion: assessment.primary_emotion_category?.name_zh || '未知',
      }));
      setEmotionTrend(trendData);
    } catch (error) {
      console.error('Error fetching emotion trend:', error);
    } finally {
      setLoading(false);
    }
  };

  // 计算情绪趋势
  const getMoodTrend = () => {
    if (assessments.length < 2) return null;
    
    const recent = assessments.slice(0, 5);
    const previous = assessments.slice(5, 10);
    
    const recentAvg = recent.reduce((sum, a) => sum + a.intensity_level, 0) / recent.length;
    const previousAvg = previous.reduce((sum, a) => sum + a.intensity_level, 0) / previous.length;
    
    const diff = recentAvg - previousAvg;
    
    if (Math.abs(diff) < 0.5) return { trend: 'stable', icon: <Remove />, color: 'info' };
    if (diff > 0) return { trend: 'improving', icon: <TrendingUp />, color: 'success' };
    return { trend: 'declining', icon: <TrendingDown />, color: 'warning' };
  };

  // 获取情绪分布数据
  const getEmotionDistribution = () => {
    const distribution = assessments.reduce((acc, assessment) => {
      const emotion = assessment.primary_emotion_category?.name_zh || '未知';
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([name, value], index) => ({
      name,
      value,
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][index % 6]
    }));
  };

  // 统计卡片组件
  const StatCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
              {icon}
            </Avatar>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  // 历史记录项组件
  const AssessmentItem = ({ assessment, index }) => {
    const emotion = assessment.primary_emotion_category;
    const moodColor = emotion?.color_code || '#757575';
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <ListItem>
          <Avatar 
            sx={{ 
              bgcolor: moodColor, 
              mr: 2,
              width: 48,
              height: 48
            }}
          >
            {getEmotionEmoji(emotion?.name)}
          </Avatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1">
                  {emotion?.name_zh || '未知情绪'}
                </Typography>
                <Chip 
                  size="small" 
                  label={`强度 ${assessment.intensity_level}/10`}
                  color={getIntensityColor(assessment.intensity_level)}
                  variant="outlined"
                />
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {dayjs(assessment.created_at).format('YYYY年MM月DD日 HH:mm')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="caption" sx={{ mr: 1 }}>
                    置信度
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={assessment.confidence_score * 100}
                    sx={{ flexGrow: 1, mr: 1, height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption">
                    {Math.round(assessment.confidence_score * 100)}%
                  </Typography>
                </Box>
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <Chip 
              size="small" 
              label={assessment.assessment_type === 'voice' ? '语音' : '问答'}
              variant="outlined"
            />
          </ListItemSecondaryAction>
        </ListItem>
        <Divider />
      </motion.div>
    );
  };

  // 获取情绪emoji
  const getEmotionEmoji = (emotionName) => {
    const emojiMap = {
      'happiness': '😊',
      'sadness': '😢', 
      'anger': '😠',
      'fear': '😰',
      'surprise': '😮',
      'disgust': '😖',
      'anxiety': '😟',
      'stress': '😤',
    };
    return emojiMap[emotionName] || '😐';
  };

  // 获取强度颜色
  const getIntensityColor = (intensity) => {
    if (intensity <= 3) return 'success';
    if (intensity <= 6) return 'warning';
    return 'error';
  };

  const moodTrend = getMoodTrend();
  const emotionDistribution = getEmotionDistribution();

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>正在加载历史数据...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        我的心情记录
      </Typography>

      {/* 统计概览 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总评估次数"
            value={stats?.total_assessments || 0}
            subtitle="累计记录"
            icon={<Assessment />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="使用解决方案"
            value={stats?.total_recommendations_used || 0}
            subtitle="次练习"
            icon={<Favorite />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="心情改善"
            value={stats?.average_mood_improvement ? `${Math.round(stats.average_mood_improvement * 100)}%` : 'N/A'}
            subtitle="平均改善度"
            icon={<Psychology />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="连续记录"
            value={`${stats?.streak_days || 0}天`}
            subtitle={moodTrend ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {moodTrend.icon}
                <span style={{ marginLeft: 4 }}>
                  {moodTrend.trend === 'stable' ? '保持稳定' : 
                   moodTrend.trend === 'improving' ? '持续改善' : '需要关注'}
                </span>
              </Box>
            ) : '暂无趋势'}
            icon={<CalendarToday />}
            color={moodTrend?.color || 'info'}
          />
        </Grid>
      </Grid>

      {/* 标签页 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
          <Tab label="情绪趋势" />
          <Tab label="情绪分布" />
          <Tab label="历史记录" />
        </Tabs>
      </Paper>

      {/* 趋势图 */}
      {activeTab === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              近14天情绪强度变化
            </Typography>
            {emotionTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={emotionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'intensity' ? `${value}/10` : `${value}%`,
                      name === 'intensity' ? '情绪强度' : '置信度'
                    ]}
                    labelFormatter={(label) => `日期: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="intensity" 
                    stroke="#6B73FF" 
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#FF6B9D" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                暂无足够数据显示趋势
              </Typography>
            )}
          </Card>
        </motion.div>
      )}

      {/* 情绪分布 */}
      {activeTab === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  情绪类型分布
                </Typography>
                {emotionDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={emotionDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {emotionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    暂无数据
                  </Typography>
                )}
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  评估频率统计
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={emotionDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6B73FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* 历史记录 */}
      {activeTab === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                评估历史记录
              </Typography>
              {assessments.length > 0 ? (
                <List>
                  {assessments.map((assessment, index) => (
                    <AssessmentItem 
                      key={assessment.id} 
                      assessment={assessment} 
                      index={index}
                    />
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  暂无评估记录
                </Typography>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Box>
  );
};

export default UserHistory;