import { gaps, systems } from "@/lib/systems";

export type CategoryId = "startup" | "cost" | "ops" | "brand" | "ai" | "external";

export type Category = {
  id: CategoryId;
  name: string;
  blurb: string;
};

export const categories: Category[] = [
  {
    id: "startup",
    name: "開店創業",
    blurb: "先知道一個月要做多少才不虧，店要怎麼坐人，目標怎麼拆到每一天。",
  },
  {
    id: "cost",
    name: "成本定價",
    blurb: "一道菜賺多少、外送價要賣多少，用同一套數字看，不要憑感覺。",
  },
  {
    id: "ops",
    name: "營運報表",
    blurb: "把每天的營業額放進來，看趨勢、跟上個月比、成本長什麼樣子。",
  },
  {
    id: "brand",
    name: "行銷品牌",
    blurb: "先講清楚你跟隔壁差在哪，再去花錢做圖、投廣告。",
  },
  {
    id: "ai",
    name: "AI 系統",
    blurb: "問答可以幫忙整理問題。損益、定價、毛利一律用工具算，不交給 AI 猜。",
  },
  {
    id: "external",
    name: "外部好用工具",
    blurb: "別人已經做好的免費工具，這裡只說明什麼時候該用，不重做一次。",
  },
];

export type ToolInfo = {
  slug: string;
  href: string;
  name: string;
  problem: string;
  answers: string;
  category: CategoryId;
  alsoIn?: CategoryId[];
  keywords: string[];
};

export const tools: ToolInfo[] = [
  {
    slug: "break-even",
    href: "/tools/break-even",
    name: "損益兩平計算器",
    problem: "一個月要做到多少營業額、每天幾位客人，才把房租和人事打平。",
    answers:
      "固定成本（房租、人事、水電、其他）一個月要付多少，才知道營業額做到哪裡不虧。它也告訴你：打折之後，每天要多幾位客人才回到同一個兩平點。",
    category: "startup",
    alsoIn: ["cost"],
    keywords: ["損益兩平", "打平", "保本", "客單價", "折扣", "房租", "人事"],
  },
  {
    slug: "delivery",
    href: "/tools/delivery",
    name: "外送定價反推",
    problem: "外送價要賣多少，平台抽成之後還留得住你要的毛利。",
    answers:
      "Uber Eats、foodpanda 的抽成是從售價裡扣。你輸入店內價、食材、包材、抽成和想留下的毛利，它反推建議外送價，也可以整份菜單一次算。",
    category: "cost",
    keywords: ["外送", "ubereats", "foodpanda", "抽成", "定價", "菜單"],
  },
  {
    slug: "menu",
    href: "/tools/menu",
    name: "菜單成本與毛利",
    problem: "每一道菜的食材要多少錢、毛利多少，哪些該留、哪些該調。",
    answers:
      "把食譜的用量和單價乘開，得到食材成本、毛利和食材比。有填月銷量時，再分成明星、耕馬、問號、退場候選。",
    category: "cost",
    keywords: ["菜單", "食材成本", "毛利", "菜單工程", "明星", "耕馬"],
  },
  {
    slug: "targets",
    href: "/tools/targets",
    name: "營業目標拆解",
    problem: "月目標拆成平日、週末、午餐、晚餐，以及回購、介紹、新客各要幾位。",
    answers:
      "你給一個月的營業額目標，它依照平日和週末的差距、時段占比、客單價，拆成每天要做的營業額和來客數，再分成回購、客人介紹、新客。",
    category: "startup",
    alsoIn: ["ops"],
    keywords: ["目標", "來客數", "午餐", "晚餐", "回購", "新客"],
  },
  {
    slug: "reports",
    href: "/tools/reports",
    name: "報表分析",
    problem: "把每日營業或損益表丟進來，看趨勢、月增減和成本結構。",
    answers:
      "上傳 Excel 或 CSV，或先看範例店的兩個月日報。圖在你的瀏覽器裡畫，檔案不會上傳。",
    category: "ops",
    keywords: ["報表", "excel", "csv", "月增", "成本", "營業額"],
  },
  {
    slug: "positioning",
    href: "/tools/positioning",
    name: "品牌定位圖",
    problem: "用兩個你在乎的軸，把你的店和競爭者擺在同一張圖上。",
    answers:
      "橫軸和縱軸的名字你自己定。把店拖到你覺得對的位置，存成 PNG，拿去跟夥伴討論。這張圖是判斷，不是公式。",
    category: "brand",
    keywords: ["定位", "競爭", "知覺圖", "品牌"],
  },
  {
    slug: "floor-plan",
    href: "/tools/floor-plan",
    name: "店面平面圖",
    problem: "幾坪的店，桌子和走道夠不夠走。",
    answers:
      "用公尺畫出店的面寬和深度，把桌子、櫃檯、廚房拖進去，檢查物件之間有沒有窄於 75 公分。要畫牆和水電，請改用導覽裡的 Sweet Home 3D。",
    category: "startup",
    keywords: ["平面圖", "走道", "坪", "座位", "動線"],
  },
  {
    slug: "ask",
    href: "/ask",
    name: "AI 問答",
    problem: "用語句問開店的問題；算數字請回上面的工具。",
    answers:
      "有設定 API 金鑰時，這裡會出現對話框。沒有金鑰就只保留說明。它不負責計算。",
    category: "ai",
    keywords: ["ai", "問答", "助理"],
  },
];

