import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import QuickLogModal from '../components/usage/QuickLogModal';

const MainLayout = () => {
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogged = () => {
    // Increment to trigger reload in child components if needed
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar onOpenQuickLog={() => setIsQuickLogOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenQuickLog={() => setIsQuickLogOpen(true)} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ refreshTrigger, onRefresh: handleLogged }} />
        </main>
      </div>

      {/* Global Quick Log Modal */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onLogged={handleLogged}
      />
    </div>
  );
};

export default MainLayout;
