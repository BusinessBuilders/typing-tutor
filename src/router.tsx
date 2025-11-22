import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';

// Import actual screen components (Steps 91-100)
import HomeScreen from './screens/HomeScreen';
import ProfileSelector from './components/ProfileSelector';
import LearningScreen from './screens/LearningScreen';
import LessonSelectionScreen from './screens/LessonSelectionScreen';
import AiLessonScreen from './screens/AiLessonScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProgressScreen from './screens/ProgressScreen';
import ParentDashboard from './screens/ParentDashboard';
import CVCPracticeScreen from './screens/CVCPracticeScreen';
import CompoundWordsScreen from './screens/CompoundWordsScreen';
import SkillProgressScreen from './screens/SkillProgressScreen';

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
        element: <ProfileSelector />,
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
        path: 'lessons',
        element: <LessonSelectionScreen />,
      },
      {
        path: 'ai-lesson',
        element: <AiLessonScreen />,
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
      {
        path: 'cvc-practice',
        element: <CVCPracticeScreen />,
      },
      {
        path: 'compound-words',
        element: <CompoundWordsScreen />,
      },
      {
        path: 'skill-progress',
        element: <SkillProgressScreen />,
      },
    ],
  },
]);

// Router component to wrap the app
export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
