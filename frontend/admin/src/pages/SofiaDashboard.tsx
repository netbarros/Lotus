/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🧠 SOFIA AI DASHBOARD - Complete AI monitoring and control              ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { sofia } from '@services/sofia';
import { useSofiaHealth } from '@hooks/useSofiaHealth';
import type { IntentionRequest } from '@types';

export function SofiaDashboard() {
  const { health, isLoading: healthLoading } = useSofiaHealth();
  const [intentionText, setIntentionText] = useState('');

  const { data: metrics } = useQuery({
    queryKey: ['sofia', 'metrics'],
    queryFn: () => sofia.getMetrics(),
    refetchInterval: 30000,
  });

  const { data: chains } = useQuery({
    queryKey: ['sofia', 'chains'],
    queryFn: () => sofia.listChains(),
  });

  const generateMutation = useMutation({
    mutationFn: (request: IntentionRequest) => sofia.generateByIntention(request),
  });

  const handleGenerate = () => {
    if (!intentionText.trim()) return;

    generateMutation.mutate({
      intention: intentionText,
      context: {},
    });
  };

  return (
    <>
      {/* Page Header */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card bg-primary">
            <div className="card-body py-8">
              <div className="d-flex flex-column">
                <h1 className="text-white fw-bold mb-3">
                  <i className="ki-duotone ki-abstract-26 fs-1 me-3">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Sofia AI v4.0 Dashboard
                </h1>
                <p className="text-white opacity-75 fs-5 mb-0">
                  Complete AI Stack: LangChain + Langfuse + Qdrant + pgVector + Claude AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health & Metrics Row */}
      <div className="row g-5 g-xl-8 mb-5">
        <div className="col-xl-3">
          <div className="card card-flush h-100">
            <div className="card-body text-center py-10">
              <div className="mb-5">
                <div
                  className={`badge badge-light-${
                    health?.status === 'healthy' ? 'success' : 'danger'
                  } fs-1 fw-bold py-5 px-8`}
                >
                  {health?.status || 'checking...'}
                </div>
              </div>
              <div className="text-gray-800 fw-bold fs-2 mb-2">System Status</div>
              <div className="text-gray-400 fw-semibold fs-7">
                {healthLoading ? 'Loading...' : 'All systems operational'}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3">
          <div className="card card-flush h-100">
            <div className="card-body text-center py-10">
              <div className="mb-5">
                <div className="fs-2hx fw-bold text-primary">
                  {metrics?.metrics.totalRequests || 0}
                </div>
              </div>
              <div className="text-gray-800 fw-bold fs-2 mb-2">Total Requests</div>
              <div className="text-gray-400 fw-semibold fs-7">All-time AI requests</div>
            </div>
          </div>
        </div>

        <div className="col-xl-3">
          <div className="card card-flush h-100">
            <div className="card-body text-center py-10">
              <div className="mb-5">
                <div className="fs-2hx fw-bold text-success">
                  {metrics?.metrics.successfulRequests || 0}
                </div>
              </div>
              <div className="text-gray-800 fw-bold fs-2 mb-2">Successful</div>
              <div className="text-gray-400 fw-semibold fs-7">
                {metrics
                  ? ((metrics.metrics.successfulRequests / metrics.metrics.totalRequests) * 100).toFixed(
                      1
                    )
                  : 0}
                % success rate
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3">
          <div className="card card-flush h-100">
            <div className="card-body text-center py-10">
              <div className="mb-5">
                <div className="fs-2hx fw-bold text-info">
                  {metrics?.metrics.averageResponseTime || 0}ms
                </div>
              </div>
              <div className="text-gray-800 fw-bold fs-2 mb-2">Avg Response</div>
              <div className="text-gray-400 fw-semibold fs-7">Response time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Intention Engine */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header border-0 pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">Intention Engine</span>
                <span className="text-muted mt-1 fw-semibold fs-7">
                  Generate SaaS by natural language intention
                </span>
              </h3>
            </div>
            <div className="card-body">
              <div className="mb-5">
                <label className="form-label fw-bold">Descreva sua intenção:</label>
                <textarea
                  className="form-control form-control-solid"
                  rows={4}
                  placeholder="Ex: Quero criar um SaaS de gestão de clínicas veterinárias com agendamento, prontuários e estoque..."
                  value={intentionText}
                  onChange={(e) => setIntentionText(e.target.value)}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending || !intentionText.trim()}
                >
                  {generateMutation.isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <i className="ki-duotone ki-abstract-26 fs-2 me-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Gerar SaaS
                    </>
                  )}
                </button>
              </div>

              {generateMutation.isSuccess && (
                <div className="alert alert-success mt-5">
                  <h4 className="alert-heading">
                    <i className="ki-duotone ki-check-circle fs-1 me-2">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    SaaS gerado com sucesso!
                  </h4>
                  <p className="mb-0">
                    Confidence Score:{' '}
                    {(generateMutation.data.metadata.confidence_score * 100).toFixed(1)}%
                  </p>
                  <p className="mb-0">
                    Processing Time: {generateMutation.data.metadata.processing_time}ms
                  </p>
                </div>
              )}

              {generateMutation.isError && (
                <div className="alert alert-danger mt-5">
                  <i className="ki-duotone ki-cross-circle fs-1 me-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Erro ao gerar SaaS. Tente novamente.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Stack Components */}
      <div className="row g-5 g-xl-8">
        <div className="col-xl-6">
          <div className="card h-100">
            <div className="card-header border-0 pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">LangChain Chains</span>
                <span className="text-muted mt-1 fw-semibold fs-7">
                  Available orchestration chains
                </span>
              </h3>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                {chains?.map((chain) => (
                  <div key={chain} className="d-flex align-items-center">
                    <span className="bullet bullet-vertical h-40px bg-primary me-5"></span>
                    <div className="flex-grow-1">
                      <div className="text-gray-800 fw-bold fs-6">{chain}</div>
                    </div>
                    <button className="btn btn-sm btn-light-primary">Execute</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-6">
          <div className="card h-100">
            <div className="card-header border-0 pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">AI Stack Status</span>
                <span className="text-muted mt-1 fw-semibold fs-7">
                  v4.0 Components health
                </span>
              </h3>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-5">
                <ComponentCard
                  name="LangChain"
                  description="AI orchestration framework"
                  active={health?.components.LangChain}
                />
                <ComponentCard
                  name="Langfuse"
                  description="ML observability platform"
                  active={health?.components.Langfuse}
                />
                <ComponentCard
                  name="Qdrant"
                  description="Vector database (1536D)"
                  active={health?.components.Qdrant}
                />
                <ComponentCard
                  name="pgVector"
                  description="PostgreSQL vector search"
                  active={health?.components.pgVector}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ComponentCard({
  name,
  description,
  active,
}: {
  name: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className="d-flex align-items-center">
      <div className={`symbol symbol-50px symbol-light-${active ? 'success' : 'danger'} me-5`}>
        <span className="symbol-label">
          <i
            className={`ki-duotone ki-abstract-26 fs-2x text-${active ? 'success' : 'danger'}`}
          >
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
        </span>
      </div>
      <div className="flex-grow-1">
        <div className="text-gray-800 fw-bold fs-6">{name}</div>
        <div className="text-gray-400 fw-semibold fs-7">{description}</div>
      </div>
      <span className={`badge badge-light-${active ? 'success' : 'danger'}`}>
        {active ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
}
