import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import PersonalDetails from './pages/dashboard/PersonalDetails'
import Nutrition from './pages/dashboard/Nutrition'
import Workout from './pages/dashboard/Workout'
import History from './pages/dashboard/History'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Dashboard Layout Route */}
          <Route path="/dashboard" element={<Dashboard />}>
            {/* Index redirects to personal details by default */}
            <Route index element={<Navigate to="personal" replace />} />
            
            {/* Nested Sub-pages */}
            <Route path="personal" element={<PersonalDetails />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="workout" element={<Workout />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
