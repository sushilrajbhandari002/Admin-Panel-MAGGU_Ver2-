import { useEffect, useState } from 'react';
import { Search, Plus, Download, Edit, Trash2, Eye, Mail, Phone, X, Save } from 'lucide-react';
import { useAdminData } from './AdminDataContext';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner@2.0.3';

interface Teacher {
  id: number;
  name: string;
  role: string;
  subjects: string[];
  phone: string;
  email: string;
  qualification: string;
  experience: string;
  joinDate: string;
  status: string;
  post?: string;
  isClassTeacher?: boolean;
  classTeacherOf?: string;
  teachingClasses?: string[];
}

export function TeacherManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    teacherId: '',
  });
  const adminData = useAdminData();

  const mapTeachers = (teacherData: typeof adminData.teachers): Teacher[] =>
    teacherData.map((teacher) => {
      const classesArray = Array.isArray(teacher.classes) ? teacher.classes : [];
      const subjectArray = teacher.subject ? [teacher.subject] : [];
      const subjects = classesArray.length > 0 ? classesArray : subjectArray;
      
      return {
        id: teacher.id,
        name: teacher.name,
        role: 'Teacher',
        subjects: subjects,
        phone: teacher.phone ?? '',
        email: teacher.email,
        qualification: 'B.Ed.',
        experience: '5 years',
        joinDate: '2018-01-01',
        status: teacher.status,
        post: teacher.subject,
        isClassTeacher: classesArray.length > 0,
        classTeacherOf: classesArray[0],
        teachingClasses: classesArray,
      };
    });

  const [teachers, setTeachers] = useState<Teacher[]>(mapTeachers(adminData.teachers));

  useEffect(() => {
    setTeachers(mapTeachers(adminData.teachers));
  }, [adminData.teachers]);

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
    teacher.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteTeacher = async (id: number) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      await apiFetch(`/admin/users/${id}`, {
        method: 'DELETE',
      });
      toast.success('Teacher deleted successfully!');
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete teacher');
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Teacher ID', 'Status', 'Subjects'];
    const csvContent = [
      headers.join(','),
      ...filteredTeachers.map(t => 
        [
          t.name,
          t.email,
          t.phone,
          t.role,
          t.teacherId || '',
          t.status,
          t.subjects.join('; ')
        ].join(',')
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teachers_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Teachers exported successfully!');
  };

  const handleEditClick = (teacher: Teacher) => {
    setEditingTeacher({ ...teacher });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTeacher) return;

    try {
      const payload: any = {
        name: editingTeacher.name,
        email: editingTeacher.email,
        phone: editingTeacher.phone,
        address: editingTeacher.address || '',
      };

      await apiFetch(`/admin/users/${editingTeacher.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      toast.success('Teacher updated successfully!');
      setShowEditModal(false);
      setEditingTeacher(null);
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update teacher');
    }
  };

  const handleSubjectsChange = (value: string) => {
    if (!editingTeacher) return;
    const subjects = value.split(',').map(s => s.trim()).filter(s => s);
    setEditingTeacher({ ...editingTeacher, subjects });
  };

  const handleTeachingClassesChange = (value: string) => {
    if (!editingTeacher) return;
    const classes = value.split(',').map(s => s.trim()).filter(s => s);
    setEditingTeacher({ ...editingTeacher, teachingClasses: classes });
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-gray-900 mb-2">Teacher Management</h1>
        <p className="text-gray-600">Manage all teacher information, roles, and subjects</p>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, subject, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button 
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm sm:text-base">Add Teacher</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm sm:text-base">Export</span>
          </button>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTeachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base">
                {teacher.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                teacher.status === 'Active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {teacher.status}
              </span>
            </div>

            <h3 className="text-gray-900 mb-1">{teacher.name}</h3>
            <p className="text-blue-600 text-sm mb-3">{teacher.role}</p>

            {teacher.isClassTeacher && (
              <div className="mb-3 px-2 sm:px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs sm:text-sm inline-block">
                Class Teacher: {teacher.classTeacherOf}
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{teacher.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{teacher.phone}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-2">Subjects:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {teacher.subjects.map((subject, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs sm:text-sm">
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTeacher(teacher.id)}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">View</span>
              </button>
              <button 
                onClick={() => handleEditClick(teacher)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeleteTeacher(teacher.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Teacher Details Modal */}
      {selectedTeacher && (() => {
        const teacher = teachers.find(t => t.id === selectedTeacher);
        if (!teacher) return null;
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">Teacher Details</h2>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
                  {teacher.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1">{teacher.name}</h3>
                  <p className="text-blue-600">{teacher.role}</p>
                  {teacher.isClassTeacher && (
                    <p className="text-purple-600 text-sm mt-1">Class Teacher of {teacher.classTeacherOf}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Email</p>
                  <p className="text-gray-900">{teacher.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Phone</p>
                  <p className="text-gray-900">{teacher.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Qualification</p>
                  <p className="text-gray-900">{teacher.qualification}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Experience</p>
                  <p className="text-gray-900">{teacher.experience}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Join Date</p>
                  <p className="text-gray-900">{teacher.joinDate}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Status</p>
                  <p className="text-gray-900">{teacher.status}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Post</p>
                  <p className="text-gray-900">{teacher.post}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 text-sm mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects.map((subject, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                {teacher.teachingClasses && (
                  <div className="col-span-2">
                    <p className="text-gray-600 text-sm mb-2">Teaching Classes</p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.teachingClasses.map((cls, index) => (
                        <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedTeacher(null);
                    handleEditClick(teacher);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Teacher
                </button>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Teacher Modal */}
      {showEditModal && editingTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">Edit Teacher Information</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTeacher(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="text-gray-700 mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 mb-2 block">Email</label>
                  <input
                    type="email"
                    value={editingTeacher.email}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-gray-700 mb-2 block">Phone</label>
                  <input
                    type="tel"
                    value={editingTeacher.phone}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Qualification and Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 mb-2 block">Qualification</label>
                  <input
                    type="text"
                    value={editingTeacher.qualification}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, qualification: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-gray-700 mb-2 block">Experience</label>
                  <input
                    type="text"
                    value={editingTeacher.experience}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, experience: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Join Date and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 mb-2 block">Join Date</label>
                  <input
                    type="date"
                    value={editingTeacher.joinDate}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, joinDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-gray-700 mb-2 block">Status</label>
                  <select
                    value={editingTeacher.status}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Post and Role */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 mb-2 block">Post</label>
                  <input
                    type="text"
                    value={editingTeacher.post || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, post: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Senior Teacher, Assistant Teacher"
                  />
                </div>
                <div>
                  <label className="text-gray-700 mb-2 block">Role</label>
                  <input
                    type="text"
                    value={editingTeacher.role}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Class Teacher Assignment */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={editingTeacher.isClassTeacher || false}
                    onChange={(e) => setEditingTeacher({ 
                      ...editingTeacher, 
                      isClassTeacher: e.target.checked,
                      classTeacherOf: e.target.checked ? editingTeacher.classTeacherOf : undefined
                    })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Is Class Teacher</span>
                </label>

                {editingTeacher.isClassTeacher && (
                  <div>
                    <label className="text-gray-700 text-sm mb-2 block">Class Teacher Of</label>
                    <select
                      value={editingTeacher.classTeacherOf || ''}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, classTeacherOf: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a class</option>
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Subjects */}
              <div>
                <label className="text-gray-700 mb-2 block">Subjects Taught (comma-separated)</label>
                <input
                  type="text"
                  value={editingTeacher.subjects.join(', ')}
                  onChange={(e) => handleSubjectsChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mathematics, Physics, Chemistry"
                />
              </div>

              {/* Teaching Classes */}
              <div>
                <label className="text-gray-700 mb-2 block">Teaching Classes (comma-separated)</label>
                <input
                  type="text"
                  value={editingTeacher.teachingClasses?.join(', ') || ''}
                  onChange={(e) => handleTeachingClassesChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Grade 9, Grade 10, Grade 11"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTeacher(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-md w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 text-xl font-semibold">Add New Teacher</h2>
              <button
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    address: '',
                    teacherId: '',
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form 
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!formData.name || !formData.email || !formData.password) {
                  toast.error('Please fill in all required fields');
                  return;
                }

                setIsSubmitting(true);
                try {
                  const payload: any = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: 'teacher' as const,
                    phone: formData.phone || undefined,
                    address: formData.address || undefined,
                    teacherId: formData.teacherId || undefined,
                  };

                  await apiFetch('/admin/users', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                  });

                  // Reset form and reload data
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    address: '',
                    teacherId: '',
                  });
                  setIsAddDialogOpen(false);
                  // Refresh admin data
                  window.location.reload();
                  toast.success('Teacher created successfully!');
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'Failed to create teacher');
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div>
                <label htmlFor="teacher-name" className="text-gray-700 mb-2 block">Full Name *</label>
                <input
                  id="teacher-name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="teacher-email" className="text-gray-700 mb-2 block">Email *</label>
                <input
                  id="teacher-email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="teacher-password" className="text-gray-700 mb-2 block">Password *</label>
                <input
                  id="teacher-password"
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="teacher-phone" className="text-gray-700 mb-2 block">Phone</label>
                <input
                  id="teacher-phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="teacher-address" className="text-gray-700 mb-2 block">Address</label>
                <input
                  id="teacher-address"
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="teacher-teacherId" className="text-gray-700 mb-2 block">Teacher ID</label>
                <input
                  id="teacher-teacherId"
                  type="text"
                  placeholder="Enter teacher ID"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      phone: '',
                      address: '',
                      teacherId: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}