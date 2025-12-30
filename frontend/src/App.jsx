import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ChartRefreshRateProvider } from './hooks/useChartRefreshRate.jsx';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/common/Toast';
import { GlobalAlertListener } from './components/GlobalAlertListener';
import { Home } from './pages/Home';
import { Overview } from './pages/Overview';
import { Dashboard } from './pages/Dashboard';
import { Predictions } from './pages/Predictions';
import { Simulation } from './pages/Simulation';
import { ControlPanel } from './pages/ControlPanel';
import { Logs } from './pages/Logs';
import { Alerts } from './pages/Alerts';
import { ModelInfo } from './pages/ModelInfo';
import { Settings } from './pages/Settings';

function App() {
  return (
    <ChartRefreshRateProvider>
      <ToastProvider>
        <Router>
          <GlobalAlertListener />
          <ToastContainer />
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/control" element={<ControlPanel />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/model-info" element={<ModelInfo />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </Router>
      </ToastProvider>
    </ChartRefreshRateProvider>
  );
}

export default App;