export function categoryName(id: CategoryId): string {
  return categories.find((category) => category.id === id)?.name ?? id;
}

export function toolsIn(id: CategoryId): ToolInfo[] {
  return tools.filter((tool) => tool.category === id || tool.alsoIn?.includes(id));
}

export function getTool(slug: string): ToolInfo {
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) throw new Error(`找不到工具 ${slug}`);
  return tool;
}

export type StartStep = {
  href: string;
  title: string;
  detail: string;
};

export const startSteps: StartStep[] = [
  {
    href: "/tools/break-even",
    title: "先算一個月要做多少才不虧",
    detail: "房租、人事、水電填進去。人事請把你自己的薪水也算上，不然會以為賺到，其實是在付自己的生活費。",
  },
  {
    href: "/tools/menu",
    title: "把每道菜的食材成本攤開",
    detail: "用量和單價的單位要對齊，例如 0.12 公斤配「每公斤多少錢」。有月銷量，才看得懂哪些菜在養店、哪些在佔位子。",
  },
  {
    href: "/tools/delivery",
    title: "外送不要直接用店內價上架",
    detail: "抽成從售價扣，食材卻不會變便宜。先反推售價，再去平台後台改。整份菜單可以貼 CSV。",
  },
  {
    href: "/tools/targets",
    title: "月目標拆成每天、每個時段",
    detail: "兩平是下限。你想賺的那個營業額，要變成平日幾位、週末幾位、其中幾位是新客。",
  },
  {
    href: "/tools/reports",
    title: "有日報之後，看趨勢而不是感覺",
    detail: "每天記營業額和來客數就夠開始。檔案留在這台電腦，本站沒有後端可以收走它。",
  },
  {
    href: "/tools/positioning",
    title: "先講清楚你跟隔壁差在哪",
    detail: "軸的名字用客人聽得懂的話，例如價格、速度、好不好拍照。圖是拿來吵架用的，不是拿來裝準。",
  },
  {
    href: "/tools/floor-plan",
    title: "位子和走道，畫一張草圖就好",
    detail: "這版只看走不走得過。要給設計師或房東的正式圖，用導覽裡的 Sweet Home 3D。",
  },
];

export type GuideArticle = {
  slug: string;
  title: string;
  summary: string;
  category: CategoryId;
  keywords: string[];
  paragraphs: string[];
};

