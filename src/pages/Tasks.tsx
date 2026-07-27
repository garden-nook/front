import { useEffect, useMemo, useState } from "react";
import { useToast } from "../components/common/Toast";
import ConfirmModal from "../components/ConfirmModal";
import Header from "../components/UI/Header/Header";
import { useAuth } from "../contexts/AuthContext";
import { tasksStyles as styles } from "../PageStyles/Tasks.styles";
import * as storage from "../services/storage";

type FilterType = "all" | "active" | "done" | "overdue";

interface TaskFormData {
  text: string;
  plotId: string;
  plotName: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
}

const emptyForm: TaskFormData = {
  text: "",
  plotId: "",
  plotName: "",
  dueDate: "",
  priority: "medium",
};

export default function Tasks() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<storage.Task[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

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
      if (filter === "active") return !task.done;
      if (filter === "done") return task.done;
      if (filter === "overdue") return !task.done && task.dueDate < today;
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
      showToast("Задача удалена", "success");
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleToggle = (id: string) => {
    if (!user) return;
    const task = tasks.find((t) => t.id === id);
    if (task) {
      storage.updateTask(user.id, id, { done: !task.done });
      refreshTasks();
    }
  };

  const handleSubmit = () => {
    if (!formData.text.trim() || !formData.dueDate || !formData.plotId) {
      showToast("Заполните название, участок и дату", "error");
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
      showToast("Задача обновлена", "success");
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
      showToast("Задача создана", "success");
    }

    refreshTasks();
    closeModal();
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "#FEE2E2";
    if (priority === "medium") return "#FEF3C7";
    return "#DCFCE7";
  };

  const getPriorityTextColor = (priority: string) => {
    if (priority === "high") return "#DC2626";
    if (priority === "medium") return "#D97706";
    return "#16A34A";
  };

  const getPriorityLabel = (priority: string) => {
    if (priority === "high") return "Высокий";
    if (priority === "medium") return "Средний";
    return "Низкий";
  };

  const isOverdue = (task: storage.Task) => !task.done && task.dueDate < today;

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "active", label: "Активные" },
    { key: "done", label: "Выполненные" },
    { key: "overdue", label: "Просроченные" },
  ];

  if (!user) return null;

  const displayName = user.display_name || "Пользователь";
  const userId = user.id || "user";

  return (
    <div style={styles.page}>
      <Header userId={userId} firstName={displayName} />

      <main style={styles.main}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.pageTitle}>Задачи и уведомления</h2>
            <p style={styles.pageSubtitle}>Управление задачами по уходу за участками</p>
          </div>
          <button type="button" onClick={openCreateModal} style={styles.addButton}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Добавить задачу
          </button>
        </div>

        <div style={styles.filterContainer}>
          {filters.map((f) => {
            const count =
              f.key === "all"
                ? tasks.length
                : f.key === "active"
                  ? tasks.filter((t) => !t.done).length
                  : f.key === "done"
                    ? tasks.filter((t) => t.done).length
                    : tasks.filter((t) => !t.done && t.dueDate < today).length;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                style={{
                  ...styles.filterButton,
                  borderColor: filter === f.key ? "#22C55E" : "#E5E7EB",
                  backgroundColor: filter === f.key ? "#DCFCE7" : "white",
                  color: filter === f.key ? "#16A34A" : "#6B7280",
                }}
              >
                {f.label}
                <span
                  style={{
                    ...styles.filterBadge,
                    backgroundColor: filter === f.key ? "#22C55E" : "#E5E7EB",
                    color: filter === f.key ? "white" : "#6B7280",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {Object.keys(groupedTasks).length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>Задач не найдено</p>
            <p style={styles.emptyText}>Добавьте новую задачу или измените фильтр</p>
          </div>
        ) : (
          <div style={styles.taskList}>
            {Object.entries(groupedTasks).map(([plotName, plotTasks]) => (
              <div key={plotName}>
                <h3 style={styles.plotGroupTitle}>
                  <svg width="18" height="18" fill="none" stroke="#22C55E" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  {plotName}
                  <span style={styles.plotGroupCount}>
                    ({plotTasks.length}{" "}
                    {plotTasks.length === 1 ? "задача" : plotTasks.length < 5 ? "задачи" : "задач"})
                  </span>
                </h3>
                <div style={styles.tasksContainer}>
                  {plotTasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        ...styles.taskCard,
                        opacity: task.done ? 0.7 : 1,
                        borderLeft: isOverdue(task) ? "4px solid #DC2626" : "4px solid transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => handleToggle(task.id)}
                        style={styles.checkbox}
                      />
                      <div style={styles.taskContent}>
                        <div
                          style={{
                            ...styles.taskText,
                            color: task.done ? "#9CA3AF" : "#1F2937",
                            textDecoration: task.done ? "line-through" : "none",
                          }}
                        >
                          {task.text}
                        </div>
                        <div style={styles.taskMeta}>
                          <span style={styles.taskDate}>
                            <svg
                              width="14"
                              height="14"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {formatDate(task.dueDate)}
                            {isOverdue(task) && (
                              <span style={styles.overdueBadge}>(просрочено)</span>
                            )}
                          </span>
                          <span
                            style={{
                              ...styles.priorityBadge,
                              backgroundColor: getPriorityColor(task.priority),
                              color: getPriorityTextColor(task.priority),
                            }}
                          >
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                      </div>
                      <div style={styles.taskActions}>
                        <button
                          type="button"
                          onClick={() => openEditModal(task)}
                          style={styles.editButton}
                        >
                          <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke="#16A34A"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(task.id)}
                          style={styles.deleteButton}
                        >
                          <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke="#DC2626"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
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

      <button type="button" onClick={openCreateModal} style={styles.fab}>
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isModalOpen && (
        <div onClick={closeModal} style={styles.modalOverlay}>
          <div onClick={(e) => e.stopPropagation()} style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingTaskId ? "Изменить задачу" : "Новая задача"}
              </h2>
              <button type="button" onClick={closeModal} style={styles.modalCloseButton}>
                <svg width="16" height="16" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div style={styles.modalBody}>
              <div>
                <label style={styles.modalLabel}>Название задачи</label>
                <input
                  type="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Например: Полить томаты"
                  style={styles.modalInput}
                />
              </div>

              <div>
                <label style={styles.modalLabel}>Участок</label>
                <select
                  value={formData.plotId}
                  onChange={(e) => {
                    const plot = storage.getPlots(user.id).find((p) => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      plotId: e.target.value,
                      plotName: plot?.name || "",
                    });
                  }}
                  style={styles.modalSelect}
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
                <label style={styles.modalLabel}>Дата выполнения</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  style={styles.modalInput}
                />
              </div>

              <div>
                <label style={styles.modalLabel}>Приоритет</label>
                <div style={styles.priorityGroup}>
                  {(["low", "medium", "high"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      style={{
                        ...styles.priorityButton,
                        borderColor: formData.priority === p ? getPriorityTextColor(p) : "#E5E7EB",
                        backgroundColor: formData.priority === p ? getPriorityColor(p) : "white",
                        color: formData.priority === p ? getPriorityTextColor(p) : "#6B7280",
                      }}
                    >
                      {getPriorityLabel(p)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={closeModal} style={styles.cancelButton}>
                  Отмена
                </button>
                <button type="button" onClick={handleSubmit} style={styles.submitButton}>
                  {editingTaskId ? "Сохранить" : "Создать"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
