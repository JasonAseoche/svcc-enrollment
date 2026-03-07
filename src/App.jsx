import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import DashboardPage from '../src/components/DashboardPages/DashboardPage.jsx'

// Public Pages
import LandingPage from './pages/LandingPage/LandingPage.jsx'
import LoginPage from './pages/LoginPage/LoginPage.jsx'
import OnlineApplication from './pages/LandingPage/OnlineApplication.jsx'
import ExistEnroll from './pages/LoginPage/ExistEnroll.jsx'
import Admission from './pages/SubPages/Admission.jsx'
import CollegeProgram from './pages/Programs/CollegeProgram.jsx'
import AboutSVCC from './pages/AboutSVCC/AboutSVCC.jsx'
import Contact from './pages/Contact/Contact.jsx'

// Admin Pages
import DashboardAdmin from './pages/Admin/DashboardAdmin.jsx'
import ManageStudents from './pages/Admin/ManageStudents.jsx'
import ManageInstructors from './pages/Admin/ManageInstructors.jsx'
import AcademicCalendar from './pages/Admin/AcademicCalendar.jsx'
import AssignAdvising from './pages/Admin/AssignAdvising.jsx'
import ManageHead from './pages/Admin/ManageHead.jsx'
import CourseApproval from './pages/Admin/CourseApproval.jsx'
import StudentPayment from './pages/Admin/StudentPayment.jsx'

// Super Admin Pages
import DashboardSuperAdmin from './pages/SuperAdmin/DashboardSuperAdmin.jsx'
import AuditTrail from './pages/SuperAdmin/AuditTrail.jsx'
import BackupRestore from './pages/SuperAdmin/BUR.jsx'
import AdminAccounts from './pages/SuperAdmin/AdminAccounts.jsx'

// Program Head Pages
import DashboardHead from './pages/ProgramHead/DashboardHead.jsx'
import ManageCourses from './pages/ProgramHead/ManageCourses.jsx'
import CourseSchedules from './pages/ProgramHead/CourseSchedules.jsx'
import StudentEvaluation from './pages/ProgramHead/StudentEvaluation.jsx'
import Advising from './pages/ProgramHead/Advising.jsx'

// Instructor Pages
import DashboardInstructor from './pages/Instructor/DashboardInstructor.jsx'
import ViewStudents from './pages/Instructor/ViewStudents.jsx'
import ViewCourses from './pages/Instructor/ViewCourses.jsx'
import StudentAdvising from './pages/Instructor/StudentAdvising.jsx'
import ManageGradebook from './pages/Instructor/ManageGradebook.jsx'

// Student Pages
import DashboardStudent from './pages/Students/DashboardStudents.jsx'
import MyCourses from './pages/Students/MyCourses.jsx'
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
        <Route path="/admission-requirements" element={<Admission/>} />
        <Route path="/college-program" element={<CollegeProgram/>} />
        <Route path="/about" element={<AboutSVCC/>} />
        <Route path="/contact" element={<Contact/>} />

        {/* Admin Routes - Wrapped with DashboardPage */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardPage />}>
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />
            <Route path="/manage-students" element={<ManageStudents />} />
            <Route path="/manage-instructors" element={<ManageInstructors />} />
            <Route path="/academic-calendar" element={<AcademicCalendar />} />
            <Route path="/assign-advising" element={<AssignAdvising />} />
            <Route path="/manage-head" element={<ManageHead />} />
            <Route path="/courses-approval" element={<CourseApproval />} />
            <Route path="/student-payment" element={<StudentPayment />} />
          </Route>
        </Route>

        {/* Super Admin Routes - Wrapped with DashboardPage */}
        <Route element={<PrivateRoute allowedRoles={['superadmin']} />}>
          <Route element={<DashboardPage />}>
            <Route path="/dashboard-superadmin" element={<DashboardSuperAdmin />} />
            <Route path="/audit-trail" element={<AuditTrail />} />
            <Route path="/backup-restore" element={<BackupRestore />} />
            <Route path="/manage-admin" element={<AdminAccounts />} />
          </Route>
        </Route>

        {/* Program Head Routes - Wrapped with DashboardPage */}
        <Route element={<PrivateRoute allowedRoles={['program_head']} />}>
          <Route element={<DashboardPage />}>
            <Route path="/dashboard-head" element={<DashboardHead />} />
            <Route path="/manage-courses" element={<ManageCourses />} />
            <Route path="/course-schedules" element={<CourseSchedules />} />
            <Route path="/student-evaluation" element={<StudentEvaluation />} />
            <Route path="/advising" element={<Advising />} />
          </Route>
        </Route>

        {/* Instructor Routes - Wrapped with DashboardPage */}
        <Route element={<PrivateRoute allowedRoles={['instructor']} />}>
          <Route element={<DashboardPage />}>
            <Route path="/dashboard-instructor" element={<DashboardInstructor />} />
            <Route path="/view-students" element={<ViewStudents />} />
            <Route path="/view-courses" element={<ViewCourses />} />
            <Route path="/student-advising" element={<StudentAdvising />} />
            <Route path="/manage-gradebook" element={<ManageGradebook />} />
          </Route>
        </Route>

        {/* Student Routes - Wrapped with DashboardPage */}
        <Route element={<PrivateRoute allowedRoles={['student']} />}>
          <Route element={<DashboardPage />}>
            <Route path="/dashboard-student" element={<DashboardStudent />} />
            <Route path="/my-courses" element={<MyCourses />} />
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