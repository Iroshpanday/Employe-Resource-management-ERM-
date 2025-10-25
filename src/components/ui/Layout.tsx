import React from 'react';
import { DropdownMenu } from './dropdown-menu';
// import { Button } from './button';

interface LayoutProps {
  children: React.ReactNode;
}

const Sidebar = () => {
  return (
    <div className="sidebar w-64 bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold">EMS</h2>
      <ul className="mt-8 space-y-4">
        <li className="text-lg">
          <a href="#">Dashboard</a>
        </li>
        <li className="text-lg">
          <a href="#">Employees</a>
        </li>
        <li className="text-lg">
          <a href="#">Reports</a>
        </li>
        <li className="text-lg">
          <a href="#">Settings</a>
        </li>
      </ul>
    </div>
  );
};

const TopNavbar = () => {
  return (
    <div className="top-navbar flex justify-between items-center bg-gray-800 text-white p-4">
      <div className="search-bar">
        <input type="text" placeholder="Search..." className="p-2 rounded" />
      </div>
      <div className="user-info">
        <DropdownMenu />
      </div>
    </div>
  );
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-100 p-6">
        <TopNavbar />
        <div className="main-content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
