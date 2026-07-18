import { describe, it, expect, beforeEach, vi } from 'vitest';

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

const { useChat } = await import('./chat');
const { VedaApiRequestError } = await import('@/lib/api');

function reset() {
  useChat.setState({ conversations: {}, order: [], activeId: null, thinking: false });
  askMock.mockReset();
}

function answer(text: string) {
  return {
    answer: text,
    citations: [],
    evidence: [],
    confidence: 0.9,
    model_used: 'openai/gpt-5.5',
    query_time_ms: 120,
    warnings: [],
  };
}

describe('chat store', () => {
  beforeEach(reset);

  it('keeps both turns in the thread across two questions', async () => {
    askMock.mockResolvedValueOnce(answer('A1')).mockResolvedValueOnce(answer('A2'));

    await useChat.getState().send('Q1');
    await useChat.getState().send('Q2');

    const { activeId, conversations } = useChat.getState();
    const messages = conversations[activeId!]!.messages;

    // The reported bug: asking a second question destroyed the first.
    expect(messages.map((m) => m.text)).toEqual(['Q1', 'A1', 'Q2', 'A2']);
    expect(useChat.getState().order).toHaveLength(1);
  });

  it('titles a conversation from its first message', async () => {
    askMock.mockResolvedValue(answer('A'));
    await useChat.getState().send('  What is dharma?  ');

    const { activeId, conversations } = useChat.getState();
    expect(conversations[activeId!]!.title).toBe('What is dharma?');
  });

  it('newChat starts an empty thread but keeps the old one in history', async () => {
    askMock.mockResolvedValue(answer('A'));
    await useChat.getState().send('First');
    const firstId = useChat.getState().activeId;

    useChat.getState().newChat();
    expect(useChat.getState().activeId).toBeNull();
    // No empty record is created until a message is actually sent.
    expect(useChat.getState().order).toEqual([firstId]);

    await useChat.getState().send('Second');
    expect(useChat.getState().order).toHaveLength(2);
    expect(useChat.getState().order[0]).not.toBe(firstId);
  });

  it('restores a past conversation on select', async () => {
    askMock.mockResolvedValue(answer('A'));
    await useChat.getState().send('First');
    const firstId = useChat.getState().activeId!;

    useChat.getState().newChat();
    await useChat.getState().send('Second');

    useChat.getState().selectChat(firstId);
    const messages = useChat.getState().conversations[firstId]!.messages;
    expect(messages.map((m) => m.text)).toEqual(['First', 'A']);
  });

  it('falls back to a new chat when the active conversation is deleted', async () => {
    askMock.mockResolvedValue(answer('A'));
    await useChat.getState().send('Doomed');
    const id = useChat.getState().activeId!;

    useChat.getState().deleteChat(id);
    expect(useChat.getState().activeId).toBeNull();
    expect(useChat.getState().conversations[id]).toBeUndefined();
    expect(useChat.getState().order).toEqual([]);
  });

  it('surfaces a rate limit in-thread and keeps the conversation usable', async () => {
    askMock.mockRejectedValueOnce(new VedaApiRequestError('slow down', 429));
    await useChat.getState().send('Too fast');

    const { activeId, conversations } = useChat.getState();
    const messages = conversations[activeId!]!.messages;
    expect(messages[1]!.role).toBe('error');
    expect(messages[1]!.text).toContain('10 questions per minute');

    // The thread must still accept the next question.
    askMock.mockResolvedValueOnce(answer('Recovered'));
    await useChat.getState().send('Again');
    expect(conversations[activeId!]).toBeDefined();
    expect(useChat.getState().conversations[activeId!]!.messages).toHaveLength(4);
  });

  it('generic failures do not use the rate-limit copy', async () => {
    askMock.mockRejectedValueOnce(new Error('network down'));
    await useChat.getState().send('Offline');

    const { activeId, conversations } = useChat.getState();
    expect(conversations[activeId!]!.messages[1]!.text).toBe(
      'VEDA could not answer right now. Please try again.',
    );
  });

  it('floats a touched conversation to the top of Recent', async () => {
    askMock.mockResolvedValue(answer('A'));
    await useChat.getState().send('One');
    const first = useChat.getState().activeId!;
    useChat.getState().newChat();
    await useChat.getState().send('Two');

    expect(useChat.getState().order[1]).toBe(first);

    useChat.getState().selectChat(first);
    await useChat.getState().send('More');
    expect(useChat.getState().order[0]).toBe(first);
  });

  it('ignores empty input and refuses concurrent sends', async () => {
    await useChat.getState().send('   ');
    expect(askMock).not.toHaveBeenCalled();
    expect(useChat.getState().order).toEqual([]);

    useChat.setState({ thinking: true });
    await useChat.getState().send('while busy');
    expect(askMock).not.toHaveBeenCalled();
  });
});
