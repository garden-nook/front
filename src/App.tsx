import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Tasks from './pages/Tasks';
import PlotEditor from './pages/PlotEditor';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CropDetail from './pages/CropDetail';
import { Test } from './pages/Test';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
              <Route path="/plot/:id" element={<ProtectedRoute><PlotEditor /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/crop/:id" element={<ProtectedRoute><CropDetail /></ProtectedRoute>} />

              <Route path="/test" element={<Test />} />

              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </ToastProvider>
      </AuthProvider>
    </BrowserRouter>

    
  );
}

export default App;