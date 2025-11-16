import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Welcome to MessageMe!</h1>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>User Info</h2>
        <p><strong>Username:</strong> {user?.username}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>User ID:</strong> {user?.id}</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
     <Link 
       to="/users"
       style={{ 
         padding: '10px 20px', 
         backgroundColor: '#007bff', 
         color: 'white', 
         textDecoration: 'none',
         borderRadius: '4px',
         textAlign: 'center'
       }}
     >
       👥 View Users
     </Link>
     <Link 
       to="/groups"
       style={{ 
         padding: '10px 20px', 
         backgroundColor: '#6c757d', 
         color: 'white', 
         textDecoration: 'none',
         borderRadius: '4px',
         textAlign: 'center'
       }}
     >
       👫 Groups
     </Link>
     <Link 
       to="/messages"
       style={{ 
         padding: '10px 20px', 
         backgroundColor: '#17a2b8', 
         color: 'white', 
         textDecoration: 'none',
         borderRadius: '4px',
         textAlign: 'center'
       }}
     >
       💬 Messages
     </Link>
      </div>   

      <div style={{ backgroundColor: '#e9ecef', padding: '20px', borderRadius: '8px' }}>
        <h3>🎉 Your frontend is connected to the backend!</h3>
        <p>Next up, we'll add:</p>
        <ul>
          <li>User list</li>
          <li>Messaging interface</li>
          <li>Groups management</li>
          <li>Real-time updates with WebSockets</li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard