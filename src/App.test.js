import { render, screen } from '@testing-library/react';
import App from './App';

test('shows the login form when no one is logged in', () => {
  localStorage.clear();
  render(<App />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});
