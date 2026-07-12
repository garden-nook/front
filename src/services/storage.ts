// Типы данных
export interface Plot {
  id: string;
  userId: string;
  name: string;
  width: number;
  height: number;
  bedsCount: number;
  cropsCount: number;
  soilType?: string;
}

export interface Task {
  id: string;
  userId: string;
  plotId: string;
  plotName: string;
  text: string;
  done: boolean;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Bed {
  id: string;
  plotId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  cropHistory: { name: string; date: string }[];
  lightLevel: string;
}

// Ключи localStorage
const KEYS = {
  plots: (userId: string) => `plots_${userId}`,
  tasks: (userId: string) => `tasks_${userId}`,
  beds: (plotId: string) => `beds_${plotId}`,
};

// === УЧАСТКИ ===

export function getPlots(userId: string): Plot[] {
  try {
    const data = localStorage.getItem(KEYS.plots(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePlots(userId: string, plots: Plot[]): void {
  localStorage.setItem(KEYS.plots(userId), JSON.stringify(plots));
}

export function addPlot(userId: string, plot: Plot): void {
  const plots = getPlots(userId);
  plots.push(plot);
  savePlots(userId, plots);
}

export function updatePlot(userId: string, plotId: string, updates: Partial<Plot>): void {
  const plots = getPlots(userId);
  const index = plots.findIndex(p => p.id === plotId);
  if (index !== -1) {
    plots[index] = { ...plots[index], ...updates };
    savePlots(userId, plots);
  }
}

export function deletePlot(userId: string, plotId: string): void {
  const plots = getPlots(userId).filter(p => p.id !== plotId);
  savePlots(userId, plots);
  // Удаляем связанные грядки
  localStorage.removeItem(KEYS.beds(plotId));
  // Удаляем задачи этого участка
  const tasks = getTasks(userId).filter(t => t.plotId !== plotId);
  saveTasks(userId, tasks);
}

// === ЗАДАЧИ ===

export function getTasks(userId: string): Task[] {
  try {
    const data = localStorage.getItem(KEYS.tasks(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTasks(userId: string, tasks: Task[]): void {
  localStorage.setItem(KEYS.tasks(userId), JSON.stringify(tasks));
}

export function addTask(userId: string, task: Task): void {
  const tasks = getTasks(userId);
  tasks.push(task);
  saveTasks(userId, tasks);
}

export function updateTask(userId: string, taskId: string, updates: Partial<Task>): void {
  const tasks = getTasks(userId);
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    saveTasks(userId, tasks);
  }
}

export function deleteTask(userId: string, taskId: string): void {
  const tasks = getTasks(userId).filter(t => t.id !== taskId);
  saveTasks(userId, tasks);
}

// === ГРЯДКИ ===

export function getBeds(plotId: string): Bed[] {
  try {
    const data = localStorage.getItem(KEYS.beds(plotId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveBeds(plotId: string, beds: Bed[]): void {
  localStorage.setItem(KEYS.beds(plotId), JSON.stringify(beds));
}

export function addBed(plotId: string, bed: Bed): void {
  const beds = getBeds(plotId);
  beds.push(bed);
  saveBeds(plotId, beds);
}

export function updateBed(plotId: string, bedId: string, updates: Partial<Bed>): void {
  const beds = getBeds(plotId);
  const index = beds.findIndex(b => b.id === bedId);
  if (index !== -1) {
    beds[index] = { ...beds[index], ...updates };
    saveBeds(plotId, beds);
  }
}

export function deleteBed(plotId: string, bedId: string): void {
  const beds = getBeds(plotId).filter(b => b.id !== bedId);
  saveBeds(plotId, beds);
}

// === ИНИЦИАЛИЗАЦИЯ ДЕМО-ДАННЫХ ===

export function initializeDemoData(userId: string): void {
  const plots = getPlots(userId);
  if (plots.length === 0) {
    // Создаём демо-участки
    const demoPlots: Plot[] = [
      { id: '1', userId, name: 'Название участка', width: 40, height: 70, bedsCount: 5, cropsCount: 7 },
      { id: '2', userId, name: 'Название участка', width: 40, height: 70, bedsCount: 5, cropsCount: 7 },
      { id: '3', userId, name: 'Название участка', width: 40, height: 70, bedsCount: 5, cropsCount: 7 },
      { id: '4', userId, name: 'Название участка', width: 40, height: 70, bedsCount: 5, cropsCount: 7 },
    ];
    savePlots(userId, demoPlots);

    // Создаём демо-задачи
    const demoTasks: Task[] = [
      { id: '1', userId, plotId: '1', plotName: 'Название участка', text: 'Полить томаты', done: false, dueDate: '2026-07-12', priority: 'high' },
      { id: '2', userId, plotId: '1', plotName: 'Название участка', text: 'Прополоть грядки', done: true, dueDate: '2026-07-10', priority: 'medium' },
      { id: '3', userId, plotId: '2', plotName: 'Название участка', text: 'Внести удобрения', done: false, dueDate: '2026-07-15', priority: 'low' },
      { id: '4', userId, plotId: '2', plotName: 'Название участка', text: 'Обработать от вредителей', done: false, dueDate: '2026-07-08', priority: 'high' },
      { id: '5', userId, plotId: '3', plotName: 'Название участка', text: 'Собрать урожай моркови', done: false, dueDate: '2026-07-20', priority: 'medium' },
      { id: '6', userId, plotId: '3', plotName: 'Название участка', text: 'Посадить редис', done: true, dueDate: '2026-06-25', priority: 'low' },
    ];
    saveTasks(userId, demoTasks);

    // Создаём демо-грядки для первого участка
    const demoBeds: Bed[] = [
      {
        id: '1', plotId: '1', name: 'Грядка №1', x: 10, y: 10, width: 15, height: 25,
        cropHistory: [
          { name: 'Морковь', date: '24.05.2026' },
          { name: 'Капуста', date: '27.06.2025' },
        ],
        lightLevel: 'полутень',
      },
      {
        id: '2', plotId: '1', name: 'Грядка №2', x: 30, y: 10, width: 45, height: 20,
        cropHistory: [
          { name: 'Томаты', date: '15.05.2025' },
        ],
        lightLevel: 'полутень',
      },
      {
        id: '3', plotId: '1', name: 'Грядка №3', x: 10, y: 45, width: 20, height: 40,
        cropHistory: [
          { name: 'Капуста', date: '27.06.2025' },
          { name: 'Капуста', date: '27.06.2025' },
        ],
        lightLevel: 'полутень',
      },
      {
        id: '4', plotId: '1', name: 'Грядка №4', x: 35, y: 40, width: 40, height: 45,
        cropHistory: [
          { name: 'Огурцы', date: '20.05.2025' },
        ],
        lightLevel: 'полутень',
      },
    ];
    saveBeds('1', demoBeds);
  }
}