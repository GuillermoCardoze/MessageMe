import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { messageAPI, userAPI } from '../services/api'
import socketService from '../services/socket'

function Messages() {
  const messagesEndRef = useRef(null)
  const location = useLocation()
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [conversation, setConversation] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user: currentUser } = useAuth()

useEffect(() => {
  fetchUsers()
  fetchMessages()
}, [])

// Auto-select user if coming from User List
useEffect(() => {
  if (location.state?.selectedUserId && users.length > 0) {
    const user = users.find(u => u.id === location.state.selectedUserId)
    if (user) {
      selectUser(user)
    }
  }
}, [users, location.state])

// Auto-refresh conversation every 3 seconds
// useEffect(() => {
//   if (!selectedUser) return

//   const interval = setInterval(() => {
//     // Silently refresh conversation
//     messageAPI.getConversation(selectedUser.id)
//       .then(data => setConversation(data.messages))
//       .catch(err => console.error('Auto-refresh failed:', err))
//   }, 3000) // 3 seconds

//   // Cleanup interval when component unmounts or user changes
//   return () => clearInterval(interval)
// }, [selectedUser])

// Listen for real-time messages via WebSocket
useEffect(() => {
  socketService.onNewMessage((message) => {
    console.log('📨 New message received:', message);
    // Refresh conversation if we're talking to this person
    if (selectedUser && (message.sender_id === selectedUser.id || message.recipient_id === selectedUser.id)) {
      selectUser(selectedUser);
    }
  });

  return () => {
    socketService.offNewMessage();
  };
}, [selectedUser]);

// Auto-scroll to bottom only when new messages arrive
useEffect(() => {
  const lastMessage = conversation[conversation.length - 1]
  if (lastMessage) {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
}, [conversation.length]) // Only trigger when length changes, not content

  const fetchUsers = async () => {
    try {
      const data = await userAPI.getAll()
      // Filter out current user
      setUsers(data.users.filter(u => u.id !== currentUser.id))
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  const fetchMessages = async () => {
    try {
      const data = await messageAPI.getAll()
      setMessages(data.messages)
    } catch (err) {
      setError('Failed to load messages')
      console.error(err)
    }
  }

  const selectUser = async (user) => {
    setSelectedUser(user)
    setLoading(true)
    try {
      const data = await messageAPI.getConversation(user.id)
      setConversation(data.messages)
      setError('')
    } catch (err) {
      setError('Failed to load conversation')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

const sendMessage = async (e) => {
  e.preventDefault()
  if (!newMessage.trim() || !selectedUser) return

  try {
    // Send via WebSocket instead of REST API
    socketService.sendMessage(
      currentUser.id,
      selectedUser.id,
      newMessage
    )
    
    setNewMessage('')
    
    // Refresh conversation to show the message we just sent
    setTimeout(() => {
      selectUser(selectedUser)
    }, 100)
    
  } catch (err) {
    setError('Failed to send message')
    console.error(err)
  }
}
  return (
    <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Messages</h1>
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

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffcccc', color: '#cc0000', marginBottom: '20px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', height: '600px' }}>
        {/* User List Sidebar */}
        <div style={{ width: '300px', backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '15px', overflowY: 'auto' }}>
          <h3>Users</h3>
          {users.map(user => (
            <div
              key={user.id}
              onClick={() => selectUser(user)}
              style={{
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: selectedUser?.id === user.id ? '#007bff' : 'white',
                color: selectedUser?.id === user.id ? 'white' : 'black',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <strong>{user.username}</strong>
              <br />
              <small>{user.email}</small>
            </div>
          ))}
        </div>

        {/* Conversation Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          {selectedUser ? (
            <>
              {/* Header */}
              <div style={{ padding: '15px', borderBottom: '2px solid #dee2e6', backgroundColor: 'white', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                <h3 style={{ margin: 0 }}>Conversation with {selectedUser.username}</h3>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: 'white' }}>
                {loading ? (
                  <p>Loading conversation...</p>
                ) : conversation.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666' }}>No messages yet. Start the conversation!</p>
                ) : (
                conversation.map(msg => (
                <div
                    key={msg.id}
                    style={{
                    marginBottom: '15px',
                    display: 'flex',
                    justifyContent: msg.is_mine ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    gap: '8px'
                    }}
                >
                    <div
                    style={{
                        maxWidth: '70%',
                        padding: '10px 15px',
                        borderRadius: '12px',
                        backgroundColor: msg.is_mine ? '#007bff' : '#e9ecef',
                        color: msg.is_mine ? 'white' : 'black'
                    }}
                    >
                    <p style={{ margin: '0 0 5px 0' }}>{msg.content}</p>
                    <small style={{ opacity: 0.8, fontSize: '12px' }}>
                        {new Date(msg.timestamp).toLocaleString()}
                    </small>
                    </div>
                    
                    {msg.is_mine && (
                    <button
                        onClick={async () => {
                        if (window.confirm('Delete this message?')) {
                            try {
                            await messageAPI.delete(msg.id)
                            selectUser(selectedUser)
                            } catch (err) {
                            setError('Failed to delete message')
                            }
                        }
                        }}
                        style={{
                        padding: '4px 8px',
                        // backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                        }}
                    >
                        🗑️
                    </button>
                    )}
                </div>
                ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Message Form */}
              <form onSubmit={sendMessage} style={{ padding: '15px', borderTop: '2px solid #dee2e6', backgroundColor: 'white', display: 'flex', gap: '10px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '16px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
              <p>Select a user to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages