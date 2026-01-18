import { useState, useEffect } from 'react';
import { Plus, Calendar, FileText, Award, Edit, Trash2, Bell, X, Save, Upload, Paperclip } from 'lucide-react';
import { useAdminData } from './AdminDataContext';
import { apiFetch } from '../lib/api';

interface Notice {
  id: string;
  topic: string;
  description: string;
  date: string;
  priority: string;
  type: string;
  attachments?: { name: string; url: string }[];
  createdAt: string;
  editedAt?: string;
}

interface Exam {
  id: string;
  title: string;
  class: string;
  startDate: string;
  endDate: string;
  subjects: string[];
  description?: string;
  createdAt: string;
  editedAt?: string;
}

interface Result {
  id: string;
  title: string;
  publishDate: string;
  class: string;
  averageScore: string;
  status: string;
  description?: string;
  attachments?: { name: string; url: string }[];
  createdAt: string;
  editedAt?: string;
}

export function NoticesEvents() {
  const [activeTab, setActiveTab] = useState<'notices' | 'exams' | 'results'>('notices');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const adminData = useAdminData();
  
  const [notices, setNotices] = useState<Notice[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  // Form state
  const [formData, setFormData] = useState<any>({});
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    // Load notices and events from backend
    const loadData = async () => {
      try {
        // Notices are already in adminData, convert to component format
        const defaultNotices: Notice[] = adminData.notices.map((notice) => ({
          id: notice.id.toString(),
          topic: notice.title,
          description: notice.content,
          date: notice.date,
          priority: notice.type === 'Event' ? 'high' : 'medium',
          type: notice.type,
          createdAt: notice.date,
        }));
        setNotices(defaultNotices);

        // Events are already in adminData, convert to component format
        const defaultExams: Exam[] = adminData.events.map((event) => ({
          id: event.id.toString(),
          title: event.title,
          class: event.venue,
          startDate: event.date,
          endDate: event.date,
          subjects: [event.title],
          createdAt: event.date,
        }));
        setExams(defaultExams);

        // Results - using sample data for now (can be extended with backend endpoint)
        const defaultResults: Result[] = adminData.students.slice(0, 3).map((student, index) => ({
          id: (index + 1).toString(),
          title: `Latest Results - ${student.class ?? 'Class'}`,
          publishDate: new Date().toISOString(),
          class: student.class ?? 'Class',
          averageScore: '85%',
          status: 'Published',
          createdAt: new Date().toISOString(),
        }));
        setResults(defaultResults);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    if (adminData.notices.length > 0 || adminData.events.length > 0) {
      loadData();
    }
  }, [adminData]);

  const refreshData = async () => {
    // Trigger a page refresh to reload admin data
    // In a production app, you'd want to use a context refresh function
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({});
    setAttachments([]);
    
    // Set current date/time automatically
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    if (activeTab === 'notices') {
      setFormData({ topic: '', description: '', date: dateStr, priority: 'medium', type: 'General' });
    } else if (activeTab === 'exams') {
      setFormData({ title: '', class: '', startDate: '', endDate: '', subjects: '', description: '' });
    } else {
      setFormData({ title: '', publishDate: dateStr, class: '', averageScore: '', status: 'Published', description: '' });
    }
    
    setShowAddModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item, subjects: item.subjects?.join(', ') || '' });
    setAttachments(item.attachments || []);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    const timestamp = new Date().toISOString();

    try {
      if (activeTab === 'notices') {
        if (!formData.topic || !formData.description) {
          alert('Please fill in all required fields');
          return;
        }

        if (editingItem) {
          // Update notice via backend
          await apiFetch(`/admin/notices/${editingItem.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              title: formData.topic,
              content: formData.description,
              date: formData.date || new Date().toISOString().split('T')[0],
              type: formData.type || 'General',
            }),
          });
          
          const updated = notices.map(n => 
            n.id === editingItem.id 
              ? { ...formData, id: editingItem.id, attachments, editedAt: timestamp, createdAt: editingItem.createdAt }
              : n
          );
          setNotices(updated);
        } else {
          // Create notice via backend
          const newNotice = await apiFetch('/admin/notices', {
            method: 'POST',
            body: JSON.stringify({
              title: formData.topic,
              content: formData.description,
              date: formData.date || new Date().toISOString().split('T')[0],
              type: formData.type || 'General',
            }),
          });
          
          const notice: Notice = {
            id: newNotice.id.toString(),
            topic: formData.topic,
            description: formData.description,
            date: formData.date || new Date().toISOString().split('T')[0],
            priority: formData.priority || 'medium',
            type: formData.type || 'General',
            attachments,
            createdAt: timestamp
          };
          setNotices([...notices, notice]);
        }
        await refreshData();
      } else if (activeTab === 'exams') {
        if (!formData.title || !formData.class || !formData.startDate || !formData.endDate) {
          alert('Please fill in all required fields');
          return;
        }

        const subjects = formData.subjects ? formData.subjects.split(',').map((s: string) => s.trim()) : [];

        if (editingItem) {
          // Update event via backend
          await apiFetch(`/admin/events/${editingItem.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              title: formData.title,
              date: formData.startDate,
              time: 'All Day',
              venue: formData.class,
            }),
          });
          
          const updated = exams.map(e => 
            e.id === editingItem.id 
              ? { ...formData, id: editingItem.id, subjects, editedAt: timestamp, createdAt: editingItem.createdAt }
              : e
          );
          setExams(updated);
        } else {
          // Create event via backend
          const newEvent = await apiFetch('/admin/events', {
            method: 'POST',
            body: JSON.stringify({
              title: formData.title,
              date: formData.startDate,
              time: 'All Day',
              venue: formData.class,
            }),
          });
          
          const exam: Exam = {
            id: newEvent.id.toString(),
            title: formData.title,
            class: formData.class,
            startDate: formData.startDate,
            endDate: formData.endDate,
            subjects,
            createdAt: timestamp
          };
          setExams([...exams, exam]);
        }
        await refreshData();
      } else {
        // Results - keep local for now (can be extended with backend endpoint)
        if (!formData.title || !formData.class) {
          alert('Please fill in all required fields');
          return;
        }

        if (editingItem) {
          const updated = results.map(r => 
            r.id === editingItem.id 
              ? { ...formData, id: editingItem.id, attachments, editedAt: timestamp, createdAt: editingItem.createdAt }
              : r
          );
          setResults(updated);
        } else {
          const newResult: Result = {
            id: Date.now().toString(),
            ...formData,
            attachments,
            createdAt: timestamp
          };
          setResults([...results, newResult]);
        }
      }

      setShowAddModal(false);
      setEditingItem(null);
      setFormData({});
      setAttachments([]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (activeTab === 'notices') {
        await apiFetch(`/admin/notices/${id}`, { method: 'DELETE' });
        const updated = notices.filter(n => n.id !== id);
        setNotices(updated);
        await refreshData();
      } else if (activeTab === 'exams') {
        await apiFetch(`/admin/events/${id}`, { method: 'DELETE' });
        const updated = exams.filter(e => e.id !== id);
        setExams(updated);
        await refreshData();
      } else {
        const updated = results.filter(r => r.id !== id);
        setResults(updated);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete');
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-gray-900 mb-2">Notices & Events Management</h1>
        <p className="text-gray-600">Post and manage school notices, exams, and results</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 sm:mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('notices')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'notices'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            Notices
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'exams'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Exams
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'results'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            Results
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            {activeTab === 'notices' && 'Add New Notice'}
            {activeTab === 'exams' && 'Schedule New Exam'}
            {activeTab === 'results' && 'Publish New Result'}
          </button>
        </div>
      </div>

      {/* Notices Tab */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-gray-900">{notice.topic}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${priorityColors[notice.priority as keyof typeof priorityColors]}`}>
                      {notice.priority}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {notice.type}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{notice.description}</p>
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{notice.date}</span>
                    </div>
                    <span>Created: {formatDateTime(notice.createdAt)}</span>
                    {notice.editedAt && (
                      <span className="text-orange-600">Edited: {formatDateTime(notice.editedAt)}</span>
                    )}
                  </div>
                  {notice.attachments && notice.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {notice.attachments.map((file, index) => (
                        <span key={index} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          <Paperclip className="w-3 h-3" />
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(notice)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(notice.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-gray-900">{exam.title}</h3>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                      {exam.class}
                    </span>
                  </div>
                  {exam.description && (
                    <p className="text-gray-600 text-sm mb-2">{exam.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-gray-600 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{exam.startDate} to {exam.endDate}</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="text-gray-600 text-sm mb-2">Subjects:</p>
                    <div className="flex flex-wrap gap-2">
                      {exam.subjects.map((subject, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500 text-xs mt-2">
                    <span>Created: {formatDateTime(exam.createdAt)}</span>
                    {exam.editedAt && (
                      <span className="text-orange-600">Edited: {formatDateTime(exam.editedAt)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(exam)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(exam.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-gray-900">{result.title}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
                      {result.status}
                    </span>
                  </div>
                  {result.description && (
                    <p className="text-gray-600 text-sm mb-2">{result.description}</p>
                  )}
                  <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                    <div>
                      <p className="text-gray-600 mb-1">Class</p>
                      <p className="text-gray-900">{result.class}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Publish Date</p>
                      <p className="text-gray-900">{result.publishDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Average Score</p>
                      <p className="text-gray-900">{result.averageScore}</p>
                    </div>
                  </div>
                  {result.attachments && result.attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {result.attachments.map((file, index) => (
                        <span key={index} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          <Paperclip className="w-3 h-3" />
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-gray-500 text-xs">
                    <span>Created: {formatDateTime(result.createdAt)}</span>
                    {result.editedAt && (
                      <span className="text-orange-600">Edited: {formatDateTime(result.editedAt)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(result)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(result.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">
                {editingItem ? 'Edit' : 'Add New'} {activeTab === 'notices' ? 'Notice' : activeTab === 'exams' ? 'Exam Routine' : 'Result'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  setFormData({});
                  setAttachments([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Notice Form */}
              {activeTab === 'notices' && (
                <>
                  <div>
                    <label className="text-gray-700 mb-2 block">Topic *</label>
                    <input
                      type="text"
                      value={formData.topic || ''}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter notice topic"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 mb-2 block">Description *</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Enter notice description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 mb-2 block">Date (Auto-filled)</label>
                      <input
                        type="date"
                        value={formData.date || ''}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 mb-2 block">Priority</label>
                      <select
                        value={formData.priority || 'medium'}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-700 mb-2 block">Type</label>
                    <select
                      value={formData.type || 'General'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="General">General</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Fee">Fee</option>
                      <option value="Admission">Admission</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                </>
              )}

              {/* Exam Form */}
              {activeTab === 'exams' && (
                <>
                  <div>
                    <label className="text-gray-700 mb-2 block">Exam Title *</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Mid-Term Examination"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 mb-2 block">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Additional details about the exam"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 mb-2 block">Class *</label>
                    <input
                      type="text"
                      value={formData.class || ''}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Grade 9-10 or All Classes"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 mb-2 block">Start Date *</label>
                      <input
                        type="date"
                        value={formData.startDate || ''}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 mb-2 block">End Date *</label>
                      <input
                        type="date"
                        value={formData.endDate || ''}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-700 mb-2 block">Subjects (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.subjects || ''}
                      onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Math, Science, English"
                    />
                  </div>
                </>
              )}

              {/* Result Form */}
              {activeTab === 'results' && (
                <>
                  <div>
                    <label className="text-gray-700 mb-2 block">Result Title *</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Mid-Term Results - Grade 10"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 mb-2 block">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Additional details about the results"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 mb-2 block">Class *</label>
                      <input
                        type="text"
                        value={formData.class || ''}
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Grade 10"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 mb-2 block">Publish Date (Auto-filled)</label>
                      <input
                        type="date"
                        value={formData.publishDate || ''}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 mb-2 block">Average Score</label>
                      <input
                        type="text"
                        value={formData.averageScore || ''}
                        onChange={(e) => setFormData({ ...formData, averageScore: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 82%"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 mb-2 block">Status</label>
                      <select
                        value={formData.status || 'Published'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* File Upload (for notices and results) */}
              {(activeTab === 'notices' || activeTab === 'results') && (
                <div>
                  <label className="text-gray-700 mb-2 block">Attachments (Images/Files)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-600 text-sm">Click to upload files</span>
                      <span className="text-gray-500 text-xs mt-1">Images, PDF, Word, Excel</span>
                    </label>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700 flex items-center gap-2">
                            <Paperclip className="w-4 h-4" />
                            {file.name}
                          </span>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-5 h-5" />
                {editingItem ? 'Update' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  setFormData({});
                  setAttachments([]);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}