import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const memory: Record<string, Message[]> = {};

export async function POST(req: Request) {
  try {
    const { userId, message } = await req.json();

    if (!userId || !message) {
      return Response.json({ error: 'Missing userId or message' }, { status: 400 });
    }

    // 文脈保持（初回のみsystemプロンプト）
    if (!memory[userId]) {
      memory[userId] = [
        {
          role: 'system',
          content: 'あなたは福ねこそば道場の受付スタッフです。優しく丁寧に日本語で対応してください。',
        },
      ];
    }

    memory[userId].push({ role: 'user', content: message });

    const chat = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: memory[userId],
    });

    const reply = chat.choices[0]?.message?.content ?? '返答が見つかりませんでした。';
    memory[userId].push({ role: 'assistant', content: reply });

    // 会話履歴は20件までに制限
    memory[userId] = [memory[userId][0], ...memory[userId].slice(-19)];

    return Response.json({ reply });
  } catch (err) {
    console.error('[API ERROR]', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}