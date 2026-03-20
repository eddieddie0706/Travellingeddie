import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TripProvider } from './contexts/TripContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TripDetailPage from './pages/TripDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <TripProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/trip/:id" element={<TripDetailPage />} />
          </Route>
        </Routes>
      </TripProvider>
    </BrowserRouter>
  );
}
