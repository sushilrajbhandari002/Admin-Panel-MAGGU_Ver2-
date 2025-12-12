import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface SchoolSettings {
  schoolLogo: string | null;
  loginBackground: string | null;
  theme: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  sidebarType: 'default' | 'compact' | 'mini';
  language: Language;
}

interface SchoolSettingsContextType {
  settings: SchoolSettings;
  updateSettings: (newSettings: Partial<SchoolSettings>) => void;
  t: (key: TranslationKey) => string;
}

const SchoolSettingsContext = createContext<SchoolSettingsContextType | undefined>(undefined);

const defaultSettings: SchoolSettings = {
  schoolLogo: null,
  loginBackground: null,
  theme: 'light',
  primaryColor: '#3B82F6',
  secondaryColor: '#8B5CF6',
  sidebarType: 'default',
  language: 'en',
};

export function SchoolSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SchoolSettings>(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('schoolSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    // Save to localStorage whenever settings change
    localStorage.setItem('schoolSettings', JSON.stringify(settings));
    
    // Apply theme to document
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply custom colors as CSS variables
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
  }, [settings]);

  const updateSettings = (newSettings: Partial<SchoolSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Translation function
  const t = (key: TranslationKey): string => {
    const lang = settings.language || 'en';
    const translationSet = translations[lang];
    if (!translationSet) {
      console.warn(`Translation set for language "${lang}" not found`);
      return key;
    }
    return translationSet[key] || key;
  };

  return (
    <SchoolSettingsContext.Provider value={{ settings, updateSettings, t }}>
      {children}
    </SchoolSettingsContext.Provider>
  );
}

export function useSchoolSettings() {
  const context = useContext(SchoolSettingsContext);
  if (context === undefined) {
    throw new Error('useSchoolSettings must be used within a SchoolSettingsProvider');
  }
  return context;
}