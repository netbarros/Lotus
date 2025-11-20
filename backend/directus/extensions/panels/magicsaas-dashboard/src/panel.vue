<template>
  <div class="magicsaas-dashboard">
    <div class="dashboard-header">
      <h2>{{ dashboardTitle }}</h2>
      <div class="refresh-indicator">
        <v-icon :name="isLoading ? 'cached' : 'check_circle'" :class="{ rotating: isLoading }" />
        <span>Last updated: {{ lastUpdated }}</span>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Revenue Metrics (Owner/Admin only) -->
      <div v-if="showRevenue && canViewRevenue" class="dashboard-section revenue-section">
        <h3>Revenue & Growth</h3>
        <div class="metrics-row">
          <div class="metric-card">
            <div class="metric-label">MRR</div>
            <div class="metric-value">${{ formatNumber(metrics.mrr) }}</div>
            <div class="metric-change" :class="metrics.mrrChange >= 0 ? 'positive' : 'negative'">
              {{ metrics.mrrChange >= 0 ? '+' : '' }}{{ metrics.mrrChange }}%
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">ARR</div>
            <div class="metric-value">${{ formatNumber(metrics.arr) }}</div>
            <div class="metric-change" :class="metrics.arrChange >= 0 ? 'positive' : 'negative'">
              {{ metrics.arrChange >= 0 ? '+' : '' }}{{ metrics.arrChange }}%
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Churn Rate</div>
            <div class="metric-value">{{ metrics.churnRate }}%</div>
            <div class="metric-change" :class="metrics.churnRate < 5 ? 'positive' : 'negative'">
              {{ metrics.churnRate < 5 ? 'Good' : 'High' }}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">LTV:CAC</div>
            <div class="metric-value">{{ metrics.ltvCacRatio }}</div>
            <div class="metric-change" :class="metrics.ltvCacRatio >= 3 ? 'positive' : 'negative'">
              {{ metrics.ltvCacRatio >= 3 ? 'Healthy' : 'Low' }}
            </div>
          </div>
        </div>
      </div>

      <!-- User Metrics -->
      <div v-if="showUsers" class="dashboard-section users-section">
        <h3>Users & Engagement</h3>
        <div class="metrics-row">
          <div class="metric-card">
            <div class="metric-label">Active Tenants</div>
            <div class="metric-value">{{ formatNumber(metrics.activeTenants) }}</div>
            <div class="metric-subtext">{{ metrics.newTenants }} new this {{ dateRangeName }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Users</div>
            <div class="metric-value">{{ formatNumber(metrics.totalUsers) }}</div>
            <div class="metric-subtext">{{ metrics.newUsers }} new this {{ dateRangeName }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">DAU</div>
            <div class="metric-value">{{ formatNumber(metrics.dau) }}</div>
            <div class="metric-subtext">Daily Active Users</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">MAU</div>
            <div class="metric-value">{{ formatNumber(metrics.mau) }}</div>
            <div class="metric-subtext">Monthly Active Users</div>
          </div>
        </div>
      </div>

      <!-- Sofia AI Performance -->
      <div v-if="showSofiaAI" class="dashboard-section sofia-section">
        <h3>Sofia AI Performance</h3>
        <div class="metrics-row">
          <div class="metric-card">
            <div class="metric-label">Intentions Processed</div>
            <div class="metric-value">{{ formatNumber(metrics.intentionsProcessed) }}</div>
            <div class="metric-subtext">{{ metrics.intentionsRate }}/hour avg</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Success Rate</div>
            <div class="metric-value">{{ metrics.sofiaSuccessRate }}%</div>
            <div class="metric-change" :class="metrics.sofiaSuccessRate >= 95 ? 'positive' : 'negative'">
              {{ metrics.sofiaSuccessRate >= 95 ? 'Excellent' : 'Needs Attention' }}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Avg Processing Time</div>
            <div class="metric-value">{{ metrics.avgProcessingTime }}s</div>
            <div class="metric-subtext">p95: {{ metrics.p95ProcessingTime }}s</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Deployments</div>
            <div class="metric-value">{{ formatNumber(metrics.deploymentsSuccess) }}</div>
            <div class="metric-subtext">{{ metrics.deploymentsRate }}/day avg</div>
          </div>
        </div>
      </div>

      <!-- System Health -->
      <div class="dashboard-section health-section">
        <h3>System Health & Performance</h3>
        <div class="metrics-row">
          <div class="metric-card">
            <div class="metric-label">Uptime</div>
            <div class="metric-value">{{ metrics.uptime }}%</div>
            <div class="metric-change" :class="getUptimeStatus(metrics.uptime)">
              {{ getUptimeLabel(metrics.uptime) }}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">API Latency (p95)</div>
            <div class="metric-value">{{ metrics.apiLatencyP95 }}ms</div>
            <div class="metric-change" :class="metrics.apiLatencyP95 < 200 ? 'positive' : 'negative'">
              {{ metrics.apiLatencyP95 < 200 ? 'Good' : 'Slow' }}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Error Rate</div>
            <div class="metric-value">{{ metrics.errorRate }}%</div>
            <div class="metric-change" :class="metrics.errorRate < 0.1 ? 'positive' : 'negative'">
              {{ metrics.errorRate < 0.1 ? 'Low' : 'High' }}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Error Budget</div>
            <div class="metric-value">{{ metrics.errorBudget }}%</div>
            <div class="metric-change" :class="getErrorBudgetStatus(metrics.errorBudget)">
              {{ getErrorBudgetLabel(metrics.errorBudget) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Security Alerts -->
      <div v-if="showSecurity" class="dashboard-section security-section">
        <h3>Security & Threats</h3>
        <div class="metrics-row">
          <div class="metric-card">
            <div class="metric-label">Critical Alerts (24h)</div>
            <div class="metric-value">{{ metrics.criticalAlerts }}</div>
            <div class="metric-change" :class="metrics.criticalAlerts === 0 ? 'positive' : 'negative'">
              {{ metrics.criticalAlerts === 0 ? 'None' : 'Action Required' }}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Failed Logins (1h)</div>
            <div class="metric-value">{{ formatNumber(metrics.failedLogins) }}</div>
            <div class="metric-change" :class="metrics.failedLogins < 50 ? 'positive' : 'warning'">
              {{ metrics.failedLogins < 50 ? 'Normal' : 'Elevated' }}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Security Score</div>
            <div class="metric-value">{{ metrics.securityScore }}</div>
            <div class="metric-change" :class="getSecurityScoreStatus(metrics.securityScore)">
              {{ getSecurityScoreLabel(metrics.securityScore) }}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Vulnerabilities</div>
            <div class="metric-value">{{ metrics.vulnerabilities }}</div>
            <div class="metric-subtext">{{ metrics.criticalVulns }} critical</div>
          </div>
        </div>
      </div>

      <!-- Real-time Activity Feed -->
      <div class="dashboard-section activity-section">
        <h3>Recent Activity</h3>
        <div class="activity-feed">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <v-icon :name="activity.icon" :class="activity.type" />
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import { useApi } from '@directus/extensions-sdk';
import { formatDistanceToNow } from 'date-fns';

export default defineComponent({
  props: {
    userRole: {
      type: String,
      default: 'admin',
    },
    refreshInterval: {
      type: Number,
      default: 30,
    },
    showRevenue: {
      type: Boolean,
      default: true,
    },
    showUsers: {
      type: Boolean,
      default: true,
    },
    showSofiaAI: {
      type: Boolean,
      default: true,
    },
    showSecurity: {
      type: Boolean,
      default: true,
    },
    dateRange: {
      type: String,
      default: '30d',
    },
  },
  setup(props) {
    const api = useApi();
    const isLoading = ref(false);
    const lastUpdated = ref('Never');
    const metrics = ref({
      // Revenue
      mrr: 0,
      mrrChange: 0,
      arr: 0,
      arrChange: 0,
      churnRate: 0,
      ltvCacRatio: 0,
      // Users
      activeTenants: 0,
      newTenants: 0,
      totalUsers: 0,
      newUsers: 0,
      dau: 0,
      mau: 0,
      // Sofia AI
      intentionsProcessed: 0,
      intentionsRate: 0,
      sofiaSuccessRate: 0,
      avgProcessingTime: 0,
      p95ProcessingTime: 0,
      deploymentsSuccess: 0,
      deploymentsRate: 0,
      // System Health
      uptime: 0,
      apiLatencyP95: 0,
      errorRate: 0,
      errorBudget: 0,
      // Security
      criticalAlerts: 0,
      failedLogins: 0,
      securityScore: 0,
      vulnerabilities: 0,
      criticalVulns: 0,
    });
    const recentActivity = ref([]);
    let refreshTimer: ReturnType<typeof setInterval> | null = null;

    const dashboardTitle = computed(() => {
      const roleNames = {
        owner: 'Owner Dashboard - Full System Overview',
        admin: 'Admin Dashboard - Tenant Analytics',
        manager: 'Manager Dashboard - Department Metrics',
        user: 'User Dashboard - Personal Insights',
      };
      return roleNames[props.userRole as keyof typeof roleNames] || 'Dashboard';
    });

    const dateRangeName = computed(() => {
      const names = {
        '24h': '24 hours',
        '7d': 'week',
        '30d': 'month',
        '90d': 'quarter',
      };
      return names[props.dateRange as keyof typeof names] || 'period';
    });

    const canViewRevenue = computed(() => {
      return ['owner', 'admin'].includes(props.userRole);
    });

    const fetchDashboardData = async () => {
      isLoading.value = true;
      try {
        // Fetch data from custom endpoint that aggregates Redis, Prometheus, PostgreSQL
        const response = await api.get('/magicsaas/dashboard/metrics', {
          params: {
            role: props.userRole,
            dateRange: props.dateRange,
          },
        });

        if (response.data && response.data.data) {
          metrics.value = { ...metrics.value, ...response.data.data };
        }

        // Fetch recent activity
        const activityResponse = await api.get('/magicsaas/dashboard/activity', {
          params: {
            limit: 10,
          },
        });

        if (activityResponse.data && activityResponse.data.data) {
          recentActivity.value = activityResponse.data.data;
        }

        lastUpdated.value = new Date().toLocaleTimeString();
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const formatNumber = (num: number): string => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toLocaleString();
    };

    const formatRelativeTime = (timestamp: string): string => {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };

    const getUptimeStatus = (uptime: number): string => {
      if (uptime >= 99.95) return 'positive';
      if (uptime >= 99.5) return 'warning';
      return 'negative';
    };

    const getUptimeLabel = (uptime: number): string => {
      if (uptime >= 99.95) return 'Excellent';
      if (uptime >= 99.5) return 'Good';
      if (uptime >= 99.0) return 'Fair';
      return 'Poor';
    };

    const getErrorBudgetStatus = (budget: number): string => {
      if (budget >= 75) return 'positive';
      if (budget >= 25) return 'warning';
      return 'negative';
    };

    const getErrorBudgetLabel = (budget: number): string => {
      if (budget >= 75) return 'Healthy';
      if (budget >= 50) return 'Monitor';
      if (budget >= 25) return 'Caution';
      return 'Critical';
    };

    const getSecurityScoreStatus = (score: number): string => {
      if (score >= 90) return 'positive';
      if (score >= 70) return 'warning';
      return 'negative';
    };

    const getSecurityScoreLabel = (score: number): string => {
      if (score >= 90) return 'Excellent';
      if (score >= 70) return 'Good';
      if (score >= 50) return 'Fair';
      return 'Poor';
    };

    onMounted(() => {
      fetchDashboardData();
      refreshTimer = setInterval(fetchDashboardData, props.refreshInterval * 1000);
    });

    onUnmounted(() => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    });

    return {
      isLoading,
      lastUpdated,
      metrics,
      recentActivity,
      dashboardTitle,
      dateRangeName,
      canViewRevenue,
      formatNumber,
      formatRelativeTime,
      getUptimeStatus,
      getUptimeLabel,
      getErrorBudgetStatus,
      getErrorBudgetLabel,
      getSecurityScoreStatus,
      getSecurityScoreLabel,
    };
  },
});
</script>

<style scoped>
.magicsaas-dashboard {
  padding: 20px;
  background: var(--theme--background);
  height: 100%;
  overflow-y: auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--theme--border-color);
}

.dashboard-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--theme--foreground);
}

.refresh-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--theme--foreground-subdued);
  font-size: 14px;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-section {
  background: var(--theme--background-accent);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--theme--foreground);
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.metric-card {
  background: var(--theme--background);
  border-radius: 6px;
  padding: 16px;
  border: 1px solid var(--theme--border-color);
}

