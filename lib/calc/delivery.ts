import { parseCsv, parseLooseNumber } from "@/lib/csv";

export type DeliveryInput = {
  name: string;
  inStorePrice: number;
  foodCost: number;
  packaging: number;
  /** Percent taken from the listed delivery price, 0–100. */
  commissionPct: number;
  platformFee: number;
  /**
   * Target gross margin on money actually received
   * after commission and the per-order fee. 0–100.
   * Food and packaging are deducted before the margin.
   */
  targetMarginPct: number;
};

export type PriceScenario = {
  price: number;
  commission: number;
  net: number;
  leftover: number;
  marginOnNet: number | null;
  marginOnPrice: number | null;
};

export type DeliveryQuote =
  | {
      ok: true;
      directCost: number;
      netNeeded: number;
      exactPrice: number;
      suggestedPrice: number;
      quote: PriceScenario;
      inStore: PriceScenario | null;
      markupVsInStore: number | null;
    }
  | { ok: false; reason: string };

export const exampleDelivery: DeliveryInput = {
  name: "紅燒牛肉麵",
  inStorePrice: 180,
  foodCost: 58,
  packaging: 6,
  commissionPct: 35,
  platformFee: 0,
  targetMarginPct: 55,
};

export const deliveryTemplateRows: (string | number)[][] = [
  ["品項", "店內售價", "食材成本", "包材成本", "抽成比例", "每單平台費", "目標毛利率"],
  ["紅燒牛肉麵", 180, 58, 6, 35, 0, 55],
  ["滷肉飯", 70, 22, 4, "", "", ""],
  ["貢丸湯", 50, 14, 4, "", "", ""],
  ["招牌小菜", 40, 12, 3, "", "", ""],
  ["紅茶", 25, 4, 2, "", "", ""],
];

export function roundUpToStep(value: number, step: number): number {
  if (!Number.isFinite(value) || step <= 0) return value;
  return Math.ceil((value - 1e-9) / step) * step;
}

export function scenarioAtPrice(input: DeliveryInput, price: number): PriceScenario {
  const commissionRate = input.commissionPct / 100;
  const commission = price * commissionRate;
  const net = price * (1 - commissionRate) - input.platformFee;
  const leftover = net - input.foodCost - input.packaging;
  return {
    price,
    commission,
    net,
    leftover,
    marginOnNet: net > 0 ? leftover / net : null,
    marginOnPrice: price > 0 ? leftover / price : null,
  };
}

export function quoteDelivery(input: DeliveryInput): DeliveryQuote {
  const directCost = input.foodCost + input.packaging;
  if (input.commissionPct < 0 || input.commissionPct >= 100) {
    return { ok: false, reason: "抽成要介於 0% 和 100% 之間，100% 代表平台把售價全拿走。" };
  }
  if (input.targetMarginPct < 0 || input.targetMarginPct >= 100) {
    return { ok: false, reason: "目標毛利率要小於 100%。100% 代表食材包材不用錢，這組數字沒有售價解。" };
  }
  if (directCost < 0 || input.platformFee < 0) {
    return { ok: false, reason: "成本與每單費用不能是負的。" };
  }
  if (directCost === 0 && input.platformFee === 0) {
    return { ok: false, reason: "食材、包材和每單費用都是 0，沒有要攤的成本，算不出建議售價。" };
  }

  const netNeeded = directCost / (1 - input.targetMarginPct / 100);
  const exactPrice = (netNeeded + input.platformFee) / (1 - input.commissionPct / 100);
  if (!Number.isFinite(exactPrice) || exactPrice <= 0) {
    return { ok: false, reason: "這組數字算不出正的售價。請檢查抽成、目標毛利和成本。" };
  }

  const suggestedPrice = roundUpToStep(exactPrice, 10);
  const inStore = input.inStorePrice > 0 ? scenarioAtPrice(input, input.inStorePrice) : null;
  return {
    ok: true,
    directCost,
    netNeeded,
    exactPrice,
    suggestedPrice,
    quote: scenarioAtPrice(input, suggestedPrice),
    inStore,
    markupVsInStore:
      input.inStorePrice > 0 ? suggestedPrice / input.inStorePrice - 1 : null,
  };
}

