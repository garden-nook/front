// src/pages/PlotEditor/components/History/PlantingHistory.tsx
import React, { useState, useMemo } from 'react';
import styles from './PlantingHistory.module.css';

// ===== ЛОКАЛЬНЫЕ ТИПЫ (временные, пока нет API) =====

interface GridPosition {
  row: number;
  col: number;
}

interface PlantingHistoryItem {
  id: string;
  cropId: string;
  cropName: string;
  plantedDate: string;
  harvestDate?: string;
  cells: GridPosition[];
  color: string;
}

interface Bed {
  id: string;
  name: string;
  cells: GridPosition[];
  plantings: PlantingHistoryItem[];
  createdAt: string;
}

interface PlantingHistoryProps {
  selectedBedId: string | null;
  beds: Bed[];
}

// ===== КОМПОНЕНТ =====

export const PlantingHistory: React.FC<PlantingHistoryProps> = ({
  selectedBedId,
  beds,
}) => {
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

  // Получаем выбранную грядку
  const selectedBed = useMemo(() => {
    return beds.find(b => b.id === selectedBedId);
  }, [beds, selectedBedId]);

  // Группируем посадки по годам
  const groupedByYear = useMemo(() => {
    if (!selectedBed) return {};

    const groups: Record<string, PlantingHistoryItem[]> = {};
    
    selectedBed.plantings.forEach(planting => {
      const year = new Date(planting.plantedDate).getFullYear().toString();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(planting);
    });

    // Сортируем года от новых к старым
    return Object.fromEntries(
      Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]))
    );
  }, [selectedBed]);

  // Группируем по культурам внутри года
  const getGroupedByCrop = (plantings: PlantingHistoryItem[]) => {
    const groups: Record<string, PlantingHistoryItem[]> = {};
    
    plantings.forEach(planting => {
      const cropKey = planting.cropName;
      if (!groups[cropKey]) {
        groups[cropKey] = [];
      }
      groups[cropKey].push(planting);
    });

    return groups;
  };

  // Переключение разворачивания года
  const toggleYear = (year: string) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Расчет дней до сбора урожая (примерный)
  const getDaysToHarvest = (planting: PlantingHistoryItem) => {
    if (planting.harvestDate) {
      const harvest = new Date(planting.harvestDate);
      const now = new Date();
      const diff = harvest.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days;
    }
    return null;
  };

  // Если нет выбранной грядки
  if (!selectedBed) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🌱</div>
        <p className={styles.emptyText}>Выберите грядку на схеме</p>
        <p className={styles.emptyHint}>Кликните на любую грядку, чтобы увидеть историю посадок</p>
      </div>
    );
  }

  // Если нет посадок
  if (selectedBed.plantings.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🌿</div>
        <p className={styles.emptyText}>На этой грядке еще нет посадок</p>
        <p className={styles.emptyHint}>Переключитесь в режим "Посадка" и начните сажать!</p>
      </div>
    );
  }

  const years = Object.keys(groupedByYear);

  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <div className={styles.header}>
        <h3 className={styles.title}>{selectedBed.name}</h3>
        <span className={styles.bedInfo}>
          {selectedBed.cells.length} клеток • {selectedBed.plantings.length} посадок
        </span>
      </div>

      {/* Легенда цветов */}
      <div className={styles.legend}>
        <span className={styles.legendLabel}>Цвета культур:</span>
        <div className={styles.legendColors}>
          {Array.from(new Set(selectedBed.plantings.map(p => p.cropName))).map(cropName => {
            const color = selectedBed.plantings.find(p => p.cropName === cropName)?.color || '#888';
            return (
              <span key={cropName} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: color }} />
                {cropName}
              </span>
            );
          })}
        </div>
      </div>

      {/* Список посадок по годам */}
      <div className={styles.historyList}>
        {years.map(year => {
          const plantings = groupedByYear[year];
          const isExpanded = expandedYears.has(year);
          const groupedByCrop = getGroupedByCrop(plantings);

          return (
            <div key={year} className={styles.yearGroup}>
              <button
                className={styles.yearHeader}
                onClick={() => toggleYear(year)}
              >
                <span className={styles.yearIcon}>
                  {isExpanded ? '▼' : '▶'}
                </span>
                <span className={styles.yearLabel}>{year}</span>
                <span className={styles.yearCount}>
                  {plantings.length} посадок
                </span>
              </button>

              {isExpanded && (
                <div className={styles.yearContent}>
                  {Object.entries(groupedByCrop).map(([cropName, cropPlantings]) => {
                    const color = cropPlantings[0]?.color || '#888';
                    
                    return (
                      <div key={cropName} className={styles.cropGroup}>
                        <div className={styles.cropHeader}>
                          <span className={styles.cropDot} style={{ backgroundColor: color }} />
                          <span className={styles.cropName}>{cropName}</span>
                          <span className={styles.cropCount}>
                            {cropPlantings.length} записей
                          </span>
                        </div>

                        <div className={styles.plantingList}>
                          {cropPlantings.map(planting => {
                            const daysToHarvest = getDaysToHarvest(planting);
                            
                            return (
                              <div key={planting.id} className={styles.plantingItem}>
                                <div className={styles.plantingInfo}>
                                  <span className={styles.plantingDate}>
                                    📅 {formatDate(planting.plantedDate)}
                                  </span>
                                  {planting.harvestDate && (
                                    <span className={styles.plantingHarvest}>
                                      → Сбор: {formatDate(planting.harvestDate)}
                                    </span>
                                  )}
                                  {!planting.harvestDate && daysToHarvest !== null && (
                                    <span className={styles.plantingDays}>
                                      {daysToHarvest > 0 
                                        ? `⏳ ${daysToHarvest} дн. до сбора`
                                        : daysToHarvest === 0 
                                          ? '🌾 Готово к сбору!'
                                          : '⏰ Сбор просрочен'}
                                    </span>
                                  )}
                                  {!planting.harvestDate && daysToHarvest === null && (
                                    <span className={styles.plantingGrowing}>🌱 Растет</span>
                                  )}
                                </div>
                                <div className={styles.plantingCells}>
                                  {planting.cells.length} клеток
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Кнопка "Развернуть всё" */}
      {years.length > 1 && (
        <button
          className={styles.expandAll}
          onClick={() => {
            if (expandedYears.size === years.length) {
              setExpandedYears(new Set());
            } else {
              setExpandedYears(new Set(years));
            }
          }}
        >
          {expandedYears.size === years.length ? 'Свернуть всё' : 'Развернуть всё'}
        </button>
      )}
    </div>
  );
};

export default PlantingHistory;