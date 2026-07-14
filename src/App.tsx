import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/UI/Header/Header';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Tasks from './pages/Tasks';
import PlotEditor from './pages/PlotEditor';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CropDetail from './pages/CropDetail';
import ComponentsShowcase from './pages/ComponentsShowcase';

// Компонент-обёртка, который решает, показывать ли Header
function AppLayout() {
  const location = useLocation();
  const hideHeader = location.pathname === '/login';
  
  // TODO: Получить реальные данные пользователя из AuthContext
  // const { user } = useAuth();
  const userId = 'user-123'; // Временная заглушка
  const firstName = 'Алексей'; // Временная заглушка

  return (
    <>
      {!hideHeader && <Header userId={userId} firstName={firstName} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/plot/:id" element={<ProtectedRoute><PlotEditor /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/crop/:id" element={<ProtectedRoute><CropDetail /></ProtectedRoute>} />
        <Route path="/components" element={<ComponentsShowcase />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppLayout />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;