import {Outlet, useNavigate} from 'react-router-dom';
import {useEffect} from 'react';
import {storageService} from '@/services/StorageService.ts';

export default function ProtectedRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = storageService.getToken();
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return <Outlet />;
}
