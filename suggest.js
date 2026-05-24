export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'Jiuyeli/tarot';

    if (!token) {
        console.error('GITHUB_TOKEN not set');
        return res.status(500).json({ error: 'Server: GITHUB_TOKEN not set' });
    }

    try {
        const { body } = req.body;

        if (!body || !body.trim()) {
            return res.status(400).json({ error: '建议内容不能为空' });
        }

        console.log(`Creating issue in ${repo}, body length: ${body.length}`);

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
                body: `> 来自塔罗网站的匿名建议\n\n${body}`
            })
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error(`GitHub API error ${response.status}:`, responseText);
            return res.status(response.status).json({ error: `GitHub API error (${response.status}): ${responseText}` });
        }

        const data = JSON.parse(responseText);
        console.log(`Issue created: ${data.html_url}`);
        return res.status(200).json({ success: true, issue_url: data.html_url });
    } catch (error) {
        console.error('Suggest error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}
