import { useState } from 'react';
import { Search, Filter, Plus, Download, Edit, Trash2, Eye, Upload, User } from 'lucide-react';
import { useSchoolSettings } from './SchoolSettingsContext';
import { useThemeStyles } from './useThemeStyles';

interface Student {
  id: number;
  name: string;
  class: string;
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
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importClass, setImportClass] = useState('');
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: 'Emma Thompson', class: 'Grade 10', rollNo: '2023001', phone: '555-0101', email: 'emma.t@email.com', guardian: 'John Thompson', address: '123 Main St', status: 'Active', dateOfBirth: '2008-05-15', admissionDate: '2023-04-01' },
    { id: 2, name: 'Michael Chen', class: 'Grade 9', rollNo: '2023045', phone: '555-0102', email: 'michael.c@email.com', guardian: 'Lisa Chen', address: '456 Oak Ave', status: 'Active', dateOfBirth: '2009-03-22', admissionDate: '2023-04-01' },
    { id: 3, name: 'Sophia Rodriguez', class: 'Grade 11', rollNo: '2022098', phone: '555-0103', email: 'sophia.r@email.com', guardian: 'Carlos Rodriguez', address: '789 Pine Rd', status: 'Active', dateOfBirth: '2007-11-08', admissionDate: '2022-04-01' },
    { id: 4, name: 'James Wilson', class: 'Grade 10', rollNo: '2023012', phone: '555-0104', email: 'james.w@email.com', guardian: 'Sarah Wilson', address: '321 Elm St', status: 'Active', dateOfBirth: '2008-07-19', admissionDate: '2023-04-01' },
    { id: 5, name: 'Olivia Brown', class: 'Grade 12', rollNo: '2021067', phone: '555-0105', email: 'olivia.b@email.com', guardian: 'David Brown', address: '654 Maple Dr', status: 'Active', dateOfBirth: '2006-09-30', admissionDate: '2021-04-01' },
    { id: 6, name: 'Ethan Davis', class: 'Grade 9', rollNo: '2023056', phone: '555-0106', email: 'ethan.d@email.com', guardian: 'Jennifer Davis', address: '987 Cedar Ln', status: 'Active', dateOfBirth: '2009-01-14', admissionDate: '2023-04-01' },
    { id: 7, name: 'Ava Martinez', class: 'Grade 11', rollNo: '2022089', phone: '555-0107', email: 'ava.m@email.com', guardian: 'Miguel Martinez', address: '147 Birch Way', status: 'Inactive', dateOfBirth: '2007-12-25', admissionDate: '2022-04-01' },
    { id: 8, name: 'Noah Johnson', class: 'Grade 8', rollNo: '2024023', phone: '555-0108', email: 'noah.j@email.com', guardian: 'Emily Johnson', address: '258 Spruce Ct', status: 'Active', dateOfBirth: '2010-06-05', admissionDate: '2024-04-01' },
  ]);

  const classes = ['all', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  const filteredStudents = students.filter(student => {
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.rollNo.includes(searchQuery);
    return matchesClass && matchesSearch;
  });

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!importClass) {
      alert('Please select a class first!');
      return;
    }

    // Simulate Excel/CSV parsing
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // In a real application, you would use a library like xlsx or papaparse
        // For now, we'll simulate adding students
        alert(`Excel file "${file.name}" imported successfully for ${importClass}!`);
        
        // Example: Add a sample imported student
        const newStudent: Student = {
          id: Date.now(),
          name: 'Imported Student',
          class: importClass,
          rollNo: `IMP${Date.now().toString().slice(-4)}`,
          phone: '555-9999',
          email: 'imported@email.com',
          guardian: 'Guardian Name',
          address: 'Imported Address',
          status: 'Active',
          dateOfBirth: '2008-01-01',
          admissionDate: new Date().toISOString().split('T')[0]
        };
        
        setStudents([...students, newStudent]);
        setShowImportModal(false);
        setImportClass('');
      } catch (error) {
        alert('Error importing Excel file. Please check the format.');
      }
    };
    reader.readAsText(file);
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
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme.subtextColor}`} />
            <input
              type="text"
              placeholder={t('searchStudents')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${theme.inputBg}`}
              style={{ focusRingColor: theme.primaryColor }}
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
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls === 'all' ? t('allClasses') : cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          <button 
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
                  <td className={`px-6 py-4 ${theme.textColor}`}>{student.class}</td>
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
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                <span className={theme.textColor}>{student.class}</span>
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
                    <p className="text-gray-900">{student.class}</p>
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
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
    </>
  );
}