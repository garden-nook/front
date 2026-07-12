import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';

interface CropInfo {
  id: string;
  name: string;
  family: string;
  group: string;
  vegetationDays: number;
  soilNeeds: string;
  lightNeeds: string;
  waterNeeds: string;
  temperature: string;
  description: string;
  plantingTips: string[];
  careTips: string[];
  plantingMonths: string[];
  compatibleCrops: string[];
  incompatibleCrops: string[];
  image: string;
}

const cropsData: CropInfo[] = [
  {
    id: '1',
    name: 'Томат',
    family: 'Паслёновые',
    group: 'Плодовые',
    vegetationDays: 120,
    soilNeeds: 'Суглинок, нейтральная кислотность (pH 6.0-6.8)',
    lightNeeds: 'Полное солнце (6-8 часов в день)',
    waterNeeds: 'Умеренный, 2-3 раза в неделю',
    temperature: 'Теплолюбивый, оптимально 20-25°C',
    description: 'Томат — одна из самых популярных овощных культур. Требует тёплого климата, хорошего освещения и регулярного полива. Хорошо растёт в теплицах и открытом грунте.',
    plantingTips: [
      'Высаживайте рассаду после последних заморозков',
      'Расстояние между растениями 50-70 см',
      'Используйте опоры или шпалеры для высокорослых сортов',
      'Мульчируйте почву для сохранения влаги',
    ],
    careTips: [
      'Регулярно удаляйте пасынки',
      'Подкармливайте каждые 2 недели',
      'Поливайте под корень, избегая попадания на листья',
      'Проветривайте теплицу для профилактики болезней',
    ],
    plantingMonths: ['Март (рассада)', 'Май (высадка)', 'Июнь-Июль (плодоношение)'],
    compatibleCrops: ['Базилик', 'Морковь', 'Лук', 'Чеснок', 'Салат', 'Петрушка'],
    incompatibleCrops: ['Картофель', 'Огурец', 'Фенхель', 'Капуста'],
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&h=400&fit=crop',
  },
  {
    id: '2',
    name: 'Огурец',
    family: 'Тыквенные',
    group: 'Плодовые',
    vegetationDays: 55,
    soilNeeds: 'Рыхлый, плодородный, pH 6.0-7.0',
    lightNeeds: 'Полное солнце или лёгкая полутень',
    waterNeeds: 'Обильный, ежедневно в жару',
    temperature: 'Теплолюбивый, оптимально 22-28°C',
    description: 'Огурец — быстрорастущая культура, требующая регулярного полива и тёплого климата. Хорошо растёт на шпалерах и в расстил.',
    plantingTips: [
      'Высевайте семена после прогрева почвы до 15°C',
      'Расстояние между растениями 30-40 см',
      'Используйте шпалеры для экономии места',
      'Не допускайте пересыхания почвы',
    ],
    careTips: [
      'Поливайте тёплой водой',
      'Собирайте плоды каждые 1-2 дня',
      'Подкармливайте органическими удобрениями',
      'Защищайте от ветра',
    ],
    plantingMonths: ['Май (посев)', 'Июнь-Август (плодоношение)'],
    compatibleCrops: ['Горох', 'Фасоль', 'Капуста', 'Свёкла', 'Салат', 'Укроп'],
    incompatibleCrops: ['Томат', 'Картофель', 'Ароматические травы'],
    image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=600&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'Морковь',
    family: 'Зонтичные',
    group: 'Корнеплоды',
    vegetationDays: 90,
    soilNeeds: 'Рыхлая, песчаная, без камней',
    lightNeeds: 'Полное солнце',
    waterNeeds: 'Умеренный, регулярный',
    temperature: 'Холодостойкая, оптимально 15-20°C',
    description: 'Морковь — холодостойкий корнеплод, требующий рыхлой почвы. Не переносит свежий навоз и камни в почве.',
    plantingTips: [
      'Высевайте семена ранней весной',
      'Почва должна быть глубоко перекопана',
      'Не используйте свежий навоз',
      'Прореживайте всходы на расстоянии 5-7 см',
    ],
    careTips: [
      'Регулярно пропалывайте',
      'Не допускайте образования корки',
      'Поливайте равномерно',
      'Окучивайте для предотвращения позеленения',
    ],
    plantingMonths: ['Апрель-Май (посев)', 'Июль-Октябрь (уборка)'],
    compatibleCrops: ['Лук', 'Чеснок', 'Томат', 'Горох', 'Салат', 'Редис'],
    incompatibleCrops: ['Укроп', 'Фенхель', 'Свёкла'],
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&h=400&fit=crop',
  },
  {
    id: '4',
    name: 'Салат',
    family: 'Астровые',
    group: 'Листовые',
    vegetationDays: 40,
    soilNeeds: 'Плодородный, влажный, pH 6.0-7.0',
    lightNeeds: 'Полутень или рассеянный свет',
    waterNeeds: 'Регулярный, не допускать пересыхания',
    temperature: 'Холодостойкий, оптимально 15-20°C',
    description: 'Салат — быстрорастущая культура, идеально подходит для конвейерных посадок. Можно выращивать весь сезон.',
    plantingTips: [
      'Высевайте каждые 2 недели для непрерывного урожая',
      'Не заглубляйте семена (0.5 см)',
      'Подходит для уплотнённых посадок',
      'Выращивайте в полутени летом',
    ],
    careTips: [
      'Регулярно поливайте',
      'Собирайте молодые листья',
      'Не допускайте перегрева',
      'Защищайте от слизней',
    ],
    plantingMonths: ['Апрель-Сентябрь (посев)', 'Май-Октябрь (уборка)'],
    compatibleCrops: ['Морковь', 'Редис', 'Огурец', 'Клубника', 'Горох'],
    incompatibleCrops: ['Петрушка', 'Сельдерей'],
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a5?w=600&h=400&fit=crop',
  },
  {
    id: '5',
    name: 'Редис',
    family: 'Капустные',
    group: 'Корнеплоды',
    vegetationDays: 25,
    soilNeeds: 'Рыхлый, плодородный, влажный',
    lightNeeds: 'Полутень или полное солнце',
    waterNeeds: 'Регулярный, обильный',
    temperature: 'Холодостойкий, оптимально 10-18°C',
    description: 'Редис — самая быстрорастущая культура, идеальна для уплотнённых посадок и раннего урожая.',
    plantingTips: [
      'Высевайте ранней весной или осенью',
      'Расстояние между семенами 3-5 см',
      'Не допускайте перерастания (становится горьким)',
      'Подходит для межрядных посадок',
    ],
    careTips: [
      'Регулярно поливайте',
      'Прореживайте вовремя',
      'Собирайте в срок (25-30 дней)',
      'Защищайте от крестоцветной блошки',
    ],
    plantingMonths: ['Март-Май', 'Август-Сентябрь'],
    compatibleCrops: ['Морковь', 'Салат', 'Шпинат', 'Горох', 'Фасоль'],
    incompatibleCrops: ['Иссоп', 'Огурец'],
    image: 'https://images.unsplash.com/photo-1612257998931-c5c344e0c3d4?w=600&h=400&fit=crop',
  },
  {
    id: '6',
    name: 'Картофель',
    family: 'Паслёновые',
    group: 'Корнеплоды',
    vegetationDays: 90,
    soilNeeds: 'Рыхлый, плодородный, pH 5.0-6.0',
    lightNeeds: 'Полное солнце',
    waterNeeds: 'Умеренный, особенно в период цветения',
    temperature: 'Умеренный, оптимально 15-20°C',
    description: 'Картофель — основная культура, сильно истощает почву. Требует окучивания и регулярного ухода.',
    plantingTips: [
      'Проращивайте клубни перед посадкой',
      'Расстояние между растениями 30-40 см',
      'Не сажайте после томатов и перца',
      'Используйте здоровый семенной материал',
    ],
    careTips: [
      'Окучивайте 2-3 раза за сезон',
      'Подкармливайте органикой',
      'Обрабатывайте от колорадского жука',
      'Не допускайте пересыхания',
    ],
    plantingMonths: ['Май (посадка)', 'Август-Сентябрь (уборка)'],
    compatibleCrops: ['Фасоль', 'Капуста', 'Кукуруза', 'Горох'],
    incompatibleCrops: ['Томат', 'Огурец', 'Тыква', 'Подсолнечник'],
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber630?w=600&h=400&fit=crop',
  },
  {
    id: '7',
    name: 'Лук репчатый',
    family: 'Луковые',
    group: 'Луковые',
    vegetationDays: 100,
    soilNeeds: 'Плодородный, рыхлый, pH 6.5-7.5',
    lightNeeds: 'Полное солнце',
    waterNeeds: 'Умеренный, сокращайте перед уборкой',
    temperature: 'Холодостойкий, оптимально 15-25°C',
    description: 'Лук — хороший предшественник для многих культур. Природный антисептик, отпугивает вредителей.',
    plantingTips: [
      'Высаживайте севок весной',
      'Расстояние между растениями 10-15 см',
      'Не заглубляйте луковицы',
      'Хороший предшественник для томатов',
    ],
    careTips: [
      'Регулярно пропалывайте',
      'Не переувлажняйте',
      'Прекратите полив за 2 недели до уборки',
      'Сушите после уборки',
    ],
    plantingMonths: ['Апрель-Май (посадка)', 'Август (уборка)'],
    compatibleCrops: ['Морковь', 'Томат', 'Свёкла', 'Салат', 'Клубника'],
    incompatibleCrops: ['Фасоль', 'Горох', 'Шалфей'],
    image: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=600&h=400&fit=crop',
  },
  {
    id: '8',
    name: 'Чеснок',
    family: 'Луковые',
    group: 'Луковые',
    vegetationDays: 100,
    soilNeeds: 'Плодородный, рыхлый, pH 6.5-7.5',
    lightNeeds: 'Полное солнце',
    waterNeeds: 'Умеренный',
    temperature: 'Холодостойкий, оптимально 15-20°C',
    description: 'Чеснок — природный фунгицид, отпугивает вредителей. Можно высаживать под зиму.',
    plantingTips: [
      'Озимый чеснок высаживайте осенью',
      'Яровой — ранней весной',
      'Расстояние между зубками 10-15 см',
      'Не используйте повреждённые зубки',
    ],
    careTips: [
      'Регулярно пропалывайте',
      'Удаляйте стрелки у озимого',
      'Прекратите полив за 2 недели до уборки',
      'Сушите в тени',
    ],
    plantingMonths: ['Октябрь (озимый)', 'Апрель (яровой)', 'Июль-Август (уборка)'],
    compatibleCrops: ['Томат', 'Морковь', 'Свёкла', 'Клубника', 'Розы'],
    incompatibleCrops: ['Фасоль', 'Горох', 'Капуста'],
    image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2571?w=600&h=400&fit=crop',
  },
];

