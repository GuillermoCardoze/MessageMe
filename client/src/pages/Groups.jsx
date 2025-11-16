import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { groupAPI } from '../services/api'

function Groups() {
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async (searchTerm = '') => {
    try {
      setLoading(true)
      const data = await groupAPI.getAll(searchTerm)
      setGroups(data.groups)
      setError('')
    } catch (err) {
      setError('Failed to load groups')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchGroups(search)
  }

  const createGroup = async (e) => {
    e.preventDefault()
    if (!newGroupName.trim()) return

    try {
      await groupAPI.create({
        name: newGroupName,
        description: newGroupDesc
      })
      
      setNewGroupName('')
      setNewGroupDesc('')
      setShowCreateForm(false)
      fetchGroups() // Refresh list
    } catch (err) {
      setError('Failed to create group')
      console.error(err)
    }
  }

  const joinGroup = async (groupId) => {
    try {
      await groupAPI.join(groupId)
      fetchGroups() // Refresh to show updated member count
    } catch (err) {
      setError('Failed to join group')
      console.error(err)
    }
  }

  const leaveGroup = async (groupId) => {
    try {
      await groupAPI.leave(groupId)
      fetchGroups() // Refresh
    } catch (err) {
      setError('Failed to leave group')
      console.error(err)
    }
  }

  const viewGroupDetails = async (groupId) => {
    try {
      const data = await groupAPI.getOne(groupId)
      alert(`Group: ${data.name}\n\nMembers:\n${data.members.map(m => `- ${m.username}`).join('\n')}`)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Groups</h1>
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

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search groups by name..."
          style={{ 
            flex: 1,
            padding: '10px', 
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc'
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

      {/* Create Group Button */}
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '16px'
        }}
      >
        {showCreateForm ? '✖ Cancel' : '+ Create New Group'}
      </button>

      {/* Create Group Form */}
      {showCreateForm && (
        <form onSubmit={createGroup} style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Create New Group</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Group Name:</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
            <textarea
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              rows="3"
              style={{ width: '100%', padding: '8px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Create Group
          </button>
        </form>
      )}

      {/* Groups List */}
      {loading ? (
        <p>Loading groups...</p>
      ) : (
        <>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Found {groups.length} group{groups.length !== 1 ? 's' : ''}
          </p>
          
          <div>
            {groups.map((group) => (
              <div 
                key={group.id}
                style={{ 
                  padding: '20px',
                  marginBottom: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px solid #dee2e6'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{group.name}</h3>
                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>{group.description || 'No description'}</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>
                      👥 {group.member_count} member{group.member_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <button
                      onClick={() => viewGroupDetails(group.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      View Members
                    </button>
                    
                    <button
                      onClick={() => joinGroup(group.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Join
                    </button>
                    
                    <button
                      onClick={() => leaveGroup(group.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Leave
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Groups