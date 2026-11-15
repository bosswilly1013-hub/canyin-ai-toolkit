# 餐飲 AI 懶人包

給台灣餐廳的現成系統。每一類只留一套：把自己的叫貨、菜單、班表或客人名單丟進去，變成你的系統。損益、外送、毛利、走道仍是瀏覽器裡的小工具，數字用程式算。

## 本機執行

需要 Node.js 20 以上。

```bash
npm install
npm run dev
```

開發站聽在 `http://127.0.0.1:43123`。

```bash
npm test
npm run lint
npm run build
```

`npm run build` 會在 `out/` 產出靜態檔，可以放到任何靜態主機。

## 部署

這個站是靜態檔，放在 Firebase Hosting。`firebase.json` 的公開目錄是 `out`，`cleanUrls` 與 `trailingSlash` 都打開。`.firebaserc` 裡的專案編號是佔位 `canyin-ai-toolkit`，部署前改成你自己的 Firebase 專案。

```bash
npm run build
npx firebase deploy --only hosting
```

### Render 靜態網站（備援）

`render.yaml` 仍在。Build command 是 `npm ci && npm run build`，發布目錄是 `out`。

路由使用結尾斜線（例如 `/tools/break-even/`）。沒有資料庫、沒有登入。輸入存在訪客瀏覽器的 localStorage。

## AI 問答

預設沒有對話框。要打開時，建置前設定環境變數（見 `.env.example`）：

```bash
NEXT_PUBLIC_AI_API_KEY=你的金鑰
NEXT_PUBLIC_AI_BASE_URL=https://api.openai.com/v1
NEXT_PUBLIC_AI_MODEL=gpt-4o-mini
```

介面相容 OpenAI Chat Completions。`NEXT_PUBLIC_` 會把金鑰打進靜態檔，任何人看得到。正式環境請把 `NEXT_PUBLIC_AI_BASE_URL` 指到你自己的代理，金鑰留在伺服器。沒有金鑰時，`/ask` 只顯示說明，其他工具不受影響。

## 之後的會員

`/pricing` 是佔位，不能付款。`lib/membership.ts` 寫了接下來要接的兩件事：

- Supabase Auth 負責登入
- 綠界 ECPay 定期定額負責收款

綠界的付款通知需要伺服器。靜態輸出收不到回呼。要收費時，拿掉 `output: "export"`，或把回呼放到另一個服務，而且只相信伺服器寫進資料庫的會員狀態。

## 工具從哪來

| 項目 | 做法 |
| --- | --- |
| 損益兩平、外送定價、菜單毛利、營業目標 | 自己寫的公式，有單元測試 |
| 報表 | 瀏覽器裡用 SheetJS（`xlsx`）讀 Excel／CSV，用 Recharts 畫圖 |
| 品牌定位圖、店面走道 | 自己寫的可拖曳畫布，可存 PNG |
| 正式平面圖、美編、商家檔案、發票、庫存、POS | 不重做。懶人包導覽連到 Sweet Home 3D、Canva、Google、LINE、Grocy、ERPNext 等已確認的網站 |
| AI 問答 | 有金鑰才出現，不參與任何計算 |

範例店是虛構的「阿旺牛肉麵」，數字用來把公式講清楚，不是某家實店的帳。
