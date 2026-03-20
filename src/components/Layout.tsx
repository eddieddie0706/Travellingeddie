import { Outlet, Link, useLocation } from 'react-router-dom';
import { Plane, List, ArrowLeft } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isHome && (
              <Link to="/" className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface-container transition-colors">
                <ArrowLeft size={20} />
              </Link>
            )}
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
              <Plane size={22} className="text-primary" />
              <span className="hidden sm:inline">TravellingEddie</span>
            </Link>
          </div>
          {isHome && (
            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-1.5 text-sm rounded-lg hover:bg-surface-container transition-colors flex items-center gap-1.5"
              >
                <List size={16} />
                <span className="hidden sm:inline">我的旅行</span>
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
