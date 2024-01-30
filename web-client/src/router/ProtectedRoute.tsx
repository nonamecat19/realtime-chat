import {Outlet, useNavigate} from 'react-router-dom';
import {useEffect} from 'react';
import {CookieService} from '@/services/CookieService.ts';

export default function ProtectedRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new CookieService().getToken();
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return <Outlet />;
}
