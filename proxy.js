export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server: DEEPSEEK_API_KEY not set' });
    }

    try {
        const { systemPrompt, userPrompt } = req.body;

        // 8 秒内部超时：留 2 秒给 Vercel 返回响应，避免被硬杀后客户端收到空响应
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8,
                max_tokens: 2048,
                stream: false
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: `DeepSeek API error: ${errText}` });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        if (error.name === 'AbortError') {
            return res.status(504).json({ error: 'AI 服务响应超时，请稍后重试' });
        }
        return res.status(500).json({ error: error.message });
    }
}
