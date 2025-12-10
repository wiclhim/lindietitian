import React, { useState, useEffect, useMemo, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
  where,
  updateDoc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import {
  LayoutDashboard,
  PlusCircle,
  Table2,
  PieChart as PieChartIcon,
  Wallet,
  TrendingUp,
  DollarSign,
  Calendar,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  RefreshCw,
  ChevronDown,
  Filter,
  X,
  Edit,
  Save,
  Ban,
  AlertCircle,
  Plus,
  Minus,
  Upload,
  FileText,
  CheckCircle,
  HelpCircle,
  Loader2,
  Calculator,
  ShoppingBag,
  Truck,
  LogOut,
  User,
  Download,
  FileJson,
  AlertTriangle,
  Receipt, // 新增圖標
} from "lucide-react";

// --- Firebase Configuration & Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyAV1UWmSiXZCQcp9xDhzV5_moGj66zxP4M",
  authDomain: "lindietitian.firebaseapp.com",
  projectId: "lindietitian",
  storageBucket: "lindietitian.firebasestorage.app",
  messagingSenderId: "652078071986",
  appId: "1:652078071986:web:6e8f309e0dcf492c9ec9ab",
  measurementId: "G-2ZVS3JE62J",
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "mumu-production"; // 固定專案名稱

// --- Constants ---
const ACCOUNTS = [
  { id: "cash", name: "零用現金NT", type: "cash" },
  { id: "bank_esun", name: "玉山活存NT", type: "bank" },
];

// 新增：票據憑證選項
const PROOF_OPTIONS = [
  "無憑證",
  "電子發票",
  "實體發票",
  "收據",
  "銷貨單",
  "電子憑證",
];

const NON_PROFIT_CODES = ["399", "499", "601"];

const CATEGORIES = {
  income: [
    {
      code: "101",
      name: "營業收入",
      subs: ["foodpanda營收", "ubereat營收", "自取營收", "其他平台營收"],
    },
    { code: "102", name: "銷貨收入", subs: ["一般銷貨"] },
    { code: "103", name: "服務收入", subs: [] },
    { code: "104", name: "工程收入", subs: [] },
    { code: "105", name: "佣金收入", subs: [] },
    { code: "106", name: "利息收入", subs: ["銀行利息"] },
    { code: "107", name: "進貨退出", subs: [] },
    { code: "108", name: "其他收入", subs: ["雜項收入"] },
    { code: "291", name: "加:溢收款", subs: [] },
    { code: "292", name: "加:其他", subs: [] },
    { code: "301", name: "銀行貸款", subs: [] },
    { code: "302", name: "同業貸款", subs: [] },
    { code: "303", name: "收回貸款", subs: [] },
    { code: "306", name: "股東出資", subs: ["股東出資", "林培涵出資"] },
    { code: "399", name: "銀行轉帳(存入)", subs: [] },
    { code: "601", name: "調撥轉出 (存入)", subs: ["銀行存入"] },
  ],
  expense: [
    { code: "191", name: "減:匯費", subs: ["銀行匯費"] },
    {
      code: "201",
      name: "進貨",
      subs: [
        "雞胸肉",
        "牛腱心",
        "豬里肌",
        "鯛魚排",
        "鮭魚",
        "去骨清雞腿排",
        "松阪豬",
        "豆干",
        "糖心蛋",
        "毛豆仁",
        "地瓜",
        "花椰菜米",
        "蒟蒻麵",
        "白米三好米",
        "玉米筍",
        "櫛瓜",
        "十全味噌",
        "檸檬汁",
        "紅黎麥",
        "花椰菜",
        "小蕃茄",
        "腰果",
        "快樂牛起司",
        "米酒",
        "八角",
        "黑胡椒粉",
        "黑胡椒粒",
        "鹽巴",
        "白胡椒粉",
        "醬油(萬家香)",
        "滷包",
        "起司粉",
        "芝麻油",
        "橄欖油",
        "海帶芽",
        "蔥、薑、蒜",
        "沙拉油",
      ],
    },
    { code: "202", name: "薪資支出", subs: ["正職薪資", "工讀薪資"] },
    { code: "203", name: "租金支出", subs: ["店面租金", "1月份租金"] },
    {
      code: "204",
      name: "文具用品",
      subs: [
        "無痕膠帶",
        "筆",
        "電池",
        "傳單影印",
        "出單紙",
        "剪刀",
        "計時器",
        "收據",
      ],
    },
    { code: "205", name: "旅運費", subs: [] },
    { code: "206", name: "運費", subs: ["lalamove", "宅配通"] },
    { code: "207", name: "郵資費", subs: ["郵局掛號"] },
    { code: "208", name: "修繕費", subs: [] },
    {
      code: "209",
      name: "廣告費",
      subs: ["foodpanda", "ubereat", "FB廣告", "IG廣告", "其他平台"],
    },
    { code: "210", name: "水費", subs: [] },
    { code: "211", name: "電費", subs: [] },
    { code: "212", name: "瓦斯費", subs: [] },
    { code: "213", name: "電話費", subs: [] },
    { code: "214", name: "保險費", subs: [] },
    {
      code: "215",
      name: "平台租費",
      subs: ["foodpanda", "ubereat", "其他平台"],
    },
    { code: "216", name: "捐贈", subs: [] },
    { code: "217", name: "稅捐", subs: [] },
    { code: "218", name: "伙食費", subs: [] },
    { code: "219", name: "職工福利", subs: [] },
    {
      code: "220",
      name: "佣金支出",
      subs: ["foodpanda", "ubereat", "其他平台"],
    },
    { code: "221", name: "訓練費", subs: [] },
    { code: "222", name: "獎金", subs: [] },
    { code: "223", name: "會費", subs: [] },
    { code: "224", name: "網路費", subs: [] },
    { code: "225", name: "雜項購置", subs: [] },
    { code: "226", name: "出口費用", subs: [] },
    { code: "227", name: "手續費", subs: [] },
    { code: "228", name: "罰款", subs: [] },
    {
      code: "232",
      name: "廚房用品",
      subs: [
        "洗碗精",
        "菜瓜布",
        "垃圾袋",
        "背心袋",
        "烘焙紙",
        "鋁箔",
        "手套",
        "餐巾紙/衛生紙",
        "保鮮膜",
        "鍋、碗、瓢、盆等",
        "電子秤",
        "抹布",
        "鋼刷球",
        "漂白水",
        "管路疏通劑",
      ],
    },
    {
      code: "233",
      name: "包裝費",
      subs: [
        "5號2分隔盒",
        "貼紙",
        "免洗餐具",
        "背心袋",
        "加點用牛皮紙盒",
        "1OZ醬料杯",
        "飲料瓶",
      ],
    },
    { code: "243", name: "管理費", subs: [] },
    { code: "245", name: "其他雜費", subs: ["公證費"] },
    {
      code: "251",
      name: "電腦用品",
      subs: ["桌上型電腦一套", "OFFICE軟體一套"],
    },
    { code: "252", name: "運輸設備", subs: [] },
    { code: "253", name: "生財器具", subs: [] },
    { code: "254", name: "押金", subs: ["房屋押金"] },
    { code: "299", name: "●待查支出", subs: [] },
    { code: "499", name: "現金調撥(提領)", subs: [] },
    { code: "601", name: "調撥轉出 (提領)", subs: ["提領零用金"] },
  ],
};

const getCategoryNameByCode = (code) => {
  const allCats = [...CATEGORIES.income, ...CATEGORIES.expense];
  const found = allCats.find((c) => c.code === code);
  return found ? found.name : "未知科目";
};

const getMonthRange = () => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
  return { start: firstDay, end: lastDay };
};

