import { useState } from "react";
import { FolderOpen, Search, Clock, Calendar, ChevronRight, Trash2, ShieldAlert } from "lucide-react";
import { DiamondModel } from "../types";

interface MyProjectsPageProps {
  projects: DiamondModel[];
  isLoading: boolean;
  onEditProject: (project: DiamondModel) => void;
  onDeleteProject: (id: string) => Promise<void>;
  onCreateNew: () => void;
  onMergeProjects: (selectedModels: DiamondModel[]) => Promise<void>;
}

export default function MyProjectsPage({
  projects,
  isLoading,
  onEditProject,
  onDeleteProject,
  onCreateNew,
  onMergeProjects,
}: MyProjectsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Merging States
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isConfirmMergeOpen, setIsConfirmMergeOpen] = useState(false);
  const [mergeWarning, setMergeWarning] = useState<string | null>(null);

  const toggleSelectProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setMergeWarning(null); // Clear warnings on selection change
  };

  const handleMergeButtonClick = () => {
    if (!isMergeMode) {
      setIsMergeMode(true);
      setSelectedProjectIds([]);
      setMergeWarning(null);
    } else {
      if (selectedProjectIds.length < 2) {
        setMergeWarning("Please select at least 2 models from your library to perform a merge partition.");
      } else {
        setIsConfirmMergeOpen(true);
      }
    }
  };

  const getFallbackTitle = (project: DiamondModel) => {
    if (project.title && project.title.trim()) return project.title;
    try {
      const date = new Date(project.lastModified);
      return `Unnamed Campaign (${date.toLocaleString()})`;
    } catch {
      return "Unnamed Threat Intelligence Model";
    }
  };

  const filteredProjects = projects.filter((p) => {
    const title = getFallbackTitle(p).toLowerCase();
    const query = searchQuery.toLowerCase();
    // Search by title or inside items
    const inAdversary = p.adversary?.items?.some((i) => i.value?.toLowerCase().includes(query)) || false;
    const inCapability = p.capability?.items?.some((i) => i.value?.toLowerCase().includes(query)) || false;
    const inInfrastructure = p.infrastructure?.items?.some((i) => i.value?.toLowerCase().includes(query)) || false;
    const inVictim = p.victim?.items?.some((i) => i.value?.toLowerCase().includes(query)) || false;
    return title.includes(query) || inAdversary || inCapability || inInfrastructure || inVictim;
  });

  const countItems = (items: any[]): number => {
    let count = 0;
    for (const item of items) {
      count++;
      if (item.children) {
        count += countItems(item.children);
      }
    }
    return count;
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 border-2 border-black">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-black uppercase">
              SAVED ANALYSES
            </h1>
            <p className="text-[10px] text-black/60 font-mono mt-0.5 uppercase tracking-wide">
              BROWSE AND LOAD CAMPAIGN SPECIFICATIONS FROM PLATFORM DISK
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Merge button */}
          <button
            onClick={handleMergeButtonClick}
            className={`w-full sm:w-auto inline-flex items-center justify-center border-2 border-black text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-none cursor-pointer transition-all shadow-sm ${
              isMergeMode 
                ? "bg-stone-100 text-black border-black hover:bg-black hover:text-white"
                : "bg-white text-black hover:bg-black hover:text-white"
            }`}
          >
            {isMergeMode ? `Merge Selected (${selectedProjectIds.length})` : "Merge Models"}
          </button>

          {isMergeMode && (
            <button
              onClick={() => {
                setIsMergeMode(false);
                setSelectedProjectIds([]);
                setMergeWarning(null);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-dashed border-black bg-neutral-100 text-black hover:bg-black hover:text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-none cursor-pointer transition-colors"
            >
              Cancel Merge
            </button>
          )}

          <button
            onClick={onCreateNew}
            className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-black bg-black text-white hover:bg-white hover:text-black hover:border-black text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-none cursor-pointer transition-colors shadow-sm"
          >
            Create New Model
          </button>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-black opacity-60">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search campaigns by title, IOCs, etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-none border border-black bg-white py-1.5 pl-9 pr-3 text-xs placeholder-black/40 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-black opacity-60 hidden sm:block">
          Found {filteredProjects.length} of {projects.length} files
        </div>
      </div>

      {isMergeMode && (
        <div className="bg-neutral-50 border-2 border-black p-4 font-mono text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-0.5 animate-pulse">
            <span className="font-extrabold text-black">Campaign Merge Mode Active</span>
            <span className="text-[10px] text-black/60 font-medium normal-case">Select 2 or more files from the catalog grid below, then click "Merge Models" to proceed.</span>
          </div>
          <div className="text-[10px] font-black tracking-wider text-black bg-stone-100 border border-black px-2 py-1 shrink-0">
            Selected: <span className="font-black text-xs text-rose-800">{selectedProjectIds.length}</span> / {projects.length} files
          </div>
        </div>
      )}

      {mergeWarning && (
        <div className="bg-rose-50 border-2 border-rose-950 text-rose-950 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wide">
          ✕ {mergeWarning}
        </div>
      )}

      {/* Loading & Empty States */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/30 border-t-black" />
          <p className="text-xs text-black font-semibold font-mono uppercase tracking-widest">Reading files from server...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-black rounded-none p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-xl mx-auto">
          <div className="inline-flex h-12 w-12 items-center justify-center border border-black bg-neutral-100 text-black mb-4">
            <FolderOpen className="h-5 w-5" />
          </div>
          <h3 className="text-xs font-black text-black uppercase tracking-widest">No Diamond Models Found</h3>
          <p className="mt-2 text-[11px] text-black opacity-60 leading-relaxed font-mono">
            {searchQuery
              ? "No files match your active filter search. Try correcting spelling or clearing filters."
              : "No diamond project JSON files exist in the local folder on the server. Click below to draft your first threat intel report!"}
          </p>
          <div className="mt-6">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center px-4 py-2 border border-black bg-white text-black hover:bg-black hover:text-white text-xs font-bold uppercase tracking-wide rounded-none cursor-pointer"
              >
                Clear Search Query
              </button>
            ) : (
              <button
                onClick={onCreateNew}
                className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-widest rounded-none cursor-pointer"
              >
                Draft First Project
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const advCount = countItems(project.adversary?.items || []);
            const capCount = countItems(project.capability?.items || []);
            const infCount = countItems(project.infrastructure?.items || []);
            const vicCount = countItems(project.victim?.items || []);
            const totalCount = advCount + capCount + infCount + vicCount;

            const isConfirmingDelete = deleteConfirmId === project.id;
            const isSelected = selectedProjectIds.includes(project.id);

            return (
              <div
                key={project.id}
                onClick={() => isMergeMode && toggleSelectProject(project.id)}
                className={`group relative flex flex-col justify-between bg-white border-2 p-5 transition-all overflow-hidden ${
                  isMergeMode
                    ? isSelected
                      ? "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-neutral-50 border-black ring-2 ring-black"
                      : "opacity-85 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:opacity-100 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-neutral-300 hover:border-black cursor-pointer"
                    : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.01] border-black cursor-pointer"
                }`}
              >
                <div>
                  {/* Top bar */}
                  <div className="flex items-start justify-between gap-2 border-b border-black pb-3">
                    <div className="space-y-1">
                      <h3
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isMergeMode) {
                            toggleSelectProject(project.id);
                          } else {
                            onEditProject(project);
                          }
                        }}
                        className="text-sm font-black tracking-tight text-black group-hover:underline cursor-pointer leading-tight break-all uppercase"
                      >
                        {getFallbackTitle(project)}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-black opacity-60">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{formatDate(project.lastModified)}</span>
                      </div>
                    </div>

                    {/* Checkbox selector in select mode OR traditional Delete delete trigger */}
                    {isMergeMode ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectProject(project.id);
                        }}
                        className={`h-6 w-6 border-2 border-black flex items-center justify-center transition-colors rounded-none cursor-pointer shrink-0 ${
                          isSelected ? "bg-black text-white" : "bg-white hover:bg-neutral-150"
                        }`}
                      >
                        {isSelected && <span className="text-[11px] font-bold">✓</span>}
                      </button>
                    ) : !isConfirmingDelete ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(project.id);
                        }}
                        id={`delete-project-btn-${project.id}`}
                        title="Delete project file permanently"
                        className="p-1 text-black hover:bg-rose-100 border border-transparent hover:border-black rounded-none shrink-0 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0 z-20 font-mono">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(project.id);
                            setDeleteConfirmId(null);
                          }}
                          id={`confirm-delete-project-btn-${project.id}`}
                          className="bg-black text-white hover:bg-white hover:text-black border border-black text-[9px] font-black uppercase rounded-none px-2 py-0.5 cursor-pointer"
                        >
                          CONFIRM
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                          }}
                          className="border border-black text-black hover:bg-neutral-100 text-[9px] font-black uppercase rounded-none px-2 py-0.5 cursor-pointer"
                        >
                          CANCEL
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Calibration Dates */}
                  <div className="flex items-center gap-4 text-[9px] font-mono text-black opacity-80 py-2.5 border-b border-dashed border-black/40">
                    <div className="flex items-center gap-1 font-bold">
                      <Calendar className="h-3 w-3" />
                      <span>CREATED: {project.creationDate}</span>
                    </div>
                    {project.expirationDate && (
                      <div className="flex items-center gap-1 font-bold text-rose-700">
                        <ShieldAlert className="h-3 w-3" />
                        <span>EXPIRES: {project.expirationDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Miniature density diagram */}
                  <div className="my-4 py-2 bg-neutral-50 rounded-none border border-black flex flex-col space-y-1 px-3.5">
                    <span className="text-[9px] font-mono uppercase font-black tracking-wider text-black opacity-60">
                      Indicator Density ({totalCount} items)
                    </span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[9px] text-black">
                      <div className="flex justify-between">
                        <span>ADV:</span>
                        <span className="font-bold">{advCount} ({project.adversary?.isInclusive ? "INC" : "EXC"})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CAP:</span>
                        <span className="font-bold">{capCount} ({project.capability?.isInclusive ? "INC" : "EXC"})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>INF:</span>
                        <span className="font-bold">{infCount} ({project.infrastructure?.isInclusive ? "INC" : "EXC"})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VIC:</span>
                        <span className="font-bold">{vicCount} ({project.victim?.isInclusive ? "INC" : "EXC"})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom trigger card action */}
                <button
                  type="button"
                  id={`open-project-btn-${project.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMergeMode) {
                      toggleSelectProject(project.id);
                    } else {
                      onEditProject(project);
                    }
                  }}
                  className={`w-full mt-2 inline-flex items-center justify-between border border-black py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-all ${
                    isMergeMode
                      ? isSelected
                        ? "bg-black text-white hover:bg-neutral-900"
                        : "bg-white text-black hover:bg-stone-50"
                      : "bg-white text-black hover:bg-black hover:text-white"
                  }`}
                >
                  <span>
                    {isMergeMode
                      ? isSelected
                        ? "✓ Selected"
                        : "Select for Merge"
                      : "Edit Diamond Model"}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Merge Modal */}
      {isConfirmMergeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black p-6 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-sm font-black tracking-tight text-white bg-black p-3 uppercase font-mono tracking-widest mb-4 flex items-center gap-2">
              <span>MERGE INTEL SPECIFICATIONS</span>
            </h2>
            
            <p className="text-xs font-mono uppercase tracking-wide text-black/80 mb-3 font-bold">
              Do you want to marge these models?
            </p>

            <div className="bg-neutral-50 border border-black p-3.5 mb-5 max-h-48 overflow-y-auto space-y-1 divide-y divide-neutral-200">
              {selectedProjectIds.map((id) => {
                const proj = projects.find((p) => p.id === id);
                return (
                  <div key={id} className="pt-1 first:pt-0 font-mono text-[11px] text-black font-extrabold flex items-center justify-between">
                    <span className="uppercase">{proj ? getFallbackTitle(proj) : "Unnamed model"}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-[9px] font-mono text-rose-800 font-bold tracking-wider mb-5 bg-rose-50 border border-rose-900 p-2.5 leading-relaxed">
              Warning: Merging permanently combines the selected specifications under OR relation couplings. Source definitions will disappear, being replaced by this new profile.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 justify-end font-mono">
              <button
                type="button"
                onClick={() => setIsConfirmMergeOpen(false)}
                className="w-full sm:w-auto border-2 border-black bg-white text-black hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-none cursor-pointer transition-colors"
                id="cancel-merge-modal-btn"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsConfirmMergeOpen(false);
                  const selectedModels = projects.filter((p) => selectedProjectIds.includes(p.id));
                  await onMergeProjects(selectedModels);
                  setIsMergeMode(false);
                  setSelectedProjectIds([]);
                }}
                className="w-full sm:w-auto border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-none cursor-pointer transition-colors"
                id="confirm-merge-modal-btn"
              >
                CONFIRM & MERGE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
