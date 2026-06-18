import { DiamondItem } from "../types";

/**
 * Update property of an item in a recursive items tree.
 */
export function updateItemInTree(
  items: DiamondItem[],
  id: string,
  updates: Partial<Omit<DiamondItem, "id" | "children">>
): DiamondItem[] {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: updateItemInTree(item.children, id, updates),
      };
    }
    return item;
  });
}

/**
 * Add a child item under a specific parent item in the tree.
 */
export function addChildToItemInTree(
  items: DiamondItem[],
  parentId: string,
  newItem: DiamondItem
): DiamondItem[] {
  return items.map((item) => {
    if (item.id === parentId) {
      return {
        ...item,
        children: [...(item.children || []), newItem],
      };
    }
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: addChildToItemInTree(item.children, parentId, newItem),
      };
    }
    return item;
  });
}

/**
 * Delete an item and all of its descendants from the tree.
 */
export function deleteItemFromTree(
  items: DiamondItem[],
  id: string
): DiamondItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: deleteItemFromTree(item.children, id),
        };
      }
      return item;
    });
}

/**
 * Check if a list of items is empty or if all items in it have empty values.
 */
export function isTreeEmptyOrBlank(items: DiamondItem[]): boolean {
  if (items.length === 0) return true;
  return items.every((item) => !item.value.trim() && isTreeEmptyOrBlank(item.children));
}

/**
 * Count total number of items in a tree recursively.
 */
export function countTreeItems(items: DiamondItem[]): number {
  let count = 0;
  for (const item of items) {
    count += 1;
    if (item.children && item.children.length > 0) {
      count += countTreeItems(item.children);
    }
  }
  return count;
}
