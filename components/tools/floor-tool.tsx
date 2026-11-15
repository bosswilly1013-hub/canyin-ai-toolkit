"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  checkAisles,
  clampItem,
  exampleFloor,
  floorKinds,
  type FloorItem,
  type FloorKind,
  type FloorState,
} from "@/lib/calc/floor";
import { downloadCanvas } from "@/lib/download";
import { num, ping } from "@/lib/format";
import { uid } from "@/lib/id";
import { usePersisted } from "@/lib/storage";
import { NumberField } from "@/components/number-field";
import { Callout, Explain, StorageNote } from "@/components/tool-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const colors: Record<FloorKind, string> = {
  table2: "#f4d7b8",
  table4: "#f4d7b8",
  counter: "#1d3c34",
  kitchen: "#e7e1d6",
  fridge: "#d7e4f0",
  door: "#e15a2b",
};

const font = '"PingFang TC","Noto Sans CJK TC","Microsoft JhengHei","WenQuanYi Micro Hei",sans-serif';

export function FloorTool() {
  const { value, setValue, reset, fromStorage } = usePersisted("lazykit.v1.floor", exampleFloor());
  const boardRef = useRef<HTMLDivElement>(null);
  const [pxPerM, setPxPerM] = useState(48);
  const report = checkAisles(value);

  useEffect(() => {
    const element = boardRef.current;
    if (!element) return;
    const fit = () => {
      const byWidth = element.clientWidth / Math.max(value.widthM, 0.5);
      const byHeight = 560 / Math.max(value.depthM, 0.5);
      setPxPerM(Math.max(28, Math.min(byWidth, byHeight)));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    fit();
    return () => observer.disconnect();
  }, [value.depthM, value.widthM]);

  function commit(next: FloorState) {
    setValue({
      ...next,
      items: next.items.map((item) => clampItem(item, next.widthM, next.depthM)),
    });
  }

  function updateItem(id: string, recipe: (item: FloorItem) => FloorItem) {
    setValue((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? clampItem(recipe(item), current.widthM, current.depthM) : item)),
    }));
  }

  function onPointerDown(event: ReactPointerEvent, id: string) {
    const board = boardRef.current;
    const item = value.items.find((entry) => entry.id === id);
    if (!board || !item) return;
    const originX = event.clientX;
    const originY = event.clientY;
    const start = { x: item.x, y: item.y };
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const drag = (pointer: PointerEvent) => {
      let x = start.x + (pointer.clientX - originX) / pxPerM;
      let y = start.y + (pointer.clientY - originY) / pxPerM;
      if (value.snap) {
        x = Math.round(x * 10) / 10;
        y = Math.round(y * 10) / 10;
      }
      updateItem(id, (current) => ({ ...current, x, y }));
    };
    const up = (pointer: PointerEvent) => {
      target.releasePointerCapture(pointer.pointerId);
      target.removeEventListener("pointermove", drag);
      target.removeEventListener("pointerup", up);
    };
    target.addEventListener("pointermove", drag);
    target.addEventListener("pointerup", up);
  }

  function add(kind: FloorKind) {
    const spec = floorKinds[kind];
    commit({
      ...value,
      items: [...value.items, { id: uid(kind), kind, name: spec.label, x: 0.2, y: 0.2, w: spec.w, h: spec.h }],
    });
  }

  function exportPng() {
    const canvas = document.createElement("canvas");
    const scale = 110;
    const pad = 90;
    canvas.width = Math.round(value.widthM * scale + pad * 2);
    canvas.height = Math.round(value.depthM * scale + pad * 2 + 80);
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#f4efe6";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#1c1915";
    context.font = `700 28px ${font}`;
    context.fillText(`店面草圖 ${value.widthM}m × ${value.depthM}m（約 ${num(ping(value.widthM * value.depthM), 1)} 坪）`, 24, 42);
    context.strokeStyle = "#1c1915";
    context.lineWidth = 3;
    context.strokeRect(pad, pad, value.widthM * scale, value.depthM * scale);
    context.strokeStyle = "#e4d9c8";
    context.lineWidth = 1;
    for (let meter = 1; meter < value.widthM; meter++) {
      context.beginPath();
      context.moveTo(pad + meter * scale, pad);
      context.lineTo(pad + meter * scale, pad + value.depthM * scale);
      context.stroke();
    }
    for (let meter = 1; meter < value.depthM; meter++) {
      context.beginPath();
      context.moveTo(pad, pad + meter * scale);
      context.lineTo(pad + value.widthM * scale, pad + meter * scale);
      context.stroke();
    }
    value.items.forEach((item) => {
      const x = pad + item.x * scale;
      const y = pad + item.y * scale;
      context.fillStyle = colors[item.kind];
      context.fillRect(x, y, item.w * scale, item.h * scale);
      context.strokeStyle = "#1c1915";
      context.strokeRect(x, y, item.w * scale, item.h * scale);
      context.fillStyle = item.kind === "counter" || item.kind === "door" ? "#fff8f3" : "#1c1915";
      context.font = `600 18px ${font}`;
      context.fillText(item.name, x + 8, y + 24);
    });
    context.fillStyle = "#5e584e";
    context.font = `400 18px ${font}`;
    const note = report.issues.length
      ? `有 ${report.issues.length} 處偏窄或重疊`
      : report.narrowest
        ? `最窄走道約 ${Math.round(report.narrowest.gapM * 100)} 公分（${report.narrowest.a}／${report.narrowest.b}）`
        : "沒有相鄰走道";
    context.fillText(note, 24, canvas.height - 28);
    downloadCanvas(canvas, "店面平面圖.png");
  }

  const area = value.widthM * value.depthM;

  return (
    <div className="space-y-4">
      <StorageNote fromStorage={fromStorage} onReset={reset} />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="面寬" suffix="公尺" step="0.1" value={value.widthM} onChange={(next) => commit({ ...value, widthM: Math.max(1, next) })} />
        <NumberField label="深度" suffix="公尺" step="0.1" value={value.depthM} onChange={(next) => commit({ ...value, depthM: Math.max(1, next) })} />
      </div>
      <p className="text-sm text-muted-foreground">
        面積 {num(area, 1)} 平方公尺，約 {num(ping(area), 1)} 坪。桌子的框含拉椅子的位置，走道是框和框之間的距離。點選物件後可用方向鍵移動。
      </p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(floorKinds) as FloorKind[]).map((kind) => (
          <Button key={kind} type="button" variant="outline" className="h-11" onClick={() => add(kind)}>
            加{floorKinds[kind].label}
          </Button>
        ))}
        <Button type="button" variant={value.snap ? "default" : "outline"} className="h-11" onClick={() => setValue({ ...value, snap: !value.snap })}>
          {value.snap ? "已對齊 10 公分" : "自由拖曳"}
        </Button>
        <Button type="button" className="h-11" onClick={exportPng}>
          下載 PNG
        </Button>
      </div>
      <div ref={boardRef} className="overflow-x-auto rounded-2xl bg-card p-3 ring-1 ring-foreground/10">
        <div
          className="relative border-2 border-[#1c1915] bg-[#fffdf8]"
          style={{ width: value.widthM * pxPerM, height: value.depthM * pxPerM }}
        >
          {value.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="absolute touch-none border border-[#1c1915] text-left text-xs"
              style={{
                left: item.x * pxPerM,
                top: item.y * pxPerM,
                width: item.w * pxPerM,
                height: item.h * pxPerM,
                background: colors[item.kind],
                color: item.kind === "counter" || item.kind === "door" ? "#fff8f3" : "#1c1915",
              }}
              onPointerDown={(event) => onPointerDown(event, item.id)}
              onKeyDown={(event) => {
                const step = value.snap ? 0.1 : 0.05;
                const delta: Record<string, [number, number]> = {
                  ArrowRight: [step, 0],
                  ArrowLeft: [-step, 0],
                  ArrowUp: [0, -step],
                  ArrowDown: [0, step],
                };
                const moveBy = delta[event.key];
                if (!moveBy) return;
                event.preventDefault();
                updateItem(item.id, (current) => ({ ...current, x: current.x + moveBy[0], y: current.y + moveBy[1] }));
              }}
            >
              <span className="block px-1 pt-1">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
      {report.narrowest ? (
        <p className="text-sm">
          最窄的走道約 {Math.round(report.narrowest.gapM * 100)} 公分，在{report.narrowest.a}和{report.narrowest.b}之間。
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">目前沒有兩件東西正對著、中間形成走道。把桌子排到同一排就會出現。</p>
      )}
      {report.issues.length === 0 ? (
        <Callout tone="good">沒有重疊，也沒有窄於 75 公分的走道。把桌子拖近一點，就會看到警示。</Callout>
      ) : (
        report.issues.map((issue) => (
          <Callout key={issue.message} tone={issue.level === "overlap" ? "bad" : "warn"}>
            {issue.message}
          </Callout>
        ))
      )}
      <div className="space-y-2">
        {value.items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-2">
            <Input className="max-w-40" value={item.name} onValueChange={(next) => updateItem(item.id, (current) => ({ ...current, name: next }))} />
            <span className="text-xs text-muted-foreground">{floorKinds[item.kind].hint}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => updateItem(item.id, (current) => ({ ...current, w: current.h, h: current.w }))}
            >
              長寬對調
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => commit({ ...value, items: value.items.filter((entry) => entry.id !== item.id) })}>
              移除
            </Button>
          </div>
        ))}
      </div>
      <Explain title="怎麼看結果">
        <p>75 公分是這頁用的經驗值：低於它，兩個人在走道會卡。貼齊牆或貼齊櫃檯不算問題，留一條 10 到 70 公分的縫才會被標成偏窄。</p>
        <p>這不是建築技術規則，也沒有算消防。要畫牆、門窗、水電，請用懶人包導覽裡的 Sweet Home 3D，那是免費的開源軟體，需要下載安裝。</p>
      </Explain>
      <Explain title="算給你看">
        <p>
          範例是面寬 5 公尺、深度 8 公尺，約 {num(ping(40), 1)} 坪。後方整面是廚房，前面貼一條櫃檯，左右各一張含座位的四人桌，中間留出走道，入口在前方。
          這張擺法不會出現警示。把兩張桌子往中間拖，警示就會出來。
        </p>
      </Explain>
    </div>
  );
}
