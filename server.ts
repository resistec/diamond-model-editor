import express from "express";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import https from "https";
import { createServer as createViteServer } from "vite";

async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file, status code: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function cloneMitreRepo(): Promise<void> {
  return new Promise((resolve) => {
    console.log("Cloning MITRE attack-data-model repo as requested...");
    exec("git clone --depth 1 https://github.com/mitre-attack/attack-data-model.git temp-mitre-clone", (error) => {
      if (error) {
        console.error("Cloning encountered warning (non-fatal, proceeding):", error.message);
      } else {
        console.log("Cloning complete. Content downloaded.");
      }
      resolve();
    });
  });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware to support JSON payloads up to 10MB
  app.use(express.json({ limit: "10mb" }));

  // Ensure the local 'My Projects' directory exists
  const PROJECTS_DIR = path.join(process.cwd(), "My Projects");
  if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
  }

  // Trigger MITRE ensuring dataset asynchronously on startup
  const ensureMitreDataset = async () => {
    const filePath = path.join(PROJECTS_DIR, "mitre-dataset.json");
    let needsGeneration = true;
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasTactic = parsed.some((t: any) => t.id && t.id.startsWith("TA"));
          const hasSubtechnique = parsed.some((t: any) => t.id && t.id.includes("."));
          if (hasTactic && hasSubtechnique) {
            console.log("Cached MITRE dataset already contains Tactics and Sub-techniques.");
            needsGeneration = false;
          }
        }
      } catch (_) {
        needsGeneration = true;
      }
    }

    if (!needsGeneration) {
      return;
    }

    try {
      // 1. Clone the user's requested repository
      await cloneMitreRepo();
      
      // 2. Fetch standard enterprise-attack JSON to compile live TTP list
      const tempRawJson = path.join(process.cwd(), "enterprise-attack.json");
      console.log("Downloading standard Enterprise ATT&CK catalog...");
      await downloadFile(
        "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json",
        tempRawJson
      );

      console.log("Parsing downloaded STIX catalog...");
      const rawData = fs.readFileSync(tempRawJson, "utf-8");
      const parsedData = JSON.parse(rawData);
      const techniques = (parsedData.objects || [])
        .filter((obj: any) => 
          (obj.type === "attack-pattern") || 
          (obj.type === "x-mitre-tactic")
        )
        .map((obj: any) => {
          const ref = (obj.external_references || []).find((r: any) => r.source_name === "mitre-attack");
          return {
            id: ref ? ref.external_id : "",
            name: obj.name,
            description: obj.description ? obj.description.slice(0, 200) : ""
          };
        })
        .filter((t: any) => t.id && t.name);

      if (techniques.length > 0) {
        fs.writeFileSync(filePath, JSON.stringify(techniques, null, 2), "utf-8");
        console.log(`Successfully compiled and cached ${techniques.length} MITRE ATT&CK techniques, tactics, and subtechniques.`);
      }

      if (fs.existsSync(tempRawJson)) {
        fs.unlinkSync(tempRawJson);
      }
    } catch (err) {
      console.error("Non-fatal warning creating MITRE dataset:", err);
    } finally {
      const clonePath = path.join(process.cwd(), "temp-mitre-clone");
      if (fs.existsSync(clonePath)) {
        try {
          fs.rmSync(clonePath, { recursive: true, force: true });
        } catch (ex) {
          console.error("Clean up warning:", ex);
        }
      }
    }
  };

  ensureMitreDataset().catch(err => console.error("MITRE Setup Error:", err));

  // API Endpoints
  
  // 1. Get all projects
  app.get("/api/projects", (req, res) => {
    try {
      const files = fs.readdirSync(PROJECTS_DIR);
      const projects = [];
      for (const file of files) {
        if (file.endsWith(".json") && file !== "mitre-dataset.json") {
          try {
            const content = fs.readFileSync(path.join(PROJECTS_DIR, file), "utf-8");
            const project = JSON.parse(content);
            if (project && project.id) {
              projects.push(project);
            }
          } catch (err) {
            console.error(`Error reading/parsing project file ${file}:`, err);
          }
        }
      }
      // Sort: youngest (most recently modified) first
      projects.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
      res.json(projects);
    } catch (err) {
      console.error("Failed to list projects:", err);
      res.status(500).json({ error: "Failed to list projects" });
    }
  });

  // 2. Save a project
  app.post("/api/projects", (req, res) => {
    try {
      const project = req.body;
      if (!project || !project.id) {
        return res.status(400).json({ error: "Project payload must contain a unique ID" });
      }

      // Update modification timestamp before saving
      project.lastModified = new Date().toISOString();

      const fileName = `${project.id}.json`;
      const filePath = path.join(PROJECTS_DIR, fileName);
      
      fs.writeFileSync(filePath, JSON.stringify(project, null, 2), "utf-8");
      res.json({ success: true, project });
    } catch (err) {
      console.error("Failed to save project:", err);
      res.status(500).json({ error: "Failed to save project file" });
    }
  });

  // 3. Delete a project
  app.delete("/api/projects/:id", (req, res) => {
    try {
      const { id } = req.params;
      const filePath = path.join(PROJECTS_DIR, `${id}.json`);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Project not found" });
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
      res.status(500).json({ error: "Failed to delete project file" });
    }
  });

  // 4. Get MITRE TTP suggestions
  app.get("/api/mitre-ttp", (req, res) => {
    try {
      const filePath = path.join(PROJECTS_DIR, "mitre-dataset.json");
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        return res.json(JSON.parse(fileContent));
      }
    } catch (err) {
      console.error("Error reading cached MITRE dataset:", err);
    }

    // High quality offline fallback list containing core, common real-world TTPs
    const fallbackTTPs = [
      // Tactics
      { id: "TA0043", name: "Reconnaissance", description: "The adversary is trying to gather information they can use to plan future operations." },
      { id: "TA0001", name: "Initial Access", description: "The adversary is trying to get into your network." },
      { id: "TA0002", name: "Execution", description: "The adversary is trying to run malicious code." },
      { id: "TA0003", name: "Persistence", description: "The adversary is trying to maintain their foothold." },
      { id: "TA0005", name: "Defense Evasion", description: "The adversary is trying to avoid detection." },

      // Techniques
      { id: "T1059", name: "Command and Scripting Interpreter", description: "Adversaries may abuse technologies that execute commands..." },
      { id: "T1053", name: "Scheduled Task/Job", description: "Adversaries may abuse other utilities to schedule execution..." },
      { id: "T1021", name: "Remote Services", description: "Adversaries may use valid credentials to log into remote systems..." },
      { id: "T1003", name: "OS Credential Dumping", description: "Adversaries may attempt to dump credentials from memory..." },
      { id: "T1082", name: "System Information Discovery", description: "Adversaries may attempt to get detailed information about the OS..." },
      { id: "T1071", name: "Application Layer Protocol", description: "Adversaries may communicate using standard application layer protocols..." },
      { id: "T1112", name: "Modify Registry", description: "Adversaries may interact with the Registry to hide configuration..." },
      { id: "T1190", name: "Exploit Public-Facing Application", description: "Adversaries may attempt to take advantage of vulnerabilities..." },
      { id: "T1047", name: "Windows Management Instrumentation", description: "Adversaries may abuse WMI to execute malicious payloads..." },
      { id: "T1036", name: "Masquerading", description: "Adversaries may attempt to masquerade names or details of artifacts..." },
      { id: "T1543", name: "Create or Modify System Process", description: "Adversaries may create or modify system processes for persistency..." },
      { id: "T1078", name: "Valid Accounts", description: "Adversaries may steal credentials of a specific user to gain access..." },
      { id: "T1486", name: "Data Encrypted for Impact", description: "Adversaries may encrypt data on system endpoints to compromise availability..." },

      // Sub-techniques
      { id: "T1059.001", name: "PowerShell (under Command and Scripting Interpreter)", description: "Adversaries may abuse PowerShell commands and scripts for execution..." },
      { id: "T1059.003", name: "Windows Command Shell (under Command and Scripting Interpreter)", description: "Adversaries may abuse the Windows command shell for execution..." },
      { id: "T1204.002", name: "Malicious File (under User Execution)", description: "Adversaries may rely on a user opening a malicious file to gain execution..." }
    ];
    res.json(fallbackTTPs);
  });

  // Vite development / Static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const startListening = (portToTry: number) => {
    const serverInstance = app.listen(portToTry, "0.0.0.0");

    serverInstance.on("listening", () => {
      const addr = serverInstance.address();
      const actualPort = typeof addr === "object" && addr !== null ? addr.port : portToTry;
      console.log(`Server launched successfully at http://localhost:${actualPort}`);
    });

    serverInstance.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.warn(`Port ${portToTry} is already in use. Retrying with an automatically OS-allocated port (port 0)...`);
        startListening(0);
      } else {
        console.error("Server startup error:", err);
      }
    });
  };

  startListening(PORT);
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
