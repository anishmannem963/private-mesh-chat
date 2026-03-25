import {test, expect} from 'vitest';
import { render } from '@testing-library/react';
import App from "../App.jsx";

test('Renders without exceptions', () => {
    expect(() => render(<App />)).not.toThrow();
});

