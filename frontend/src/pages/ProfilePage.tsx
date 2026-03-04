import React, { useState } from 'react'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { User, LogOut, X, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(user?.name || '')

  const handleSave = () => {
    if (!editedName.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    
    // Update user in localStorage
    const updatedUser = { ...user, name: editedName }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    toast.success('Profile updated successfully!')
    setIsEditing(false)
    
    // Reload page to reflect changes
    window.location.reload()
  }

  const handleCancel = () => {
    setEditedName(user?.name || '')
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <User size={20} />
                Account Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    disabled={!isEditing}
                    className={`input ${!isEditing ? 'bg-dark-700/50' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input bg-dark-700/50"
                  />
                </div>

                <div className="pt-4 border-t border-dark-700 flex gap-2">
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="btn btn-secondary w-full"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={handleSave}
                        className="btn btn-primary flex-1 gap-2"
                      >
                        <Check size={18} />
                        Save
                      </button>
                      <button 
                        onClick={handleCancel}
                        className="btn btn-secondary flex-1 gap-2"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="card bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold text-white">Account Status</p>
                  <p className="text-sm text-gray-400">Active</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mt-3">Your account is secure and in good standing.</p>
            </div>

            {/* Stats */}
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Predictions</span>
                  <span className="font-bold text-white">
                    {JSON.parse(localStorage.getItem(`predictions_${user?.id}`) || '[]').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account Created</span>
                  <span className="text-sm text-gray-300">Today</span>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="btn btn-secondary w-full justify-center border-danger-500/30 text-danger-500 hover:bg-danger-500/10"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
