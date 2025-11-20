/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🎯 MAGICSAAS ADMIN - TYPE DEFINITIONS                                    ║
 * ║ Complete TypeScript types for enterprise admin                           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════
// USER & AUTH
// ═══════════════════════════════════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'archived';
  created_at: string;
  last_access: string;
}

export type UserRole = 'admin' | 'manager' | 'user' | 'developer';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// SOFIA AI v4.0
// ═══════════════════════════════════════════════════════════════════════════

export interface SofiaHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  components: {
    IntentionEngine: boolean;
    UXValidator: boolean;
    SEOOptimizer: boolean;
    DirectusOrchestrator: boolean;
    MarketplaceManager: boolean;
    DecisionLogger: boolean;
    EventStore: boolean;
    Metrics: boolean;
    LangChain: boolean;
    Langfuse: boolean;
    Qdrant: boolean;
    pgVector: boolean;
  };
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
}

export interface SofiaMetrics {
  version: string;
  uptime: number;
  status: string;
  components: number;
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
}

export interface IntentionRequest {
  intention: string;
  context?: Record<string, any>;
  petala?: string;
}

export interface GeneratedSolution {
  id: string;
  intention: string;
  solution: {
    components: Array<{
      type: string;
      name: string;
      code: string;
    }>;
    api_endpoints: Array<{
      method: string;
      path: string;
      handler: string;
    }>;
    database_schema: string;
  };
  metadata: {
    generated_at: string;
    processing_time: number;
    confidence_score: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PÉTALAS
// ═══════════════════════════════════════════════════════════════════════════

export interface Petala {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  status: 'active' | 'development' | 'archived';
  version: string;
  features: string[];
  stats: {
    users: number;
    revenue: number;
    growth: number;
  };
  created_at: string;
  updated_at: string;
}

export type PetalaType =
  | 'automotive'
  | 'beauty'
  | 'creator'
  | 'education'
  | 'events'
  | 'fashion'
  | 'finance'
  | 'fitness'
  | 'healthcare'
  | 'hospitality'
  | 'legal'
  | 'logistics'
  | 'real-estate'
  | 'restaurant'
  | 'retail'
  | 'travel';

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  revenueGrowth: number;
  totalPetalas: number;
  activePetalas: number;
  sofiaRequests: number;
  sofiaSuccessRate: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// MCP (Model Context Protocol)
// ═══════════════════════════════════════════════════════════════════════════

export interface MCPConfig {
  enabled: boolean;
  directusUrl: string;
  token?: string;
}

export interface MCPConnection {
  id: string;
  name: string;
  type: 'directus' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  lastSync: string;
}

export interface MCPResource {
  collection: string;
  operation: 'read' | 'create' | 'update' | 'delete';
  data: any;
  metadata?: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════════════════

export interface APIResponse<T = any> {
  data: T;
  meta?: {
    total_count?: number;
    filter_count?: number;
    page?: number;
    limit?: number;
  };
}

export interface APIError {
  message: string;
  errors?: Array<{
    message: string;
    extensions?: {
      code: string;
      field?: string;
    };
  }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════════════════
// MARKETPLACE
// ═══════════════════════════════════════════════════════════════════════════

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  type: 'petala' | 'component' | 'template' | 'integration';
  price: number;
  currency: string;
  rating: number;
  downloads: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  thumbnail?: string;
  screenshots?: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action?: {
    label: string;
    url: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface SystemSettings {
  general: {
    site_name: string;
    site_description: string;
    logo?: string;
    timezone: string;
    language: string;
  };
  sofia: {
    enabled: boolean;
    api_url: string;
    features: {
      intentionEngine: boolean;
      uxValidation: boolean;
      seoOptimization: boolean;
      marketplace: boolean;
      adaptiveLearning: boolean;
    };
  };
  mcp: {
    enabled: boolean;
    connections: MCPConnection[];
  };
  security: {
    two_factor_enabled: boolean;
    session_timeout: number;
    password_policy: {
      min_length: number;
      require_uppercase: boolean;
      require_lowercase: boolean;
      require_numbers: boolean;
      require_special: boolean;
    };
  };
}
