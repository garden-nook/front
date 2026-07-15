import React, { useState } from 'react';
import SearchBar from '../components/UI/SearchBar/SearchBar';
import CropCard from '../components/UI/CropCard/CropCard';
import CropDetailModal from '../components/UI/CropDetailModal/CropDetailModal';
import type { Crop } from '../types/crop';

// Временные данные — 10 карточек Томата
const tomato: Crop = {
  id: '1',
  name: 'Томат',
  family: 'Паслёновые',
  group: 'Овощные',
  vegetationDays: 150,
  soilNeeds: 'Глинистая',
  lightNeeds: 'Полутень',
  description: 'Популярная овощная культура, требует тепла и регулярного полива.',
  predecessors: {
    good: ['Огурец', 'Капуста', 'Кабачок'],
    bad: ['Картофель', 'Баклажан', 'Перец']
  },
  neighbors: {
    good: ['Морковь', 'Свекла', 'Лук'],
    bad: ['Горох', 'Фенхель']
  },
  following: ['Зелень', 'Редис'],
  feeding: 'Азотные удобрения',
  enrichment: 'Компост'
};

const mockCrops: Crop[] = Array.from({ length: 10 }, (_, index) => ({
  ...tomato,
  id: String(index + 1),
}));

const pageStyles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    paddingTop: '10px',
  },
  main: {
    padding: '16px 20px 40px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 100px', // ← Отступы для всего контейнера
  },
  searchWrapper: {
    width: '99%',
    margin: '0 0 20px 0',

  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '25px',
    // Убираем padding: '0 16px' — теперь он на контейнере
  },
  empty: {
    textAlign: 'center' as const,
    color: '#6B7280',
    fontSize: '16px',
    padding: '40px 0',
  },
};

const Catalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  const filteredCrops = mockCrops.filter(crop =>
    crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.family.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={pageStyles.page}>
      <main style={pageStyles.main}>
        <div style={pageStyles.container}>
          <div style={pageStyles.searchWrapper}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Поиск культур по названию или семейству"
            />
          </div>
          <div style={pageStyles.grid}>
            {filteredCrops.map(crop => (
              <CropCard
                key={crop.id}
                {...crop}
                onClick={() => setSelectedCrop(crop)}
              />
            ))}
          </div>
          {filteredCrops.length === 0 && (
            <p style={pageStyles.empty}>Ничего не найдено</p>
          )}
        </div>
      </main>
      {selectedCrop && (
        <CropDetailModal
          crop={selectedCrop}
          onClose={() => setSelectedCrop(null)}
        />
      )}
    </div>
  );
};

export default Catalog;