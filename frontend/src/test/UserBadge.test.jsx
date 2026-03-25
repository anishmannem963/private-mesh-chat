import {test, expect} from 'vitest';
import { render, screen } from '@testing-library/react';
import UserBadge from "../UserBadge/UserBadge.jsx";

const testServer = { id: 1, name: "test1", icon: "public/vite.svg"}

test('Renders without exceptions', () => {
    expect(() => render(<UserBadge/>)).not.toThrow();
});

test('Renders server name', () => {
    expect(() => render(<UserBadge user="testName" />)).not.toThrow();
    expect(screen.getByText("testName")).toBeInTheDocument();
});

test('Renders default server icon', () => {
    expect(() => render(<UserBadge/>)).not.toThrow();

    const img = screen.getByAltText('UserBadgeIcon');
    expect(img).toHaveAttribute('src', 'userDefault.png');
});

test('Renders provided server icon', () => {
    expect(() => render(<UserBadge img = "vite.svg"/>)).not.toThrow();

    const img = screen.getByAltText('UserBadgeIcon');
    expect(img).toHaveAttribute('src', 'vite.svg');
});