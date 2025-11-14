/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 📊 STATS CARD - Metronic stats widget                                   ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { formatNumber, formatCurrency, formatPercent } from '@utils/format';

interface StatsCardProps {
  title: string;
  value: number;
  change?: number;
  icon: string;
  iconColor?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  format?: 'number' | 'currency' | 'percent';
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  iconColor = 'primary',
  format = 'number',
  loading = false,
}: StatsCardProps) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return formatPercent(value);
      default:
        return formatNumber(value);
    }
  };

  const changeColor = change && change > 0 ? 'success' : 'danger';
  const changeIcon = change && change > 0 ? 'arrow-up' : 'arrow-down';

  return (
    <div className="card card-flush h-100">
      <div className="card-header pt-5">
        <div className="card-title d-flex flex-column">
          <span className="fs-2hx fw-bold text-dark me-2 lh-1 ls-n2">
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              formatValue()
            )}
          </span>
          <span className="text-gray-400 pt-1 fw-semibold fs-6">{title}</span>
        </div>
      </div>

      <div className="card-body d-flex align-items-end pt-0">
        <div className="d-flex align-items-center flex-column mt-3 w-100">
          <div className="d-flex justify-content-between fw-bold fs-6 text-gray-600 w-100 mt-auto mb-2">
            {change !== undefined && (
              <span className={`badge badge-light-${changeColor}`}>
                <i className={`ki-duotone ki-${changeIcon} fs-5 text-${changeColor} ms-n1`}>
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                {Math.abs(change)}%
              </span>
            )}
            <span className={`symbol symbol-40px symbol-light-${iconColor}`}>
              <span className="symbol-label">
                <i className={`ki-duotone ki-${icon} fs-1 text-${iconColor}`}>
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                </i>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
