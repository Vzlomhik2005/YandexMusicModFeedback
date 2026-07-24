// ===== НАСТРОЙКИ – ЗАМЕНИ НА СВОИ =====
const OWNER = 'Vzlomhik2005';
const REPO = 'YandexMusicModFeedback';
const TOKEN = process.env.GITHUB_TOKEN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '12345';

export default async function handler(req, res) {
  // Разрешаем только DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const password = req.headers['x-admin-password'];

  // Проверка пароля
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }

  if (!id) {
    return res.status(400).json({ error: 'ID отзыва не указан' });
  }

  try {
    // Закрываем issue (отзыв перестаёт показываться на сайте)
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/issues/${id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `token ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: 'closed' }),
      }
    );

    if (!response.ok) throw new Error('GitHub API error');
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления отзыва' });
  }
}