import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Card, CardContent, Slider, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Assessment = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      console.log('API URL: /api/assessment/questions (通过Vite代理)');
      console.log('Fetching from: /api/assessment/questions');
      
      const response = await axios.get('/api/assessment/questions');
      console.log('Response:', response.status, response.data);
      if (response.data.success) {
        setQuestions(response.data.data);
      } else {
        setError('获取问题失败');
      }
    } catch (error) {
      setError('网络错误，请检查连接');
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await axios.post('/api/assessment/submit', {
        responses,
        assessment_type: 'quick'
      });
      
      if (response.data.success) {
        // 保存结果到 localStorage 并导航到结果页
        localStorage.setItem('assessmentResults', JSON.stringify(response.data.data));
        navigate('/results');
      } else {
        setError('提交失败，请重试');
      }
    } catch (error) {
      setError('提交失败，请检查网络连接');
      console.error('Error submitting assessment:', error);
    } finally {
      setSubmitting(false);
    }
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

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button onClick={fetchQuestions} sx={{ mt: 2 }}>重试</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          情绪评估问卷
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          请根据你目前的感受诚实回答以下问题
        </Typography>

        {questions.map((question, index) => (
          <Card key={question.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {index + 1}. {question.question_text_zh || question.question_text}
              </Typography>
              
              {question.question_type === 'scale' && (
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" sx={{ mb: 2, color: 'text.primary', fontSize: '0.9rem' }}>
                    请选择最符合您感受的选项：
                  </FormLabel>
                  <RadioGroup
                    value={responses[question.id] || ''}
                    onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
                    sx={{ gap: 1 }}
                  >
                    {question.options && question.options.labels_zh && question.options.labels_zh.map((label, idx) => {
                      const value = question.options.scale.min + idx;
                      const letters = ['A', 'B', 'C', 'D', 'E'];
                      return (
                        <FormControlLabel
                          key={value}
                          value={value}
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {letters[idx]}.
                              </Typography>
                              <Typography component="span">
                                {label}
                              </Typography>
                            </Box>
                          }
                          sx={{
                            border: '1px solid',
                            borderColor: responses[question.id] === value ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            px: 2,
                            py: 1,
                            mx: 0,
                            backgroundColor: responses[question.id] === value ? 'primary.light' : 'background.paper',
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl>
              )}
              
              {question.question_type === 'multiple_choice' && question.options && (
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" sx={{ mb: 2, color: 'text.primary', fontSize: '0.9rem' }}>
                    请选择最符合您情况的选项：
                  </FormLabel>
                  <RadioGroup
                    value={responses[question.id] || ''}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    sx={{ gap: 1 }}
                  >
                    {(question.options.options_zh || question.options.options).map((option, optIndex) => {
                      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
                      return (
                        <FormControlLabel
                          key={optIndex}
                          value={option}
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {letters[optIndex]}.
                              </Typography>
                              <Typography component="span">
                                {option}
                              </Typography>
                            </Box>
                          }
                          sx={{
                            border: '1px solid',
                            borderColor: responses[question.id] === option ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            px: 2,
                            py: 1,
                            mx: 0,
                            backgroundColor: responses[question.id] === option ? 'primary.light' : 'background.paper',
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl>
              )}
            </CardContent>
          </Card>
        ))}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitting || Object.keys(responses).length === 0}
            sx={{ px: 6 }}
          >
            {submitting ? <CircularProgress size={24} /> : '提交评估'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Assessment;