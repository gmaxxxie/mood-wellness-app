import React from 'react';
import { Container, Typography, Box, Card, CardContent, Alert } from '@mui/material';

const History = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          历史记录
        </Typography>
        
        <Card>
          <CardContent>
            <Alert severity="info">
              历史记录功能开发中，敬请期待！
            </Alert>
            <Typography variant="body1" sx={{ mt: 2 }}>
              这里将显示你的：
            </Typography>
            <ul>
              <li>过往的情绪评估记录</li>
              <li>使用过的舒缓方案</li>
              <li>情绪变化趋势图表</li>
              <li>方案效果反馈</li>
            </ul>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default History;