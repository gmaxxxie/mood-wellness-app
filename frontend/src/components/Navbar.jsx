import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          情绪舒缓应用
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/')}>
            首页
          </Button>
          <Button color="inherit" onClick={() => navigate('/assessment')}>
            情绪评估
          </Button>
          <Button color="inherit" onClick={() => navigate('/history')}>
            历史记录
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;