"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apps } from "@/lib/apps";
import { VideoPlayer } from "@/components/member/video-player";
import { authStorageKey, aiStartDate, founderQuote, passwordSha256 } from "@/lib/member/config";
import { EVENTS, SUBS, SYSTEMS, type EventKind } from "@/lib/member/dashboard";
import { downloadKinds, downloads, formatBytes } from "@/lib/member/downloads";
import type { Article } from "@/lib/member/load";
import { seededViews } from "@/lib/member/ranking";
import { claudePath, learningPath, subEmoji, topics } from "@/lib/member/topics";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "@/app/member.css";

const seenKey = "jiuwo.seen";
const favKey = "jiuwo.fav";
const recentKey = "jiuwo.recent";
const themeKey = "jiuwo.theme";

function readList(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]") as string[]; } catch { return []; }
}
function writeList(key: string, values: string[]) {
  localStorage.setItem(key, JSON.stringify(values));
}
async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function taipeiToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
function daysSince(iso: string) {
  const start = new Date(`${iso}T00:00:00+08:00`).getTime();
  return Math.max(0, Math.floor((Date.now() - start) / 86400000));
}
function isNew(date: string) {
  const today = new Date(`${taipeiToday()}T00:00:00+08:00`).getTime();
  const then = new Date(`${date}T00:00:00+08:00`).getTime();
  return today - then >= 0 && today - then <= 14 * 86400000;
}
function inAppBrowser() {
  return /Line\/|FBAN|FBAV|Instagram|MicroMessenger/i.test(navigator.userAgent);
}

function articleKind(article: Article) {
  if (article.tool) return "工具";
  if (article.file) return "下載包";
  if (article.video) return "影片";
  return "文章";
}

function renderBody(body: string, onZoom: (src: string) => void, onCopy: (text: string) => void) {
  const chunks = body.split("```");
  return chunks.map((chunk, index) => {
    if (index % 2 === 1) {
      const text = chunk.trim();
      return <div key={index} className="code"><button type="button" onClick={() => onCopy(text)}>複製</button><pre><code>{text}</code></pre></div>;
    }
    return chunk.split(/\n{2,}/).map((block, blockIndex) => {
      const lines = block.split("\n").filter((line) => line.length > 0);
      if (!lines.length) return null;
      if (lines.every((line) => line.startsWith("|"))) {
        const cells = lines.filter((line) => !/^\|?\s*-+/.test(line)).map((line) => line.split("|").filter((cell) => cell.trim() !== ""));
        return (
          <table key={`${index}-${blockIndex}`} className="path">
            <tbody>{cells.map((row) => <tr key={row.join("-")}>{row.map((cell) => <td key={cell}>{cell.trim()}</td>)}</tr>)}</tbody>
          </table>
        );
      }
      if (lines.every((line) => line.startsWith("- "))) return <ul key={`${index}-${blockIndex}`}>{lines.map((line) => <li key={line}>{line.slice(2)}</li>)}</ul>;
      if (lines.every((line) => line.startsWith("> "))) return <blockquote key={`${index}-${blockIndex}`}>{lines.map((line) => line.slice(2)).join(" ")}</blockquote>;
      if (lines[0].startsWith("## ")) return <h2 key={`${index}-${blockIndex}`}>{lines[0].slice(3)}</h2>;
      const image = lines[0].match(/^!\[(.*)\]\((.*)\)$/);
      if (image) return <button type="button" key={`${index}-${blockIndex}`} className="shot" onClick={() => onZoom(image[2])}><img src={image[2]} alt={image[1]} /></button>;
      return <p key={`${index}-${blockIndex}`}>{block}</p>;
    });
  });
}

