import { createContext, useContext } from 'react';

export interface AdminDashboardData {
  stats: { label: string; value: number }[];
  students: Array<{
    id: number;
    name: string;
    class?: string | null;
    rollNo?: string | null;
    phone?: string | null;
    email: string;
    guardian: string;
    status: string;
    address?: string | null;
  }>;
  teachers: Array<{
    id: number;
    name: string;
    teacherId?: string | null;
    subject: string;
    phone?: string | null;
    email: string;
    classes: string[];
    status: string;
  }>;
  notices: Array<{
    id: number;
    title: string;
    content: string;
    date: string;
    type: string;
  }>;
  events: Array<{
    id: number;
    title: string;
    date: string;
    time: string;
    venue: string;
  }>;
  classes: Array<{
    id: number;
    name: string;
    subject: string;
    students: number;
    schedule: string;
  }>;
}

const AdminDataContext = createContext<AdminDashboardData | null>(null);

export const AdminDataProvider = AdminDataContext.Provider;

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider');
  }
  return context;
}

