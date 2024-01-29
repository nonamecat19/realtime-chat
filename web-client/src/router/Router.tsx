import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import ChatPage from '@/pages/chat.tsx';
import LoginPage from '@/pages/login.tsx';
import ProtectedRoute from '@/router/ProtectedRoute.tsx';

const mainRouter = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <ChatPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

export default function Router() {
  return <RouterProvider router={mainRouter} />;
}
