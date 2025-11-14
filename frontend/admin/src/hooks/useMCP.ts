/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🔗 MCP HOOK - Model Context Protocol integration                        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { mcp } from '@services/mcp';
import type { MCPConnection, MCPResource } from '@types';

export function useMCP() {
  const [connections, setConnections] = useState<string[]>([]);

  useEffect(() => {
    setConnections(mcp.listConnections());
  }, []);

  const healthCheck = useQuery({
    queryKey: ['mcp', 'health'],
    queryFn: () => mcp.healthCheckAll(),
    refetchInterval: 60000, // Every minute
  });

  const readResource = useMutation({
    mutationFn: ({ resource, connectionId }: { resource: MCPResource; connectionId?: string }) =>
      mcp.read(resource, connectionId),
  });

  const createResource = useMutation({
    mutationFn: ({ resource, connectionId }: { resource: MCPResource; connectionId?: string }) =>
      mcp.create(resource, connectionId),
  });

  const updateResource = useMutation({
    mutationFn: ({
      collection,
      id,
      data,
      connectionId,
    }: {
      collection: string;
      id: string;
      data: any;
      connectionId?: string;
    }) => mcp.update(collection, id, data, connectionId),
  });

  const deleteResource = useMutation({
    mutationFn: ({
      collection,
      id,
      connectionId,
    }: {
      collection: string;
      id: string;
      connectionId?: string;
    }) => mcp.delete(collection, id, connectionId),
  });

  const syncResources = useMutation({
    mutationFn: ({
      sourceConnectionId,
      targetConnectionId,
      collections,
    }: {
      sourceConnectionId: string;
      targetConnectionId: string;
      collections: string[];
    }) => mcp.sync(sourceConnectionId, targetConnectionId, collections),
  });

  return {
    connections,
    healthCheck: healthCheck.data,
    isHealthy: healthCheck.isSuccess,
    readResource,
    createResource,
    updateResource,
    deleteResource,
    syncResources,
  };
}

export function useMCPSubscription(collection: string, callback: (data: any) => void) {
  useEffect(() => {
    const unsubscribe = mcp.subscribe(collection, callback);
    return () => unsubscribe();
  }, [collection, callback]);
}
