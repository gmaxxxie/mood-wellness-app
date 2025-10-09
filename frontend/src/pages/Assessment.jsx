import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ASSESSMENT_FLOW,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
} from '../config/assessmentFlow';

const Assessment = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [selectedStageTwoCategories, setSelectedStageTwoCategories] = useState([]);

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

  const stageOneCategories = ASSESSMENT_FLOW.stageOne.categories;
  const stageOneTriggers = ASSESSMENT_FLOW.stageOne.triggers;
  const stageTwoSettings = ASSESSMENT_FLOW.stageTwo;

  const stageOneQuestions = useMemo(
    () => questions.filter((question) => stageOneCategories.includes(question.category)),
    [questions, stageOneCategories]
  );

  const stageTwoPool = useMemo(
    () => questions.filter((question) => !stageOneCategories.includes(question.category)),
    [questions, stageOneCategories]
  );

  const limitQuestionsByCategory = useCallback(
    (questionList) => {
      const maxPerCategory = stageTwoSettings.maxQuestionsPerCategory;
      if (!maxPerCategory || maxPerCategory <= 0) {
        return questionList;
      }

      const sorted = [...questionList].sort((a, b) => {
        const weightA = Number.isFinite(a.weight) ? a.weight : parseFloat(a.weight || '0');
        const weightB = Number.isFinite(b.weight) ? b.weight : parseFloat(b.weight || '0');
        return (weightB || 0) - (weightA || 0);
      });

      const counts = new Map();
      const selected = [];
      sorted.forEach((question) => {
        const currentCount = counts.get(question.category) || 0;
        if (currentCount >= maxPerCategory) {
          return;
        }
        selected.push(question);
        counts.set(question.category, currentCount + 1);
      });

      return selected.length > 0 ? selected : questionList;
    },
    [stageTwoSettings.maxQuestionsPerCategory]
  );

  useEffect(() => {
    if (questions.length > 0) {
      setCurrentQuestions(stageOneQuestions);
      setCurrentStage(1);
    }
  }, [questions, stageOneQuestions]);

  const hasAnswered = useCallback(
    (questionId) => responses[questionId] !== undefined && responses[questionId] !== null && responses[questionId] !== '',
    [responses]
  );

  const isStageOneComplete = useMemo(
    () => currentStage === 1 && stageOneQuestions.length > 0 && stageOneQuestions.every(question => hasAnswered(question.id)),
    [currentStage, stageOneQuestions, hasAnswered]
  );

  const isStageTwoComplete = useMemo(
    () => currentStage === 2 && currentQuestions.length > 0 && currentQuestions.every(question => hasAnswered(question.id)),
    [currentStage, currentQuestions, hasAnswered]
  );

  const determineStageTwoCategories = useCallback(() => {
    if (stageOneQuestions.length === 0) {
      return [];
    }

    const categoryResponses = stageOneQuestions.reduce((acc, question) => {
      acc[question.category] = responses[question.id];
      return acc;
    }, {});

    const controlQuestion = stageOneQuestions.find(question => question.category === 'control');
    const controlScoreRaw = controlQuestion ? responses[controlQuestion.id] : null;
    const controlScore =
      typeof controlScoreRaw === 'number' ? controlScoreRaw : parseFloat(controlScoreRaw);

    const energyQuestion = stageOneQuestions.find(question => question.category === 'energy');
    const energyOptions = energyQuestion?.options?.options_zh || energyQuestion?.options?.options || [];
    const energyResponse = energyQuestion ? responses[energyQuestion.id] : null;
    const energyIndex = typeof energyResponse === 'string' ? energyOptions.indexOf(energyResponse) : -1;
    const energyScore = energyIndex !== -1 ? energyIndex + 1 : null;

    const situationalQuestion = stageOneQuestions.find(question => question.category === 'situational');
    const situationalResponse = situationalQuestion ? categoryResponses['situational'] : null;

    const highStressTrigger =
      typeof situationalResponse === 'string' && stageOneTriggers.highStress.includes(situationalResponse);
    const environmentCue =
      typeof situationalResponse === 'string' && stageOneTriggers.environment.includes(situationalResponse);
    const cognitiveCue =
      typeof situationalResponse === 'string' && stageOneTriggers.cognitive.includes(situationalResponse);

    const ruleContext = {
      controlScore,
      energyScore,
      highStressTrigger,
      environmentCue,
      cognitiveCue,
    };

    const availableCategories = new Set(stageTwoPool.map((question) => question.category));

    const matchedRule = stageTwoSettings.rules.find((rule) => {
      try {
        return rule.predicate(ruleContext);
      } catch (error) {
        console.error('Stage-two rule evaluation failed:', rule.id, error);
        return false;
      }
    });

    const preferredCategories = matchedRule?.categories || [];
    const filteredPreferred = preferredCategories.filter((category) => availableCategories.has(category));

    if (filteredPreferred.length > 0) {
      return Array.from(new Set(filteredPreferred));
    }

    const fallback = stageTwoSettings.fallbackCategories.filter((category) =>
      availableCategories.has(category)
    );

    if (fallback.length > 0) {
      return Array.from(new Set(fallback));
    }

    return Array.from(availableCategories);
  }, [responses, stageOneQuestions, stageOneTriggers, stageTwoPool, stageTwoSettings]);

  const handleAdvanceToStageTwo = () => {
    const categories = determineStageTwoCategories();
    const availableStageTwoQuestions = stageTwoPool.filter(question => categories.includes(question.category));
    let nextQuestions = availableStageTwoQuestions.length > 0 ? availableStageTwoQuestions : stageTwoPool;
    nextQuestions = limitQuestionsByCategory(nextQuestions);
    const allowedQuestionIds = new Set([
      ...stageOneQuestions.map(question => String(question.id)),
      ...nextQuestions.map(question => String(question.id))
    ]);

    setSelectedStageTwoCategories(categories);
    setCurrentQuestions(nextQuestions);
    setCurrentStage(2);
    setResponses(prev => {
      const filtered = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (allowedQuestionIds.has(String(key))) {
          filtered[key] = value;
        }
      });
      return filtered;
    });
  };

  const handleBackToStageOne = () => {
    setCurrentStage(1);
    setCurrentQuestions(stageOneQuestions);
    setSelectedStageTwoCategories([]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await axios.post('/api/assessment/submit', {
        responses,
        assessment_type: 'quick',
        metadata: {
          stage_one_categories: Array.from(stageOneCategories),
          stage_two_focus: Array.from(selectedStageTwoCategories),
        },
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
          情绪、身体与行为彼此影响，请根据当下体验逐步完成两轮引导式提问。
        </Typography>

        <Card sx={{ mb: 4, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {currentStage === 1
                ? ASSESSMENT_FLOW.stageOne.label
                : '第 2 轮 · 多维情绪追问'}
            </Typography>
            <Typography variant="body2">
              {currentStage === 1
                ? `${ASSESSMENT_FLOW.stageOne.description}（身体-行为-情绪路径只是自我觉察工具之一，如有需要可随时回顾或跳过。）`
                : '根据第一轮的线索，我们将聚焦最相关的情绪维度，同时兼顾身心反馈与认知因素。'}
            </Typography>
            {currentStage === 2 && selectedStageTwoCategories.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  重点关注：
                  {selectedStageTwoCategories
                    .map((category) => CATEGORY_LABELS[category] || category)
                    .join(' · ')}
                </Typography>
                {selectedStageTwoCategories.map((category) =>
                  CATEGORY_DESCRIPTIONS[category] ? (
                    <Typography variant="caption" display="block" key={category}>
                      · {CATEGORY_DESCRIPTIONS[category]}
                    </Typography>
                  ) : null
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {currentQuestions.map((question, index) => (
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
          {currentStage === 1 ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleAdvanceToStageTwo}
              disabled={!isStageOneComplete}
              sx={{ px: 6 }}
            >
              继续第二轮
            </Button>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="outlined" size="large" onClick={handleBackToStageOne}>
                返回第一轮
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={submitting || !isStageTwoComplete}
                sx={{ px: 6 }}
              >
                {submitting ? <CircularProgress size={24} /> : '提交评估'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Assessment;
