// Import at the top
import { useAuth } from '../hooks/useAuth';

// Update the Navbar component to include admin section
const Navbar = () => {
  // Add isAdmin to the destructured values
  const { user, signOut, isAdmin } = useAuth();
  
  // Update navItems to include admin section
  const navItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/problems', label: 'Problems', icon: FiCode },
    { path: '/analytics', label: 'Analytics', icon: FiBarChart3 },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: FiUsers }] : []),
    { path: '/settings', label: 'Settings', icon: FiSettings },
  ];

  // Rest of the component remains the same
  ...