"use client";

import { exampleTargets, splitTarget, type TargetInput } from "@/lib/calc/targets";
import { ntd, num } from "@/lib/format";
import { usePersisted } from "@/lib/storage";
import { NumberField } from "@/components/number-field";
import { Callout, Explain, Stat, StorageNote } from "@/components/tool-bits";

export function TargetsTool() {
  const { value, setValue, reset, fromStorage } = usePersisted("lazykit.v1.targets", exampleTargets);
  const result = splitTarget(value);

  function set<K extends keyof TargetInput>(key: K, next: TargetInput[K]) {
    setValue({ ...value, [key]: next });
  }

  return (
    <div className="space-y-4">
      <StorageNote fromStorage={fromStorage} onReset={reset} />
      <div className="grid gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2 lg:grid-cols-3">
        <p className="text-xs leading-5 text-muted-foreground sm:col-span-2 lg:col-span-3">金額可以打 500,000。時段或來源沒加滿 100% 也會先照比例拆給你看。</p>
        <NumberField label="這個月想做的營業額" suffix="元" min={0} max={1e12} value={value.monthlyTarget} onChange={(next) => set("monthlyTarget", next)} />
        <NumberField label="平日天數" suffix="天" min={0} max={31} value={value.weekdays} onChange={(next) => set("weekdays", next)} hint="星期一到五，扣掉公休" />
        <NumberField label="週末天數" suffix="天" min={0} max={31} value={value.weekendDays} onChange={(next) => set("weekendDays", next)} />
        <NumberField label="週末是平日的幾倍" suffix="倍" min={0.1} max={10} step="0.05" value={value.weekendRatio} onChange={(next) => set("weekendRatio", next)} hint="1.45 代表週末多 45%" />
        <NumberField label="客單價" suffix="元" min={0} max={1e12} value={value.avgTicket} onChange={(next) => set("avgTicket", next)} />
        <NumberField label="午餐占比" suffix="%" min={0} max={100} value={value.lunchPct} onChange={(next) => set("lunchPct", next)} />
        <NumberField label="晚餐占比" suffix="%" min={0} max={100} value={value.dinnerPct} onChange={(next) => set("dinnerPct", next)} />
        <NumberField label="其他時段占比" suffix="%" min={0} max={100} value={value.otherPct} onChange={(next) => set("otherPct", next)} hint="下午茶、宵夜" />
        <NumberField label="回購占比" suffix="%" min={0} max={100} value={value.returningPct} onChange={(next) => set("returningPct", next)} />
        <NumberField label="介紹占比" suffix="%" min={0} max={100} value={value.referralPct} onChange={(next) => set("referralPct", next)} hint="老客人帶來的" />
        <NumberField label="新客占比" suffix="%" min={0} max={100} value={value.newPct} onChange={(next) => set("newPct", next)} />
      </div>

      {"error" in result ? (
        <Callout tone="bad">{result.error}</Callout>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="平日一天" value={ntd(result.weekday.revenue)} hint={`${num(result.weekday.customers, 1)} 人`} />
            <Stat label="週末一天" value={ntd(result.weekend.revenue)} hint={`${num(result.weekend.customers, 1)} 人`} />
            <Stat label="全月來客" value={`${num(result.monthlyCustomers, 0)} 人`} hint="營業額 ÷ 客單價" />
            <Stat label="驗算合計" value={ntd(result.checkRevenue)} hint="平日加週末要回到月目標" tone="paper" />
          </div>

          {result.mealSum <= 0 ? (
            <Callout tone="warn">午餐、晚餐、其他都是 0，沒有辦法拆時段。</Callout>
          ) : (
            <>
              {!result.mealsOk ? (
                <Callout tone="warn">
                  三個時段加總是 {num(result.mealSum, 1)}%，不是 100%。下面先照你填的比例換算，讓整天還是分得完。要精準就改成加總 100。
                </Callout>
              ) : null}
              <SplitTable
                title="時段"
                headers={["時段", "占比", "平日營業額", "平日人數", "週末營業額", "週末人數"]}
                rows={result.meals.map((meal) => [
                  meal.label,
                  `${num(meal.pct, 1)}%`,
                  ntd(meal.weekday.revenue),
                  `${num(meal.weekday.customers, 1)} 人`,
                  ntd(meal.weekend.revenue),
                  `${num(meal.weekend.customers, 1)} 人`,
                ])}
              />
            </>
          )}

          {result.mixSum <= 0 ? (
            <Callout tone="warn">回購、介紹、新客都是 0，沒有辦法拆來源。</Callout>
          ) : (
            <>
              {!result.mixOk ? (
                <Callout tone="warn">
                  三個來源加總是 {num(result.mixSum, 1)}%，不是 100%。下面先照比例換算。要精準就改成加總 100。
                </Callout>
              ) : null}
              <SplitTable
                title="客人從哪來"
                headers={["來源", "占比", "一個月大約幾位"]}
                rows={result.mix.map((part) => [part.label, `${num(part.pct, 1)}%`, `${num(part.customers, 1)} 人`])}
              />
            </>
          )}
        </>
      )}

      <Explain title="怎麼看結果">
        <p>
          平日一天的營業額＝月目標 ÷（平日天數 ＋ 週末倍率 × 週末天數）。週末一天再乘上倍率。
          範例是 500,000 ÷（22 ＋ 1.45 × 8）＝ 500,000 ÷ 33.6。平日約 14,881 元，週末約 21,577 元，加回去就是 50 萬。
        </p>
        <p>人數＝該時段營業額 ÷ 客單價。新客數是之後判斷廣告貴不貴的分母，不是要你立刻去投廣告。</p>
      </Explain>
      <Explain title="算給你看">
        <p>
          同一間麵店若把月目標放在 50 萬、客單價 220、平日 22 天、週末 8 天、週末是平日的 1.45 倍，全月大約 2,273 位客人。
          其中新客 30% 大約 682 位。午餐 45%、晚餐 50%、其他 5%。這組就是範例。
        </p>
      </Explain>
    </div>
  );
}

function SplitTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/10">
      <h2 className="px-3 pt-3 text-base font-semibold">{title}</h2>
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 font-medium">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")} className="border-t border-border">
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`} className={index === 0 ? "px-3 py-2" : "num px-3 py-2"}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
