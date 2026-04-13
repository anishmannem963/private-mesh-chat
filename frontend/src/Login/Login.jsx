import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box
} from '@mui/material';

function Login({ onLogin, onRegisterClick }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event) => {
    event.preventDefault();
    if (username && password) {
      onLogin(true);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(45deg, hsla(29, 100%, 57%, 1) 0%, hsla(0, 100%, 79%, 1) 100%)'
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '300px',
          borderRadius: 3
        }}
      >
        <Typography variant="h4" align="center">
          Login
        </Typography>
        <TextField
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          fullWidth
        >
          Sign In
        </Button>
        <Typography variant="body2" align="center">
          Don't have an account? 
          <Button variant="text" size="small" onClick={onRegisterClick}>
            Register
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Login;