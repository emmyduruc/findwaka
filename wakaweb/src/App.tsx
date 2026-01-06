import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { NearbyDriversPage } from './pages/NearbyDriversPage';
import { ProfilePage } from './pages/ProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { SignInModal } from './components/SignInModal';
import { DriverContactModal } from './components/DriverContactModal';
import { Sidebar } from './components/Sidebar';
import { useAuthStore } from './stores/auth';
import { useChatStore } from './stores/chat';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authStatus } = useAuthStore();
  
  if (authStatus === 'guest') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { initialize, authStatus } = useAuthStore();
  const { connectWebSocket, disconnectWebSocket } = useChatStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (authStatus === 'loggedIn') {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }
  }, [authStatus]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        {authStatus === 'loggedIn' && <Sidebar />}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/nearby" element={<NearbyDriversPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SignInModal />
        <DriverContactModal />
      </div>
    </BrowserRouter>
  );
}

export default App;
