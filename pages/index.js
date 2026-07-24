import { useState, useEffect } from 'react';

export default function Home() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [platform, setPlatform] = useState('Windows');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  // Загружаем отзывы при открытии страницы
  useEffect(() => {
    fetch('/api/feedback')
      .then(r => r.json())
      .then(setFeedbacks)
      .catch(() => setFeedbacks([]));
  }, []);

  // Отправка нового отзыва
  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return alert('Напишите текст отзыва');
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, text, platform, rating }),
      });
      if (res.ok) {
        alert('Спасибо за отзыв!');
        setText('');
        setAuthor('');
        setRating(5);
        const updated = await fetch('/api/feedback').then(r => r.json());
        setFeedbacks(updated);
      } else {
        alert('Ошибка при отправке');
      }
    } catch {
      alert('Ошибка сети');
    }
    setLoading(false);
  };

  // Удаление отзыва (с паролем)
  const deleteFeedback = async (id) => {
    const pwd = prompt('Введите пароль администратора:');
    if (!pwd) return;
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': pwd },
      });
      if (res.ok) {
        alert('Отзыв удалён');
        const updated = await fetch('/api/feedback').then(r => r.json());
        setFeedbacks(updated);
      } else {
        alert('Неверный пароль или ошибка');
      }
    } catch {
      alert('Ошибка сети');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>📝 Отзывы о Yandex Music Mod</h1>

      {/* ——— ФОРМА ОТПРАВКИ ——— */}
      <form onSubmit={submit} style={{ background: '#f5f5f5', padding: 20, borderRadius: 10 }}>
        <input
          type="text"
          placeholder="Ваше имя (необязательно)"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box' }}
        />
        <select
          value={platform}
          onChange={e => setPlatform(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 8, marginBottom: 10 }}
        >
          <option>Windows</option>
          <option>Linux</option>
          <option>macOS</option>
        </select>
        <div style={{ marginBottom: 10 }}>
          <span style={{ marginRight: 10 }}>Оценка:</span>
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              onClick={() => setRating(star)}
              style={{
                fontSize: 30,
                cursor: 'pointer',
                color: star <= rating ? '#f5c518' : '#ccc',
                transition: '0.2s'
              }}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          placeholder="Ваш отзыв..."
          value={text}
          onChange={e => setText(e.target.value)}
          required
          style={{ display: 'block', width: '100%', height: 100, padding: 8, marginBottom: 10, boxSizing: 'border-box' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '10px 30px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
          {loading ? 'Отправка...' : 'Отправить'}
        </button>
      </form>

      {/* ——— СПИСОК ОТЗЫВОВ ——— */}
      <h2 style={{ marginTop: 30 }}>💬 Все отзывы ({feedbacks.length})</h2>
      {feedbacks.length === 0 && <p>Пока нет отзывов. Будьте первым!</p>}
      {feedbacks.map(f => (
        <div key={f.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 15, marginBottom: 10, background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{f.author || 'Аноним'}</strong>
              <span style={{ marginLeft: 10, color: '#666' }}>{f.platform || 'Не указана'}</span>
              <span style={{ marginLeft: 10, color: '#f5c518' }}>{'★'.repeat(f.rating || 0)}</span>
            </div>
            <button onClick={() => deleteFeedback(f.id)} style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
              🗑 Удалить
            </button>
          </div>
          <p style={{ margin: '10px 0 5px' }}>{f.text}</p>
          <small style={{ color: '#999' }}>{new Date(f.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}