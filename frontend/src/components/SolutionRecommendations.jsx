import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  CheckCircle,
  ExpandMore,
  Timer,
  TrendingUp,
  Favorite,
  Share,
  Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

const SolutionRecommendations = ({ 
  emotionId, 
  intensityLevel, 
  userPreferences = {}, 
  onSolutionComplete 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [activeSolution, setActiveSolution] = useState(null);
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  // 获取推荐解决方案
  useEffect(() => {
    if (emotionId) {
      fetchRecommendations();
    }
  }, [emotionId, intensityLevel, userPreferences]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await api.solution.getRecommendations({
        emotion_id: emotionId,
        intensity_level: intensityLevel,
        user_preferences: userPreferences,
        limit: 6
      });
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('获取推荐失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 定时器逻辑
  useEffect(() => {
    let interval;
    if (isRunning && activeSolution) {
      interval = setInterval(() => {
        setTimer(prev => {
          const newTime = prev + 1;
          const targetDuration = activeSolution.duration_minutes * 60;
          const newProgress = Math.min((newTime / targetDuration) * 100, 100);
          setProgress(newProgress);
          
          // 自动完成
          if (newProgress >= 100) {
            handleSolutionComplete();
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, activeSolution]);

  // 开始解决方案
  const startSolution = (solution) => {
    setActiveSolution(solution);
    setSelectedSolution(solution);
    setTimer(0);
    setProgress(0);
    setIsRunning(true);
    
    // 记录使用
    api.solution.recordUsage({
      solution_id: solution.id,
      user_id: localStorage.getItem('userId'),
      assessment_id: localStorage.getItem('currentAssessmentId'),
    });
  };

  // 暂停/继续
  const toggleSolution = () => {
    setIsRunning(!isRunning);
  };

  // 停止解决方案
  const stopSolution = () => {
    setIsRunning(false);
    setActiveSolution(null);
    setTimer(0);
    setProgress(0);
  };

  // 完成解决方案
  const handleSolutionComplete = () => {
    setIsRunning(false);
    setFeedbackDialog(true);
  };

  // 提交反馈
  const submitFeedback = async () => {
    try {
      await api.solution.recordUsage({
        solution_id: activeSolution.id,
        user_id: localStorage.getItem('userId'),
        assessment_id: localStorage.getItem('currentAssessmentId'),
        effectiveness_rating: rating,
        user_feedback: feedback,
        completed: true
      });

      setFeedbackDialog(false);
      setRating(0);
      setFeedback('');
      setActiveSolution(null);
      setTimer(0);
      setProgress(0);

      if (onSolutionComplete) {
        onSolutionComplete(activeSolution, rating);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取难度颜色
  const getDifficultyColor = (level) => {
    const colors = {
      1: '#4CAF50',
      2: '#8BC34A', 
      3: '#FFC107',
      4: '#FF9800',
      5: '#F44336'
    };
    return colors[level] || '#757575';
  };

  // 解决方案卡片
  const SolutionCard = ({ solution, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: activeSolution?.id === solution.id ? 2 : 0,
          borderColor: 'primary.main',
          boxShadow: activeSolution?.id === solution.id 
            ? '0 8px 25px rgba(107, 115, 255, 0.15)' 
            : undefined,
        }}
      >
        {/* 推荐得分标识 */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: 'bold',
          }}
        >
          {Math.round(solution.recommendation_score * 100)}
        </Box>

        <CardContent sx={{ flexGrow: 1 }}>
          {/* 类型图标和标题 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: solution.type.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                mr: 2,
              }}
            >
              {getTypeIcon(solution.type.icon)}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" noWrap>
                {solution.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {solution.type.name}
              </Typography>
            </Box>
          </Box>

          {/* 描述 */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 2, height: 40, overflow: 'hidden' }}
          >
            {solution.description}
          </Typography>

          {/* 标签 */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            <Chip 
              size="small" 
              label={`${solution.duration_minutes}分钟`}
              icon={<Timer />}
              variant="outlined"
            />
            <Chip 
              size="small" 
              label={`难度${solution.difficulty_level}`}
              sx={{ 
                bgcolor: getDifficultyColor(solution.difficulty_level),
                color: 'white',
              }}
            />
            <Chip 
              size="small" 
              label={`效果${Math.round(solution.effectiveness_score * 100)}%`}
              icon={<TrendingUp />}
              color="success"
              variant="outlined"
            />
          </Box>

          {/* 详细指导 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="body2">查看指导</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {solution.instructions}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </CardContent>

        {/* 操作按钮 */}
        <Box sx={{ p: 2, pt: 0 }}>
          {activeSolution?.id === solution.id ? (
            <Box>
              {/* 进度条 */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {formatTime(timer)} / {solution.duration_minutes}:00
                  </Typography>
                  <Typography variant="body2">
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ borderRadius: 2, height: 6 }}
                />
              </Box>
              
              {/* 控制按钮 */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={isRunning ? <Pause /> : <PlayArrow />}
                  onClick={toggleSolution}
                  sx={{ flexGrow: 1 }}
                >
                  {isRunning ? '暂停' : '继续'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={stopSolution}
                  startIcon={<Close />}
                >
                  停止
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSolutionComplete}
                  startIcon={<CheckCircle />}
                >
                  完成
                </Button>
              </Box>
            </Box>
          ) : (
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlayArrow />}
              onClick={() => startSolution(solution)}
              disabled={!!activeSolution}
            >
              开始练习
            </Button>
          )}
        </Box>
      </Card>
    </motion.div>
  );

  // 获取类型图标
  const getTypeIcon = (iconName) => {
    const icons = {
      'air': '🌬️',
      'music_note': '🎵',
      'self_improvement': '🧘',
      'fitness_center': '💪',
      'psychology': '🧠',
      'group': '👥',
      'palette': '🎨',
      'spa': '🛁',
    };
    return icons[iconName] || '✨';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <LinearProgress sx={{ width: '50%' }} />
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
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        为您推荐的舒缓方法
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        基于您的情绪状态，我们为您精选了以下科学有效的舒缓方法。选择一个开始练习吧！
      </Typography>

      <Grid container spacing={3}>
        {recommendations.map((solution, index) => (
          <Grid item xs={12} md={6} lg={4} key={solution.id}>
            <SolutionCard solution={solution} index={index} />
          </Grid>
        ))}
      </Grid>

      {/* 反馈对话框 */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          练习完成！请为这次体验打分
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              这个方法对您有帮助吗？
            </Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              size="large"
              sx={{ fontSize: '3rem' }}
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="请分享您的感受（可选）"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="这个方法让我感到..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>
            跳过
          </Button>
          <Button 
            onClick={submitFeedback} 
            variant="contained"
            disabled={rating === 0}
          >
            提交反馈
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SolutionRecommendations;