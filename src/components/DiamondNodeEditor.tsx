import { useId, useState, useEffect } from "react";
import { Plus, Trash, CornerDownRight, HelpCircle, Shuffle, GripVertical, CornerUpLeft } from "lucide-react";
import { DiamondNode, DiamondItem } from "../types";

// Refactored recursive sub-component defined cleanly outside of the Parent module.
// This prevents React from rebuilding the functional component on every single state change,
// guaranteeing perfect cursor/input focus retention while solving the key compilation error!
interface RenderItemNodeProps {
  key?: string;
  item: DiamondItem;
  depth: number;
  index: number;
  parentSiblingCount: number;
  onUpdateItem: (id: string, field: "value" | "relation" | "ltiv", newValue: string) => void;
  onAddChild: (id: string) => void;
  onDeleteItem: (id: string) => void;
  defaultLtiv: string;
  mitreTTPs: { id: string; name: string; description: string }[];
  nodeTitle: string;
  draggedId: string | null;
  dragOverId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  setDragOverId: (id: string | null) => void;
  onDropItem: (srcId: string, targetId: string) => void;
  onOutdentItem: (id: string) => void;
}

function RenderItemNode({
  item,
  depth,
  index,
  parentSiblingCount,
  onUpdateItem,
  onAddChild,
  onDeleteItem,
  defaultLtiv,
  mitreTTPs,
  nodeTitle,
  draggedId,
  dragOverId,
  onDragStart,
  onDragEnd,
  setDragOverId,
  onDropItem,
  onOutdentItem,
}: RenderItemNodeProps) {
  const showRelationSelector = !(depth === 0 && index === 0);
  const selectId = useId();
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter local state based on the current user typing
  const getFilteredSuggestions = () => {
    if (!item.value.trim() || !mitreTTPs) return [];
    const searchVal = item.value.toLowerCase().trim();
    return mitreTTPs
      .filter(
        (ttp) =>
          ttp.id.toLowerCase().includes(searchVal) ||
          ttp.name.toLowerCase().includes(searchVal)
      )
      .slice(0, 8); // Display at most 8 matching suggestions to fit neat UI
  };

  const suggestions = nodeTitle === "Capability" ? getFilteredSuggestions() : [];

  const handleSelectSuggestion = (ttp: { id: string; name: string }) => {
    onUpdateItem(item.id, "value", `${ttp.id}: ${ttp.name}`);
    setShowSuggestions(false);
  };

  return (
    <div className="relative mt-3">
      {/* Connection guide line */}
      {depth > 0 && (
        <div 
          className="absolute -left-4 top-5 w-4 border-t-2 border-dashed border-black"
          style={{ height: "1px" }}
        />
      )}

      <div 
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", item.id);
          onDragStart(item.id);
        }}
        onDragEnd={() => {
          onDragEnd();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (draggedId && draggedId !== item.id) {
            setDragOverId(item.id);
          }
        }}
        onDragLeave={() => {
          if (dragOverId === item.id) {
            setDragOverId(null);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          const sourceId = e.dataTransfer.getData("text/plain") || draggedId;
          setDragOverId(null);
          if (sourceId && sourceId !== item.id) {
            onDropItem(sourceId, item.id);
          }
        }}
        className={`flex flex-wrap items-center gap-2 bg-white p-2 rounded-none transition-all duration-150 ${
          draggedId === item.id
            ? "opacity-30 border-2 border-dashed border-neutral-400 shadow-none"
            : dragOverId === item.id
              ? "border-2 border-dashed border-black bg-neutral-50 scale-[1.01] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              : "border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:border-black/70"
        }`}
      >
        {/* Drag handle */}
        <div 
          className="cursor-grab active:cursor-grabbing p-1 text-black opacity-40 hover:opacity-100 flex items-center justify-center shrink-0"
          title="Drag and drop to reorder or nest indicators"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Relation Selector (AND/OR Prefix) */}
        {showRelationSelector && (
          <div className="flex items-center">
            <label htmlFor={selectId} className="sr-only">Relation prefix</label>
            <select
              id={selectId}
              value={item.relation === "NONE" ? "OR" : item.relation}
              onChange={(e) => onUpdateItem(item.id, "relation", e.target.value)}
              className="rounded-none border border-black bg-white px-2 py-1 text-xs font-mono font-black uppercase text-black focus:outline-none"
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </div>
        )}

        {depth === 0 && index === 0 && (
          <span className="px-2 py-1 text-[9px] font-mono font-black uppercase bg-black text-white rounded-none">
            ROOT VERTEX INDICATOR
          </span>
        )}

        {/* IOC Value Input with Autocomplete */}
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder={
              nodeTitle === "Capability"
                ? "Type MITRE TTP (e.g., T1059, TA0043, T1059.001)..."
                : depth > 0 
                  ? "e.g. nested detail (value/regex)..." 
                  : "e.g. 192.168.1.1, malware_sig..."
            }
            value={item.value}
            onChange={(e) => {
              onUpdateItem(item.id, "value", e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
            className="w-full rounded-none border border-black px-3 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black"
          />

          {/* Autocomplete suggestions dropdown menu */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 divide-y divide-neutral-250">
              <div className="bg-black text-white text-[8px] font-mono font-bold px-2 py-1 uppercase tracking-wider sticky top-0 flex items-center justify-between">
                <span>MITRE ATT&CK SUGGESTIONS</span>
                <span className="opacity-70">{suggestions.length} MATCHES</span>
              </div>
              {suggestions.map((ttp) => (
                <button
                  key={ttp.id}
                  type="button"
                  onMouseDown={() => handleSelectSuggestion(ttp)}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-100 font-mono transition-colors focus:outline-none focus:bg-neutral-100 flex flex-col gap-0.5 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[10px] text-black">
                      {ttp.id}
                    </span>
                    <span className="text-[8px] font-mono font-black uppercase text-neutral-800 bg-neutral-100 px-1 border border-black shrink-0">
                      TTP ID
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-900 font-bold leading-tight line-clamp-1">
                    {ttp.name}
                  </div>
                  {ttp.description && (
                    <div className="text-[8px] text-neutral-500 line-clamp-1 leading-snug">
                      {ttp.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LTIV Tag/Input */}
        <div className="flex items-center gap-1 border border-black bg-neutral-100 px-1.5 py-0.5 text-[9px] font-mono tracking-wider shrink-0">
          <span className="font-black text-black opacity-60">LTIV:</span>
          <input
            type="date"
            value={item.ltiv || defaultLtiv}
            onChange={(e) => onUpdateItem(item.id, "ltiv", e.target.value)}
            title="Last Time of Intelligence Value"
            className="bg-transparent border-none p-0 text-[10px] font-bold text-black focus:outline-none focus:ring-0 w-[110px] cursor-pointer"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {depth > 0 && (
            <button
              type="button"
              onClick={() => onOutdentItem(item.id)}
              title="Move nested item back a nest (outdent)"
              className="p-1 px-2 border border-black bg-white text-black hover:bg-black hover:text-white rounded-none flex items-center gap-0.5 text-xs font-bold cursor-pointer transition-colors"
            >
              <CornerUpLeft className="h-3 w-3" />
              <span className="uppercase text-[10px]">Move Back</span>
            </button>
          )}

          <button
            type="button"
            id={`add-child-btn-${item.id}`}
            onClick={() => onAddChild(item.id)}
            title="Nest high-resolution detail below this"
            className="p-1 px-2 border border-black bg-white text-black hover:bg-black hover:text-white rounded-none flex items-center gap-0.5 text-xs font-bold cursor-pointer transition-colors"
          >
            <CornerDownRight className="h-3 w-3" />
            <span className="uppercase text-[10px]">Nest</span>
          </button>

          <button
            type="button"
            id={`delete-btn-${item.id}`}
            onClick={() => onDeleteItem(item.id)}
            title="Delete item and nested children"
            className="p-1 border border-black bg-white hover:bg-rose-650 hover:text-white rounded-none cursor-pointer text-black transition-all"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Render child elements recursively */}
      {item.children && item.children.length > 0 && (
        <div className="pl-6 border-l-2 border-dashed border-black ml-4.5 mt-1 relative">
          {item.children.map((child, idx) => (
            <RenderItemNode
              key={child.id}
              item={child}
              depth={depth + 1}
              index={idx}
              parentSiblingCount={item.children.length}
              onUpdateItem={onUpdateItem}
              onAddChild={onAddChild}
              onDeleteItem={onDeleteItem}
              defaultLtiv={defaultLtiv}
              mitreTTPs={mitreTTPs}
              nodeTitle={nodeTitle}
              draggedId={draggedId}
              dragOverId={dragOverId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              setDragOverId={setDragOverId}
              onDropItem={onDropItem}
              onOutdentItem={onOutdentItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DiamondNodeEditorProps {
  node: DiamondNode;
  onNodeChange: (updatedNode: DiamondNode) => void;
  onActiveNodeChange: (nodeTitle: "Adversary" | "Capability" | "Infrastructure" | "Victim") => void;
  modelCreationDate?: string;
}

export default function DiamondNodeEditor({
  node,
  onNodeChange,
  onActiveNodeChange,
  modelCreationDate,
}: DiamondNodeEditorProps) {
  const currentTitle = node.title;
  const [mitreTTPs, setMitreTTPs] = useState<{ id: string; name: string; description: string }[]>([]);
  
  // Drag and drop local state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mitre-ttp")
      .then((res) => {
        if (!res.ok) throw new Error("Network status code failed");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMitreTTPs(data);
        }
      })
      .catch((err) => {
        console.warn("Could not query MITRE TTPs API feed, utilizing client-side subsets:", err);
      });
  }, []);

  const getDefaultLtiv = () => {
    const originDateStr = modelCreationDate || new Date().toISOString().split("T")[0];
    try {
      const date = new Date(originDateStr);
      if (!isNaN(date.getTime())) {
        date.setFullYear(date.getFullYear() + 1);
        return date.toISOString().split("T")[0];
      }
    } catch (_) {}
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split("T")[0];
  };

  // Helper to remove an item recursively
  const removeItemFromTree = (items: DiamondItem[], targetId: string): { removed: DiamondItem | null; newItems: DiamondItem[] } => {
    let removed: DiamondItem | null = null;
    const filter = (list: DiamondItem[]): DiamondItem[] => {
      const nextList: DiamondItem[] = [];
      for (const item of list) {
        if (item.id === targetId) {
          removed = item;
        } else {
          nextList.push({
            ...item,
            children: item.children ? filter(item.children) : []
          });
        }
      }
      return nextList;
    };
    const newItems = filter(items);
    return { removed, newItems };
  };

  // Helper to insert an item recursively
  const insertItemInTree = (
    items: DiamondItem[],
    targetId: string,
    itemToInsert: DiamondItem,
    position: "before" | "after"
  ): DiamondItem[] => {
    const insert = (list: DiamondItem[]): DiamondItem[] => {
      const nextList: DiamondItem[] = [];
      for (const item of list) {
        if (item.id === targetId) {
          if (position === "before") {
            nextList.push(itemToInsert);
            nextList.push(item);
          } else {
            nextList.push(item);
            nextList.push(itemToInsert);
          }
        } else {
          nextList.push({
            ...item,
            children: item.children ? insert(item.children) : []
          });
        }
      }
      return nextList;
    };
    return insert(items);
  };

  // Drag and drop event handlers
  const handleDropItem = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    // Remove sourceId and insert right after targetId
    const { removed, newItems } = removeItemFromTree(node.items, sourceId);
    if (!removed) return;

    const updated = insertItemInTree(newItems, targetId, removed, "after");

    // Adjust first root node relation to be NONE if we moved things
    if (updated.length > 0 && updated[0].relation !== "NONE") {
      updated[0].relation = "NONE";
    }

    onNodeChange({
      ...node,
      items: updated
    });
  };

  // Outdent (move nested item back a nest) recursive handler
  const findParentAndOutdent = (
    list: DiamondItem[],
    idToOutdent: string
  ): { list: DiamondItem[]; outdented: DiamondItem | null; inserted: boolean } => {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (item.children && item.children.some((child) => child.id === idToOutdent)) {
        const targetChild = item.children.find((child) => child.id === idToOutdent)!;
        const updatedParent = {
          ...item,
          children: item.children.filter((child) => child.id !== idToOutdent)
        };
        const newList = [...list];
        newList[i] = updatedParent;
        if (targetChild.relation === "NONE") {
          targetChild.relation = "OR";
        }
        newList.splice(i + 1, 0, targetChild);
        return { list: newList, outdented: targetChild, inserted: true };
      }
    }
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (item.children && item.children.length > 0) {
        const result = findParentAndOutdent(item.children, idToOutdent);
        if (result.outdented) {
          const updatedItem = {
            ...item,
            children: result.list
          };
          const newList = [...list];
          newList[i] = updatedItem;
          return { list: newList, outdented: result.outdented, inserted: result.inserted };
        }
      }
    }
    return { list, outdented: null, inserted: false };
  };

  const handleOutdentItem = (idToOutdent: string) => {
    const { list, inserted } = findParentAndOutdent(node.items, idToOutdent);
    if (inserted) {
      if (list.length > 0 && list[0].relation !== "NONE") {
        list[0].relation = "NONE";
      }
      onNodeChange({
        ...node,
        items: list
      });
    }
  };

  // Add a brand-new main level (root) item to the node
  const handleAddRootItem = () => {
    const newItem: DiamondItem = {
      id: Math.random().toString(36).substring(2, 9),
      value: "",
      relation: node.items.length === 0 ? "NONE" : "OR", // First root is NONE, next are default OR
      children: [],
      ltiv: getDefaultLtiv(),
    };
    onNodeChange({
      ...node,
      items: [...node.items, newItem],
    });
  };

  // Generic modification helper
  const updateItem = (
    items: DiamondItem[],
    id: string,
    field: "value" | "relation" | "ltiv",
    newValue: string
  ): DiamondItem[] => {
    return items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: newValue };
      }
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: updateItem(item.children, id, field, newValue),
        };
      }
      return item;
    });
  };

  const handleUpdateItem = (id: string, field: "value" | "relation" | "ltiv", newValue: string) => {
    onNodeChange({
      ...node,
      items: updateItem(node.items, id, field, newValue),
    });
  };

  // Add a child item under a specific parent item
  const addChild = (items: DiamondItem[], parentId: string, newItem: DiamondItem): DiamondItem[] => {
    return items.map((item) => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...item.children, newItem],
        };
      }
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: addChild(item.children, parentId, newItem),
        };
      }
      return item;
    });
  };

  const handleAddChild = (parentId: string) => {
    const newItem: DiamondItem = {
      id: Math.random().toString(36).substring(2, 9),
      value: "",
      relation: "OR", // Sub-items default to OR
      children: [],
      ltiv: getDefaultLtiv(),
    };
    onNodeChange({
      ...node,
      items: addChild(node.items, parentId, newItem),
    });
  };

  // Delete an item
  const deleteFromTree = (items: DiamondItem[], id: string): DiamondItem[] => {
    return items
      .filter((item) => item.id !== id)
      .map((item) => {
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: deleteFromTree(item.children, id),
          };
        }
        return item;
      });
  };

  const handleDeleteItem = (id: string) => {
    const filtered = deleteFromTree(node.items, id);
    // Fix first outer root node relation to be NONE if they delete the first one and others remain
    if (filtered.length > 0 && filtered[0].relation !== "NONE") {
      filtered[0].relation = "NONE";
    }
    onNodeChange({
      ...node,
      items: filtered,
    });
  };

  // Toggle node isInclusive attribute
  const handleToggleInclusive = () => {
    onNodeChange({
      ...node,
      isInclusive: !node.isInclusive,
    });
  };

  // Count items recursively
  const countAll = (items: DiamondItem[]): number => {
    let count = 0;
    for (const item of items) {
      count++;
      count += countAll(item.children);
    }
    return count;
  };
  const totalItemsCount = countAll(node.items);

  return (
    <div className="flex flex-col h-full bg-white rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      
      {/* Node selector tabs on the editor itself */}
      <div className="border-b-2 border-black bg-neutral-100 p-1 flex gap-1 overflow-x-auto">
        {(["Adversary", "Capability", "Infrastructure", "Victim"] as const).map((t) => {
          const isActive = t === currentTitle;
          return (
            <button
              key={t}
              onClick={() => onActiveNodeChange(t)}
              className={`flex-1 min-w-[90px] py-1.5 px-3 text-[10px] font-mono font-bold uppercase border border-black rounded-none transition-all cursor-pointer ${
                isActive
                  ? "bg-black text-white shadow-none"
                  : "bg-white text-black hover:bg-black hover:text-white"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Node Editor Title Block */}
      <div className="p-4 sm:p-5 border-b border-black flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="border-l-[6px] border-black pl-3 py-0.5">
          <h2 className="text-base font-black tracking-widest uppercase text-black leading-none">
            {currentTitle} LOGICAL TREE
          </h2>
          <p className="text-[10px] text-black/60 mt-1.5 font-mono">
            Define indicators, sub-IOC conditions, and constraints.
          </p>
        </div>

        {/* INCLUSIVE / EXCLUSIVE Toggle - Field next to the node title */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase font-bold opacity-60">Vertex Logic:</span>
          <button
            onClick={handleToggleInclusive}
            type="button"
            className={`cursor-pointer px-2.5 py-1 border border-black rounded-none text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              node.isInclusive
                ? "bg-white text-black hover:bg-neutral-100"
                : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            <Shuffle className="h-3 w-3" />
            <span>
              {node.isInclusive ? "INCLUSIVE" : "EXCLUSIVE"}
            </span>
          </button>
        </div>
      </div>

      {/* Editor Main Section */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        
        {/* Node Logic Explanation Banner */}
        <div className="mb-5 flex gap-2.5 border border-black bg-neutral-50 p-3 text-[11px] text-black leading-normal font-mono">
          <HelpCircle className="h-4 w-4 shrink-0 mt-0.5 text-black" />
          <div>
            <span className="font-bold">
              {node.isInclusive ? "INCLUSIVE VERTEX TYPE:" : "EXCLUSIVE VERTEX TYPE:"}
            </span>{" "}
            {node.isInclusive
              ? "other items can be added to this vertex of the threat definition"
              : "no other items can be added to this vertex of the threat definition"}
          </div>
        </div>

        {/* List of items */}
        {node.items.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-black rounded-none px-4 bg-neutral-50">
            <p className="text-xs text-black opacity-60 font-mono uppercase tracking-wider">No IOC elements configured for this vertex.</p>
            <p className="text-[10px] text-black opacity-40 mt-1 uppercase font-mono">Add elements and branches to construct the tree.</p>
            <button
              onClick={handleAddRootItem}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-widest rounded-none cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Define First Item</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-black pb-1">
              <span className="text-[10px] font-mono font-black text-black uppercase tracking-widest">
                Nodes and Subnodes ({totalItemsCount} total)
              </span>
              <button
                onClick={handleAddRootItem}
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-black hover:underline cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Add Root Element</span>
              </button>
            </div>

            <div className="p-1">
              {node.items.map((item, idx) => (
                <RenderItemNode
                  key={item.id}
                  item={item}
                  depth={0}
                  index={idx}
                  parentSiblingCount={node.items.length}
                  onUpdateItem={handleUpdateItem}
                  onAddChild={handleAddChild}
                  onDeleteItem={handleDeleteItem}
                  defaultLtiv={getDefaultLtiv()}
                  mitreTTPs={mitreTTPs}
                  nodeTitle={currentTitle}
                  draggedId={draggedId}
                  dragOverId={dragOverId}
                  onDragStart={setDraggedId}
                  onDragEnd={() => setDraggedId(null)}
                  setDragOverId={setDragOverId}
                  onDropItem={handleDropItem}
                  onOutdentItem={handleOutdentItem}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Addition panel of the Node Editor */}
      {node.items.length > 0 && (
        <div className="p-4 border-t border-black bg-neutral-50 flex justify-end">
          <button
            onClick={handleAddRootItem}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest border border-black hover:bg-white hover:text-black rounded-none cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Element</span>
          </button>
        </div>
      )}
    </div>
  );
}
