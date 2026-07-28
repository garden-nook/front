// src/pages/PlotEditor/components/plot/PlantingHistory.tsx
import React, { useEffect, useMemo, useState } from "react";
import { getBedHistory } from "../../api";
import type { BedCropHistoryEntry } from "../../api/types/plot.types";
import { useToast } from "../common/Toast";
import styles from "./PlantingHistory.module.css";

interface PlantingHistoryProps {
  bed: {
    id: string;
    name: string;
    currentCropName?: string | null;
    plantDate?: string | null;
  };
  refreshTrigger?: boolean;
}

export const PlantingHistory: React.FC<PlantingHistoryProps> = ({ bed, refreshTrigger }) => {
  const { showToast } = useToast();
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [historyData, setHistoryData] = useState<BedCropHistoryEntry[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getBedHistory(bed.id);
        if (data && Array.isArray(data)) {
          setHistoryData(data);
        } else {
          setHistoryData([]);
        }
      } catch {
        showToast("Ошибка загрузки истории посадок", "error");
        setHistoryData([]);
      }
    };

    loadHistory();
  }, [bed.id, showToast, refreshTrigger]);

  // Формируем список всех посадок
  const allPlantings = useMemo(() => {
    const result: {
      id: string;
      cropName: string;
      plantedDate: string;
      harvestDate?: string;
      isCurrent: boolean;
    }[] = [];

    // Текущая посадка (из структуры участка)
    if (bed.currentCropName && bed.plantDate) {
      result.push({
        id: `current-${bed.id}`,
        cropName: bed.currentCropName,
        plantedDate: bed.plantDate,
        harvestDate: undefined,
        isCurrent: true,
      });
    }

    // ✅ Исторические посадки (из API) - НЕ ДУБЛИРУЕМ
    if (historyData && Array.isArray(historyData) && historyData.length > 0) {
      // Проверяем, есть ли уже текущая посадка с такими же данными
      historyData.forEach((entry) => {
        // Проверяем, не дублируется ли текущая посадка
        const isDuplicate = result.some(
          (r) =>
            r.cropName === entry.crop_name && r.plantedDate === entry.plant_date && r.isCurrent,
        );

        if (!isDuplicate) {
          result.push({
            id: `history-${entry.crop_id}-${entry.plant_date}`,
            cropName: entry.crop_name || "Неизвестная культура",
            plantedDate: entry.plant_date,
            harvestDate: entry.harvest_date,
            isCurrent: false,
          });
        }
      });
    }
    return result;
  }, [bed.id, bed.currentCropName, bed.plantDate, historyData]);

  // Разделяем на активную и завершенные посадки
  const { activePlantings, historyPlantings } = useMemo(() => {
    const active: typeof allPlantings = [];
    const history: typeof allPlantings = [];

    allPlantings.forEach((planting) => {
      if (!planting.harvestDate) {
        active.push(planting);
      } else {
        history.push(planting);
      }
    });

    history.sort((a, b) => new Date(b.plantedDate).getTime() - new Date(a.plantedDate).getTime());

    return { activePlantings: active, historyPlantings: history };
  }, [allPlantings]);

  // Группируем историю по годам
  const groupedByYear = useMemo(() => {
    if (!historyPlantings || historyPlantings.length === 0) return {};

    const groups: Record<string, typeof historyPlantings> = {};

    historyPlantings.forEach((planting) => {
      if (!planting.plantedDate) return;
      const year = new Date(planting.plantedDate).getFullYear().toString();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(planting);
    });

    return Object.fromEntries(Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0])));
  }, [historyPlantings]);

  const toggleYear = (year: string) => {
    setExpandedYears((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Если нет никаких посадок - показываем пустое состояние
  if (allPlantings.length === 0) {
    return;
  }

  const years = Object.keys(groupedByYear);

  return (
    <div className={styles.container}>
      <span className={styles.header}>История посадок</span>

      {/* ===== ТЕКУЩАЯ ПОСАДКА (показываем только если есть) ===== */}
      {activePlantings.length > 0 && (
        <div className={styles.activeSection}>
          <div className={styles.activePlanting}>
            {activePlantings.map((planting) => (
              <div key={planting.id} className={styles.activePlantingItem}>
                <span className={styles.activePlantingName}>{planting.cropName}</span>
                <span className={styles.activePlantingDate}>
                  {formatDate(planting.plantedDate)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== ИСТОРИЯ ПОСАДОК (показываем только если есть) ===== */}
      {historyPlantings.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.historyList}>
            {years.map((year) => {
              const plantings = groupedByYear[year];
              const isExpanded = expandedYears.has(year);

              return (
                <div key={year} className={styles.yearGroup}>
                  <button className={styles.yearHeader} onClick={() => toggleYear(year)}>
                    <span className={styles.yearIcon}>{isExpanded ? "▼" : "▶"}</span>
                    <span className={styles.yearLabel}>{year}</span>
                    <span className={styles.yearCount}>{plantings.length} посадок</span>
                  </button>

                  {isExpanded && (
                    <div className={styles.yearContent}>
                      {plantings.map((planting) => (
                        <div key={planting.id} className={styles.historyItem}>
                          <span className={styles.historyCropName}>{planting.cropName}</span>
                          <span className={styles.historyDate}>
                            📅 {formatDate(planting.plantedDate)}
                          </span>
                          {planting.harvestDate && (
                            <span className={styles.historyHarvest}>
                              → Сбор: {formatDate(planting.harvestDate)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

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
              {expandedYears.size === years.length ? "Свернуть всё" : "Развернуть всё"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PlantingHistory;
