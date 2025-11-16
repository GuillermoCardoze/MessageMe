import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../services/api'

function UserList() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user: currentUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async (searchTerm = '') => {
    try {
      setLoading(true)
      const data = await userAPI.getAll(searchTerm)
      setUsers(data.users)
      setError('')
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers(search)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
     <h1 style={{ margin: 0 }}>Users</h1>
     <Link 
       to="/dashboard"
       style={{ 
         padding: '10px 20px', 
         backgroundColor: '#6c757d', 
         color: 'white', 
         textDecoration: 'none',
         borderRadius: '4px'
       }}
     >
       ← Back to Dashboard
     </Link>
   </div>

      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by username..."
          style={{ 
            width: 'calc(100% - 100px)', 
            padding: '10px', 
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginRight: '10px'
          }}
        />
        <button 
          type="submit"
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
      </form>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffcccc', color: '#cc0000', marginBottom: '20px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Found {users.length} user{users.length !== 1 ? 's' : ''}
          </p>
          
          <div>
            {users.map((user) => (
              <div 
                key={user.id}
                style={{ 
                  padding: '15px',
                  marginBottom: '10px',
                  backgroundColor: user.id === currentUser?.id ? '#e7f3ff' : '#f8f9fa',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>
                    {user.username}
                    {user.id === currentUser?.id && (
                      <span style={{ fontSize: '14px', color: '#007bff', marginLeft: '10px' }}>
                        (You)
                      </span>
                    )}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{user.email}</p>
                </div>
                
                {user.id !== currentUser?.id && (
                  <button
                    style={{ 
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => alert(`Message feature coming soon! Will message ${user.username}`)}
                  >
                    Message
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default UserList