import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAdminLogins } from '../../api/admin';
import './Admin.css';

const AdminLogins = () => {
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchLogins = async () => {
      try {
        const res = await getAdminLogins();
        setLogins(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogins();
  }, []);

  const totalPages = Math.ceil(logins.length / itemsPerPage);
  const currentLogins = logins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <motion.h1 
          className="admin-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Login Activity
        </motion.h1>

        {error && <div className="admin-error">{error}</div>}

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
                    <th>IP Address</th>
                    <th>Device / Browser</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogins.map(login => (
                    <tr key={login._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {login.userId ? (
                            <>
                              <img src={login.userId.avatar} alt="avatar" className="admin-table-avatar" />
                              <div>
                                <div style={{ fontWeight: 'bold' }}>{login.userId.name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{login.userId.email}</div>
                              </div>
                            </>
                          ) : (
                            <div style={{ color: '#aaa' }}>Deleted User</div>
                          )}
                        </div>
                      </td>
                      <td>{login.ip}</td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={login.userAgent}>
                        {login.userAgent}
                      </td>
                      <td>{new Date(login.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {logins.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
                        No login activity found.
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
      </main>
    </div>
  );
};

export default AdminLogins;
