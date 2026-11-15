export type PreviewKind = "orders" | "products" | "sales" | "faq" | "markdown" | "table" | "workflow";

export type SystemSample = {
  filename: string;
  note: string;
  rows?: (string | number)[][];
  text?: string;
};

export type ReadySystem = {
  slug: string;
  name: string;
  category: string;
  pain: string;
  example: string;
  dataIn: string;
  setupTime: string;
  cost: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  chinese: string;
  license: string;
  repoUrl: string;
  repoPrivate?: boolean;
  cloudRunUrl?: string;
  cloudRunNote?: string;
  secondary?: { label: string; url: string; note: string }[];
  docsUrl?: { label: string; url: string };
  steps: string[];
  sample: SystemSample;
  preview: PreviewKind | null;
  companion?: string;
};

export type GapCard = {
  slug: string;
  name: string;
  pain: string;
  why: string;
};

export const difficultyLabel: Record<ReadySystem["difficulty"], string> = {
  1: "很簡單",
  2: "大約半天",
  3: "留一個下午",
  4: "要找懂的人",
  5: "要工程師",
};

export const freeTierNote =
  "Cloud Run 依「有人來才計費」。以 Google 公布的請求制、us-central1 為準，每個月大約有 200 萬次請求、18 萬 vCPU 秒、36 萬 GiB 秒記憶體不用錢，超過才計費，數字會變，以 Cloud Run 價目頁為準。沒人用會縮到 0，不一直扣主機費，但再醒來要幾秒。容器裡的硬碟是暫時的，SQLite 檔案在縮放或重新部署後會不見。要留下資料，用 Cloud SQL 的 PostgreSQL，或外面的 Neon（也是 PostgreSQL，有免費方案）。Cloud SQL 本身要另外付資料庫的錢。";

const renderProcurement = {
  label: "改用 Render（備援）",
  url: "https://render.com/deploy?repo=https://github.com/bosswilly1013-hub/procurement-hub",
  note: "倉庫有 render.yaml，也會一併開一個 PostgreSQL。免費方案會休眠，喚醒要等。",
};

