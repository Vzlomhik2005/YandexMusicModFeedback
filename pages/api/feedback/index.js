// ===== НАСТРОЙКИ – ЗАМЕНИ НА СВОИ =====
const OWNER = 'Vzlomhik2005';        // твой ник на GitHub
const REPO = 'YandexMusicModFeedback'; // название репозитория
const TOKEN = process.env.GITHUB_TOKEN;

export default async function handler(req, res) {
  // === GET – получить все открытые отзывы ===
  if (req.method === 'GET') {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/issues?labels=feedback&state=open`,
        { headers: { Authorization: `token ${TOKEN}` } }
      );
      if (!response.ok) throw new Error('GitHub API error');
      const issues = await response.json();

      const feedbacks = issues.map(issue => {
        const body = issue.body || '';
        const match = body.match(/<!-- data: (.*?) -->/);
        let data = { author: 'Аноним', platform: 'Не указана', rating: 0 };
        if (match) {
          try { data = JSON.parse(match[1]); } catch {}
        }
        // Если не спарсилось – вытаскиваем из Markdown
        const textMatch = body.split('**Отзыв:**');
        const text = textMatch.length > 1 ? textMatch[1].trim() : body;
        return {
          id: issue.number,
          ...data,
          text: text,
          createdAt: issue.created_at,
        };
      });

      res.status(200).json(feedbacks);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка загрузки отзывов' });
    }
    return;
  }

  // === POST – создать новый отзыв ===
  if (req.method === 'POST') {
    const { author, text, platform, rating } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Текст отзыва обязателен' });
    }

    const title = `Отзыв от ${author || 'Аноним'}`;
    const body = `<!-- data: ${JSON.stringify({ author, platform, rating })} -->\n\n**Автор:** ${author || 'Аноним'}\n**Платформа:** ${platform}\n**Оценка:** ${'★'.repeat(rating || 0)}\n\n**Отзыв:**\n${text}`;

    try {
      const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/issues`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            body,
            labels: ['feedback'],
          }),
        }
      );
      if (!response.ok) throw new Error('GitHub API error');
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка отправки отзыва' });
    }
    return;
  }

  // === Другие методы – не поддерживаются ===
  res.status(405).json({ error: 'Method not allowed' });
}