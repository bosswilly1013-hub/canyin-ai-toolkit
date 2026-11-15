export function ToolJump({ href, name }: { href: string; name: string }) {
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${href}`} />
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(href)})` }} />
      <main style={{ padding: 28, fontFamily: "sans-serif" }}>
        <p>
          <a href={href}>{name}</a>
        </p>
      </main>
    </>
  );
}
