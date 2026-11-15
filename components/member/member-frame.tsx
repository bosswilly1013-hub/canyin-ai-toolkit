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

function renderBody(body: string, onZoom: (src: string) => void) {
  const chunks = body.split("```");
  return chunks.map((chunk, index) => {
    if (index % 2 === 1) return <pre key={index} className="code"><code>{chunk.trim()}</code></pre>;
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
    if (page !== "read" || !slug || !authed) return;
    const next = [slug, ...readList(recentKey).filter((item) => item !== slug)].slice(0, 8);
    writeList(recentKey, next);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(next);
    localStorage.setItem("jiuwo.last", slug);
    setLastSlug(slug);
    const seenNow = readList(seenKey);
    if (!seenNow.includes(slug)) {
      const withSeen = [...seenNow, slug];
      writeList(seenKey, withSeen);
      setSeen(withSeen);
    }
    const views = JSON.parse(localStorage.getItem("jiuwo.views") || "{}") as Record<string, number>;
    views[slug] = (views[slug] || 0) + 1;
    localStorage.setItem("jiuwo.views", JSON.stringify(views));
    setViewMap(views);
    setNote(localStorage.getItem(`jiuwo.note.${slug}`) || "");
    setShowTool(false);
  }, [page, slug, authed]);

  function ping(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1600);
  }
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(themeKey, next);
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

  const article = slug ? bySlug[slug] : undefined;
  const spark = SUBS.map((point, index) => {
    const max = Math.max(...SUBS.map((item) => item.count));
    const x = (index / (SUBS.length - 1)) * 120;
    const y = 36 - (point.count / max) * 32;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="member" data-theme={theme}>
      <header className="m-head no-print">
        <button type="button" className="drawer" onClick={() => setDrawer((value) => !value)}>目錄</button>
        <Link href="/"><b>久沃</b> 訂閱</Link>
        <nav>
          <Link className={page === "home" ? "on" : ""} href="/">內容</Link>
          <Link className={page === "journey" ? "on" : ""} href="/journey">AI歷程</Link>
          <Link className={page === "about" ? "on" : ""} href="/about">認識 Willy</Link>
        </nav>
        <span className="sp" />
        <div className="tools">
          <button type="button" onClick={toggleTheme}>{theme === "dark" ? "淺色" : "深色"}</button>
          <button type="button" className="out" onClick={logout}>登出</button>
        </div>
      </header>
      {page === "home" ? (
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
      {page === "journey" ? <Journey tab={tab} /> : null}
      {page === "about" ? <About /> : null}
      {page === "read" && article ? (
        <article className="read overlay">
          <header className="overlay-bar no-print">
            <Link href="/">← 回去學習</Link>
            <span>{topics.find((topic) => topic.id === article.category)?.name} · {articleKind(article)}</span>
            <button type="button" onClick={() => { void navigator.clipboard?.writeText(location.origin + `/read/${article.slug}/`).catch(() => undefined); ping("連結已複製"); }}>複製連結</button>
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
          {renderBody(article.body, setZoom)}
          {article.prompt ? (
            <div className="code no-print">
              <p>{article.prompt}</p>
              <button type="button" onClick={() => { void navigator.clipboard?.writeText(article.prompt).catch(() => undefined); ping("提示詞已複製"); }}>複製</button>
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
      <section className="hero" onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }}>
        <div className="glow" />
        <div className="hero-grid">
          <div>
            <span className="pill">訂閱者專屬 · 持續更新中</span>
            <h1>歡迎回來<br />今天想看哪一篇？</h1>
            <p>教材和能用的工具都在這。表留在你的裝置，不用下載 App。</p>
            <div className="chips">
              <button type="button" onClick={() => setFilter("ai")}>系統實作</button>
              <button type="button" onClick={() => setFilter("mind")}>經營觀念</button>
              <button type="button" onClick={() => setFilter("tools")}>開店工具</button>
              <button type="button" className="live" onClick={() => setFilter("new")}>近 30 天新增 {props.monthCount} 篇</button>
            </div>
            <div className="quote">
              <span>「{founderQuote}」</span>
              <Link href="/about#letter">讀初衷</Link>
            </div>
          </div>
          <div className="portrait">
            <span className="ring" />
            <span className="orbit"><i /></span>
            <img src="/member/willy.jpg" alt="Willy 在店裡" />
            <span className="badge b1">{apps.length}+ 套系統</span>
            <span className="badge b2">創業 19 年</span>
            <Link href="/about" className="badge b3">嗨，我是 Willy →</Link>
          </div>
        </div>
      </section>
      <form className="search" onSubmit={(event) => event.preventDefault()}>
        <input id="member-search" aria-label="搜尋教材" placeholder="搜尋教材，按 / 也能打開" value={query} onChange={(event) => setQuery(event.target.value)} />
      </form>
      <div className="stats">
        <a href="#library"><b>{articles.length}</b><span>篇教材與實作</span></a>
        <a href="#downloads"><b>{downloads.length}</b><span>個可下載的表和工具</span></a>
        <a href="#toc"><b>{topics.length}</b><span>大主題</span></a>
      </div>
      <section className="dash" aria-label="AI 實戰儀表板">
        <Link href="/journey"><span>用 AI 看店</span><strong>{daysSince(aiStartDate)} 天</strong><span>從 {aiStartDate} 起</span></Link>
        <Link href="/journey"><span>做了這些系統</span><strong>{SYSTEMS.length} 套</strong><span>公司 {props.company} · 個人 {props.personal}</span></Link>
        <Link href="/journey/footprint"><span>做過的事</span><strong>{EVENTS.length} 件</strong><span>含踩過的雷</span></Link>
        <Link href="/journey/subs">
          <span>訂閱人數</span><strong>{props.subsNow}</strong>
          <svg width="120" height="40" aria-hidden="true"><polyline fill="none" stroke="#e15a2b" strokeWidth="2" points={props.spark} /></svg>
        </Link>
      </section>
      <section className="quick">
        <Link href={`/read/${nextPath}`}>
          <span>{pathStarted ? "繼續下一支" : "新手路線"} · 已看 {props.pathDone}/{learningPath.length}</span>
          <b>{props.bySlug[nextPath]?.title}</b>
          <span className="bar"><i style={{ width: `${(props.pathDone / learningPath.length) * 100}%` }} /></span>
        </Link>
        <Link href={props.newest[0] ? `/read/${props.newest[0].slug}` : "#new"}>
          <span>最新上架 · 兩週內 {props.newest.length} 篇</span>
          <b>{props.newest[0]?.title || "這兩週沒有新篇"}</b>
        </Link>
        {props.last ? (
          <Link href={`/read/${props.last.slug}`}><span>上次看到</span><b>接著看 {props.last.title}</b></Link>
        ) : (
          <button type="button" onClick={() => props.setDrawer(true)}><span>不知道從哪看？</span><b>打開目錄</b></button>
        )}
        <Link href="/systems/orders"><span>今天就能用</span><b>叫貨系統</b></Link>
      </section>
      {props.recent.length ? (
        <section className="tools">
          <h2>最近看過</h2>
          <ul>{props.recent.map((id) => props.bySlug[id] ? <li key={id}><Link href={`/read/${id}`}>{props.bySlug[id].title}</Link></li> : null)}</ul>
        </section>
      ) : null}
      {query.trim() ? (
        <section className="tools">
          <h2>找到 {hits.length} 筆</h2>
          <ul>
            {hits.map(({ article, snippet }) => (
              <li key={article.slug} className="hit">
                <Link href={`/read/${article.slug}`}>{highlight(article.title, query)}</Link>
                <p>{highlight(snippet, query)}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="layout" id="library">
          <aside className={props.drawer ? "side open" : "side"} id="toc">
            <button type="button" onClick={() => setFilter("all")}>全部內容（{articles.length}）</button>
            <button type="button" onClick={() => setFilter("path")}>新手入門 {props.pathDone}/{learningPath.length}</button>
            <a href="#downloads">下載區（{downloads.length}）</a>
            {topics.map((topic) => {
              const list = articles.filter((article) => article.category === topic.id);
              const done = list.filter((article) => props.seen.includes(article.slug)).length;
              return (
                <button type="button" key={topic.id} onClick={() => setFilter(topic.id)}>
                  {topic.name}（{list.length}）
                  <span className="bar"><i style={{ width: `${list.length ? (done / list.length) * 100 : 0}%` }} /></span>
                </button>
              );
            })}
            <h3>目錄</h3>
            {topics.map((topic) => {
              const list = articles.filter((article) => article.category === topic.id);
              const open = props.openCats[topic.id] === true;
              return (
                <div key={topic.id}>
                  <button type="button" onClick={() => props.setOpenCats({ ...props.openCats, [topic.id]: !open })}>{topic.name}</button>
                  {open ? list.map((article) => <Link key={article.slug} href={`/read/${article.slug}`}>{article.title}</Link>) : null}
                </div>
              );
            })}
            <h3>熱門排行</h3>
            <p>基礎次數寫在 ranking.ts，加上你這台看過的次數。</p>
            {ranked.map((article) => (
              <Link key={article.slug} href={`/read/${article.slug}`}>{article.title} · {score(article.slug)}</Link>
            ))}
            <Link href="/about" className="card">認識 Willy</Link>
          </aside>
          <div>
            <div className="chips">
              <button type="button" onClick={() => setFilter("path")}>新手入門</button>
              <button type="button" onClick={() => setFilter("new")}>最新更新</button>
              <button type="button" onClick={() => setFilter("downloads")}>下載區</button>
              {topics.map((topic) => <button type="button" key={topic.id} onClick={() => setFilter(topic.id)}>{topic.name}</button>)}
            </div>
            {filter === "path" ? (
              <table className="path" id="path">
                <tbody>
                  {learningPath.map((id, index) => (
                    <tr key={id}><td>STEP {index + 1}</td><td><Link href={`/read/${id}`}>{props.bySlug[id]?.title}</Link></td><td>{props.seen.includes(id) ? "看過" : ""}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {filter === "claude" ? (
              <table className="path" id="path-claude">
                <tbody>
                  {claudePath.map((id, index) => (
                    <tr key={id}><td>STEP {index + 1}</td><td><Link href={`/read/${id}`}>{props.bySlug[id]?.title}</Link></td><td>{props.seen.includes(id) ? "看過" : ""}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            <div className="cards" id="new">
              {(filter === "downloads" ? [] : visible).map((article, index) => (
                <Link key={article.slug} href={`/read/${article.slug}`} className="card">
                  <span className={`cover cover-${article.category}`}><small>{articleKind(article)}</small><b>{topics.find((topic) => topic.id === article.category)?.name}</b></span>
                  <span>{articleKind(article)}{isNew(article.date) ? " · 新" : ""}</span>
                  <b>{filter !== "all" && filter !== "new" ? `STEP ${index + 1} ` : ""}{article.title}</b>
                  <p>{article.summary}</p>
                  {props.seen.includes(article.slug) ? <span>看過</span> : null}
                </Link>
              ))}
            </div>
            {topics.filter((topic) => filter === "all" || filter === topic.id).map((topic) => {
              const list = articles.filter((article) => article.category === topic.id);
              const subs = [...new Set(list.map((article) => article.sub))];
              return (
                <section key={topic.id} className="cat" id={`cat-${topic.id}`}>
                  <h2>{topic.name}<span>{list.length} 篇</span></h2>
                  <p>{topic.blurb}</p>
                  {subs.map((sub) => (
                    <div key={sub} className="sub">
                      <h3>{subEmoji[sub] || "•"} {sub}</h3>
                    </div>
                  ))}
                </section>
              );
            })}
            <section id="downloads">
              <h2>下載區</h2>
              <div className="chips">
                <button type="button" onClick={() => setFileKind("全部")}>全部 {downloads.length}</button>
                {downloadKinds.map((kind) => (
                  <button type="button" key={kind} onClick={() => setFileKind(kind)}>{kind} {downloads.filter((file) => file.kind === kind).length}</button>
                ))}
              </div>
              {files.map((file) => (
                <article key={file.href} className="article">
                  <b>{file.name}</b>
                  <p>{file.description} · {formatBytes(file.bytes)}</p>
                  <p>出自：<Link href={`/read/${file.article}`}>{props.bySlug[file.article]?.title}</Link></p>
                  <p>
                    <a href={file.href} download>下載</a>
                    {file.open ? <> · <a href={file.open}>線上直接用</a></> : null}
                  </p>
                </article>
              ))}
            </section>
            <section className="tools" id="tools">
              <h2>可直接用的工具</h2>
              <ul>{apps.map((app) => <li key={app.id}><Link href={`/systems/${app.id}`}>{app.name}：{app.help}</Link></li>)}</ul>
            </section>
          </div>
        </div>
      )}
    </>
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
  }, new Map<string, number>())).map(([month, count]) => ({ month, count }));
  const growth = SUBS.map((point, index) => ({ ...point, add: index === 0 ? point.count : point.count - SUBS[index - 1].count }));
  const first = SUBS[0]?.count || 0;
  const last = SUBS[SUBS.length - 1]?.count || 0;
  const days = Math.max(1, daysSince("2025-07-01"));
  const events = EVENTS.filter((event) => kind === "全部" || event.kind === kind);
  const systems = SYSTEMS.filter((item) => systemKind === "全部" || item.kind === systemKind);
  return (
    <div className="read">
      <h1>AI 歷程</h1>
      <p>從 {aiStartDate} 起，{daysSince(aiStartDate)} 天。系統 {SYSTEMS.length} 套。</p>
      <nav className="chips">
        <Link href="/journey">系統里程</Link>
        <Link href="/journey/footprint">數位足跡</Link>
        <Link href="/journey/subs">訂閱成長</Link>
      </nav>
      {tab === "milestone" ? (
        <>
          <div className="chart">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={months}><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#e15a2b" /></BarChart>
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
          <p>現在 {last} 人。從第一筆到現在增加 {last - first} 人。平均一天約 {((last - first) / days).toFixed(2)} 人。</p>
          <div className="chart">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={SUBS}><XAxis dataKey="date" /><YAxis /><Tooltip /><Line dataKey="count" stroke="#e15a2b" dot={false} /></LineChart>
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
    <div className="read">
      <h1>認識 Willy</h1>
      <img src="/member/willy.jpg" alt="Willy 在廚房" style={{ width: 160, borderRadius: "50%" }} />
      <p>Willy · 久沃餐飲 · 開店 19 年</p>
      <div className="stats">
        <div><b>19</b><span>年</span></div>
        <div><b>多店</b><span>從一間麵店開始</span></div>
        <div><b>{apps.length}</b><span>套店裡在用的工具</span></div>
      </div>
      <p>店從一間麵店開始，後來才有第二間、中央廚房和加盟要不要複製的問題。這站寫我實際在用的表，不是課程大綱。</p>
      <section id="letter" className="card">
        <h2>為什麼做這個站</h2>
        <p>{founderQuote}</p>
        <p>先把叫貨、班表、打烊數字做成打開就能用的工具，再把做法寫給同業。這裡不賣別人的帳號，也不把你的表上傳。</p>
      </section>
      <p><Link href="/systems">看全部工具</Link> · <Link href="/pricing">訂閱說明</Link></p>
    </div>
  );
}
