import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Search from '../CommonComponents/Search/Search.jsx';
import * as React from 'react';

vi.mock('@mui/material', () => ({
  TextField: ({ id, sx, label, type, size, onChange }) => (
    <input
      data-testid="text-field"
      id={id}
      placeholder={label}
      type={type}
      size={size}
      onChange={onChange}
    />
  )
}));

describe('Search Component', () => {
  it('renders without crashing', () => {
    render(<Search />);
    expect(screen.getByTestId('text-field')).toBeDefined();
  });

  it('has default id and label', () => {
    render(<Search />);
    const searchField = screen.getByTestId('text-field');
    expect(searchField.id).toBe('Search');
    expect(searchField.placeholder).toBe('Search');
  });

  it('accepts custom id and label', () => {
    render(<Search id="custom-id" label="Custom Search" />);
    const searchField = screen.getByTestId('text-field');
    expect(searchField.id).toBe('custom-id');
    expect(searchField.placeholder).toBe('Custom Search');
  });

  it('calls return function on change', () => {
    const returnFn = vi.fn();
    render(<Search return={returnFn} />);
    
    const searchField = screen.getByTestId('text-field');
    fireEvent.change(searchField, { target: { value: 'test query' } });
    
    expect(returnFn).toHaveBeenCalled();
  });
});