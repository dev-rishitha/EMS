// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx';
import { AuthProvider } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { LeaveProvider } from "./context/LeaveContext";
import { NotificationProvider } from "./context/NotificationContext";

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <TaskProvider>
      <LeaveProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </LeaveProvider>
    </TaskProvider>
  </AuthProvider>
);
