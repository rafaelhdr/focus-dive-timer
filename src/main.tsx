
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useTimerStore } from './store/timerStore'

// Initialize the timer store
useTimerStore.getState().initSocket();

createRoot(document.getElementById("root")!).render(<App />);
