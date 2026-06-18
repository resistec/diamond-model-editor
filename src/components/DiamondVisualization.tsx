import React, { useRef } from "react";
import { User, ShieldAlert, Cpu, Network } from "lucide-react";
import { DiamondModel, DiamondNode, DiamondItem } from "../types";

interface DiamondVisualizationProps {
  model: DiamondModel;
  activeNodeTitle: "Adversary" | "Capability" | "Infrastructure" | "Victim";
  onSelectNode: (nodeTitle: "Adversary" | "Capability" | "Infrastructure" | "Victim") => void;
}

export default function DiamondVisualization({
  model,
  activeNodeTitle,
  onSelectNode,
}: DiamondVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to format item tree into a short readable list
  const renderItemSummaries = (items: DiamondItem[], depth = 0): React.ReactNode => {
    if (items.length === 0) {
      return <span className="opacity-40 italic text-[10px] font-mono">Empty Vertex</span>;
    }

    // Capture first few items to prevent card overflow
    const visibleItems = items.slice(0, 3);
    const hasMore = items.length > 3;

    return (
      <ul className="space-y-1 text-left w-full font-mono text-[10px] leading-tight text-black">
        {visibleItems.map((item, idx) => {
          const valueText = item.value.trim() ? item.value : "??";
          const labelPrefix =
            depth > 0 || idx > 0
              ? item.relation === "AND"
                ? "↳ AND "
                : "↳ OR "
              : "- ";

          return (
            <li key={item.id} className="truncate">
              <span className="font-bold opacity-60">
                {labelPrefix}
              </span>
              <span className="font-mono text-black font-medium" title={item.value}>
                {valueText}
              </span>
            </li>
          );
        })}
        {hasMore && (
          <li className="opacity-45 text-[9px] italic pl-2">
            + {items.length - 3} more items
          </li>
        )}
      </ul>
    );
  };

  const nodesInfo = [
    {
      title: "Adversary" as const,
      icon: <User className="h-3 w-3" />,
      node: model.adversary,
      positionClass: "left-1/2 -translate-x-1/2 top-4",
    },
    {
      title: "Capability" as const,
      icon: <Cpu className="h-3 w-3" />,
      node: model.capability,
      positionClass: "right-4 top-1/2 -translate-y-1/2",
    },
    {
      title: "Infrastructure" as const,
      icon: <Network className="h-3 w-3" />,
      node: model.infrastructure,
      positionClass: "left-4 top-1/2 -translate-y-1/2",
    },
    {
      title: "Victim" as const,
      icon: <ShieldAlert className="h-3 w-3" />,
      node: model.victim,
      positionClass: "left-1/2 -translate-x-1/2 bottom-4",
    },
  ];

  return (
    <div
      ref={containerRef}
      id="diamond-canvas-container"
      className="relative w-full aspect-square max-w-[550px] mx-auto bg-white border-2 border-black rounded-none p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] select-none overflow-hidden flex items-center justify-center min-h-[500px]"
    >
      {/* High Density Radial Grid Dot Background */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none" 
        style={{ 
          backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", 
          backgroundSize: "18px 18px" 
        }} 
      />

      {/* SVG Canvas for Diamond connecting paths */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <g stroke="currentColor" strokeWidth="0.6" className="text-black/20">
          {/* Main Diamond Perimeter lines */}
          <line x1="50" y1="20" x2="20" y2="50" className="stroke-black/30 stroke-[0.4]" />
          <line x1="50" y1="20" x2="80" y2="50" className="stroke-black/30 stroke-[0.4]" />
          <line x1="20" y1="50" x2="50" y2="80" className="stroke-black/30 stroke-[0.4]" />
          <line x1="80" y1="50" x2="50" y2="80" className="stroke-black/30 stroke-[0.4]" />

          {/* Social Axis (Adversary -> Victim) */}
          <line
            x1="50"
            y1="20"
            x2="50"
            y2="80"
            strokeDasharray="2,2"
            className="stroke-black/40 stroke-[0.5]"
          />

          {/* Technical Axis (Capability -> Infrastructure) */}
          <line
            x1="20"
            y1="50"
            x2="80"
            y2="50"
            strokeDasharray="2,2"
            className="stroke-black/40 stroke-[0.5]"
          />
        </g>
      </svg>

      {/* Central Axis Labels Overlaid on Canvas */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-25 font-mono text-[9px] uppercase font-black tracking-widest text-black">
        <span>Social-Political Axis</span>
        <div className="h-28 w-px bg-black my-2"></div>
        <span>Technical Axis</span>
      </div>

      {/* Interactive Vertex overlays */}
      {nodesInfo.map(({ title, icon, node, positionClass }) => {
        const isActive = activeNodeTitle === title;
        return (
          <button
            key={title}
            type="button"
            id={`vertex-card-${title.toLowerCase()}`}
            onClick={() => onSelectNode(title)}
            className={`absolute ${positionClass} w-[172px] bg-white border-2 border-black rounded-none text-left pointer-events-auto transition-all cursor-pointer ${
              isActive
                ? "scale-[1.04] z-20 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ring-[1.5px] ring-black"
                : "z-10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.01] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            {/* Header: Dark banner block matching theme instructions exactly */}
            <div className="bg-black text-white p-1.5 px-2 flex justify-between items-center font-mono">
              <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-tight">
                {icon}
                <span>{title}</span>
              </span>
              <span className="text-[8px] font-bold border border-white px-1 leading-normal">
                {node.isInclusive ? "INCLUSIVE" : "EXCLUSIVE"}
              </span>
            </div>

            {/* Content (Active threat items) */}
            <div className="p-2.5 w-full bg-white shrink-0 min-h-[46px] max-h-32 overflow-y-auto">
              {renderItemSummaries(node.items)}
            </div>

            {/* Bottom active state indicator */}
            <div className="px-2 py-0.5 border-t border-black bg-neutral-50 flex items-center justify-between text-[8px] font-mono tracking-widest uppercase opacity-60">
              <span>Vertex</span>
              <span className="font-bold">{isActive ? "ACTIVE PANE" : "EDIT ✎"}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
