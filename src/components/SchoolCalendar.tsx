import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Edit, 
  Trash2, 
  Filter,
  Download,
  Upload,
  X,
  Save,
  Clock,
  Users,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  category: string;
  categoryColor: string;
  isFullDay: boolean;
  isRepeat: boolean;
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatEndDate?: string;
  targetAudience: string[];
  classes?: string[];
  image?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
}

export function SchoolCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'year'>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Holiday', color: '#EF4444', enabled: true },
    { id: '2', name: 'Exam', color: '#3B82F6', enabled: true },
    { id: '3', name: 'Sports', color: '#10B981', enabled: true },
    { id: '4', name: 'Festival', color: '#F59E0B', enabled: true },
    { id: '5', name: 'Meeting', color: '#8B5CF6', enabled: true },
    { id: '6', name: 'Orientation', color: '#EC4899', enabled: true },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAudience, setFilterAudience] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    category: '',
    categoryColor: '',
    isFullDay: true,
    isRepeat: false,
    repeatType: 'weekly',
    repeatEndDate: '',
    targetAudience: ['all'],
    classes: [],
  });

  useEffect(() => {
    // Load events from localStorage
    const savedEvents = localStorage.getItem('schoolCalendarEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      // Sample events
      const sampleEvents: Event[] = [
        {
          id: '1',
          title: 'Thanksgiving Holiday',
          description: 'School remains closed',
          date: '2025-11-27',
          category: 'Holiday',
          categoryColor: '#EF4444',
          isFullDay: true,
          isRepeat: false,
          targetAudience: ['all'],
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Mid-Term Exams Start',
          description: 'Grade 9-12 mid-term examinations',
          date: '2025-12-01',
          category: 'Exam',
          categoryColor: '#3B82F6',
          isFullDay: true,
          isRepeat: false,
          targetAudience: ['students'],
          classes: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Parent-Teacher Meeting',
          description: 'Annual PTM for all classes',
          date: '2025-12-05',
          startTime: '10:00',
          endTime: '14:00',
          category: 'Meeting',
          categoryColor: '#8B5CF6',
          isFullDay: false,
          isRepeat: false,
          targetAudience: ['teachers', 'parents'],
          createdAt: new Date().toISOString(),
        },
      ];
      setEvents(sampleEvents);
      localStorage.setItem('schoolCalendarEvents', JSON.stringify(sampleEvents));
    }
  }, []);

  const saveEvents = (updatedEvents: Event[]) => {
    setEvents(updatedEvents);
    localStorage.setItem('schoolCalendarEvents', JSON.stringify(updatedEvents));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddEvent = () => {
    if (!formData.title || !formData.date || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    const category = categories.find(c => c.name === formData.category);
    const newEvent: Event = {
      id: Date.now().toString(),
      title: formData.title!,
      description: formData.description || '',
      date: formData.date!,
      startTime: formData.isFullDay ? undefined : formData.startTime,
      endTime: formData.isFullDay ? undefined : formData.endTime,
      category: formData.category!,
      categoryColor: category?.color || '#3B82F6',
      isFullDay: formData.isFullDay!,
      isRepeat: formData.isRepeat!,
      repeatType: formData.isRepeat ? formData.repeatType : undefined,
      repeatEndDate: formData.isRepeat ? formData.repeatEndDate : undefined,
      targetAudience: formData.targetAudience || ['all'],
      classes: formData.classes,
      image: formData.image,
      createdAt: new Date().toISOString(),
    };

    saveEvents([...events, newEvent]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditEvent = () => {
    if (!selectedEvent || !formData.title || !formData.date || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    const category = categories.find(c => c.name === formData.category);
    const updatedEvent: Event = {
      ...selectedEvent,
      title: formData.title!,
      description: formData.description || '',
      date: formData.date!,
      startTime: formData.isFullDay ? undefined : formData.startTime,
      endTime: formData.isFullDay ? undefined : formData.endTime,
      category: formData.category!,
      categoryColor: category?.color || '#3B82F6',
      isFullDay: formData.isFullDay!,
      isRepeat: formData.isRepeat!,
      repeatType: formData.isRepeat ? formData.repeatType : undefined,
      repeatEndDate: formData.isRepeat ? formData.repeatEndDate : undefined,
      targetAudience: formData.targetAudience || ['all'],
      classes: formData.classes,
      image: formData.image,
      updatedAt: new Date().toISOString(),
    };

    const updatedEvents = events.map(e => e.id === selectedEvent.id ? updatedEvent : e);
    saveEvents(updatedEvents);
    setSelectedEvent(null);
    setShowAddModal(false);
    resetForm();
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = events.filter(e => e.id !== eventId);
      saveEvents(updatedEvents);
    }
  };

  const openEditModal = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      category: event.category,
      categoryColor: event.categoryColor,
      isFullDay: event.isFullDay,
      isRepeat: event.isRepeat,
      repeatType: event.repeatType,
      repeatEndDate: event.repeatEndDate,
      targetAudience: event.targetAudience,
      classes: event.classes,
      image: event.image,
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      category: '',
      categoryColor: '',
      isFullDay: true,
      isRepeat: false,
      repeatType: 'weekly',
      repeatEndDate: '',
      targetAudience: ['all'],
      classes: [],
    });
    setSelectedEvent(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      if (event.date !== dateStr) return false;
      if (filterCategory !== 'all' && event.category !== filterCategory) return false;
      if (filterAudience !== 'all' && !event.targetAudience.includes(filterAudience)) return false;
      return true;
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'school_calendar_events.json';
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedEvents = JSON.parse(event.target?.result as string);
          saveEvents([...events, ...importedEvents]);
          alert('Events imported successfully!');
        } catch (error) {
          alert('Error importing events. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Render calendar days
  const renderMonthView = () => {
    const days = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 min-h-[100px] bg-gray-50"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = 
        day === new Date().getDate() && 
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();
      const dayEvents = getEventsForDate(day);
      
      days.push(
        <div
          key={day}
          className={`p-2 min-h-[100px] border border-gray-200 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'} hover:bg-gray-50 transition-colors`}
        >
          <div className={`mb-2 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: event.categoryColor + '20', color: event.categoryColor }}
                onClick={() => openEditModal(event)}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 px-2">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">School Calendar</h1>
        <p className="text-gray-600">Manage school events, holidays, exams, and activities</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-gray-900 min-w-[180px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg transition-colors ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-lg transition-colors ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Day
            </button>
            <button
              onClick={() => setView('year')}
              className={`px-4 py-2 rounded-lg transition-colors ${view === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c.enabled).map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            value={filterAudience}
            onChange={(e) => setFilterAudience(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Audience</option>
            <option value="students">Students Only</option>
            <option value="teachers">Teachers Only</option>
            <option value="parents">Parents Only</option>
          </select>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Event
          </button>

          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Manage Categories
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export
          </button>

          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray-600 text-sm mb-2">Event Categories:</p>
          <div className="flex flex-wrap gap-2">
            {categories.filter(c => c.enabled).map(cat => (
              <div key={cat.id} className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ backgroundColor: cat.color + '20' }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="text-sm" style={{ color: cat.color }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {view === 'month' && (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center text-gray-600">
                  {day}
                </div>
              ))}
              {renderMonthView()}
            </div>
          </div>
        )}

        {view !== 'month' && (
          <div className="p-8 text-center text-gray-500">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>{view.charAt(0).toUpperCase() + view.slice(1)} view coming soon...</p>
          </div>
        )}
      </div>

      {/* Add/Edit Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">{selectedEvent ? 'Edit Event' : 'Add New Event'}</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="text-gray-700 mb-2 block">Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-gray-700 mb-2 block">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter event description"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 mb-2 block">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.isFullDay}
                      onChange={(e) => setFormData({ ...formData, isFullDay: e.target.checked })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Full Day Event</span>
                  </label>
                </div>
              </div>

              {!formData.isFullDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 mb-2 block">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 mb-2 block">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="text-gray-700 mb-2 block">Event Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.filter(c => c.enabled).map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="text-gray-700 mb-2 block">Target Audience</label>
                <div className="space-y-2">
                  {['all', 'students', 'teachers', 'parents'].map(audience => (
                    <label key={audience} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.targetAudience?.includes(audience)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...(formData.targetAudience || []), audience]
                            : (formData.targetAudience || []).filter(a => a !== audience);
                          setFormData({ ...formData, targetAudience: updated });
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700 capitalize">{audience}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Classes */}
              <div>
                <label className="text-gray-700 mb-2 block">Specific Classes (Optional)</label>
                <input
                  type="text"
                  value={formData.classes?.join(', ')}
                  onChange={(e) => setFormData({ ...formData, classes: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Grade 9, Grade 10"
                />
              </div>

              {/* Repeat Event */}
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.isRepeat}
                    onChange={(e) => setFormData({ ...formData, isRepeat: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Repeat Event</span>
                </label>

                {formData.isRepeat && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="text-gray-700 text-sm mb-2 block">Repeat Type</label>
                      <select
                        value={formData.repeatType}
                        onChange={(e) => setFormData({ ...formData, repeatType: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm mb-2 block">End Date</label>
                      <input
                        type="date"
                        value={formData.repeatEndDate}
                        onChange={(e) => setFormData({ ...formData, repeatEndDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-gray-700 mb-2 block">Event Image (Optional)</label>
                {formData.image ? (
                  <div className="relative">
                    <img src={formData.image} alt="Event" className="w-full h-40 object-cover rounded-lg" />
                    <button
                      onClick={() => setFormData({ ...formData, image: undefined })}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-gray-600 text-sm">Click to upload image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={selectedEvent ? handleEditEvent : handleAddEvent}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-5 h-5" />
                {selectedEvent ? 'Update Event' : 'Add Event'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            {selectedEvent && (
              <button
                onClick={() => {
                  handleDeleteEvent(selectedEvent.id);
                  setShowAddModal(false);
                }}
                className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Delete Event
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">Manage Categories</h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-gray-900">{cat.name}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cat.enabled}
                      onChange={(e) => {
                        const updated = categories.map(c =>
                          c.id === cat.id ? { ...c, enabled: e.target.checked } : c
                        );
                        setCategories(updated);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCategoryModal(false)}
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
