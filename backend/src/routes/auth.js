const express = require('express');
const router = express.Router();

// 简化的认证路由 - 生产环境需要完整的JWT实现
router.post('/login', async (req, res) => {
  const { username } = req.body;

  // 简化版本 - 实际应用需要密码哈希验证
  const user = {
    id: 1,
    username: username,
    preferences: {},
  };

  res.json({
    success: true,
    data: {
      user,
      token: 'demo-token-' + Date.now(),
    },
  });
});

router.post('/register', async (req, res) => {
  const { username, email } = req.body;

  // 简化版本 - 实际应用需要数据验证和存储
  const user = {
    id: Math.floor(Math.random() * 1000),
    username,
    email,
    preferences: {},
  };

  res.json({
    success: true,
    data: {
      user,
      token: 'demo-token-' + Date.now(),
    },
  });
});

module.exports = router;
