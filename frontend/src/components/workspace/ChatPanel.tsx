'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getConversation, sendChatMessage, ApiError } from '@/lib/api';
import { getOrCreateSessionId } from '@/lib/session';
import { cn } from '@/lib/utils';

const SUGGESTED_QUESTIONS = [
  'Why is this file relevant?',
  'What should I change first?',
  'What tests should I add?',
];

export function ChatPanel({ owner, repo, issueNumber }: { owner: string; repo: string; issueNumber: number }) {
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR(
    sessionId ? { owner, repo, issueNumber, sessionId, kind: 'chat' } : null,
    () => getConversation(owner, repo, issueNumber, sessionId).then((res) => res.messages)
  );

  const messages = data ?? [];

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setSendError(null);
    setInput('');

    try {
      const res = await sendChatMessage({ owner, repo, issueNumber, sessionId, message: trimmed });
      await mutate(res.messages, { revalidate: false });
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI Chat</CardTitle>
        <CardDescription>Ask questions about this issue and the codebase.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
                  m.role === 'user' ? 'self-end bg-primary text-primary-foreground' : 'self-start bg-muted'
                )}
              >
                {m.content}
              </div>
            ))}
            {sending && <div className="self-start text-xs text-muted-foreground">ContribFlow is thinking…</div>}
          </div>
        )}

        {sendError && (
          <Alert variant="destructive">
            <AlertDescription>{sendError}</AlertDescription>
          </Alert>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this issue…"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !input.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
