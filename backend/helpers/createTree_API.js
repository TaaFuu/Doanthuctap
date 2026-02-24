let count = 0;

const createTree = (arr, parentId = "") => {
  const tree = [];

  arr.forEach((item) => {
    // Vì parent_id là string nên so sánh trực tiếp
    if ((item.parent_id || "") === parentId) {
      count++;
      // nếu là mongoose document thì chuyển sang object thường
      const newItem = item._doc ? { ...item._doc } : { ...item };
      newItem.index = count;

      // đệ quy tìm danh mục con
      const children = createTree(arr, item._id.toString());
      if (children.length > 0) {
        newItem.children = children;
      }

      tree.push(newItem);
    }
  });

  return tree;
};

module.exports.tree = (arr, parentId = "") => {
  count = 0;
  return createTree(arr, parentId);
};