export const guides: GuideArticle[] = [
  {
    slug: "three-numbers",
    title: "開店第一週先算這三個數字",
    summary: "兩平營業額、食材比、客單價。其他報表可以等有客人再補。",
    category: "startup",
    keywords: ["入門", "兩平", "食材比", "客單價"],
    paragraphs: [
      "第一個是損益兩平：房租、人事、水電、垃圾清運、網路、保險，一個月固定要付的加總。再除以「1 減食材比」。這是你不虧的月營業額。",
      "第二個是食材比。把賣得最好的五道菜，用實際進貨價乘用量。不要用「感覺大概三成」。飲料常常百分比很好看，但一杯只賺二十元，補不起房租。",
      "第三個是客單價。用營業額除以來客數，不要用菜單上最貴的那碗。有了客單價，兩平營業額才變得成「每天要幾位客人」。",
      "這三個都在本站的損益兩平和菜單工具裡。稅和勞保不要自己編，去導覽裡的政府網站查。",
    ],
  },
  {
    slug: "delivery-margin",
    title: "外送抽成為什麼會把毛利吃掉",
    summary: "平台從售價抽成，食材成本卻是固定的金額。用店內價上架，實收毛利通常會掉一截。",
    category: "cost",
    keywords: ["外送", "抽成", "毛利"],
    paragraphs: [
      "假設一碗麵店內賣 180，食材 58。店內毛利大約是 122。外送若抽 35%，180 元你只實收 117，扣掉食材和包材之後剩下的比你想像少。",
      "折扣和抽成一樣，都不會讓牛肉變便宜。所以定價要從「我想留下的毛利」往回推，而不是在店內價上隨便加 20 元。",
      "本站預設抽成 35% 只是起算。請改成你合約上的數字，各家、各方案不一樣，也會改。",
      "算出的毛利還沒有付房租和人事。外送做得再漂亮，店的固定成本仍要靠損益兩平那一頁看。",
    ],
  },
  {
    slug: "menu-matrix",
    title: "菜單四象限怎麼讀",
    summary: "跟平均比：又好賣又賺的留下，好賣不賺的調，賺不好賣的讓人看得到，兩個都差的考慮拿掉。",
    category: "cost",
    keywords: ["菜單工程", "明星", "耕馬", "四象限"],
    paragraphs: [
      "本站用「一道菜賺幾塊錢」和「一個月賣幾份」跟全菜單的平均比。高於或等於平均算高。教科書有時用「平均份額的七成」當人氣線，這裡用平均，比較好解釋。",
      "明星：守住。耕馬：很多人點但賺得少，優先看調價或減成本。問號：毛利好、點的人少，先改菜單呈現。退場候選：兩個都差，除非它有別的任務（帶小孩、帶客），不然佔位子。",
      "沒有填銷量就不要談象限。成本仍然算得出來，象限會等你補上月銷量。",
    ],
  },
  {
    slug: "split-target",
    title: "月目標怎麼拆到午餐和晚餐",
    summary: "先決定週末比平日忙多少，再把一天切成時段，最後才談新客要幾位。",
    category: "ops",
    keywords: ["目標", "午餐", "新客"],
    paragraphs: [
      "一個月 50 萬，若直接除以 30，會低估週末、高估星期一。先估平日幾天、週末幾天，以及週末一天大約是平日的幾倍。",
      "時段占比用你自己的經驗。社區麵店常常午餐和晚餐都重；咖啡店可能幾乎沒有晚餐。三個時段要加總 100%，工具會擋住沒加滿的拆法。",
      "新客數是行銷預算的起點。若一個月要 600 位新客，你才知道廣告或傳單貴不貴。沒有這個數就先不要開廣告。",
    ],
  },
  {
    slug: "when-to-borrow",
    title: "什麼時候不要自己做工具",
    summary: "試算、走道、定位，本站直接做。美編、地圖商家、發票、庫存系統，用現成的。",
    category: "external",
    keywords: ["懶人包", "開源", "canva", "發票"],
    paragraphs: [
      "本站是懶人包：一件事如果已經有好用、免費、講得清楚的工具，就連過去並說明什麼時候用，不重做一個比較差的。",
      "菜單圖用 Canva，商家資料用 Google 商家檔案，發票用財政部的電子發票平台，庫存真的管不住再用 Grocy 或 ERP。這些連結都在懶人包導覽，每一則寫了適用時機。",
      "自己做的是餐廳每天會問、而現成工具不是為台灣小店這句話設計的計算：兩平、外送反推、菜單象限、目標拆解、走道夠不夠。",
    ],
  },
];

export function getGuide(slug: string): GuideArticle | undefined {
  return guides.find((guide) => guide.slug === slug);
}

export type ExternalLink = { label: string; url: string };

export type ExternalResource = {
  id: string;
  name: string;
  group: string;
  when: string;
  links: ExternalLink[];
  keywords: string[];
};

export const resourceGroups = ["選址與商圈", "合規、稅務與人力", "外送平台", "行銷與設計", "庫存、POS 與試算表", "平面圖進階"];

