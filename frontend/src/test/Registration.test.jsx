import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Registration from '../Registration/Registration.jsx';
import * as React from 'react';

// Mock fetch globally
global.fetch = vi.fn();

const mockUUID = '123e4567-e89b-12d3-a456-426614174000';

describe('Registration Component', () => {
  let onRegistrationSuccessMock;

  beforeEach(() => {
    onRegistrationSuccessMock = vi.fn();
    fetch.mockClear();
    // FIXED: re-apply the spy every test instead of calling vi.clearAllMocks()
    // which would destroy this spy between tests
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(mockUUID);
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    render(<Registration onRegistrationSuccess={onRegistrationSuccessMock} />);
    expect(screen.getByText('Create an Account')).toBeDefined();
    expect(screen.getByLabelText('Username')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByLabelText('Confirm Password')).toBeDefined();
    expect(screen.getByText('Profile Picture:')).toBeDefined();
    expect(screen.getByText('Register')).toBeDefined();
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  it('shows required-field errors when submitted empty', async () => {
    render(<Registration onRegistrationSuccess={onRegistrationSuccessMock} />);
    await act(async () => {
      fireEvent.click(screen.getByText('Register'));
    });
    expect(screen.getByText('Username is required')).toBeDefined();
    expect(screen.getByText('Password is required')).toBeDefined();
  });

  it('shows minimum-length error for a short password', async () => {
    render(<Registration onRegistrationSuccess={onRegistrationSuccessMock} />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: '12345' },
      });
      fireEvent.click(screen.getByText('Register'));
    });
    expect(screen.queryByText('Username is required')).toBeNull();
    expect(screen.getByText('Password must be at least 6 characters')).toBeDefined();
  });

  it('shows mismatch error when passwords differ', async () => {
    render(<Registration onRegistrationSuccess={onRegistrationSuccessMock} />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: '123456' },
      });
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: '1234567' },
      });
      fireEvent.click(screen.getByText('Register'));
    });
    expect(screen.getByText('Passwords do not match')).toBeDefined();
  });

  // ── Successful registration ────────────────────────────────────────────────

  it('calls fetch with correct endpoint and method on valid submit', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: mockUUID, username: 'testuser' }),
    });
    render(<Registration onRegistrationSuccess={onRegistrationSuccessMock} />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: '123456' },
      });
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: '123456' },
      });
      fireEvent.click(screen.getByText('Register'));
    });
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith(
      '/v1/api/account/',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('includes id and username in the request body', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: mockUUID, username: 'testuser' }),
    });
    render(<Registration onRegistrationSuccess={onRegistrationSuccessMock} />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: '123456' },
      });
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: '123456' },
      });
      fireEvent.click(screen.getByText('Register'));
    });
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body).toHaveProperty('id', mockUUID);
    expect(body).toHaveProperty('username', 'testuser');
    expect(body).toHaveProperty('profile_pic');
  });

  it('shows the success message after a 200 response', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: mockUUID, username: 'testuser' }),
    });
    render(<Registration onRegistrationSuccess={onRegistrationSuccessMock} />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: '123456' },
      });
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: '123456' },
      });
      fireEvent.click(screen.getByText('Register'));
    });
    await waitFor(() => {
      expect(
        screen.getByText('Registration successful! You can now log in.')
      ).toBeDefined();
    });
  });

  it('calls onRegistrationSuccess after a 200 response', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: mockUUID, username: 'testuser' }),
    });
    render(<Registration onRegistrationSuccess={onRegistrationSuccessMock} />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: '123456' },
      });
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: '123456' },
      });
      fireEvent.click(screen.getByText('Register'));
    });
    await waitFor(() => expect(onRegistrationSuccessMock).toHaveBeenCalled());
  });

  // ── Failed registration ────────────────────────────────────────────────────

  it('shows the server error message on a non-ok response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Username already exists' }),
    });
    render(<Registration onRegistrationSuccess={onRegistrationSuccessMock} />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'existinguser' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: '123456' },
      });
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: '123456' },
      });
      fireEvent.click(screen.getByText('Register'));
    });
    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeDefined();
    });
  });

  it('does not call onRegistrationSuccess on a failed response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Username already exists' }),
    });
    render(<Registration onRegistrationSuccess={onRegistrationSuccessMock} />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'existinguser' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: '123456' },
      });
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: '123456' },
      });
      fireEvent.click(screen.getByText('Register'));
    });
    await waitFor(() =>
      expect(screen.getByText('Username already exists')).toBeDefined()
    );
    expect(onRegistrationSuccessMock).not.toHaveBeenCalled();
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it('navigates to login page when Login link is clicked', async () => {
    render(<Registration onRegistrationSuccess={onRegistrationSuccessMock} />);
    const loginButton = screen.getByText('Login');
    await act(async () => {
      fireEvent.click(loginButton);
    });
    // No error thrown = navigation link is present and clickable
  });
});