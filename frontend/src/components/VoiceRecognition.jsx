import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import { Mic, MicOff, VolumeUp, Stop, Replay } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { api } from '../services/api';

const VoiceRecognitionComponent = ({ onVoiceAnalysis, disabled = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [voiceResult, setVoiceResult] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const speechUtteranceRef = useRef(null);
  const lastAnalyzedRef = useRef('');

  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    setTranscription(transcript);
  }, [transcript]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    speechUtteranceRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speakText = useCallback(
    (text) => {
      if (!text || !text.trim()) {
        return;
      }

      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setError('当前浏览器不支持语音播报');
        return;
      }

      stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        setError('语音播报失败，请重试');
      };

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [stopSpeaking]
  );

  const startAudioVisualization = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;

    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);

    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateAudioLevel = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      setAudioLevel(average / 255);
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();
  };

  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
  };

  const startListening = async () => {
    if (disabled || listening || isProcessing) {
      return;
    }

    if (!browserSupportsSpeechRecognition) {
      setError('您的浏览器不支持语音识别功能');
      return;
    }

    try {
      stopSpeaking();
      await startAudioVisualization();
      resetTranscript();
      setVoiceResult(null);
      setError('');
      lastAnalyzedRef.current = '';
      await SpeechRecognition.startListening({ continuous: true, language: 'zh-CN' });
    } catch (err) {
      console.error('Failed to start listening:', err);
      setError('无法访问麦克风或启动语音识别，请检查权限');
      stopAudioVisualization();
    }
  };

  const stopListening = () => {
    if (!listening) {
      return;
    }
    SpeechRecognition.stopListening();
    stopAudioVisualization();
  };

  const processVoiceInput = useCallback(
    async (text) => {
      if (!text.trim()) {
        return;
      }

      setIsProcessing(true);
      try {
        const response = await api.assessment.analyzeVoice({
          transcription: text,
          user_id: localStorage.getItem('userId'),
          audio_metadata: {
            duration: Date.now(),
            language: 'zh-CN',
          },
        });

        setVoiceResult(response.data);
        if (onVoiceAnalysis) {
          onVoiceAnalysis(response.data, text);
        }
      } catch (err) {
        console.error('Voice analysis error:', err);
        setError('语音分析失败，请重试');
      } finally {
        setIsProcessing(false);
      }
    },
    [onVoiceAnalysis]
  );

  const resetRecording = () => {
    SpeechRecognition.stopListening();
    stopAudioVisualization();
    resetTranscript();
    setTranscription('');
    setVoiceResult(null);
    setError('');
    lastAnalyzedRef.current = '';
    stopSpeaking();
  };

  useEffect(() => {
    if (!listening && transcription.trim()) {
      const normalized = transcription.trim();
      if (normalized !== lastAnalyzedRef.current) {
        lastAnalyzedRef.current = normalized;
        processVoiceInput(normalized);
      }
    }
  }, [listening, transcription, processVoiceInput]);

  useEffect(() => {
    return () => {
      SpeechRecognition.abortListening();
      stopAudioVisualization();
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const speechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const AudioWaveform = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 40 }}>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            width: 3,
            backgroundColor: '#6B73FF',
            borderRadius: 2,
          }}
          animate={{
            height: listening
              ? [20, 40 * (audioLevel + Math.random() * 0.5), 20]
              : 20,
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </Box>
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Typography variant="h6" gutterBottom align="center">
        语音情绪分析
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!browserSupportsSpeechRecognition && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          当前浏览器不支持语音识别，建议更换支持 Web Speech API 的浏览器。
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant={listening ? 'contained' : 'outlined'}
            color={listening ? 'error' : 'primary'}
            size="large"
            startIcon={listening ? <MicOff /> : <Mic />}
            onClick={listening ? stopListening : startListening}
            disabled={disabled || isProcessing || !browserSupportsSpeechRecognition}
            sx={{
              minWidth: 160,
              borderRadius: 10,
              boxShadow: listening ? '0 0 20px rgba(255, 107, 157, 0.4)' : 'none',
            }}
          >
            {listening ? '停止录音' : '开始录音'}
          </Button>
        </motion.div>

        {transcription && (
          <IconButton onClick={resetRecording} sx={{ ml: 1 }} disabled={listening || isProcessing}>
            <Replay />
          </IconButton>
        )}
      </Box>

      <AnimatePresence>
        {listening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <AudioWaveform />
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {transcription && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="textSecondary" gutterBottom>
            识别文本：
          </Typography>
          <Typography variant="body1">{transcription}</Typography>
          {speechSynthesisSupported && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
              <IconButton size="small" onClick={() => speakText(transcription)} disabled={isSpeaking}>
                <VolumeUp fontSize="small" />
              </IconButton>
              {isSpeaking && (
                <IconButton size="small" onClick={stopSpeaking}>
                  <Stop fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
        </Paper>
      )}

      {isProcessing && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">正在分析情绪...</Typography>
        </Box>
      )}

      {voiceResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              语音情绪分析结果
            </Typography>

            {speechSynthesisSupported && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() =>
                    speakText(
                      `检测到的主要情绪是${voiceResult.detected_emotion}，情绪强度${voiceResult.intensity_level}分，置信度${Math.round(
                        voiceResult.confidence_score * 100
                      )}%。`
                    )
                  }
                  disabled={isSpeaking}
                >
                  <VolumeUp fontSize="small" />
                </IconButton>
                {isSpeaking && (
                  <IconButton size="small" onClick={stopSpeaking}>
                    <Stop fontSize="small" />
                  </IconButton>
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip label={`主要情绪: ${voiceResult.detected_emotion}`} color="primary" variant="outlined" />
              <Chip label={`强度: ${voiceResult.intensity_level}/10`} color="secondary" variant="outlined" />
              <Chip
                label={`置信度: ${Math.round(voiceResult.confidence_score * 100)}%`}
                color={voiceResult.confidence_score > 0.7 ? 'success' : 'warning'}
                variant="outlined"
              />
            </Box>

            {voiceResult.keyword_matches && Object.keys(voiceResult.keyword_matches).length > 0 && (
              <Box>
                <Typography variant="caption" display="block" gutterBottom>
                  关键词匹配:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {Object.entries(voiceResult.keyword_matches)
                    .filter(([, count]) => count > 0)
                    .map(([emotion, count]) => (
                      <Chip key={emotion} label={`${emotion}: ${count}`} size="small" variant="outlined" />
                    ))}
                </Box>
              </Box>
            )}
          </Paper>
        </motion.div>
      )}

      <Typography variant="caption" display="block" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
        💡 请用自然的语调描述您当前的感受
      </Typography>
    </Paper>
  );
};

export default VoiceRecognitionComponent;
