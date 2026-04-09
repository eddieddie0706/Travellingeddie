import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { TripProvider } from './contexts/TripContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TripDetailPage from './pages/TripDetailPage';
import PasswordGate from './components/PasswordGate';

export default function App() {
  return (
    <PasswordGate>
      <BrowserRouter>
        <LanguageProvider>
          <TripProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/trip/:id" element={<TripDetailPage />} />
              </Route>
            </Routes>
          </TripProvider>
        </LanguageProvider>
      </BrowserRouter>
    </PasswordGate>
  );
}
