import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';

interface Crop {
  id: string;
  name: string;
  family: string;
  group: string;
  vegetationDays: number;
  soilNeeds: string;
  lightNeeds: string;
  image: string;
  description: string;
}

const mockCrops: Crop[] = [
  {
    id: '1',
    name: 'Томат',
    family: 'Паслёновые',
    group: 'Плодовые',
    vegetationDays: 120,
    soilNeeds: 'Суглинок',
    lightNeeds: 'Полное солнце',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop',
    description: 'Теплолюбивая культура, требовательна к свету и питанию.',
  },
  {
    id: '2',
    name: 'Огурец',
    family: 'Тыквенные',
    group: 'Плодовые',
    vegetationDays: 55,
    soilNeeds: 'Суглинок',
    lightNeeds: 'Полное солнце',
    image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=200&h=200&fit=crop',
    description: 'Быстрорастущая культура, любит влагу и тепло.',
  },
  {
    id: '3',
    name: 'Морковь',
    family: 'Зонтичные',
    group: 'Корнеплоды',
    vegetationDays: 90,
    soilNeeds: 'Песчаная',
    lightNeeds: 'Полное солнце',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop',
    description: 'Хорошо растёт на рыхлых почвах, не переносит свежий навоз.',
  },
  {
    id: '4',
    name: 'Салат',
    family: 'Астровые',
    group: 'Листовые',
    vegetationDays: 40,
    soilNeeds: 'Суглинок',
    lightNeeds: 'Полутень',
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a5?w=200&h=200&fit=crop',
    description: 'Быстрорастущая культура, подходит для конвейерных посадок.',
  },
  {
    id: '5',
    name: 'Редис',
    family: 'Капустные',
    group: 'Корнеплоды',
    vegetationDays: 25,
    soilNeeds: 'Суглинок',
    lightNeeds: 'Полутень',
    image: 'https://images.unsplash.com/photo-1612257998931-c5c344e0c3d4?w=200&h=200&fit=crop',
    description: 'Самая быстрорастущая культура, идеальна для уплотнённых посадок.',
  },
  {
    id: '6',
    name: 'Картофель',
    family: 'Паслёновые',
    group: 'Корнеплоды',
    vegetationDays: 90,
    soilNeeds: 'Суглинок',
    lightNeeds: 'Полное солнце',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber630?w=200&h=200&fit=crop',
    description: 'Основная культура, сильно истощает почву.',
  },
  {
    id: '7',
    name: 'Лук репчатый',
    family: 'Луковые',
    group: 'Луковые',
    vegetationDays: 100,
    soilNeeds: 'Суглинок',
    lightNeeds: 'Полное солнце',
    image: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=200&h=200&fit=crop',
    description: 'Хороший предшественник для многих культур.',
  },
  {
    id: '8',
    name: 'Чеснок',
    family: 'Луковые',
    group: 'Луковые',
    vegetationDays: 100,
    soilNeeds: 'Суглинок',
    lightNeeds: 'Полное солнце',
    image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2571?w=200&h=200&fit=crop',
    description: 'Природный фунгицид, отпугивает вредителей.',
  },
];

const GROUPS = ['Все', 'Плодовые', 'Корнеплоды', 'Листовые', 'Луковые'];
const LIGHT_NEEDS = ['Все', 'Полное солнце', 'Полутень', 'Тень'];

export default function Catalog() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Все');
  const [selectedLight, setSelectedLight] = useState('Все');

  const filteredCrops = useMemo(() => {
    return mockCrops.filter((crop) => {
      const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            crop.family.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = selectedGroup === 'Все' || crop.group === selectedGroup;
      const matchesLight = selectedLight === 'Все' || crop.lightNeeds === selectedLight;
      return matchesSearch && matchesGroup && matchesLight;
    });
  }, [searchQuery, selectedGroup, selectedLight]);

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '2px solid #22C55E' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>
            Огородный уголок
          </h1>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to="/" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
              Мои участки
            </Link>
            <Link to="/catalog" style={{ fontSize: '14px', fontWeight: 500, color: '#22C55E', textDecoration: 'none' }}>
              Каталог культур
            </Link>
            <Link to="/tasks" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
              Задачи
            </Link>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <Avatar 
                userId={user.id} 
                firstName={user.firstName} 
                size={32}
              />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 40px' }}>
        {/* Заголовок страницы */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937', margin: '0 0 8px 0' }}>
            Каталог культур
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Выберите подходящие растения для вашего огорода
          </p>
        </div>

        {/* Панель поиска и фильтров */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          {/* Поиск */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию или семейству..."
              style={{
                width: '100%',
                padding: '10px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Фильтры */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Фильтр по группе */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: 500 }}>
                Группа культур
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {GROUPS.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setSelectedGroup(group)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: selectedGroup === group ? '#22C55E' : '#E5E7EB',
                      backgroundColor: selectedGroup === group ? '#DCFCE7' : 'white',
                      color: selectedGroup === group ? '#16A34A' : '#6B7280',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Фильтр по освещённости */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: 500 }}>
                Освещённость
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {LIGHT_NEEDS.map((light) => (
                  <button
                    key={light}
                    type="button"
                    onClick={() => setSelectedLight(light)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: selectedLight === light ? '#22C55E' : '#E5E7EB',
                      backgroundColor: selectedLight === light ? '#DCFCE7' : 'white',
                      color: selectedLight === light ? '#16A34A' : '#6B7280',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {light}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Сетка карточек */}
        {filteredCrops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
            <p style={{ fontSize: '18px', margin: 0 }}>Ничего не найдено</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredCrops.map((crop) => (
              <Link
                key={crop.id}
                to={`/crop/${crop.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Изображение */}
                  <div style={{ width: '100%', height: '180px', backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
                    <img
                      src={crop.image}
                      alt={crop.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Информация */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', margin: '0 0 4px 0' }}>
                      {crop.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px 0' }}>
                      {crop.family} · {crop.group}
                    </p>

                    {/* Характеристики */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#6B7280' }}>Вегетация:</span>
                        <span style={{ color: '#1F2937', fontWeight: 500 }}>{crop.vegetationDays} дн.</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#6B7280' }}>Почва:</span>
                        <span style={{ color: '#1F2937', fontWeight: 500 }}>{crop.soilNeeds}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#6B7280' }}>Свет:</span>
                        <span style={{ color: '#1F2937', fontWeight: 500 }}>{crop.lightNeeds}</span>
                      </div>
                    </div>

                    {/* Описание */}
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '12px 0 0 0', lineHeight: 1.4 }}>
                      {crop.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}