import React from 'react'
import SideNav from '../SideNav/SideNav'
import { Outlet } from 'react-router-dom'
import './DashboardPage.css'

const DashboardPage = ({ userRole = "admin", children }) => {
  return (
    <div className="dashboard-containers1">
      <SideNav userRole={userRole} />
      <div className="dashboard-contents1">
        {children || <Outlet />}
      </div>
    </div>
  )
}

export default DashboardPage