export const resources: ExternalResource[] = [
  {
    id: "biz-district",
    name: "全國商圈盤點清冊",
    group: "選址與商圈",
    when: "還在看區域、想知道某個縣市有哪些政府認列的商圈時用。這是經濟部商業發展署彙整、放在政府資料開放平臺的 CSV，有商圈名稱和範圍。它沒有人潮，也沒有租金。",
    links: [{ label: "開啟資料集", url: "https://data.gov.tw/dataset/103804" }],
    keywords: ["商圈", "開放資料", "選址"],
  },
  {
    id: "data-gov",
    name: "政府資料開放平臺",
    group: "選址與商圈",
    when: "你想自己搜開放資料（商圈、觀光、人口）時從這裡進。下載前先看欄位說明和更新日期，各機關的品質差很多。",
    links: [{ label: "開啟平臺", url: "https://data.gov.tw/" }],
    keywords: ["開放資料", "data.gov"],
  },
  {
    id: "gcis-data",
    name: "商工行政資料開放平臺",
    group: "選址與商圈",
    when: "要的是公司、商業登記這類商工開放檔，而不是某一家店的財報。找資料集、看授權，再下載。",
    links: [{ label: "開啟平臺", url: "https://data.gcis.nat.gov.tw/main/index" }],
    keywords: ["商工", "登記", "開放資料"],
  },
  {
    id: "land",
    name: "內政部實價登錄",
    group: "選址與商圈",
    when: "看店面附近的買賣行情，幫你感覺租金貴不貴。實價登錄不是租金本身，不能直接當成你的房租。",
    links: [{ label: "開啟實價登錄", url: "https://lvr.land.moi.gov.tw/" }],
    keywords: ["租金", "實價", "店面"],
  },
  {
    id: "etax",
    name: "財政部稅務入口網",
    group: "合規、稅務與人力",
    when: "查營業稅、所得稅的申報期和表格。本站的試算不算稅，稅務以國稅局公告為準。",
    links: [{ label: "開啟稅務入口網", url: "https://www.etax.nat.gov.tw/" }],
    keywords: ["稅", "營業稅", "國稅"],
  },
  {
    id: "einvoice",
    name: "電子發票整合服務平台",
    group: "合規、稅務與人力",
    when: "要開電子發票、配號、兌獎或把存證傳到財政部時用。餐廳的發票不在本站處理。",
    links: [{ label: "開啟電子發票平台", url: "https://www.einvoice.nat.gov.tw/" }],
    keywords: ["發票", "電子發票"],
  },
  {
    id: "fda",
    name: "衛生福利部食品藥物管理署",
    group: "合規、稅務與人力",
    when: "查食安法規、回收訊息，以及食品業者登錄。餐飲業多數要完成登錄才算合法營業。登錄系統（常被叫做非登不可）請從食藥署網站進入，實際表單以官網為準。",
    links: [{ label: "開啟食藥署", url: "https://www.fda.gov.tw/" }],
    keywords: ["食安", "登錄", "非登不可", "fda"],
  },
  {
    id: "mol",
    name: "勞動部最低工資專區",
    group: "合規、稅務與人力",
    when: "排班、算時薪、確認目前最低工資時用。本站範例裡的薪水是假設的一家店，不是法規數字，每年以這頁公告為準。",
    links: [{ label: "開啟最低工資專區", url: "https://www.mol.gov.tw/1607/28162/28166/28180/99861/nodelist" }],
    keywords: ["最低工資", "時薪", "勞基", "排班"],
  },
  {
    id: "sme",
    name: "經濟部中小及新創企業署",
    group: "合規、稅務與人力",
    when: "想找中小企業補助或諮詢窗口時先看官網最新公告。補助每年改，不要只聽群組轉傳。",
    links: [{ label: "開啟官網", url: "https://www.sme.gov.tw/" }],
    keywords: ["補助", "中小企業"],
  },
  {
    id: "gbp",
    name: "Google 商家檔案",
    group: "行銷與設計",
    when: "客人用 Google 地圖找你的時候。先把營業時間、電話、菜單照片填對，這件事通常比再拍一支廣告優先。",
    links: [{ label: "開啟商家檔案", url: "https://business.google.com/tw/business-profile/" }],
    keywords: ["google", "地圖", "商家"],
  },
  {
    id: "gads",
    name: "Google 廣告",
    group: "行銷與設計",
    when: "你已經用營業目標拆解算過一個月要多幾位新客，也知道付得起多少測試預算時，再考慮關鍵字廣告。還沒算兩平就先不要開。",
    links: [{ label: "看 Google 廣告介紹", url: "https://business.google.com/tw/google-ads/" }],
    keywords: ["google ads", "關鍵字", "廣告"],
  },
  {
    id: "trends",
    name: "Google 趨勢",
    group: "行銷與設計",
    when: "看某個吃食關鍵字在台灣最近熱不熱。它是相對熱度，不是你的來客數，不能拿來當營業預測。",
    links: [{ label: "開啟趨勢", url: "https://trends.google.com.tw/trends/" }],
    keywords: ["趨勢", "關鍵字"],
  },
  {
    id: "canva",
    name: "Canva",
    group: "行銷與設計",
    when: "做菜單圖、限時動態、店門口海報時用。本站不做美編。定位圖存成 PNG 之後，視覺排版去這裡。",
    links: [{ label: "開啟 Canva", url: "https://www.canva.com/zh_tw/" }],
    keywords: ["canva", "菜單設計", "海報"],
  },
  {
    id: "photopea",
    name: "Photopea",
    group: "行銷與設計",
    when: "要改菜單照片、去背或調亮度，但不想安裝 Photoshop。在瀏覽器裡開就好。",
    links: [{ label: "開啟 Photopea", url: "https://www.photopea.com/" }],
    keywords: ["修圖", "去背"],
  },
  {
    id: "squoosh",
    name: "Squoosh",
    group: "行銷與設計",
    when: "菜單照片太大、傳 LINE 或上傳外送平台很慢時，用它把圖壓小。處理在瀏覽器裡，圖不會被上傳。",
    links: [{ label: "開啟 Squoosh", url: "https://squoosh.app/" }],
    keywords: ["壓縮", "照片"],
  },
  {
    id: "line-manager",
    name: "LINE 官方帳號管理後台",
    group: "行銷與設計",
    when: "客人已經在 LINE 上，你要發訊息、回覆或看好友數時登入這裡。",
    links: [{ label: "開啟管理後台", url: "https://manager.line.biz/" }],
    keywords: ["line", "官方帳號"],
  },
  {
    id: "line-manual",
    name: "LINE 官方帳號教學",
    group: "行銷與設計",
    when: "第一次申請官方帳號、搞不懂後台名詞時，先看 LINE 自己的步驟，不必先買一堂課。",
    links: [{ label: "開啟教學", url: "https://tw.linebiz.com/manual/" }],
    keywords: ["line", "教學"],
  },
  {
    id: "meta-ads",
    name: "Meta 廣告管理員",
    group: "行銷與設計",
    when: "要在 Facebook 或 Instagram 投廣告時用。投之前先把新客目標和你付得起的獲客成本算出來，否則只會看到花費、看不懂貴不貴。",
    links: [{ label: "開啟廣告管理員", url: "https://www.facebook.com/business/tools/ads-manager" }],
    keywords: ["facebook", "instagram", "meta", "廣告"],
  },
  {
    id: "meta-business",
    name: "Meta 商業管理平台",
    group: "行銷與設計",
    when: "管理粉專、權限和廣告帳戶的入口。請人代操之前，先搞清楚誰有管理員權限。",
    links: [{ label: "開啟商業管理平台", url: "https://business.facebook.com/" }],
    keywords: ["粉專", "meta", "權限"],
  },
  {
    id: "uber",
    name: "Uber Eats 商家",
    group: "外送平台",
    when: "改 Uber Eats 的菜單、營業時間、看訂單時用。售價先在本站反推，再鍵進後台。抽成以你的合約為準。",
    links: [{ label: "開啟商家入口", url: "https://merchants.ubereats.com/tw/zh-tw/" }],
    keywords: ["uber", "外送"],
  },
  {
    id: "foodpanda",
    name: "foodpanda 商家",
    group: "外送平台",
    when: "看 foodpanda 的上線說明和商家訊息。定價同樣先在本站算，平台後台負責上架，不負責幫你守毛利。",
    links: [{ label: "開啟商家網站", url: "https://vendor.foodpanda.com.tw/" }],
    keywords: ["foodpanda", "外送"],
  },
  {
    id: "sheets",
    name: "Google 試算表",
    group: "庫存、POS 與試算表",
    when: "要跟會計或夥伴一起改同一份表時用。本站適合先把圖看懂；要長期協作，再把下載的檔案放到試算表。",
    links: [{ label: "看 Google 試算表", url: "https://workspace.google.com/intl/zh-TW/products/sheets/" }],
    keywords: ["試算表", "excel", "協作"],
  },
  {
    id: "libreoffice",
    name: "LibreOffice Calc",
    group: "庫存、POS 與試算表",
    when: "不想付 Excel 授權，又要在電腦上打開本站下載的 xlsx 範本。這是免費的試算表軟體。",
    links: [{ label: "開啟繁體中文官網", url: "https://zh-tw.libreoffice.org/" }],
    keywords: ["excel", "試算表", "免費"],
  },
  {
    id: "grocy",
    name: "Grocy",
    group: "庫存、POS 與試算表",
    when: "原料種類多到記不住、想用食譜去扣庫存時再考慮。它是開源軟體，要自己架。本站的菜單成本是單次試算，不會幫你盯庫存。",
    links: [
      { label: "開啟官網", url: "https://grocy.info/" },
      { label: "看原始碼", url: "https://github.com/grocy/grocy" },
    ],
    keywords: ["庫存", "食譜", "開源"],
  },
  {
    id: "inventree",
    name: "InvenTree",
    group: "庫存、POS 與試算表",
    when: "原料要管批號和效期、Grocy 不夠細時再看。一般小店先不用上到這個程度。",
    links: [
      { label: "開啟官網", url: "https://inventree.org/" },
      { label: "看原始碼", url: "https://github.com/inventree/InvenTree" },
    ],
    keywords: ["庫存", "批號", "開源"],
  },
  {
    id: "erpnext",
    name: "ERPNext",
    group: "庫存、POS 與試算表",
    when: "一個人記帳不夠、有多店，或真的需要進銷存加 POS 時再評估。這是開源 ERP，導入比想像中重，不要開店第一週就上。",
    links: [
      { label: "開啟介紹", url: "https://frappe.io/erpnext" },
      { label: "看原始碼", url: "https://github.com/frappe/erpnext" },
    ],
    keywords: ["pos", "erp", "進銷存", "開源"],
  },
  {
    id: "odoo",
    name: "Odoo",
    group: "庫存、POS 與試算表",
    when: "跟 ERPNext 類似，想找一套含 POS 的系統來比較時看。社群版開源，有些功能在付費版，導入前先分清楚。",
    links: [{ label: "開啟官網", url: "https://www.odoo.com/" }],
    keywords: ["pos", "erp", "開源"],
  },
  {
    id: "sweethome",
    name: "Sweet Home 3D",
    group: "平面圖進階",
    when: "要畫牆、門窗、設備，給設計師或房東看的時候用這套免費開源軟體。本站的平面圖只檢查桌子和走道，不取代它。它是桌面程式，需要下載安裝。",
    links: [{ label: "開啟官網", url: "https://www.sweethome3d.com/" }],
    keywords: ["平面圖", "3d", "開源", "下載"],
  },
];

