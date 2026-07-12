import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import Avatar from '../components/Avatar';
import * as storage from '../services/storage';

const ZOOM_MIN = 50;
const ZOOM_MAX = 200;

const cropsList = [
  { id: '1', name: 'Томат', icon: '🍅' },
  { id: '2', name: 'Огурец', icon: '' },
  { id: '3', name: 'Морковь', icon: '' },
  { id: '4', name: 'Салат', icon: '🥬' },
  { id: '5', name: 'Редис', icon: '🌱' },
  { id: '6', name: 'Картофель', icon: '🥔' },
  { id: '7', name: 'Лук', icon: '🧅' },
  { id: '8', name: 'Чеснок', icon: '' },
  { id: '9', name: 'Капуста', icon: '' },
  { id: '10', name: 'Перец', icon: '️' },
  { id: '11', name: 'Клубника', icon: '🍓' },
  { id: '12', name: 'Тыква', icon: '🎃' },
];

const LIGHT_LEVELS = [
  { value: 'полное солнце', label: 'Полное солнце', icon: '☀️' },
  { value: 'полутень', label: 'Полутень', icon: '' },
  { value: 'тень', label: 'Тень', icon: '🌥️' },
];

export default function PlotEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [beds, setBeds] = useState<storage.Bed[]>([]);
  const [tasks, setTasks] = useState<storage.Task[]>([]);
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; bedId?: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDraggingZoom, setIsDraggingZoom] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentTimeline, setCurrentTimeline] = useState(3);
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  
  const [isDraggingBed, setIsDraggingBed] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragBedOriginalPos, setDragBedOriginalPos] = useState({ x: 0, y: 0 });
  
  const [isResizingBed, setIsResizingBed] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeBedOriginal, setResizeBedOriginal] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [isPlantingModalOpen, setIsPlantingModalOpen] = useState(false);
  const [plantingBedId, setPlantingBedId] = useState<string | null>(null);
  const [plantingCropId, setPlantingCropId] = useState<string | null>(null);
  
  const [isEditBedModalOpen, setIsEditBedModalOpen] = useState(false);
  const [editBedId, setEditBedId] = useState<string | null>(null);
  const [editBedLightLevel, setEditBedLightLevel] = useState('полутень');
  const [editBedHistory, setEditBedHistory] = useState<{ name: string; date: string }[]>([]);
  const [editBedName, setEditBedName] = useState('');
  
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  const [plotData, setPlotData] = useState<storage.Plot | null>(null);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState<string>('');
  
  // UX improvements: unsaved changes confirmation
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const zoomTrackRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedBed = beds.find(b => b.id === selectedBedId) || null;

  useEffect(() => {
    if (user && id) {
      storage.initializeDemoData(user.id);
      setBeds(storage.getBeds(id));
      setTasks(storage.getTasks(user.id).filter(t => t.plotId === id));
      
      const plots = storage.getPlots(user.id);
      const plot = plots.find(p => p.id === id);
      if (plot) {
        setPlotData(plot);
      }
    }
  }, [user, id]);

  // UX improvements: warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const refreshData = () => {
    if (user && id) {
      setBeds(storage.getBeds(id));
      setTasks(storage.getTasks(user.id).filter(t => t.plotId === id));
      
      const plots = storage.getPlots(user.id);
      const plot = plots.find(p => p.id === id);
      if (plot) {
        setPlotData(plot);
      }
    }
  };

  const handleBedClick = (e: React.MouseEvent, bed: storage.Bed) => {
    e.stopPropagation();
    setSelectedBedId(bed.id);
    setContextMenu(null);
  };

  const handleBedRightClick = (e: React.MouseEvent, bed: storage.Bed) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBedId(bed.id);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      bedId: bed.id,
    });
  };

  const handleCanvasRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedBedId(null);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleCanvasClick = () => {
    setSelectedBedId(null);
    setContextMenu(null);
  };

  const handleCreateBed = () => {
    if (!user || !id || !contextMenu || contextMenu.bedId) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const plotWidth = canvasRect.width * 0.7;
    const plotHeight = canvasRect.height * 0.8;
    const plotLeft = canvasRect.left + (canvasRect.width - plotWidth) / 2;
    const plotTop = canvasRect.top + (canvasRect.height - plotHeight) / 2;

    const xPercent = ((contextMenu.x - plotLeft) / plotWidth) * 100;
    const yPercent = ((contextMenu.y - plotTop) / plotHeight) * 100;

    const newBed: storage.Bed = {
      id: Date.now().toString(),
      plotId: id,
      name: `Грядка №${beds.length + 1}`,
      x: Math.max(5, Math.min(80, xPercent)),
      y: Math.max(5, Math.min(80, yPercent)),
      width: 15,
      height: 20,
      cropHistory: [],
      lightLevel: 'полутень',
    };

    storage.addBed(id, newBed);
    refreshData();
    setContextMenu(null);
    setHasChanges(true);
    showToast('Грядка создана', 'success');
  };

  const handlePlantClick = () => {
    if (contextMenu?.bedId) {
      setPlantingBedId(contextMenu.bedId);
      setPlantingCropId(null);
      setIsPlantingModalOpen(true);
      setContextMenu(null);
    }
  };

  const confirmPlanting = () => {
    if (!plantingBedId || !plantingCropId || !id) return;
    
    const crop = cropsList.find(c => c.id === plantingCropId);
    if (!crop) return;

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

    const bed = beds.find(b => b.id === plantingBedId);
    if (!bed) return;

    const updatedHistory = [...bed.cropHistory, { name: crop.name, date: dateStr }];
    storage.updateBed(id, plantingBedId, { cropHistory: updatedHistory });
    
    refreshData();
    setIsPlantingModalOpen(false);
    setPlantingBedId(null);
    setPlantingCropId(null);
    setHasChanges(true);
    showToast(`${crop.name} посажен(а) на грядку`, 'success');
  };

  const handleEditBedClick = () => {
    if (!contextMenu?.bedId) return;
    const bed = beds.find(b => b.id === contextMenu.bedId);
    if (!bed) return;
    
    setEditBedId(bed.id);
    setEditBedLightLevel(bed.lightLevel);
    setEditBedHistory([...bed.cropHistory]);
    setEditBedName(bed.name);
    setIsEditBedModalOpen(true);
    setContextMenu(null);
  };

  const saveEditBed = () => {
    if (!editBedId || !id) return;
    
    storage.updateBed(id, editBedId, {
      lightLevel: editBedLightLevel,
      cropHistory: editBedHistory,
      name: editBedName,
    });
    
    refreshData();
    setIsEditBedModalOpen(false);
    setEditBedId(null);
    setHasChanges(true);
    showToast('Грядка обновлена', 'success');
  };

  const removeCropFromHistory = (index: number) => {
    setEditBedHistory(prev => prev.filter((_, i) => i !== index));
  };

  const addCropToHistory = () => {
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
    setEditBedHistory(prev => [...prev, { name: 'Новая культура', date: dateStr }]);
  };

  const updateCropName = (index: number, name: string) => {
    setEditBedHistory(prev => prev.map((c, i) => i === index ? { ...c, name } : c));
  };

  const updateCropDate = (index: number, date: string) => {
    setEditBedHistory(prev => prev.map((c, i) => i === index ? { ...c, date } : c));
  };

  const confirmDeleteBed = () => {
    if (!user || !id || !deleteConfirm) return;
    
    storage.deleteBed(id, deleteConfirm);
    setSelectedBedId(null);
    refreshData();
    setContextMenu(null);
    setDeleteConfirm(null);
    setHasChanges(true);
    showToast('Грядка удалена', 'success');
  };

  const handleBedNameChange = (newName: string) => {
    if (!id || !selectedBedId) return;
    storage.updateBed(id, selectedBedId, { name: newName });
    refreshData();
    setHasChanges(true);
  };

  const handleBedMouseDown = (e: React.MouseEvent, bed: storage.Bed) => {
    if (e.button !== 0) return;
    
    const target = e.target as HTMLElement;
    if (target.dataset.resize) {
      e.stopPropagation();
      setIsResizingBed(true);
      setResizeHandle(target.dataset.resize);
      setResizeStartPos({ x: e.clientX, y: e.clientY });
      setResizeBedOriginal({ x: bed.x, y: bed.y, width: bed.width, height: bed.height });
      return;
    }
    
    e.stopPropagation();
    setIsDraggingBed(true);
    setSelectedBedId(bed.id);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragBedOriginalPos({ x: bed.x, y: bed.y });
  };

  useEffect(() => {
    if (!isDraggingBed || !selectedBedId || !user || !id) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const plotWidth = canvasRect.width * 0.7;
      const plotHeight = canvasRect.height * 0.8;

      const deltaX = e.clientX - dragStartPos.x;
      const deltaY = e.clientY - dragStartPos.y;

      const deltaXPercent = (deltaX / plotWidth) * 100;
      const deltaYPercent = (deltaY / plotHeight) * 100;

      const bed = beds.find(b => b.id === selectedBedId);
      if (!bed) return;

      const newX = Math.max(0, Math.min(100 - bed.width, dragBedOriginalPos.x + deltaXPercent));
      const newY = Math.max(0, Math.min(100 - bed.height, dragBedOriginalPos.y + deltaYPercent));

      setBeds(prevBeds => 
        prevBeds.map(b => 
          b.id === selectedBedId 
            ? { ...b, x: newX, y: newY }
            : b
        )
      );
    };

    const handleMouseUp = () => {
      if (selectedBedId) {
        const bed = beds.find(b => b.id === selectedBedId);
        if (bed) {
          storage.updateBed(id, selectedBedId, { x: bed.x, y: bed.y });
          setHasChanges(true);
        }
      }
      setIsDraggingBed(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingBed, selectedBedId, dragStartPos, dragBedOriginalPos, beds, user, id]);

  useEffect(() => {
    if (!isResizingBed || !selectedBedId || !user || !id) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const plotWidth = canvasRect.width * 0.7;
      const plotHeight = canvasRect.height * 0.8;

      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;

      const deltaXPercent = (deltaX / plotWidth) * 100;
      const deltaYPercent = (deltaY / plotHeight) * 100;

      let newX = resizeBedOriginal.x;
      let newY = resizeBedOriginal.y;
      let newWidth = resizeBedOriginal.width;
      let newHeight = resizeBedOriginal.height;

      if (resizeHandle.includes('e')) {
        newWidth = Math.max(10, Math.min(100 - resizeBedOriginal.x, resizeBedOriginal.width + deltaXPercent));
      }
      if (resizeHandle.includes('s')) {
        newHeight = Math.max(10, Math.min(100 - resizeBedOriginal.y, resizeBedOriginal.height + deltaYPercent));
      }
      if (resizeHandle.includes('w')) {
        const proposedX = resizeBedOriginal.x + deltaXPercent;
        const proposedWidth = resizeBedOriginal.width - deltaXPercent;
        if (proposedX >= 0 && proposedWidth >= 10) {
          newX = proposedX;
          newWidth = proposedWidth;
        }
      }
      if (resizeHandle.includes('n')) {
        const proposedY = resizeBedOriginal.y + deltaYPercent;
        const proposedHeight = resizeBedOriginal.height - deltaYPercent;
        if (proposedY >= 0 && proposedHeight >= 10) {
          newY = proposedY;
          newHeight = proposedHeight;
        }
      }

      setBeds(prevBeds => 
        prevBeds.map(b => 
          b.id === selectedBedId 
            ? { ...b, x: newX, y: newY, width: newWidth, height: newHeight }
            : b
        )
      );
    };

    const handleMouseUp = () => {
      if (selectedBedId) {
        const bed = beds.find(b => b.id === selectedBedId);
        if (bed) {
          storage.updateBed(id, selectedBedId, { 
            x: bed.x, 
            y: bed.y, 
            width: bed.width, 
            height: bed.height 
          });
          setHasChanges(true);
        }
      }
      setIsResizingBed(false);
      setResizeHandle('');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingBed, selectedBedId, resizeHandle, resizeStartPos, resizeBedOriginal, beds, user, id]);

  const handlePanStart = (e: React.MouseEvent) => {
    if (isDraggingBed || isResizingBed) return;
    
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'DIV' && (e.target as HTMLElement).style.backgroundImage) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
    }
  };

  const handlePanMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  }, [isPanning, panStart]);

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handlePanMove);
      document.addEventListener('mouseup', handlePanEnd);
      return () => {
        document.removeEventListener('mousemove', handlePanMove);
        document.removeEventListener('mouseup', handlePanEnd);
      };
    }
  }, [isPanning, handlePanMove]);

  const handleTaskChange = (taskId: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      storage.updateTask(user.id, taskId, { done: !task.done });
      refreshData();
      setHasChanges(true);
    }
  };

  const handleEditTask = (task: storage.Task) => {
    setEditTaskId(task.id);
    setEditTaskText(task.text);
    setEditTaskDueDate(task.dueDate);
    setEditTaskPriority(task.priority);
    setIsEditTaskModalOpen(true);
  };

  const saveEditTask = () => {
    if (!editTaskId || !user) return;
    
    storage.updateTask(user.id, editTaskId, {
      text: editTaskText,
      dueDate: editTaskDueDate,
      priority: editTaskPriority,
    });
    
    refreshData();
    setIsEditTaskModalOpen(false);
    setEditTaskId(null);
    setHasChanges(true);
    showToast('Задача обновлена', 'success');
  };

  const handleDeleteTask = (taskId: string) => {
    if (!user) return;
    storage.deleteTask(user.id, taskId);
    refreshData();
    setHasChanges(true);
    showToast('Задача удалена', 'success');
  };

  const handleCreateTask = () => {
    if (!newTaskText.trim() || !newTaskDueDate || !user || !id) {
      showToast('Заполните название и дату', 'error');
      return;
    }
    
    const plot = storage.getPlots(user.id).find(p => p.id === id);
    const newTask: storage.Task = {
      id: Date.now().toString(),
      userId: user.id,
      plotId: id,
      plotName: plot?.name || 'Участок',
      text: newTaskText,
      done: false,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
    };
    
    storage.addTask(user.id, newTask);
    refreshData();
    setIsCreateTaskModalOpen(false);
    setNewTaskText('');
    setNewTaskDueDate('');
    setNewTaskPriority('medium');
    setHasChanges(true);
    showToast('Задача создана', 'success');
  };

  const handleSave = () => {
    setHasChanges(false);
    showToast('Все изменения сохранены', 'success');
  };

  const handleExport = () => {
    if (!user || !id || !plotData) return;
    
    const exportData = {
      plot: plotData,
      beds: beds,
      tasks: tasks,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plot_${plotData.name}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast('План участка экспортирован', 'success');
  };

  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  const handleFileImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.plot && data.beds && data.tasks) {
          data.beds.forEach((bed: storage.Bed) => {
            storage.addBed(id!, bed);
          });
          
          data.tasks.forEach((task: storage.Task) => {
            storage.addTask(user!.id, { ...task, userId: user!.id, plotId: id! });
          });
          
          refreshData();
          setIsImportModalOpen(false);
          setImportData('');
          setHasChanges(true);
          showToast('План участка импортирован', 'success');
        } else {
          showToast('Неверный формат файла', 'error');
        }
      } catch (error) {
        showToast('Ошибка при чтении файла', 'error');
      }
    };
    reader.readAsText(file);
    
    e.target.value = '';
  };

  const handlePasteImport = () => {
    if (!importData.trim()) {
      showToast('Вставьте данные для импорта', 'error');
      return;
    }
    
    try {
      const data = JSON.parse(importData);
      
      if (data.plot && data.beds && data.tasks) {
        data.beds.forEach((bed: storage.Bed) => {
          storage.addBed(id!, bed);
        });
        
        data.tasks.forEach((task: storage.Task) => {
          storage.addTask(user!.id, { ...task, userId: user!.id, plotId: id! });
        });
        
        refreshData();
        setIsImportModalOpen(false);
        setImportData('');
        setHasChanges(true);
        showToast('План участка импортирован', 'success');
      } else {
        showToast('Неверный формат данных', 'error');
      }
    } catch (error) {
      showToast('Ошибка при парсинге данных', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // UX improvements: navigation with unsaved changes check
  const handleNavigateBack = () => {
    if (hasChanges) {
      setPendingNavigation('/');
      setShowUnsavedConfirm(true);
    } else {
      navigate('/');
    }
  };

  const confirmNavigation = () => {
    setHasChanges(false);
    setShowUnsavedConfirm(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const cancelNavigation = () => {
    setShowUnsavedConfirm(false);
    setPendingNavigation(null);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const handleZoomDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingZoom(true);
  }, []);

  useEffect(() => {
    if (!isDraggingZoom) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!zoomTrackRef.current) return;
      const rect = zoomTrackRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const percent = 1 - (y / rect.height);
      const clamped = Math.max(0, Math.min(1, percent));
      const newZoom = Math.round(ZOOM_MIN + clamped * (ZOOM_MAX - ZOOM_MIN));
      setZoom(newZoom);
    };

    const handleMouseUp = () => {
      setIsDraggingZoom(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingZoom]);

  const zoomThumbPosition = ((zoom - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100;

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

  if (!user) return null;

  return (
    <div style={{ height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#D1D5DB', animation: 'fadeIn 0.3s ease-in' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* ПОЛНОЭКРАННЫЙ ХОЛСТ */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasRightClick}
        onMouseDown={handlePanStart}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#D1D5DB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isPanning ? 'grabbing' : isDraggingBed ? 'grabbing' : 'grab',
        }}
      >
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`,
            transformOrigin: 'center center',
            transition: isDraggingZoom || isPanning ? 'none' : 'transform 0.2s',
          }}
        >
          <div
            style={{
              width: '70vw',
              height: '80vh',
              backgroundColor: '#6B7280',
              borderRadius: '8px',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              borderRadius: '8px',
            }}></div>

            {beds.map(bed => {
              const isSelected = selectedBedId === bed.id;
              
              return (
                <div
                  key={bed.id}
                  onClick={(e) => handleBedClick(e, bed)}
                  onContextMenu={(e) => handleBedRightClick(e, bed)}
                  onMouseDown={(e) => handleBedMouseDown(e, bed)}
                  style={{
                    position: 'absolute',
                    left: `${bed.x}%`,
                    top: `${bed.y}%`,
                    width: `${bed.width}%`,
                    height: `${bed.height}%`,
                    backgroundColor: isSelected ? '#9CA3AF' : '#D1D5DB',
                    borderRadius: '6px',
                    border: isSelected ? '2px solid #22C55E' : '1px solid #9CA3AF',
                    cursor: isDraggingBed && isSelected ? 'grabbing' : isResizingBed ? 'default' : 'grab',
                    transition: isDraggingBed && isSelected ? 'none' : 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    userSelect: 'none',
                  }}
                >
                  {isSelected && (
                    <>
                      <div data-resize="nw" style={{ position: 'absolute', top: '-4px', left: '-4px', width: '12px', height: '12px', backgroundColor: '#22C55E', borderRadius: '50%', cursor: 'nw-resize' }}></div>
                      <div data-resize="ne" style={{ position: 'absolute', top: '-4px', right: '-4px', width: '12px', height: '12px', backgroundColor: '#22C55E', borderRadius: '50%', cursor: 'ne-resize' }}></div>
                      <div data-resize="sw" style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '12px', height: '12px', backgroundColor: '#22C55E', borderRadius: '50%', cursor: 'sw-resize' }}></div>
                      <div data-resize="se" style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '12px', height: '12px', backgroundColor: '#22C55E', borderRadius: '50%', cursor: 'se-resize' }}></div>
                      
                      <div data-resize="n" style={{ position: 'absolute', top: '-4px', left: '20%', right: '20%', height: '8px', backgroundColor: '#22C55E', cursor: 'n-resize', borderRadius: '4px' }}></div>
                      <div data-resize="s" style={{ position: 'absolute', bottom: '-4px', left: '20%', right: '20%', height: '8px', backgroundColor: '#22C55E', cursor: 's-resize', borderRadius: '4px' }}></div>
                      <div data-resize="w" style={{ position: 'absolute', left: '-4px', top: '20%', bottom: '20%', width: '8px', backgroundColor: '#22C55E', cursor: 'w-resize', borderRadius: '4px' }}></div>
                      <div data-resize="e" style={{ position: 'absolute', right: '-4px', top: '20%', bottom: '20%', width: '8px', backgroundColor: '#22C55E', cursor: 'e-resize', borderRadius: '4px' }}></div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Поле названия участка */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '13px',
          color: '#1F2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          minWidth: '220px',
        }}>
          <span style={{ fontWeight: 500 }}>{plotData?.name || 'Название участка'}</span>
          {hasChanges ? (
            <svg width="16" height="16" fill="none" stroke="#F59E0B" viewBox="0 0 24 24" style={{ marginLeft: 'auto' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" stroke="#6B7280" viewBox="0 0 24 24" style={{ marginLeft: 'auto' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          )}
        </div>
      </div>

      {/* Переключатель сезонов */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '4px',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '6px 12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        zIndex: 10,
      }}>
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSeason(idx)}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: currentSeason === idx ? '#6B7280' : '#E5E7EB',
              cursor: 'pointer',
              transition: 'all 0.2s',
              padding: 0,
            }}
          ></button>
        ))}
      </div>

      {/* Аватар */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <Avatar 
            userId={user.id} 
            firstName={user.firstName} 
            size={32}
          />
        </Link>
      </div>

      {/* Левая панель */}
      <aside style={{
        position: 'absolute',
        top: '70px',
        left: '20px',
        width: '220px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        zIndex: 10,
        maxHeight: 'calc(100vh - 280px)',
        overflowY: 'auto',
      }}>

        {selectedBed ? (
          <>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '10px' }}>
                Информация о грядке
              </h3>
              <div style={{ fontSize: '12px', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6B7280' }}>Название:</span>
                  <input
                    type="text"
                    value={selectedBed.name}
                    onChange={(e) => handleBedNameChange(e.target.value)}
                    style={{
                      width: '120px',
                      padding: '2px 6px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#1F2937',
                      textAlign: 'right',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Размеры:</span>
                  <span style={{ color: '#1F2937' }}>{Math.ceil(selectedBed.width)}x{Math.ceil(selectedBed.height)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Затенение:</span>
                  <span style={{ color: '#1F2937' }}>{selectedBed.lightLevel}</span>
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#E5E7EB' }}></div>

            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '10px' }}>
                История культур
              </h3>
              {selectedBed.cropHistory.length > 0 ? (
                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedBed.cropHistory.map((crop, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#4B5563' }}>{crop.name}</span>
                      <span style={{ color: '#6B7280' }}>{crop.date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Нет истории посадок</p>
              )}
            </div>

            <div style={{ height: '1px', backgroundColor: '#E5E7EB' }}></div>
          </>
        ) : (
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '10px' }}>
              Информация об участке
            </h3>
            <div style={{ fontSize: '12px', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Название:</span>
                <span style={{ color: '#1F2937' }}>{plotData?.name || 'Название участка'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Размеры:</span>
                <span style={{ color: '#1F2937' }}>{plotData?.width || 40}x{plotData?.height || 50}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Почва:</span>
                <span style={{ color: '#1F2937' }}>{plotData?.soilType || 'Не указана'}</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', margin: 0 }}>
              Список задач
            </h3>
            <button
              type="button"
              onClick={() => setIsCreateTaskModalOpen(true)}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#22C55E',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                lineHeight: 1,
              }}
            >
              +
            </button>
          </div>
          {tasks.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Нет задач для этого участка</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasks.map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => handleTaskChange(task.id)}
                    style={{ accentColor: '#22C55E', width: '14px', height: '14px', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ 
                    fontSize: '12px', 
                    color: task.done ? '#9CA3AF' : '#4B5563', 
                    textDecoration: task.done ? 'line-through' : 'none',
                    flex: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleEditTask(task)}
                  >
                    {task.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEditTask(task)}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      backgroundColor: '#DCFCE7',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      flexShrink: 0,
                    }}
                  >
                    <svg width="10" height="10" fill="none" stroke="#16A34A" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      backgroundColor: '#FEE2E2',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      flexShrink: 0,
                    }}
                  >
                    <svg width="10" height="10" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Кнопки экспорта/импорта/печати */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10,
      }}>
        <button
          type="button"
          onClick={handleExport}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '1px solid #D1D5DB',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
          }}
          title="Экспорт плана"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          <svg width="20" height="20" fill="none" stroke="#6B7280" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
        
        <button
          type="button"
          onClick={handleImport}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '1px solid #D1D5DB',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
          }}
          title="Импорт плана"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          <svg width="20" height="20" fill="none" stroke="#6B7280" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>
        
        <button
          type="button"
          onClick={handlePrint}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '1px solid #D1D5DB',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
          }}
          title="Печать"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          <svg width="20" height="20" fill="none" stroke="#6B7280" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Вертикальный слайдер зума */}
      <div style={{
        position: 'absolute',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        zIndex: 10,
      }}>
        <button
          type="button"
          onClick={() => setZoom(Math.min(ZOOM_MAX, zoom + 10))}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '1px solid #D1D5DB',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          +
        </button>

        <div
          ref={zoomTrackRef}
          style={{
            width: '3px',
            height: '80px',
            backgroundColor: '#9CA3AF',
            borderRadius: '2px',
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            const rect = zoomTrackRef.current?.getBoundingClientRect();
            if (!rect) return;
            const y = e.clientY - rect.top;
            const percent = 1 - (y / rect.height);
            const clamped = Math.max(0, Math.min(1, percent));
            setZoom(Math.round(ZOOM_MIN + clamped * (ZOOM_MAX - ZOOM_MIN)));
          }}
        >
          <div
            onMouseDown={handleZoomDragStart}
            style={{
              position: 'absolute',
              bottom: `${zoomThumbPosition}%`,
              left: '50%',
              transform: 'translate(-50%, 50%)',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '1px solid #6B7280',
              cursor: isDraggingZoom ? 'grabbing' : 'grab',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              zIndex: 10,
            }}
          ></div>
        </div>

        <button
          type="button"
          onClick={() => setZoom(Math.max(ZOOM_MIN, zoom - 10))}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '1px solid #D1D5DB',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          −
        </button>
      </div>

      {/* Кнопки внизу слева */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10,
      }}>
        <button
          type="button"
          onClick={handleSave}
          style={{
            width: '220px',
            padding: '10px',
            backgroundColor: hasChanges ? '#22C55E' : 'white',
            color: hasChanges ? 'white' : '#374151',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          Сохранить
        </button>
        <button
          type="button"
          onClick={handleNavigateBack}
          style={{
            display: 'block',
            width: '220px',
            padding: '10px',
            backgroundColor: 'white',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#374151',
            textDecoration: 'none',
            textAlign: 'center',
            boxSizing: 'border-box',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            cursor: 'pointer',
          }}
        >
          Вернуться к списку
        </button>
      </div>

      {/* Таймлайн */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '50%',
        maxWidth: '600px',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        zIndex: 10,
      }}>
        <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '14px', padding: 0 }}>‹</button>
        {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentTimeline(idx)}
            style={{
              width: currentTimeline === idx ? '14px' : '10px',
              height: currentTimeline === idx ? '14px' : '10px',
              borderRadius: '50%',
              backgroundColor: currentTimeline === idx ? '#6B7280' : '#D1D5DB',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.2s',
            }}
          ></button>
        ))}
        <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '14px', padding: 0 }}>›</button>
      </div>

      {/* Зум-индикатор */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '8px 16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        fontSize: '12px',
        color: '#4B5563',
        minWidth: '60px',
        textAlign: 'center',
        zIndex: 10,
      }}>
        {zoom}%
      </div>

      {/* Контекстное меню */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '8px 0',
            zIndex: 1000,
            minWidth: '140px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.bedId ? (
            <>
              <button
                type="button"
                onClick={handlePlantClick}
                style={{ display: 'block', width: '100%', padding: '8px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#1F2937' }}
              >
                Посадить
              </button>
              <button
                type="button"
                onClick={handleEditBedClick}
                style={{ display: 'block', width: '100%', padding: '8px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#1F2937' }}
              >
                Изменить
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(contextMenu.bedId || null)}
                style={{ display: 'block', width: '100%', padding: '8px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#DC2626' }}
              >
                Удалить
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCreateBed}
              style={{ display: 'block', width: '100%', padding: '8px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#1F2937' }}
            >
              Создать грядку здесь
            </button>
          )}
        </div>
      )}

      {/* Модалка посадки */}
      {isPlantingModalOpen && (
        <div
          onClick={() => setIsPlantingModalOpen(false)}
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
            animation: 'fadeIn 0.2s ease-in',
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
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', margin: 0 }}>
                Посадить культуру
              </h2>
              <button
                type="button"
                onClick={() => setIsPlantingModalOpen(false)}
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

            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
              Выберите культуру для посадки на грядку
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {cropsList.map((crop) => (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => setPlantingCropId(crop.id)}
                  style={{
                    padding: '12px 8px',
                    border: '2px solid',
                    borderColor: plantingCropId === crop.id ? '#22C55E' : '#E5E7EB',
                    backgroundColor: plantingCropId === crop.id ? '#F0FDF4' : 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{crop.icon}</span>
                  <span style={{ fontSize: '12px', color: plantingCropId === crop.id ? '#166534' : '#4B5563', fontWeight: plantingCropId === crop.id ? 600 : 400 }}>
                    {crop.name}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setIsPlantingModalOpen(false)}
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
                onClick={confirmPlanting}
                disabled={!plantingCropId}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: plantingCropId ? '#22C55E' : '#D1D5DB',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: plantingCropId ? 'white' : '#9CA3AF',
                  cursor: plantingCropId ? 'pointer' : 'not-allowed',
                  fontWeight: 500,
                }}
              >
                Посадить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка редактирования грядки */}
      {isEditBedModalOpen && (
        <div
          onClick={() => setIsEditBedModalOpen(false)}
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
            animation: 'fadeIn 0.2s ease-in',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', margin: 0 }}>
                Редактировать грядку
              </h2>
              <button
                type="button"
                onClick={() => setIsEditBedModalOpen(false)}
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
                Название грядки
              </label>
              <input
                type="text"
                value={editBedName}
                onChange={(e) => setEditBedName(e.target.value)}
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
                Степень затенения
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {LIGHT_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setEditBedLightLevel(level.value)}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      border: '2px solid',
                      borderColor: editBedLightLevel === level.value ? '#22C55E' : '#E5E7EB',
                      backgroundColor: editBedLightLevel === level.value ? '#F0FDF4' : 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{level.icon}</span>
                    <span style={{ 
                      fontSize: '12px', 
                      color: editBedLightLevel === level.value ? '#166534' : '#4B5563',
                      fontWeight: editBedLightLevel === level.value ? 600 : 400,
                    }}>
                      {level.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', margin: 0 }}>
                  История культур
                </label>
                <button
                  type="button"
                  onClick={addCropToHistory}
                  style={{
                    padding: '4px 10px',
                    backgroundColor: '#22C55E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  + Добавить
                </button>
              </div>
              
              {editBedHistory.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '8px 0' }}>Нет записей</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {editBedHistory.map((crop, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={crop.name}
                        onChange={(e) => updateCropName(idx, e.target.value)}
                        placeholder="Название культуры"
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '4px',
                          fontSize: '12px',
                          outline: 'none',
                        }}
                      />
                      <input
                        type="text"
                        value={crop.date}
                        onChange={(e) => updateCropDate(idx, e.target.value)}
                        placeholder="ДД.ММ.ГГГГ"
                        style={{
                          width: '100px',
                          padding: '6px 8px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '4px',
                          fontSize: '12px',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeCropFromHistory(idx)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: '#FEE2E2',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          flexShrink: 0,
                        }}
                      >
                        <svg width="12" height="12" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setIsEditBedModalOpen(false)}
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
                onClick={saveEditBed}
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
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка редактирования задачи */}
      {isEditTaskModalOpen && (
        <div
          onClick={() => setIsEditTaskModalOpen(false)}
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
            animation: 'fadeIn 0.2s ease-in',
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
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', margin: 0 }}>
                Редактировать задачу
              </h2>
              <button
                type="button"
                onClick={() => setIsEditTaskModalOpen(false)}
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
                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                  Название задачи
                </label>
                <input
                  type="text"
                  value={editTaskText}
                  onChange={(e) => setEditTaskText(e.target.value)}
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
                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                  Дата выполнения
                </label>
                <input
                  type="date"
                  value={editTaskDueDate}
                  onChange={(e) => setEditTaskDueDate(e.target.value)}
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
                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                  Приоритет
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEditTaskPriority(p)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid',
                        borderColor: editTaskPriority === p ? getPriorityTextColor(p) : '#E5E7EB',
                        backgroundColor: editTaskPriority === p ? getPriorityColor(p) : 'white',
                        color: editTaskPriority === p ? getPriorityTextColor(p) : '#6B7280',
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
                  onClick={() => setIsEditTaskModalOpen(false)}
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
                  onClick={saveEditTask}
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
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модалка создания задачи */}
      {isCreateTaskModalOpen && (
        <div
          onClick={() => setIsCreateTaskModalOpen(false)}
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
            animation: 'fadeIn 0.2s ease-in',
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
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', margin: 0 }}>
                Новая задача
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(false)}
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
                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                  Название задачи
                </label>
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
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
                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                  Дата выполнения
                </label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
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
                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                  Приоритет
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(p)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid',
                        borderColor: newTaskPriority === p ? getPriorityTextColor(p) : '#E5E7EB',
                        backgroundColor: newTaskPriority === p ? getPriorityColor(p) : 'white',
                        color: newTaskPriority === p ? getPriorityTextColor(p) : '#6B7280',
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
                  onClick={() => setIsCreateTaskModalOpen(false)}
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
                  onClick={handleCreateTask}
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
                  Создать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модалка импорта */}
      {isImportModalOpen && (
        <div
          onClick={() => setIsImportModalOpen(false)}
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
            animation: 'fadeIn 0.2s ease-in',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', margin: 0 }}>
                Импорт плана участка
              </h2>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
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
                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                  Загрузить из файла
                </label>
                <button
                  type="button"
                  onClick={handleFileImport}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#F3F4F6',
                    border: '2px dashed #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#6B7280',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  📁 Выбрать JSON файл
                </button>
              </div>

              <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '12px' }}>или</div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                  Вставить данные
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder='Вставьте JSON данные здесь...'
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    minHeight: '120px',
                    fontFamily: 'monospace',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
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
                  onClick={handlePasteImport}
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
                  Импортировать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модалка подтверждения удаления */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Удалить грядку?"
        message="Это действие нельзя отменить. Вся история посадок будет потеряна."
        confirmText="Удалить"
        cancelText="Отмена"
        danger={true}
        onConfirm={confirmDeleteBed}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Модалка подтверждения выхода с несохранёнными изменениями */}
      {showUnsavedConfirm && (
        <ConfirmModal
          isOpen={showUnsavedConfirm}
          title="Несохранённые изменения"
          message="У вас есть несохранённые изменения. Вы уверены, что хотите выйти?"
          confirmText="Выйти"
          cancelText="Отмена"
          danger={false}
          onConfirm={confirmNavigation}
          onCancel={cancelNavigation}
        />
      )}
    </div>
  );
}