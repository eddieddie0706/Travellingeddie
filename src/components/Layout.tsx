import { Outlet, Link, useLocation } from 'react-router-dom';
import { Plane, ArrowLeft, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { locale, setLocale } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-surface-dim/85 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {!isHome && (
              <Link to="/" className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-secondary">
                <ArrowLeft size={18} />
              </Link>
            )}
            <Link to="/" className="flex items-center gap-2">
              <Plane size={18} className="text-primary" />
              <span className="hidden sm:inline font-display text-base tracking-wide text-on-surface">Travelling Eddie</span>
            </Link>
          </div>

          <button
            onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-full border border-border hover:bg-surface-container transition-colors text-on-surface-secondary"
            title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            <Globe size={13} className="inline mr-1 -mt-0.5" />
            {locale === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
