import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DemoNotice from '../common/DemoNotice';
import CreateSubscriptionModal from '../subscriptions/CreateSubscriptionModal';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createSubModalOpen, setCreateSubModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Hackathon Demo Notice & Role Bar */}
      <DemoNotice />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Topbar */}
          <Topbar 
            onMenuClick={() => setSidebarOpen(true)} 
            onOpenCreateSub={() => setCreateSubModalOpen(true)}
          />

          {/* Page Outlet */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Global Quick Create Subscription Modal */}
      <CreateSubscriptionModal
        isOpen={createSubModalOpen}
        onClose={() => setCreateSubModalOpen(false)}
      />
    </div>
  );
}