export function MemberFrame({ page, articles, slug, tab = "milestone" }: { page: "home" | "journey" | "about" | "read"; articles: Article[]; slug?: string; tab?: "milestone" | "footprint" | "subs" }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [gateError, setGateError] = useState("");
  const [iab, setIab] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [query, setQuery] = useState("");
  const [seen, setSeen] = useState<string[]>([]);
  const [favs, setFavs] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [zoom, setZoom] = useState("");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [lastSlug, setLastSlug] = useState("");
  const [viewMap, setViewMap] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [showTool, setShowTool] = useState(false);
  const [hashNow, setHashNow] = useState("#/");

  useEffect(() => {
    // 登入狀態只存在這台裝置，必須等瀏覽器起來才能讀。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthed(localStorage.getItem(authStorageKey) === "ok");
    setTheme((localStorage.getItem(themeKey) as "light" | "dark") || "light");
    setSeen(readList(seenKey));
    setFavs(readList(favKey));
    setRecent(readList(recentKey));
    setIab(inAppBrowser());
    const params = new URLSearchParams(location.search);
    setQuery(params.get("q") || "");
    setLastSlug(localStorage.getItem("jiuwo.last") || "");
    try { setViewMap(JSON.parse(localStorage.getItem("jiuwo.views") || "{}") as Record<string, number>); } catch { setViewMap({}); }
    setReady(true);
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js");
    const syncHash = () => setHashNow(location.hash || "#/");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (event.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        event.preventDefault();
        document.getElementById("member-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const activeSlug = page === "read" ? slug : hashNow.startsWith("#/c/") ? decodeURIComponent(hashNow.slice(4).replace(/\/$/, "")) : "";
    if (!activeSlug || !authed) return;
    const slugNow = activeSlug;
    const next = [slugNow, ...readList(recentKey).filter((item) => item !== slugNow)].slice(0, 8);
    writeList(recentKey, next);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(next);
    localStorage.setItem("jiuwo.last", slugNow);
    setLastSlug(slugNow);
    const seenNow = readList(seenKey);
    if (!seenNow.includes(slugNow)) {
      const withSeen = [...seenNow, slugNow];
      writeList(seenKey, withSeen);
      setSeen(withSeen);
    }
    const views = JSON.parse(localStorage.getItem("jiuwo.views") || "{}") as Record<string, number>;
    views[slugNow] = (views[slugNow] || 0) + 1;
    localStorage.setItem("jiuwo.views", JSON.stringify(views));
    setViewMap(views);
    setNote(localStorage.getItem(`jiuwo.note.${slugNow}`) || "");
    setShowTool(false);
  }, [page, slug, authed, hashNow]);

  function ping(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1600);
  }
  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const box = document.createElement("textarea");
      box.value = text;
      document.body.append(box);
      box.select();
      document.execCommand("copy");
      box.remove();
    }
    ping("已複製");
  }
  function logout() {
    localStorage.removeItem(authStorageKey);
    setAuthed(false);
  }
  async function enter() {
    setChecking(true);
    setGateError("");
    await new Promise((resolve) => setTimeout(resolve, 400));
    const hash = await sha256(password.trim());
    setChecking(false);
    if (hash !== passwordSha256) {
      setGateError("密碼不對。請看這個月的訂閱通知，或再試一次。");
      return;
    }
    localStorage.setItem(authStorageKey, "ok");
    setAuthed(true);
  }
  function toggleFav(id: string) {
    const next = favs.includes(id) ? favs.filter((item) => item !== id) : [...favs, id];
    setFavs(next);
    writeList(favKey, next);
    ping(next.includes(id) ? "已加入收藏" : "已取消收藏");
  }

  const bySlug = useMemo(() => Object.fromEntries(articles.map((article) => [article.slug, article])), [articles]);
  const newest = articles.filter((article) => isNew(article.date));
  const monthCount = articles.filter((article) => daysSince(article.date) <= 30).length;
  const company = SYSTEMS.filter((item) => item.kind === "公司").length;
  const personal = SYSTEMS.filter((item) => item.kind === "個人").length;
  const subsNow = SUBS[SUBS.length - 1]?.count ?? 0;
  const pathDone = learningPath.filter((id) => seen.includes(id)).length;
  const last = bySlug[lastSlug];
  const hits = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return articles.flatMap((article) => {
      const hay = [article.title, article.summary, article.sub, topics.find((topic) => topic.id === article.category)?.name || "", article.body].join("\n");
      const at = hay.toLowerCase().indexOf(q.toLowerCase());
      if (at < 0) return [];
      const start = Math.max(0, at - 18);
      return [{ article, snippet: hay.slice(start, start + 48 + q.length) }];
    });
  }, [articles, query]);

  if (!ready) return <div className="gate" />;
  if (!authed) {
    return (
      <div className="gate">
        <div className="box">
          <img src="/member/willy.jpg" alt="" width={84} height={84} style={{ borderRadius: "50%" }} />
          <h1>久沃訂閱者專區</h1>
          <p className="lead">輸入這個月的密碼。資料留在你的裝置。</p>
          <form className="row" onSubmit={(event) => { event.preventDefault(); void enter(); }}>
            <input aria-label="本月密碼" placeholder="本月密碼" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <button className="enter" type="submit" disabled={checking}>{checking ? "驗證中" : "進入"}</button>
          </form>
          <p className="err">{gateError}</p>
          {iab ? <div className="iab"><b>你在 LINE 或 Facebook 裡打開。</b><p>這種內建瀏覽器常常存不住登入。請點右上角，用手機自己的瀏覽器打開。</p></div> : null}
          <p className="hint">還沒有密碼？<Link href="/pricing">看訂閱說明</Link></p>
        </div>
      </div>
    );
  }

  const hashSlug = hashNow.startsWith("#/c/") ? decodeURIComponent(hashNow.slice(4).replace(/\/$/, "")) : "";
  const hashJourney = hashNow.startsWith("#/journey/footprint") ? "footprint" : hashNow.startsWith("#/journey/subs") ? "subs" : hashNow.startsWith("#/journey") ? "milestone" : "";
  const hashAbout = hashNow.startsWith("#/about");
  const article = (page === "read" ? slug : hashSlug) ? bySlug[(page === "read" ? slug : hashSlug) as string] : undefined;
  const spark = SUBS.map((point, index) => {
    const max = Math.max(...SUBS.map((item) => item.count));
    const x = (index / (SUBS.length - 1)) * 120;
    const y = 36 - (point.count / max) * 32;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="member" data-theme={theme}>
      <header className="m-head no-print">
        <a className="brand" href="/#/"><img src="/member/willy.jpg" alt="" /><span className="txt">久沃<span>訂閱</span></span></a>
        <nav className="tabs">
          <a className={!hashJourney && !hashAbout && !hashSlug && page === "home" ? "tab on" : "tab"} href="/#/">內容</a>
          <a className={page === "journey" || hashJourney ? "tab on" : "tab"} href="/#/journey">AI歷程</a>
          <a className={page === "about" || hashAbout ? "tab on" : "tab"} href="/#/about">認識 Willy</a>
        </nav>
        <span className="sp" />
        <button type="button" className="hbtn menu drawer" onClick={() => setDrawer((value) => !value)}>目錄</button>
        <button type="button" className="out" onClick={logout}>登出</button>
      </header>
      {page === "home" && !hashSlug && !hashJourney && !hashAbout ? (
        <HomeView
          articles={articles}
          query={query}
          setQuery={setQuery}
          hits={hits}
          monthCount={monthCount}
          newest={newest}
          pathDone={pathDone}
          last={last}
          favs={favs}
          seen={seen}
          recent={recent}
          bySlug={bySlug}
          company={company}
          personal={personal}
          subsNow={subsNow}
          spark={spark}
          openCats={openCats}
          setOpenCats={setOpenCats}
          drawer={drawer}
          setDrawer={setDrawer}
          viewMap={viewMap}
          toggleFav={toggleFav}
        />
      ) : null}
      {page === "journey" || hashJourney ? <Journey tab={hashJourney || tab} /> : null}
      {page === "about" || hashAbout ? <About /> : null}
      {(page === "read" || hashSlug) && article ? (
        <article className="read overlay viewer">
          <header className="overlay-bar no-print">
            <a href="/#/">← 回去學習</a>
            <span>{topics.find((topic) => topic.id === article.category)?.name} · {articleKind(article)}</span>
            <button type="button" onClick={() => void copyText(location.origin + `/read/${article.slug}/`)}>複製連結</button>
          </header>
          <h1>{article.title}</h1>
          <p>{article.summary}</p>
          <p className="no-print">約 {article.minutes} 分鐘 {isNew(article.date) ? "· 新" : ""} {seen.includes(article.slug) ? "· 看過" : ""}
            {" "}
            <button type="button" onClick={() => toggleFav(article.slug)}>{favs.includes(article.slug) ? "已收藏" : "收藏"}</button>
            {" "}
            <button type="button" onClick={() => window.print()}>列印</button>
          </p>
          {article.video ? <VideoPlayer src={article.video} /> : null}
          {renderBody(article.body, setZoom, (text) => void copyText(text))}
          {article.prompt ? (
            <div className="code no-print">
              <p>{article.prompt}</p>
              <button type="button" onClick={() => void copyText(article.prompt)}>複製</button>
            </div>
          ) : null}
          {article.file || article.download ? (
            <ul className="files">
              {article.file ? <li>附件 <a href={article.file} download>下載</a></li> : null}
              {article.download ? <li><Link href={article.download}>{article.downloadLabel || "打開工具"}</Link></li> : null}
            </ul>
          ) : null}
          {article.tool ? (
            <div className="tool-box no-print">
              <button type="button" onClick={() => setShowTool((value) => !value)}>直接開啟使用</button>
              {" "}
              {article.file ? <a href={article.file} download>下載到電腦</a> : null}
              {showTool ? <iframe title={article.title} src={article.tool.startsWith("/") ? article.tool : `/systems/${article.tool}/`} /> : null}
            </div>
          ) : null}
          <label className="no-print">留給自己的筆記
            <textarea value={note} onChange={(event) => { setNote(event.target.value); localStorage.setItem(`jiuwo.note.${article.slug}`, event.target.value); }} />
          </label>
          <p className="no-print"><a href="https://line.me/R/" target="_blank" rel="noreferrer">問題回報，用 LINE 傳給店裡</a></p>
          <PathFooter article={article} articles={articles} />
        </article>
      ) : null}
      {zoom ? <div className="modal zoom" onClick={() => setZoom("")}><img src={zoom} alt="" /></div> : null}
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </div>
  );
}

