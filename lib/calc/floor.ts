export type FloorKind = "table2" | "table4" | "counter" | "kitchen" | "fridge" | "door";

export type FloorItem = {
  id: string;
  kind: FloorKind;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type FloorState = {
  widthM: number;
  depthM: number;
  snap: boolean;
  items: FloorItem[];
};

export const floorKinds: Record<FloorKind, { label: string; w: number; h: number; hint: string }> = {
  table2: { label: "雙人座", w: 1.2, h: 1.2, hint: "含拉椅子的位置" },
  table4: { label: "四人座", w: 1.6, h: 1.6, hint: "含拉椅子的位置" },
  counter: { label: "櫃檯", w: 2.4, h: 0.6, hint: "含站人的操作面" },
  kitchen: { label: "廚房", w: 3, h: 2.2, hint: "工作區外框" },
  fridge: { label: "冰箱", w: 0.8, h: 0.8, hint: "含開門" },
  door: { label: "入口", w: 0.9, h: 0.4, hint: "門扇位置" },
};

export type AisleLevel = "overlap" | "tight";

export type AisleIssue = {
  level: AisleLevel;
  message: string;
};

export type AisleReport = {
  issues: AisleIssue[];
  narrowest: { a: string; b: string; gapM: number } | null;
};

const TIGHT_M = 0.75;
const FLUSH_M = 0.05;

function axisGap(a0: number, a1: number, b0: number, b1: number): number {
  if (a1 <= b0) return b0 - a1;
  if (b1 <= a0) return a0 - b1;
  return Math.max(a0, b0) - Math.min(a1, b1);
}

function isTable(kind: FloorKind): boolean {
  return kind === "table2" || kind === "table4";
}

export function checkAisles(state: Pick<FloorState, "widthM" | "depthM" | "items">): AisleReport {
  const issues: AisleIssue[] = [];
  let narrowest: AisleReport["narrowest"] = null;

  for (const item of state.items) {
    const sides = [
      { side: "左牆", gap: item.x },
      { side: "後牆", gap: item.y },
      { side: "右牆", gap: state.widthM - (item.x + item.w) },
      { side: "前牆", gap: state.depthM - (item.y + item.h) },
    ];
    for (const side of sides) {
      if (side.gap > FLUSH_M && side.gap < TIGHT_M) {
        issues.push({
          level: "tight",
          message: `${item.name}離${side.side}只有 ${Math.round(side.gap * 100)} 公分。要嘛貼齊，要嘛留至少 75 公分，否則這邊不好走。`,
        });
      }
    }
  }

  for (let i = 0; i < state.items.length; i++) {
    for (let j = i + 1; j < state.items.length; j++) {
      const a = state.items[i];
      const b = state.items[j];
      const gapX = axisGap(a.x, a.x + a.w, b.x, b.x + b.w);
      const gapY = axisGap(a.y, a.y + a.h, b.y, b.y + b.h);
      const overlapX = gapX < -0.01;
      const overlapY = gapY < -0.01;
      let gap: number | null = null;
      if (overlapX && overlapY) {
        issues.push({
          level: "overlap",
          message: `${a.name}和${b.name}疊在一起了。`,
        });
        continue;
      } else if (overlapX) gap = Math.max(0, gapY);
      else if (overlapY) gap = Math.max(0, gapX);
      else continue;

      if (gap <= FLUSH_M) {
        if (isTable(a.kind) && isTable(b.kind)) {
          issues.push({
            level: "tight",
            message: `${a.name}和${b.name}幾乎貼在一起，客人拉不出椅子。`,
          });
        }
        continue;
      }

      if (gap < TIGHT_M) {
        issues.push({
          level: "tight",
          message: `${a.name}和${b.name}之間只有 ${Math.round(gap * 100)} 公分，建議至少 75 公分。`,
        });
      }
      if (!narrowest || gap < narrowest.gapM) {
        narrowest = { a: a.name, b: b.name, gapM: gap };
      }
    }
  }

  return { issues, narrowest };
}

export function exampleFloor(): FloorState {
  return {
    widthM: 5,
    depthM: 8,
    snap: true,
    items: [
      { id: "kitchen", kind: "kitchen", name: "廚房", x: 0, y: 0, w: 5, h: 2.2 },
      { id: "counter", kind: "counter", name: "櫃檯", x: 0, y: 2.2, w: 5, h: 0.6 },
      { id: "t1", kind: "table4", name: "四人桌 A", x: 0, y: 3.7, w: 1.6, h: 1.6 },
      { id: "t2", kind: "table4", name: "四人桌 B", x: 3.4, y: 3.7, w: 1.6, h: 1.6 },
      { id: "door", kind: "door", name: "入口", x: 2.05, y: 7.6, w: 0.9, h: 0.4 },
    ],
  };
}

export function clampItem(item: FloorItem, widthM: number, depthM: number): FloorItem {
  const w = Math.min(item.w, widthM);
  const h = Math.min(item.h, depthM);
  return {
    ...item,
    w,
    h,
    x: Math.min(Math.max(0, item.x), Math.max(0, widthM - w)),
    y: Math.min(Math.max(0, item.y), Math.max(0, depthM - h)),
  };
}
