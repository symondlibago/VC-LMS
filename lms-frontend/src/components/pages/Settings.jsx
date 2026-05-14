import { useState } from 'react'
import { KeyRound, User, Lock, Save } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import API_BASE_URL from '../../services/Config'
import { getUser } from '../../utils/auth'

const Settings = () => {
  const [user, setUser] = useState(getUser())
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Setup PIN state
  const [setupPin, setSetupPin] = useState('')

  // Update Settings state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    current_password: '',
    current_second_password: '',
    new_password: '',
    new_second_password: ''
  })

  // THE FIX: Added !text-gray-900 and placeholder:!text-gray-500 to force the text colors
  const inputStyle = "w-full h-12 px-4 bg-gray-50 border border-gray-300 !text-gray-900 placeholder:!text-gray-500 focus:bg-white focus:border-[#991b1b] focus:ring-4 focus:ring-[#991b1b]/10 rounded-xl transition-all duration-300 shadow-sm"

  const handleSetupPin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/settings/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ setup_second_password: setupPin })
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        setMessage({ type: 'success', text: data.message })
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error.' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSettings = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/settings/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        setMessage({ type: 'success', text: data.message })
        setFormData({ ...formData, current_password: '', current_second_password: '', new_password: '', new_second_password: '' })
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Account Settings</h2>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-xl font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.text}
        </div>
      )}

      {!user.has_second_password ? (
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-orange-800 mb-2 flex items-center gap-2">
            <KeyRound className="w-5 h-5" /> Security Required
          </h3>
          <p className="text-orange-700 text-sm mb-4">You must set up a 6-digit 2nd Password before you can change your name or login password.</p>
          <form onSubmit={handleSetupPin} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter 6-digit PIN"
              maxLength={6}
              required
              value={setupPin}
              onChange={(e) => setSetupPin(e.target.value)}
              className={`${inputStyle} text-center tracking-[1em] text-lg font-mono placeholder:tracking-normal placeholder:text-left`}
            />
            <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-[#7f1d1d] to-[#991b1b] hover:from-[#991b1b] hover:to-[#b91c1c] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
              {loading ? 'Saving...' : 'Set 2nd Password'}
            </Button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleUpdateSettings} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Display Name</label>
            <Input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">New Login Password</label>
              <Input 
                type="password" 
                placeholder="Leave blank to keep current" 
                value={formData.new_password} 
                onChange={(e) => setFormData({...formData, new_password: e.target.value})} 
                className={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">New 2nd Password (PIN)</label>
              <Input 
                type="password" 
                maxLength={6} 
                placeholder="Leave blank to keep current" 
                value={formData.new_second_password} 
                onChange={(e) => setFormData({...formData, new_second_password: e.target.value})} 
                className={`${inputStyle} text-center font-mono placeholder:tracking-normal placeholder:text-left`}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-5 mt-8">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#991b1b]"/> 
              Authorization Required
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <Input 
                type="password" 
                placeholder="Current Password" 
                required 
                value={formData.current_password} 
                onChange={(e) => setFormData({...formData, current_password: e.target.value})} 
                className={inputStyle}
              />
              <Input 
                type="password" 
                placeholder="Current 2nd Password (PIN)" 
                maxLength={6} 
                required 
                value={formData.current_second_password} 
                onChange={(e) => setFormData({...formData, current_second_password: e.target.value})} 
                className={`${inputStyle} text-center font-mono tracking-[0.5em] placeholder:tracking-normal placeholder:text-left`}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 mt-4 bg-gradient-to-r from-[#7f1d1d] to-[#991b1b] hover:from-[#991b1b] hover:to-[#b91c1c] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </form>
      )}
    </div>
  )
}

export default Settings