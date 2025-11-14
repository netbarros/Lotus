/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🧠 SOFIA HEALTH WIDGET - Real-time AI monitoring                        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useSofiaHealth } from '@hooks/useSofiaHealth';
import { formatNumber, formatDuration } from '@utils/format';

export function SofiaHealthWidget() {
  const { health, isLoading } = useSofiaHealth();

  if (isLoading) {
    return (
      <div className="card h-100">
        <div className="card-body d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  const statusColor =
    health?.status === 'healthy' ? 'success' :
    health?.status === 'degraded' ? 'warning' :
    'danger';

  const uptime = health?.uptime ? formatDuration(health.uptime) : 'N/A';
  const successRate = health?.metrics
    ? ((health.metrics.successfulRequests / health.metrics.totalRequests) * 100).toFixed(1)
    : 0;

  const components = health?.components || {};
  const activeComponents = Object.values(components).filter(Boolean).length;
  const totalComponents = Object.keys(components).length;

  return (
    <div className="card h-100">
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">Sofia AI v4.0</span>
          <span className="text-muted mt-1 fw-semibold fs-7">Complete AI Stack Status</span>
        </h3>
        <div className="card-toolbar">
          <span className={`badge badge-light-${statusColor} fs-7 fw-bold`}>
            {health?.status || 'unknown'}
          </span>
        </div>
      </div>

      <div className="card-body">
        {/* Metrics */}
        <div className="mb-7">
          <div className="d-flex flex-stack mb-3">
            <div className="fw-semibold pe-2">
              <span className="fs-6 text-gray-800">Total Requests</span>
            </div>
            <div className="d-flex align-items-senter">
              <span className="fw-bold fs-6 text-gray-800">
                {formatNumber(health?.metrics.totalRequests || 0)}
              </span>
            </div>
          </div>

          <div className="d-flex flex-stack mb-3">
            <div className="fw-semibold pe-2">
              <span className="fs-6 text-gray-800">Success Rate</span>
            </div>
            <div className="d-flex align-items-senter">
              <span className={`fw-bold fs-6 text-${statusColor}`}>{successRate}%</span>
            </div>
          </div>

          <div className="d-flex flex-stack mb-3">
            <div className="fw-semibold pe-2">
              <span className="fs-6 text-gray-800">Avg Response Time</span>
            </div>
            <div className="d-flex align-items-senter">
              <span className="fw-bold fs-6 text-gray-800">
                {health?.metrics.averageResponseTime || 0}ms
              </span>
            </div>
          </div>

          <div className="d-flex flex-stack mb-3">
            <div className="fw-semibold pe-2">
              <span className="fs-6 text-gray-800">Uptime</span>
            </div>
            <div className="d-flex align-items-senter">
              <span className="fw-bold fs-6 text-gray-800">{uptime}</span>
            </div>
          </div>
        </div>

        {/* Components Status */}
        <div className="separator separator-dashed mb-7"></div>

        <div className="mb-7">
          <div className="d-flex align-items-center mb-5">
            <span className="fs-6 fw-semibold text-gray-800 flex-grow-1">
              Components Active
            </span>
            <span className="badge badge-light-primary">
              {activeComponents}/{totalComponents}
            </span>
          </div>

          {/* v4.0 AI Stack */}
          <div className="mb-3">
            <div className="fw-semibold text-gray-600 fs-7 mb-2">✨ AI Stack v4.0</div>
            <div className="d-flex flex-column gap-2">
              <ComponentStatus name="LangChain" active={components.LangChain} />
              <ComponentStatus name="Langfuse" active={components.Langfuse} />
              <ComponentStatus name="Qdrant" active={components.Qdrant} />
              <ComponentStatus name="pgVector" active={components.pgVector} />
            </div>
          </div>

          <div className="separator separator-dashed my-4"></div>

          {/* Core Components */}
          <div>
            <div className="fw-semibold text-gray-600 fs-7 mb-2">Core Components</div>
            <div className="d-flex flex-column gap-2">
              <ComponentStatus name="Intention Engine" active={components.IntentionEngine} />
              <ComponentStatus name="UX Validator" active={components.UXValidator} />
              <ComponentStatus name="SEO Optimizer" active={components.SEOOptimizer} />
              <ComponentStatus name="Marketplace" active={components.MarketplaceManager} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentStatus({ name, active }: { name: string; active: boolean }) {
  return (
    <div className="d-flex align-items-center">
      <span className={`bullet bullet-vertical h-20px bg-${active ? 'success' : 'danger'} me-3`}></span>
      <span className="fs-7 text-gray-700">{name}</span>
      <span className="ms-auto">
        {active ? (
          <i className="ki-duotone ki-check-circle fs-5 text-success">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
        ) : (
          <i className="ki-duotone ki-cross-circle fs-5 text-danger">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
        )}
      </span>
    </div>
  );
}