export const systems: ReadySystem[] = [
  {
    slug: "procurement",
    name: "多門市叫貨",
    category: "叫貨／採購／庫存",
    pain: "每週叫貨還在傳 Excel，換一家店就要重打一份廠商清單。",
    example: "左營店每週一跟鮮達叫高麗菜 6 顆、跟大成叫雞腿 8 公斤。把過去的叫貨表丟進去，系統就記得廠商、單價，以及平常叫多少。",
    dataIn: "叫貨 Excel 或 CSV：廠商、品項、單位、單價、數量、日期。店名和 Logo 在匯入時一起填。",
    setupTime: "一個下午",
    cost: "Cloud Run 有免費額度。資料庫用 Cloud SQL 或 Neon，資料庫要另外付或用 Neon 免費方案。LINE 推播在官方額度內通常不再加授權費。",
    difficulty: 2,
    chinese: "繁中，台灣用詞",
    license: "這是店東自己的系統，倉庫還沒有公開授權條款。只有你自己的店在用。",
    repoUrl: "https://github.com/bosswilly1013-hub/procurement-hub",
    repoPrivate: true,
    steps: [
      "先在下面用你的叫貨表看預覽。欄位寫成供應商、品名、單價(元) 也猜得到。日期可以是 2026-10-01、2026/10/1，或民國 114/10/1。CSV 用 Big5 也可以。",
      "這套倉庫目前沒有 Dockerfile，所以沒有「Run on Google Cloud」一鍵按鈕。",
      "要放上 Google Cloud：做成容器後跑 Cloud Run，資料庫接 Cloud SQL 的 PostgreSQL，或 Neon 的 PostgreSQL，把連線字串設成 DATABASE_URL。",
      "不要靠 SQLite。Cloud Run 的硬碟是暫時的，服務縮到 0 或重新部署後，廠商和叫貨紀錄會不見。",
      "若只是先看畫面，可以用下面的 Render 備援。那個按鈕會依倉庫裡的 render.yaml 開網站和 PostgreSQL。免費方案會休眠。",
      "打開網址，進「推播設定＆資料管理 → 資料管理」，上傳同一份 Excel，填店名和 Logo。歷史單會標成已驗收，不會推 LINE，也不會塞進待驗收。",
      "LINE 的 Channel access token 和 secret 填在環境變數 LINE_CHANNEL_ACCESS_TOKEN、LINE_CHANNEL_SECRET。沒填就不會真的傳訊息。",
    ],
    sample: {
      filename: "叫貨資料範例.xlsx",
      note: "欄位對得上系統的匯入：廠商、品項、單位、單價、數量、日期。",
      rows: [
        ["廠商", "品項", "單位", "單價", "數量", "日期"],
        ["鮮達蔬果", "高麗菜", "顆", 45, 6, "2026-10-01"],
        ["鮮達蔬果", "青蔥", "把", 30, 3, "2026-10-01"],
        ["大成肉品", "雞腿排", "公斤", 95, 8, "2026-10-08"],
      ],
    },
    preview: "orders",
    secondary: [renderProcurement],
  },
  {
    slug: "tastyigniter",
    name: "掃碼點餐",
    category: "POS／點餐／QR／排隊",
    pain: "客人想自己點，店裡還沒有一份自己的線上菜單。",
    example: "牛肉麵 180、小菜 40、加麵 30。客人掃桌上的 QR，選好就進廚房，不用等服務生抄單。",
    dataIn: "菜單：分類、菜名、售價、一句說明。後台沒有一支現成的 Excel 匯入，這份表是你對著螢幕鍵入用的。",
    setupTime: "一天，要有人會裝 PHP 網站",
    cost: "軟體是 MIT，不收授權費。你付的是主機。官方沒有 Cloud Run 一鍵，因為倉庫裡沒有 Dockerfile。",
    difficulty: 3,
    chinese: "這輪沒有核對到繁中語系檔，後台可能是英文。",
    license: "MIT。可以自己架來用，也可以改。",
    repoUrl: "https://github.com/tastyigniter/TastyIgniter",
    docsUrl: { label: "官方安裝說明", url: "https://tastyigniter.com/docs/installation" },
    steps: [
      "準備菜單表：分類、菜名、售價、說明。",
      "這套沒有 Dockerfile，不能按 Cloud Run 一鍵。照官方安裝說明，用 PHP 和 Composer 裝在一台主機上。",
      "裝好後進管理後台，把營業時間、外帶或外送範圍、桌位填上。",
      "依表格把每一道菜打進菜單。售價用新台幣，說明寫客人看得到的那一句。",
      "印出點餐 QR，貼在桌上。先用自己的手機點一碗，確認廚房看得到。",
    ],
    sample: {
      filename: "菜單對照.csv",
      note: "這不是系統的匯入檔。後台沒有對應的 Excel 匯入，請照欄位鍵入。",
      rows: [
        ["分類", "菜名", "售價", "說明"],
        ["麵食", "紅燒牛肉麵", 180, "湯頭每天現熬"],
        ["小菜", "滷蛋", 20, "一顆"],
        ["加點", "加麵", 30, "同碗加一份麵"],
      ],
    },
    preview: "table",
  },
  {
    slug: "openresto",
    name: "線上訂位",
    category: "訂位／預約",
    pain: "電話訂位容易撞桌，客人也不知道星期五晚上還有沒有位。",
    example: "主區 4 人桌 8 張、靠窗 2 人桌 4 張。客人選 11/20、4 位、18:30，系統先把那張桌留 5 分鐘，填完名字就成立。",
    dataIn: "區域、桌名、座位數、營業時段。後台是一張張桌建起來，不是吃 Excel。",
    setupTime: "半天，會下 Docker 指令的話",
    cost: "MIT，不收授權費。主機自己付。官方做法是 Docker Compose，不是單一 Cloud Run 按鈕。",
    difficulty: 2,
    chinese: "這輪沒有核對到繁中介面。",
    license: "MIT。自己的店可以架。",
    repoUrl: "https://github.com/karanshukla/openresto",
    steps: [
      "寫下樓面：區域、桌名、幾人坐。",
      "到 GitHub 的最新釋出版下載 docker-compose.yml，依 .env.example 做一個 .env。信箱不寄信可以先空白。",
      "在同一台機器執行 docker compose up -d。資料庫用它自帶的 SQLite，檔案在那台機器的磁碟上，不要放在會把硬碟清掉的 Cloud Run。",
      "進後台建立餐廳、時區選 Asia/Taipei、填營業時段和每一張桌。",
      "用手機訂一張今晚的桌，再到後台看今天的名單對不對。",
    ],
    sample: {
      filename: "桌位對照.csv",
      note: "後台沒有匯入這份檔。建桌時照著填。",
      rows: [
        ["區域", "桌名", "座位數"],
        ["主區", "A1", 4],
        ["主區", "A2", 4],
        ["靠窗", "W1", 2],
      ],
    },
    preview: "table",
  },
  {
    slug: "frappe-hr",
    name: "排班與出勤",
    category: "排班／打卡／薪資",
    pain: "班表在群組裡傳，誰週六上班、誰請假，對不起來。",
    example: "外場小美週一到週五晚班，阿國週六日早班。請假和上班時數放在同一套裡，月底才對薪資。",
    dataIn: "員工：名字、公司、到職日、性別、部門、在職狀態。正式匯入時，欄位名稱要以系統下載的範本為準。",
    setupTime: "一兩天，建議找架過 Frappe 的人",
    cost: "GPL-3.0，自架不收授權費。導入比單店排班表重。沒有單一 Dockerfile 可以一鍵上 Cloud Run。",
    difficulty: 4,
    chinese: "這輪沒有核對到繁中語系檔。",
    license: "GPL-3.0。你改了程式又拿給別人用，要一併公開改過的程式。",
    repoUrl: "https://github.com/frappe/hrms",
    docsUrl: { label: "標準的 Docker 裝法（frappe_docker）", url: "https://github.com/frappe/frappe_docker" },
    steps: [
      "先列員工：名字、部門、到職日。",
      "不要把整套 Frappe 丢上單一顆 Cloud Run。官方是用 frappe_docker 這套 Compose，裡面有資料庫和多個服務，要一台一直開著的機器。",
      "裝好後建立公司，時區 Asia/Taipei。",
      "在員工資料按匯入，先下載系統給的範本。表頭對不上就用那份範本，不要硬貼。",
      "再排班表：誰哪一天哪一班。先排下一週，跟店長對過再給員工看。",
    ],
    sample: {
      filename: "員工對照.csv",
      note: "欄位是 Employee 常見英文欄名。匯入前請用系統下載的範本覆寫表頭。",
      rows: [
        ["First Name", "Company", "Date of Joining", "Gender", "Status", "Department"],
        ["小美", "左營店", "2024-03-01", "Female", "Active", "外場"],
        ["阿國", "左營店", "2023-11-15", "Male", "Active", "外場"],
      ],
    },
    preview: "table",
  },
  {
    slug: "jianren-promo",
    name: "員工晉升考核",
    category: "員工訓練／SOP／考核",
    pain: "誰可以升正職，靠店長記得，沒有一張大家都看得到的清單。",
    example: "外場計時要升正職：連續三個月打卡準時、會獨立收桌、通過一張衛生測驗。主管打勾、上傳照片，全部完成才由管理員核准。",
    dataIn: "職級、檢查項目、要連續幾個月。門市、帳號、直屬主管在後台建。",
    setupTime: "半天",
    cost: "自架。Cloud Run 免費額度夠先試，但 SQLite 不會留在 Cloud Run。正式用要改接資料庫，或接受重啟後考核紀錄消失。",
    difficulty: 2,
    chinese: "繁中，台灣用詞",
    license: "店東自己的系統，倉庫還沒有公開授權條款。",
    repoUrl: "https://github.com/bosswilly1013-hub/jianren-promo",
    repoPrivate: true,
    cloudRunUrl: "https://deploy.cloud.run/?git_repo=https://github.com/bosswilly1013-hub/jianren-promo",
    cloudRunNote: "倉庫有 Dockerfile，可以按一鍵做成 Cloud Run。它用 SQLite。Cloud Run 重啟後檔案會不見，考核進度不要只放在那裡。倉庫是私有的，Google 帳號還要能讀到這個 GitHub。",
    secondary: [
      {
        label: "改用 Render（備援）",
        url: "https://render.com/deploy?repo=https://github.com/bosswilly1013-hub/jianren-promo",
        note: "有 render.yaml。免費方案把資料放暫時目錄，重啟也會丟。正式要掛持久磁碟。",
      },
    ],
    steps: [
      "寫下每個職級要打勾的項目，和要連續幾個月。",
      "按「放到 Google Cloud」。登入後它會用倉庫的 Dockerfile 建服務。",
      "先用一間店試。建門市、主管帳號、員工帳號。",
      "把晉升清單照表打進後台。這份 CSV 是對照，不是後台的匯入格式。",
      "請一位主管打勾一項、上傳一張佐證，確認員工看得到退回原因。",
      "確定要正式用之後，把資料改接到不會被清掉的資料庫。在那之前，不要把唯一的進度只放在 Cloud Run。",
    ],
    sample: {
      filename: "晉升清單對照.csv",
      note: "後台建立清單時照這張表打。不是一支現成的匯入按鈕。",
      rows: [
        ["職級", "項目", "要連續幾個月"],
        ["外場正職", "準時打卡", 3],
        ["外場正職", "獨立收桌", 1],
        ["外場正職", "衛生測驗", 1],
      ],
    },
    preview: "table",
  },
  {
    slug: "twenty",
    name: "顧客資料",
    category: "會員／CRM／集點",
    pain: "客人電話和喜好散在群組和筆記本，下次辦活動找不到人。",
    example: "王小姐、0912 開頭、公司行號、上次說來吃週年餐。活動前把名單倒進顧客資料，誰聯絡過看得到。",
    dataIn: "姓名、Email、電話、公司。匯入時畫面上還可以改欄位對應。這不是集點卡。",
    setupTime: "半天到一天",
    cost: "自架不收軟體授權費，主機和資料庫另計。官方 Compose 在 packages/twenty-docker，不是一顆 Cloud Run 就跑得完。",
    difficulty: 3,
    chinese: "這輪沒有核對到繁中語系檔。",
    license: "AGPL-3.0。你改過程式又讓別人透過網路用，要公開改動。部分檔案另有商業授權。",
    repoUrl: "https://github.com/twentyhq/twenty",
    steps: [
      "從訂位本或 LINE 把客人整理成姓名、電話、Email。",
      "不要按單一容器的 Cloud Run。照倉庫 packages/twenty-docker/docker-compose.yml，在一台有磁碟的機器上把資料庫和網站一起啟動。",
      "登入後建立工作區。",
      "匯入 CSV。欄位對不上就在畫面上改成姓名、電話。",
      "先匯 20 筆試查。查得到再匯全部。集點、印花這件事這套不做。",
    ],
    sample: {
      filename: "顧客名單.csv",
      note: "Twenty 匯入 CSV 時可以對欄位。表頭用姓名、Email、電話、公司即可。",
      rows: [
        ["姓名", "Email", "電話", "公司"],
        ["王小美", "wang@example.com", "0912000111", ""],
        ["陳先生", "chen@example.com", "0922000222", "海味貿易"],
      ],
    },
    preview: "table",
  },
  {
    slug: "dify",
    name: "菜單問答",
    category: "LINE 機器人／客服",
    pain: "客人一直問有沒有素、營業到幾點，店員要重複回。",
    example: "把菜單和 FAQ 丟進知識庫。客人問「可以不要香菜嗎」，它依你寫的答案回，不會自己編價錢。",
    dataIn: "一份文字檔：一行問題、一行答案。PDF 菜單也可以直接上傳。還要一組模型 API 金鑰。",
    setupTime: "一個下午，還要申請模型金鑰",
    cost: "主機加上模型 API。模型依字數計費，向你選的廠商付，這裡不寫死金額。授權不允許拿去開一套跟 Dify 競爭的雲平台；自己店用可以。",
    difficulty: 3,
    chinese: "有繁中文件和 zh-Hant 介面。",
    license: "以 Apache-2.0 為底，另有附加條件：不可拿去經營競爭性的代管平台。",
    repoUrl: "https://github.com/langgenius/dify",
    docsUrl: { label: "Docker Compose 安裝", url: "https://docs.dify.ai/en/self-host/deploy/quick-start/docker-compose" },
    steps: [
      "把常問的十題寫成「問題、答案」，價錢和公休以你寫的為準。",
      "這套是好多個容器，不是一顆 Cloud Run。在機器上進倉庫的 docker 目錄，設好 .env 裡的金鑰，執行 docker compose up -d。",
      "打開網站，建立一個知識庫，上傳這份 CSV 或 TXT。",
      "在設定裡貼上模型 API 金鑰。沒有金鑰就不會回答。",
      "自己問三題：營業時間、素食、外送。答錯就改文件，不要先接到客人看的 LINE。",
      "LINE 官方帳號的完整客服後台，這套沒有內建。對外出 LINE 要另外接，這頁不假裝已經接好。",
    ],
    sample: {
      filename: "常見問題.csv",
      note: "Dify 知識庫接受 CSV、TXT、PDF。兩欄：問題、答案。",
      rows: [
        ["問題", "答案"],
        ["營業到幾點", "週一到週日 11:30 到 21:00，最後點餐 20:30。"],
        ["可以不要香菜嗎", "可以，點餐時跟店員說。"],
        ["有素食嗎", "有炒青菜和麻婆豆腐，豆腐是素的。"],
      ],
    },
    preview: "faq",
  },
  {
    slug: "postiz",
    name: "社群排程",
    category: "社群排程發文",
    pain: "今天的特餐文案寫好了，人一忙就忘記發。",
    example: "週三 11:00 發 IG 和 Facebook：「今日紅燒牛肉麵，湯頭現熬。」先排好一週，人不用每天守著。",
    dataIn: "日期、時間、平台、文案。Postiz 沒有一支 Excel 匯入，這張表是你在日曆裡照著貼的。還要各平台的連線授權。",
    setupTime: "一個下午",
    cost: "自架。AGPL。各平台是否收費以那個平台為準。沒有正式的 Dockerfile 放在倉庫根目錄，所以沒有 Cloud Run 一鍵。",
    difficulty: 3,
    chinese: "這輪沒有核對到繁中語系檔。",
    license: "AGPL-3.0。改了又提供成網路服務，要公開改動。",
    repoUrl: "https://github.com/gitroomhq/postiz-app",
    secondary: [
      {
        label: "用 Railway 開（備援）",
        url: "https://railway.com/deploy/postiz",
        note: "官方有 Railway 部署頁。仍要自己接資料庫和各平台金鑰。",
      },
    ],
    steps: [
      "先寫一週的文案：哪一天、幾點、哪個平台、內文。",
      "倉庫根目錄沒有正式 Dockerfile，Cloud Run 一鍵不會好好裝起來。用倉庫的 docker-compose，或按 Railway 備援。",
      "Compose 需要資料庫和 Redis，照倉庫說明填環境變數。",
      "登入後連接 Instagram、Facebook。沒連上的平台不要排。",
      "照表格把文案貼進日曆，先排一則只給自己看的測試帳號。",
    ],
    sample: {
      filename: "一週發文對照.csv",
      note: "不是 Postiz 的匯入檔。在日曆裡照這張表貼。",
      rows: [
        ["日期", "時間", "平台", "文案"],
        ["2026-11-18", "11:00", "Instagram", "今日紅燒牛肉麵，湯頭現熬。"],
        ["2026-11-18", "11:00", "Facebook", "今日紅燒牛肉麵，湯頭現熬。"],
      ],
    },
    preview: "table",
  },
  {
    slug: "moneyprinter",
    name: "自動短影音",
    category: "自動剪輯／短影音",
    pain: "想每天發一支菜色短片，但沒有人剪。",
    example: "主題寫「今日特餐：紅燒牛肉麵，湯頭現熬，售價 180」。它寫旁白、配音、找畫面、上字幕，出一支直式影片。",
    dataIn: "一行一個主題。品牌語氣可以用一句話寫在主題後面。還要語言模型和配音的 API 金鑰。",
    setupTime: "一個下午",
    cost: "MIT，軟體不收費。模型、配音依用量付。有顯示卡會比較快，沒有也能跑，只是慢。",
    difficulty: 3,
    chinese: "說明以簡體中文和英文為主，介面不是台灣繁中。",
    license: "MIT。自己的店可以架。",
    repoUrl: "https://github.com/harry0703/MoneyPrinterTurbo",
    cloudRunUrl: "https://deploy.cloud.run/?git_repo=https://github.com/harry0703/MoneyPrinterTurbo",
    cloudRunNote: "倉庫根目錄有 Dockerfile，可以一鍵上 Cloud Run。免費額度夠試幾支。做成的影片若只放在容器裡，重新部署會不見，請下載存到自己的雲端硬碟。",
    steps: [
      "寫 3 個主題，每個一行，講菜名和一句賣點，不要寫還沒決定的價錢。",
      "按「放到 Google Cloud」，用你的 Google 帳號。它會依 Dockerfile 建服務。",
      "打開網站。模型金鑰和配音金鑰填在它的設定頁，沒填就出不了片。",
      "把第一行主題貼進「視頻主題」，選直式 9:16，先出一支。",
      "看過字幕和價錢再發。它會寫稿，發之前你要自己看過。",
    ],
    sample: {
      filename: "短片主題.txt",
      note: "一行一個主題，貼進「視頻主題」。不是一支批次匯入。",
      text: "今日特餐：紅燒牛肉麵，湯頭現熬\n新菜：麻婆豆腐，可以不要香菜\n週末限定：滷味拼盤",
    },
    preview: null,
    companion: "另外搭配：片是你自己拍的、只要字幕，用 VideoCaptioner。它的說明寫 pip install videocaptioner，語音轉文字可以先不填 API 金鑰。倉庫 https://github.com/WEIFENG2333/VideoCaptioner 。授權 GPL-3.0。",
  },
  {
    slug: "comfyui",
    name: "菜單圖",
    category: "AI 圖片／菜單圖",
    pain: "菜有了，菜單上的圖還是手機隨手拍、背景很亂。",
    example: "用牛肉麵的照片當參考，讓畫面乾淨、光線像菜單，再拿去印。這要一台有顯示卡的電腦，不是網頁一鍵。",
    dataIn: "一句畫面說明，加上你自己拍的菜色照片。模型檔要另外下載，各模型的授權不同。",
    setupTime: "半天到一天，看顯示卡順不順",
    cost: "軟體 GPL-3.0。電費或租顯示卡另計。沒有顯示卡就不要用這套硬上 Cloud Run。",
    difficulty: 4,
    chinese: "有社群中文，官方完整繁中這輪沒核對。",
    license: "GPL-3.0。模型權重各自有授權，商用前看你下載的那個模型。",
    repoUrl: "https://github.com/Comfy-Org/ComfyUI",
    docsUrl: { label: "桌面版下載", url: "https://comfy.org/download" },
    steps: [
      "先拍菜，背景盡量乾淨。",
      "到 comfy.org/download 裝桌面版。倉庫根目錄沒有 Dockerfile，不要期待 Cloud Run 一鍵。",
      "依畫面載入一個圖像模型。模型很大，預留磁碟。",
      "把下面的提示詞貼進文字框，再把你的照片當參考圖。",
      "出圖後看筷子、碗、文字有沒有歪。菜單上的字請用排版軟體另外打，不要讓繪圖模型寫價錢。",
    ],
    sample: {
      filename: "菜單圖提示詞.txt",
      note: "貼進 ComfyUI 的提示詞。不會自動出圖。",
      text: "一碗紅燒牛肉麵，白色瓷碗，桌面乾淨，自然光，菜單攝影，不要文字，不要浮水印",
    },
    preview: null,
  },
  {
    slug: "paperless",
    name: "發票檔案櫃",
    category: "發票／收據 OCR／記帳",
    pain: "進貨單拍了就沉在相簿，報稅才翻不到那一張。",
    example: "鮮達 11/3 的進貨單拍成照片，丟進檔案櫃。之後搜尋「鮮達」或日期找得到。它是檔案櫃，不是台灣電子發票加值中心。",
    dataIn: "照片或 PDF。檔名建議「廠商_日期_金額」。系統吃的是檔案，不是 CSV。",
    setupTime: "半天",
    cost: "GPL-3.0，自架。要一台放得下檔案的磁碟。Cloud Run 的暫時硬碟放不了進貨單。",
    difficulty: 2,
    chinese: "這輪沒有核對到繁中語系檔。",
    license: "GPL-3.0。改了又提供成網路服務，要公開改動。",
    repoUrl: "https://github.com/paperless-ngx/paperless-ngx",
    cloudRunUrl: "https://deploy.cloud.run/?git_repo=https://github.com/paperless-ngx/paperless-ngx",
    cloudRunNote: "根目錄有 Dockerfile，按鈕可以試著建一個服務。這套還要資料庫和一個放檔案的硬碟，只按一鍵，照片不會留下。店裡要用，請用官方 docker/compose，放在有磁碟的機器上。",
    docsUrl: { label: "官方 Compose 目錄", url: "https://github.com/paperless-ngx/paperless-ngx/tree/main/docker/compose" },
    steps: [
      "進貨單用手機拍正，一張單一個檔。",
      "檔名寫成 鮮達_2026-11-03_860.jpg 這種，之後才找得到。",
      "在有磁碟的電腦上，用倉庫 docker/compose 的設定啟動。不要把唯一的檔案放在 Cloud Run。",
      "把照片放進它指定的消耗資料夾，等它跑完文字辨識。",
      "搜尋廠商名稱。認錯字就改那一筆的標題，不要假裝它懂統一發票格式。",
    ],
    sample: {
      filename: "檔名怎麼取.txt",
      note: "系統吃的是照片和 PDF，不是這份文字。這只是檔名規則。",
      text: "廠商_日期_金額.jpg\n例：鮮達_2026-11-03_860.jpg\n一張單一個檔，拍正、有光。",
    },
    preview: null,
  },
  {
    slug: "metabase",
    name: "營業儀表板",
    category: "財報／BI 儀表板",
    pain: "每天的營業在試算表裡，看不出哪天、哪一道在賺錢。",
    example: "日期、品項、數量、金額。十月牛肉麵賣了多少、週末和平日差多少，用點的方式做一張圖。",
    dataIn: "CSV：日期、品項、數量、金額。或直接連 POS 資料庫。",
    setupTime: "半天",
    cost: "開源版自架。AGPL，部分目錄是商業授權。應用資料庫若用內建檔案，Cloud Run 重啟會丟圖表設定。",
    difficulty: 2,
    chinese: "這輪沒有核對到繁中語系檔。",
    license: "AGPL-3.0，部分目錄另有 Metabase 商業授權。自己店裡架來用通常可以，拿去開代管服務要再看授權。",
    repoUrl: "https://github.com/metabase/metabase",
    cloudRunUrl: "https://deploy.cloud.run/?git_repo=https://github.com/metabase/metabase",
    cloudRunNote: "倉庫根目錄有 Dockerfile。一鍵可以開服務。請把應用資料庫指到 Cloud SQL 或 Neon，否則你做的圖表在重新部署後會不見。",
    docsUrl: { label: "Docker 映像說明", url: "https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker" },
    steps: [
      "從收銀把每天的銷售存成 CSV，四欄：日期、品項、數量、金額。",
      "按「放到 Google Cloud」。",
      "環境變數把資料庫指到 Cloud SQL 或 Neon 的 PostgreSQL，不要用容器裡的暫存檔。",
      "登入後上傳 CSV，或連你已經在用的資料庫。",
      "做一張「每月金額」和一張「品項數量」。跟手邊的月結對一次總額。",
    ],
    sample: {
      filename: "每日營業.csv",
      note: "Metabase 可以上傳 CSV 或連資料庫。這四欄夠做第一張圖。",
      rows: [
        ["日期", "品項", "數量", "金額"],
        ["2026-10-01", "紅燒牛肉麵", 42, 7560],
        ["2026-10-01", "滷蛋", 15, 300],
        ["2026-10-08", "紅燒牛肉麵", 55, 9900],
      ],
    },
    preview: "sales",
  },
  {
    slug: "woocommerce",
    name: "團購商店",
    category: "電商／團購店面",
    pain: "冷凍水餃、伴手禮想在自己的網站賣，不想只靠社團留言加一。",
    example: "冷凍牛肉水餃 20 顆 360 元、滿 1,200 才出貨。商品、價錢、分類放進商店，購物車才不會靠私訊對帳。",
    dataIn: "商品 CSV，欄位名稱用 WooCommerce 官方匯入的英文表頭：Type、SKU、Name、Regular price、Categories。",
    setupTime: "一天，還要網域",
    cost: "外掛本身 GPL，不收授權費。主機、網域、金流手續費另計。金流這頁不代接。",
    difficulty: 2,
    chinese: "WordPress 有繁中。此外掛的每一個畫面這輪沒有逐頁核對。",
    license: "GPL-2.0。",
    repoUrl: "https://github.com/woocommerce/woocommerce",
    docsUrl: { label: "商品 CSV 匯入說明", url: "https://woocommerce.com/document/product-csv-importer-exporter/" },
    steps: [
      "先有一個 WordPress。沒有 Dockerfile 可以把這套單獨按上 Cloud Run。",
      "在 WordPress 安裝 WooCommerce。官方外掛頁：https://wordpress.org/plugins/woocommerce/",
      "商店設定選新台幣、時區台北。",
      "商品 → 匯入，上傳 CSV。表頭要和官方範例一樣，至少要有 Type、SKU、Name、Regular price。",
      "金流（綠界等）和運費另外裝。沒接之前不要把網址公開給客人結帳。",
    ],
    sample: {
      filename: "團購商品.csv",
      note: "表頭用 WooCommerce 官方 CSV 的欄名，匯入時才對得上。",
      rows: [
        ["Type", "SKU", "Name", "Published", "Regular price", "Categories", "Short description"],
        ["simple", "DUMP-20", "冷凍牛肉水餃 20 顆", 1, 360, "冷凍", "滿 1200 才出貨"],
        ["simple", "NOODLE-2", "拌麵醬 2 包", 1, 220, "常溫", "可常溫配送"],
      ],
    },
    preview: "products",
  },
  {
    slug: "n8n",
    name: "店務自動化",
    category: "自動化流程",
    pain: "新訂單、打烊提醒、把評論存下來，每次都要人手動做。",
    example: "網站收到一筆團購訂單，就寄一封信給店長。流程是你拉的，不是魔法。",
    dataIn: "要接的帳號：信箱、表單、或各系統的 API 金鑰。可以匯入流程 JSON 當起點。",
    setupTime: "半天",
    cost: "自己的店可以自架。授權不是一般開源，不能拿去幫別的店代管收費，除非另外取得授權。模型或簡訊若有接，另計。",
    difficulty: 3,
    chinese: "這輪沒有核對到繁中語系檔。",
    license: "Sustainable Use License。自己店裡自動化可以。拿去當付費代管賣給其他店，要先看授權。",
    repoUrl: "https://github.com/n8n-io/n8n",
    cloudRunUrl: "https://deploy.cloud.run/?git_repo=https://github.com/n8n-io/n8n&dir=docker/images/n8n",
    cloudRunNote: "正式映像的 Dockerfile 在 docker/images/n8n。一鍵會用那個目錄建置。流程資料預設寫在容器裡，Cloud Run 重啟會不見，請改接 PostgreSQL，或接受只是試用。",
    docsUrl: { label: "Docker 安裝說明", url: "https://docs.n8n.io/deploy/host-n8n/install-options/install-with-docker" },
    steps: [
      "先寫下要自動的一件事，例如「有新訂單就寄信給店長」。",
      "按「放到 Google Cloud」，或照官方說明用 docker 映像自己開。",
      "設定加密金鑰環境變數，並把資料庫指到 Cloud SQL 或 Neon。沒有的話，重啟後流程會沒有。",
      "登入後可以匯入下面的 JSON 看結構。匯入失敗就自己拉兩個節點：一個接收、一個寄信。",
      "用一筆假訂單試。成功再接到真的結帳。",
    ],
    sample: {
      filename: "新訂單通知.json",
      note: "給 n8n「從檔案匯入」看結構。節點還沒有填你的信箱，匯入後要自己補。",
      text: JSON.stringify(
        {
          name: "新訂單通知店長",
          nodes: [
            { name: "有新訂單", type: "n8n-nodes-base.webhook" },
            { name: "寄信給店長", type: "n8n-nodes-base.emailSend" },
          ],
          connections: {},
        },
        null,
        2,
      ),
    },
    preview: "workflow",
  },
  {
    slug: "ghost",
    name: "品牌故事站",
    category: "網站／Landing",
    pain: "菜單和店的故事沒有一個自己的網站，只有社群貼文。",
    example: "一篇「我們為什麼每天熬湯」，一篇「十一月菜單」。客人看得到，你也可以收電子報。",
    dataIn: "文章標題和正文。貼進編輯器。這不是一鍵匯入整站。",
    setupTime: "半天",
    cost: "MIT。官方 Docker 要一個 MySQL。資料庫另計。",
    difficulty: 2,
    chinese: "這輪沒有核對到繁中語系檔。",
    license: "MIT。",
    repoUrl: "https://github.com/TryGhost/Ghost",
    docsUrl: { label: "Docker 安裝", url: "https://docs.ghost.org/install/docker" },
    steps: [
      "先寫一篇短文：店在哪、營業時間、一道代表菜。",
      "倉庫裡沒有給一鍵 Cloud Run 用的正式 Dockerfile。照官方 Docker 文件，用 Ghost 映像加一個 MySQL。MySQL 用 Cloud SQL 或同一台機器上的資料庫，不要放在會被清掉的容器硬碟。",
      "設好網址和管理員信箱。",
      "把文章貼進編輯器，時區選台北。",
      "手機打開看標題會不會被切掉。網域之後再指過來。",
    ],
    sample: {
      filename: "第一篇文章.md",
      note: "貼進 Ghost 編輯器。不是整站匯入檔。",
      text: "# 我們為什麼每天熬湯\n\n左營這間店，湯從早上六點開始。營業時間 11:30 到 21:00。代表菜是紅燒牛肉麵。",
    },
    preview: "markdown",
  },
  {
    slug: "limesurvey",
    name: "顧客問卷",
    category: "問卷／表單",
    pain: "想知道客人滿不滿意，又不要只看群組裡的一句話。",
    example: "吃完三題：湯好不好、會不會再來、有沒有想說的。一週後看哪一題分數低。",
    dataIn: "題號、題目、題型。後台是一題題建立。完整的問卷結構檔欄位很多，這裡不假裝一份 CSV 就能匯入。",
    setupTime: "半天",
    cost: "自架。GPL 風格授權。沒有 Dockerfile，沒有 Cloud Run 一鍵。",
    difficulty: 2,
    chinese: "社群有翻譯，這輪沒有逐檔核對繁中。",
    license: "GPL。改了又散出去，要附上授權。",
    repoUrl: "https://github.com/LimeSurvey/LimeSurvey",
    docsUrl: { label: "安裝說明", url: "https://www.limesurvey.org/manual/Installation" },
    steps: [
      "先寫不超過五題。太長沒人寫。",
      "照官方說明用 PHP 裝在主機上。不要找 Cloud Run 一鍵，倉庫裡沒有。",
      "新增一份問卷，語言選繁體中文（若列表裡有）。",
      "照表格把題目打進去。是非題和五分題分開。",
      "自己填一次，看結果會不會進統計。再把連結印在收據背面。",
    ],
    sample: {
      filename: "問卷題目.csv",
      note: "照這張表在後台建題。不是 LimeSurvey 的結構匯入檔。",
      rows: [
        ["題號", "題目", "題型"],
        ["Q1", "今天的湯，你覺得如何？", "五分"],
        ["Q2", "下次還會來嗎？", "是非"],
        ["Q3", "有什麼想跟店長說的？", "文字"],
      ],
    },
    preview: "table",
  },
  {
    slug: "bookstack",
    name: "店規與 SOP",
    category: "文件／知識庫",
    pain: "開早班的步驟在某個人的記事本，新人來了要再講一次。",
    example: "一本書叫「早班」。第一章開門，第二章熬湯，第三章開店前檢查。員工用手機查。",
    dataIn: "一篇 Markdown：標題就是章名。在頁面裡貼上。倉庫的做法是在網頁裡寫，不是吃一整個資料夾。",
    setupTime: "半天",
    cost: "MIT。Docker Compose 自架，主機另計。",
    difficulty: 2,
    chinese: "這輪沒有核對到繁中語系檔。",
    license: "MIT。對自己的店最單純。",
    repoUrl: "https://github.com/BookStackApp/BookStack",
    docsUrl: { label: "安裝說明", url: "https://www.bookstackapp.com/docs/admin/installation/" },
    steps: [
      "把早班步驟寫成一篇，用 # 當章節。",
      "倉庫沒有給 Cloud Run 一鍵的 Dockerfile。照官方文件用 Docker Compose，資料放在那台機器的磁碟。",
      "建立一本書「早班」，把文章貼進一頁。",
      "設兩個權限：店長可以改，員工只能看。",
      "請一個新人只看手機，走完開門到開店。走不完的步驟就改那一頁。",
    ],
    sample: {
      filename: "早班SOP.md",
      note: "貼進 BookStack 的頁面。Markdown 標題會變成小節。",
      text: "# 早班\n\n## 開門\n\n6:00 開門，開燈，檢查瓦斯。\n\n## 熬湯\n\n牛骨先汆燙，再熬四小時。\n\n## 開店前\n\n11:00 對今日特餐價錢，擦桌，開門營業。",
    },
    preview: "markdown",
  },
  {
    slug: "phone-ai",
    name: "電話訂位",
    category: "AI 接電話",
    pain: "尖峰電話接不完，客人問營業時間也要佔線。",
    example: "客人打來，電話用台灣華語問幾位、幾點、姓名。店名、地址、有沒有包廂，以你寫的為準。它現在不會把訂位寫進訂位系統。",
    dataIn: "店名、地址、營業時間、有沒有包廂、停車、素食。這些還寫在程式的示範資料裡，不是一支匯入按鈕。",
    setupTime: "一個下午，還要申請電話號碼",
    cost: "Twilio 依通話計費，金額以 Twilio 帳單為準。主機另計。這版不呼叫外面的聊天模型。",
    difficulty: 3,
    chinese: "語音是 zh-TW。沒有一般的網頁後台。",
    license: "店東自己的系統，倉庫還沒有公開授權條款。",
    repoUrl: "https://github.com/bosswilly1013-hub/jiuwo-phone-ai",
    repoPrivate: true,
    secondary: [
      {
        label: "用 Render 開（目前對得上的做法）",
        url: "https://render.com/deploy?repo=https://github.com/bosswilly1013-hub/jiuwo-phone-ai",
        note: "倉庫是 Procfile，不是 Dockerfile。Render 對得上。免費方案會睡著，Twilio 打進來可能逾時。",
      },
    ],
    steps: [
      "寫下店名、地址、營業時間、包廂、停車、素食。下面的文字就是你要改進設定的內容。",
      "倉庫沒有 Dockerfile，不能按 Cloud Run 一鍵。若要上 Cloud Run，得先有 Dockerfile，而且電話進來時服務不能還在從 0 醒來。",
      "現在對得上的是 Render：按備援按鈕。環境變數填 Twilio 的帳號 SID、驗證權杖，和 webhook 網址。",
      "在 Twilio 把來電網址指到你的 /webhook。先用自己的手機打一通。",
      "問營業時間、訂兩位晚上六點。確認它沒有亂編地址。訂位結果目前不會進 OpenResto 或別的訂位本。",
    ],
    sample: {
      filename: "店家資料.txt",
      note: "改進程式的示範設定。系統還沒有匯入這份檔的按鈕。",
      text: "店名：左營牛肉麵\n地址：高雄市左營區\n營業：11:30–21:00\n包廂：沒有\n停車：店前機車格\n素食：有炒青菜",
    },
    preview: "table",
  },
];

export const gaps: GapCard[] = [
  {
    slug: "reviews",
    name: "評論自動回覆",
    pain: "Google 評論一差，沒有人穩定回。",
    why: "沒有找到還在維護、授權清楚、又能安全自動回評論的現成系統。先用 Google 商家檔案手動回。這塊我們自己在做，這裡不放一個不存在的倉庫。",
  },
  {
    slug: "loyalty",
    name: "集點卡",
    pain: "想做集滿十杯送一杯，又不想再買一套會員機。",
    why: "顧客資料可以先用上面的 Twenty。集點、印花沒有夠好的現成開源系統。這塊自製中，不編一個倉庫連結。",
  },
  {
    slug: "line-crm",
    name: "LINE 會員經營",
    pain: "好友在 LINE 裡，分不出誰是常客、誰只加過一次。",
    why: "沒有找到可以單獨當成 LINE CRM 的成熟開源系統。官方帳號後台可以發文，但不是這頁要的「丟名單就變成會員系統」。這塊自製中。",
  },
];

export function getSystem(slug: string) {
  return systems.find((item) => item.slug === slug);
}

export function getGap(slug: string) {
  return gaps.find((item) => item.slug === slug);
}
