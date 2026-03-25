import {test, expect} from 'vitest';
import { render, screen } from '@testing-library/react';
import ServerBadge from "../MainScreen/ServerList/ServerBadge/ServerBadge.jsx";

const testServer = { id: 1, name: "test1", icon: "vite.svg"}

test('Renders without exceptions', () => {
    expect(() => render(<ServerBadge/>)).not.toThrow();
});

test('Renders server name', () => {
    expect(() => render(<ServerBadge server = {testServer}/>)).not.toThrow();
    expect(screen.getByText("test1")).toBeInTheDocument();
});

test('Renders default server icon', () => {
    expect(() => render(<ServerBadge/>)).not.toThrow();

    const img = screen.getByAltText('ServerBadgeIcon');
    expect(img).toHaveAttribute('src', 'serverDefault.png');
});

test('Renders provided server icon', () => {
    expect(() => render(<ServerBadge server = {testServer}/>)).not.toThrow();

    const img = screen.getByAltText('ServerBadgeIcon');
    expect(img).toHaveAttribute('src', 'vite.svg');
});
