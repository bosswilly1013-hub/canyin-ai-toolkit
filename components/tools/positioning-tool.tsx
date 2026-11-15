"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { downloadCanvas } from "@/lib/download";
import { uid } from "@/lib/id";
import { usePersisted } from "@/lib/storage";
import { Explain, StorageNote } from "@/components/tool-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Dot = { id: string; name: string; x: number; y: number; mine: boolean };

type MapState = {
  xTitle: string;
  xLow: string;
  xHigh: string;
  yTitle: string;
  yLow: string;
  yHigh: string;
  dots: Dot[];
};

const exampleMap: MapState = {
  xTitle: "價格帶",
  xLow: "親民",
  xHigh: "高價",
  yTitle: "用餐感覺",
  yLow: "快速方便",
  yHigh: "坐得住、有話題",
  dots: [
    { id: "me", name: "阿旺牛肉麵", x: 32, y: 48, mine: true },
    { id: "chain", name: "連鎖速食", x: 18, y: 22, mine: false },
    { id: "tour", name: "觀光店", x: 78, y: 80, mine: false },
    { id: "neighbor", name: "隔壁老店", x: 28, y: 62, mine: false },
    { id: "brunch", name: "網美早午餐", x: 70, y: 58, mine: false },
  ],
};

const font = '"PingFang TC","Noto Sans CJK TC","Microsoft JhengHei","WenQuanYi Micro Hei",sans-serif';

