/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 📊 HEADER - Top navigation with Sofia AI status                         ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { Link } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { useSofiaHealth } from '@hooks/useSofiaHealth';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { health } = useSofiaHealth();

  const sofiaStatusColor =
    health?.status === 'healthy' ? 'success' : health?.status === 'degraded' ? 'warning' : 'danger';

  return (
    <div id="kt_app_header" className="app-header">
      <div className="app-container container-fluid d-flex align-items-stretch justify-content-between">
        {/* Sidebar Toggle */}
        <div className="d-flex align-items-center d-lg-none ms-n2 me-2">
          <button
            className="btn btn-icon btn-active-color-primary w-35px h-35px"
            id="kt_app_sidebar_mobile_toggle"
            onClick={onMenuToggle}
          >
            <i className="ki-duotone ki-abstract-14 fs-1">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </button>
        </div>

        {/* Logo */}
        <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
          <Link to="/" className="d-lg-none">
            <img alt="Logo" src="/media/logos/logo.svg" className="h-30px" />
          </Link>
        </div>

        {/* Navbar */}
        <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
          {/* Page Title */}
          <div className="d-flex align-items-center" id="kt_header_wrapper">
            <div className="page-title d-flex flex-column align-items-start justify-content-center flex-wrap me-lg-2 pb-5 pb-lg-0">
              <h1 className="d-flex text-dark fw-bold my-0 fs-2">
                MagicSaaS Admin
                <span className="h-20px border-gray-200 border-start ms-3 mx-2"></span>
                <small className="text-muted fs-6 fw-normal ms-1">Sofia AI v4.0</small>
              </h1>
            </div>
          </div>

          {/* Toolbar */}
          <div className="d-flex align-items-stretch flex-shrink-0">
            {/* Sofia AI Status */}
            <div className="d-flex align-items-center ms-3">
              <div className="d-flex align-items-center">
                <span className={`badge badge-light-${sofiaStatusColor} me-2`}>
                  <i className="ki-duotone ki-abstract-26 fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </span>
                <div className="d-flex flex-column">
                  <span className="text-gray-800 fw-bold fs-7">Sofia AI</span>
                  <span className={`text-${sofiaStatusColor} fs-8`}>
                    {health?.status || 'checking...'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="d-flex align-items-center ms-3" id="kt_header_user_menu_toggle">
              <div
                className="cursor-pointer symbol symbol-30px symbol-md-40px"
                data-kt-menu-trigger="click"
                data-kt-menu-attach="parent"
                data-kt-menu-placement="bottom-end"
              >
                <img src={user?.avatar || '/media/avatars/blank.png'} alt={user?.email} />
              </div>

              {/* User Menu Dropdown */}
              <div
                className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px"
                data-kt-menu="true"
              >
                <div className="menu-item px-3">
                  <div className="menu-content d-flex align-items-center px-3">
                    <div className="symbol symbol-50px me-5">
                      <img src={user?.avatar || '/media/avatars/blank.png'} alt="" />
                    </div>
                    <div className="d-flex flex-column">
                      <div className="fw-bolder d-flex align-items-center fs-5">
                        {user?.first_name} {user?.last_name}
                        <span className="badge badge-light-success fw-bolder fs-8 px-2 py-1 ms-2">
                          {user?.role}
                        </span>
                      </div>
                      <a href="#" className="fw-bold text-muted text-hover-primary fs-7">
                        {user?.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="separator my-2"></div>

                <div className="menu-item px-5">
                  <Link to="/profile" className="menu-link px-5">
                    Meu Perfil
                  </Link>
                </div>

                <div className="menu-item px-5">
                  <Link to="/settings" className="menu-link px-5">
                    Configurações
                  </Link>
                </div>

                <div className="separator my-2"></div>

                <div className="menu-item px-5">
                  <button onClick={() => logout()} className="menu-link px-5">
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
