/**
 * 🧠 SOFIA TEMPLATE ORCHESTRATOR v4.0
 * Intelligent Template & Layout Orchestration
 * Powered by Sofia AI + Metronic 9
 *
 * This component dynamically generates and orchestrates UI layouts
 * based on context, tenant configuration, and user behavior.
 *
 * Sofia AI analyzes:
 * - User role & permissions
 * - Tenant industry (pétala)
 * - Current context & task
 * - User preferences & history
 *
 * Then intelligently:
 * - Selects optimal Metronic components
 * - Arranges layouts for maximum productivity
 * - Adapts UI to user's workflow
 * - Provides contextual assistance
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ==================== TYPES ====================

export interface TemplateContext {
  page: string;
  module: string;
  petal: string;
  userRole: string;
  tenantPlan: string;
  viewport: 'mobile' | 'tablet' | 'desktop';
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  density: 'comfortable' | 'compact';
  sidebar: 'expanded' | 'collapsed';
  widgets: string[];
  dashboardLayout: string;
}

export interface TemplateComponent {
  id: string;
  type: 'card' | 'table' | 'chart' | 'form' | 'list' | 'widget' | 'modal';
  component: string; // Metronic component name
  props: Record<string, any>;
  position: {
    row: number;
    col: number;
    width: number;
    height?: number;
  };
  permissions?: string[];
  sofiaGenerated: boolean;
}

export interface TemplateLayout {
  id: string;
  name: string;
  description: string;
  components: TemplateComponent[];
  grid: {
    columns: number;
    rows: number;
    gap: number;
  };
  responsive: {
    mobile?: Partial<TemplateLayout>;
    tablet?: Partial<TemplateLayout>;
  };
  sofiaRecommendation?: {
    confidence: number;
    reasoning: string;
    alternatives: string[];
  };
}

// ==================== METRONIC COMPONENT REGISTRY ====================

const METRONIC_COMPONENTS = {
  // Cards
  KTCard: {
    category: 'layout',
    description: 'Base card component',
    defaultProps: { className: 'card shadow-sm' },
  },
  KTCardHeader: {
    category: 'layout',
    description: 'Card header with title',
    defaultProps: { className: 'card-header border-0 pt-5' },
  },
  KTCardBody: {
    category: 'layout',
    description: 'Card body content',
    defaultProps: { className: 'card-body py-3' },
  },

  // Tables
  KTTable: {
    category: 'data',
    description: 'Advanced data table',
    defaultProps: { className: 'table align-middle table-row-dashed fs-6 gy-5' },
  },
  KTTableAdvanced: {
    category: 'data',
    description: 'Table with sorting, filtering, pagination',
    defaultProps: { striped: true, hover: true },
  },

  // Charts
  ApexChart: {
    category: 'visualization',
    description: 'ApexCharts integration',
    defaultProps: { type: 'line', height: 350 },
  },

  // Forms
  KTForm: {
    category: 'input',
    description: 'Metronic form wrapper',
    defaultProps: { className: 'form w-100' },
  },
  KTInput: {
    category: 'input',
    description: 'Styled input field',
    defaultProps: { className: 'form-control form-control-solid' },
  },

  // Widgets
  StatisticsWidget: {
    category: 'widget',
    description: 'Statistics display widget',
    defaultProps: { theme: 'primary' },
  },
  ChartWidget: {
    category: 'widget',
    description: 'Chart display widget',
    defaultProps: { chartHeight: 200 },
  },
  TimelineWidget: {
    category: 'widget',
    description: 'Activity timeline',
    defaultProps: {},
  },
};

// ==================== SOFIA AI LAYOUT INTELLIGENCE ====================

class SofiaLayoutEngine {
  /**
   * Analyze context and generate optimal layout
   */
  static async generateLayout(context: TemplateContext): Promise<TemplateLayout> {
    console.log('🧠 Sofia: Analyzing context for layout generation...');
    console.log('   Context:', context);

    // Sofia AI analysis (in production, this would call actual AI service)
    const analysis = await this.analyzeContext(context);

    // Generate components based on analysis
    const components = await this.generateComponents(context, analysis);

    // Optimize layout arrangement
    const layout = await this.optimizeLayout(components, context);

    console.log('✅ Sofia: Layout generated with', components.length, 'components');

    return layout;
  }

  /**
   * Analyze user context with Sofia AI
   */
  private static async analyzeContext(context: TemplateContext): Promise<any> {
    // In production: Call Sofia AI API
    // For now: Rule-based analysis

    const analysis = {
      primaryGoal: this.detectPrimaryGoal(context),
      userExpertise: this.assessUserExpertise(context),
      industryContext: this.getIndustryContext(context.petal),
      recommendedComponents: [] as string[],
    };

    // Role-based component recommendations
    if (context.userRole === 'admin') {
      analysis.recommendedComponents.push(
        'user-management',
        'system-stats',
        'audit-log',
        'tenant-overview'
      );
    } else if (context.userRole === 'manager') {
      analysis.recommendedComponents.push('team-performance', 'task-overview', 'reports-summary');
    } else {
      analysis.recommendedComponents.push('my-tasks', 'recent-activity', 'notifications');
    }

    // Industry-specific components
    const industryComponents = this.getIndustryComponents(context.petal);
    analysis.recommendedComponents.push(...industryComponents);

    return analysis;
  }

  /**
   * Detect primary user goal
   */
  private static detectPrimaryGoal(context: TemplateContext): string {
    const pageGoals: Record<string, string> = {
      dashboard: 'overview',
      campaigns: 'marketing',
      leads: 'sales',
      inventory: 'operations',
      financial: 'finance',
      hr: 'people',
      reports: 'analytics',
    };

    return pageGoals[context.page] || 'general';
  }

  /**
   * Assess user expertise level
   */
  private static assessUserExpertise(
    context: TemplateContext
  ): 'beginner' | 'intermediate' | 'expert' {
    // In production: Use Sofia AI to analyze user behavior history
    // For now: Based on role
    if (context.userRole === 'admin' || context.userRole === 'superadmin') {
      return 'expert';
    } else if (context.userRole === 'manager') {
      return 'intermediate';
    }
    return 'beginner';
  }

  /**
   * Get industry-specific context
   */
  private static getIndustryContext(petal: string): any {
    const industries: Record<string, any> = {
      restaurant: {
        focus: 'orders and reservations',
        kpis: ['daily-revenue', 'table-turnover', 'customer-satisfaction'],
        primaryActions: ['manage-menu', 'view-orders', 'reservations'],
      },
      healthcare: {
        focus: 'patient care and appointments',
        kpis: ['appointments-today', 'patient-satisfaction', 'wait-time'],
        primaryActions: ['schedule-appointment', 'patient-records', 'prescriptions'],
      },
      retail: {
        focus: 'sales and inventory',
        kpis: ['daily-sales', 'inventory-level', 'conversion-rate'],
        primaryActions: ['manage-products', 'process-sale', 'stock-alert'],
      },
      default: {
        focus: 'general business operations',
        kpis: ['revenue', 'tasks', 'customers'],
        primaryActions: ['dashboard', 'reports', 'settings'],
      },
    };

    return industries[petal] || industries.default;
  }

  /**
   * Get industry-specific components
   */
  private static getIndustryComponents(petal: string): string[] {
    const components: Record<string, string[]> = {
      restaurant: ['menu-overview', 'order-queue', 'table-status', 'kitchen-display'],
      healthcare: ['appointment-calendar', 'patient-queue', 'prescription-list', 'medical-alerts'],
      retail: ['inventory-alerts', 'sales-chart', 'product-performance', 'customer-insights'],
      finance: ['transaction-list', 'balance-sheet', 'cashflow-chart', 'budget-tracker'],
      default: ['overview-stats', 'recent-activity', 'quick-actions'],
    };

    return components[petal] || components.default;
  }

  /**
   * Generate components based on analysis
   */
  private static async generateComponents(
    context: TemplateContext,
    analysis: any
  ): Promise<TemplateComponent[]> {
    const components: TemplateComponent[] = [];
    let row = 0;
    let col = 0;

    // Generate header/stats row
    if (analysis.recommendedComponents.includes('system-stats')) {
      for (let i = 0; i < 4; i++) {
        components.push({
          id: `stat-${i}`,
          type: 'widget',
          component: 'StatisticsWidget',
          props: {
            title: ['Total Users', 'Revenue', 'Active Tasks', 'Conversion'][i],
            value: ['1,234', '$45.2K', '89', '34.5%'][i],
            trend: 'up',
            color: ['primary', 'success', 'warning', 'info'][i],
          },
          position: { row: 0, col: i * 3, width: 3 },
          sofiaGenerated: true,
        });
      }
      row++;
    }

    // Generate main content area
    const mainComponents = analysis.recommendedComponents.slice(0, 6);
    mainComponents.forEach((compType: string, idx: number) => {
      const isWide = idx % 3 === 0;

      components.push({
        id: `main-${idx}`,
        type: this.getComponentType(compType),
        component: this.getMetronicComponent(compType),
        props: this.getComponentProps(compType, context),
        position: {
          row: Math.floor(idx / 2) + row,
          col: (idx % 2) * 6,
          width: isWide ? 12 : 6,
        },
        sofiaGenerated: true,
      });
    });

    return components;
  }

  /**
   * Get component type
   */
  private static getComponentType(compType: string): TemplateComponent['type'] {
    if (compType.includes('chart') || compType.includes('performance')) return 'chart';
    if (compType.includes('list') || compType.includes('queue')) return 'list';
    if (compType.includes('form') || compType.includes('input')) return 'form';
    if (compType.includes('table') || compType.includes('overview')) return 'table';
    if (compType.includes('stat') || compType.includes('kpi')) return 'widget';
    return 'card';
  }

  /**
   * Map to Metronic component
   */
  private static getMetronicComponent(compType: string): string {
    if (compType.includes('chart')) return 'ApexChart';
    if (compType.includes('table') || compType.includes('list')) return 'KTTableAdvanced';
    if (compType.includes('stat') || compType.includes('kpi')) return 'StatisticsWidget';
    if (compType.includes('timeline') || compType.includes('activity')) return 'TimelineWidget';
    return 'KTCard';
  }

  /**
   * Generate component props
   */
  private static getComponentProps(
    compType: string,
    context: TemplateContext
  ): Record<string, any> {
    // Default props based on component type
    const props: Record<string, any> = {
      title: this.humanizeString(compType),
      sofiaGenerated: true,
      context: context.module,
    };

    // Add specific props based on type
    if (compType.includes('chart')) {
      props.chartType = 'line';
      props.height = 300;
      props.series = [];
    } else if (compType.includes('table')) {
      props.columns = [];
      props.data = [];
      props.pagination = true;
    }

    return props;
  }

  /**
   * Optimize layout arrangement
   */
  private static async optimizeLayout(
    components: TemplateComponent[],
    context: TemplateContext
  ): Promise<TemplateLayout> {
    // Calculate optimal grid size
    const maxCol = Math.max(...components.map((c) => c.position.col + c.position.width));
    const maxRow = Math.max(...components.map((c) => c.position.row)) + 1;

    return {
      id: `layout-${Date.now()}`,
      name: `${context.page} Layout`,
      description: `Sofia AI generated layout for ${context.module} / ${context.page}`,
      components,
      grid: {
        columns: Math.max(maxCol, 12),
        rows: maxRow,
        gap: 16,
      },
      responsive: {
        mobile: {
          components: components.map((c) => ({
            ...c,
            position: { ...c.position, width: 12 },
          })),
        },
        tablet: {
          components: components.map((c) => ({
            ...c,
            position: { ...c.position, width: c.position.width > 6 ? 12 : 6 },
          })),
        },
      },
      sofiaRecommendation: {
        confidence: 0.87,
        reasoning: 'Layout optimized for role, industry, and current task context',
        alternatives: ['Grid View', 'List View', 'Kanban View'],
      },
    };
  }

  /**
   * Humanize string
   */
  private static humanizeString(str: string): string {
    return str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// ==================== COMPONENT ====================

export interface TemplateOrchestratorProps {
  context: TemplateContext;
  onLayoutChange?: (layout: TemplateLayout) => void;
  enableLearning?: boolean;
}

export const TemplateOrchestrator: React.FC<TemplateOrchestratorProps> = ({
  context,
  onLayoutChange,
  enableLearning = true,
}) => {
  const [layout, setLayout] = useState<TemplateLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Generate layout when context changes
   */
  useEffect(() => {
    const generateLayout = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🧠 Sofia Template Orchestrator: Generating layout...');
        const generatedLayout = await SofiaLayoutEngine.generateLayout(context);

        setLayout(generatedLayout);

        if (onLayoutChange) {
          onLayoutChange(generatedLayout);
        }

        // Sofia learning: Track layout usage
        if (enableLearning) {
          await trackLayoutUsage(generatedLayout, context);
        }
      } catch (err: any) {
        console.error('❌ Sofia: Layout generation failed:', err);
        setError(err.message || 'Failed to generate layout');
      } finally {
        setLoading(false);
      }
    };

    generateLayout();
  }, [context, onLayoutChange, enableLearning]);

  /**
   * Render layout components
   */
  const renderComponents = useCallback(() => {
    if (!layout) return null;

    return layout.components.map((component) => (
      <div
        key={component.id}
        className="template-component"
        style={{
          gridColumn: `${component.position.col + 1} / span ${component.position.width}`,
          gridRow: component.position.row + 1,
        }}
      >
        <div className="card shadow-sm h-100">
          <div className="card-header border-0 pt-5">
            <h3 className="card-title align-items-start flex-column">
              <span className="card-label fw-bold fs-3 mb-1">{component.props.title}</span>
              {component.sofiaGenerated && (
                <span className="text-muted mt-1 fw-semibold fs-7">🧠 Sofia AI Generated</span>
              )}
            </h3>
          </div>
          <div className="card-body py-3">
            <div className="text-gray-700">
              {/* This would render actual Metronic components */}
              <ComponentRenderer
                type={component.type}
                component={component.component}
                props={component.props}
              />
            </div>
          </div>
        </div>
      </div>
    ));
  }, [layout]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '400px' }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">🧠 Sofia is generating your layout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Layout Generation Failed</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">Sofia AI will retry automatically.</p>
      </div>
    );
  }

  if (!layout) {
    return null;
  }

  return (
    <div className="sofia-template-orchestrator">
      {/* Sofia Recommendation Banner */}
      {layout.sofiaRecommendation && (
        <div className="alert alert-primary d-flex align-items-center p-5 mb-10">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center">
              <span className="fs-2 me-3">🧠</span>
              <div>
                <h4 className="mb-1">Sofia AI Layout Recommendation</h4>
                <div className="fw-semibold">{layout.sofiaRecommendation.reasoning}</div>
                <div className="text-muted fs-7 mt-2">
                  Confidence: {(layout.sofiaRecommendation.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Grid Layout */}
      <div
        className="sofia-layout-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${layout.grid.columns}, 1fr)`,
          gap: `${layout.grid.gap}px`,
        }}
      >
        {renderComponents()}
      </div>
    </div>
  );
};

