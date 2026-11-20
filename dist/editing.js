function disconnectProjectInput(project, nodeId, key) {
 const node = project.nodes.find(item => item.id === nodeId);
 if (!node || !fields(node).some(field => field.key === key && field.type === 'pch')) return false;
 node.values[key] = 0;
 if(node.wireRoutes)delete node.wireRoutes[key];
 if(node.links)delete node.links[key];
 node.disconnected = [...new Set([...(node.disconnected || []), key])];
 return true;
}

function removeProjectNode(project, nodeId) {
 const node = project.nodes.find(item => item.id === nodeId);
 if (!node) return false;
 const removed = new Set(outputs(node));
 if (node.kind === 'block') removed.add(255 + node.slot);
 project.nodes = project.nodes.filter(item => item.id !== nodeId);
 syncReferences(project);
 for (const item of project.nodes) {
  for (const field of fields(item)) {
   if (field.type === 'pch' && (item.links?.[field.key]?.id===nodeId ||
    (!item.links?.[field.key] && !isReference(node) && removed.has(item.values[field.key])))) {
    disconnectProjectInput(project, item.id, field.key);
   }
  }
 }
 return true;
}
