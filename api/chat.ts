// api/chat.ts
const SYSTEM = `Kamu adalah asisten kalkulator profit untuk pelaku UMKM Indonesia di aplikasi ProfitRiddle.
Aturan:
- Jawab dalam bahasa Indonesia yang sederhana, singkat (maksimal 5-6 kalimat atau poin).
- Gunakan HANYA angka dari "Data usaha". Jangan mengarang atau menghitung angka baru sendiri.
- Untuk simulasi harga, arahkan pengguna menulis contoh seperti "Bagaimana jika harga turun 10%?".
- Fokus pada harga, margin, HPP, break-even, pemasaran, dan strategi usaha kecil.
- Jika pertanyaan di luar topik usaha, tolak dengan sopan.`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { message, context, history } = req.body ?? {};
  if (typeof message !== 'string' || !message.trim() || message.length > 500) {
    return res.status(400).json({ error: 'invalid_message' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'missing_key' });
  const model = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash';

  const past = Array.isArray(history) ? history.slice(-6) : [];
  const contents = [
    ...past.map((h: { role: string; text: string }) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(h.text).slice(0, 800) }],
    })),
    {
      role: 'user',
      parts: [
        { text: `Data usaha:\n${String(context ?? '').slice(0, 1500)}\n\nPertanyaan: ${message}` },
      ],
    },
  ];

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents,
          generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
        }),
      },
    );

    if (!upstream.ok) return res.status(502).json({ error: 'upstream_error' });

    const data = await upstream.json();
    const text = (data?.candidates?.[0]?.content?.parts ?? [])
      .map((p: { text?: string }) => p.text ?? '')
      .join('')
      .trim();

    if (!text) return res.status(502).json({ error: 'empty' });
    return res.status(200).json({ text });
  } catch {
    return res.status(500).json({ error: 'server_error' });
  }
}