import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../Login/Login.jsx';
import * as React from 'react';

describe('Login Component', () => {
  let onLoginMock;
  let onRegisterClickMock;

  beforeEach(() => {
    onLoginMock = vi.fn();
    onRegisterClickMock = vi.fn();
  });

  it('renders without crashing', () => {
    render(
      <Login 
        onLogin={onLoginMock} 
        onRegisterClick={onRegisterClickMock} 
      />
    );
    
    expect(screen.getByText('Login')).toBeDefined();
    expect(screen.getByLabelText('Username')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByText('Sign In')).toBeDefined();
    expect(screen.getByText('Register')).toBeDefined();
  });

  it('handles empty form submission', () => {
    render(
      <Login 
        onLogin={onLoginMock} 
        onRegisterClick={onRegisterClickMock} 
      />
    );
    
    // Try to submit with empty fields
    fireEvent.click(screen.getByText('Sign In'));
    
    // Login function should not be called with empty fields
    expect(onLoginMock).not.toHaveBeenCalled();
  });

  it('handles valid form submission', () => {
    render(
      <Login 
        onLogin={onLoginMock} 
        onRegisterClick={onRegisterClickMock} 
      />
    );
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Sign In'));
    
    // Login function should be called
    expect(onLoginMock).toHaveBeenCalledWith(true);
  });

  it('navigates to registration when Register is clicked', () => {
    render(
      <Login 
        onLogin={onLoginMock} 
        onRegisterClick={onRegisterClickMock} 
      />
    );
    
    // Click on the Register button
    fireEvent.click(screen.getByText('Register'));
    
    // onRegisterClick should be called
    expect(onRegisterClickMock).toHaveBeenCalled();
  });
});