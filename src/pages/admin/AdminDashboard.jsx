import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAdminStats } from '../../api/admin';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalLogins: 0, activeUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStats();
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <motion.h1 
          className="admin-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Dashboard Overview
        </motion.h1>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-stats-grid">
          {loading ? (
            <>
              <div className="admin-stat-card skeleton"></div>
              <div className="admin-stat-card skeleton"></div>
              <div className="admin-stat-card skeleton"></div>
            </>
          ) : (
            <>
              <motion.div className="admin-stat-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                <h3>Total Users</h3>
                <p className="admin-stat-value">{stats.totalUsers}</p>
              </motion.div>
              <motion.div className="admin-stat-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <h3>Total Logins</h3>
                <p className="admin-stat-value">{stats.totalLogins}</p>
              </motion.div>
              <motion.div className="admin-stat-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                <h3>Active Users (24h)</h3>
                <p className="admin-stat-value">{stats.activeUsers}</p>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
