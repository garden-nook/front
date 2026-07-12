import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import Avatar from '../components/Avatar';
import * as storage from '../services/storage';

type FilterType = 'all' | 'active' | 'done' | 'overdue';

interface TaskFormData {
  text: string;
  plotId: string;
  plotName: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

const emptyForm: TaskFormData = {
  text: '',
  plotId: '',
  plotName: '',
  dueDate: '',
  priority: 'medium',
};

export default function Tasks() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<storage.Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Загружаем задачи при монтировании
  useEffect(() => {
    if (user) {
      storage.initializeDemoData(user.id);
      setTasks(storage.getTasks(user.id));
    }
  }, [user]);

  const refreshTasks = () => {
    if (user) {
      setTasks(storage.getTasks(user.id));
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === 'active') return !task.done;
      if (filter === 'done') return task.done;
      if (filter === 'overdue') return !task.done && task.dueDate < today;
      return true;
    });
  }, [tasks, filter, today]);

  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: storage.Task[] } = {};
    filteredTasks.forEach((task) => {
      if (!groups[task.plotName]) {
        groups[task.plotName] = [];
      }
      groups[task.plotName].push(task);
    });
    return groups;
  }, [filteredTasks]);

  const openCreateModal = () => {
    setEditingTaskId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (task: storage.Task) => {
    setEditingTaskId(task.id);
    setFormData({
      text: task.text,
      plotId: task.plotId,
      plotName: task.plotName,
      dueDate: task.dueDate,
      priority: task.priority,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTaskId(null);
    setFormData(emptyForm);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm && user) {
      storage.deleteTask(user.id, deleteConfirm);
      refreshTasks();
      showToast('Задача удалена', 'success');
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleToggle = (id: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (task) {
      storage.updateTask(user.id, id, { done: !task.done });
      refreshTasks();
    }
  };

  const handleSubmit = () => {
    if (!formData.text.trim() || !formData.dueDate || !formData.plotId) {
      showToast('Заполните название, участок и дату', 'error');
      return;
    }

    if (!user) return;

    if (editingTaskId) {
      storage.updateTask(user.id, editingTaskId, {
        text: formData.text,
        plotId: formData.plotId,
        plotName: formData.plotName,
        dueDate: formData.dueDate,
        priority: formData.priority,
      });
      showToast('Задача обновлена', 'success');
    } else {
      const newTask: storage.Task = {
        id: Date.now().toString(),
        userId: user.id,
        text: formData.text,
        done: false,
        dueDate: formData.dueDate,
        plotId: formData.plotId,
        plotName: formData.plotName,
        priority: formData.priority,
      };
      storage.addTask(user.id, newTask);
      showToast('Задача создана', 'success');
    }

    refreshTasks();
    closeModal();
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return '#FEE2E2';
    if (priority === 'medium') return '#FEF3C7';
    return '#DCFCE7';
  };

  const getPriorityTextColor = (priority: string) => {
    if (priority === 'high') return '#DC2626';
    if (priority === 'medium') return '#D97706';
    return '#16A34A';
  };

  const getPriorityLabel = (priority: string) => {
    if (priority === 'high') return 'Высокий';
    if (priority === 'medium') return 'Средний';
    return 'Низкий';
  };

  const isOverdue = (task: storage.Task) => !task.done && task.dueDate < today;

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Все' },
    { key: 'active', label: 'Активные' },
    { key: 'done', label: 'Выполненные' },
    { key: 'overdue', label: 'Просроченные' },
  ];

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
            <Link to="/" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
              Мои участки
            </Link>
            <Link to="/catalog" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
              Каталог культур
            </Link>
            <Link to="/tasks" style={{ fontSize: '14px', fontWeight: 500, color: '#22C55E', textDecoration: 'none' }}>
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
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 40px', paddingBottom: '100px' }}>
        {/* Заголовок */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937', margin: '0 0 8px 0' }}>
              Задачи и уведомления
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              Управление задачами по уходу за участками
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            style={{
              padding: '10px 20px',
              backgroundColor: '#22C55E',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить задачу
          </button>
        </div>

        {/* Фильтры */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {filters.map((f) => {
            const count = f.key === 'all' ? tasks.length :
                          f.key === 'active' ? tasks.filter(t => !t.done).length :
                          f.key === 'done' ? tasks.filter(t => t.done).length :
                          tasks.filter(t => !t.done && t.dueDate < today).length;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: filter === f.key ? '#22C55E' : '#E5E7EB',
                  backgroundColor: filter === f.key ? '#DCFCE7' : 'white',
                  color: filter === f.key ? '#16A34A' : '#6B7280',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {f.label}
                <span style={{
                  backgroundColor: filter === f.key ? '#22C55E' : '#E5E7EB',
                  color: filter === f.key ? 'white' : '#6B7280',
                  borderRadius: '10px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Список задач */}
        {Object.keys(groupedTasks).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>Задач не найдено</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Добавьте новую задачу или измените фильтр</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {Object.entries(groupedTasks).map(([plotName, plotTasks]) => (
              <div key={plotName}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" fill="none" stroke="#22C55E" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {plotName}
                  <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 400 }}>
                    ({plotTasks.length} {plotTasks.length === 1 ? 'задача' : plotTasks.length < 5 ? 'задачи' : 'задач'})
                  </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {plotTasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        opacity: task.done ? 0.7 : 1,
                        borderLeft: isOverdue(task) ? '4px solid #DC2626' : '4px solid transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => handleToggle(task.id)}
                        style={{ width: '18px', height: '18px', accentColor: '#22C55E', cursor: 'pointer', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: task.done ? '#9CA3AF' : '#1F2937',
                          textDecoration: task.done ? 'line-through' : 'none',
                          marginBottom: '4px',
                        }}>
                          {task.text}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(task.dueDate)}
                            {isOverdue(task) && (
                              <span style={{ color: '#DC2626', fontWeight: 500, marginLeft: '4px' }}>
                                (просрочено)
                              </span>
                            )}
                          </span>
                          <span
                            style={{
                              backgroundColor: getPriorityColor(task.priority),
                              color: getPriorityTextColor(task.priority),
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 500,
                            }}
                          >
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(task)}
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
                          onClick={() => handleDelete(task.id)}
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
                {editingTaskId ? 'Изменить задачу' : 'Новая задача'}
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
                  Название задачи
                </label>
                <input
                  type="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Например: Полить томаты"
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
                  Участок
                </label>
                <select
                  value={formData.plotId}
                  onChange={(e) => {
                    const plot = storage.getPlots(user.id).find(p => p.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      plotId: e.target.value,
                      plotName: plot?.name || ''
                    });
                  }}
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
                  <option value="">Выберите участок</option>
                  {storage.getPlots(user.id).map((plot) => (
                    <option key={plot.id} value={plot.id}>
                      {plot.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '6px' }}>
                  Дата выполнения
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                  Приоритет
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid',
                        borderColor: formData.priority === p ? getPriorityTextColor(p) : '#E5E7EB',
                        backgroundColor: formData.priority === p ? getPriorityColor(p) : 'white',
                        color: formData.priority === p ? getPriorityTextColor(p) : '#6B7280',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      {getPriorityLabel(p)}
                    </button>
                  ))}
                </div>
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
                    fontWeight: 500,
                  }}
                >
                  {editingTaskId ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модалка подтверждения удаления */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Удалить задачу?"
        message="Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        danger={true}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}