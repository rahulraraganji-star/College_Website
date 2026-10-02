// Helper to build recursive tree from flat nodes with parentId / parent
export const buildOrganogramTree = (nodes = []) => {
  if (!Array.isArray(nodes) || nodes.length === 0) return [];

  const nodeMap = new Map();
  const tree = [];

  nodes.forEach((node) => {
    const id = String(node.id || node._id);
    nodeMap.set(id, {
      ...node,
      _id: id,
      id,
      children: [],
    });
  });

  nodes.forEach((node) => {
    const id = String(node.id || node._id);
    const parentId = node.parentId
      ? String(node.parentId)
      : node.parent?._id
      ? String(node.parent._id)
      : node.parent
      ? String(node.parent)
      : null;

    const current = nodeMap.get(id);
    if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId).children.push(current);
    } else {
      tree.push(current);
    }
  });

  const sortNodes = (list) => {
    list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    list.forEach((item) => {
      if (item.children?.length > 0) {
        sortNodes(item.children);
      }
    });
  };

  sortNodes(tree);
  return tree;
};

// Safe conversion of legacy department / faculty list to hierarchical nodes
export const migrateDepartmentsToNodes = (departments = []) => {
  if (!Array.isArray(departments) || departments.length === 0) return [];
  const nodes = [];
  let orderCounter = 0;

  departments.forEach((dept, deptIdx) => {
    const deptId = dept.id || `dept_${deptIdx}_${Date.now()}`;
    nodes.push({
      id: deptId,
      parentId: null,
      name: dept.name || `Department ${deptIdx + 1}`,
      designation: "Department Head / Unit Lead",
      department: dept.name || "",
      order: orderCounter++,
      isActive: true,
    });

    if (Array.isArray(dept.members)) {
      dept.members.forEach((m, memIdx) => {
        nodes.push({
          id: m.id || `member_${deptIdx}_${memIdx}_${Date.now()}`,
          parentId: deptId,
          name: m.name || "Faculty Member",
          designation: m.designation || "Faculty",
          department: dept.name || "",
          photo: m.media || m.photo || null,
          email: m.email || "",
          phone: m.phone || "",
          bio: m.bio || "",
          order: memIdx,
          isActive: true,
        });
      });
    }
  });

  return nodes;
};
