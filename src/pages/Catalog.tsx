// src/pages/Catalog.tsx
import React, { useState, useEffect } from 'react';
import Header from '../components/UI/Header/Header';
import SearchBar from '../components/UI/SearchBar/SearchBar';
import CropCard from '../components/UI/CropCard/CropCard';
import CropDetailModal from '../components/UI/CropDetailModal/CropDetailModal';
import { getCrops, getCropById } from '../api/endpoints/crops';
import { mapSunNeeds, type Crop } from '../api/types/crops.types';

// Стили страницы
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
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
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
  // ✅ Убираем CropType, используем локальный интерфейс
  const [selectedCropDetail, setSelectedCropDetail] = useState<{
    id: string;
    name: string;
    family_name: string;
    vegetation_days_avg: number;
    soil_name: string;
    sun_needs: number;
    description?: string;
    predecessors?: { good: string[]; bad: string[] };
    neighbors?: { good: string[]; bad: string[] };
    following?: string[];
  } | null>(null);

  const loadCrops = async (search?: string) => {
    try {
      setLoading(true);
      const data = await getCrops({
        search: search || undefined,
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
        // ✅ Используем правильные имена полей из API
        setSelectedCropDetail({
          id: String(data.crop.id),
          name: data.crop.name,
          family_name: data.crop.family_name,
          vegetation_days_avg: data.crop.vegetation_days_avg,
          soil_name: data.crop.soil_name || 'Не указано',
          sun_needs: data.crop.sun_needs,
          description: data.crop.description || '',
          predecessors: {
            good: data.crop_relations.good_predecessors.map((r: any) => r.crop_name),
            bad: data.crop_relations.bad_predecessors.map((r: any) => r.crop_name),
          },
          neighbors: {
            good: data.crop_relations.good_companions.map((r: any) => r.crop_name),
            bad: data.crop_relations.bad_companions.map((r: any) => r.crop_name),
          },
          following: data.crop_relations.good_successors.map((r: any) => r.crop_name),
        });
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки деталей:', error);
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

  const displayName = 'Алексей';
  const userId = 'user-123';

  return (
    <div style={pageStyles.page}>
      <Header userId={userId} firstName={displayName} />

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
                  name={crop.name}
                  family={crop.family_name}
                  group="Овощные"
                  vegetationDays={crop.vegetation_days_avg}
                  soilNeeds={crop.soil_name || 'Не указано'}
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