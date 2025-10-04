import React from 'react';
import { Container, Typography, Box, Card, CardContent, Alert } from '@mui/material';

const Profile = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          个人资料
        </Typography>
        
        <Card>
          <CardContent>
            <Alert severity="info">
              个人资料功能开发中，敬请期待！
            </Alert>
            <Typography variant="body1" sx={{ mt: 2 }}>
              这里将包含：
            </Typography>
            <ul>
              <li>个人偏好设置</li>
              <li>情绪评估历史统计</li>
              <li>常用舒缓方案</li>
              <li>个性化推荐设置</li>
            </ul>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Profile;