import { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import AdminPanel from '@/components/AdminPanel';
import UserDashboard from '@/components/UserDashboard';
import { User, QueueItem, API_URLS } from '@/lib/types';

const Index = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [adminData, setAdminData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const fetchQueue = async () => {
    try {
      const response = await fetch(API_URLS.queue);
      const data = await response.json();
      setQueue(data.queue || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const fetchAdminData = async () => {
    if (user?.role !== 'admin') return;
    
    try {
      const response = await fetch(API_URLS.admin, {
        headers: {
          'X-User-Role': 'admin'
        }
      });
      const data = await response.json();
      setAdminData(data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQueue();
      const interval = setInterval(fetchQueue, 5000);
      
      if (user.role === 'admin') {
        fetchAdminData();
        const adminInterval = setInterval(fetchAdminData, 10000);
        return () => {
          clearInterval(interval);
          clearInterval(adminInterval);
        };
      }
      
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAuthSuccess = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    setQueue([]);
    setAdminData(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  if (user.role === 'admin') {
    return (
      <AdminPanel 
        user={user} 
        adminData={adminData} 
        onLogout={handleLogout} 
      />
    );
  }

  return (
    <UserDashboard
      user={user}
      queue={queue}
      currentTime={currentTime}
      onLogout={handleLogout}
      onQueueUpdate={fetchQueue}
    />
  );
};

export default Index;