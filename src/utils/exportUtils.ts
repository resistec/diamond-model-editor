import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { DiamondModel, DiamondItem } from "../types";

/**
 * 1. Exports the Diamond Model project to nested JSON format.
 */
export function exportToJSON(model: DiamondModel) {
  const titleSlug = (model.title || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "unnamed-campaign";
  const filename = `diamond-model-${titleSlug}-${model.id}.json`;
  
  const blob = new Blob([JSON.stringify(model, null, 2)], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to recursively flatten DiamondItems for CSV generation.
 */
function flattenItems(items: DiamondItem[], pathPrefix = ""): { path: string; relation: string; ltiv: string }[] {
  let list: { path: string; relation: string; ltiv: string }[] = [];
  for (const item of items) {
    const currentPath = pathPrefix ? `${pathPrefix} ➔ ${item.value}` : item.value;
    list.push({ path: currentPath, relation: item.relation, ltiv: item.ltiv || "N/A" });
    if (item.children && item.children.length > 0) {
      list = [...list, ...flattenItems(item.children, currentPath)];
    }
  }
  return list;
}

/**
 * 2. Exports the model to a flat CSV schema.
 */
export function exportToCSV(model: DiamondModel) {
  const title = (model.title || "").trim() || "Unnamed Campaign";
  const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const filename = `diamond-model-${titleSlug}-${model.id}.csv`;

  const headers = [
    "Campaign Title",
    "Creation Date",
    "Expiration Date",
    "Node Name",
    "Node Constraint",
    "Indicator Path",
    "Relation operator with sibling",
    "Last Time of Intelligence Value (LTIV)"
  ];

  const rows: string[][] = [headers];

  const nodes = [
    { name: "Adversary", node: model.adversary },
    { name: "Capability", node: model.capability },
    { name: "Infrastructure", node: model.infrastructure },
    { name: "Victim", node: model.victim }
  ];

  for (const n of nodes) {
    const flatList = flattenItems(n.node.items);
    if (flatList.length === 0) {
      rows.push([
        title,
        model.creationDate,
        model.expirationDate,
        n.name,
        n.node.isInclusive ? "INCLUSIVE" : "EXCLUSIVE",
        "(No elements defined)",
        "NONE",
        "N/A"
      ]);
    } else {
      for (const item of flatList) {
        rows.push([
          title,
          model.creationDate,
          model.expirationDate,
          n.name,
          n.node.isInclusive ? "INCLUSIVE" : "EXCLUSIVE",
          item.path,
          item.relation,
          item.ltiv
        ]);
      }
    }
  }

  // Convert array to CSV string
  const csvContent = "data:text/csv;charset=utf-8," 
    + rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 3. Captures #diamond-canvas-container and downloads high-quality PNG.
 */
export async function exportToPNG(containerId: string, title: string) {
  const element = document.getElementById(containerId);
  if (!element) {
    alert("Could not locate Diamond graphic element for capture.");
    return;
  }
  
  try {
    // Generate modern canvas graphic via SVG foreignObject mechanism
    const dataUrl = await toPng(element, {
      backgroundColor: "#ffffff",
      pixelRatio: 2, // Double resolution for crisp rendering
      style: {
        boxShadow: "none",
        borderRadius: "0px",
      }
    });

    const titleSlug = (title || "unnamed-campaign").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filename = `diamond-graphic-${titleSlug}.png`;

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("PNG export generation failed:", error);
  }
}

/**
 * 4. Generates standard PDF Threat Intel report.
 */
export function exportToPDF(model: DiamondModel) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const title = (model.title || "").trim() || "Unnamed Threat Campaign";
  const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  // Set margins and positions
  const margin = 20;
  let currentY = 25;

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(17, 17, 17); // Dark charcoal
  doc.text("CYBER THREAT INTELLIGENCE ANALYSIS REPORT", margin, currentY);
  currentY += 6;

  // Thin separator
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0); // Black accent
  doc.line(margin, currentY, 190, currentY);
  currentY += 8;

  // Subtitle / Framework indicator
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text("DIAMOND MODEL", margin, currentY);
  currentY += 12;

  // Meta info grid layout
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);

  // Left col meta
  doc.setFont("helvetica", "bold");
  doc.text("Campaign Name:", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(title, margin + 35, currentY);
  currentY += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Model ID:", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(model.id, margin + 35, currentY);
  currentY += 6;

  // Dates
  doc.setFont("helvetica", "bold");
  doc.text("Creation Date:", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(model.creationDate, margin + 35, currentY);
  currentY += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Expiration Date:", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(model.expirationDate || "N/A", margin + 35, currentY);
  currentY += 12;

  // Section header: Node lists
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("DIAMOND MODEL COMPONENTS", margin, currentY);
  currentY += 4;
  
  doc.setLineWidth(0.2);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY, 190, currentY);
  currentY += 8;

  // Recursively format item trees for PDF printing
  const writePDFItems = (items: DiamondItem[], indent = 0) => {
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const val = item.value.trim() ? item.value : "(Pending attribution entry)";
      
      let relationPadding = "";
      if (indent > 0 || idx > 0) {
        relationPadding = item.relation === "AND" ? "AND " : "OR ";
      }
      
      const tabStop = margin + 10 + indent * 8;
      const bulletChar = indent > 0 ? " " : "- ";
      const ltivSuffix = item.ltiv ? ` [LTIV: ${item.ltiv}]` : "";
      const outputLine = `${relationPadding}${bulletChar}${val}${ltivSuffix}`;

      doc.setFont("helvetica", indent > 0 ? "italic" : "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      
      // Page wrapping constraint
      if (currentY > 275) {
        doc.addPage();
        currentY = margin;
      }
      
      doc.text(outputLine, tabStop, currentY);
      currentY += 5.5;

      if (item.children && item.children.length > 0) {
        writePDFItems(item.children, indent + 1);
      }
    }
  };

  const nodes = [
    { title: "Adversary", data: model.adversary },
    { title: "Capability", data: model.capability },
    { title: "Infrastructure", data: model.infrastructure },
    { title: "Victim", data: model.victim }
  ];

  for (const n of nodes) {
    if (currentY > 265) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 17, 17);
    const mode = n.data.isInclusive ? "INCLUSIVE" : "EXCLUSIVE";
    doc.text(`${n.title.toUpperCase()} (${mode})`, margin, currentY);
    currentY += 4.5;

    if (n.data.items.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(140, 140, 140);
      doc.text("   (No indicators defined in this node)", margin, currentY);
      currentY += 8;
    } else {
      writePDFItems(n.data.items, 0);
      currentY += 4;
    }
  }

  // Footer label
  if (currentY > 280) {
    doc.addPage();
    currentY = margin;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated locally via Diamond Model Builder on ${new Date().toLocaleDateString()}`, margin, 287);

  doc.save(`diamond-report-${titleSlug}-${model.id}.pdf`);
}

/**
 * Generates an RFC4122 v4 compliant UUID.
 */
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 5. Exports the Diamond Model to a STIX 2.1 Compliant JSON Bundle.
 * This maps:
 *   - Campaign -> STIX "campaign"
 *   - Adversary -> STIX "threat-actor" SDOs
 *   - Capability -> STIX "tool" or "malware" SDOs
 *   - Infrastructure -> STIX "infrastructure" SDOs
 *   - Victim -> STIX "identity" SDOs
 *   - Any node items with LTIV are also backed by STIX "indicator" SDOs with standard pattern matches.
 *   - All objects are linked through STIX Relationship Objects (SROs).
 */
export function exportToSTIX(model: DiamondModel) {
  const currentISO = new Date().toISOString();
  const createdDate = model.creationDate ? `${model.creationDate}T00:00:00.000Z` : currentISO;
  const modifiedDate = model.lastModified ? new Date(model.lastModified).toISOString() : currentISO;
  
  const campaignId = `campaign--${uuidv4()}`;
  const campaignObject: any = {
    type: "campaign",
    id: campaignId,
    spec_version: "2.1",
    name: model.title || "Unnamed Campaign",
    description: `A Diamond Intrusion Model campaign. Adversary Constraints: [${model.adversary.isInclusive ? "INCLUSIVE" : "EXCLUSIVE"}], Capability: [${model.capability.isInclusive ? "INCLUSIVE" : "EXCLUSIVE"}], Infrastructure: [${model.infrastructure.isInclusive ? "INCLUSIVE" : "EXCLUSIVE"}], Victim: [${model.victim.isInclusive ? "INCLUSIVE" : "EXCLUSIVE"}]. Output generated by CTI Analyst Platform.`,
    created: createdDate,
    modified: modifiedDate,
    aliases: [model.title || "Unnamed Campaign"]
  };

  const stixObjects: any[] = [campaignObject];

  // Helper to trace and generate clean STIX patterns
  const getSTIXPattern = (value: string): { pattern: string; type: string } => {
    const val = value.trim();
    // IP pattern
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(val)) {
      return { pattern: `[ipv4-addr:value = '${val}']`, type: "ipv4-addr" };
    }
    // MD5/SHA hashes
    if (/^[a-fA-F0-9]{32}$/.test(val)) {
      return { pattern: `[file:hashes.MD5 = '${val}']`, type: "file-hash-md5" };
    }
    if (/^[a-fA-F0-9]{64}$/.test(val)) {
      return { pattern: `[file:hashes.'SHA-256' = '${val}']`, type: "file-hash-sha256" };
    }
    // Domain / URL pattern
    if (/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(val)) {
      return { pattern: `[domain-name:value = '${val}']`, type: "domain-name" };
    }
    if (/^https?:\/\//.test(val)) {
      return { pattern: `[url:value = '${val}']`, type: "url" };
    }
    // Default fallback pattern
    return { pattern: `[file:name = '${val.replace(/'/g, "\\'")}']`, type: "generic-indicator" };
  };

  // Traverses nested DiamondItems recursively to generate SDOs and SROs
  const processItems = (
    items: DiamondItem[],
    sdoType: "threat-actor" | "tool" | "malware" | "infrastructure" | "identity",
    parentSdoId: string | null = null
  ) => {
    for (const item of items) {
      if (!item.value.trim()) continue;

      const itemUuid = uuidv4();
      const sdoId = `${sdoType}--${itemUuid}`;
      
      // Determine base SDO attributes
      let sdoObject: any = {
        type: sdoType,
        id: sdoId,
        spec_version: "2.1",
        name: item.value,
        created: createdDate,
        modified: modifiedDate,
        description: `Determined attribute in the Diamond Model campaign. Relationship operator with sibling: ${item.relation || "NONE"}`
      };

      if (sdoType === "identity") {
        sdoObject.identity_class = "organization";
        sdoObject.sectors = ["technology"];
      } else if (sdoType === "threat-actor") {
        sdoObject.roles = ["sponsor", "malicious-actor"];
      } else if (sdoType === "infrastructure") {
        sdoObject.infrastructure_types = ["command-and-control"];
      }

      stixObjects.push(sdoObject);

      // Create primary relationships linking SDOs to the Campaign
      if (sdoType === "threat-actor") {
        stixObjects.push({
          type: "relationship",
          id: `relationship--${uuidv4()}`,
          spec_version: "2.1",
          relationship_type: "attributed-to",
          source_ref: campaignId,
          target_ref: sdoId,
          created: createdDate,
          modified: modifiedDate
        });
      } else if (sdoType === "identity") {
        stixObjects.push({
          type: "relationship",
          id: `relationship--${uuidv4()}`,
          spec_version: "2.1",
          relationship_type: "targets",
          source_ref: campaignId,
          target_ref: sdoId,
          created: createdDate,
          modified: modifiedDate
        });
      } else {
        stixObjects.push({
          type: "relationship",
          id: `relationship--${uuidv4()}`,
          spec_version: "2.1",
          relationship_type: "uses",
          source_ref: campaignId,
          target_ref: sdoId,
          created: createdDate,
          modified: modifiedDate
        });
      }

      // Link nested child items to their parent SDO with a standard relationship
      if (parentSdoId) {
        stixObjects.push({
          type: "relationship",
          id: `relationship--${uuidv4()}`,
          spec_version: "2.1",
          relationship_type: "related-to",
          source_ref: parentSdoId,
          target_ref: sdoId,
          created: createdDate,
          modified: modifiedDate
        });
      }

      // Always companion with an SDO "indicator" if it contains an active value / pattern
      const patternData = getSTIXPattern(item.value);
      const indicatorId = `indicator--${uuidv4()}`;
      const indicatorObject: any = {
        type: "indicator",
        id: indicatorId,
        spec_version: "2.1",
        name: `Indicator for ${item.value}`,
        description: `CTI Indicator extracted from Diamond Model. Sibling logic: ${item.relation || "NONE"}`,
        pattern: patternData.pattern,
        pattern_type: "stix",
        pattern_version: "2.1",
        valid_from: createdDate,
        created: createdDate,
        modified: modifiedDate
      };

      if (item.ltiv) {
        indicatorObject.valid_until = `${item.ltiv}T00:00:00.000Z`;
      }

      stixObjects.push(indicatorObject);

      // Link indicator objects to the related asset SDO via STIX 'indicates' SRO
      stixObjects.push({
        type: "relationship",
        id: `relationship--${uuidv4()}`,
        spec_version: "2.1",
        relationship_type: "indicates",
        source_ref: indicatorId,
        target_ref: sdoId,
        created: createdDate,
        modified: modifiedDate
      });

      // Recurse into children nodes and link them
      if (item.children && item.children.length > 0) {
        processItems(item.children, sdoType, sdoId);
      }
    }
  };

  // Convert the 4 Diamond nodes to standard objects
  processItems(model.adversary.items, "threat-actor");
  
  // Decide if Capability represents "malware" or "tool" objects. We will inspect standard terms.
  const capabilityItems = model.capability.items;
  const isMalwareLikely = capabilityItems.some(i => 
    i.value.toLowerCase().includes("malware") || 
    i.value.toLowerCase().includes("exploit") || 
    i.value.toLowerCase().includes("payload") ||
    i.value.toLowerCase().includes("trojan")
  );
  processItems(capabilityItems, isMalwareLikely ? "malware" : "tool");
  
  processItems(model.infrastructure.items, "infrastructure");
  processItems(model.victim.items, "identity");

  // Construct complete Bundle object
  const bundle = {
    type: "bundle",
    id: `bundle--${uuidv4()}`,
    spec_version: "2.1",
    objects: stixObjects
  };

  // Download the resulting STIX 2.1 compliance package
  const titleSlug = (model.title || "unnamed-campaign").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const filename = `stix-bundle-${titleSlug}-${model.id}.json`;
  
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
