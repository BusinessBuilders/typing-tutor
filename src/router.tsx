import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';

// Placeholder screens (will be created in later steps)
const HomeScreen = () => <div>Home Screen - Coming Soon</div>;
const ProfileSelectScreen = () => <div>Profile Select - Coming Soon</div>;
const LearningScreen = () => <div>Learning Screen - Coming Soon</div>;
const SettingsScreen = () => <div>Settings Screen - Coming Soon</div>;
const ProgressScreen = () => <div>Progress Screen - Coming Soon</div>;
const ParentDashboard = () => <div>Parent Dashboard - Coming Soon</div>;

// Router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomeScreen />,
      },
      {
        path: 'profile-select',
        element: <ProfileSelectScreen />,
      },
      {
        path: 'learning',
        element: <LearningScreen />,
      },
      {
        path: 'learning/:level',
        element: <LearningScreen />,
      },
      {
        path: 'settings',
        element: <SettingsScreen />,
      },
      {
        path: 'progress',
        element: <ProgressScreen />,
      },
      {
        path: 'parent-dashboard',
        element: <ParentDashboard />,
      },
    ],
  },
]);

// Router component to wrap the app
export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
