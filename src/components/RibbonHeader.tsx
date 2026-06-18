import { Hexagon, FileEdit, Folder, HelpCircle } from "lucide-react";

interface RibbonHeaderProps {
  activeTab: "editor" | "projects" | "help";
  onTabChange: (tab: "editor" | "projects" | "help") => void;
  projectTitle?: string;
}

export default function RibbonHeader({
  activeTab,
  onTabChange,
  projectTitle,
}: RibbonHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-black text-white shrink-0">
      <div className="mx-auto flex max-w-7xl h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand/Title Block */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center border-2 border-white bg-white text-black font-black text-sm">
            Δ
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter uppercase leading-none">
              DM Editor
            </h1>
            <p className="text-[9px] font-mono opacity-60 mt-1 uppercase">
              {projectTitle ? `ACTIVE: ${projectTitle}` : "WORKSPACE PORTAL"}
            </p>
          </div>
        </div>

        {/* Navigation Ribbon Tabs */}
        <nav className="flex h-full items-center gap-2 sm:gap-4 font-mono">
          <button
            id="nav-tab-editor"
            onClick={() => onTabChange("editor")}
            className={`flex h-full items-center gap-2 px-3 text-xs font-bold uppercase transition-all border-b-4 cursor-pointer ${
              activeTab === "editor"
                ? "border-white text-white opacity-100"
                : "border-transparent text-white/60 hover:text-white hover:opacity-100"
            }`}
          >
            <FileEdit className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Editor</span>
          </button>

          <button
            id="nav-tab-projects"
            onClick={() => onTabChange("projects")}
            className={`flex h-full items-center gap-2 px-3 text-xs font-bold uppercase transition-all border-b-4 cursor-pointer ${
              activeTab === "projects"
                ? "border-white text-white opacity-100"
                : "border-transparent text-white/60 hover:text-white hover:opacity-100"
            }`}
          >
            <Folder className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">My Projects</span>
          </button>

          <button
            id="nav-tab-help"
            onClick={() => onTabChange("help")}
            className={`flex h-full items-center gap-2 px-3 text-xs font-bold uppercase transition-all border-b-4 cursor-pointer ${
              activeTab === "help"
                ? "border-white text-white opacity-100"
                : "border-transparent text-white/60 hover:text-white hover:opacity-100"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Help</span>
          </button>
        </nav>

        {/* Right Accents */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <span className="opacity-60 text-[10px]"></span>
          <span className="bg-white text-black px-2 py-0.5 font-bold text-[10px] uppercase">
            v1.2.0-STABLE
          </span>
        </div>
      </div>
    </header>
  );
}
