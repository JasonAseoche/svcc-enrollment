import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import DashboardPage from '../src/components/DashboardPages/DashboardPage.jsx'

// Public Pages
import LandingPage from './pages/LandingPage/LandingPage.jsx'
import LoginPage from './pages/LoginPage/LoginPage.jsx'
import OnlineApplication from './pages/LandingPage/OnlineApplication.jsx'
import ExistEnroll from './pages/LoginPage/ExistEnroll.jsx'

// Admin Pages
import DashboardAdmin from './pages/Admin/DashboardAdmin.jsx'
import ManageStudents from './pages/Admin/ManageStudents.jsx'
import ManageInstructors from './pages/Admin/ManageInstructors.jsx'
import AcademicCalendar from './pages/Admin/AcademicCalendar.jsx'

// Program Head Pages
import DashboardHead from './pages/ProgramHead/DashboardHead.jsx'
import ManageCourses from './pages/ProgramHead/ManageCourses.jsx'
import StudentAdvising from './pages/ProgramHead/StudentAdvising.jsx'
import AssignInstructors from './pages/ProgramHead/AssignInstructors.jsx'
import CourseSchedules from './pages/ProgramHead/CourseSchedules.jsx'

// Instructor Pages
import DashboardInstructor from './pages/Instructor/DashboardInstructor.jsx'
import ViewStudents from './pages/Instructor/ViewStudents.jsx'
import ViewCourses from './pages/Instructor/ViewCourses.jsx'
import StudentEvaluation from './pages/Instructor/StudentEvaluation.jsx'
import ManageGradebook from './pages/Instructor/ManageGradebook.jsx'

// Student Pages
import DashboardStudent from './pages/Students/DashboardStudents.jsx'
import MyCourses from './pages/Students/MyCourses.jsx'
import MySchedule from './pages/Students/MySchedule.jsx'
import MyGrades from './pages/Students/MyGrades.jsx'
import About from './pages/Students/About.jsx'
import FAQs from './pages/Students/FAQs.jsx'

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/online-application" element={<OnlineApplication />} />
        <Route path="/exist-enroll" element={<ExistEnroll/>} />

        {/* Admin Routes - Wrapped with DashboardPage */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardPage />}>
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />
            <Route path="/manage-students" element={<ManageStudents />} />
            <Route path="/manage-instructors" element={<ManageInstructors />} />
            <Route path="/academic-calendar" element={<AcademicCalendar />} />
          </Route>
        </Route>

        {/* Program Head Routes - Wrapped with DashboardPage */}
        <Route element={<PrivateRoute allowedRoles={['program_head']} />}>
          <Route element={<DashboardPage />}>
            <Route path="/dashboard-head" element={<DashboardHead />} />
            <Route path="/manage-courses" element={<ManageCourses />} />
            <Route path="/student-advising" element={<StudentAdvising />} />
            <Route path="/assign-instructors" element={<AssignInstructors />} />
            <Route path="/course-schedules" element={<CourseSchedules />} />
          </Route>
        </Route>

        {/* Instructor Routes - Wrapped with DashboardPage */}
        <Route element={<PrivateRoute allowedRoles={['instructor']} />}>
          <Route element={<DashboardPage />}>
            <Route path="/dashboard-instructor" element={<DashboardInstructor />} />
            <Route path="/view-students" element={<ViewStudents />} />
            <Route path="/view-courses" element={<ViewCourses />} />
            <Route path="/student-evaluation" element={<StudentEvaluation />} />
            <Route path="/manage-gradebook" element={<ManageGradebook />} />
          </Route>
        </Route>

        {/* Student Routes - Wrapped with DashboardPage */}
        <Route element={<PrivateRoute allowedRoles={['student']} />}>
          <Route element={<DashboardPage />}>
            <Route path="/dashboard-student" element={<DashboardStudent />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/my-schedule" element={<MySchedule />} />
            <Route path="/my-grades" element={<MyGrades />} />
            <Route path="/about" element={<About />} />
            <Route path="/faqs" element={<FAQs />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App