export default function CropDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const crop = cropsData.find(c => c.id === id);

  if (!crop) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', color: '#1F2937', marginBottom: '16px' }}>Культура не найдена</h2>
          <Link to="/catalog" style={{ color: '#22C55E', textDecoration: 'none' }}>Вернуться в каталог</Link>
        </div>
      </div>
    );
  }

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
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 40px' }}>
        {/* Хлебные крошки */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/catalog" style={{ fontSize: '13px', color: '#22C55E', textDecoration: 'none' }}>
            ← Каталог культур
          </Link>
        </div>

        {/* Заголовок с изображением */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <div style={{ width: '100%', height: '300px', backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
            <img
              src={crop.image}
              alt={crop.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1F2937', margin: '0 0 8px 0' }}>
              {crop.name}
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 16px 0' }}>
              {crop.family} · {crop.group}
            </p>
            <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
              {crop.description}
            </p>
          </div>
        </div>

        {/* Характеристики */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Вегетация
            </h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>
              {crop.vegetationDays} <span style={{ fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>дней</span>
            </p>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Почва
            </h3>
            <p style={{ fontSize: '15px', color: '#1F2937', margin: 0 }}>
              {crop.soilNeeds}
            </p>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Освещение
            </h3>
            <p style={{ fontSize: '15px', color: '#1F2937', margin: 0 }}>
              {crop.lightNeeds}
            </p>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Полив
            </h3>
            <p style={{ fontSize: '15px', color: '#1F2937', margin: 0 }}>
              {crop.waterNeeds}
            </p>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Температура
            </h3>
            <p style={{ fontSize: '15px', color: '#1F2937', margin: 0 }}>
              {crop.temperature}
            </p>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Сроки посадки
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {crop.plantingMonths.map((month, idx) => (
                <p key={idx} style={{ fontSize: '14px', color: '#1F2937', margin: 0 }}>
                  {month}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Советы */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" fill="none" stroke="#22C55E" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Советы по посадке
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {crop.plantingTips.map((tip, idx) => (
                <li key={idx} style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.5 }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" fill="none" stroke="#3B82F6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Советы по уходу
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {crop.careTips.map((tip, idx) => (
                <li key={idx} style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.5 }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Совместимость */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '24px', border: '1px solid #86EFAC' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#166534', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" fill="none" stroke="#22C55E" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Хорошие соседи
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {crop.compatibleCrops.map((cropName, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    fontSize: '13px',
                    color: '#166534',
                    border: '1px solid #86EFAC',
                  }}
                >
                  {cropName}
                </span>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#FEF2F2', borderRadius: '8px', padding: '24px', border: '1px solid #FCA5A5' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#991B1B', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" fill="none" stroke="#EF4444" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Плохие соседи
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {crop.incompatibleCrops.map((cropName, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    fontSize: '13px',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5',
                  }}
                >
                  {cropName}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}