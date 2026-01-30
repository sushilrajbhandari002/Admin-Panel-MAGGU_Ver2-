import { useState, useRef } from 'react';
import { School, MapPin, Phone, Mail, Globe, Edit, Save, X, Upload, Image, CheckCircle } from 'lucide-react';
import { useSchoolSettings } from './SchoolSettingsContext';

export function SchoolProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const { settings, updateSettings } = useSchoolSettings();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const profileBackgroundInputRef = useRef<HTMLInputElement>(null);
  const [pendingLogo, setPendingLogo] = useState<string | null>(null);
  const [pendingBackground, setPendingBackground] = useState<string | null>(null);
  const [pendingProfileBackground, setPendingProfileBackground] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    name: 'Green Valley International School',
    motto: 'Excellence in Education',
    email: 'info@greenvalleyschool.edu',
    phone: '+1 (555) 123-4567',
    website: 'www.greenvalleyschool.edu',
    address: '123 Education Lane, Knowledge City, ST 12345',
    established: '1995',
    principal: 'Dr. Sarah Johnson',
    totalStudents: '2,543',
    totalTeachers: '142',
    totalClasses: '48',
    description: 'Green Valley International School is a leading educational institution committed to providing quality education and fostering holistic development of students. We focus on academic excellence, character building, and creating future-ready global citizens.',
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save logic would go here
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form logic would go here
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingBackground(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setPendingLogo(null);
    if (settings.schoolLogo) {
      updateSettings({ schoolLogo: null });
    }
  };

  const handleRemoveBackground = () => {
    setPendingBackground(null);
    if (settings.loginBackground) {
      updateSettings({ loginBackground: null });
    }
  };

  const handleProfileBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingProfileBackground(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfileBackground = () => {
    setPendingProfileBackground(null);
    if (settings.profileBackground) {
      updateSettings({ profileBackground: null });
    }
  };

  const handlePublishChanges = () => {
    if (pendingLogo) {
      updateSettings({ schoolLogo: pendingLogo });
      setPendingLogo(null);
    }
    if (pendingBackground) {
      updateSettings({ loginBackground: pendingBackground });
      setPendingBackground(null);
    }
    if (pendingProfileBackground) {
      updateSettings({ profileBackground: pendingProfileBackground });
      setPendingProfileBackground(null);
    }
    alert('Login page customization published successfully!');
  };

  const hasChanges =
    pendingLogo !== null || pendingBackground !== null || pendingProfileBackground !== null;
  const displayLogo = pendingLogo || settings.schoolLogo;
  const displayBackground = pendingBackground || settings.loginBackground;
  const displayProfileBackground = pendingProfileBackground || settings.profileBackground;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">School Profile Management</h1>
        <p className="text-gray-600">Manage your school's information and settings</p>
      </div>

      {/* Profile Header */}
      <div
        className="rounded-xl p-8 mb-6 text-white relative overflow-hidden"
        style={
          displayProfileBackground
            ? {
                backgroundImage: `url(${displayProfileBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {!displayProfileBackground && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
        )}
        <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center overflow-hidden">
              {displayLogo ? (
                <img
                  src={displayLogo}
                  alt="School Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <School className="w-12 h-12 text-blue-600" />
              )}
            </div>
            <div>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white text-2xl mb-2 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <input
                    type="text"
                    value={profileData.motto}
                    onChange={(e) => setProfileData({ ...profileData, motto: e.target.value })}
                    className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </>
              ) : (
                <>
                  <h2 className="text-white mb-2 text-xl md:text-2xl">{profileData.name}</h2>
                  <p className="text-white/90 text-sm md:text-base">{profileData.motto}</p>
                </>
              )}
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Edit className="w-5 h-5" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
              >
                <Save className="w-5 h-5" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 mb-6">Basic Information</h3>
          
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.email}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.phone}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.website}</p>
                )}
              </div>

              <div>
                <label className="text-gray-600 text-sm mb-2 block">
                  Year Established
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.established}
                    onChange={(e) => setProfileData({ ...profileData, established: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.established}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              ) : (
                <p className="text-gray-900">{profileData.address}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-gray-600 text-sm mb-2 block">
                About School
              </label>
              {isEditing ? (
                <textarea
                  value={profileData.description}
                  onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              ) : (
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  {profileData.description}
                </p>
              )}
            </div>

            {/* Principal */}
            <div>
              <label className="text-gray-600 text-sm mb-2 block">
                Principal Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.principal}
                  onChange={(e) => setProfileData({ ...profileData, principal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.principal}</p>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-600 text-sm mb-1">Total Students</p>
                <p className="text-gray-900">{profileData.totalStudents}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-green-600 text-sm mb-1">Total Teachers</p>
                <p className="text-gray-900">{profileData.totalTeachers}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-purple-600 text-sm mb-1">Active Classes</p>
                <p className="text-gray-900">{profileData.totalClasses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-gray-900 mb-4">Login Page Customization</h3>
            
            {/* School Logo Section */}
            <div className="mb-6">
              <label className="text-gray-700 mb-2 block">School Logo (Login Icon)</label>
              <p className="text-gray-500 text-xs mb-2">Recommended: 128x128px PNG with transparent background</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {displayLogo ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img 
                        src={displayLogo} 
                        alt="School Logo" 
                        className="w-20 h-20 object-cover mx-auto rounded-lg"
                      />
                      {pendingLogo && (
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                          Pending
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Change Logo
                      </button>
                      <button 
                        onClick={handleRemoveLogo}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <School className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm mb-3">Upload school logo for login page</p>
                    <button 
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Choose File
                    </button>
                  </>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Login Background Section */}
            <div className="mb-6">
              <label className="text-gray-700 mb-2 block">Login Background Image</label>
              <p className="text-gray-500 text-xs mb-2">Recommended: 1600x900px JPG or PNG</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {displayBackground ? (
                  <div className="space-y-3">
                    <div className="relative inline-block w-full">
                      <img 
                        src={displayBackground} 
                        alt="Login Background" 
                        className="w-full h-32 object-cover mx-auto rounded-lg"
                      />
                      {pendingBackground && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                          Pending
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => backgroundInputRef.current?.click()}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Change Background
                      </button>
                      <button 
                        onClick={handleRemoveBackground}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Image className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm mb-3">Upload background image for login page</p>
                    <button 
                      onClick={() => backgroundInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Choose File
                    </button>
                  </>
                )}
                <input
                  ref={backgroundInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Profile Background Section */}
            <div className="mb-6">
              <label className="text-gray-700 mb-2 block">Profile Background Image</label>
              <p className="text-gray-500 text-xs mb-2">Recommended: 1600x400px JPG or PNG</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {displayProfileBackground ? (
                  <div className="space-y-3">
                    <div className="relative inline-block w-full">
                      <img
                        src={displayProfileBackground}
                        alt="Profile Background"
                        className="w-full h-32 object-cover mx-auto rounded-lg"
                      />
                      {pendingProfileBackground && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                          Pending
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => profileBackgroundInputRef.current?.click()}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Change Background
                      </button>
                      <button
                        onClick={handleRemoveProfileBackground}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Image className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm mb-3">
                      Upload a background image for the School Profile header
                    </p>
                    <button
                      onClick={() => profileBackgroundInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Choose File
                    </button>
                  </>
                )}
                <input
                  ref={profileBackgroundInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileBackgroundUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Publish Button */}
            {hasChanges && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 text-sm mb-3">
                  You have unsaved changes. Click "Publish Changes" to make them visible on the login page.
                </p>
                <button
                  onClick={handlePublishChanges}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Publish Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
