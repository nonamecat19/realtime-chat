import {Outlet, useNavigate} from 'react-router-dom';
import {useEffect} from 'react';

export default function ProtectedRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    //TODO auth check
    const isAuthenticated = true;
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  return <Outlet />;
}
