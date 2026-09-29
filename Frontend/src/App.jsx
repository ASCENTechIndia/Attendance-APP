import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'

// Providers
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Users from './pages/Users';
import AddUser from './pages/AddUser';
import UserDetails from './pages/UserDetails';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Forms from './pages/Forms';
import Tables from './pages/Tables';
import Charts from './pages/Charts';
import Components from './pages/Components';
import Alerts from './pages/Alerts';
import Modals from './pages/Modals';
import Blank from './pages/Blank';
// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Error Pages
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import HomeRedirect from './pages/HomeRedirect';
import AttendanceMonthlySummary from './pages/attendance/AttendanceMonthlySummary';
import AttendanceDailySummary from './pages/attendance/AttendanceDailySummary';
import DailyAttendanceDetails from './pages/attendance/DailyAttendanceDetails';
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth Routes - Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Main Routes - Protected */}
              <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/add-user" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
              <Route path="/user-details" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/forms" element={<ProtectedRoute><Forms /></ProtectedRoute>} />
              <Route path="/tables" element={<ProtectedRoute><Tables /></ProtectedRoute>} />
              <Route path="/charts" element={<ProtectedRoute><Charts /></ProtectedRoute>} />
              <Route path="/components" element={<ProtectedRoute><Components /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
              <Route path="/modals" element={<ProtectedRoute><Modals /></ProtectedRoute>} />
              <Route path="/blank" element={<ProtectedRoute><Blank /></ProtectedRoute>} />


              <Route
                path="/monthly-attendance-summary"
                element={
                  <ProtectedRoute>
                    <AttendanceMonthlySummary />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/daily-attendance-summary"
                element={
                  <ProtectedRoute>
                    <AttendanceDailySummary />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/daily-attendance-details"
                element={
                  <ProtectedRoute>
                    <DailyAttendanceDetails />
                  </ProtectedRoute>
                }
              />

              {/* Error Routes */}
              <Route path="/500" element={<ServerError />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
