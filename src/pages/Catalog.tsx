// src/pages/Catalog.tsx
import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/UI/Header/Header';
import SearchBar from '../components/UI/SearchBar/SearchBar';
import CropCard from '../components/UI/CropCard/CropCard';
import CropDetailModal from '../components/UI/CropDetailModal/CropDetailModal';
import { getCrops, getCropById } from '../api/endpoints/crops';
import { mapSunNeeds, type Crop } from '../api/types/crops.types';

// ============================================================
// СТИЛИ
// ============================================================
const pageStyles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    paddingTop: '0px',
  },
  main: {
    padding: '24px 20px 40px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
  },
  searchWrapper: {
    maxWidth: '600px',
    margin: '0 auto 32px',
    padding: '0 16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '24px',
    padding: '0 16px',
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

// ============================================================
// КОМПОНЕНТ
// ============================================================
const Catalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
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

  // ✅ Флаг для поиска — сначала false, становится true после первого рендера
  const isSearchEnabled = useRef(false);

  // ============================================================
  // ЗАГРУЗКА КУЛЬТУР (только один раз при монтировании)
  // ============================================================
  useEffect(() => {
    const loadCrops = async () => {
      try {
        setLoading(true);
        const data = await getCrops({});
        console.log('📦 Культуры из API (первая загрузка):', data);
        setCrops(data || []);
      } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        setCrops([]);
      } finally {
        setLoading(false);
        // ✅ После первой загрузки включаем поиск
        isSearchEnabled.current = true;
      }
    };

    loadCrops();
  }, []); // ✅ Пустой массив — только один раз

  // ============================================================
  // ПОИСК (включается только после первой загрузки)
  // ✅ Ищет по 1 букве
  // ============================================================
  useEffect(() => {
    // ✅ Если поиск ещё не включён — ничего не делаем
    if (!isSearchEnabled.current) return;

    const timer = setTimeout(() => {
      const doSearch = async () => {
        try {
          setLoading(true);
          
          // ✅ Если есть хоть один символ — ищем
          const params: { search?: string } = {};
          const trimmed = searchTerm.trim();
          if (trimmed.length > 0) {
            params.search = trimmed;
          }
          
          const data = await getCrops(params);
          console.log('📦 Результаты поиска:', data);
          setCrops(data || []);
        } catch (error) {
          console.error('❌ Ошибка поиска:', error);
          setCrops([]);
        } finally {
          setLoading(false);
        }
      };

      doSearch();
    }, 400); // ✅ Уменьшил задержку до 400ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ============================================================
  // ЗАГРУЗКА ДЕТАЛЕЙ
  // ============================================================
  const loadCropDetail = async (id: number) => {
    try {
      const data = await getCropById(id);
      if (data) {
        const relations = data.crop_relations || {};
        
        setSelectedCropDetail({
          id: String(data.crop.id),
          name: data.crop.name,
          family_name: data.crop.family_name,
          vegetation_days_avg: data.crop.vegetation_days_avg || 0,
          soil_name: data.crop.soil_name || '',
          sun_needs: data.crop.sun_needs || 0,
          description: data.crop.description || '',
          predecessors: {
            good: (relations.good_predecessors || []).map((r: any) => r.crop_name),
            bad: (relations.bad_predecessors || []).map((r: any) => r.crop_name),
          },
          neighbors: {
            good: (relations.good_companions || []).map((r: any) => r.crop_name),
            bad: (relations.bad_companions || []).map((r: any) => r.crop_name),
          },
          following: (relations.good_successors || []).map((r: any) => r.crop_name),
        });
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки деталей:', error);
    }
  };

  const handleCropClick = (crop: Crop) => {
    console.log('🖱️ Клик по карточке:', crop.name);
    loadCropDetail(crop.id);
  };

  const handleCloseModal = () => {
    setSelectedCropDetail(null);
  };

  // ============================================================
  // РЕНДЕРИНГ
  // ============================================================
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