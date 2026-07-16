import React, { useState, useEffect } from 'react';
import Header from '../components/UI/Header/Header';
import SearchBar from '../components/UI/SearchBar/SearchBar';
import CropCard from '../components/UI/CropCard/CropCard';
import CropDetailModal from '../components/UI/CropDetailModal/CropDetailModal';
import { getCrops, getCropById, type Crop } from '../api/crops';
import type { Crop as CropType } from '../types/crop';

const pageStyles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    paddingTop: '0px',
  },
  main: {
    padding: '16px 20px 40px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 100px',
  },
  searchWrapper: {
    width: '99%',
    margin: '0 0 20px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '25px',
  },
  emptyWrapper: {
    display: 'flex',
    justifyContent: 'center',     // ← Центрирование по горизонтали
    alignItems: 'center',         // ← Центрирование по вертикали
    minHeight: '100px',           // ← Высота, чтобы текст был заметен
    width: '100%',
  },
  empty: {
    textAlign: 'center' as const,
    color: '#6B7280',
    fontSize: '18px',
    fontWeight: 500,
    padding: '40px 0',
  },
  loading: {
    textAlign: 'center' as const,
    color: '#6B7280',
    fontSize: '16px',
    padding: '40px 0',
  },
};

const Catalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCropDetail, setSelectedCropDetail] = useState<CropType | null>(null);

  const loadCrops = async (search?: string) => {
    try {
      setLoading(true);
      const data = await getCrops({
        search: search || undefined,
        limit: 50,
      });
      setCrops(data);
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
      setCrops([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCropDetail = async (id: number) => {
    try {
      const data = await getCropById(id);
      if (data) {
        const cropData: CropType = {
          id: String(data.id),
          name: data.name || 'Без названия',
          family: data.family_name || 'Неизвестное семейство',
          group: 'Овощные',
          vegetationDays: data.vegetation_days_avg || 0,
          soilNeeds: 'Не указано',
          lightNeeds: mapSunNeeds(data.sun_needs),
          description: '',
        };
        setSelectedCropDetail(cropData);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки деталей:', error);
    }
  };

  const mapSunNeeds = (value: number): string => {
    switch (value) {
      case 1: return 'Тень';
      case 2: return 'Полутень';
      case 3: return 'Солнце';
      default: return 'Не указано';
    }
  };

  const handleCropClick = (crop: Crop) => {
    loadCropDetail(crop.id);
  };

  const handleCloseModal = () => {
    setSelectedCropDetail(null);
  };

  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCrops(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div style={pageStyles.page}>
      <Header userId="user-123" firstName="Алексей" />
      
      <main style={pageStyles.main}>
        <div style={pageStyles.container}>
          
          <div style={pageStyles.searchWrapper}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Поиск культур по названию или семейству"
            />
          </div>
          
          {loading ? (
            <p style={pageStyles.loading}>Загрузка...</p>
          ) : crops.length > 0 ? (
            <div style={pageStyles.grid}>
              {crops.map((crop) => (
                <CropCard
                  key={crop.id}
                  id={String(crop.id)}
                  name={crop.name || 'Без названия'}
                  family={crop.family_name || 'Неизвестное семейство'}
                  group="Овощные"
                  vegetationDays={crop.vegetation_days_avg || 0}
                  soilNeeds="Не указано"
                  lightNeeds={mapSunNeeds(crop.sun_needs)}
                  onClick={() => handleCropClick(crop)}
                />
              ))}
            </div>
          ) : (
            <div style={pageStyles.emptyWrapper}>
              <p style={pageStyles.empty}>
                {searchTerm ? 'Ничего не найдено' : 'Нет культур в каталоге'}
              </p>
            </div>
          )}
        </div>
      </main>
      
      {selectedCropDetail && (
        <CropDetailModal
          crop={selectedCropDetail}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Catalog;