import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAdminUsers, deleteAdminUser } from '../../api/admin';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await getAdminUsers();
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = (id) => {
    setUserToDelete(id);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteAdminUser(userToDelete);
      setUsers(users.filter(u => u._id !== userToDelete));
      showToast('User deleted successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <motion.h1 
          className="admin-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Users Management
        </motion.h1>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-controls">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="admin-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <motion.div 
          className="admin-table-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={user.avatar} alt="avatar" className="admin-table-avatar" />
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          backgroundColor: user.role === 'admin' ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255,255,255,0.1)',
                          color: user.role === 'admin' ? '#e50914' : '#ccc'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        {user.role !== 'admin' && (
                          <button className="admin-btn-delete" onClick={() => handleDeleteClick(user._id)}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '1rem', padding: '1rem' }}>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Prev
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Custom Toast */}
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed', bottom: '20px', right: '20px',
              padding: '1rem', borderRadius: '8px', color: 'white',
              backgroundColor: toast.type === 'error' ? '#e50914' : '#28a745',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              zIndex: 9999
            }}
          >
            {toast.msg}
          </motion.div>
        )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {userToDelete && (
            <div className="admin-modal-root">
              <motion.div 
                className="admin-modal-backdrop"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setUserToDelete(null)}
              />
              <div className="admin-modal-wrapper">
                <motion.div
                  className="admin-modal-content"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <h3 className="admin-modal-title">Delete User</h3>
                  <p className="admin-modal-text">Are you sure you want to completely remove this user from the platform?</p>
                  <div className="admin-modal-actions">
                    <button 
                      className="admin-modal-btn admin-modal-btn--cancel"
                      onClick={() => setUserToDelete(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="admin-modal-btn admin-modal-btn--confirm"
                      onClick={confirmDelete}
                    >
                      Yes, Delete
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminUsers;
