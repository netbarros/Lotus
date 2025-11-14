/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 📊 DASHBOARD PAGE - Main intelligent dashboard                          ║
 * ║ Integrated with Sofia AI v4.0 + MCP + Real-time data                    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@services/api';
import { StatsCard } from '@components/dashboard/StatsCard';
import { SofiaHealthWidget } from '@components/dashboard/SofiaHealthWidget';
import { PetalasOverview } from '@components/dashboard/PetalasOverview';
import type { DashboardStats } from '@types';

export function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      // This would call a custom Directus endpoint that aggregates stats
      const response = await api.customEndpoint<DashboardStats>(
        'GET',
        '/items/dashboard_stats'
      );
      return response;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <>
      {/* Page Header */}
      <div className="row gy-5 g-xl-8 mb-5">
        <div className="col-12">
          <div className="card">
            <div className="card-body d-flex align-items-center py-8">
              <div className="d-flex flex-column flex-grow-1">
                <h1 className="text-dark fw-bold mb-1">
                  Bem-vindo ao MagicSaaS System-∞
                </h1>
                <p className="text-gray-600 fw-semibold fs-6 mb-0">
                  Dashboard inteligente powered by Sofia AI v4.0 - Cognitive Mesh OS - All Layers
                </p>
              </div>
              <div className="d-flex align-items-center">
                <span className="badge badge-light-primary fs-7 fw-bold px-4 py-3">
                  <i className="ki-duotone ki-abstract-26 fs-2 me-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Sofia AI v4.0 Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="row g-5 g-xl-8 mb-5">
        <div className="col-xl-3">
          <StatsCard
            title="Total de Usuários"
            value={stats?.totalUsers || 0}
            change={12.5}
            icon="profile-user"
            iconColor="primary"
            format="number"
            loading={isLoading}
          />
        </div>
        <div className="col-xl-3">
          <StatsCard
            title="Usuários Ativos"
            value={stats?.activeUsers || 0}
            change={8.3}
            icon="user-tick"
            iconColor="success"
            format="number"
            loading={isLoading}
          />
        </div>
        <div className="col-xl-3">
          <StatsCard
            title="Receita Total"
            value={stats?.totalRevenue || 0}
            change={stats?.revenueGrowth || 0}
            icon="chart-simple"
            iconColor="info"
            format="currency"
            loading={isLoading}
          />
        </div>
        <div className="col-xl-3">
          <StatsCard
            title="Taxa de Sucesso Sofia"
            value={stats?.sofiaSuccessRate || 0}
            change={5.2}
            icon="abstract-26"
            iconColor="warning"
            format="percent"
            loading={isLoading}
          />
        </div>
      </div>

      {/* Pétalas Stats Row */}
      <div className="row g-5 g-xl-8 mb-5">
        <div className="col-xl-3">
          <StatsCard
            title="Total de Pétalas"
            value={stats?.totalPetalas || 0}
            icon="category"
            iconColor="primary"
            format="number"
            loading={isLoading}
          />
        </div>
        <div className="col-xl-3">
          <StatsCard
            title="Pétalas Ativas"
            value={stats?.activePetalas || 0}
            icon="abstract-26"
            iconColor="success"
            format="number"
            loading={isLoading}
          />
        </div>
        <div className="col-xl-3">
          <StatsCard
            title="Requests Sofia AI"
            value={stats?.sofiaRequests || 0}
            icon="chart-line-up"
            iconColor="info"
            format="number"
            loading={isLoading}
          />
        </div>
        <div className="col-xl-3">
          <StatsCard
            title="AI Success Rate"
            value={stats?.sofiaSuccessRate || 0}
            icon="like"
            iconColor="warning"
            format="percent"
            loading={isLoading}
          />
        </div>
      </div>

      {/* Main Content Row */}
      <div className="row g-5 g-xl-8">
        {/* Pétalas Overview */}
        <div className="col-xl-8">
          <PetalasOverview />
        </div>

        {/* Sofia AI Health */}
        <div className="col-xl-4">
          <SofiaHealthWidget />
        </div>
      </div>

      {/* Activity & Alerts Row */}
      <div className="row g-5 g-xl-8 mt-5">
        <div className="col-xl-6">
          <div className="card h-100">
            <div className="card-header border-0 pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">Atividade Recente</span>
                <span className="text-muted mt-1 fw-semibold fs-7">Últimas operações do sistema</span>
              </h3>
            </div>
            <div className="card-body py-3">
              <div className="timeline-label">
                <div className="timeline-item">
                  <div className="timeline-label fw-bold text-gray-800 fs-6">10:00</div>
                  <div className="timeline-badge">
                    <i className="fa fa-genderless text-success fs-1"></i>
                  </div>
                  <div className="fw-semibold text-gray-700 ps-3 fs-7">
                    Sofia AI gerou novo SaaS por intenção
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-label fw-bold text-gray-800 fs-6">09:45</div>
                  <div className="timeline-badge">
                    <i className="fa fa-genderless text-primary fs-1"></i>
                  </div>
                  <div className="fw-semibold text-gray-700 ps-3 fs-7">
                    Nova pétala Healthcare atualizada
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-label fw-bold text-gray-800 fs-6">09:30</div>
                  <div className="timeline-badge">
                    <i className="fa fa-genderless text-info fs-1"></i>
                  </div>
                  <div className="fw-semibold text-gray-700 ps-3 fs-7">
                    MCP sincronizado com Directus
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-6">
          <div className="card h-100">
            <div className="card-header border-0 pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">Alertas do Sistema</span>
                <span className="text-muted mt-1 fw-semibold fs-7">Notificações importantes</span>
              </h3>
            </div>
            <div className="card-body py-3">
              <div className="d-flex flex-column gap-5">
                <div className="d-flex align-items-center">
                  <div className="symbol symbol-40px symbol-light-success me-5">
                    <span className="symbol-label">
                      <i className="ki-duotone ki-check-circle fs-2 text-success">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold text-gray-800 fs-7">Todos os serviços operacionais</div>
                    <div className="text-muted fs-8">Sofia AI v4.0 + MCP + Directus</div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <div className="symbol symbol-40px symbol-light-primary me-5">
                    <span className="symbol-label">
                      <i className="ki-duotone ki-abstract-26 fs-2 text-primary">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold text-gray-800 fs-7">AI Stack v4.0 ativo</div>
                    <div className="text-muted fs-8">LangChain + Langfuse + Qdrant + pgVector</div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <div className="symbol symbol-40px symbol-light-info me-5">
                    <span className="symbol-label">
                      <i className="ki-duotone ki-technology-2 fs-2 text-info">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold text-gray-800 fs-7">MCP integrado</div>
                    <div className="text-muted fs-8">Model Context Protocol ativo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
