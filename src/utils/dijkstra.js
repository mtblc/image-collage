/* eslint-disable */
/*
* The MIT License (MIT)

Copyright (c) 2015-2018 Sandra Gonzales
https://github.com/neptunian/react-photo-gallery/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
**/

import { BinaryHeap } from './binary-heap';

const buildPrecedentsMap = (graph, startNode, endNode) => {
  // store the previous vertex of the shortest path of arrival
  const precedentsMap = {};

  // store nodes already visited
  const visited = {};

  // store/update only the shortest edge weights measured
  // the purpose of this is object is constant time lookup vs. binary heap lookup O(n)
  const storedShortestPaths = {};
  storedShortestPaths[startNode] = 0;

  // priority queue of ALL nodes and storedShortestPaths
  // don't bother to delete them because it's faster to look at visited?
  const pQueue = new BinaryHeap(((n) => n.weight));
  pQueue.push({ id: startNode, weight: 0 });

  while (pQueue.size()) {
    // pop node with shortest total weight from start node
    const shortestNode = pQueue.pop();
    const shortestNodeId = shortestNode.id;

    // if already visited, continue
    if (visited[shortestNodeId]) continue;

    // visit neighboring nodes
    const neighboringNodes = graph(shortestNodeId) || {};
    visited[shortestNodeId] = 1;

    // meet the neighbors, looking for shorter paths
    for (const neighbor in neighboringNodes) {
      // weight of path from startNode to this neighbor
      const newTotalWeight = shortestNode.weight + neighboringNodes[neighbor];

      // if this is the first time meeting the neighbor OR if the new total weight from
      // start node to this neighbor node is greater than the old weight path, update it,
      // and update precedent node
      if (typeof storedShortestPaths[neighbor] === 'undefined' || storedShortestPaths[neighbor] > newTotalWeight) {
        storedShortestPaths[neighbor] = newTotalWeight;
        pQueue.push({ id: neighbor, weight: newTotalWeight });
        precedentsMap[neighbor] = shortestNodeId;
      }
    }
  }

  if (typeof storedShortestPaths[endNode] === 'undefined') {
    throw new Error(`There is no path from ${startNode} to ${endNode}`);
  }

  return precedentsMap;
};

// build the route from precedent node vertices
const getPathFromPrecedentsMap = (precedentsMap, endNode) => {
  const nodes = [];
  let n = endNode;
  let precedent;
  while (n) {
    nodes.push(n);
    precedent = precedentsMap[n];
    n = precedentsMap[n];
  }
  return nodes.reverse();
};

// build the precedentsMap and find the shortest path from it
export const findShortestPath = (graph, startNode, endNode) => {
  const precedentsMap = buildPrecedentsMap(graph, startNode, endNode);
  return getPathFromPrecedentsMap(precedentsMap, endNode);
};