export type SearchHit = {
  kind: "系統" | "自製中" | "工具" | "文章";
  title: string;
  href: string;
  excerpt: string;
  haystack: string;
};

export function searchHits(query: string): SearchHit[] {
  const hits: SearchHit[] = [
    ...tools.map((tool) => ({
      kind: "工具" as const,
      title: tool.name,
      href: tool.href,
      excerpt: tool.problem,
      haystack: [tool.name, tool.problem, tool.answers, tool.keywords.join(" ")].join(" "),
    })),
    ...guides.map((guide) => ({
      kind: "文章" as const,
      title: guide.title,
      href: `/guides/${guide.slug}`,
      excerpt: guide.summary,
      haystack: [guide.title, guide.summary, guide.paragraphs.join(" "), guide.keywords.join(" ")].join(" "),
    })),
    ...systems.map((system) => ({
      kind: "系統" as const,
      title: system.name,
      href: system.slug === "procurement" ? "/order-system" : `/systems/${system.slug}`,
      excerpt: system.pain,
      haystack: [system.name, system.category, system.pain, system.dataIn, system.example].join(" "),
    })),
    ...gaps.map((gap) => ({
      kind: "自製中" as const,
      title: gap.name,
      href: `/building/${gap.slug}`,
      excerpt: gap.pain,
      haystack: [gap.name, gap.pain, gap.why, "自製中"].join(" "),
    })),
    {
      kind: "文章",
      title: "新手入門",
      href: "/start",
      excerpt: "七步走完：兩平、菜單、外送、目標、報表、定位、平面圖。",
      haystack: "新手入門 步驟 兩平 菜單 外送",
    },
  ];
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return hits;
  return hits.filter((hit) => tokens.every((token) => hit.haystack.toLowerCase().includes(token)));
}
