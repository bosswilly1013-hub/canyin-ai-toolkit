"use client";

import { useState } from "react";
import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { classifyMenu, costDish, exampleDishes, ingredientCost, quadrantCopy, type Dish, type Ingredient } from "@/lib/calc/menu";
import { ntd, num, pct } from "@/lib/format";
import { uid } from "@/lib/id";
import { usePersisted } from "@/lib/storage";
import { NumberField } from "@/components/number-field";
import { Callout, Explain, StorageNote } from "@/components/tool-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const tone: Record<string, string> = {
  star: "bg-[#1d3c34] text-white",
  plowhorse: "bg-[#c48a12] text-[#1c1915]",
  puzzle: "bg-[#3d6f8c] text-white",
  dog: "bg-[#8d1d15] text-white",
};

export function MenuTool() {
  const { value, setValue, reset, fromStorage } = usePersisted("lazykit.v1.menu", { dishes: exampleDishes });
  const dishes = value.dishes;
  const [active, setActive] = useState(dishes[0]?.id ?? "");
  const current = dishes.find((dish) => dish.id === active) ?? dishes[0];
  const classified = classifyMenu(dishes);

  function updateDish(id: string, recipe: (dish: Dish) => Dish) {
    setValue({ dishes: dishes.map((dish) => (dish.id === id ? recipe(dish) : dish)) });
  }

  function updateIngredient(dishId: string, ingredientId: string, recipe: (ingredient: Ingredient) => Ingredient) {
    updateDish(dishId, (dish) => ({
      ...dish,
      ingredients: dish.ingredients.map((ingredient) => (ingredient.id === ingredientId ? recipe(ingredient) : ingredient)),
    }));
  }

  return (
    <div className="space-y-4">
      <StorageNote fromStorage={fromStorage} onReset={() => { reset(); setActive(exampleDishes[0].id); }} />
      <div className="flex flex-wrap gap-2">
        {dishes.map((dish) => (
          <Button key={dish.id} type="button" variant={dish.id === current?.id ? "default" : "outline"} className="h-11" onClick={() => setActive(dish.id)}>
            {dish.name}
          </Button>
        ))}
        <Button
          type="button"
          variant="secondary"
          className="h-11"
          onClick={() => {
            const id = uid("dish");
            setValue({
              dishes: [...dishes, { id, name: "新餐點", price: 100, monthlyQty: null, ingredients: [{ id: uid("ing"), name: "主料", qty: 1, unit: "份", unitCost: 30 }] }],
            });
            setActive(id);
          }}
        >
          加一道
        </Button>
      </div>

      {current ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-3">
                <Label>餐點名稱</Label>
                <Input value={current.name} onValueChange={(next) => updateDish(current.id, (dish) => ({ ...dish, name: next }))} />
              </div>
              <NumberField label="售價" suffix="元" value={current.price} onChange={(next) => updateDish(current.id, (dish) => ({ ...dish, price: next }))} />
              <NumberField
                label="一個月大約賣"
                suffix="份"
                value={current.monthlyQty ?? 0}
                onChange={(next) => updateDish(current.id, (dish) => ({ ...dish, monthlyQty: next > 0 ? next : null }))}
                hint="填 0 代表先不分象限"
              />
            </div>
            <div className="space-y-2">
              {current.ingredients.map((ingredient) => (
                <div key={ingredient.id} className="grid grid-cols-2 gap-2 rounded-xl bg-background p-2 sm:grid-cols-6">
                  <Input className="sm:col-span-2" value={ingredient.name} onValueChange={(next) => updateIngredient(current.id, ingredient.id, (item) => ({ ...item, name: next }))} aria-label="原料名稱" />
                  <DecimalCell value={ingredient.qty} label="用量" onChange={(next) => updateIngredient(current.id, ingredient.id, (item) => ({ ...item, qty: next }))} />
                  <Input value={ingredient.unit} onValueChange={(next) => updateIngredient(current.id, ingredient.id, (item) => ({ ...item, unit: next }))} aria-label="單位" />
                  <DecimalCell value={ingredient.unitCost} label="單位成本" onChange={(next) => updateIngredient(current.id, ingredient.id, (item) => ({ ...item, unitCost: next }))} />
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="num">{ntd(ingredientCost(ingredient))}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => updateDish(current.id, (dish) => ({ ...dish, ingredients: dish.ingredients.filter((item) => item.id !== ingredient.id) }))}>
                      刪
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() =>
                  updateDish(current.id, (dish) => ({
                    ...dish,
                    ingredients: [...dish.ingredients, { id: uid("ing"), name: "新原料", qty: 1, unit: "份", unitCost: 0 }],
                  }))
                }
              >
                加原料
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">單位要對齊。用量 0.12 公斤，單位成本就填這一公斤多少錢。</p>
            </div>
          </div>
          <DishResult dish={current} />
        </div>
      ) : (
        <Callout>先加一道餐點。</Callout>
      )}

      <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/10">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">餐點</th>
              <th className="px-3 py-2 font-medium">售價</th>
              <th className="px-3 py-2 font-medium">食材</th>
              <th className="px-3 py-2 font-medium">食材比</th>
              <th className="px-3 py-2 font-medium">一道毛利</th>
              <th className="px-3 py-2 font-medium">月銷量</th>
              <th className="px-3 py-2 font-medium">象限</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish) => {
              const cost = costDish(dish);
              const row = classified?.rows.find((item) => item.id === dish.id);
              return (
                <tr key={dish.id} className="border-t border-border">
                  <td className="px-3 py-2">{dish.name}</td>
                  <td className="num px-3 py-2">{ntd(dish.price)}</td>
                  <td className="num px-3 py-2">{ntd(cost.foodCost)}</td>
                  <td className="num px-3 py-2">{pct(cost.foodPct)}</td>
                  <td className="num px-3 py-2">{ntd(cost.margin)}</td>
                  <td className="num px-3 py-2">{dish.monthlyQty ?? "—"}</td>
                  <td className="px-3 py-2">
                    {row ? <span className={`rounded-full px-2 py-0.5 text-xs ${tone[row.quadrant]}`}>{quadrantCopy[row.quadrant].name}</span> : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {classified ? (
        <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
          <h2 className="text-base font-semibold">跟平均比</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            平均一道毛利 {ntd(classified.avgMargin)}，平均一個月 {num(classified.avgQty, 0)} 份。線的右邊比較好賣，線的上面一道賺比較多。
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid stroke="#e4d9c8" />
                <XAxis dataKey="monthlyQty" name="月銷量" tick={{ fontSize: 12 }} />
                <YAxis dataKey="margin" name="毛利額" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value, name) => [typeof value === "number" ? num(value, 1) : value, name === "margin" ? "毛利額" : "月銷量"]} />
                <ReferenceLine x={classified.avgQty} stroke="#1d3c34" />
                <ReferenceLine y={classified.avgMargin} stroke="#e15a2b" />
                <Scatter data={classified.rows} fill="#e15a2b" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {classified.rows.map((row) => (
              <li key={row.id}>
                <Badge className={tone[row.quadrant]}>{quadrantCopy[row.quadrant].name}</Badge>
                <span className="ml-2">{row.name}：{quadrantCopy[row.quadrant].advice}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Callout>填了月銷量才會分成四象限。成本仍然算得出來。</Callout>
      )}

      <Explain title="怎麼看結果">
        <p>食材成本是每一列「用量 × 單位成本」的加總。食材比＝食材成本 ÷ 售價。一道毛利＝售價 − 食材成本，這還沒扣房租和人事。</p>
        <p>象限看的是賺幾塊錢，不是只看百分比。紅茶的食材比可以很低，但一杯只賺二十元上下，要很多杯才補得起店租。教科書裡的 Dog，這裡叫做退場候選。</p>
      </Explain>
      <Explain title="算給你看">
        <p>
          範例是同一間麵店的八樣東西。紅燒牛肉麵用 0.12 公斤牛腱（每公斤 360 元）加上麵、調味、青菜和湯底，食材約 58 元，售價 180。
          恢復範例之後，牛肉麵會落在明星，滷肉飯和紅茶人多但一道賺得少，半筋半肉麵賺得多但點的人少，小菜拼盤兩個都偏低。
        </p>
      </Explain>
    </div>
  );
}

function DecimalCell({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);
  return (
    <Input
      aria-label={label}
      inputMode="decimal"
      value={focused ? text : String(value)}
      onFocus={() => {
        setFocused(true);
        setText(String(value));
      }}
      onBlur={() => setFocused(false)}
      onValueChange={(next) => {
        setText(next);
        if (next.trim() === "" || next === "-" || next === "." || next.endsWith(".")) return;
        const parsed = Number(next);
        if (Number.isFinite(parsed)) onChange(parsed);
      }}
    />
  );
}

function DishResult({ dish }: { dish: Dish }) {
  const cost = costDish(dish);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl bg-[#1c1915] p-4 text-[#fff8f3]">
        <div className="text-xs text-[#fff8f3]/70">食材成本</div>
        <div className="num mt-1 text-3xl font-semibold">{ntd(cost.foodCost)}</div>
        <div className="mt-1 text-xs text-[#fff8f3]/70">食材比 {pct(cost.foodPct)}</div>
      </div>
      <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="text-xs text-muted-foreground">一道毛利</div>
        <div className="num mt-1 text-3xl font-semibold">{ntd(cost.margin)}</div>
        <div className="mt-1 text-xs text-muted-foreground">毛利率 {pct(cost.marginPct)}</div>
      </div>
    </div>
  );
}