.metric-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--theme--foreground-subdued);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--theme--foreground);
  margin-bottom: 4px;
}

.metric-change {
  font-size: 13px;
  font-weight: 600;
}

.metric-change.positive {
  color: var(--theme--success);
}

.metric-change.negative {
  color: var(--theme--danger);
}

.metric-change.warning {
  color: var(--theme--warning);
}

.metric-subtext {
  font-size: 12px;
  color: var(--theme--foreground-subdued);
  margin-top: 4px;
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--theme--background);
  border-radius: 6px;
  border: 1px solid var(--theme--border-color);
}

.activity-item .v-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-item .v-icon.success {
  background: var(--theme--success-background);
  color: var(--theme--success);
}

.activity-item .v-icon.warning {
  background: var(--theme--warning-background);
  color: var(--theme--warning);
}

.activity-item .v-icon.danger {
  background: var(--theme--danger-background);
  color: var(--theme--danger);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--theme--foreground);
  margin-bottom: 2px;
}

.activity-time {
  font-size: 12px;
  color: var(--theme--foreground-subdued);
}

/* Section-specific styling */
.revenue-section {
  border-left: 4px solid var(--theme--success);
}

.users-section {
  border-left: 4px solid var(--theme--primary);
}

.sofia-section {
  border-left: 4px solid var(--theme--purple);
}

.health-section {
  border-left: 4px solid var(--theme--warning);
}

.security-section {
  border-left: 4px solid var(--theme--danger);
}

.activity-section {
  border-left: 4px solid var(--theme--foreground-subdued);
}
</style>
