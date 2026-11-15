window.Jiuwo = {
  load(key, demo) {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved && typeof saved === "object") return saved;
    } catch (error) {}
    return structuredClone(demo);
  },
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  clear(key) {
    localStorage.removeItem(key);
  },
  csv(name, rows) {
    const text = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
  },
  xlsx(name, rows, sheet) {
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), sheet || "表");
    XLSX.writeFile(book, name);
  },
  async read(file) {
    const data = await file.arrayBuffer();
    const book = XLSX.read(data, { type: "array" });
    return XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1, defval: "" });
  },
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const box = document.createElement("textarea");
      box.value = text;
      document.body.append(box);
      box.select();
      document.execCommand("copy");
      box.remove();
    }
  },
  places: [
    ["台北車站", 25.0478, 121.517],
    ["台北市政府", 25.041, 121.565],
    ["西門町", 25.042, 121.507],
    ["大安森林公園", 25.026, 121.534],
    ["松山機場", 25.069, 121.552],
    ["板橋車站", 25.014, 121.464],
    ["桃園車站", 24.989, 121.315],
    ["新竹車站", 24.802, 120.972],
    ["台中車站", 24.137, 120.687],
    ["嘉義車站", 23.479, 120.441],
    ["台南車站", 22.997, 120.213],
    ["高雄車站", 22.639, 120.302],
    ["高雄巨蛋", 22.669, 120.302],
    ["左營高鐵", 22.687, 120.308],
    ["花蓮車站", 23.993, 121.601],
    ["基隆車站", 25.132, 121.739],
    ["宜蘭車站", 24.755, 121.758],
  ],
  async geocode(query) {
    const q = query.trim();
    if (!q) return null;
    const exact = this.places.find((place) => place[0] === q);
    const contained = this.places.filter((place) => place[0] !== q && q.includes(place[0])).sort((a, b) => b[0].length - a[0].length)[0];
    const local = exact || contained;
    if (local) return { name: local[0], lat: local[1], lng: local[2], source: "站內地名" };
    const pair = q.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (pair) return { name: q, lat: Number(pair[1]), lng: Number(pair[2]), source: "座標" };
    try {
      const url = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=tw&q=" + encodeURIComponent(q);
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) return null;
      const rows = await response.json();
      if (!rows[0]) return null;
      return { name: rows[0].display_name, lat: Number(rows[0].lat), lng: Number(rows[0].lon), source: "Nominatim" };
    } catch (error) {
      return null;
    }
  },
};
