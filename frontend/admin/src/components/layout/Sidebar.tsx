/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 📑 SIDEBAR - Navigation menu                                            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  return (
    <div
      id="kt_app_sidebar"
      className={`app-sidebar flex-column ${isOpen ? '' : 'drawer-on'}`}
      data-kt-drawer="true"
      data-kt-drawer-name="app-sidebar"
      data-kt-drawer-activate="{default: true, lg: false}"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="225px"
      data-kt-drawer-direction="start"
      data-kt-drawer-toggle="#kt_app_sidebar_mobile_toggle"
    >
      {/* Logo */}
      <div className="app-sidebar-logo px-6" id="kt_app_sidebar_logo">
        <a href="/">
          <img alt="Logo" src="/media/logos/logo.svg" className="h-25px app-sidebar-logo-default" />
          <img
            alt="Logo"
            src="/media/logos/logo-sm.svg"
            className="h-20px app-sidebar-logo-minimize"
          />
        </a>
      </div>

      {/* Sidebar Menu */}
      <div className="app-sidebar-menu overflow-hidden flex-column-fluid">
        <div
          id="kt_app_sidebar_menu_wrapper"
          className="app-sidebar-wrapper hover-scroll-overlay-y my-5"
          data-kt-scroll="true"
          data-kt-scroll-activate="true"
          data-kt-scroll-height="auto"
          data-kt-scroll-dependencies="#kt_app_sidebar_logo, #kt_app_sidebar_footer"
          data-kt-scroll-wrappers="#kt_app_sidebar_menu"
          data-kt-scroll-offset="5px"
        >
          <div
            className="menu menu-column menu-rounded menu-sub-indention px-3"
            id="#kt_app_sidebar_menu"
            data-kt-menu="true"
          >
            {/* Dashboard */}
            <div className="menu-item">
              <NavLink to="/" className="menu-link">
                <span className="menu-icon">
                  <i className="ki-duotone ki-element-11 fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                  </i>
                </span>
                <span className="menu-title">Dashboard</span>
              </NavLink>
            </div>

            {/* Pétalas */}
            <div className="menu-item pt-5">
              <div className="menu-content">
                <span className="menu-heading fw-bold text-uppercase fs-7">Pétalas</span>
              </div>
            </div>

            <div className="menu-item">
              <NavLink to="/petalas" className="menu-link">
                <span className="menu-icon">
                  <i className="ki-duotone ki-abstract-26 fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </span>
                <span className="menu-title">Todas as Pétalas</span>
              </NavLink>
            </div>

            <div className="menu-item">
              <NavLink to="/petalas/marketplace" className="menu-link">
                <span className="menu-icon">
                  <i className="ki-duotone ki-shop fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                  </i>
                </span>
                <span className="menu-title">Marketplace</span>
              </NavLink>
            </div>

            {/* Sofia AI */}
            <div className="menu-item pt-5">
              <div className="menu-content">
                <span className="menu-heading fw-bold text-uppercase fs-7">Sofia AI v4.0</span>
              </div>
            </div>

            <div className="menu-item">
              <NavLink to="/sofia/dashboard" className="menu-link">
                <span className="menu-icon">
                  <i className="ki-duotone ki-abstract-26 fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </span>
                <span className="menu-title">AI Dashboard</span>
              </NavLink>
            </div>

            <div className="menu-item">
              <NavLink to="/sofia/intention" className="menu-link">
                <span className="menu-icon">
                  <i className="ki-duotone ki-abstract-41 fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </span>
                <span className="menu-title">Intention Engine</span>
              </NavLink>
            </div>

            <div className="menu-item">
              <NavLink to="/sofia/vectors" className="menu-link">
                <span className="menu-icon">
                  <i className="ki-duotone ki-chart fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </span>
                <span className="menu-title">Vector Search</span>
              </NavLink>
            </div>

            <div className="menu-item">
              <NavLink to="/sofia/traces" className="menu-link">
                <span className="menu-icon">
                  <i className="ki-duotone ki-graph-up fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                    <span className="path6"></span>
                  </i>
                </span>
                <span className="menu-title">Langfuse Traces</span>
              </NavLink>
            </div>

            {/* MCP */}
            <div className="menu-item pt-5">
              <div className="menu-content">
                <span className="menu-heading fw-bold text-uppercase fs-7">Integrations</span>
              </div>
            </div>

            <div className="menu-item">
              <NavLink to="/mcp" className="menu-link">
                <span className="menu-icon">
                  <i className="ki-duotone ki-technology-2 fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </span>
                <span className="menu-title">MCP Connections</span>
              </NavLink>
            </div>

            {/* System */}
            <div className="menu-item pt-5">
              <div className="menu-content">
                <span className="menu-heading fw-bold text-uppercase fs-7">System</span>
              </div>
            </div>

            <div className="menu-item">
              <NavLink to="/users" className="menu-link">
                <span className="menu-icon">
                  <i className="ki-duotone ki-profile-user fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                  </i>
                </span>
                <span className="menu-title">Usuários</span>
              </NavLink>
            </div>

            <div className="menu-item">
              <NavLink to="/settings" className="menu-link">
                <span className="menu-icon">
                  <i className="ki-duotone ki-setting-3 fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                  </i>
                </span>
                <span className="menu-title">Configurações</span>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
