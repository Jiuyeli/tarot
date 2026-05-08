export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'Jiuyeli/tarot';

    if (!token) {
        return res.status(500).json({ error: 'Server: GITHUB_TOKEN not set' });
    }

    try {
        const { body } = req.body;

        if (!body || !body.trim()) {
            return res.status(400).json({ error: '建议内容不能为空' });
        }

        const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'tarot-suggest'
            },
            body: JSON.stringify({
                title: '匿名建议',
                body: `> 来自塔罗网站的匿名建议\n\n${body}`,
                labels: ['suggestion']
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: `GitHub API error: ${errText}` });
        }

        const data = await response.json();
        return res.status(200).json({ success: true, issue_url: data.html_url });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
