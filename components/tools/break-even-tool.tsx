"use client";

import { analyzeBreakEven, breakEvenProblem, exampleBreakEven, type BreakEvenInput } from "@/lib/calc/break-even";
import { ntd, num, pct, signedNtd } from "@/lib/format";
import { usePersisted } from "@/lib/storage";
import { NumberField } from "@/components/number-field";
import { Callout, Explain, Stat, StorageNote } from "@/components/tool-bits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BreakEvenTool() {
  const { value, setValue, reset, fromStorage } = usePersisted("lazykit.v1.break-even", exampleBreakEven);
  const result = analyzeBreakEven(value);
  const selected = result.selected;
  const problem = breakEvenProblem(value);

  function set<K extends keyof BreakEvenInput>(key: K, next: BreakEvenInput[K]) {
    setValue({ ...value, [key]: next });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <StorageNote fromStorage={fromStorage} onReset={reset} />
        <Dialog>
          <DialogTrigger render={<Button variant="outline" className="h-11" />}>這些詞是什麼意思</DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>名詞用白話講</DialogTitle>
              <DialogDescription>算式在下面的結果裡會把你的數字代進去。</DialogDescription>
            </DialogHeader>
            <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
              <li>固定成本：沒有客人也要付的。房租、人事、水電、垃圾、網路、保險。</li>
              <li>變動成本比例：有賣才有的成本占售價多少。這裡主要是食材，包材也可以算進去。</li>
              <li>客單價：平均一位客人付多少，不是菜單上最貴的那碗。</li>
              <li>折扣：售價變少，食材不會變少。所以打折後每位客人貢獻的錢變薄。</li>
            </ul>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2">
          <p className="text-xs leading-5 text-muted-foreground sm:col-span-2">金額可以打 48,000，逗號會拿掉。負數不會被接受。</p>
          <NumberField label="房租" suffix="元" min={0} max={1e12} value={value.rent} onChange={(next) => set("rent", next)} hint="一個月" />
          <NumberField label="人事" suffix="元" min={0} max={1e12} value={value.labor} onChange={(next) => set("labor", next)} hint="含老闆自己的薪水比較不會算錯" />
          <NumberField label="水電瓦斯" suffix="元" min={0} max={1e12} value={value.utilities} onChange={(next) => set("utilities", next)} />
          <NumberField label="其他固定" suffix="元" min={0} max={1e12} value={value.otherFixed} onChange={(next) => set("otherFixed", next)} hint="網路、保險、垃圾、耗材月費" />
          <NumberField label="變動成本比例" suffix="%" min={0} max={100} value={value.variablePct} onChange={(next) => set("variablePct", next)} hint="食材加包材占售價，0 到 100" />
          <NumberField label="客單價" suffix="元" min={0} max={1e12} value={value.avgTicket} onChange={(next) => set("avgTicket", next)} />
          <NumberField label="一個月營業天數" suffix="天" min={1} max={31} value={value.openDays} onChange={(next) => set("openDays", next)} />
          <NumberField label="想看的折扣" suffix="%" min={0} max={100} value={value.discountPct} onChange={(next) => set("discountPct", next)} hint="10 代表打九折" />
          <div className="sm:col-span-2">
            <NumberField label="如果每天來這麼多人" suffix="人" min={0} max={100000} value={value.expectedCustomersPerDay} onChange={(next) => set("expectedCustomersPerDay", next)} hint="用來試算打折前後賺或虧" />
          </div>
          <p className="sm:col-span-2 text-sm text-muted-foreground">
            固定成本合計 <span className="num font-medium text-foreground">{ntd(result.fixed)}</span>
            ，一位客人的食材約 <span className="num font-medium text-foreground">{ntd(result.variablePerGuest)}</span>。
          </p>
        </div>

        <div className="min-w-0 space-y-4">
          {problem ? (
            <Callout tone="bad">{problem}</Callout>
          ) : selected.customersPerDay == null ? (
            <Callout tone="bad">這組數字沒有兩平點。先看客單價、食材比和折扣。</Callout>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="月兩平營業額" value={ntd(selected.monthlyRevenue)} hint={value.discountPct ? `含 ${value.discountPct}% 折扣` : "不打折"} />
              <Stat label="每天要做" value={ntd(selected.monthlyRevenue != null && value.openDays > 0 ? selected.monthlyRevenue / value.openDays : null)} />
              <Stat label="每天需要客人" value={`${num(selected.customersPerDay, 1)} 人`} hint={value.discountPct ? `比不打折多 ${num(selected.extraCustomersPerDay, 1)} 人` : "不打折"} />
            </div>
          )}
        </div>
      </div>
          <div className="mt-4 min-w-0 overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/10">
            <table className="w-full table-fixed text-left text-xs sm:text-sm">
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[15%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[17%]" />
                <col className="w-[24%]" />
              </colgroup>
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 font-medium whitespace-normal">折扣</th>
                  <th className="px-2 py-2 font-medium whitespace-normal">客單價</th>
                  <th className="px-2 py-2 font-medium whitespace-normal">每人貢獻</th>
                  <th className="px-2 py-2 font-medium whitespace-normal">每天人數</th>
                  <th className="px-2 py-2 font-medium whitespace-normal">月兩平</th>
                  <th className="px-2 py-2 font-medium whitespace-normal leading-snug">以你預估的人數</th>
                </tr>
              </thead>
              <tbody>
                {result.table.map((row) => (
                  <tr key={row.discountPct} className={row.discountPct === value.discountPct ? "bg-accent" : "border-t border-border"}>
                    <td className="num px-2 py-2">{row.discountPct}%</td>
                    <td className="num px-2 py-2">{ntd(row.ticket)}</td>
                    <td className="num px-2 py-2">{ntd(row.contributionPerGuest)}</td>
                    <td className="num px-2 py-2">{row.customersPerDay == null ? "沒有兩平點" : `${num(row.customersPerDay, 1)} 人`}</td>
                    <td className="num px-2 py-2">{ntd(row.monthlyRevenue)}</td>
                    <td className="num px-2 py-2 whitespace-normal">{signedNtd(row.monthlyProfitAtExpected)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

      <div className="mt-4 space-y-4">
      <Explain title="怎麼看結果">
        <p>
          不打折時，固定成本 {ntd(result.fixed)} ÷ 每位客人貢獻 {ntd(result.base.contributionPerGuest)} ＝ 一個月 {num(result.base.customersPerMonth, 1)} 人。
          再乘上客單價 {ntd(value.avgTicket)}，月兩平營業額是 {ntd(result.base.monthlyRevenue)}。除以 {value.openDays} 天，每天約 {num(result.base.customersPerDay, 1)} 人。
        </p>
        <p>
          折扣列的「以你預估的人數」是：每天 {value.expectedCustomersPerDay} 人 × {value.openDays} 天，乘上打折後每位客人還貢獻的錢，再減掉固定成本。
          正數是覆蓋固定成本之後還剩的，負數是還差多少。這還沒扣所得稅。
        </p>
        <p>變動成本現在是售價的 {pct(value.variablePct / 100)}。固定成本如果漏列，兩平點會估太低。</p>
      </Explain>

      <Explain title="算給你看">
        <p>
          範例是新北市一間社區牛肉麵店。房租 48,000、人事 156,000（含老闆薪水）、水電 18,000、其他 22,000，固定成本 244,000。
          食材約售價的 32%，客單價 220，一個月開 26 天。按「恢復範例」就是這組數字。
        </p>
        <p>
          不打折，每天大約 {num(analyzeBreakEven(exampleBreakEven).base.customersPerDay, 1)} 人可以打平。
          店裡若真的每天 70 人，一個月大約還剩 {signedNtd(analyzeBreakEven(exampleBreakEven).base.monthlyProfitAtExpected)}。
          全單打九折之後，同樣 70 人會變成 {signedNtd(analyzeBreakEven(exampleBreakEven).selected.monthlyProfitAtExpected)}。
          打折前先看人數補不補得回來。
        </p>
      </Explain>
      </div>
    </div>
  );
}
