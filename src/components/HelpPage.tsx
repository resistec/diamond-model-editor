import { BookOpen, User, ShieldAlert, Cpu, Network, Info, Shuffle, CornerDownRight } from "lucide-react";

export default function HelpPage() {
  const coreNodes = [
    {
      title: "Adversary",
      icon: <User className="h-5 w-5 text-black" />,
      tag: "Who?",
      description: "The individual, group, or organization responsible for committing the malicious intrusion. In CTI, this can range from script kiddies to sophisticated Advanced Persistent Threats (APTs) or state-sponsored syndicates.",
      example: "APT29, Cozy Bear, FIN7, or an unidentified ransom operator.",
    },
    {
      title: "Capability",
      icon: <Cpu className="h-5 w-5 text-black" />,
      tag: "How?",
      description: "The tools, malware, exploits, tactics, techniques, and procedures (TTPs) weaponized by the threat actor to execute their malicious campaign or break into the victim environment.",
      example: "Cobalt Strike, custom ransomware, spear-phishing templates, or CVE exploits.",
    },
    {
      title: "Infrastructure",
      icon: <Network className="h-5 w-5 text-black" />,
      tag: "Where?",
      description: "The communication structures, virtual systems, physical servers, DNS records, domain names, proxies, and command-and-control (C2) servers utilized by the adversary to carry out and route the attack.",
      example: "shady-domain[.]com, 185.112.5.4, or cloud hosting ingress APIs.",
    },
    {
      title: "Victim",
      icon: <ShieldAlert className="h-5 w-5 text-black" />,
      tag: "Target?",
      description: "The targeted entity, specific industry segment, IP ranges, geographical sector, or assets receiving the impact of the cyber campaign.",
      example: "Healthcare Hospital ERP, US Finance Sector, or employee credentials.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      
      {/* Page Title Header */}
      <div className="border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 border-2 border-black">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-black uppercase">
              DIAMOND MODEL HANDBOOK
            </h1>
            <p className="text-[10px] text-black/60 font-mono mt-0.5 uppercase tracking-wide">
              PHILOSOPHY, METRIC RULES, AND NESTED LOGIC EXPLAINED
            </p>
          </div>
        </div>
      </div>

      {/* Main Philosophy Section */}
      <section className="bg-white border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <h2 className="text-sm font-black text-black flex items-center gap-2 uppercase tracking-wide">
          <span className="p-0.5 bg-black text-white border border-black"><Info className="h-4 w-4 shrink-0" /></span>
          <span>The Intrusion Analysis Philosophy</span>
        </h2>
        <p className="text-black text-xs leading-relaxed font-mono opacity-85">
          The Diamond Model was introduced by Sergio Caltagirone, Andrew Pendergast, and Warren Betts in their seminal 2013 paper (<a href="https://apps.dtic.mil/sti/citations/ADA586960" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-black/50">DTIC ADA586960</a>). It is a cognitive framework designed to establish structured intelligence from cyber intrusions. By grouping elements into four vertices—
          <span className="font-bold text-black border-b border-black">Adversary</span>,{" "}
          <span className="font-bold text-black border-b border-black">Capability</span>,{" "}
          <span className="font-bold text-black border-b border-black">Infrastructure</span>, and{" "}
          <span className="font-bold text-black border-b border-black">Victim</span>—CTI analysts can capture the relationship, trajectory, and operational features of threat campaigns across two core axises:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 border border-black bg-neutral-50">
            <h3 className="text-2xs font-mono font-black uppercase tracking-wider text-black">
              Social Axis (Adversary - Victim)
            </h3>
            <p className="text-black/65 text-[11px] mt-1.5 leading-relaxed font-mono">
              Maps the human and intent portion. Explains who is attacking whom, and the social, political, or economic relationship linking the attacker with the victim.
            </p>
          </div>
          <div className="p-4 border border-black bg-neutral-50">
            <h3 className="text-2xs font-mono font-black uppercase tracking-wider text-black">
              Technical Axis (Capability - Infrastructure)
            </h3>
            <p className="text-black/65 text-[11px] mt-1.5 leading-relaxed font-mono">
              Maps the technological mechanism. Outlines what tools are routed through which communication networks to execute the operation.
            </p>
          </div>
        </div>
      </section>

      {/* The Four Vertices Breakdown */}
      <section className="space-y-4">
        <h2 className="text-xs font-mono font-black uppercase tracking-widest text-black border-b border-black pb-1">The 4 Vertices of the Diamond</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {coreNodes.map((node) => (
            <div key={node.title} className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-black pb-2">
                  <span className="flex items-center gap-1.5 font-black text-black leading-none text-xs uppercase">
                    {node.icon}
                    <span>{node.title}</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-black text-white uppercase border border-black">
                    {node.tag}
                  </span>
                </div>
                <p className="text-black/80 text-[11px] mt-3 leading-relaxed font-mono">
                  {node.description}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-dashed border-black text-[9px] font-mono">
                <span className="font-black text-black opacity-45">Example IOC / Value:</span>{" "}
                <span className="text-black font-semibold">{node.example}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inclusive / Exclusive Section */}
      <section className="bg-black text-white p-5 sm:p-6 space-y-4 border-2 border-black">
        <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-wide">
          <Shuffle className="h-4 w-4 text-white" />
          <span>Inclusive vs. Exclusive Constraining Rules</span>
        </h2>
        <p className="text-white/80 text-xs font-mono leading-relaxed">
          Each node of the Diamond Model can be annotated to declare the completeness of the intelligence gathered. In this solution, you can toggle other items' admissibility on each node:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="border border-white/40 p-4 bg-zinc-900">
            <h3 className="text-2xs font-mono font-black uppercase tracking-wider text-white">
              Inclusive (Open Constraint)
            </h3>
            <p className="text-white/70 text-[11px] mt-1.5 leading-relaxed font-mono">
              Other items can be added to this vertex of the threat definition.
            </p>
          </div>
          <div className="border border-white/40 p-4 bg-zinc-900">
            <h3 className="text-2xs font-mono font-black uppercase tracking-wider text-white">
              Exclusive (Closed Constraint)
            </h3>
            <p className="text-white/70 text-[11px] mt-1.5 leading-relaxed font-mono">
              No other items can be added to this vertex of the threat definition.
            </p>
          </div>
        </div>
      </section>

      {/* Logical Relations & Nesting Section */}
      <section className="bg-white border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <h2 className="text-sm font-black text-black flex items-center gap-2 uppercase tracking-wide">
          <CornerDownRight className="h-4 w-4" />
          <span>Nested logical trees & IOC relations</span>
        </h2>
        <p className="text-black/80 text-xs font-mono leading-relaxed">
          Cyber threats often utilize intricate redundant components or conditional techniques. Our workspace supports nested tree dependencies and AND/OR logic next to every single IOC item.
        </p>

        <div className="bg-neutral-50 border border-black p-4 font-mono text-[11px] text-black space-y-2">
          <div className="font-black opacity-50 tracking-wider border-b border-black pb-1.5 mb-2">
            Logical Layout representation:
          </div>
          <div className="pl-2 border-l-2 border-black">
            <div>• Redundant C2 Domain: <span className="font-bold underline">active-phish[.]site</span></div>
            <div className="pl-6 opacity-80">↳ OR Redirect domain: <span className="underline">backup-phish[.]site</span></div>
            <div className="pl-12 opacity-60">↳ OR IP: <span className="font-bold">104.22.44.11</span></div>
            <div className="pl-6 opacity-80">↳ AND Exploit Vector: <span className="underline">payload.exe hash (SHA256)</span></div>
          </div>
        </div>

        <div className="space-y-2.5 text-black/80 text-xs font-mono leading-relaxed">
          <p>
            <span className="font-black text-black">Relation Constraint Enforcement:</span> When adding indicators, you must set an explicit <span className="font-mono bg-black text-white px-1 leading-normal">&quot;AND&quot;</span> or <span className="font-mono bg-black text-white px-1 leading-normal">&quot;OR&quot;</span> operator next to consecutive sibling items, specifying if they occur concurrently (AND) or acts as fallbacks / alternatives (OR).
          </p>
          <p>
            <span className="font-black text-black">Nesting Resolution:</span> Clicking <span className="underline font-bold text-black">&quot;Nest&quot;</span> allows you to declare child properties directly of a parent element. This permits building highly tailored intelligence graphs mimicking actual infrastructural relationships.
          </p>
        </div>
      </section>

      {/* Standard Procedures Box */}
      <section className="bg-neutral-100 border-l-4 border-black p-5 rounded-none border border-black">
        <h3 className="text-xs font-black text-black uppercase font-mono tracking-widest">Suggested Steps</h3>
        <ul className="mt-3 space-y-2.5 text-[11px] text-black/80 font-mono list-decimal list-inside leading-relaxed">
          <li>Create a new campaign or start editing an existing template on the <span className="font-bold">Editor</span> page.</li>
          <li>Set a logical attribution timeline specifying <span className="font-bold">Creation Date</span> and <span className="font-bold">Expiration Date</span>.</li>
          <li>For each node (Adversary, Capability, Infrastructure, Victim), define whether the intelligence is <span className="font-bold">Inclusive</span> (other items can be added to this vertex of the threat definition) or <span className="font-bold">Exclusive</span> (no other items can be added to this vertex of the threat definition).</li>
          <li>Populate intelligence attributes. Nested redundancies (alternative IPs or hash groups) easily represent logical variations.</li>
          <li>Visualise your model dynamically on the interactive Diamond. Highlight individual vertices to focus editing.</li>
          <li>Use the <span className="font-bold">Export Panel</span> to download PNG visual charts, PDF analytical documentation reports, structured CSV files, or raw JSON graphs to integrate into threat briefs, reports, or automated systems.</li>
        </ul>
      </section>
    </div>
  );
}
