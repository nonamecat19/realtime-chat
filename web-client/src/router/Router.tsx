import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import ChatPage from '@/pages/ChatPage.tsx';
import LoginPage from '@/pages/LoginPage.tsx';
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
