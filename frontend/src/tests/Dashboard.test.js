import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../components/Dashboard';

// Mock axios
jest.mock('axios');

test('renders dashboard title', () => {
    render(<Dashboard />);
    const titleElement = screen.getByText(/Network Scanner & Scheduler/i);
    expect(titleElement).toBeInTheDocument();
});

test('renders scan button', () => {
    render(<Dashboard />);
    const buttonElement = screen.getByText(/Start Scan/i);
    expect(buttonElement).toBeInTheDocument();
});
