# Diamond Model (DM) Editor

An interactive Cyber Threat Intelligence (CTI) visualization and modeling platform constructed to organize, track, and map indicators across the four vertices of the **Diamond Model of Intrusion Analysis**: **Adversary**, **Capability**, **Infrastructure**, and **Victim**.

---

## Primary Features

* **Dynamic Diamond Visualization**: An interactive 2D canvas displaying the classic diamond relationship axis connecting Adversary, Capability, Infrastructure, and Victim.
* **Hierarchical Node Editor**: Add, search, delete, and nest items (using AND/OR logic operators) directly within each vertex to build structured sub-indicators.
* **MITRE ATT&CK TTP Autocomplete**: Type inside the **Capability** vertex input to see instant, high-contrast autocomplete suggestions of official MITRE techniques (T-numbers, names, and summaries). The backend automatically handles the background cloning and processing of both the `attack-data-model.git` repository and standard enterprise-attack catalogs upon installation and startup.
* **LTIV (Last Time of Intelligence Value) Tags**: Apply decay thresholds directly to indicators. The system automatically defaults LTIV tags to exactly 1 year from the project creation date, reflecting active threat intelligence lifecycles.
* **Multi-Format Export Suite**:
  * **STIX 2.1 Compliance Bundle**: Generate and download fully formatted, ingestion-ready Structured Threat Information Expression (STIX) JSON bundles, complete with Campaign SDOs, Identity SDOs, Threat-Actor SDOs, Indicators, and standard SRO linking definitions.
  * **Interactive PDF Report**: Generates a high-quality visual report with high-contrast formatting, nested Bullet indices, and metadata statistics.
  * **Flat CSV Schema**: Produces flattened rows identifying Node names, constraints, path traversals, sibling relational constraints, and LTIV values for spreadsheet ingestion.
  * **PNG Canvas Snapshot**: Exports a clean vector-like raster snapshot of the Diamond Canvas.
  * **Backup JSON Schema**: Export and import complete raw workspaces to preserve the nested hierarchy.
* **Persistent Campaigns Hub**: View, modify, clone, and catalog multiple intrusion profiles synchronously via local backend file persistence.

---

## App Layout & Screenshots

The workspace is organized into a single-screen layout focusing on maximum screen density and rapid context switches:

```
+------------------------------------------------------------------------+
|                      [ PLATFORM HEADER & TAB SELECTOR ]                |
+------------------------------------------------------------------------+
|                                  |                                     |
|                                  |       [ VERTEX SELECTION PANEL ]    |
|      [ THE DIAMOND CANVAS ]      |                                     |
|                                  |  Select: Adversary / Capability /   |
|        Active Interactive        |          Infrastructure / Victim    |
|        4-Vertex Layout           |                                     |
|                                  |-------------------------------------|
|         Connecting Lines         |                                     |
|        & Realtime Mapping        |       [ NESTED INDICATOR EDITOR ]   |
|                                  |                                     |
|                                  |   Add indicator nodes with:         |
|                                  |   - AND / OR sibling logic          |
|                                  |   - Custom text / hash / IPs        |
|                                  |   - LTIV Date Picker Tag            |
|                                  |                                     |
+----------------------------------+-------------------------------------|
|                              [ EXPORT PANEL ]                          |
|         [ PNG Snapshot ]  [ PDF Report ]  [ CSV File ]  [ STIX 2.1 ]   |
+------------------------------------------------------------------------+
```

---

## Local Prerequisites & Installation Guide

This guide is carefully tailored for both complete novices and security engineering operations.

### Part A: Prerequisites (For Complete Novices)

Before running the code locally, your computer needs two safe, essential components to execute TypeScript engines.

#### 1. Installing Node.js (The JavaScript Runtime)
Node.js allows your operating system to execute server-side JavaScript and install development packages.
* **Windows & macOS**:
  1. Visit the official download portal: [https://nodejs.org](https://nodejs.org).
  2. Download the **LTS (Long Term Support)** installer (highly recommended for stability).
  3. Run the installer and accept all default configurations (make sure to check the box that offers to add "Node"/"npm" to your PATH environment variable if prompted).
* **Linux (Ubuntu/Debian)**:
  Open your terminal and run the following command sequence:
  ```bash
  sudo apt update
  sudo apt install -y nodejs npm
  ```

To verify Node.js and its package manager (`npm`) have installed correctly, open your terminal/command prompt and type:
```bash
node --version
npm --version
```
*(You should see versions similar to `v20.x` or `v22.x` printed).*

#### 2. Installing Git (Source Control, Optional but Highly Recommended)
* **Windows**: Download the setup file at [https://git-scm.com](https://git-scm.com) and follow the Wizard's default checkmarks.
* **macOS**: Run `git` inside your terminal to trigger Apple's developer command-line tools installer or install via Homebrew (`brew install git`).
* **Linux**:
  ```bash
  sudo apt install -y git
  ```

---

### Part B: Running the Project Locally

Once the prerequisites are set, follow these steps to execute the high-fidelity CTI application locally on your computer.

#### Step 1: Obtain the Source Code
If using Git, clone the codebase to your chosen directory:
```bash
git clone <your-repository-url>
cd <your-repository-folder>
```
*If downloaded as a ZIP folder instead, extract the ZIP file into a standard directory and open your Terminal or Command Prompt in that exact folder.*

#### Step 2: Install Development Dependencies
Run the installation command to fetch all frontend and server packages (including Tailwind CLI, Express, typescript builders, and export tools):
```bash
npm install
```
*(This creates a `node_modules` folder inside your directory containing all required libraries).*

#### Step 3: Run the Development Server
Execute the single script command to mount the fully unified Express/Vite development server:
```bash
npm run dev
```

#### Step 4: Access the Application
You will see output in your terminal indicating the server is running:
```text
Server running on http://localhost:3000
```
Open your preferred web browser and navigate directly to:
```text
http://localhost:3000
```
Change the port number to what your terminal shows.

---

## Build & Production Deployment Specifications

### Production Bundle Compilation
To build the application for deployment onto remote secure servers (e.g., cloud platforms, local air-gapped environments, or internal CTI nodes), run:
```bash
npm run build
```
This performs a two-tier compile sequence:
1. Compiles and assets-processes the React single-page client application via **Vite** directly into optimized static static builds in `/dist`.
2. Compiles the TypeScript platform entry point (`server.ts`) using the high-performance **esbuild** engine into a self-contained CommonJS single-bundle `dist/server.cjs` file, guaranteeing simple standalone node starts without structural resolution anomalies.

### Production Use

NB! This project has been written for local use ONLY. The application does not implement proper security controls for production over networks.

# License

Created with Google AI Studio.

MIT License. Please attribute the author, resistec.