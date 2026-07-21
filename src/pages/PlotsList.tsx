// src/pages/PlotsList.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/common/Toast';
import ConfirmModal from '../components/ConfirmModal';
import Header from '../components/UI/Header/Header';
import PlotCard from '../components/UI/PlotCard/PlotCard';
import Input from '../components/UI/Input/Input';
import Select from '../components/UI/Select/Select';
import ActionButton from '../components/UI/ActionButton';
import { getPlots, createPlot, updatePlot, deletePlot } from '../api/endpoints/plots';
import { getSoilTypes } from '../api/endpoints/soil-types';
import type { Plot } from '../api/types/plots.types';
import type { SoilType } from '../api/types/crops.types';

// ============================================================
// КОМПОНЕНТ
// ============================================================
export default function PlotsList() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [soilTypes, setSoilTypes] = useState<SoilType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlotId, setEditingPlotId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    width: '',
    height: '',
    soilTypeId: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ============================================================
  // ЗАГРУЗКА ДАННЫХ ИЗ API
  // ============================================================
  const loadData = async () => {
    try {
      setLoading(true);

      // Загружаем типы почвы
      try {
        const soilTypesData = await getSoilTypes();
        setSoilTypes(soilTypesData || []);
        console.log('📦 Типы почвы загружены:', soilTypesData);
      } catch (error) {
        console.error('❌ Ошибка загрузки типов почвы:', error);
        showToast('Ошибка загрузки типов почвы', 'error');
        setSoilTypes([]);
      }

      // Загружаем участки
      try {
        const plotsData = await getPlots();
        setPlots(plotsData || []);
        console.log('📦 Участки загружены:', plotsData);
      } catch (error) {
        console.error('❌ Ошибка загрузки участков:', error);
        showToast('Ошибка загрузки участков', 'error');
        setPlots([]);
      }
    } catch (error) {
      console.error('❌ Общая ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // ОБРАБОТЧИКИ
  // ============================================================
  const openCreateModal = () => {
    setEditingPlotId(null);
    setFormData({ name: '', width: '', height: '', soilTypeId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (plot: Plot) => {
    setEditingPlotId(plot.plot_id);
    setFormData({
      name: plot.name,
      width: String(plot.grid_cols || 0),
      height: String(plot.grid_rows || 0),
      soilTypeId: String(plot.soil_type || ''),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlotId(null);
    setFormData({ name: '', width: '', height: '', soilTypeId: '' });
  };

  const handleSubmit = async () => {
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

    try {
      const soilTypeId = formData.soilTypeId ? Number(formData.soilTypeId) : undefined;

      if (editingPlotId) {
        await updatePlot(editingPlotId, {
          name: formData.name.trim(),
          soilTypeID: soilTypeId,
        });
        showToast('Участок успешно обновлён', 'success');
      } else {
        await createPlot({
          name: formData.name.trim(),
          widthMeters: widthNum,
          heightMeters: heightNum,
          soilTypeID: soilTypeId,
        });
        showToast('Участок успешно создан', 'success');
      }

      closeModal();
      await loadData();
    } catch (error: any) {
      console.error('❌ Ошибка сохранения:', error);
      showToast(error?.response?.data?.error || 'Ошибка сохранения участка', 'error');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deletePlot(deleteConfirm);
      showToast('Участок успешно удалён', 'success');
      await loadData();
    } catch (error: any) {
      console.error('❌ Ошибка удаления:', error);
      showToast(error?.response?.data?.error || 'Ошибка удаления участка', 'error');
    } finally {
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
      padding: '20px',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px 28px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
      maxHeight: '90vh',
      overflowY: 'auto' as const,
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#1F2937',
      margin: 0,
    },
    modalBody: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
      width: '100%',
    },
    label: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#374151',
      marginBottom: '2px',
    },
    sizeRow: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      width: '100%',
    },
    sizeSeparator: {
      color: '#6B7280',
      fontSize: '16px',
      fontWeight: 600,
      flexShrink: 0,
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '4px',
    },
    loadingText: {
      textAlign: 'center' as const,
      color: '#6B7280',
      fontSize: '16px',
      padding: '40px 0',
    },
  };

  // ============================================================
  // РЕНДЕРИНГ
  // ============================================================
  if (!user) return null;

  const displayName = user.display_name || 'Пользователь';
  const userId = user.id || 'user';

  const soilOptions = soilTypes.map((type) => ({
    value: String(type.id),
    label: type.name,
  }));

  return (
    <div style={pageStyles.page}>
      <Header userId={userId} firstName={displayName} />

      <main style={pageStyles.main}>
        {plots.length > 0 && (
          <h1 style={pageStyles.headerTitle}>Список участков</h1>
        )}

        {loading ? (
          <p style={pageStyles.loadingText}>Загрузка...</p>
        ) : plots.length === 0 ? (
          <div style={pageStyles.empty}>
            <p style={pageStyles.emptyTitle}>У вас пока нет участков</p>
            <p style={pageStyles.emptyText}>Нажмите на кнопку "+" чтобы создать первый участок</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {plots.map((plot) => (
              <PlotCard
                key={plot.plot_id}
                id={plot.plot_id}
                name={plot.name}
                width={plot.grid_cols || 0}
                height={plot.grid_rows || 0}
                bedsCount={0}
                cropsCount={0}
                onEdit={() => openEditModal(plot)}
                onDelete={() => handleDelete(plot.plot_id)}
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
              <ActionButton
                icon="cancel"
                shape="littleSquare"
                color="red"
                onClick={closeModal}
                title="Закрыть"
              />
            </div>

            <div style={pageStyles.modalBody}>
              <div style={pageStyles.fieldGroup}>
                <label style={pageStyles.label}>Название</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите название"
                />
              </div>

              {!editingPlotId && (
                <div style={pageStyles.fieldGroup}>
                  <label style={pageStyles.label}>Размер (в метрах)</label>
                  <div style={pageStyles.sizeRow}>
                    <Input
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      placeholder="Длина"
                    />
                    <span style={pageStyles.sizeSeparator}>×</span>
                    <Input
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="Ширина"
                    />
                  </div>
                </div>
              )}

              <div style={pageStyles.fieldGroup}>
                <label style={pageStyles.label}>Тип грунта</label>
                <Select
                  value={formData.soilTypeId}
                  onChange={(e) => setFormData({ ...formData, soilTypeId: e.target.value })}
                  options={[
                    { value: '', label: 'Выберите тип' },
                    ...soilOptions,
                  ]}
                />
              </div>

              <div style={pageStyles.modalActions}>
                <ActionButton
                  title="Отмена"
                  shape="text"
                  onClick={closeModal}
                />
                <ActionButton
                  title={editingPlotId ? 'Сохранить' : 'Создать'}
                  color="greenLight"
                  shape="text"
                  onClick={handleSubmit}
                />
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