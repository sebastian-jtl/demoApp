import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initBridge } from '@/lib/bridgeService';
import { HomePage } from '@/pages/HomePage';
import { SetupPage } from '@/pages/SetupPage';
import { LoadingScreen } from '@/components/LoadingScreen';

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupBridge = async () => {
      setLoading(true);
      try {
        await initBridge();
      } finally {
        setLoading(false);
      }
    };

    setupBridge();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;
