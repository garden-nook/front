import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/common/Toast';
import ConfirmModal from '../components/ConfirmModal';
import PlotCard from '../components/UI/PlotCard/PlotCard';

// ============================================================
// ТИПЫ
// ============================================================
interface Plot {
  id: string;
  name: string;
  width: number;
  height: number;
  bedsCount: number;
  cropsCount: number;
  soilType?: string;
}

// ============================================================
// КЛЮЧ ДЛЯ LOCALSTORAGE
// ============================================================
const STORAGE_KEY = 'garden_plots';

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================
const loadPlotsFromStorage = (): Plot[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Ошибка загрузки участков:', error);
  }
  return [];
};

const savePlotsToStorage = (plots: Plot[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plots));
  } catch (error) {
    console.error('Ошибка сохранения участков:', error);
  }
};

// ============================================================
// КОМПОНЕНТ
// ============================================================
export default function PlotsList() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlotId, setEditingPlotId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    width: '',
    height: '',
    soilType: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ============================================================
  // ЗАГРУЗКА ПРИ МОНТИРОВАНИИ
  // ============================================================
  useEffect(() => {
    const loaded = loadPlotsFromStorage();
    setPlots(loaded);
    setLoading(false);
  }, []);

  // ============================================================
  // СОХРАНЕНИЕ ПРИ ИЗМЕНЕНИИ
  // ============================================================
  useEffect(() => {
    if (!loading) {
      savePlotsToStorage(plots);
    }
  }, [plots, loading]);

  // ============================================================
  // ОБРАБОТЧИКИ
  // ============================================================
  const openCreateModal = () => {
    setEditingPlotId(null);
    setFormData({ name: '', width: '', height: '', soilType: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (plot: Plot) => {
    setEditingPlotId(plot.id);
    setFormData({
      name: plot.name,
      width: String(plot.width),
      height: String(plot.height),
      soilType: plot.soilType || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlotId(null);
    setFormData({ name: '', width: '', height: '', soilType: '' });
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.width || !formData.height) {
      showToast('Пожалуйста, заполните все обязательные поля', 'error');
      return;
    }

    const widthNum = Number(formData.width);
    const heightNum = Number(formData.height);

    if (isNaN(widthNum) || isNaN(heightNum) || widthNum <= 0 || heightNum <= 0) {
      showToast('Введите корректные размеры', 'error');
      return;
    }

    const soilType = formData.soilType || undefined;

    if (editingPlotId) {
      setPlots((prev) =>
        prev.map((plot) =>
          plot.id === editingPlotId
            ? {
                ...plot,
                name: formData.name.trim(),
                width: widthNum,
                height: heightNum,
                soilType: soilType,
              }
            : plot
        )
      );
      showToast('Участок успешно обновлён', 'success');
    } else {
      const newPlot: Plot = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        width: widthNum,
        height: heightNum,
        bedsCount: 0,
        cropsCount: 0,
        soilType: soilType,
      };
      setPlots((prev) => [newPlot, ...prev]);
      showToast('Участок успешно создан', 'success');
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      setPlots((prev) => prev.filter((plot) => plot.id !== deleteConfirm));
      showToast('Участок успешно удалён', 'success');
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // ============================================================
  // СТИЛИ
  // ============================================================
  const pageStyles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
    },
    main: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '32px 40px',
      paddingBottom: '120px',
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#1F2937',
      margin: '0 0 24px 0',
    },
    empty: {
      textAlign: 'center' as const,
      padding: '60px 20px',
      color: '#6B7280',
    },
    emptyTitle: {
      fontSize: '18px',
      margin: '0 0 8px 0',
    },
    emptyText: {
      fontSize: '14px',
      margin: 0,
    },
    fab: {
      position: 'fixed' as const,
      bottom: '32px',
      right: 'calc(50% - 700px + 40px)',
      width: '56px',
      height: '56px',
      backgroundColor: '#22C55E',
      color: 'white',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 100,
    },
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      width: '100%',
      maxWidth: '440px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 600,
      color: '#1F2937',
      margin: 0,
    },
    closeBtn: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#FEE2E2',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '6px',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #E5E7EB',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box' as const,
    },
    sizeRow: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
    sizeInput: {
      flex: 1,
      padding: '10px 12px',
      border: '1px solid #E5E7EB',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
    },
    sizeSeparator: {
      color: '#6B7280',
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #E5E7EB',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: 'white',
      boxSizing: 'border-box' as const,
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '8px',
    },
    cancelBtn: {
      flex: 1,
      padding: '10px',
      backgroundColor: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#374151',
      cursor: 'pointer',
    },
    submitBtn: {
      flex: 1,
      padding: '10px',
      backgroundColor: '#22C55E',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      color: 'white',
      cursor: 'pointer',
    },
  };

  // ============================================================
  // РЕНДЕРИНГ
  // ============================================================
  if (!user) return null;

  const displayName = user.display_name || 'Пользователь';
  const userId = user.id || 'user';

  return (
    <div style={pageStyles.page}>
      {/* Хедер — вынесен в App.tsx, здесь не нужен */}

      <main style={pageStyles.main}>
        <h1 style={pageStyles.headerTitle}>Список участков</h1>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#6B7280' }}>Загрузка...</p>
        ) : plots.length === 0 ? (
          <div style={pageStyles.empty}>
            <p style={pageStyles.emptyTitle}>У вас пока нет участков</p>
            <p style={pageStyles.emptyText}>Нажмите на кнопку "+" чтобы создать первый участок</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {plots.map((plot) => (
              <PlotCard
                key={plot.id}
                id={plot.id}
                name={plot.name}
                width={plot.width}
                height={plot.height}
                bedsCount={plot.bedsCount || 0}
                cropsCount={plot.cropsCount || 0}
                onEdit={() => openEditModal(plot)}
                onDelete={() => handleDelete(plot.id)}
              />
            ))}
          </div>
        )}
      </main>

      <button type="button" onClick={openCreateModal} style={pageStyles.fab}>
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isModalOpen && (
        <div style={pageStyles.modalOverlay} onClick={closeModal}>
          <div style={pageStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={pageStyles.modalHeader}>
              <h2 style={pageStyles.modalTitle}>
                {editingPlotId ? 'Изменить участок' : 'Создать участок'}
              </h2>
              <button type="button" onClick={closeModal} style={pageStyles.closeBtn}>
                <svg width="16" height="16" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={pageStyles.inputGroup}>
              <div>
                <label style={pageStyles.label}>Название</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите название"
                  style={pageStyles.input}
                />
              </div>

              <div>
                <label style={pageStyles.label}>Размер (в метрах)</label>
                <div style={pageStyles.sizeRow}>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    placeholder="Длина"
                    style={pageStyles.sizeInput}
                  />
                  <span style={pageStyles.sizeSeparator}>×</span>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="Ширина"
                    style={pageStyles.sizeInput}
                  />
                </div>
              </div>

              <div>
                <label style={pageStyles.label}>Тип почвы</label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  style={pageStyles.select}
                >
                  <option value="">Выберите тип</option>
                  <option value="chernozem">Чернозем</option>
                  <option value="loam">Суглинок</option>
                  <option value="sand">Песчаная</option>
                  <option value="clay">Глинистая</option>
                </select>
              </div>

              <div style={pageStyles.modalActions}>
                <button type="button" onClick={closeModal} style={pageStyles.cancelBtn}>
                  Отмена
                </button>
                <button type="button" onClick={handleSubmit} style={pageStyles.submitBtn}>
                  {editingPlotId ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Удалить участок?"
        message="Это действие нельзя отменить. Все грядки и задачи этого участка будут удалены."
        confirmText="Удалить"
        cancelText="Отмена"
        danger={true}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}