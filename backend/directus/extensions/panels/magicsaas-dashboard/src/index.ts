import { definePanel } from '@directus/extensions-sdk';
import PanelComponent from './panel.vue';

export default definePanel({
  id: 'magicsaas-dashboard',
  name: 'MagicSaaS 360° Dashboard',
  icon: 'dashboard',
  description: 'Comprehensive business intelligence dashboard with real-time KPIs',
  component: PanelComponent,
  options: ({ options }) => [
    {
      field: 'userRole',
      name: 'User Role Level',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Owner (Full Access)', value: 'owner' },
            { text: 'Admin (Tenant-wide)', value: 'admin' },
            { text: 'Manager (Department)', value: 'manager' },
            { text: 'User (Personal)', value: 'user' },
          ],
        },
        width: 'half',
      },
      schema: {
        default_value: 'admin',
      },
    },
    {
      field: 'refreshInterval',
      name: 'Refresh Interval (seconds)',
      type: 'integer',
      meta: {
        interface: 'input',
        width: 'half',
      },
      schema: {
        default_value: 30,
      },
    },
    {
      field: 'showRevenue',
      name: 'Show Revenue Metrics',
      type: 'boolean',
      meta: {
        interface: 'boolean',
        width: 'half',
      },
      schema: {
        default_value: true,
      },
    },
    {
      field: 'showUsers',
      name: 'Show User Metrics',
      type: 'boolean',
      meta: {
        interface: 'boolean',
        width: 'half',
      },
      schema: {
        default_value: true,
      },
    },
    {
      field: 'showSofiaAI',
      name: 'Show Sofia AI Metrics',
      type: 'boolean',
      meta: {
        interface: 'boolean',
        width: 'half',
      },
      schema: {
        default_value: true,
      },
    },
    {
      field: 'showSecurity',
      name: 'Show Security Alerts',
      type: 'boolean',
      meta: {
        interface: 'boolean',
        width: 'half',
      },
      schema: {
        default_value: true,
      },
    },
    {
      field: 'dateRange',
      name: 'Default Date Range',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Last 24 Hours', value: '24h' },
            { text: 'Last 7 Days', value: '7d' },
            { text: 'Last 30 Days', value: '30d' },
            { text: 'Last 90 Days', value: '90d' },
          ],
        },
        width: 'half',
      },
      schema: {
        default_value: '30d',
      },
    },
  ],
  minWidth: 12,
  minHeight: 8,
});
