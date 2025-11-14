/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🔻 FOOTER - Bottom information                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div id="kt_app_footer" className="app-footer">
      <div className="app-container container-fluid d-flex flex-column flex-md-row flex-center flex-md-stack py-3">
        <div className="text-dark order-2 order-md-1">
          <span className="text-muted fw-bold me-1">{currentYear} ©</span>
          <a href="https://softwarelotus.com.br" target="_blank" className="text-gray-800 text-hover-primary">
            Software Lotus
          </a>
          <span className="text-muted mx-2">|</span>
          <span className="text-muted">MagicSaaS System-∞</span>
          <span className="text-muted mx-2">|</span>
          <span className="text-primary fw-bold">Sofia AI v4.0</span>
        </div>

        <ul className="menu menu-gray-600 menu-hover-primary fw-bold order-1">
          <li className="menu-item">
            <a href="/docs" className="menu-link px-2">
              Documentação
            </a>
          </li>
          <li className="menu-item">
            <a href="/support" className="menu-link px-2">
              Suporte
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