const HEADER_ALIASES: Record<string, string[]> = {
  name: ["品項", "名稱", "餐點", "name", "item"],
  inStorePrice: ["店內售價", "售價", "店內價", "price"],
  foodCost: ["食材成本", "食材", "食物成本", "food"],
  packaging: ["包材成本", "包材", "packaging"],
  commissionPct: ["抽成比例", "抽成", "佣金", "commission"],
  platformFee: ["每單平台費", "平台費", "每單費用", "費用", "fee"],
  targetMarginPct: ["目標毛利率", "目標毛利", "毛利率", "margin"],
};

function normHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export type ParsedMenu = {
  items: DeliveryInput[];
  errors: string[];
  decimalCommissionWarning: boolean;
};

export function parseMenuTable(rows: string[][], globals: DeliveryInput): ParsedMenu {
  const errors: string[] = [];
  if (rows.length === 0) return { items: [], errors: ["沒有讀到任何列。"], decimalCommissionWarning: false };

  const headerIndex = rows.findIndex((row) =>
    row.some((cell) => {
      const key = normHeader(cell);
      return HEADER_ALIASES.name.some((alias) => key === normHeader(alias)) ||
        HEADER_ALIASES.inStorePrice.some((alias) => key === normHeader(alias));
    }),
  );
  const header = headerIndex >= 0 ? rows[headerIndex] : null;
  const body = header ? rows.slice(headerIndex + 1) : rows;

  function column(field: string): number {
    if (!header) {
      const order = ["name", "inStorePrice", "foodCost", "packaging", "commissionPct", "platformFee", "targetMarginPct"];
      return order.indexOf(field);
    }
    return header.findIndex((cell) =>
      HEADER_ALIASES[field].some((alias) => normHeader(cell) === normHeader(alias)),
    );
  }

  const columns = {
    name: column("name"),
    inStorePrice: column("inStorePrice"),
    foodCost: column("foodCost"),
    packaging: column("packaging"),
    commissionPct: column("commissionPct"),
    platformFee: column("platformFee"),
    targetMarginPct: column("targetMarginPct"),
  };

  if (columns.inStorePrice < 0 || columns.foodCost < 0) {
    return {
      items: [],
      errors: ["找不到「店內售價」或「食材成本」欄。請用範本的標題列。"],
      decimalCommissionWarning: false,
    };
  }

  const items: DeliveryInput[] = [];
  const commissionValues: number[] = [];

  body.forEach((row, index) => {
    if (row.every((cell) => cell.trim() === "")) return;
    const read = (key: keyof typeof columns): string => {
      const at = columns[key];
      return at >= 0 ? (row[at] ?? "") : "";
    };
    const name = read("name") || `未命名 ${index + 1}`;
    const inStorePrice = parseLooseNumber(read("inStorePrice"));
    const foodCost = parseLooseNumber(read("foodCost"));
    if (inStorePrice == null || foodCost == null) {
      errors.push(`第 ${index + 1} 列「${name}」的售價或食材成本不是數字，已略過。`);
      return;
    }
    const packaging = parseLooseNumber(read("packaging"));
    const commission = parseLooseNumber(read("commissionPct"));
    const fee = parseLooseNumber(read("platformFee"));
    const margin = parseLooseNumber(read("targetMarginPct"));
    if (commission != null) commissionValues.push(commission);
    items.push({
      name,
      inStorePrice,
      foodCost,
      packaging: packaging ?? globals.packaging,
      commissionPct: commission ?? globals.commissionPct,
      platformFee: fee ?? globals.platformFee,
      targetMarginPct: margin ?? globals.targetMarginPct,
    });
  });

  const decimalCommissionWarning =
    commissionValues.length > 0 && commissionValues.every((value) => value > 0 && value <= 1);

  if (items.length === 0 && errors.length === 0) {
    errors.push("標題列下面沒有餐點。");
  }

  return { items, errors, decimalCommissionWarning };
}

export function parseMenuCsv(text: string, globals: DeliveryInput): ParsedMenu {
  return parseMenuTable(parseCsv(text), globals);
}
