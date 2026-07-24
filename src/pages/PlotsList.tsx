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
import { plotsListStyles as styles } from '../PageStyles/PlotsList.styles';

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

  const loadData = async () => {
    try {
      setLoading(true);
      const [plotsData, soilTypesData] = await Promise.all([
        getPlots(),
        getSoilTypes(),
      ]);
      setPlots(plotsData || []);
      setSoilTypes(soilTypesData || []);
    } catch {
      setPlots([]);
      setSoilTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      loadData();
    } catch {
      showToast('Ошибка сохранения участка', 'error');
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
      loadData();
    } catch {
      showToast('Ошибка удаления участка', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (!user) return null;

  const displayName = user.display_name || 'Пользователь';
  const userId = user.id || 'user';
  const soilOptions = soilTypes.map((type) => ({
    value: String(type.id),
    label: type.name,
  }));

  return (
    <div style={styles.page}>
      <Header userId={userId} firstName={displayName} />

      <main style={styles.main}>
        {plots.length > 0 && <h1 style={styles.headerTitle}>Список участков</h1>}

        {loading ? (
          <p style={styles.loadingText}>Загрузка...</p>
        ) : plots.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyTitle}>У вас пока нет участков</p>
            <p style={styles.emptyText}>Нажмите на кнопку "+" чтобы создать первый участок</p>
          </div>
        ) : (
          <div style={styles.plotsContainer}>
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

      <button type="button" onClick={openCreateModal} style={styles.fab}>
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
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

            <div style={styles.modalBody}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Название</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите название"
                />
              </div>

              {!editingPlotId && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Размер (в метрах)</label>
                  <div style={styles.sizeRow}>
                    <Input
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      placeholder="Длина"
                    />
                    <span style={styles.sizeSeparator}>×</span>
                    <Input
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="Ширина"
                    />
                  </div>
                </div>
              )}

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Тип грунта</label>
                <Select
                  value={formData.soilTypeId}
                  onChange={(e) => setFormData({ ...formData, soilTypeId: e.target.value })}
                  options={[
                    { value: '', label: 'Выберите тип' },
                    ...soilOptions,
                  ]}
                />
              </div>

              <div style={styles.modalActions}>
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