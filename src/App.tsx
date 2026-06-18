import { useState, useEffect } from "react";
import RibbonHeader from "./components/RibbonHeader";
import EditorPage from "./components/EditorPage";
import MyProjectsPage from "./components/MyProjectsPage";
import HelpPage from "./components/HelpPage";
import { DiamondModel, createEmptyModel } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"editor" | "projects" | "help">("editor");
  const [projects, setProjects] = useState<DiamondModel[]>([]);
  const [activeModel, setActiveModel] = useState<DiamondModel>(() => createEmptyModel());
  
  // API interaction statuses
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Load existing project JSON files from server disk on start
  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      } else {
        console.error("Failed to load project database files from Express API.");
      }
    } catch (err) {
      console.error("Network communication error with server:", err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Save project back to the server as a JSON file in "My Projects" folder
  const handleSaveProject = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const modelToSave = { ...activeModel };
      
      // Feature 4 check: Fallback title if none provided is Unnamed Campaign + current timestamp
      if (!modelToSave.title || !modelToSave.title.trim()) {
        const now = new Date();
        const formattedTimestamp = now.toLocaleString("sv-SE", { // YYYY-MM-DD HH:MM
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        modelToSave.title = `Unnamed Campaign (${formattedTimestamp})`;
      }

      // Sync active client-side project state
      setActiveModel(modelToSave);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modelToSave),
      });

      if (res.ok) {
        const savedResult = await res.json();
        if (savedResult.success) {
          setSaveStatus("success");
          // Refresh list of projects on server database
          await loadProjects();
          
          // Clear visual alert after 3.5 seconds
          setTimeout(() => {
            setSaveStatus("idle");
          }, 3500);
        } else {
          setSaveStatus("error");
        }
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("Express save project exception:", err);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a project from server's folder permanently
  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // Refresh structural index
        await loadProjects();
        // If we deleted the active project, reset active model to an empty draft so they don't lock
        if (activeModel.id === id) {
          setActiveModel(createEmptyModel());
        }
      } else {
        console.error("Failed to delete project on Express disk.");
      }
    } catch (err) {
      console.error("Network communication error deleting files:", err);
    }
  };

  // Open an existing project inside the main Editor tab
  const handleEditProject = (project: DiamondModel) => {
    setActiveModel(project);
    setActiveTab("editor");
  };

  // Reset/Start a brand new empty model inside workspace
  const handleCreateNewModel = () => {
    setActiveModel(createEmptyModel());
    setActiveTab("editor");
  };

  // Merge selected models into a single combined threat profile
  const handleMergeProjects = async (selectedModels: DiamondModel[]) => {
    if (selectedModels.length < 2) return;

    const today = new Date().toISOString().split("T")[0];
    const maxExpirationDate = selectedModels.reduce((max, m) => {
      if (!m.expirationDate) return max;
      if (!max) return m.expirationDate;
      return m.expirationDate > max ? m.expirationDate : max;
    }, "");

    // Beautiful descriptive title slug of merged source paths
    const mergedTitle = `Merged: ${selectedModels.map(m => m.title || "Unnamed").join(" + ")}`;

    // Merging vertices with an OR logic layer
    const mergeVertex = (
      vertexKey: "adversary" | "capability" | "infrastructure" | "victim",
      title: "Adversary" | "Capability" | "Infrastructure" | "Victim"
    ) => {
      const mergedItems: any[] = [];
      selectedModels.forEach((model) => {
        const node = model[vertexKey];
        if (node && node.items && node.items.length > 0) {
          const clonedItems = JSON.parse(JSON.stringify(node.items));
          if (mergedItems.length > 0) {
            clonedItems[0].relation = "OR";
          }
          mergedItems.push(...clonedItems);
        }
      });

      // Ensure first root element is relationship-free (NONE)
      if (mergedItems.length > 0) {
        mergedItems[0].relation = "NONE";
      }

      return {
        title,
        isInclusive: true, // Defaulting to true for visual clarity
        items: mergedItems
      };
    };

    const mergedModel: DiamondModel = {
      id: Math.random().toString(36).substring(2, 11),
      title: mergedTitle,
      creationDate: today,
      expirationDate: maxExpirationDate || today,
      adversary: mergeVertex("adversary", "Adversary"),
      capability: mergeVertex("capability", "Capability"),
      infrastructure: mergeVertex("infrastructure", "Infrastructure"),
      victim: mergeVertex("victim", "Victim"),
      lastModified: new Date().toISOString()
    };

    setIsLoadingProjects(true);
    try {
      // 1. Delete all selected original campaigns from local cache
      await Promise.all(
        selectedModels.map((m) =>
          fetch(`/api/projects/${m.id}`, { method: "DELETE" })
        )
      );

      // 2. Post our consolidated record up to Express server disk
      const saveRes = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mergedModel),
      });

      if (saveRes.ok) {
        // Refresh catalog list cache
        await loadProjects();
        // Propagate current active model and open editor tab
        setActiveModel(mergedModel);
        setActiveTab("editor");
      } else {
        console.error("Failed to post combined project record on the server.");
      }
    } catch (err) {
      console.error("Express file structure merge error exception:", err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Ribbon Style Top Navigation Menu */}
      <RibbonHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projectTitle={activeModel.title}
      />

      {/* Main page router workspace */}
      <main className="flex-1">
        {activeTab === "editor" && (
          <EditorPage
            model={activeModel}
            onModelChange={setActiveModel}
            onSave={handleSaveProject}
            isSaving={isSaving}
            saveStatus={saveStatus}
            onLoadFromProjectsList={() => setActiveTab("projects")}
          />
        )}

        {activeTab === "projects" && (
          <MyProjectsPage
            projects={projects}
            isLoading={isLoadingProjects}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onCreateNew={handleCreateNewModel}
            onMergeProjects={handleMergeProjects}
          />
        )}

        {activeTab === "help" && <HelpPage />}
      </main>

      {/* High Density industrial footer */}
      <footer className="border-t-2 border-black bg-white py-4 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-black font-mono font-bold uppercase tracking-widest">
          <div>
            <span>METHODOLOGY REFERENCED: </span>
            <a
              href="https://apps.dtic.mil/sti/citations/ADA586960"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-neutral-600 transition-colors"
            >
              THE DIAMOND MODEL OF INTRUSION ANALYSIS
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span>VER 1.2.0</span>
            <span className="text-neutral-400">|</span>
            <a
              href="https://github.com/resistec"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-neutral-600 transition-colors"
            >
              GITHUB: RESISTEC
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
