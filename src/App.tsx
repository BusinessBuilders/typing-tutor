import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Main app container with router outlet */}
      <Outlet />
    </div>
  )
}

export default App