function HomeView(props: {
  articles: Article[];
  query: string;
  setQuery: (value: string) => void;
  hits: { article: Article; snippet: string }[];
  monthCount: number;
  newest: Article[];
  pathDone: number;
  last?: Article;
  favs: string[];
  seen: string[];
  recent: string[];
  bySlug: Record<string, Article>;
  company: number;
  personal: number;
  subsNow: number;
  spark: string;
  openCats: Record<string, boolean>;
  setOpenCats: (value: Record<string, boolean>) => void;
  drawer: boolean;
  setDrawer: (value: boolean) => void;
  viewMap: Record<string, number>;
  toggleFav: (id: string) => void;
}) {
  const { articles, query, setQuery, hits } = props;
  const [filter, setFilter] = useState<string>("all");
  const [fileKind, setFileKind] = useState<string>("全部");
  const nextPath = learningPath.find((id) => !props.seen.includes(id)) || learningPath[0];
  const pathStarted = props.pathDone > 0 && props.pathDone < learningPath.length;
  const visible = articles.filter((article) => {
    if (filter === "all" || filter === "downloads") return true;
    if (filter === "new") return isNew(article.date);
    if (filter === "path") return learningPath.includes(article.slug);
    return article.category === filter;
  });
  const score = (slug: string) => (seededViews[slug] || 0) + (props.viewMap[slug] || 0);
  const ranked = articles.slice().sort((a, b) => score(b.slug) - score(a.slug)).slice(0, 20);
  const files = downloads.filter((file) => fileKind === "全部" || file.kind === fileKind);

  return (
    <>
      <section className="hero">
        <div className="hero-bg"><i className="g1" /><i className="g2" /><i className="lines" /></div>
        <div className="hero-in">
          <div className="hero-main">
            <div className="eyebrow"><span className="pulse" />訂閱者專屬 · 持續更新中</div>
            <h2>歡迎回來 👋<br /><em>今天想看哪一篇？</em></h2>
            <p className="lead">教材和店務工具都在這，打開就能用，不用下載 App。</p>
            <div className="offer">
              <button type="button" onClick={() => setFilter("ai")}>系統實作</button>
              <button type="button" onClick={() => setFilter("mind")}>經營觀念</button>
              <button type="button" onClick={() => setFilter("tools")}>開店工具</button>
              <button type="button" className="live" onClick={() => setFilter("new")}>近 30 天新增 {props.monthCount} 篇</button>
            </div>
            <div className="why">
              <q>{founderQuote}</q>
              <a href="/#/about">讀 Willy 的初衷 →</a>
            </div>
            <form className="searchbar" onSubmit={(event) => event.preventDefault()}>
              <span className="ic">搜</span>
              <input id="member-search" aria-label="搜尋教材" placeholder="搜尋教材，按 / 也能打開" value={query} onChange={(event) => setQuery(event.target.value)} />
            </form>
          </div>
          <a className="hero-pic" href="/#/about">
            <span className="arc" /><span className="ring" />
            <span className="orbit"><i /></span><span className="orbit o2"><i /></span>
            <img src="/member/willy.jpg" alt="Willy 在店裡" />
            <span className="chip c1">{apps.length}+ 套系統</span>
            <span className="chip c2">創業 19 年</span>
            <span className="chip c3">久沃餐飲</span>
            <span className="name">嗨，我是 Willy →</span>
          </a>
          <div className="stats">
            <a className="stat" href="#library"><b>{articles.length}</b><span>篇教材與實作</span></a>
            <a className="stat" href="#downloads"><b>{downloads.length}</b><span>個可下載的表和工具</span></a>
            <a className="stat" href="#toc"><b>{topics.length}</b><span>大主題</span></a>
          </div>
          <section className="dash" aria-label="實戰儀表板">
            <div className="dash-top"><b>Willy 的實戰儀表板</b><span>從 {aiStartDate} 起算</span></div>
            <div className="dash-grid">
              <a href="/#/journey"><small>用 AI 看店</small><strong>{daysSince(aiStartDate)} 天</strong><span>看歷程 →</span></a>
              <a href="/#/journey"><small>做了這些系統</small><strong>{SYSTEMS.length} 套</strong><span>公司 {props.company} · 個人 {props.personal}</span></a>
              <a href="/#/journey/footprint"><small>做過的事</small><strong>{EVENTS.length} 件</strong><span>數位足跡 →</span></a>
              <a href="/#/journey/subs"><small>訂閱人數</small><strong>{props.subsNow} 人</strong>
                <svg width="150" height="42" aria-hidden="true" className="spark">
                  <polyline fill="none" stroke="#C3F000" strokeWidth="2" points={props.spark} />
                  {props.spark.split(" ").map((pair) => {
                    const [x, y] = pair.split(",");
                    return <circle key={pair} cx={x} cy={y} r="3" fill="#C3F000" />;
                  })}
                </svg>
                <span className="spark-dates"><i>{SUBS[0]?.date}</i><i>{SUBS[SUBS.length - 1]?.date}</i></span>
              </a>
            </div>
          </section>
          <section className="quick">
            <a className="qc hl" href={`/#/c/${nextPath}`}>
              <span className="k">{pathStarted ? "繼續下一支" : "新手路線"} · 已看 {props.pathDone}/{learningPath.length}</span>
              <span className="v">{props.bySlug[nextPath]?.title}</span>
              <span className="prog"><i style={{ width: `${(props.pathDone / learningPath.length) * 100}%` }} /></span>
            </a>
            <a className="qc" href={props.newest[0] ? `/#/c/${props.newest[0].slug}` : "#new"}>
              <span className="k">最新上架 · 兩週內 {props.newest.length} 篇</span>
              <span className="v">{props.newest[0]?.title || "這兩週沒有新篇"}</span>
              <span className="go">馬上看 →</span>
            </a>
            {props.last ? (
              <a className="qc" href={`/#/c/${props.last.slug}`}><span className="k">上次看到</span><span className="v">{props.last.title}</span><span className="go">接著看 →</span></a>
            ) : (
              <button type="button" className="qc" onClick={() => props.setDrawer(true)}><span className="k">不知道從哪看？</span><span className="v">打開目錄，照主題找</span></button>
            )}
            <a className="qpromo" href="/#/c/tool-route">
              <span className="art" aria-hidden="true"><i className="road" /><i className="pin p1" /><i className="pin p2" /><i className="pin p3" /></span>
              <span className="gk">久沃送貨</span>
              <span className="gt">勾今天要送的店，排出順序</span>
              <span className="gs">打開路線 →</span>
            </a>
          </section>
        </div>
      </section>
      <div className="layout" id="library">
          <aside className={props.drawer ? "toc open" : "toc"} id="toc">
            <div className="side-card">
              <h4>分類</h4>
              <button type="button" className={filter === "all" ? "cl-it on" : "cl-it"} onClick={() => setFilter("all")}><span className="nm">全部內容</span><span className="cnt">{articles.length}</span></button>
              <button type="button" className={filter === "path" ? "cl-it on" : "cl-it"} onClick={() => setFilter("path")}><span className="nm">新手入門</span><span className="cnt">{props.pathDone}/{learningPath.length}</span></button>
              <button type="button" className={filter === "downloads" ? "cl-it on" : "cl-it"} onClick={() => setFilter("downloads")}><span className="nm">下載區</span><span className="cnt">{downloads.length}</span></button>
              {topics.map((topic) => {
                const list = articles.filter((article) => article.category === topic.id);
                const done = list.filter((article) => props.seen.includes(article.slug)).length;
                return (
                  <button type="button" key={topic.id} className={filter === topic.id ? "cl-it on" : "cl-it"} onClick={() => setFilter(topic.id)}>
                    <span className="nm">{topic.name}</span>
                    <span className="cnt">{done ? `${done}/` : ""}{list.length}</span>
                  </button>
                );
              })}
            </div>
            <div className="side-card">
              <h4>目錄 <small>點主題展開</small></h4>
              {topics.map((topic) => {
                const list = articles.filter((article) => article.category === topic.id);
                const open = props.openCats[topic.id] === true;
                return (
                  <div key={topic.id} className={open ? "toc-cat open" : "toc-cat"}>
                    <button type="button" className="toc-ct" onClick={() => props.setOpenCats({ ...props.openCats, [topic.id]: !open })}>
                      <span className="nm">{topic.name}</span><span className="cnt">{list.length}</span><span className="car">▶</span>
                    </button>
                    {open ? list.map((article) => <a key={article.slug} className={props.seen.includes(article.slug) ? "toc-it read" : "toc-it"} href={`/#/c/${article.slug}`}>{article.title}</a>) : null}
                  </div>
                );
              })}
            </div>
            <div className="side-card">
              <h4>熱門排行</h4>
              <p className="tiny">基礎次數在 ranking.ts，加上你這台看過的次數。</p>
              <div className="hot-list">
                {ranked.map((article, index) => (
                  <a key={article.slug} className="hot-it" href={`/#/c/${article.slug}`}><span className="no">{index + 1}</span><span className="t">{article.title}</span><span className="v">{score(article.slug)}</span></a>
                ))}
              </div>
            </div>
            <div className="side-card">
              <a className="me-card" href="/#/about"><img src="/member/willy.jpg" alt="" /><div><b>認識 Willy</b><span>開店 19 年，為什麼做這個站</span><span className="go">讀 Willy 的故事 →</span></div></a>
            </div>
          </aside>
          <div className="main">
            {query.trim() ? (
              <>
                <p className="hits">找到 <b>{hits.length}</b> 筆</p>
                <div className="grid">
                  {hits.map(({ article, snippet }) => (
                    <a key={article.slug} className="card" href={`/#/c/${article.slug}`}>
                      <span className={`thumb cover-${article.category}`}><small>{articleKind(article)}</small></span>
                      <span className="body">
                        <span className="tag">{topics.find((topic) => topic.id === article.category)?.name} · {articleKind(article)}</span>
                        <h3>{highlight(article.title, query)}</h3>
                        <p className="snip">{highlight(snippet, query)}</p>
                      </span>
                    </a>
                  ))}
                </div>
              </>
            ) : (<>
            <div className="cats">
              <button type="button" className={filter === "path" ? "cat on" : "cat"} onClick={() => { setFilter("path"); document.getElementById("library")?.scrollIntoView({ behavior: "smooth" }); }}>新手入門</button>
              <button type="button" className={filter === "new" ? "cat on" : "cat"} onClick={() => { setFilter("new"); document.getElementById("library")?.scrollIntoView({ behavior: "smooth" }); }}>最新更新</button>
              <button type="button" className={filter === "downloads" ? "cat on" : "cat"} onClick={() => { setFilter("downloads"); document.getElementById("library")?.scrollIntoView({ behavior: "smooth" }); }}>下載區</button>
              <i className="sep" />
              {topics.map((topic) => <button type="button" key={topic.id} className={filter === topic.id ? "cat on" : "cat"} onClick={() => { setFilter(topic.id); document.getElementById("library")?.scrollIntoView({ behavior: "smooth" }); }}>{topic.name}</button>)}
            </div>
            {filter === "path" || filter === "claude" ? (
              <div className="path-tbl" id={filter === "claude" ? "path-claude" : "path"}>
                <div className="ph"><b>建議學習步驟</b><span>{filter === "claude" ? `${claudePath.filter((id) => props.seen.includes(id)).length}/${claudePath.length}` : `${props.pathDone}/${learningPath.length}`}</span></div>
                {(filter === "claude" ? claudePath : learningPath).map((id, index) => (
                  <a key={id} className={props.seen.includes(id) ? "path-row read" : "path-row"} href={`/#/c/${id}`}>
                    <span className="no">STEP {index + 1}</span>
                    <span className="tt">{props.bySlug[id]?.title}<small>{props.bySlug[id]?.summary}</small></span>
                    <span className="ok">{props.seen.includes(id) ? "✓ 看過" : ""}</span>
                  </a>
                ))}
              </div>
            ) : null}
            {filter === "downloads" ? (
              <section id="downloads">
                <div className="sec-head"><h2>下載區</h2><p>表、網頁工具、提示詞。網頁工具的數字留在這台裝置。</p></div>
                <div className="cats">
                  <button type="button" className={fileKind === "全部" ? "cat on" : "cat"} onClick={() => setFileKind("全部")}>全部 <span>{downloads.length}</span></button>
                  {downloadKinds.map((kind) => <button type="button" key={kind} className={fileKind === kind ? "cat on" : "cat"} onClick={() => setFileKind(kind)}>{kind === "原始碼" ? "skill・原始碼" : kind === "HTML工具" ? "HTML 工具" : kind} <span>{downloads.filter((file) => file.kind === kind).length}</span></button>)}
                </div>
                {topics.filter((topic) => files.some((file) => file.topic === topic.id)).map((topic) => (
                  <section key={topic.id} className="sec">
                    <h3 className="sec-t">{topic.name}<span className="cnt">{files.filter((file) => file.topic === topic.id).length}</span></h3>
                    <div className="dlbox">
                      {files.filter((file) => file.topic === topic.id).map((file) => (
                        <div key={file.href} className="dlr">
                          <div className="info"><b>{file.name}</b><span>{file.description} · {formatBytes(file.bytes)}</span><a href={`/#/c/${file.article}`}>出自：{props.bySlug[file.article]?.title}</a></div>
                          <a className="get" href={file.href} download>下載</a>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </section>
            ) : (
              <>
                <div className="sec-head" id="new">
                  <h2>{filter === "all" ? "全部內容" : filter === "new" ? "最新更新" : filter === "path" ? "新手入門" : topics.find((topic) => topic.id === filter)?.name}</h2>
                  <p>{filter === "new" ? `近 30 天 ${props.monthCount} 篇，兩週內 ${props.newest.length} 篇` : filter === "all" || filter === "path" ? "先看步驟，再挑一篇打開。" : topics.find((topic) => topic.id === filter)?.blurb}</p>
                </div>
                {topics.filter((topic) => filter === topic.id).length ? visible.reduce<{ sub: string; items: Article[] }[]>((groups, article) => {
                  const found = groups.find((group) => group.sub === article.sub);
                  if (found) found.items.push(article);
                  else groups.push({ sub: article.sub, items: [article] });
                  return groups;
                }, []).map((group) => (
                  <section key={group.sub} className="sec">
                    <h3 className="sec-t">{subEmoji[group.sub] || "•"} {group.sub}<span className="cnt">{group.items.length}</span></h3>
                    <div className="grid">{group.items.map((article, index) => <ArticleCard key={article.slug} article={article} seen={props.seen.includes(article.slug)} step={index + 1} />)}</div>
                  </section>
                )) : <div className="grid">{visible.map((article) => <ArticleCard key={article.slug} article={article} seen={props.seen.includes(article.slug)} />)}</div>}
              </>
            )}
            </>)}
          </div>
        </div>
    </>
  );
}
function ArticleCard({ article, seen, step }: { article: Article; seen: boolean; step?: number }) {
  return (
    <a className={seen ? "card read" : "card"} href={`/#/c/${article.slug}`}>
      <span className={`thumb cover-${article.category}`}>
        {step ? <span className="step">STEP {step}</span> : null}
        {isNew(article.date) ? <span className="nw">新</span> : null}
        <span className="seen">✓ 看過</span>
        {article.video ? <span className="play">▶</span> : null}
        <small>{articleKind(article)}</small>
      </span>
      <span className="body">
        <span className="tag">{topics.find((topic) => topic.id === article.category)?.name} · {articleKind(article)}</span>
        <h3>{article.title}</h3>
        <p className="desc">{article.summary}</p>
      </span>
    </a>
  );
}
function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return <>{text.slice(0, idx)}<mark>{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</>;
}

function PathFooter({ article, articles }: { article: Article; articles: Article[] }) {
  const claudeIndex = claudePath.indexOf(article.slug);
  const path = claudeIndex >= 0 ? claudePath : learningPath.includes(article.slug) ? learningPath : null;
  if (!path) return null;
  const index = path.indexOf(article.slug);
  const next = path[index + 1];
  const nextArticle = articles.find((item) => item.slug === next);
  return (
    <footer className="path-foot">
      <p>學習路線 · 第 {index + 1}/{path.length} 篇</p>
      {nextArticle ? <p><Link href={`/read/${nextArticle.slug}`}>下一篇 · STEP {index + 2} {nextArticle.title}</Link></p> : <p>這條路線的最後一篇。</p>}
      <p><Link href={path === claudePath ? "/#path-claude" : "/#path"}>看完整學習步驟表</Link></p>
    </footer>
  );
}

const eventKinds: EventKind[] = ["系統上線", "工作方法", "AI助理", "內容產線", "成長", "踩雷"];

function Journey({ tab }: { tab: "milestone" | "footprint" | "subs" }) {
  const [kind, setKind] = useState<string>("全部");
  const [systemKind, setSystemKind] = useState<string>("全部");
  const months = Array.from(SYSTEMS.reduce((map, item) => {
    const key = item.since.slice(0, 7);
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map<string, number>())).map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month));
  const growth = SUBS.map((point, index) => ({ ...point, add: index === 0 ? point.count : point.count - SUBS[index - 1].count }));
  const first = SUBS[0]?.count || 0;
  const last = SUBS[SUBS.length - 1]?.count || 0;
  const days = Math.max(1, daysSince("2025-07-01"));
  const events = EVENTS.filter((event) => kind === "全部" || event.kind === kind);
  const systems = SYSTEMS.filter((item) => systemKind === "全部" || item.kind === systemKind);
  return (
    <div className="journey">
      <div className="j-intro">
        <div className="eyebrow"><span className="pulse" />實戰紀錄 · 持續更新</div>
        <h1>開店的人，<br /><em>用 AI 做了 {SYSTEMS.length} 套系統</em></h1>
        <p>從 {aiStartDate} 起，把店裡重複的事做成能打開的工具。每做一套、每踩一次，都記在這裡。</p>
      </div>
      <section className="dash">
        <div className="dash-grid">
          <div><small>用 AI 看店</small><strong>{daysSince(aiStartDate)} 天</strong></div>
          <div><small>系統</small><strong>{SYSTEMS.length} 套</strong></div>
          <div><small>做過的事</small><strong>{EVENTS.length} 件</strong></div>
          <div><small>訂閱人數</small><strong>{last}</strong></div>
        </div>
      </section>
      <nav className="jtabs">
        <a className={tab === "milestone" ? "on" : ""} href="/#/journey">系統里程</a>
        <a className={tab === "footprint" ? "on" : ""} href="/#/journey/footprint">數位足跡</a>
        <a className={tab === "subs" ? "on" : ""} href="/#/journey/subs">訂閱成長</a>
      </nav>
      {tab === "milestone" ? (
        <>
          <div className="chart">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={months}><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#1A1A16" /></BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chips">
            {["全部", "公司", "個人"].map((item) => <button type="button" key={item} onClick={() => setSystemKind(item)}>{item} {item === "全部" ? SYSTEMS.length : SYSTEMS.filter((system) => system.kind === item).length}</button>)}
          </div>
          <ol>{systems.map((item) => <li key={item.name}><b>{item.since}</b> {item.name} · {item.kind}</li>)}</ol>
        </>
      ) : null}
      {tab === "footprint" ? (
        <>
          <div className="chips">
            <button type="button" onClick={() => setKind("全部")}>全部 {EVENTS.length}</button>
            {eventKinds.map((item) => <button type="button" key={item} onClick={() => setKind(item)}>{item} {EVENTS.filter((event) => event.kind === item).length}</button>)}
          </div>
          <ol>{events.map((event) => <li key={event.date + event.title}><b>{event.date}</b> {event.kind} · {event.title}。{event.detail}</li>)}</ol>
        </>
      ) : null}
      {tab === "subs" ? (
        <>
          <h2>訂閱人數走勢</h2>
          <div className="metric-row">
            <div><b>{last}</b><span>目前人數</span></div>
            <div><b>+{last - first}</b><span>累計增加</span></div>
            <div><b>+{((last - first) / days).toFixed(2)}</b><span>平均每天</span></div>
            <div><b>{SUBS.length}</b><span>紀錄點</span></div>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={SUBS}><XAxis dataKey="date" /><YAxis /><Tooltip /><Line dataKey="count" stroke="#C3F000" dot={false} /></LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={growth}><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="add" fill="#1d3c34" /></BarChart>
            </ResponsiveContainer>
          </div>
          <table className="path">
            <tbody>{growth.map((row) => <tr key={row.date}><td>{row.date}</td><td>{row.count}</td><td>+{row.add}</td></tr>)}</tbody>
          </table>
        </>
      ) : null}
    </div>
  );
}

function About() {
  return (
    <section className="about">
      <a className="back" href="/#/">← 回到內容</a>
      <div className="box">
        <div className="ab-hero">
          <img src="/member/willy.jpg" alt="Willy 在廚房" />
          <div>
            <span className="tg">久沃餐飲</span>
            <h3>嗨，我是 <span>Willy</span></h3>
            <p>店從一間麵店開始，後來才有第二間、中央廚房，和要不要把早班表複製到下一間店的問題。</p>
          </div>
        </div>
        <div className="ab-stats">
          <div><b>19 年</b><span>開店</span></div>
          <div><b>多店</b><span>從一間開始</span></div>
          <div><b>{apps.length} 套</b><span>店裡在用的工具</span></div>
          <div><b>{SYSTEMS.length}</b><span>系統里程</span></div>
        </div>
        <div className="ab-body">
          <p>我把叫貨、班表、打烊四個數字做成打開就能用的表。數字留在你的裝置，不上傳。</p>
          <p>教材用繁體，例子是台灣的房租、外送抽成和驗收。一週只改一件事，改完才看下一個數字。</p>
          <section id="letter" className="why-box">
            <div className="k">初衷</div>
            <h5>為什麼做這個站</h5>
            <p className="hl">{founderQuote}</p>
            <p>先把店算清楚，再談要不要用 AI。這裡寫的是我自己在用的做法，不是課程大綱。</p>
            <p className="sign">Willy · 久沃餐飲</p>
          </section>
          <div className="ab-cta">
            <a className="p" href="/#/">回教材</a>
            <a className="s" href="/systems/">看全部工具</a>
          </div>
        </div>
      </div>
    </section>
  );
}
