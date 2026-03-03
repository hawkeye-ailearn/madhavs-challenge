export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject } = req.body || {};

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        system:
          'You generate trivia questions for 2nd graders (age 7-8). ' +
          'Respond ONLY with a valid JSON object — no markdown, no explanation. ' +
          'Format: {"question":"...","options":["A","B","C","D"],"answer":"...","subject":"..."}',
        messages: [
          {
            role: 'user',
            content: subject
              ? `Give me one fun ${subject} trivia question for a 2nd grader.`
              : 'Give me one fun trivia question for a 2nd grader.',
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: `Anthropic error: ${text}` });
    }

    const data = await response.json();
    const text = data.content[0].text.trim();
    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
