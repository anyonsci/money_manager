import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PwaInstallPrompt } from '../src/components/common/PwaInstallPrompt';

describe('UI Component - PwaInstallPrompt', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const createMockPromptEvent = () => {
    const event = new Event('beforeinstallprompt') as any;
    event.prompt = jest.fn().mockResolvedValue(undefined);
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    event.preventDefault = jest.fn();
    return event;
  };

  it('does not render initially until beforeinstallprompt event fires', () => {
    const { container } = render(<PwaInstallPrompt appName="Money Manager" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders prompt when beforeinstallprompt event is dispatched', () => {
    render(<PwaInstallPrompt appName="DC Expenses" />);

    const event = createMockPromptEvent();
    act(() => {
      window.dispatchEvent(event);
    });

    expect(screen.getByText('Install DC Expenses')).toBeInTheDocument();
    expect(screen.getByText('Install App')).toBeInTheDocument();
    expect(screen.getByText('Not now')).toBeInTheDocument();
  });

  it('does not show prompt if previously dismissed within 7 days', () => {
    const futureTime = Date.now() + 5 * 24 * 60 * 60 * 1000;
    localStorage.setItem('pwa_install_dismissed_until', futureTime.toString());

    render(<PwaInstallPrompt appName="Money Manager" />);

    const event = createMockPromptEvent();
    act(() => {
      window.dispatchEvent(event);
    });

    expect(screen.queryByText('Install Money Manager')).not.toBeInTheDocument();
  });

  it('handles Install App button click and accepts prompt', async () => {
    render(<PwaInstallPrompt appName="Money Manager" />);

    const event = createMockPromptEvent();
    act(() => {
      window.dispatchEvent(event);
    });

    const installBtn = screen.getByText('Install App');
    await act(async () => {
      fireEvent.click(installBtn);
    });

    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Install Money Manager')).not.toBeInTheDocument();
  });

  it('handles dismiss button click and saves 7-day cooldown in localStorage', () => {
    render(<PwaInstallPrompt appName="Money Manager" storageKey="custom_dismiss_key" />);

    const event = createMockPromptEvent();
    act(() => {
      window.dispatchEvent(event);
    });

    const dismissBtn = screen.getByText('Not now');
    fireEvent.click(dismissBtn);

    expect(screen.queryByText('Install Money Manager')).not.toBeInTheDocument();
    const stored = localStorage.getItem('custom_dismiss_key');
    expect(stored).toBeDefined();
    expect(parseInt(stored!, 10)).toBeGreaterThan(Date.now());
  });
});
