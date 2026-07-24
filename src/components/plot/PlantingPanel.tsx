// src/pages/PlotEditor/components/PlantingPanel/PlantingPanel.tsx
import React from 'react';
import styles from './PlantingPanel.module.css';
import { CROPS } from '../../hooks/usePlotEditor';
import type { Bed, GardenObject } from '../../api/types/plot.types';

interface PlantingPanelProps {
  selectedBed: Bed | null;
  objects: GardenObject[];
  onHarvest: (bedId: string, plantingId: string) => void;
  onPlant: () => void;
}

// ===== ВРЕМЕННЫЕ РЕКОМЕНДАЦИИ (позже будут из БД) =====
const getRecommendations = (cropName?: string): string[] => {
  if (!cropName) return ['🌱 Посадите сидераты для улучшения почвы'];
  
  const recommendations: Record<string, string[]> = {
    'Томаты': ['🌿 Посадите рядом базилик для улучшения вкуса', '🧅 Хорошие соседи: лук, чеснок', '❌ Не сажайте рядом с картофелем'],
    'Огурцы': ['🌽 Хорошие соседи: кукуруза, фасоль', '🌿 Посадите укроп для отпугивания вредителей', '❌ Не сажайте рядом с картофелем'],
    'Морковь': ['🧅 Хорошие соседи: лук, чеснок', '🌿 Посадите розмарин для отпугивания мух', '❌ Не сажайте рядом с укропом'],
    'Перец': ['🌿 Хорошие соседи: базилик, петрушка', '🧅 Посадите лук для защиты от вредителей', '❌ Не сажайте рядом с фенхелем'],
    'Лук': ['🥕 Хорошие соседи: морковь, свекла', '🌿 Посадите ромашку для улучшения роста', '❌ Не сажайте рядом с фасолью'],
    'Кабачки': ['🌽 Хорошие соседи: кукуруза, фасоль', '🌿 Посадите настурцию для защиты', '❌ Не сажайте рядом с картофелем'],
    'Свекла': ['🧅 Хорошие соседи: лук, чеснок', '🥬 Посадите рядом с капустой', '❌ Не сажайте рядом с фасолью'],
    'Картофель': ['🌿 Посадите бархатцы для защиты от колорадского жука', '🧅 Хорошие соседи: лук, чеснок', '❌ Не сажайте рядом с томатами'],
  };

  return recommendations[cropName] || ['🌱 Рекомендаций пока нет'];
};

export const PlantingPanel: React.FC<PlantingPanelProps> = ({
  selectedBed,
  objects,
  onHarvest,
  onPlant,
}) => {
  const currentBed = selectedBed
    ? objects.find(o => o.type === 'bed' && o.id === selectedBed.id) as Bed | undefined
    : null;

  if (!currentBed) {
    return (
      <div className={styles.panel}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🌱</div>
          <h4>Информация о грядке</h4>
          <p className={styles.hint}>Кликните на грядку для просмотра информации</p>
        </div>
      </div>
    );
  }

  const activePlanting = currentBed.plantings.find(p => !p.harvestDate);
  const crop = activePlanting ? CROPS.find(c => c.id === activePlanting.cropId) : null;
  const recommendations = crop ? getRecommendations(crop.name) : getRecommendations();

  // Расчет дней до сбора
  const getDaysToHarvest = () => {
    if (!activePlanting || !crop) return null;
    const harvestDate = new Date(new Date(activePlanting.plantedDate).getTime() + crop.vegetationDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = Math.ceil((harvestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysToHarvest = getDaysToHarvest();

  return (
    <div className={styles.panel}>
      {/* Заголовок */}
      <div className={styles.header}>
        <h4>🌱 {currentBed.name}</h4>
        <span className={styles.bedId}>ID: {currentBed.id.slice(0, 8)}</span>
      </div>
      
      <div className={styles.size}>Размер: {currentBed.width}×{currentBed.height} клеток</div>
      
      {/* Активная посадка */}
      {activePlanting && crop ? (
        <div className={styles.plantingInfo}>
          <div className={styles.cropBadge} style={{ backgroundColor: crop.color }}>
            <span>{crop.name}</span>
          </div>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>📅 Посадка</span>
              <span className={styles.value}>{new Date(activePlanting.plantedDate).toLocaleDateString('ru-RU')}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>📆 Сбор</span>
              <span className={styles.value}>
                {new Date(new Date(activePlanting.plantedDate).getTime() + crop.vegetationDays * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>⏳ Осталось</span>
              <span className={`${styles.value} ${daysToHarvest && daysToHarvest <= 7 ? styles.urgent : ''}`}>
                {daysToHarvest !== null ? `${daysToHarvest} дн.` : '—'}
              </span>
            </div>
          </div>
          
          <button className={styles.harvestBtn} onClick={() => onHarvest(currentBed.id, activePlanting.id)}>
            🌾 Собрать урожай
          </button>
        </div>
      ) : (
        <div className={styles.emptyPlanting}>
          <p className={styles.hint}>Грядка пуста</p>
          <button className={styles.plantBtn} onClick={onPlant}>
            🌱 Посадить
          </button>
        </div>
      )}

      {/* Рекомендации */}
      {recommendations.length > 0 && (
        <div className={styles.recommendations}>
          <h5>💡 Рекомендации</h5>
          <ul className={styles.recommendationsList}>
            {recommendations.map((rec, index) => (
              <li key={index} className={styles.recommendationItem}>
                <span className={styles.bullet}>•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* История посадок */}
      {currentBed.plantings.length > 0 && (
        <div className={styles.history}>
          <h5>📋 История посадок</h5>
          <div className={styles.historyList}>
            {[...currentBed.plantings]
              .sort((a, b) => new Date(b.plantedDate).getTime() - new Date(a.plantedDate).getTime())
              .map(p => {
                const info = CROPS.find(c => c.id === p.cropId);
                const isActive = !p.harvestDate;
                return (
                  <div key={p.id} className={`${styles.historyItem} ${isActive ? styles.active : styles.harvested}`}>
                    <span className={styles.historyDot} style={{ backgroundColor: info?.color || '#888' }} />
                    <span className={styles.historyCrop}>{info?.name || p.cropName}</span>
                    <span className={styles.historyDate}>
                      {new Date(p.plantedDate).toLocaleDateString('ru-RU')}
                    </span>
                    {p.harvestDate && (
                      <span className={styles.historyHarvest}>✅</span>
                    )}
                    {isActive && (
                      <span className={styles.historyActive}>🌱</span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {currentBed.plantings.length === 0 && (
        <div className={styles.historyEmpty}>
          <p className={styles.hintSmall}>История посадок пуста</p>
        </div>
      )}
    </div>
  );
};

export default PlantingPanel;