import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';

const askMock = vi.fn();

vi.mock('@/lib/api', async () => {
  class VedaApiRequestError extends Error {
    constructor(
      message: string,
      readonly status: number,
    ) {
      super(message);
    }
  }
  return { api: { ask: askMock }, VedaApiRequestError };
});

const { useChat, useRecentChats, useActiveMessages } = await import('./chat');

/**
 * Guards the zustand v5 strict-equality hazard: a selector that builds a new
 * array each call re-renders forever. These components must settle.
 */
function Probe() {
  const chats = useRecentChats();
  const messages = useActiveMessages();
  renders++;
  return (
    <div>
      <span data-testid="chats">{chats.length}</span>
      <span data-testid="messages">{messages.length}</span>
    </div>
  );
}

let renders = 0;

describe('chat selectors', () => {
  beforeEach(() => {
    useChat.setState({
      conversations: {},
      order: [],
      activeId: null,
      thinking: false,
      hydrated: true,
    });
    askMock.mockReset();
    renders = 0;
  });

  it('renders a stable number of times with an empty store', () => {
    render(<Probe />);
    expect(screen.getByTestId('chats').textContent).toBe('0');
    expect(screen.getByTestId('messages').textContent).toBe('0');
    // An unstable selector would blow past this before the test could assert.
    expect(renders).toBeLessThan(5);
  });

  it('re-renders once per real change, not unboundedly', async () => {
    askMock.mockResolvedValue({
      answer: 'A',
      citations: [],
      evidence: [],
      confidence: 0.9,
      model_used: 'openai/gpt-5.5',
      query_time_ms: 10,
      warnings: [],
    });

    render(<Probe />);
    const baseline = renders;

    await act(async () => {
      await useChat.getState().send('Q');
    });

    expect(screen.getByTestId('chats').textContent).toBe('1');
    expect(screen.getByTestId('messages').textContent).toBe('2');
    expect(renders - baseline).toBeLessThan(8);
  });
});
