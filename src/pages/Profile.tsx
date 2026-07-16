import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/common/Toast';
import Logo from '../components/UI/Logo/Logo';
import Nav from '../components/UI/Nav/Nav';
import ProfileButton from '../components/UI/ProfileButton/ProfileButton';
import Input from '../components/UI/Input/Input';
import Avatar from '../components/Avatar';

export default function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика сохранения профиля
    showToast('Профиль обновлён', 'success');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '2px solid #22C55E' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <Nav links={[
            { label: 'Мои участки', to: '/' },
            { label: 'Каталог культур', to: '/catalog' }
          ]} />
          <ProfileButton userId={user.id} firstName={user.firstName} />
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 40px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          
          {/* Аватар и заголовок */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', marginBottom: '16px' }}>
              <Avatar userId={user.id} firstName={user.firstName} size={80} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937', margin: '0 0 8px 0' }}>
              {user.firstName} {user.lastName}
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              {user.email}
            </p>
          </div>

          {/* Форма редактирования */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <Input
              label="Имя"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Введите имя"
            />

            <Input
              label="Фамилия"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Введите фамилию"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Введите email"
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#374151',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Отмена
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#22C55E',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: 'white',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}