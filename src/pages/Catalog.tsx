import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/UI/Header/Header';
import SearchBar from '../components/UI/SearchBar/SearchBar';
import CropCard from '../components/UI/CropCard/CropCard';
import CropDetailModal from '../components/UI/CropDetailModal/CropDetailModal';
import { getCrops, getCropById } from '../api/endpoints/crops';
import { mapSunNeeds, type Crop } from '../api/types/crops.types';
import { catalogStyles as styles } from '../PageStyles/Catalog.styles';
import { useAuth } from '../contexts/AuthContext';

const Catalog: React.FC = () => {
  const { user } = useAuth();
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

  const isSearchEnabled = useRef(false);

  useEffect(() => {
    const loadCrops = async () => {
      try {
        setLoading(true);
        const data = await getCrops({});
        setCrops(data || []);
      } catch {
        setCrops([]);
      } finally {
        setLoading(false);
        isSearchEnabled.current = true;
      }
    };

    loadCrops();
  }, []);

  useEffect(() => {
    if (!isSearchEnabled.current) return;

    const timer = setTimeout(() => {
      const doSearch = async () => {
        try {
          setLoading(true);
          const params: { search?: string } = {};
          const trimmed = searchTerm.trim();
          if (trimmed.length > 0) {
            params.search = trimmed;
          }
          const data = await getCrops(params);
          setCrops(data || []);
        } catch {
          setCrops([]);
        } finally {
          setLoading(false);
        }
      };

      doSearch();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
    } catch {
      // ошибка загрузки деталей
    }
  };

  const handleCropClick = (crop: Crop) => {
    loadCropDetail(crop.id);
  };

  const handleCloseModal = () => {
    setSelectedCropDetail(null);
  };

  if (!user) return null;

  const displayName = user.display_name || 'Пользователь';
  const userId = user.id || 'user';

  return (
    <div style={styles.page}>
      <Header userId={userId} firstName={displayName} />

      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.searchWrapper}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Поиск культур по названию или семейству"
            />
          </div>

          {loading ? (
            <p style={styles.loading}>Загрузка...</p>
          ) : crops.length > 0 ? (
            <div style={styles.grid}>
              {crops.map((crop) => (
                <CropCard
                  key={crop.id}
                  id={String(crop.id)}
                  name={crop.name}
                  family={crop.family_name}
                  vegetationDays={crop.vegetation_days_avg}
                  soilNeeds={crop.soil_name || 'Не указано'}
                  lightNeeds={mapSunNeeds(crop.sun_needs)}
                  onClick={() => handleCropClick(crop)}
                />
              ))}
            </div>
          ) : (
            <div style={styles.emptyWrapper}>
              <p style={styles.empty}>
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