// --- Components ---

// Auth Login/Register Component
const AuthForm = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("帳號或密碼錯誤");
      } else if (err.code === "auth/email-already-in-use") {
        setError("此 Email 已被註冊");
      } else if (err.code === "auth/weak-password") {
        setError("密碼長度需至少 6 位數");
      } else {
        setError("登入失敗，請稍後再試");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            木木營養食記帳系統
          </h1>
          <p className="text-slate-500 mt-2">
            {isRegister ? "註冊新帳號" : "登入您的帳號"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email 信箱
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              密碼
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="至少 6 位數"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isRegister ? "註冊" : "登入"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-emerald-600 hover:text-emerald-800 font-medium"
          >
            {isRegister ? "已有帳號？點此登入" : "沒有帳號？點此註冊"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Dialog = ({ config, onClose }) => {
  if (!config.show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
        <div
          className={`p-4 border-b ${
            config.type === "confirm"
              ? "bg-amber-50 border-amber-100"
              : "bg-blue-50 border-blue-100"
          }`}
        >
          <h3
            className={`text-lg font-bold flex items-center gap-2 ${
              config.type === "confirm" ? "text-amber-700" : "text-blue-700"
            }`}
          >
            {config.type === "confirm" ? (
              <HelpCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {config.title}
          </h3>
        </div>
        <div className="p-6 text-slate-600 whitespace-pre-wrap leading-relaxed text-sm">
          {config.content}
        </div>
        <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
          {config.type === "confirm" && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors text-sm"
            >
              取消
            </button>
          )}
          <button
            onClick={() => {
              if (config.onConfirm) config.onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-lg font-bold shadow-sm transition-colors text-sm ${
              config.type === "confirm"
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {config.confirmText || "確定"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Sidebar with Logout & BACKUP
const Sidebar = ({
  activeTab,
  setActiveTab,
  onImport,
  onExport,
  onReset,
  importing,
  exporting,
  resetting,
  userEmail,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onImport(file);
    e.target.value = null;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="w-full md:w-64 bg-slate-800 text-white flex flex-col h-auto md:h-screen sticky top-0 z-50 md:z-auto">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-400" />
          木木營養食
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          雲端營收管理系統 v5.2 (憑證版)
        </p>
      </div>

      {/* User Info */}
      <div className="p-4 bg-slate-700/50 flex items-center gap-3 border-b border-slate-700">
        <div className="bg-slate-600 p-2 rounded-full">
          <User className="w-4 h-4 text-slate-300" />
        </div>
        <div className="overflow-hidden">
          <p className="text-xs text-slate-400">已登入</p>
          <p className="text-sm font-medium truncate" title={userEmail}>
            {userEmail}
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-x-auto flex md:flex-col md:overflow-visible no-scrollbar">
        {[
          { id: "dashboard", icon: LayoutDashboard, label: "總覽儀表板" },
          { id: "entry", icon: PlusCircle, label: "日記簿 (新增/修改)" },
          { id: "ledger", icon: Table2, label: "帳戶明細表" },
          { id: "analysis", icon: Calculator, label: "收支分析 (營收佔比)" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            disabled={importing || exporting || resetting}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-colors whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeTab === item.id
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-700"
            } ${
              importing || exporting || resetting
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}

        <div className="pt-4 mt-4 md:border-t md:border-slate-700 shrink-0 flex flex-col gap-2">
          {/* Export Button */}
          <button
            onClick={onExport}
            disabled={exporting || importing || resetting}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-blue-300 hover:bg-slate-700 transition-colors border border-dashed border-slate-600 hover:border-blue-300 whitespace-nowrap ${
              importing || exporting || resetting
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {exporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {exporting ? "備份中..." : "匯出資料備份"}
          </button>

          {/* Import Button */}
          <button
            onClick={() =>
              !importing && !resetting && fileInputRef.current.click()
            }
            disabled={importing || exporting || resetting}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-amber-300 hover:bg-slate-700 transition-colors border border-dashed border-slate-600 hover:border-amber-300 whitespace-nowrap ${
              importing || exporting || resetting
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {importing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {importing ? "處理中" : "匯入/還原資料"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.json"
            className="hidden"
          />

          {/* Reset Database Button (Dangerous Action) */}
          <button
            onClick={onReset}
            disabled={importing || exporting || resetting}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-red-400 hover:bg-red-900/30 hover:text-red-200 transition-colors border border-dashed border-slate-600 hover:border-red-400 whitespace-nowrap ${
              importing || exporting || resetting
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {resetting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            {resetting ? "清除中..." : "清空/重置資料庫"}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-slate-400 hover:bg-slate-700 transition-colors whitespace-nowrap mt-4"
          >
            <LogOut className="w-5 h-5" />
            登出系統
          </button>
        </div>
      </nav>
    </div>
  );
};

// Dashboard (No changes)
const Dashboard = ({ transactions, dateRange, setDateRange }) => {
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 31)
        setWarning("注意：顯示範圍已超過 1 個月，建議縮小範圍以利檢視。");
      else setWarning("");
    }
  }, [dateRange]);

  const data = useMemo(() => {
    const accBalance = { cash: 0, bank_esun: 0 };

    transactions.forEach((t) => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === "income") {
        if (t.account === "零用現金NT") accBalance["cash"] += amt;
        if (t.account === "玉山活存NT") accBalance["bank_esun"] += amt;
      } else {
        if (t.account === "零用現金NT") accBalance["cash"] -= amt;
        if (t.account === "玉山活存NT") accBalance["bank_esun"] -= amt;
      }
    });

    const filtered = transactions.filter((t) => {
      if (dateRange.start && t.date < dateRange.start) return false;
      if (dateRange.end && t.date > dateRange.end) return false;
      return true;
    });

    const grouped = {};
    filtered.forEach((t) => {
      if (NON_PROFIT_CODES.includes(t.categoryCode)) return;
      if (!grouped[t.date])
        grouped[t.date] = {
          date: t.date,
          total: 0,
          self: 0,
          panda: 0,
          uber: 0,
          other: 0,
        };

      const amt = parseFloat(t.amount) || 0;
      if (t.type === "income") {
        grouped[t.date].total += amt;
        const sub = (t.subcategory || t.memo || "").toLowerCase();

        if (sub.includes("foodpanda")) {
          grouped[t.date].panda += amt;
        } else if (sub.includes("uber")) {
          grouped[t.date].uber += amt;
        } else if (sub.includes("自取") || sub.includes("內用")) {
          grouped[t.date].self += amt;
        } else {
          grouped[t.date].other += amt;
        }
      }
    });

    return {
      accBalance,
      chartData: Object.values(grouped).sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    };
  }, [transactions, dateRange]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">營運總覽</h2>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="outline-none text-sm text-slate-600 w-32"
            />
            <span className="text-slate-300">~</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="outline-none text-sm text-slate-600 w-32"
            />
          </div>
          {warning && (
            <div className="text-xs text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
              <AlertCircle className="w-3 h-3" /> {warning}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">總資產 (台幣合計)</p>
          <h3 className="text-3xl font-bold text-slate-800">
            $
            {(
              data.accBalance["cash"] + data.accBalance["bank_esun"]
            ).toLocaleString()}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">玉山活存餘額</p>
          <h3 className="text-3xl font-bold text-emerald-600">
            ${data.accBalance["bank_esun"].toLocaleString()}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">零用金餘額</p>
          <h3 className="text-3xl font-bold text-amber-600">
            ${data.accBalance["cash"].toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          本期營收趨勢 (總營收 vs 來源分析)
        </h3>
        {data.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  const map = {
                    total: "總營收",
                    self: "自取",
                    panda: "Foodpanda",
                    uber: "UberEat",
                    other: "其他",
                  };
                  return [`$${value.toLocaleString()}`, map[name] || name];
                }}
              />
              <Legend />
              <Bar dataKey="self" fill="#facc15" name="自取" />
              <Bar dataKey="panda" fill="#ec4899" name="Foodpanda" />
              <Bar dataKey="uber" fill="#4ade80" name="UberEat" />
              <Bar dataKey="other" fill="#94a3b8" name="其他" />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="總營收"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            尚無資料
          </div>
        )}
      </div>
    </div>
  );
};

// EntryForm (Added Proof Field)
const EntryForm = ({
  user,
  appId,
  initialData,
  onCancelEdit,
  transactions = [],
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "expense",
    account: "玉山活存NT",
    categoryCode: "",
    categoryName: "",
    subcategory: "",
    amount: "",
    memo: "",
    proof: "無憑證", // 新增預設值
  });
  const [items, setItems] = useState([{ id: 1, subcategory: "", amount: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const memoOptions = useMemo(() => {
    const uniqueMemos = new Set();
    transactions.forEach((t) => {
      if (t.memo && t.memo.trim() !== "") {
        uniqueMemos.add(t.memo.trim());
      }
    });
    return Array.from(uniqueMemos).sort();
  }, [transactions]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        amount: initialData.amount.toString(),
        proof: initialData.proof || "無憑證", // 兼容舊資料
      });
      if (
        initialData.details &&
        Array.isArray(initialData.details) &&
        initialData.details.length > 0
      ) {
        setItems(initialData.details);
      } else {
        setItems([
          {
            id: 1,
            subcategory: initialData.subcategory || "",
            amount: initialData.amount.toString(),
          },
        ]);
      }
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        account: "玉山活存NT",
        categoryCode: "",
        categoryName: "",
        subcategory: "",
        amount: "",
        memo: "",
        proof: "無憑證",
      });
      setItems([{ id: 1, subcategory: "", amount: "" }]);
    }
  }, [initialData]);

  const totalAmount = useMemo(
    () => items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0),
    [items]
  );
  const currentCatList =
    formData.type === "income" ? CATEGORIES.income : CATEGORIES.expense;
  const selectedCatObj = currentCatList.find(
    (c) => c.code === formData.categoryCode
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || totalAmount <= 0) return;
    setSubmitting(true);
    try {
      const validItems = items.filter(
        (i) => i.subcategory.trim() !== "" || i.amount > 0
      );
      const summaryString = validItems.map((i) => i.subcategory).join("、");
      const dataToSave = {
        ...formData,
        amount: totalAmount,
        subcategory: summaryString,
        details: validItems,
        updatedAt: serverTimestamp(),
      };

      if (initialData?.id) {
        await updateDoc(
          doc(
            db,
            "artifacts",
            appId,
            "users",
            user.uid,
            "transactions",
            initialData.id
          ),
          dataToSave
        );
        setMessage({ type: "success", text: "修改成功！" });
        if (onCancelEdit) onCancelEdit();
      } else {
        await addDoc(
          collection(db, "artifacts", appId, "users", user.uid, "transactions"),
          {
            ...dataToSave,
            createdAt: serverTimestamp(),
          }
        );
        setMessage({ type: "success", text: "記帳成功！" });
        setItems([{ id: Date.now(), subcategory: "", amount: "" }]);
        setFormData((prev) => ({
          ...prev,
          memo: "",
          subcategory: "",
          amount: "",
          proof: "無憑證", // 重置憑證
        }));
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setMessage({ type: "error", text: "儲存失敗" });
    }
    setSubmitting(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {initialData ? (
              <Edit className="w-6 h-6 text-amber-500" />
            ) : (
              <PlusCircle className="w-6 h-6 text-blue-600" />
            )}
            {initialData ? "修改日記簿紀錄" : "新增日記簿"}
          </div>
          {initialData && (
            <button
              onClick={onCancelEdit}
              className="text-sm px-3 py-1 bg-slate-100 rounded-full flex gap-1"
            >
              <Ban className="w-4 h-4" /> 取消
            </button>
          )}
        </h2>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === "success"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                日期
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                類型
              </label>
              <div className="flex bg-slate-100 rounded-lg p-1">
                {["income", "expense"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, type: t, categoryCode: "" });
                      setItems([
                        { id: Date.now(), subcategory: "", amount: "" },
                      ]);
                    }}
                    className={`flex-1 py-2 rounded-md text-sm font-medium ${
                      formData.type === t
                        ? t === "income"
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                        : "text-slate-500"
                    }`}
                  >
                    {t === "income" ? "收入" : "支出"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                帳戶
              </label>
              <select
                value={formData.account}
                onChange={(e) =>
                  setFormData({ ...formData, account: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-white"
              >
                {ACCOUNTS.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            {/* 新增憑證選擇欄位 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Receipt className="w-4 h-4" /> 票據憑證
              </label>
              <select
                value={formData.proof}
                onChange={(e) =>
                  setFormData({ ...formData, proof: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-white border-blue-200 text-blue-800"
              >
                {PROOF_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              科目
            </label>
            <select
              required
              value={formData.categoryCode}
              onChange={(e) => {
                const c = currentCatList.find((x) => x.code === e.target.value);
                setFormData({
                  ...formData,
                  categoryCode: e.target.value,
                  categoryName: c?.name || "",
                });
              }}
              className="w-full p-3 border rounded-lg bg-white"
            >
              <option value="">請選擇...</option>
              {currentCatList.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-700">
                明細 (總額: ${totalAmount.toLocaleString()})
              </label>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <div className="w-6 text-xs text-slate-400">{idx + 1}.</div>
                  <div className="flex-1">
                    <input
                      list={`subs-${item.id}`}
                      placeholder={selectedCatObj?.name + "細項"}
                      value={item.subcategory}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x) =>
                            x.id === item.id
                              ? { ...x, subcategory: e.target.value }
                              : x
                          )
                        )
                      }
                      className="w-full p-2 border rounded-lg text-sm"
                    />
                    <datalist id={`subs-${item.id}`}>
                      {selectedCatObj?.subs.map((s, i) => (
                        <option key={i} value={s} />
                      ))}
                    </datalist>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    value={item.amount}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x) =>
                          x.id === item.id
                            ? { ...x, amount: e.target.value }
                            : x
                        )
                      )
                    }
                    className="w-24 p-2 border rounded-lg text-sm text-right"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      items.length > 1 &&
                      setItems((prev) => prev.filter((x) => x.id !== item.id))
                    }
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setItems([
                  ...items,
                  { id: Date.now(), subcategory: "", amount: "" },
                ])
              }
              className="mt-3 text-sm text-blue-600 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> 新增一列
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              摘要備註 (廠商/發票)
            </label>
            <input
              list="memo-options"
              value={formData.memo}
              onChange={(e) =>
                setFormData({ ...formData, memo: e.target.value })
              }
              className="w-full p-3 border rounded-lg"
              placeholder="可輸入或選擇常用廠商..."
            />
            <datalist id="memo-options">
              {memoOptions.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 rounded-xl text-white font-bold shadow-md ${
              initialData ? "bg-amber-500" : "bg-blue-600"
            }`}
          >
            {submitting ? "處理中..." : initialData ? "確認更新" : "確認新增"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Ledger (Added Proof Column)
const Ledger = ({
  transactions,
  onDelete,
  onEdit,
  dateRange,
  setDateRange,
}) => {
  const [filter, setFilter] = useState({
    category: "",
    account: "",
    search: "",
  });

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (dateRange.start && t.date < dateRange.start) return false;
      if (dateRange.end && t.date > dateRange.end) return false;

      if (filter.category) {
        if (filter.category === "ALL_INCOME") {
          if (t.type !== "income") return false;
        } else if (filter.category === "ALL_EXPENSE") {
          if (t.type !== "expense") return false;
        } else {
          if (t.categoryCode !== filter.category) return false;
        }
      }

      if (filter.account && t.account !== filter.account) return false;
      if (filter.search) {
        const s = filter.search.toLowerCase();
        return (
          t.categoryName.includes(s) ||
          t.subcategory.includes(s) ||
          t.memo.includes(s)
        );
      }
      return true;
    });
  }, [transactions, dateRange, filter]);

  const summary = useMemo(() => {
    let income = 0,
      expense = 0;
    filtered.forEach((t) => {
      if (NON_PROFIT_CODES.includes(t.categoryCode)) return;

      if (t.type === "income") income += parseFloat(t.amount) || 0;
      else expense += parseFloat(t.amount) || 0;
    });
    return { income, expense, profit: income - expense };
  }, [filtered]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              帳戶明細表
              <span className="text-sm font-normal text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200">
                (資料庫共有 {transactions.length} 筆資料)
              </span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              顯示範圍: {dateRange.start} ~ {dateRange.end}
            </p>
          </div>
          {(dateRange.start ||
            filter.category ||
            filter.account ||
            filter.search) && (
            <button
              onClick={() => {
                setDateRange({ start: "", end: "" });
                setFilter({ category: "", account: "", search: "" });
              }}
              className="text-sm text-red-500 flex items-center gap-1 border border-red-200 px-3 py-1 rounded-full hover:bg-red-50"
            >
              <X className="w-4 h-4" /> 清除所有篩選 (顯示全部)
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="text-sm outline-none w-32"
            />
            <span className="text-slate-300">~</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="text-sm outline-none w-32"
            />
          </div>
          <select
            value={filter.account}
            onChange={(e) => setFilter({ ...filter, account: e.target.value })}
            className="p-2 border rounded-lg text-sm bg-white"
          >
            <option value="">所有帳戶</option>
            {ACCOUNTS.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="p-2 border rounded-lg text-sm bg-white w-48"
          >
            <option value="">所有科目 (全選)</option>
            <option value="ALL_INCOME" className="text-emerald-600 font-bold">
              【只顯示收入】
            </option>
            <option value="ALL_EXPENSE" className="text-red-500 font-bold">
              【只顯示支出】
            </option>
            <optgroup label="--- 收入科目 ---">
              {CATEGORIES.income.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} {c.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="--- 支出科目 ---">
              {CATEGORIES.expense.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} {c.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  日期
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  憑證
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  帳戶
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  科目
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  摘要/明細
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                  收入
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                  支出
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-center">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 group">
                  <td className="p-4 text-slate-800 text-sm whitespace-nowrap">
                    {t.date}
                  </td>
                  <td className="p-4 text-slate-600 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs border ${
                        t.proof && t.proof !== "無憑證"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}
                    >
                      {t.proof || "-"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        t.account.includes("玉山")
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {t.account}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 text-sm">
                    <span className="font-mono text-xs text-slate-400 mr-1">
                      {t.categoryCode}
                    </span>
                    <span
                      className={
                        NON_PROFIT_CODES.includes(t.categoryCode)
                          ? "text-slate-400 italic"
                          : ""
                      }
                    >
                      {t.categoryName}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="font-medium text-emerald-700">
                      {t.subcategory}
                    </div>
                    <div className="text-xs text-slate-400">{t.memo}</div>
                  </td>
                  <td
                    className={`p-4 text-right text-sm ${
                      NON_PROFIT_CODES.includes(t.categoryCode)
                        ? "text-slate-300"
                        : "font-bold text-emerald-600"
                    }`}
                  >
                    {t.type === "income"
                      ? `$${t.amount.toLocaleString()}`
                      : "-"}
                  </td>
                  <td
                    className={`p-4 text-right text-sm ${
                      NON_PROFIT_CODES.includes(t.categoryCode)
                        ? "text-slate-300"
                        : "font-bold text-red-500"
                    }`}
                  >
                    {t.type === "expense"
                      ? `$${t.amount.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="p-4 text-center flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(t)}
                      className="text-slate-400 hover:text-amber-500"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 mb-2 opacity-20" />
                      <p>沒有找到符合條件的紀錄</p>
                      {transactions.length > 0 && (
                        <p className="text-sm text-amber-500 mt-1">
                          系統中有 {transactions.length}{" "}
                          筆資料，請按上方「清除所有篩選」按鈕。
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end gap-6 text-sm">
          <div className="text-xs text-slate-400 self-center mr-auto">
            * 灰色數字為內部調撥，不計入營收支出
          </div>
          <div>
            總收入{" "}
            <span className="font-bold text-emerald-600">
              +${summary.income.toLocaleString()}
            </span>
          </div>
          <div>
            總支出{" "}
            <span className="font-bold text-red-500">
              -${summary.expense.toLocaleString()}
            </span>
          </div>
          <div>
            淨利{" "}
            <span
              className={`font-bold ${
                summary.profit >= 0 ? "text-blue-600" : "text-orange-500"
              }`}
            >
              {summary.profit >= 0 ? "+" : ""}${summary.profit.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Analysis Component (Fixed) ---
const Analysis = ({ transactions, dateRange, setDateRange }) => {
  // 1. 總計與圓餅圖數據計算
  const { totalRevenue, totalExpense, costData, revStats, filteredCount } =
    useMemo(() => {
      let stats = {
        ingredients: 0,
        personnel: 0,
        rent: 0,
        platform: 0,
        consumables: 0,
        others: 0,
      };
      let revStats = { self: 0, platform: 0, total: 0 };
      let totalRevenue = 0;
      let totalExpense = 0;

      // 防呆：確保 transactions 是陣列
      if (!Array.isArray(transactions)) {
        return {
          totalRevenue: 0,
          totalExpense: 0,
          costData: [],
          revStats: { self: 0, platform: 0, total: 0 },
          filteredCount: 0,
        };
      }

      const filtered = transactions.filter((t) => {
        // 防呆：如果沒有日期，直接過濾掉
        if (!t || !t.date) return false;
        if (dateRange.start && t.date < dateRange.start) return false;
        if (dateRange.end && t.date > dateRange.end) return false;
        return true;
      });

      filtered.forEach((t) => {
        if (NON_PROFIT_CODES.includes(t.categoryCode)) return;

        const amt = parseFloat(t.amount) || 0;
        const sub = (t.subcategory || t.memo || "").toLowerCase();

        if (t.type === "income") {
          totalRevenue += amt;
          if (
            sub.includes("food") ||
            sub.includes("uber") ||
            sub.includes("平台")
          ) {
            revStats.platform += amt;
          } else {
            revStats.self += amt;
          }
          revStats.total += amt;
        } else {
          totalExpense += amt;
          const c = t.categoryCode;
          if (c === "201") stats.ingredients += amt;
          else if (c === "202") stats.personnel += amt;
          else if (c === "203") stats.rent += amt;
          else if (
            ["215", "220"].includes(c) ||
            (c === "209" && (sub.includes("food") || sub.includes("uber")))
          )
            stats.platform += amt;
          else if (["232", "233"].includes(c)) stats.consumables += amt;
          else stats.others += amt;
        }
      });

      const data = [
        { name: "食材成本", value: stats.ingredients, color: "#FF8042" },
        { name: "人事成本", value: stats.personnel, color: "#00C49F" },
        { name: "店面租金", value: stats.rent, color: "#FFBB28" },
        { name: "外送平台", value: stats.platform, color: "#FF6B6B" },
        { name: "耗材支出", value: stats.consumables, color: "#0088FE" },
        { name: "其他費用", value: stats.others, color: "#8884d8" },
      ].filter((d) => d.value > 0);

      return {
        totalRevenue,
        totalExpense,
        costData: data,
        revStats,
        filteredCount: filtered.length,
      };
    }, [transactions, dateRange]);

  // 2. 每月趨勢圖數據計算
  const monthlyData = useMemo(() => {
    if (!Array.isArray(transactions)) return []; // 防呆

    const grouped = {};
    const filtered = transactions.filter((t) => {
      // 防呆：檢查日期是否存在且為字串
      if (!t || !t.date || typeof t.date !== "string") return false;
      if (dateRange.start && t.date < dateRange.start) return false;
      if (dateRange.end && t.date > dateRange.end) return false;
      return true;
    });

    filtered.forEach((t) => {
      if (NON_PROFIT_CODES.includes(t.categoryCode)) return;

      // 防呆：再次確保 substring 不會報錯
      try {
        const month = t.date.substring(0, 7);
        if (!grouped[month])
          grouped[month] = { month, income: 0, expense: 0, profit: 0 };

        const amt = parseFloat(t.amount) || 0;
        if (t.type === "income") grouped[month].income += amt;
        else grouped[month].expense += amt;
      } catch (e) {
        console.warn("Skipping invalid transaction data", t);
      }
    });

    return Object.values(grouped)
      .map((i) => ({ ...i, profit: i.income - i.expense }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions, dateRange]);

  // 3. P&L 報表數據計算
  const monthlyReport = useMemo(() => {
    if (!Array.isArray(transactions)) return []; // 防呆

    const stats = {};

    transactions.forEach((t) => {
      // 防呆：關鍵修復點
      if (!t || !t.date || typeof t.date !== "string") return;

      if (NON_PROFIT_CODES.includes(t.categoryCode)) return;
      if (dateRange.start && t.date < dateRange.start) return;
      if (dateRange.end && t.date > dateRange.end) return;

      const month = t.date.substring(0, 7);
      if (!stats[month]) {
        stats[month] = {
          month,
          revenue: 0,
          expense: 0,
          revSelf: 0,
          revPlatform: 0,
          costIngredients: 0,
          costPersonnel: 0,
          costRent: 0,
          costPlatform: 0,
          costConsumables: 0,
          costOthers: 0,
        };
      }

      const amt = parseFloat(t.amount) || 0;
      const sub = (t.subcategory || t.memo || "").toLowerCase();
      const c = t.categoryCode;

      if (t.type === "income") {
        stats[month].revenue += amt;
        if (
          sub.includes("food") ||
          sub.includes("uber") ||
          sub.includes("平台")
        ) {
          stats[month].revPlatform += amt;
        } else {
          stats[month].revSelf += amt;
        }
      } else {
        stats[month].expense += amt;
        if (c === "201") stats[month].costIngredients += amt;
        else if (c === "202") stats[month].costPersonnel += amt;
        else if (c === "203") stats[month].costRent += amt;
        else if (
          ["215", "220"].includes(c) ||
          (c === "209" && (sub.includes("food") || sub.includes("uber")))
        )
          stats[month].costPlatform += amt;
        else if (["232", "233"].includes(c))
          stats[month].costConsumables += amt;
        else stats[month].costOthers += amt;
      }
    });

    return Object.values(stats)
      .sort((a, b) => b.month.localeCompare(a.month))
      .map((s) => {
        const r = s.revenue || 1; // avoid div by 0
        return {
          ...s,
          revSelfPct: ((s.revSelf / r) * 100).toFixed(1),
          revPlatformPct: ((s.revPlatform / r) * 100).toFixed(1),
          costIngredientsPct: ((s.costIngredients / r) * 100).toFixed(1),
          costPersonnelPct: ((s.costPersonnel / r) * 100).toFixed(1),
          costRentPct: ((s.costRent / r) * 100).toFixed(1),
          costPlatformPct: ((s.costPlatform / r) * 100).toFixed(1),
          costConsumablesPct: ((s.costConsumables / r) * 100).toFixed(1),
          costOthersPct: ((s.costOthers / r) * 100).toFixed(1),
          netProfit: s.revenue - s.expense,
          netProfitPct: (((s.revenue - s.expense) / r) * 100).toFixed(1),
        };
      });
  }, [transactions, dateRange]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            收支分析與財務報表
            <span className="text-sm font-normal text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200">
              (共 {filteredCount} 筆)
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            本期總營收:{" "}
            <span className="font-bold text-emerald-600">
              ${totalRevenue.toLocaleString()}
            </span>
            <span className="mx-2">|</span>
            本期總支出:{" "}
            <span className="font-bold text-red-500">
              ${totalExpense.toLocaleString()}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            className="text-sm outline-none w-32"
          />
          <span className="text-slate-300">~</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
            className="text-sm outline-none w-32"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-500" /> 營收來源佔比
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white rounded-full">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-medium text-slate-700">自取 / 內用</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-700 text-lg">
                  ${revStats.self.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-500">
                  {revStats.total > 0
                    ? ((revStats.self / revStats.total) * 100).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white rounded-full">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-slate-700">
                  外送平台 (Uber/Panda)
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-700 text-lg">
                  ${revStats.platform.toLocaleString()}
                </div>
                <div className="text-xs text-blue-500">
                  {revStats.total > 0
                    ? ((revStats.platform / revStats.total) * 100).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            每月營運趨勢
          </h3>
          <div className="h-64">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                  <Legend />
                  <Bar
                    dataKey="income"
                    name="總營收"
                    fill="#10b981"
                    barSize={20}
                  />
                  <Bar
                    dataKey="expense"
                    name="總成本"
                    fill="#ef4444"
                    barSize={20}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="淨利"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                區間內無資料
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96 flex flex-col items-center justify-center relative">
          <h3 className="text-lg font-bold text-slate-700 mb-4 absolute top-6 left-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-amber-500" />
            成本佔比分析 (總營收佔比 %)
          </h3>
          {costData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => {
                    const revPct =
                      totalRevenue > 0
                        ? ((value / totalRevenue) * 100).toFixed(1)
                        : 0;
                    return `${name} ${revPct}%`;
                  }}
                >
                  {costData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const revPct =
                        totalRevenue > 0
                          ? ((data.value / totalRevenue) * 100).toFixed(1)
                          : 0;
                      const expPct =
                        totalExpense > 0
                          ? ((data.value / totalExpense) * 100).toFixed(1)
                          : 0;
                      return (
                        <div className="bg-white p-3 border shadow-lg rounded-lg text-sm">
                          <p className="font-bold text-slate-800 mb-1">
                            {data.name}
                          </p>
                          <p className="text-slate-600">
                            金額: ${data.value.toLocaleString()}
                          </p>
                          <p className="text-blue-600">佔總營收: {revPct}%</p>
                          <p className="text-slate-400 text-xs">
                            佔總支出: {expPct}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-400">尚無支出資料</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <h3 className="p-6 text-lg font-bold text-slate-700 border-b border-slate-100 flex items-center gap-2">
          <Table2 className="w-5 h-5 text-purple-500" />
          月度營運損益分析表 (P&L)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="p-4">月份</th>
                <th className="p-4 text-right">總營收</th>
                <th className="p-4 text-right text-emerald-600">自取%</th>
                <th className="p-4 text-right text-blue-500">平台%</th>
                <th className="p-4 text-right border-l border-slate-100">
                  總支出
                </th>
                <th className="p-4 text-right text-orange-500">食材%</th>
                <th className="p-4 text-right text-teal-500">人事%</th>
                <th className="p-4 text-right text-yellow-500">租金%</th>
                <th className="p-4 text-right text-red-400">平台費%</th>
                <th className="p-4 text-right text-slate-400">其他%</th>
                <th className="p-4 text-right border-l border-slate-100">
                  淨利
                </th>
                <th className="p-4 text-right">淨利率</th>
              </tr>
            </thead>
            <tbody>
              {monthlyReport.length > 0 ? (
                monthlyReport.map((row) => (
                  <tr
                    key={row.month}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="p-4 font-bold text-slate-700">
                      {row.month}
                    </td>
                    <td className="p-4 text-right text-emerald-600 font-medium">
                      ${row.revenue.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">{row.revSelfPct}%</td>
                    <td className="p-4 text-right">{row.revPlatformPct}%</td>
                    <td className="p-4 text-right border-l border-slate-100 text-red-500 font-medium">
                      ${row.expense.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      {row.costIngredientsPct}%
                    </td>
                    <td className="p-4 text-right">{row.costPersonnelPct}%</td>
                    <td className="p-4 text-right">{row.costRentPct}%</td>
                    <td className="p-4 text-right">{row.costPlatformPct}%</td>
                    <td className="p-4 text-right">{row.costOthersPct}%</td>
                    <td
                      className={`p-4 text-right border-l border-slate-100 font-bold ${
                        row.netProfit >= 0 ? "text-blue-600" : "text-red-500"
                      }`}
                    >
                      {row.netProfit >= 0 ? "+" : ""}$
                      {row.netProfit.toLocaleString()}
                    </td>
                    <td
                      className={`p-4 text-right font-bold ${
                        parseFloat(row.netProfitPct) >= 0
                          ? "text-blue-600"
                          : "text-red-500"
                      }`}
                    >
                      {row.netProfitPct}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="p-8 text-center text-slate-400">
                    無資料，請調整日期區間或匯入資料。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [resetting, setResetting] = useState(false); // New resetting state
  const [dialogConfig, setDialogConfig] = useState({
    show: false,
    type: "alert",
    title: "",
    content: "",
  });

  // 監聽登入狀態
  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    const { start, end } = getMonthRange();
    setDateRange({ start, end });
  }, []);

  useEffect(() => {
    if (!user) {
      setTransactions([]); // 登出時清空資料
      return;
    }
    const q = query(
      collection(db, "artifacts", appId, "users", user.uid, "transactions")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      });
      setTransactions(list);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDelete = (id) => {
    setDialogConfig({
      show: true,
      type: "confirm",
      title: "確認刪除",
      content: "您確定要刪除這筆紀錄嗎？此動作無法復原。",
      confirmText: "刪除",
      onConfirm: async () => {
        await deleteDoc(
          doc(db, "artifacts", appId, "users", user.uid, "transactions", id)
        );
      },
    });
  };

  // --- NEW: Reset Database Function (Clear All) ---
  const handleReset = async () => {
    if (!user) return;
    setDialogConfig({
      show: true,
      type: "confirm",
      title: "⚠️ 危險操作：清空所有資料",
      content:
        "您確定要「清空」所有記帳資料嗎？\n\n此動作將會刪除此帳號下所有的交易紀錄，且無法復原！\n\n如果您只是重複匯入，建議先匯出備份後再執行此操作。\n\n執行後，系統將變回全新狀態。",
      confirmText: "確定清空 (無法復原)",
      onConfirm: async () => {
        setResetting(true);
        try {
          const q = query(
            collection(
              db,
              "artifacts",
              appId,
              "users",
              user.uid,
              "transactions"
            )
          );
          const snapshot = await getDocs(q);

          if (snapshot.empty) {
            setDialogConfig({
              show: true,
              type: "alert",
              title: "資料庫已空",
              content: "目前沒有任何資料需要刪除。",
              confirmText: "好的",
            });
            return;
          }

          const batches = [];
          let batch = writeBatch(db);
          let count = 0;
          const BATCH_SIZE = 450;

          snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
            count++;
            if (count % BATCH_SIZE === 0) {
              batches.push(batch);
              batch = writeBatch(db);
            }
          });

          if (count % BATCH_SIZE !== 0) {
            batches.push(batch);
          }

          await Promise.all(batches.map((b) => b.commit()));

          setDialogConfig({
            show: true,
            type: "alert",
            title: "重置成功",
            content: "✅ 資料庫已完全清空，現在是全新狀態。",
            confirmText: "太棒了",
          });
        } catch (error) {
          console.error("Reset failed", error);
          setDialogConfig({
            show: true,
            type: "alert",
            title: "重置失敗",
            content: "刪除過程中發生錯誤，請稍後再試。",
            confirmText: "關閉",
          });
        } finally {
          setResetting(false);
        }
      },
    });
  };

  // --- NEW: Export Backup Function ---
  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const q = query(
        collection(db, "artifacts", appId, "users", user.uid, "transactions")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        // Exclude ID to allow clean import later (new IDs will be generated)
        const { id, ...rest } = doc.data();
        return rest;
      });

      const fileName = `mumu_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDialogConfig({
        show: true,
        type: "alert",
        title: "備份成功",
        content: `✅ 檔案已下載至您的電腦：\n${fileName}\n\n請妥善保存此檔案。`,
        confirmText: "好的",
      });
    } catch (error) {
      console.error("Export failed", error);
      setDialogConfig({
        show: true,
        type: "alert",
        title: "匯出失敗",
        content: "備份過程中發生錯誤，請稍後再試。",
        confirmText: "關閉",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file) => {
    if (!user) return;
    setImporting(true);

    // NEW: Handle JSON Restore
    if (file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target.result);
          if (!Array.isArray(json)) throw new Error("Invalid format");

          let batch = writeBatch(db);
          let count = 0;
          let batchSize = 450;
          let batches = [];

          for (const item of json) {
            const ref = doc(
              collection(
                db,
                "artifacts",
                appId,
                "users",
                user.uid,
                "transactions"
              )
            );
            // Ensure legacy data has required fields
            if (!item.amount && !item.date) continue;

            batch.set(ref, {
              ...item,
              restored: true,
              restoredAt: serverTimestamp(),
            });
            count++;
            if (count % batchSize === 0) {
              batches.push(batch);
              batch = writeBatch(db);
            }
          }
          if (count % batchSize !== 0) batches.push(batch);
          await Promise.all(batches.map((b) => b.commit()));

          setDialogConfig({
            show: true,
            type: "alert",
            title: "還原成功",
            content: `✅ 成功還原 ${count} 筆備份資料！`,
            confirmText: "太棒了",
          });
        } catch (err) {
          setDialogConfig({
            show: true,
            type: "alert",
            title: "錯誤",
            content: "無效的備份檔案格式",
          });
        } finally {
          setImporting(false);
        }
      };
      reader.readAsText(file);
      return;
    }

    // ORIGINAL: Handle CSV Import
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target.result;
        let text = "";

        const decoderUtf8 = new TextDecoder("utf-8");
        const textUtf8 = decoderUtf8.decode(buffer);

        if (textUtf8.includes("收付日") || textUtf8.includes("傳票")) {
          text = textUtf8;
        } else {
          try {
            const decoderBig5 = new TextDecoder("big5");
            text = decoderBig5.decode(buffer);
          } catch (err) {
            console.error("Big5 decode failed", err);
            text = textUtf8;
          }
        }

        const rows = text.split(/\r\n|\n|\r/);
        const batchSize = 450;
        let batches = [];
        let currentBatch = writeBatch(db);
        let count = 0;
        let minDate = "9999-12-31",
          maxDate = "0000-01-01";

        let dateIdx = 8;
        for (let i = 0; i < Math.min(rows.length, 20); i++) {
          const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          const dateCol = cols[dateIdx]
            ? cols[dateIdx].replace(/"/g, "").trim()
            : "";
          if (/\d{3}\/\d{2}\/\d{2}/.test(dateCol)) {
            break;
          }
        }

        let voucherIdx = dateIdx - 1;

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue;

          const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

          const voucherId = cols[voucherIdx]
            ? cols[voucherIdx].replace(/"/g, "").trim()
            : "";
          if (!voucherId || voucherId === "0" || voucherId === "#REF!") {
            continue;
          }

          let dateRaw = cols[dateIdx]
            ? cols[dateIdx].replace(/"/g, "").trim()
            : "";
          if (!/\d{3}\/\d{2}\/\d{2}/.test(dateRaw)) continue;

          let date = "";
          const parts = dateRaw.split("/");
          if (parts.length === 3) {
            let year = parseInt(parts[0]);
            if (isNaN(year)) continue;
            if (year < 1911) year += 1911;
            date = `${year}-${parts[1].padStart(2, "0")}-${parts[2].padStart(
              2,
              "0"
            )}`;
          } else {
            continue;
          }

          if (date < minDate) minDate = date;
          if (date > maxDate) maxDate = date;

          const clean = (s) => parseFloat((s || "").replace(/["$,]/g, "")) || 0;

          const income = clean(cols[dateIdx + 4]);
          const expense = clean(cols[dateIdx + 3]);

          if (income === 0 && expense === 0) continue;

          const ref = doc(
            collection(
              db,
              "artifacts",
              appId,
              "users",
              user.uid,
              "transactions"
            )
          );

          const safeVal = (offset) =>
            (cols[dateIdx + offset] || "").replace(/"/g, "").trim();

          currentBatch.set(ref, {
            date,
            type: income > 0 ? "income" : "expense",
            account: safeVal(2) || "未知帳戶",
            categoryCode: safeVal(5),
            categoryName: getCategoryNameByCode(safeVal(5)) || "雜項",
            subcategory: safeVal(7) || safeVal(1),
            amount: income > 0 ? income : expense,
            memo: safeVal(1),
            createdAt: serverTimestamp(),
            imported: true,
          });

          count++;
          if (count % batchSize === 0) {
            batches.push(currentBatch);
            currentBatch = writeBatch(db);
          }
        }
        if (count % batchSize !== 0) batches.push(currentBatch);

        if (count > 0) {
          await Promise.all(batches.map((b) => b.commit()));
          setDateRange({ start: minDate, end: maxDate });
          setActiveTab("analysis");
          setDialogConfig({
            show: true,
            type: "alert",
            title: "匯入成功",
            content: `✅ 成功匯入 ${count} 筆資料\n📅 資料日期範圍：${minDate} ~ ${maxDate}\n\n系統已自動切換至該月份，並跳轉至「收支分析」頁面。`,
            confirmText: "太棒了",
          });
        } else {
          setDialogConfig({
            show: true,
            type: "alert",
            title: "匯入失敗",
            content: `❌ 找不到有效資料。\n\n可能原因：\n1. 檔案格式不符\n2. 所有資料被視為無效（傳票編號為 0 或 #REF!）\n3. 編碼錯誤（已嘗試自動修正）`,
            confirmText: "關閉",
          });
        }
      } catch (err) {
        console.error("Critical Import Error:", err);
        setDialogConfig({
          show: true,
          type: "alert",
          title: "發生錯誤",
          content: `⛔️ 匯入過程中發生嚴重錯誤：\n${err.message}`,
          confirmText: "關閉",
        });
      } finally {
        setImporting(false);
      }
    };
    reader.onerror = () => {
      setImporting(false);
      setDialogConfig({
        show: true,
        type: "alert",
        title: "錯誤",
        content: "無法讀取檔案",
      });
    };
    reader.readAsArrayBuffer(file);
  };

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onImport={handleImport}
        onExport={handleExport}
        onReset={handleReset}
        importing={importing}
        exporting={exporting}
        resetting={resetting}
        userEmail={user.email}
      />
      <main className="flex-1 overflow-y-auto h-screen relative">
        {activeTab === "dashboard" && (
          <Dashboard
            transactions={transactions}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        )}
        {activeTab === "entry" && (
          <EntryForm
            user={user}
            appId={appId}
            initialData={editingTransaction}
            onCancelEdit={() => setEditingTransaction(null)}
            transactions={transactions}
          />
        )}
        {activeTab === "ledger" && (
          <Ledger
            transactions={transactions}
            onDelete={handleDelete}
            onEdit={(t) => {
              setEditingTransaction(t);
              setActiveTab("entry");
            }}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        )}
        {activeTab === "analysis" && (
          <Analysis
            transactions={transactions}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        )}

        <Dialog
          config={dialogConfig}
          onClose={() => setDialogConfig({ ...dialogConfig, show: false })}
        />
      </main>
    </div>
  );
}
