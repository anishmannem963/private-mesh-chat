import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

function Registration({ onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    profilePic: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEHUlEQVR4nO2dW4hNURjHf2PGuGQml3EpSS5RJuVhuIxbEeXBS0l5kHKL8iLKZUqUlJAnD0oUeVFKEg/kmnnAJA/kmkxucnfmY2nXmXPO2mvvs9ba+5z1/+rbaZ+z97fW/6y1vv3ttdfZoFAoFAqFQqFQKBQKhSKQgcA6oAH4CFwDVgExY5KDiQPVwDdL8vgCLDEmORjKgSPki78CpcYkB0MN8N5SwFXGJAdDBfDUUsBKY5K7yQmVwHOSeY0PMF5j6oHfCUX8BurMSe4mRzQBfxKKOAE0m5PcTY5YBvxMKGKv+bs5yW5mA+eBDmCpPcQGYEQeuDZbw7UhiuiV0K9OejepGQj8ShhoIlBjBrTZB+Z6ibnCYzFumW3uALYDI2wfXiG0iJDvHlfGJuBhSvspYLyvxXgQUsSjnO2HAzM8FXPCYzH6rAL2ASPNZ1sDnAmx30Pg+wB7Qm1Pk2ux1naCGcBTodNJ2n8D40z7BYK3q0ZJAeuxITYAH0Kcn7Stt4X4AGxJePY/gNXmfcJXMX5rmG3+/zHi9eOLwDhgriDIfOAdsBcYlqsPpj0Qk8TQwJa1tEcZ5Aw051U+C/GbBcBTWzEbBJ3UBn4q5OP7RG8/pNYW3UL6wQHb9jNAG3CdXMRYTd5qMbAeWMZU4A5wBBhqMY4BjgEnqfMkxObAqrLJ4+Ax8xHQAvS3JXyoWXkPA5ucPIkexA74I8BgRwc5ChQBM81ZSEzQy9SYCWcSsMXcU0QmxMxc2k/9zBFQSe8v7pjb4gYRCY/JYwfRDFkXyH8xeiOsjqIT4j5wgPw03FJRGsngAuedv/mGPEe3rK5JtxhH3yGXCfeJwvGP/6d6XoUtjYPPELUYXZO6xbjqEEW+RnWhk2YhLrYsRf4GvmHT7CiLHNJ+qQsRiTToLRjdh0QiQY8skV4w1CMLRZoYHwPH+RD5Mwbx1xELhI5TBt7qLcvdMsJDxCFCt6zfQscpQ2/1NuUuCoQOKVApK5RHFlPLCJGC0YOhTvSYWkYoCkQdfWUG9+4W+TtOGXirtyxPkD4uc/SxVUa+r8vDZ9KGWoZIgaglhMipLVHRQRbzzL2Ag0Q4E1KEZpOO82CgS0MSRz9liPSpmjCaXa5MuhbZcWoZkuYgcSJdFg5TgZIjrYrEQ2Rq5E+uI50ZnsvQS4RYhjgIshj37Vs0OsgyMFIqB1mEekH4InWQxQlqGeIgtAzxQRAGWYTj7ZEgDrLEI8vEkKFlRMpBFodBFmOUxEGQJUsHWYwjTtIsw9MgSxpqdJBlkMNBFqsC5SDLwKR/pkHuBrIwDLIYJ2kGWTYkDcuDLNZYGWQRUquDLApFQdIJnAbaNaVpSt09j3DY+PJi1aQAAAAASUVORK5CYII='
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePic: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate UUID for the user
      const userId = crypto.randomUUID();
      
      const response = await fetch('/v1/api/account/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          username: formData.username,
          profile_pic: formData.profilePic
        }),
      });
      
      if (response.ok) {
        setSuccessMessage('Registration successful! You can now log in.');
        if (onRegistrationSuccess) {
          onRegistrationSuccess();
        }
      } else {
        const data = await response.json();
        setErrors({ submit: data.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again later.' });
    } finally {
      setIsLoading(false);
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
          width: '400px',
          borderRadius: 3
        }}
      >
        <Typography variant="h4" align="center">
          Create an Account
        </Typography>
        
        {successMessage && (
          <Typography variant="body1" align="center" color="success.main">
            {successMessage}
          </Typography>
        )}
        
        {errors.submit && (
          <Typography variant="body1" align="center" color="error">
            {errors.submit}
          </Typography>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.username}
            helperText={errors.username}
          />
          
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            name="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password}
          />
          
          <TextField
            label="Confirm Password"
            type="password"
            variant="outlined"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Profile Picture:
            </Typography>
            <input
              accept="image/*"
              type="file"
              onChange={handleProfilePicChange}
            />
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
          
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account? <Button variant="text" size="small" href="/">Login</Button>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}

export default Registration;