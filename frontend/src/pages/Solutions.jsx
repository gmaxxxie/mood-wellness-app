import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Button, Grid, Chip, CircularProgress, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { AccessTime, Star, Psychology } from '@mui/icons-material';
import axios from 'axios';

const Solutions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { emotionId, intensityLevel } = location.state || { emotionId: 1, intensityLevel: 5 };

  useEffect(() => {
    fetchRecommendations();
  }, [emotionId, intensityLevel]);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.post('/api/solution/recommendations', {
        emotion_id: emotionId,
        intensity_level: intensityLevel,
        limit: 8
      });

      if (response.data.success && response.data.data.recommendations) {
        setSolutions(response.data.data.recommendations);
      } else {
        setError('暂无推荐方案');
      }
    } catch (error) {
      setError('获取推荐方案失败');
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseSolution = async (solutionId) => {
    try {
      await axios.post('/api/solution/usage', {
        solution_id: solutionId,
        user_id: 1, // 测试用户ID
        completed: false
      });
      alert('方案已记录使用！');
    } catch (error) {
      console.error('Error recording usage:', error);
    }
  };

  const getDifficultyColor = (level) => {
    if (level <= 2) return 'success';
    if (level <= 3) return 'warning';
    return 'error';
  };

  const getDifficultyText = (level) => {
    if (level <= 2) return '简单';
    if (level <= 3) return '中等';
    return '困难';
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          推荐的舒缓方案
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          根据你的情绪状态，为你精心挑选的解决方案
        </Typography>

        {error ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            {error}
            <Button onClick={() => navigate('/assessment')} sx={{ ml: 2 }}>
              重新评估
            </Button>
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {solutions.map((solution) => (
              <Grid item xs={12} md={6} lg={4} key={solution.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Psychology sx={{ color: solution.type?.color || 'primary.main', mr: 1 }} />
                      <Chip 
                        label={solution.type?.name || '通用方法'}
                        size="small"
                        sx={{ backgroundColor: solution.type?.color + '20' }}
                      />
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      {solution.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {solution.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {solution.duration_minutes && (
                        <Chip
                          icon={<AccessTime />}
                          label={`${solution.duration_minutes}分钟`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      
                      {solution.difficulty_level && (
                        <Chip
                          label={getDifficultyText(solution.difficulty_level)}
                          size="small"
                          color={getDifficultyColor(solution.difficulty_level)}
                          variant="outlined"
                        />
                      )}

                      {solution.effectiveness_score && (
                        <Chip
                          icon={<Star />}
                          label={`${Math.round(solution.effectiveness_score * 100)}%有效`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {solution.tags && solution.tags.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                        {solution.tags.slice(0, 3).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleUseSolution(solution.id)}
                      sx={{ mb: 1 }}
                    >
                      开始使用
                    </Button>
                    
                    {solution.resource_url && (
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        href={solution.resource_url}
                        target="_blank"
                      >
                        查看详细指导
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/results')}
            sx={{ mr: 2 }}
          >
            返回结果
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/assessment')}
          >
            重新评估
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Solutions;