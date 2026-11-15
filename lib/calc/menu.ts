export type Ingredient = {
  id: string;
  name: string;
  qty: number;
  unit: string;
  unitCost: number;
};

export type Dish = {
  id: string;
  name: string;
  price: number;
  /** Null when the owner has not estimated monthly sales yet. */
  monthlyQty: number | null;
  ingredients: Ingredient[];
};

export type DishCost = {
  foodCost: number;
  margin: number;
  marginPct: number | null;
  foodPct: number | null;
};

export type Quadrant = "star" | "plowhorse" | "puzzle" | "dog";

export type ClassifiedDish = DishCost & {
  id: string;
  name: string;
  price: number;
  monthlyQty: number;
  quadrant: Quadrant;
};

export const quadrantCopy: Record<Quadrant, { name: string; advice: string }> = {
  star: {
    name: "明星",
    advice: "賣得多，一道也賺得多。先守住口味和份量，不要用折扣把它變便宜。",
  },
  plowhorse: {
    name: "耕馬",
    advice: "很多人都點，但一道賺的錢少。看能不能小幅調價、減一點成本，或搭一杯高毛利的飲料。",
  },
  puzzle: {
    name: "問號",
    advice: "賺得多，點的人少。先讓客人看得到：菜單位置、照片、服務生還有沒有推薦。不要急著拿掉。",
  },
  dog: {
    name: "退場候選",
    advice: "賣得少，賺得也少。若它不是帶路貨（例如兒童餐），考慮下架或重做。",
  },
};

export function ingredientCost(ingredient: Ingredient): number {
  return ingredient.qty * ingredient.unitCost;
}

export function costDish(dish: Pick<Dish, "price" | "ingredients">): DishCost {
  const foodCost = dish.ingredients.reduce((sum, ingredient) => sum + ingredientCost(ingredient), 0);
  const margin = dish.price - foodCost;
  return {
    foodCost,
    margin,
    marginPct: dish.price > 0 ? margin / dish.price : null,
    foodPct: dish.price > 0 ? foodCost / dish.price : null,
  };
}

export function classifyMenu(dishes: Dish[]): {
  rows: ClassifiedDish[];
  avgMargin: number;
  avgQty: number;
} | null {
  const ready = dishes.filter((dish): dish is Dish & { monthlyQty: number } =>
    dish.monthlyQty != null && dish.monthlyQty > 0 && dish.price > 0,
  );
  if (ready.length === 0) return null;
  const margins = ready.map((dish) => costDish(dish).margin);
  const avgMargin = margins.reduce((sum, value) => sum + value, 0) / ready.length;
  const avgQty = ready.reduce((sum, dish) => sum + dish.monthlyQty, 0) / ready.length;
  const rows = ready.map((dish) => {
    const cost = costDish(dish);
    let quadrant: Quadrant;
    const highMargin = cost.margin >= avgMargin;
    const highQty = dish.monthlyQty >= avgQty;
    if (highMargin && highQty) quadrant = "star";
    else if (!highMargin && highQty) quadrant = "plowhorse";
    else if (highMargin && !highQty) quadrant = "puzzle";
    else quadrant = "dog";
    return { ...cost, id: dish.id, name: dish.name, price: dish.price, monthlyQty: dish.monthlyQty, quadrant };
  });
  return { rows, avgMargin, avgQty };
}

function ingredient(id: string, name: string, qty: number, unit: string, unitCost: number): Ingredient {
  return { id, name, qty, unit, unitCost };
}

export const exampleDishes: Dish[] = [
  {
    id: "beef",
    name: "紅燒牛肉麵",
    price: 180,
    monthlyQty: 900,
    ingredients: [
      ingredient("b1", "牛腱", 0.12, "公斤", 360),
      ingredient("b2", "麵", 0.15, "公斤", 40),
      ingredient("b3", "豆瓣與調味", 1, "份", 4),
      ingredient("b4", "青菜", 0.05, "公斤", 40),
      ingredient("b5", "湯底分攤", 1, "份", 3),
    ],
  },
  {
    id: "clear",
    name: "清燉牛肉麵",
    price: 190,
    monthlyQty: 420,
    ingredients: [
      ingredient("c1", "牛腱", 0.12, "公斤", 360),
      ingredient("c2", "麵", 0.15, "公斤", 40),
      ingredient("c3", "清湯與調味", 1, "份", 8),
      ingredient("c4", "青菜", 0.05, "公斤", 40),
    ],
  },
  {
    id: "rice",
    name: "滷肉飯",
    price: 70,
    monthlyQty: 1100,
    ingredients: [
      ingredient("r1", "豬五花", 0.08, "公斤", 180),
      ingredient("r2", "飯", 0.2, "公斤", 20),
      ingredient("r3", "滷汁分攤", 1, "份", 2),
    ],
  },
  {
    id: "mix",
    name: "半筋半肉麵",
    price: 220,
    monthlyQty: 180,
    ingredients: [
      ingredient("m1", "牛腱", 0.1, "公斤", 360),
      ingredient("m2", "牛筋", 0.08, "公斤", 280),
      ingredient("m3", "麵", 0.15, "公斤", 40),
      ingredient("m4", "調味", 1, "份", 6),
      ingredient("m5", "青菜", 0.05, "公斤", 40),
    ],
  },
  {
    id: "soup",
    name: "貢丸湯",
    price: 50,
    monthlyQty: 800,
    ingredients: [
      ingredient("s1", "貢丸", 2, "顆", 6),
      ingredient("s2", "湯", 1, "份", 3),
    ],
  },
  {
    id: "side",
    name: "小菜拼盤",
    price: 60,
    monthlyQty: 350,
    ingredients: [ingredient("d1", "綜合小菜", 1, "份", 28)],
  },
  {
    id: "tea",
    name: "紅茶",
    price: 25,
    monthlyQty: 700,
    ingredients: [
      ingredient("t1", "茶葉與糖", 1, "杯", 3),
      ingredient("t2", "杯子", 1, "個", 1),
    ],
  },
  {
    id: "dumpling",
    name: "手工水餃（10 顆）",
    price: 120,
    monthlyQty: 150,
    ingredients: [
      ingredient("u1", "肉餡", 1, "份", 28),
      ingredient("u2", "麵皮", 10, "張", 0.8),
      ingredient("u3", "調味", 1, "份", 6),
    ],
  },
];
