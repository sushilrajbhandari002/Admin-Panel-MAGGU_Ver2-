import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/StudentManagement';
import { TeacherManagement } from './components/TeacherManagement';
import { NoticesEvents } from './components/NoticesEvents';
import { SchoolCalendar } from './components/SchoolCalendar';
import { Reports } from './components/Reports';
import { SchoolProfile } from './components/SchoolProfile';
import { SchoolSettings } from './components/SchoolSettings';
import { Login } from './components/Login';
import { SchoolSettingsProvider, useSchoolSettings } from './components/SchoolSettingsContext';
import { Menu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <SchoolSettingsProvider>
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </SchoolSettingsProvider>
  );
}

function AppContent({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { settings } = useSchoolSettings();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentManagement />;
      case 'teachers':
        return <TeacherManagement />;
      case 'notices':
        return <NoticesEvents />;
      case 'calendar':
        return <SchoolCalendar />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <SchoolProfile />;
      case 'settings':
        return <SchoolSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`flex min-h-screen ${settings.theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }} 
        />
      </div>
      
      <main className={`flex-1 overflow-y-auto ${settings.theme === 'dark' ? 'bg-gray-900' : ''}`}>
        {/* Mobile Header */}
        <div className={`lg:hidden sticky top-0 z-30 ${settings.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center gap-3`}>
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className={`p-2 rounded-lg ${settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-100' : 'hover:bg-gray-100 text-gray-900'}`}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className={settings.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
            Sushil School
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}