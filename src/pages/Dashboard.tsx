import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import Avatar from '../components/Avatar';
import * as storage from '../services/storage';

interface ModalFormData {
  name: string;
  width: string;
  height: string;
  soilType: string;
}

const SOIL_TYPES = [
  { value: '', label: 'Выберите тип' },
  { value: 'chernozem', label: 'Чернозем' },
  { value: 'loam', label: 'Суглинок' },
  { value: 'sand', label: 'Песчаная' },
  { value: 'clay', label: 'Глинистая' },
];

const emptyForm: ModalFormData = {
  name: '',
  width: '',
  height: '',
  soilType: '',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [plots, setPlots] = useState<storage.Plot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlotId, setEditingPlotId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ModalFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Загружаем участки при монтировании
  useEffect(() => {
    if (user) {
      storage.initializeDemoData(user.id);
      setPlots(storage.getPlots(user.id));
    }
  }, [user]);

  // Перезагружаем список при изменении
  const refreshPlots = () => {
    if (user) {
      setPlots(storage.getPlots(user.id));
    }
  };

  const openCreateModal = () => {
    setEditingPlotId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (plot: storage.Plot) => {
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
    setFormData(emptyForm);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm && user) {
      storage.deletePlot(user.id, deleteConfirm);
      refreshPlots();
      showToast('Участок успешно удалён', 'success');
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
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

    if (!user) return;

    if (editingPlotId) {
      storage.updatePlot(user.id, editingPlotId, {
        name: formData.name,
        width: widthNum,
        height: heightNum,
        soilType: formData.soilType,
      });
      showToast('Участок успешно обновлён', 'success');
    } else {
      const newPlot: storage.Plot = {
        id: Date.now().toString(),
        userId: user.id,
        name: formData.name,
        width: widthNum,
        height: heightNum,
        bedsCount: 0,
        cropsCount: 0,
        soilType: formData.soilType,
      };
      storage.addPlot(user.id, newPlot);
      showToast('Участок успешно создан', 'success');
    }

    refreshPlots();
    closeModal();
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '2px solid #22C55E' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>
            Огородный уголок
          </h1>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to="/" style={{ fontSize: '14px', fontWeight: 500, color: '#22C55E', textDecoration: 'none' }}>
              Мои участки
            </Link>
            <Link to="/catalog" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
              Каталог культур
            </Link>
            <Link to="/tasks" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
              Задачи
            </Link>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <Avatar 
                userId={user.id} 
                firstName={user.firstName} 
                size={32}
              />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 40px', paddingBottom: '120px' }}>
        {plots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
            <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>У вас пока нет участков</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Нажмите на кнопку "+" чтобы создать первый участок</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {plots.map((plot) => (
              <div
                key={plot.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div style={{ width: '96px', height: '96px', backgroundColor: '#E5E7EB', borderRadius: '4px', flexShrink: 0 }}></div>

                <div style={{ flex: 1, textAlign: 'left' }}>
                  <Link
                    to={`/plot/${plot.id}`}
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1F2937',
                      margin: '0 0 4px 0',
                      textAlign: 'left',
                      textDecoration: 'none',
                      display: 'block',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#22C55E';
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#1F2937';
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    {plot.name}
                  </Link>
                  <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, textAlign: 'left' }}>
                    Размер: {plot.width}x{plot.height} ({plot.width / 10}м x {plot.height / 10}м) · Грядок: {plot.bedsCount} · Культур: {plot.cropsCount}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(plot)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      backgroundColor: '#DCFCE7',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="18" height="18" fill="none" stroke="#16A34A" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(plot.id)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      backgroundColor: '#FEE2E2',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="18" height="18" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB кнопка */}
      <button
        type="button"
        onClick={openCreateModal}
        style={{
          position: 'fixed',
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
        }}
      >
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Модалка создания/редактирования */}
      {isModalOpen && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', margin: 0 }}>
                {editingPlotId ? 'Изменить участок' : 'Создать участок'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '6px' }}>
                  Название
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите название"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '6px' }}>
                  Размер (в метрах)
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    placeholder="Длина"
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  <span style={{ color: '#6B7280' }}>×</span>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="Ширина"
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '6px' }}>
                  Тип почвы
                </label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                  }}
                >
                  {SOIL_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#22C55E',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  {editingPlotId ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модалка подтверждения удаления */}
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