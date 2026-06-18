import { useState } from "react";
import { Save, FileCheck, Send, Image, FileText, Table, FileJson, ArrowLeftRight, Shield } from "lucide-react";
import { DiamondModel, DiamondNode } from "../types";
import DiamondVisualization from "./DiamondVisualization";
import DiamondNodeEditor from "./DiamondNodeEditor";
import { exportToJSON, exportToCSV, exportToPNG, exportToPDF, exportToSTIX } from "../utils/exportUtils";

interface EditorPageProps {
  model: DiamondModel;
  onModelChange: (updated: DiamondModel) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  saveStatus: "idle" | "success" | "error";
  onLoadFromProjectsList: () => void;
}

export default function EditorPage({
  model,
  onModelChange,
  onSave,
  isSaving,
  saveStatus,
  onLoadFromProjectsList,
}: EditorPageProps) {
  // Local state to track which of the four nodes is currently focused for editing
  const [activeNode, setActiveNode] = useState<"Adversary" | "Capability" | "Infrastructure" | "Victim">("Adversary");

  // Get active node object
  const getActiveNodeObject = (): DiamondNode => {
    switch (activeNode) {
      case "Adversary":
        return model.adversary;
      case "Capability":
        return model.capability;
      case "Infrastructure":
        return model.infrastructure;
      case "Victim":
        return model.victim;
    }
  };

  const handleActiveNodeChange = (updatedNode: DiamondNode) => {
    const fieldMapping = {
      Adversary: "adversary",
      Capability: "capability",
      Infrastructure: "infrastructure",
      Victim: "victim",
    } as const;

    const key = fieldMapping[updatedNode.title];
    onModelChange({
      ...model,
      [key]: updatedNode,
    });
  };

  const handleMetaChange = (field: "title" | "creationDate" | "expirationDate", value: string) => {
    onModelChange({
      ...model,
      [field]: value,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      
      {/* Upper header section with Title inputs and Action controls */}
      <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex-1 space-y-4">
          {/* Main Name Input field */}
          <div>
            <label htmlFor="campaign-title-input" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-black opacity-80 mb-1">
              Campaign / Action Title
            </label>
            <input
              id="campaign-title-input"
              type="text"
              placeholder="e.g. APT-29-SOLARWINDS-V2"
              value={model.title}
              onChange={(e) => handleMetaChange("title", e.target.value)}
              className="w-full text-sm font-bold bg-white border border-black rounded-none px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
            />
            <p className="text-[9px] font-mono opacity-50 mt-1">
              * Leave empty to auto-append the current date and time on save.
            </p>
          </div>

          {/* Creation & Expiration Calendars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="creation-date-input" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-black opacity-80 mb-1">
                Creation Date
              </label>
              <input
                id="creation-date-input"
                type="date"
                value={model.creationDate}
                onChange={(e) => handleMetaChange("creationDate", e.target.value)}
                className="w-full text-xs font-bold bg-white border border-black rounded-none px-3 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="expiration-date-input" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-black opacity-80 mb-1">
                Expiration Date
              </label>
              <input
                id="expiration-date-input"
                type="date"
                value={model.expirationDate}
                onChange={(e) => handleMetaChange("expirationDate", e.target.value)}
                className="w-full text-xs font-bold bg-white border border-black rounded-none px-3 py-1.5 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Database Save trigger controls */}
        <div className="md:border-l border-black md:pl-6 shrink-0 flex flex-col justify-center space-y-2.5 min-w-[190px]">
          <button
            onClick={onSave}
            disabled={isSaving}
            id="save-campaign-btn"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white hover:bg-white hover:text-black border border-black disabled:bg-zinc-200 disabled:text-zinc-500 disabled:border-zinc-300 text-xs font-bold uppercase tracking-widest rounded-none shadow-sm transition-colors cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border border-zinc-450 border-t-black" />
                <span>Saving to Disk...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Project</span>
              </>
            )}
          </button>

          {saveStatus === "success" && (
            <p className="text-[9px] bg-black text-white py-1 px-2 font-mono text-center flex items-center justify-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5 text-green-400 inline shrink-0" />
              <span className="font-bold">ALL CHANGES SYNCED</span>
            </p>
          )}
          {saveStatus === "error" && (
            <p className="text-[9px] bg-red-650 text-white py-1 px-2 font-mono text-center font-bold">
              ✖ DISK EXCEPTION ENCOUNTERED
            </p>
          )}

          <button
            onClick={onLoadFromProjectsList}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-black text-black bg-white hover:bg-black hover:text-white text-xs font-bold uppercase tracking-widest rounded-none cursor-pointer transition-colors"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>Load Workspace</span>
          </button>
        </div>
      </div>

      {/* Main split-pane content: Grid matching Left (visualizer) and Right (tree list editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: SVG visualizer and export controllers (col span 5) */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6 flex flex-col items-center">
          
          <div className="w-full">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-black border-b border-black pb-1 mb-2">
              Interactive Model Visualization
            </h3>
            <DiamondVisualization
              model={model}
              activeNodeTitle={activeNode}
              onSelectNode={setActiveNode}
            />
          </div>

          {/* Export controller options box */}
          <div className="w-full bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-black border-b border-black pb-1.5">
              Export Control Panel
            </h4>
            
            <div className="grid grid-cols-2 gap-2.5">
              {/* Export PNG */}
              <button
                type="button"
                id="export-png-btn"
                onClick={() => exportToPNG("diamond-canvas-container", model.title)}
                className="flex items-center gap-2 p-2 border border-black bg-white hover:bg-black hover:text-white text-[10px] font-bold rounded-none cursor-pointer group transition-all"
              >
                <Image className="h-4 w-4 shrink-0 transition-colors" />
                <div className="text-left leading-tight">
                  <div className="font-bold uppercase tracking-wider">PNG Image</div>
                  <div className="text-[8px] font-mono opacity-60">DIAGRAM GRAPHIC</div>
                </div>
              </button>

              {/* Export PDF */}
              <button
                type="button"
                id="export-pdf-btn"
                onClick={() => exportToPDF(model)}
                className="flex items-center gap-2 p-2 border border-black bg-white hover:bg-black hover:text-white text-[10px] font-bold rounded-none cursor-pointer group transition-all"
              >
                <FileText className="h-4 w-4 shrink-0 transition-colors" />
                <div className="text-left leading-tight">
                  <div className="font-bold uppercase tracking-wider">PDF Briefing</div>
                  <div className="text-[8px] font-mono opacity-60">INTEL REPORT</div>
                </div>
              </button>

              {/* Export CSV */}
              <button
                type="button"
                id="export-csv-btn"
                onClick={() => exportToCSV(model)}
                className="flex items-center gap-2 p-2 border border-black bg-white hover:bg-black hover:text-white text-[10px] font-bold rounded-none cursor-pointer group transition-all"
              >
                <Table className="h-4 w-4 shrink-0 transition-colors" />
                <div className="text-left leading-tight">
                  <div className="font-bold uppercase tracking-wider">CSV Data</div>
                  <div className="text-[8px] font-mono opacity-60">INDICATOR LIST</div>
                </div>
              </button>

              {/* Export JSON */}
              <button
                type="button"
                id="export-json-btn"
                onClick={() => exportToJSON(model)}
                className="flex items-center gap-2 p-2 border border-black bg-white hover:text-white hover:bg-black text-[10px] font-bold rounded-none cursor-pointer group transition-all"
              >
                <FileJson className="h-4 w-4 shrink-0 transition-colors" />
                <div className="text-left leading-tight">
                  <div className="font-bold uppercase tracking-wider">JSON Export</div>
                  <div className="text-[8px] font-mono opacity-60">RAW SCHEMA</div>
                </div>
              </button>

              {/* STIX 2.1 Compliance Export */}
              <button
                type="button"
                id="export-stix-btn"
                onClick={() => exportToSTIX(model)}
                className="col-span-2 flex items-center justify-center gap-2.5 p-2.5 border border-black bg-neutral-900 text-white hover:bg-neutral-100 hover:text-black hover:border-black text-[10px] font-bold rounded-none cursor-pointer group transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-0 active:translate-y-[2px]"
              >
                <Shield className="h-4 w-4 shrink-0 text-neutral-200 group-hover:text-black transition-colors" />
                <div className="text-left leading-tight">
                  <div className="font-bold uppercase tracking-wider">STIX 2.1 Compliance Bundle</div>
                  <div className="text-[8px] font-mono opacity-80">SEC OPS INGESTION SPECS</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right column: granular logical tree editor for active node (col span 7) */}
        <div className="lg:col-span-12 xl:col-span-7 h-full min-h-[500px]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-black border-b border-black pb-1 mb-2">
            Active Vertex Logical Editor
          </h3>
          <DiamondNodeEditor
            node={getActiveNodeObject()}
            onNodeChange={handleActiveNodeChange}
            onActiveNodeChange={setActiveNode}
            modelCreationDate={model.creationDate}
          />
        </div>
      </div>
    </div>
  );
}
