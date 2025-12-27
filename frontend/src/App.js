import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CategorySelection from '@/pages/CategorySelection';
import GamePage from '@/pages/GamePage';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

function App() {
  return (
    <div className="App min-h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CategorySelection />} />
          <Route path="/game/:category" element={<GamePage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