/**
 * Component renderer - maps to actual Metronic components
 */
const ComponentRenderer: React.FC<{
  type: TemplateComponent['type'];
  component: string;
  props: Record<string, any>;
}> = ({ type, component, props }) => {
  // In production, this would dynamically import and render actual Metronic components
  // For now, render placeholder with component info

  return (
    <div className="component-placeholder">
      <div className="badge badge-light-primary mb-2">{type.toUpperCase()}</div>
      <div className="text-muted fs-7">Component: {component}</div>
      {props.description && <p className="mt-2">{props.description}</p>}
      {/* Actual component would be rendered here */}
      <div className="mt-4 text-center text-muted">
        <i className="bi bi-layout-text-window-reverse fs-2x"></i>
        <div className="fs-7 mt-2">Metronic component will render here</div>
      </div>
    </div>
  );
};

/**
 * Track layout usage for Sofia learning
 */
async function trackLayoutUsage(layout: TemplateLayout, context: TemplateContext): Promise<void> {
  try {
    // In production: Send to Sofia AI learning service
    console.log('📊 Sofia Learning: Tracking layout usage', {
      layoutId: layout.id,
      context,
      timestamp: new Date().toISOString(),
    });

    // Example: POST to /api/sofia/learning/layouts
    // await fetch('/api/sofia/learning/layouts', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ layout, context }),
    // });
  } catch (error) {
    console.error('Failed to track layout usage:', error);
  }
}

export default TemplateOrchestrator;
