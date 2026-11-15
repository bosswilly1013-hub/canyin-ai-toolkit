import fs from "node:fs";
import path from "node:path";
import { topics, type TopicId } from "@/lib/member/topics";

export type Article = {
  slug: string;
  title: string;
  summary: string;
  category: TopicId;
  sub: string;
  date: string;
  minutes: number;
  hot: number;
  prompt: string;
  download: string;
  downloadLabel: string;
  video: string;
  tool: string;
  file: string;
  body: string;
};

function parse(raw: string, file: string): Article {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`文章缺少開頭：${file}`);
  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  const category = data.category as TopicId;
  if (!topics.some((topic) => topic.id === category)) throw new Error(`未知主題 ${data.category}`);
  return {
    slug: data.slug,
    title: data.title,
    summary: data.summary,
    category,
    sub: data.sub,
    date: data.date,
    minutes: Number(data.minutes) || 4,
    hot: Number(data.hot) || 0,
    prompt: data.prompt || "",
    download: data.download || "",
    downloadLabel: data.downloadLabel || "",
    video: data.video || "",
    tool: data.tool || "",
    file: data.file || "",
    body: match[2].trim(),
  };
}

export function loadArticles(): Article[] {
  const dir = path.join(process.cwd(), "content", "member");
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => parse(fs.readFileSync(path.join(dir, name), "utf8"), name))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "zh-Hant"));
}
