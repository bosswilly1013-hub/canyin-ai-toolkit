"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apps } from "@/lib/apps";
import { authStorageKey, aiStartDate, founderQuote, passwordSha256 } from "@/lib/member/config";
import { EVENTS, SUBS, SYSTEMS } from "@/lib/member/dashboard";
import type { Article } from "@/lib/member/load";
import { learningPath, topics } from "@/lib/member/topics";
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

function renderBody(body: string) {
  const blocks = body.split(/\n{2,}/);
  return blocks.map((block, index) => {
    const lines = block.split("\n");
    if (lines.every((line) => line.startsWith("- "))) {
      return <ul key={index}>{lines.map((line) => <li key={line}>{line.slice(2)}</li>)}</ul>;
    }
    if (lines[0].startsWith("## ")) return <h2 key={index}>{lines[0].slice(3)}</h2>;
    return <p key={index}>{block}</p>;
  });
}

export function MemberFrame({ page, articles, slug }: { page: "home" | "journey" | "about" | "read"; articles: Article[]; slug?: string }) {
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
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [zoom, setZoom] = useState("");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [lastSlug, setLastSlug] = useState("");

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
  function toggleSeen(id: string) {
    const next = seen.includes(id) ? seen.filter((item) => item !== id) : [...seen, id];
    setSeen(next);
    writeList(seenKey, next);
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
          <Link className={page === "journey" ? "on" : ""} href="/journey">歷程</Link>
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
          setQuoteOpen={setQuoteOpen}
          toggleFav={toggleFav}
        />
      ) : null}
      {page === "journey" ? <Journey /> : null}
      {page === "about" ? <About /> : null}
      {page === "read" && article ? (
        <article className="read">
          <p className="no-print"><Link href="/">回目錄</Link> · {topics.find((topic) => topic.id === article.category)?.name} · {article.sub} · 約 {article.minutes} 分鐘 {isNew(article.date) ? "· 新" : ""}</p>
          <h1>{article.title}</h1>
          <p>{article.summary}</p>
          <p className="no-print">
            <button type="button" onClick={() => toggleFav(article.slug)}>{favs.includes(article.slug) ? "已收藏" : "收藏"}</button>
            {" "}
            <button type="button" onClick={() => toggleSeen(article.slug)}>{seen.includes(article.slug) ? "已看完" : "我看完了"}</button>
            {" "}
            <button type="button" onClick={() => { void navigator.clipboard?.writeText(location.origin + `/read/${article.slug}/`).catch(() => undefined); ping("連結已複製"); }}>複製連結</button>
            {" "}
            <button type="button" onClick={() => window.print()}>列印</button>
          </p>
          <div className="no-print" style={{ border: "1px dashed var(--line)", borderRadius: 12, padding: 12, margin: "12px 0" }}>
            這篇還沒有影片。在文章開頭加上 video: 網址，就會嵌在這裡。
          </div>
          {renderBody(article.body)}
          {article.prompt ? (
            <p className="no-print">
              <button type="button" onClick={() => { void navigator.clipboard?.writeText(article.prompt).catch(() => undefined); ping("提示詞已複製"); }}>複製提示詞</button>
            </p>
          ) : null}
          {article.download ? <p><Link href={article.download}>{article.downloadLabel || "打開工具"}</Link></p> : null}
          <NextLink articles={articles} current={article} />
        </article>
      ) : null}
      {quoteOpen ? (
        <div className="modal" onClick={() => setQuoteOpen(false)}>
          <div className="sheet" onClick={(event) => event.stopPropagation()}>
            <h2>為什麼做這個站</h2>
            <p>{founderQuote}</p>
            <p>久沃先把叫貨、班表、打烊數字做成自己打開就能用的工具，再把做法寫給同業。這裡不賣別人的帳號，也不把你的表上傳。</p>
            <button type="button" onClick={() => setQuoteOpen(false)}>關閉</button>
          </div>
        </div>
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
  setQuoteOpen: (value: boolean) => void;
  toggleFav: (id: string) => void;
}) {
  const { articles, query, setQuery, hits } = props;
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
              <span>系統實作</span><span>經營觀念</span><span>開店工具</span>
              <span className="live">近 30 天新增 {props.monthCount} 篇</span>
            </div>
            <div className="quote">
              <span>「{founderQuote}」</span>
              <button type="button" onClick={() => props.setQuoteOpen(true)}>讀初衷</button>
            </div>
          </div>
          <div className="portrait">
            <span className="ring" />
            <span className="orbit"><i /></span>
            <img src="/member/willy.jpg" alt="Willy 在店裡" />
            <span className="badge b1">{apps.length} 套工具</span>
            <span className="badge b2">開店 19 年</span>
            <span className="badge b3">久沃餐飲</span>
          </div>
        </div>
      </section>
      <form className="search" onSubmit={(event) => event.preventDefault()}>
        <input id="member-search" aria-label="搜尋教材" placeholder="搜尋教材，按 / 也能打開" value={query} onChange={(event) => setQuery(event.target.value)} />
      </form>
      <div className="stats">
        <div><b>{articles.length}</b><span>篇教材</span></div>
        <div><b>{apps.length}</b><span>個可直接用的工具</span></div>
        <div><b>{topics.length}</b><span>大主題</span></div>
      </div>
      <section className="dash" aria-label="AI 實戰儀表板">
        <article><span>用 AI 看店</span><strong>{daysSince(aiStartDate)} 天</strong><span>從 {aiStartDate} 起</span></article>
        <article><span>做了這些系統</span><strong>{SYSTEMS.length} 套</strong><span>公司 {props.company} · 個人 {props.personal}</span></article>
        <article><span>做過的事</span><strong>{EVENTS.length} 件</strong><span>方法、店務、內容</span></article>
        <article>
          <span>訂閱人數</span><strong>{props.subsNow}</strong>
          <svg width="120" height="40" aria-hidden="true"><polyline fill="none" stroke="#e15a2b" strokeWidth="2" points={props.spark} /></svg>
        </article>
      </section>
      <section className="quick">
        <Link href="#path"><span>新手路線 · 已看 {props.pathDone}/{learningPath.length}</span><b>六步走完</b></Link>
        <Link href="#new"><span>最新上架 · 兩週內 {props.newest.length} 篇</span><b>{props.newest[0]?.title || "這兩週沒有新篇"}</b></Link>
        <Link href={props.last ? `/read/${props.last.slug}` : "#toc"}><span>上次看到</span><b>{props.last?.title || "打開目錄"}</b></Link>
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
          <h2>{hits.length} 篇符合</h2>
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
        <div className="layout">
          <aside className={props.drawer ? "side open" : "side"} id="toc">
            {topics.map((topic) => {
              const list = articles.filter((article) => article.category === topic.id);
              const done = list.filter((article) => props.seen.includes(article.slug)).length;
              return (
                <a key={topic.id} href={`#cat-${topic.id}`}>
                  {topic.name}（{list.length}）
                  <span className="bar"><i style={{ width: `${list.length ? (done / list.length) * 100 : 0}%` }} /></span>
                </a>
              );
            })}
            <h3>熱門</h3>
            {articles.slice().sort((a, b) => b.hot - a.hot).slice(0, 5).map((article) => (
              <Link key={article.slug} href={`/read/${article.slug}`}>{article.title}</Link>
            ))}
            <Link href="/about">認識 Willy</Link>
          </aside>
          <div>
            <section className="tools" id="tools">
              <h2>可直接用的工具</h2>
              <ul>{apps.map((app) => <li key={app.id}><Link href={`/systems/${app.id}`}>{app.name}：{app.help}</Link></li>)}</ul>
            </section>
            {props.favs.length ? <section className="tools"><h2>收藏</h2><ul>{props.favs.map((id) => props.bySlug[id] ? <li key={id}><Link href={`/read/${id}`}>{props.bySlug[id].title}</Link></li> : null)}</ul></section> : null}
            <table className="path" id="path">
              <tbody>
                {learningPath.map((id, index) => (
                  <tr key={id}><td>{index + 1}</td><td><Link href={`/read/${id}`}>{props.bySlug[id]?.title}</Link></td><td>{props.seen.includes(id) ? "看過" : ""}</td></tr>
                ))}
              </tbody>
            </table>
            <div id="new" />
            {topics.map((topic) => {
              const list = articles.filter((article) => article.category === topic.id);
              const open = props.openCats[topic.id] !== false;
              const subs = [...new Set(list.map((article) => article.sub))];
              return (
                <section key={topic.id} className="cat reveal" id={`cat-${topic.id}`}>
                  <h2>
                    <button type="button" onClick={() => props.setOpenCats({ ...props.openCats, [topic.id]: !open })}>{topic.name}</button>
                    <span>{list.length} 篇</span>
                  </h2>
                  <p>{topic.blurb}</p>
                  {open ? subs.map((sub) => (
                    <div key={sub} className="sub">
                      <h3>{sub}</h3>
                      {list.filter((article) => article.sub === sub).map((article) => (
                        <div key={article.slug} className="article">
                          <Link href={`/read/${article.slug}`}>{article.title}</Link>
                          {isNew(article.date) ? <span> 新</span> : null}
                          {props.seen.includes(article.slug) ? <span> ✓</span> : null}
                          <button type="button" onClick={() => props.toggleFav(article.slug)}>{props.favs.includes(article.slug) ? "已收藏" : "收藏"}</button>
                          <p>{article.summary} · {article.minutes} 分鐘</p>
                        </div>
                      ))}
                    </div>
                  )) : null}
                </section>
              );
            })}
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

function NextLink({ articles, current }: { articles: Article[]; current: Article }) {
  const list = articles.filter((article) => article.category === current.category);
  const index = list.findIndex((article) => article.slug === current.slug);
  const next = list[index + 1] || list[0];
  if (!next || next.slug === current.slug) return null;
  return <p><Link href={`/read/${next.slug}`}>下一篇：{next.title}</Link></p>;
}

function Journey() {
  return (
    <div className="read">
      <h1>歷程</h1>
      <p>從 {aiStartDate} 開始用 AI 看店，到現在 {daysSince(aiStartDate)} 天。系統 {SYSTEMS.length} 套，其中公司 {SYSTEMS.filter((item) => item.kind === "公司").length}、個人 {SYSTEMS.filter((item) => item.kind === "個人").length}。</p>
      <ol>
        {EVENTS.map((event) => <li key={event.date}><b>{event.date}</b> {event.title}。{event.detail}</li>)}
      </ol>
    </div>
  );
}

function About() {
  return (
    <div className="read">
      <h1>認識 Willy</h1>
      <img src="/member/willy.jpg" alt="Willy 在廚房" style={{ width: 180, borderRadius: "50%" }} />
      <p>我是久沃餐飲的 Willy。店從一間麵店開始，後來才有第二間、中央廚房和加盟的問題。這站寫我實際在用的表和工具，不是課程大綱。</p>
      <p>你會看到的系統，上傳自己的 Excel 就能用，數字不離開這台裝置。教材用繁體中文，例子是台灣的房租、外送抽成和叫貨。</p>
      <p><Link href="/systems">看全部工具</Link></p>
    </div>
  );
}
