export interface DiamondItem {
  id: string;
  value: string;
  relation: "AND" | "OR" | "NONE";
  children: DiamondItem[];
  ltiv?: string; // Last Time of Intelligence Value
}

export interface DiamondNode {
  title: "Adversary" | "Capability" | "Infrastructure" | "Victim";
  isInclusive: boolean; // true = inclusive (other items can be added to this vertex of the threat definition), false = exclusive (no other items can be added to this vertex of the threat definition)
  items: DiamondItem[];
}

export interface DiamondModel {
  id: string;
  title: string;
  creationDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD
  adversary: DiamondNode;
  capability: DiamondNode;
  infrastructure: DiamondNode;
  victim: DiamondNode;
  lastModified: string; // ISO string
}

export function createEmptyModel(title: string = ""): DiamondModel {
  const today = new Date().toISOString().split("T")[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const expiration = nextYear.toISOString().split("T")[0];

  return {
    id: Math.random().toString(36).substring(2, 11),
    title: title,
    creationDate: today,
    expirationDate: expiration,
    adversary: { title: "Adversary", isInclusive: true, items: [] },
    capability: { title: "Capability", isInclusive: true, items: [] },
    infrastructure: { title: "Infrastructure", isInclusive: true, items: [] },
    victim: { title: "Victim", isInclusive: true, items: [] },
    lastModified: new Date().toISOString()
  };
}
