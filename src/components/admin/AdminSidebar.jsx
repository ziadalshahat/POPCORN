import { NavLink } from 'react-router-dom';
import '../../pages/admin/Admin.css'

const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <NavLink to="/admin" end className={({isActive}) => isActive ? "admin-sidebar-link active" : "admin-sidebar-link"}>
        Dashboard Overview
      </NavLink>
      <NavLink to="/admin/users" className={({isActive}) => isActive ? "admin-sidebar-link active" : "admin-sidebar-link"}>
        Users Management
      </NavLink>
      <NavLink to="/admin/logins" className={({isActive}) => isActive ? "admin-sidebar-link active" : "admin-sidebar-link"}>
        Login Activity
      </NavLink>
    </aside>
  );
};

export default AdminSidebar;
