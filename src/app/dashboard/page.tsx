'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface BaseUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  status: 'PENDING' | 'ACTIVE' | 'DISABLED'
  createdAt: string
  rejectionReason?: string
}

interface Farmer extends BaseUser {
  role: 'FARMER'
  farmName: string
  farmAddress: string
  farmSize: number
}

interface Buyer extends BaseUser {
  role: 'BUYER'
  paymentMethod: string
  address: string
}

type User = Farmer | Buyer

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'disabled' | 'all'>('pending')
  const [users, setUsers] = useState<User[]>([])
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const userCounts = {
    pending: users.filter(user => user.status === 'PENDING').length,
    active: users.filter(user => user.status === 'ACTIVE').length,
    disabled: users.filter(user => user.status === 'DISABLED').length,
    all: users.length
  }

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users')
        setUsers(response.data.users)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  const handleApprove = async (userId: string) => {
    try {
      const response = await axios.put(`/api/users/${userId}/activate`)
      if (response.data.user) {
        setUsers(users.map(user => 
          user.id === userId ? response.data.user : user
        ))
      }
    } catch (error) {
      console.error('Error approving user:', error)
      // You might want to add some error notification here
    }
  }

  const handleReject = async (userId: string) => {
    try {
      const response = await axios.put(`/api/users/${userId}/reject`, {
        reason: rejectionReason
      })
      
      if (response.data.user) {
        setUsers(users.map(user => 
          user.id === userId ? response.data.user : user
        ))
      }
      setIsModalOpen(false)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting user:', error)
      // You might want to add some error notification here
    }
  }

  const handleToggleStatus = async (userId: string) => {
    try {
      const response = await axios.put(`/api/users/${userId}/toggle-status`)
      if (response.data.user) {
        setUsers(users.map(user => 
          user.id === userId ? response.data.user : user
        ))
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      // You might want to add some error notification here
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-green-100 shadow-md rounded-b-xl">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-green-800">Farm Market Admin</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6 border">
          <nav className="flex space-x-4">
            {['pending', 'active', 'disabled', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`${
                  activeTab === tab
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-700'
                } px-4 py-2 rounded-full border text-sm font-medium transition-colors duration-150 capitalize`}
              >
                {tab} Users ({userCounts[tab as keyof typeof userCounts]})
              </button>
            ))}
          </nav>
        </div>

        {/* User List */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border">
          <ul className="divide-y divide-green-100">
            {users
              .filter(user => {
                switch (activeTab) {
                  case 'pending':
                    return user.status === 'PENDING'
                  case 'active':
                    return user.status === 'ACTIVE'
                  case 'disabled':
                    return user.status === 'DISABLED'
                  case 'all':
                    return true
                  default:
                    return false
                }
              })
              .map(user => (
                <li key={user.id} className="p-6 hover:bg-green-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="text-lg font-medium text-green-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <span className={`ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                            user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {user.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {user.email}
                      </div>
                      {user.status === 'DISABLED' && user.rejectionReason && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                          <span className="font-medium">Rejection reason:</span> {user.rejectionReason}
                        </div>
                      )}
                      {user.role === 'FARMER' && (
                        <div className="mt-2 text-sm text-gray-600 bg-green-50 p-2 rounded-lg inline-block">
                          🌾 {user.farmName} • {user.farmSize} acres • {user.farmAddress}
                        </div>
                      )}
                      {user.role === 'BUYER' && (
                        <div className="mt-2 text-sm text-gray-600 bg-green-50 p-2 rounded-lg inline-block">
                          🛒 Payment: {user.paymentMethod} • Address: {user.address}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      {user.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-full transition-colors duration-150"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setIsModalOpen(true)
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-full transition-colors duration-150"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`${
                            user.status === 'ACTIVE' 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white font-medium py-2 px-4 rounded-full transition-colors duration-150`}
                        >
                          {user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </main>

      {/* Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-medium text-green-800 mb-4">
              Reject Application
            </h3>
            <textarea
              className="w-full border border-green-200 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-green-200 focus:border-green-300 outline-none text-gray-900"
              rows={4}
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setRejectionReason('')
                }}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors duration-150 text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedUser && handleReject(selectedUser.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors duration-150"
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
