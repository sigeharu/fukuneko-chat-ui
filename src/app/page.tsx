'use client';

import { useState } from 'react';
import { useEffect, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'shigechan',
          message: input,
        }),
      });

      const data = await res.json();
      const reply = { role: 'assistant', content: data.reply };
      setMessages((prev) => [...prev, reply]);
    } catch (error) {
      console.error('エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-8 px-4">
      <h1 className="text-3xl font-extrabold text-gray-700 mb-4 text-center mb-6">
        🐾 福ねこそば道場 チャット受付
      </h1>

      <div className="w-full max-w-xl h-[400px] bg-white border border-gray-300 rounded-lg p-4 overflow-y-scroll flex flex-col space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-blue-100 self-end text-gray-800'
                : 'bg-gray-200 self-start text-gray-800'
            }`}
          >
            <strong>{msg.role === 'user' ? '👤 あなた' : '🤖 プリ'}</strong>
            <div className="mt-1">{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="text-sm text-gray-400 text-center">🤖 プリが考え中です…</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 w-full max-w-xl flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none text-gray-800 bg-white"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
        >
          送信
        </button>
      </div>
    </main>
  );
}