export function PositioningTool() {
  const { value, setValue, reset, fromStorage } = usePersisted("lazykit.v1.positioning", exampleMap);
  const plotRef = useRef<HTMLDivElement>(null);

  function move(id: string, x: number, y: number) {
    setValue((current) => ({
      ...current,
      dots: current.dots.map((dot) => (dot.id === id ? { ...dot, x: clamp(x), y: clamp(y) } : dot)),
    }));
  }

  function onPointerDown(event: ReactPointerEvent, id: string) {
    const plot = plotRef.current;
    if (!plot) return;
    const rect = plot.getBoundingClientRect();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const drag = (pointer: PointerEvent) => {
      const x = ((pointer.clientX - rect.left) / rect.width) * 100;
      const y = 100 - ((pointer.clientY - rect.top) / rect.height) * 100;
      move(id, x, y);
    };
    const up = (pointer: PointerEvent) => {
      target.releasePointerCapture(pointer.pointerId);
      target.removeEventListener("pointermove", drag);
      target.removeEventListener("pointerup", up);
    };
    target.addEventListener("pointermove", drag);
    target.addEventListener("pointerup", up);
  }

  function exportPng() {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 900;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#f4efe6";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#1c1915";
    context.font = `700 40px ${font}`;
    context.fillText("品牌定位圖", 64, 72);
    context.font = `400 22px ${font}`;
    context.fillStyle = "#5e584e";
    context.fillText(`${value.xTitle} × ${value.yTitle}`, 64, 108);
    const left = 140;
    const top = 160;
    const width = 960;
    const height = 620;
    context.strokeStyle = "#1c1915";
    context.lineWidth = 2;
    context.strokeRect(left, top, width, height);
    context.strokeStyle = "#e4d9c8";
    context.beginPath();
    context.moveTo(left + width / 2, top);
    context.lineTo(left + width / 2, top + height);
    context.moveTo(left, top + height / 2);
    context.lineTo(left + width, top + height / 2);
    context.stroke();
    context.fillStyle = "#5e584e";
    context.font = `500 22px ${font}`;
    context.textAlign = "center";
    context.fillText(value.xLow, left, top + height + 40);
    context.fillText(value.xHigh, left + width, top + height + 40);
    context.fillText(value.xTitle, left + width / 2, top + height + 72);
    context.textAlign = "right";
    context.fillText(value.yLow, left - 16, top + height);
    context.fillText(value.yHigh, left - 16, top + 22);
    value.dots.forEach((dot) => {
      const x = left + (dot.x / 100) * width;
      const y = top + ((100 - dot.y) / 100) * height;
      context.beginPath();
      context.fillStyle = dot.mine ? "#e15a2b" : "#1d3c34";
      context.arc(x, y, dot.mine ? 16 : 12, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#1c1915";
      context.font = `600 22px ${font}`;
      context.textAlign = "left";
      context.fillText(dot.name, x + 18, y + 6);
    });
    downloadCanvas(canvas, "品牌定位圖.png");
  }

  return (
    <div className="space-y-4">
      <StorageNote fromStorage={fromStorage} onReset={reset} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="橫軸在比什麼" value={value.xTitle} onChange={(next) => setValue({ ...value, xTitle: next })} />
        <Field label="橫軸左邊" value={value.xLow} onChange={(next) => setValue({ ...value, xLow: next })} />
        <Field label="橫軸右邊" value={value.xHigh} onChange={(next) => setValue({ ...value, xHigh: next })} />
        <Field label="縱軸在比什麼" value={value.yTitle} onChange={(next) => setValue({ ...value, yTitle: next })} />
        <Field label="縱軸下面" value={value.yLow} onChange={(next) => setValue({ ...value, yLow: next })} />
        <Field label="縱軸上面" value={value.yHigh} onChange={(next) => setValue({ ...value, yHigh: next })} />
      </div>
      <div className="rounded-2xl bg-card p-3 ring-1 ring-foreground/10 sm:p-4">
        <div className="mb-2 flex items-end justify-between text-xs text-muted-foreground">
          <span>{value.yHigh}</span>
          <span>{value.yTitle}</span>
        </div>
        <div
          ref={plotRef}
          className="relative h-[420px] touch-none rounded-xl border border-[#1c1915] bg-[#fffdf8]"
        >
          <div className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-[#e4d9c8]" />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-[#e4d9c8]" />
          {value.dots.map((dot) => (
            <button
              key={dot.id}
              type="button"
              className="absolute -translate-x-1/2 translate-y-1/2 cursor-grab touch-none"
              style={{ left: `${dot.x}%`, bottom: `${dot.y}%` }}
              onPointerDown={(event) => onPointerDown(event, dot.id)}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 5 : 2;
                const delta: Record<string, [number, number]> = {
                  ArrowRight: [step, 0],
                  ArrowLeft: [-step, 0],
                  ArrowUp: [0, step],
                  ArrowDown: [0, -step],
                };
                const moveBy = delta[event.key];
                if (!moveBy) return;
                event.preventDefault();
                setValue((current) => ({
                  ...current,
                  dots: current.dots.map((item) =>
                    item.id === dot.id ? { ...item, x: clamp(item.x + moveBy[0]), y: clamp(item.y + moveBy[1]) } : item,
                  ),
                }));
              }}
            >
              <span className={`mx-auto block rounded-full ${dot.mine ? "size-4 bg-primary" : "size-3 bg-[#1d3c34]"}`} />
              <span className="mt-1 block max-w-28 rounded-md bg-white/90 px-1.5 py-0.5 text-xs shadow-sm">{dot.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{value.xLow}</span>
          <span>{value.xTitle}</span>
          <span>{value.xHigh}</span>
        </div>
        <p className="mt-1 text-right text-xs text-muted-foreground">{value.yLow}</p>
        <p className="mt-2 text-xs text-muted-foreground">點選一家店後，用方向鍵移動。Shift 加方向鍵一次移動多一點。</p>
      </div>
      <div className="space-y-2">
        {value.dots.map((dot) => (
          <div key={dot.id} className="flex flex-wrap items-center gap-2">
            <Input className="max-w-xs" value={dot.name} onValueChange={(next) => setValue({ ...value, dots: value.dots.map((item) => (item.id === dot.id ? { ...item, name: next } : item)) })} />
            <span className="num text-xs text-muted-foreground">橫 {Math.round(dot.x)} · 縱 {Math.round(dot.y)}</span>
            {dot.mine ? <span className="text-xs text-primary">我的店</span> : null}
            <Button type="button" variant="ghost" size="sm" onClick={() => setValue({ ...value, dots: value.dots.filter((item) => item.id !== dot.id) })}>
              移除
            </Button>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => setValue({ ...value, dots: [...value.dots, { id: uid("dot"), name: "新的店", x: 50, y: 50, mine: false }] })}
          >
            加一家
          </Button>
          <Button type="button" className="h-11" onClick={exportPng}>
            下載 PNG
          </Button>
        </div>
      </div>
      <Explain title="怎麼看結果">
        <p>這張圖沒有標準答案。你把自家和你真的在搶客人的店放上去，看大家擠在同一區，還是你自己站在空的地方。</p>
        <p>軸要用客人感覺得到的話。價格、速度、好不好拍照、湯頭重不重，都可以。不要用「品牌力」這種你自己也解釋不了的詞。</p>
      </Explain>
      <Explain title="算給你看">
        <p>
          範例把阿旺牛肉麵放在價格偏親民、感覺介於快速和坐得住之間。連鎖速食更便宜更快，觀光店又貴又有話題，隔壁老店價格接近但更像老味道，網美早午餐價格高、話題也高。
          拖動點點就會改位置，下載的圖用的是你拖完的座標。
        </p>
      </Explain>
    </div>
  );
}

function clamp(value: number) {
  return Math.min(96, Math.max(4, value));
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onValueChange={onChange} />
    </div>
  );
}
