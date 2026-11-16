import { Node, Edge } from '@xyflow/react';
import { AgentNodeData } from '../types';

export function calculateAutoLayout(
  nodes: Node<AgentNodeData>[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
): Node<AgentNodeData>[] {
  const nodeWidth = 330;
  const nodeHeight = 260;
  const xSpacing = 120;
  const ySpacing = 80;

  // Build adjacency list & in-degree map
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  });

  edges.forEach((e) => {
    if (adj[e.source]) {
      adj[e.source].push(e.target);
    }
    if (inDegree[e.target] !== undefined) {
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    }
  });

  // Topological layer assignment
  const levels: Record<string, number> = {};
  const queue: string[] = [];

  // Find root nodes (inDegree === 0)
  nodes.forEach((n) => {
    if (inDegree[n.id] === 0) {
      queue.push(n.id);
      levels[n.id] = 0;
    }
  });

  // If cyclic or no 0-indegree, fallback first node as root
  if (queue.length === 0 && nodes.length > 0) {
    queue.push(nodes[0].id);
    levels[nodes[0].id] = 0;
  }

  const visited = new Set<string>();

  while (queue.length > 0) {
    const currId = queue.shift()!;
    visited.add(currId);
    const currLevel = levels[currId] || 0;

    const neighbors = adj[currId] || [];
    for (const nxt of neighbors) {
      if (!visited.has(nxt)) {
        levels[nxt] = Math.max(levels[nxt] || 0, currLevel + 1);
        queue.push(nxt);
      }
    }
  }

  // Assign any unvisited nodes to level 0
  nodes.forEach((n) => {
    if (levels[n.id] === undefined) {
      levels[n.id] = 0;
    }
  });

  // Group nodes by level
  const levelGroups: Record<number, Node<AgentNodeData>[]> = {};
  nodes.forEach((n) => {
    const lvl = levels[n.id] || 0;
    if (!levelGroups[lvl]) levelGroups[lvl] = [];
    levelGroups[lvl].push(n);
  });

  const sortedLevels = Object.keys(levelGroups)
    .map(Number)
    .sort((a, b) => a - b);

  return nodes.map((n) => {
    const lvl = levels[n.id] || 0;
    const group = levelGroups[lvl] || [n];
    const indexInGroup = group.findIndex((item) => item.id === n.id);
    const totalInGroup = group.length;

    let posX = 60;
    let posY = 60;

    if (direction === 'LR') {
      posX = 60 + lvl * (nodeWidth + xSpacing);
      const groupHeight = totalInGroup * nodeHeight + (totalInGroup - 1) * ySpacing;
      const startY = Math.max(60, 300 - groupHeight / 2);
      posY = startY + indexInGroup * (nodeHeight + ySpacing);
    } else {
      posY = 60 + lvl * (nodeHeight + ySpacing);
      const groupWidth = totalInGroup * nodeWidth + (totalInGroup - 1) * xSpacing;
      const startX = Math.max(60, 400 - groupWidth / 2);
      posX = startX + indexInGroup * (nodeWidth + xSpacing);
    }

    return {
      ...n,
      position: { x: posX, y: posY },
    };
  });
}
