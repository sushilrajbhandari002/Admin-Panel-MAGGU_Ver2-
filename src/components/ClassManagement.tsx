import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Layers3, X } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useThemeStyles } from './useThemeStyles';
import { useSchoolSettings } from './SchoolSettingsContext';
import { toast } from 'sonner@2.0.3';

interface ClassSectionDto {
  id?: number;
  name: string;
}

interface SchoolClassDto {
  id: number;
  name: string;
  isActive: boolean;
  sections: ClassSectionDto[];
}

export function ClassManagement() {
  const theme = useThemeStyles();
  const { t } = useSchoolSettings();
  const [classes, setClasses] = useState<SchoolClassDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClassDto | null>(null);
  const [formName, setFormName] = useState('');
  const [formSections, setFormSections] = useState<ClassSectionDto[]>([{ name: 'A' }]);

  const loadClasses = () => {
    setIsLoading(true);
    setError(null);
    apiFetch<SchoolClassDto[]>('/admin/classes')
      .then(setClasses)
      .catch((err) => setError(err.message ?? 'Failed to load classes'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const resetForm = () => {
    setEditingClass(null);
    setFormName('');
    setFormSections([{ name: 'A' }]);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (cls: SchoolClassDto) => {
    setEditingClass(cls);
    setFormName(cls.name);
    setFormSections(
      cls.sections.length > 0 ? cls.sections.map((s) => ({ id: s.id, name: s.name })) : [{ name: 'A' }]
    );
    setIsModalOpen(true);
  };

  const handleAddSectionRow = () => {
    setFormSections((prev) => [...prev, { name: '' }]);
  };

  const handleSectionChange = (index: number, value: string) => {
    setFormSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, name: value } : section))
    );
  };

  const handleRemoveSectionRow = (index: number) => {
    setFormSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Class name is required');
      return;
    }

    const sectionsPayload = formSections
      .map((s) => ({ id: s.id, name: s.name.trim() }))
      .filter((s) => s.name.length > 0);

    try {
      const payload: any = {
        name: formName.trim(),
        sections: sectionsPayload,
      };

      if (editingClass) {
        const updated = await apiFetch<SchoolClassDto>(`/admin/classes/${editingClass.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast.success('Class updated successfully');
      } else {
        const created = await apiFetch<SchoolClassDto>('/admin/classes', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setClasses((prev) => [...prev, created]);
        toast.success('Class created successfully');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save class');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      await apiFetch(`/admin/classes/${id}`, { method: 'DELETE' });
      setClasses((prev) => prev.filter((c) => c.id !== id));
      toast.success('Class deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete class');
    }
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className={`${theme.textColor} mb-2`}>{t('classes') ?? 'Classes'}</h1>
        <p className={theme.subtextColor}>
          {t('manageSchoolInfo') ?? 'Create and manage reusable classes and sections'}
        </p>
      </div>

      <div className={`${theme.bgColor} rounded-xl p-4 sm:p-6 shadow-sm border ${theme.borderColor} mb-4 sm:mb-6`}>
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 items-start sm:items-center">
          <div>
            <p className={theme.subtextColor}>
              Define classes and their sections. These will be used across Students and Teachers.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm sm:text-base"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Plus className="w-4 h-4" />
            <span>{t('addClass') ?? 'Add Class'}</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <p className={theme.subtextColor}>{t('loading')}</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6`}>
          {classes.map((cls) => (
            <div
              key={cls.id}
              className={`${theme.bgColor} rounded-xl p-4 sm:p-5 shadow-sm border ${theme.borderColor} flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}
                  >
                    <Layers3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={theme.textColor}>{cls.name}</h3>
                    <p className={`${theme.subtextColor} text-xs sm:text-sm`}>
                      {cls.sections.length} section{cls.sections.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(cls)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {cls.sections.length > 0 && (
                <div className="mt-2">
                  <p className={`${theme.subtextColor} text-xs mb-1`}>Sections</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.sections.map((section) => (
                      <span
                        key={section.id ?? section.name}
                        className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
                      >
                        {section.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {classes.length === 0 && (
            <div className="col-span-full">
              <div
                className={`${theme.bgColor} rounded-xl p-6 border-dashed border-2 ${theme.borderColor} text-center`}
              >
                <p className={theme.subtextColor}>{t('noDataFound')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 text-lg font-semibold">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-gray-700 mb-2 block">Class Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Grade 10, Class 9A"
                  required
                />
              </div>

              <div>
                <label className="text-gray-700 mb-2 block">Sections</label>
                <div className="space-y-2">
                  {formSections.map((section, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) => handleSectionChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Section ${String.fromCharCode(65 + index)}`}
                      />
                      {formSections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSectionRow(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddSectionRow}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Section
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingClass ? t('saveChanges') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

