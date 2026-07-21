// src/pages/Profile.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/UI/Header/Header';
import Input from '../components/UI/Input/Input';
import ActionButton from '../components/UI/ActionButton';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [email] = useState(user?.email || '');

  const handleSave = () => {
    // TODO: API для обновления профиля
    console.log('Сохранить профиль:', { displayName, email });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const displayNameForHeader = user.display_name || 'Пользователь';
  const userId = user.id || 'user';

  return (
    <div style={styles.page}>
      <Header userId={userId} firstName={displayNameForHeader} />

      <main style={styles.main}>
        <div style={styles.container}>
          <h1 style={styles.title}>Профиль</h1>

          <div style={styles.card}>
            {/* Email (только для чтения) */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email</label>
              <Input
                value={email}
                onChange={() => {}}
                placeholder="Email"
                disabled
              />
            </div>

            {/* Имя */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Имя</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Введите имя"
              />
            </div>

            {/* Кнопки в одну строку */}
            <div style={styles.actionsRow}>
              <ActionButton
                title="Отмена"
                shape="text"
                onClick={() => navigate('/')}
              />
              <ActionButton
                title="Сохранить"
                color="greenLight"
                shape="text"
                onClick={handleSave}
              />
              <ActionButton
                title="Выйти"
                color="red"
                shape="text"
                onClick={handleLogout}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
  },
  main: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1F2937',
    margin: '0 0 24px 0',
  },
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
  },
  // ✅ Кнопки в одну строку
  actionsRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
    flexWrap: 'wrap' as const,
  },
};