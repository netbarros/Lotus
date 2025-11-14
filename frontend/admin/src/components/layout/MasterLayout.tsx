/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🎨 MASTER LAYOUT - Metronic Enterprise Layout                           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export function MasterLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
      <div className="app-page flex-column flex-column-fluid" id="kt_app_page">
        {/* Header */}
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Wrapper */}
        <div className="app-wrapper flex-column flex-row-fluid" id="kt_app_wrapper">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} />

          {/* Main */}
          <div className="app-main flex-column flex-row-fluid" id="kt_app_main">
            {/* Content Wrapper */}
            <div className="d-flex flex-column flex-column-fluid">
              {/* Content */}
              <div id="kt_app_content" className="app-content flex-column-fluid">
                {/* Content Container */}
                <div id="kt_app_content_container" className="app-container container-fluid">
                  <Outlet />
                </div>
              </div>
            </div>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
