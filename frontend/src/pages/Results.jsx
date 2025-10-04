import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Button, Chip, Grid, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Psychology, TrendingUp, Lightbulb } from '@mui/icons-material';

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从 localStorage 获取评估结果
    const savedResults = localStorage.getItem('assessmentResults');
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    } else {
      // 如果没有结果，重定向到评估页面
      navigate('/assessment');
    }
    setLoading(false);
  }, [navigate]);

  const getEmotionName = (emotionId) => {
    const emotionMap = {
      1: '快乐',
      2: '悲伤', 
      3: '愤怒',
      4: '恐惧',
      5: '惊讶',
      6: '厌恶'
    };
    return emotionMap[emotionId] || '未知情绪';
  };

  const getIntensityColor = (intensity) => {
    if (intensity >= 8) return 'error';
    if (intensity >= 6) return 'warning'; 
    if (intensity >= 4) return 'info';
    return 'success';
  };

  const handleViewSolutions = () => {
    navigate('/solutions', { 
      state: { 
        emotionId: results.primary_emotion,
        intensityLevel: results.intensity_level 
      }
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!results) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            没有找到评估结果，请先完成情绪评估
          </Alert>
          <Button onClick={() => navigate('/assessment')} sx={{ mt: 2 }}>
            开始评估
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          你的情绪分析结果
        </Typography>

        <Grid container spacing={3}>
          {/* 主要情绪 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Psychology sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  主要情绪
                </Typography>
                <Chip 
                  label={getEmotionName(results.primary_emotion)}
                  color="primary"
                  size="large"
                  sx={{ fontSize: '1.1rem', py: 2, px: 3 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* 情绪强度 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  情绪强度
                </Typography>
                <Chip 
                  label={`${results.intensity_level}/10`}
                  color={getIntensityColor(results.intensity_level)}
                  size="large"
                  sx={{ fontSize: '1.1rem', py: 2, px: 3 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* 分析详情 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Lightbulb sx={{ verticalAlign: 'middle', mr: 1 }} />
                  分析洞察
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" paragraph>
                    根据你的回答，我们识别出你当前的主要情绪是 
                    <strong>{getEmotionName(results.primary_emotion)}</strong>，
                    强度等级为 <strong>{results.intensity_level}/10</strong>。
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    置信度: {Math.round((results.confidence_score || 0) * 100)}%
                  </Typography>
                </Box>

                {results.analysis_details && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      分析指标:
                    </Typography>
                    {results.analysis_details.language_indicators && (
                      <Typography variant="body2" color="text.secondary">
                        语言特征: {results.analysis_details.language_indicators.join(', ')}
                      </Typography>
                    )}
                    {results.analysis_details.behavior_patterns && (
                      <Typography variant="body2" color="text.secondary">
                        行为模式: {results.analysis_details.behavior_patterns.join(', ')}
                      </Typography>
                    )}
                  </Box>
                )}

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleViewSolutions}
                    sx={{ mr: 2 }}
                  >
                    查看推荐方案
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/assessment')}
                  >
                    重新评估
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Results;