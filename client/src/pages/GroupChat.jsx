import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { groupAPI } from '../services/api'
import socketService from '../services/socket'

function GroupChat() {
  const { groupId } = useParams()
  const { user } = useAuth()
  const [group, setGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchGroupDetails()
    // Join the group room for real-time messages
    socketService.joinGroupRoom(user.id, groupId)

    // Listen for new group messages
    socketService.onNewGroupMessage((message) => {
      console.log('📨 New group message:', message)
      setMessages(prev => [...prev, message])
    })

    return () => {
      // Leave group room and stop listening when unmounting
      socketService.leaveGroupRoom(user.id, groupId)
      socketService.offNewGroupMessage()
    }
  }, [groupId, user.id])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const fetchGroupDetails = async () => {
    try {
      setLoading(true)
      const data = await groupAPI.getOne(groupId)
      setGroup(data)
      setError('')
    } catch (err) {
      setError('Failed to load group')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // Send via WebSocket
    socketService.sendGroupMessage(user.id, groupId, newMessage)
    setNewMessage('')
  }

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading group...</div>
  }

  if (error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <Link to="/groups">← Back to Groups</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>{group?.name}</h1>
          <p style={{ margin: '5px 0', color: '#666' }}>{group?.description}</p>
          <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>
            👥 {group?.member_count} members
          </p>
        </div>
        <Link 
          to="/groups"
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          ← Back to Groups
        </Link>
      </div>

      <div style={{ 
        height: '500px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Messages Area */}
        <div style={{ 
          flex: 1, 
          padding: '20px', 
          overflowY: 'auto',
          backgroundColor: 'white',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px'
        }}>
          {messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '15px',
                  padding: '10px 15px',
                  backgroundColor: msg.sender_id === user.id ? '#007bff' : '#e9ecef',
                  color: msg.sender_id === user.id ? 'white' : 'black',
                  borderRadius: '12px',
                  maxWidth: '70%',
                  marginLeft: msg.sender_id === user.id ? 'auto' : '0',
                  marginRight: msg.sender_id === user.id ? '0' : 'auto'
                }}
              >
                <strong style={{ fontSize: '12px', opacity: 0.8 }}>
                  {msg.sender_username}
                </strong>
                <p style={{ margin: '5px 0 0 0' }}>{msg.content}</p>
                <small style={{ fontSize: '10px', opacity: 0.7 }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </small>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send Message Form */}
        <form 
          onSubmit={sendMessage} 
          style={{ 
            padding: '15px', 
            backgroundColor: 'white',
            borderTop: '2px solid #dee2e6',
            display: 'flex',
            gap: '10px',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px'
          }}
        >
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
      </div>
    </div>
  )
}

export default GroupChat