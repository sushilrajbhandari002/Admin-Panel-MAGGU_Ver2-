import { useEffect, useState } from 'react';
import { Search, Filter, Plus, Download, Edit, Trash2, Eye, Upload, User, X, EyeOff } from 'lucide-react';
import { useSchoolSettings } from './SchoolSettingsContext';
import { useThemeStyles } from './useThemeStyles';
import { useAdminData } from './AdminDataContext';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner@2.0.3';
import { validateNepalPhone, validateStrongPassword } from '../lib/validation';
import * as XLSX from 'xlsx';

interface Student {
  id: number;
  name: string;
  class?: string | null;
  rollNo: string;
  phone: string;
  email: string;
  guardian: string;
  address: string;
  status: string;
  photo?: string;
  dateOfBirth?: string;
  admissionDate?: string;
}

export function StudentManagement() {
  const { t } = useSchoolSettings();
  const theme = useThemeStyles();
  const adminData = useAdminData();
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchName, setSearchName] = useState('');
  const [searchRoll, setSearchRoll] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importClass, setImportClass] = useState('');
  const [students, setStudents] = useState<Student[]>(adminData.students as Student[]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    class: '',
    rollNumber: '',
  });

  useEffect(() => {
    setStudents(adminData.students as Student[]);
  }, [adminData.students]);

  useEffect(() => {
    apiFetch<Array<{ id: number; name: string }>>('/admin/classes')
      .then((cls) => {
        setAvailableClasses(cls.map((c) => c.name));
      })
      .catch(() => {
        // fallback to classes from students if API fails
        const derived = Array.from(new Set(students.map((s) => s.class ?? 'Unknown'))).filter(
          (c) => c !== 'Unknown'
        );
        setAvailableClasses(derived);
      });
  }, [students]);

  const classes = ['all', ...availableClasses];

  const filteredStudents = students.filter(student => {
    const studentClass = student.class ?? '';
    const matchesClass = selectedClass === 'all' || studentClass === selectedClass;
    const matchesName =
      !searchName ||
      student.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesRoll =
      !searchRoll || (student.rollNo ?? '').toLowerCase().includes(searchRoll.toLowerCase());
    return matchesClass && matchesName && matchesRoll;
  });

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await apiFetch(`/admin/users/${id}`, {
        method: 'DELETE',
      });
      toast.success('Student deleted successfully!');
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete student');
    }
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: '', // Don't pre-fill password
      phone: student.phone,
      address: student.address,
      class: student.class || '',
      rollNumber: student.rollNo,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    const newErrors: Record<string, string | null> = {};
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    const phoneError = validateNepalPhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    if (formData.password) {
      const pwError = validateStrongPassword(formData.password);
      if (pwError) newErrors.password = pwError;
    }
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      toast.error('Please fix the highlighted errors');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        class: formData.class || undefined,
        rollNumber: formData.rollNumber || undefined,
      };

      // Only include password if it's been changed
      if (formData.password) {
        payload.password = formData.password;
      }

      await apiFetch(`/admin/users/${editingStudent.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      toast.success('Student updated successfully!');
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id
            ? {
                ...s,
                name: payload.name,
                email: payload.email,
                phone: payload.phone ?? '',
                address: payload.address ?? '',
                class: payload.class ?? s.class,
                rollNo: payload.rollNumber ?? s.rollNo,
              }
            : s
        )
      );
      setShowEditModal(false);
      setEditingStudent(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!importClass) {
      toast.error('Please select a class first');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const createdStudents: Student[] = [];
        for (const row of rows) {
          const name: string = row.Name || row.name || '';
          const rollNo: string = row['Roll No'] || row.rollNo || row.roll || '';
          const phone: string = row.Phone || row.phone || '';
          const email: string = row.Email || row.email || '';
          const guardian: string = row.Guardian || row.guardian || '';
          const address: string = row.Address || row.address || '';

          if (!name || !rollNo) {
            continue;
          }

          try {
            const payload: any = {
              name,
              email: email || `${rollNo}@example.com`,
              password: 'Temp@1234',
              role: 'student' as const,
              phone: phone || undefined,
              address: address || undefined,
              class: importClass,
              rollNumber: rollNo,
            };
            const created = await apiFetch<any>('/admin/users', {
              method: 'POST',
              body: JSON.stringify(payload),
            });
            createdStudents.push({
              id: created.id,
              name: created.name,
              class: created.class,
              rollNo: created.rollNumber,
              phone: created.phone ?? '',
              email: created.email,
              guardian: guardian || 'Parent/Guardian',
              address: created.address ?? '',
              status: 'Active',
            });
          } catch (err) {
            // continue importing next rows
          }
        }

        if (createdStudents.length > 0) {
          setStudents((prev) => [...prev, ...createdStudents]);
          toast.success(`Imported ${createdStudents.length} students into ${importClass}`);
        } else {
          toast.error('No valid rows found to import');
        }
        setShowImportModal(false);
        setImportClass('');
      } catch (error) {
        toast.error('Error importing Excel file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Roll No', 'Name', 'Class', 'Phone', 'Email', 'Guardian', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(s => 
        [s.rollNo, s.name, s.class, s.phone, s.email, s.guardian, s.status].join(',')
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students_export.csv';
    link.click();
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className={`${theme.textColor} mb-2`}>{t('studentManagement')}</h1>
        <p className={theme.subtextColor}>{t('manageStudentInfo')}</p>
      </div>

      {/* Filters and Actions */}
      <div className={`${theme.bgColor} rounded-xl p-4 sm:p-6 shadow-sm border ${theme.borderColor} mb-4 sm:mb-6`}>
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-4">
          {/* Name Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme.subtextColor}`} />
            <input
              type="text"
              placeholder={t('searchStudents')}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${theme.inputBg}`}
              style={{ focusRingColor: theme.primaryColor }}
            />
          </div>

          {/* Roll Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by roll number..."
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${theme.inputBg}`}
            />
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <Filter className={`w-5 h-5 ${theme.subtextColor}`} />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={`flex-1 sm:flex-none px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${theme.inputBg}`}
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls === 'all' ? t('allClasses') : cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          <button 
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm sm:text-base">{t('addStudent')}</span>
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm sm:text-base">{t('importExcel')}</span>
          </button>
          <button 
            onClick={handleExport}
            className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors ${theme.borderColorAlt} ${theme.hoverColor}`}
          >
            <Download className="w-5 h-5" />
            <span className="text-sm sm:text-base">{t('export')}</span>
          </button>
        </div>
      </div>

      {/* Students Table - Desktop */}
      <div className={`hidden md:block ${theme.bgColor} rounded-xl shadow-sm border ${theme.borderColor} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${theme.bgColorAlt} border-b ${theme.borderColor}`}>
              <tr>
                <th className={`px-6 py-3 text-left ${theme.textColor}`}>{t('rollNo')}</th>
                <th className={`px-6 py-3 text-left ${theme.textColor}`}>{t('studentName')}</th>
                <th className={`px-6 py-3 text-left ${theme.textColor}`}>{t('class')}</th>
                <th className={`px-6 py-3 text-left ${theme.textColor}`}>{t('phone')}</th>
                <th className={`px-6 py-3 text-left ${theme.textColor}`}>{t('parent')}</th>
                <th className={`px-6 py-3 text-left ${theme.textColor}`}>{t('status')}</th>
                <th className={`px-6 py-3 text-left ${theme.textColor}`}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme.borderColor}`}>
              {filteredStudents.map((student) => (
                <tr key={student.id} className={theme.hoverColor + " transition-colors"}>
                  <td className={`px-6 py-4 ${theme.textColor}`}>{student.rollNo}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className={theme.textColor}>{student.name}</p>
                      <p className={`${theme.subtextColor} text-sm`}>{student.email}</p>
                    </div>
                  </td>
                  <td className={`px-6 py-4 ${theme.textColor}`}>{student.class ?? 'N/A'}</td>
                  <td className={`px-6 py-4 ${theme.textColor}`}>{student.phone}</td>
                  <td className={`px-6 py-4 ${theme.textColor}`}>{student.guardian}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      student.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedStudent(student.id)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        style={{ color: theme.primaryColor }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditClick(student)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Students Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredStudents.map((student) => (
          <div key={student.id} className={`${theme.bgColor} rounded-xl p-4 shadow-sm border ${theme.borderColor}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`${theme.textColor}`}>{student.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    student.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {student.status}
                  </span>
                </div>
                <p className={`${theme.subtextColor} text-sm`}>{student.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <span className={`${theme.subtextColor}`}>{t('rollNo')}: </span>
                <span className={theme.textColor}>{student.rollNo}</span>
              </div>
              <div>
                <span className={`${theme.subtextColor}`}>{t('class')}: </span>
                <span className={theme.textColor}>{student.class ?? 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className={`${theme.subtextColor}`}>{t('phone')}: </span>
                <span className={theme.textColor}>{student.phone}</span>
              </div>
              <div className="col-span-2">
                <span className={`${theme.subtextColor}`}>{t('parent')}: </span>
                <span className={theme.textColor}>{student.guardian}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: theme.borderColor }}>
              <button 
                onClick={() => setSelectedStudent(student.id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm"
                style={{ backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg transition-colors text-sm">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Student Details Modal */}
      {selectedStudent && (() => {
        const student = students.find(s => s.id === selectedStudent);
        if (!student) return null;
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">Student Details</h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Student Photo */}
                <div className="flex flex-col items-center">
                  {student.photo ? (
                    <img 
                      src={student.photo} 
                      alt={student.name}
                      className="w-32 h-32 rounded-lg object-cover mb-3"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-3xl mb-3">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Upload Photo
                  </button>
                </div>

                {/* Student Info */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Full Name</p>
                    <p className="text-gray-900">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Roll Number</p>
                    <p className="text-gray-900">{student.rollNo}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Class</p>
                    <p className="text-gray-900">{student.class ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Status</p>
                    <p className="text-gray-900">{student.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Date of Birth</p>
                    <p className="text-gray-900">{student.dateOfBirth || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Admission Date</p>
                    <p className="text-gray-900">{student.admissionDate || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Phone</p>
                  <p className="text-gray-900">{student.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Email</p>
                  <p className="text-gray-900">{student.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Guardian Name</p>
                  <p className="text-gray-900">{student.guardian}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 text-sm mb-1">Address</p>
                  <p className="text-gray-900">{student.address}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedStudent(null);
                    handleEditClick(student);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Student
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">Import Students from Excel</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <label className="text-gray-700 mb-2 block">Select Class *</label>
              <select
                value={importClass}
                onChange={(e) => setImportClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a class...</option>
                {classes.filter(c => c !== 'all').map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="text-gray-700 mb-2 block">Upload Excel File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm mb-3">
                  Click to upload or drag and drop<br />
                  Excel files (.xlsx, .xls, .csv)
                </p>
                <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportExcel}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                * File should contain columns: Name, Roll No, Phone, Email, Guardian, Address
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-md w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 text-xl font-semibold">Add New Student</h2>
              <button
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    address: '',
                    class: '',
                    rollNumber: '',
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
                    role: 'student' as const,
                    phone: formData.phone || undefined,
                    address: formData.address || undefined,
                    class: formData.class || undefined,
                    rollNumber: formData.rollNumber || undefined,
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
                    class: '',
                    rollNumber: '',
                  });
                  setIsAddDialogOpen(false);
                  window.location.reload();
                  toast.success('Student created successfully!');
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'Failed to create student');
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div>
                <label htmlFor="student-name" className="text-gray-700 mb-2 block">Full Name *</label>
                <input
                  id="student-name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="student-email" className="text-gray-700 mb-2 block">Email *</label>
                <input
                  id="student-email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="student-password" className="text-gray-700 mb-2 block">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="student-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, upper, lower, number, special"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>
              <div>
                <label htmlFor="student-phone" className="text-gray-700 mb-2 block">
                  Phone
                </label>
                <input
                  id="student-phone"
                  type="tel"
                  placeholder="e.g., +97798..., 98..., 97..., 96..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="student-address" className="text-gray-700 mb-2 block">Address</label>
                <input
                  id="student-address"
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="student-class" className="text-gray-700 mb-2 block">
                  Class
                </label>
                <select
                  id="student-class"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select class</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="student-rollNumber" className="text-gray-700 mb-2 block">Roll Number</label>
                <input
                  id="student-rollNumber"
                  type="text"
                  placeholder="Enter roll number"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
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
                      class: '',
                      rollNumber: '',
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
                  {isSubmitting ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-md w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 text-xl font-semibold">Edit Student</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    address: '',
                    class: '',
                    rollNumber: '',
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form 
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
            >
              <div>
                <label htmlFor="edit-student-name" className="text-gray-700 mb-2 block">Full Name *</label>
                <input
                  id="edit-student-name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-student-email" className="text-gray-700 mb-2 block">Email *</label>
                <input
                  id="edit-student-email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-student-password"
                  className="text-gray-700 mb-2 block"
                >
                  Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    id="edit-student-password"
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, upper, lower, number, special"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                  >
                    {showEditPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>
              <div>
                <label htmlFor="edit-student-phone" className="text-gray-700 mb-2 block">
                  Phone
                </label>
                <input
                  id="edit-student-phone"
                  type="tel"
                  placeholder="e.g., +97798..., 98..., 97..., 96..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="edit-student-address" className="text-gray-700 mb-2 block">Address</label>
                <input
                  id="edit-student-address"
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-student-class" className="text-gray-700 mb-2 block">
                  Class
                </label>
                <select
                  id="edit-student-class"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select class</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-student-rollNumber" className="text-gray-700 mb-2 block">Roll Number</label>
                <input
                  id="edit-student-rollNumber"
                  type="text"
                  placeholder="Enter roll number"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      phone: '',
                      address: '',
                      class: '',
                      rollNumber: '',
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
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}