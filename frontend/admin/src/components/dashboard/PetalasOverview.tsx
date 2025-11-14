/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🌸 PÉTALAS OVERVIEW - All verticals status                              ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { Link } from 'react-router-dom';
import { usePetalas } from '@hooks/usePetalas';
import { formatNumber, formatCurrency, formatPercent } from '@utils/format';

export function PetalasOverview() {
  const { petalas, isLoading } = usePetalas();

  if (isLoading) {
    return (
      <div className="card">
        <div
          className="card-body d-flex justify-content-center align-items-center"
          style={{ minHeight: '400px' }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  const activePetalas = petalas?.filter((p) => p.status === 'active') || [];
  const developmentPetalas = petalas?.filter((p) => p.status === 'development') || [];

  return (
    <div className="card">
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">Pétalas Overview</span>
          <span className="text-muted mt-1 fw-semibold fs-7">
            {activePetalas.length} active • {developmentPetalas.length} in development
          </span>
        </h3>
        <div className="card-toolbar">
          <Link to="/petalas" className="btn btn-sm btn-light-primary">
            Ver Todas
          </Link>
        </div>
      </div>

      <div className="card-body py-3">
        <div className="table-responsive">
          <table className="table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3">
            <thead>
              <tr className="fw-bold text-muted">
                <th className="min-w-150px">Pétala</th>
                <th className="min-w-100px">Status</th>
                <th className="min-w-100px">Usuários</th>
                <th className="min-w-100px">Receita</th>
                <th className="min-w-100px">Crescimento</th>
                <th className="min-w-100px text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {petalas?.slice(0, 5).map((petala) => (
                <tr key={petala.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div
                        className={`symbol symbol-45px me-5 symbol-light-${petala.color || 'primary'}`}
                      >
                        <span className="symbol-label">
                          <i
                            className={`${petala.icon} fs-2x text-${petala.color || 'primary'}`}
                          ></i>
                        </span>
                      </div>
                      <div className="d-flex justify-content-start flex-column">
                        <Link
                          to={`/petalas/${petala.id}`}
                          className="text-dark fw-bold text-hover-primary fs-6"
                        >
                          {petala.name}
                        </Link>
                        <span className="text-muted fw-semibold text-muted d-block fs-7">
                          {petala.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge badge-light-${
                        petala.status === 'active'
                          ? 'success'
                          : petala.status === 'development'
                            ? 'warning'
                            : 'secondary'
                      }`}
                    >
                      {petala.status}
                    </span>
                  </td>
                  <td>
                    <span className="text-dark fw-bold d-block fs-6">
                      {formatNumber(petala.stats.users)}
                    </span>
                  </td>
                  <td>
                    <span className="text-dark fw-bold d-block fs-6">
                      {formatCurrency(petala.stats.revenue)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-light-${
                        petala.stats.growth > 0 ? 'success' : 'danger'
                      }`}
                    >
                      {petala.stats.growth > 0 ? '+' : ''}
                      {formatPercent(petala.stats.growth)}
                    </span>
                  </td>
                  <td className="text-end">
                    <Link
                      to={`/petalas/${petala.id}`}
                      className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                    >
                      <i className="ki-duotone ki-arrow-right fs-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
