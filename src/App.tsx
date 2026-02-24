import { useState, useMemo, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, ReferenceLine
} from "recharts";

/* ─────────────── i18n ─────────────── */
const i18n = {
  ko: {
    title: "Money Geben",
    subtitle: "돈 모으는 재미, 여기서 시작 🚀",
    currentAssets: "🏦 현재 자산",
    cash: "현금 (통장 잔고)",
    savings: "저축 (적금/예금)",
    stocks: "투자 (ETF/주식)",
    monthlySettings: "📆 월간 설정",
    monthlySaving: "월 저축액",
    monthlyInvest: "월 투자액",
    rates: "📊 수익률",
    savingsRate: "저축 이자율 (연)",
    stockRate: "투자 기대 수익률 (연)",
    goal: "🎯 목표 금액",
    goalLabel: "목표",
    customGoal: "직접 입력",
    growthChart: "📈 자산 성장 그래프",
    assetComposition: "🧩 현재 자산 구성",
    milestone: "🗓 마일스톤 타임라인",
    stats: { timeLeft: "달성까지", targetYear: "예상 연도", monthlyTotal: "월 총 투입", vGoal: "목표 대비" },
    months: "개월",
    years: "년",
    monthsAfter: "개월 후",
    achieved: "달성 완료!",
    approx: "약",
    after: "후",
    over600: "600개월+",
    currentAsset: "현재 자산",
    remaining: "목표까지",
    goalDone: "달성! 🎉",
    expectedDate: "예상 달성일",
    cashLabel: "현금",
    savingsLabel: "저축",
    stocksLabel: "투자",
    savingsPlus: "저축",
    investPlus: "투자",
    footer: "Made with 💜 for money lovers · Money Geben",
    now: "Now",
    darkMode: "다크모드",
    scenarioCompare: "🔀 시나리오 비교",
    scenarioDesc: "공격적 투자 vs 안정적 저축 비교",
    aggressive: "🔥 공격적",
    conservative: "🛡 안정적",
    aggressiveDesc: "투자 비중 ↑",
    conservativeDesc: "저축 비중 ↑",
    diffLabel: "차이",
    monthsUnit: "개월",
    fireCalc: "🔥 FIRE 계산기",
    fireDesc: "경제적 자유까지 얼마나?",
    monthlyExpense: "월 지출액",
    fireTarget: "FIRE 목표",
    fireYears: "FIRE까지",
    fireAge: "달성 나이",
    currentAge: "현재 나이",
    encouragements: [
      { threshold: 0, emoji: "🌱", msg: "씨앗을 심었어! 시작이 반이야!" },
      { threshold: 10, emoji: "🌿", msg: "슬슬 자라나고 있어~ 계속 가자!" },
      { threshold: 25, emoji: "💪", msg: "벌써 1/4 왔다! 대단해!" },
      { threshold: 40, emoji: "🔥", msg: "불타오르는 중! 멈추지 마!" },
      { threshold: 50, emoji: "🎯", msg: "반 왔다!! 절반 돌파!!" },
      { threshold: 60, emoji: "🚀", msg: "이제 가속 붙는다~!" },
      { threshold: 75, emoji: "⭐", msg: "3/4 달성! 거의 다 왔어!" },
      { threshold: 90, emoji: "🏆", msg: "목표가 코앞이야!!!" },
      { threshold: 100, emoji: "🎉", msg: "목표 달성!! 축하해!!! 🥳🎊" },
    ],
  },
  en: {
    title: "Money Geben",
    subtitle: "Start your saving journey here 🚀",
    currentAssets: "🏦 Current Assets",
    cash: "Cash (Checking)",
    savings: "Savings (Deposits)",
    stocks: "Investments (ETF/Stocks)",
    monthlySettings: "📆 Monthly Settings",
    monthlySaving: "Monthly Savings",
    monthlyInvest: "Monthly Investment",
    rates: "📊 Returns",
    savingsRate: "Savings Interest (Annual)",
    stockRate: "Expected Investment Return (Annual)",
    goal: "🎯 Goal Amount",
    goalLabel: "Goal",
    customGoal: "Custom",
    growthChart: "📈 Asset Growth Chart",
    assetComposition: "🧩 Current Composition",
    milestone: "🗓 Milestone Timeline",
    stats: { timeLeft: "Time Left", targetYear: "Target Year", monthlyTotal: "Monthly Input", vGoal: "vs Goal" },
    months: " months",
    years: " yrs",
    monthsAfter: " months later",
    achieved: "Achieved!",
    approx: "~",
    after: "later",
    over600: "600+ months",
    currentAsset: "Current",
    remaining: "Remaining",
    goalDone: "Done! 🎉",
    expectedDate: "Expected Date",
    cashLabel: "Cash",
    savingsLabel: "Savings",
    stocksLabel: "Investments",
    savingsPlus: "Sav",
    investPlus: "Inv",
    footer: "Made with 💜 for money lovers · Money Geben",
    now: "Now",
    darkMode: "Dark Mode",
    scenarioCompare: "🔀 Scenario Compare",
    scenarioDesc: "Aggressive invest vs Safe savings",
    aggressive: "🔥 Aggressive",
    conservative: "🛡 Conservative",
    aggressiveDesc: "More investing",
    conservativeDesc: "More saving",
    diffLabel: "Diff",
    monthsUnit: "mo",
    fireCalc: "🔥 FIRE Calculator",
    fireDesc: "How long until financial freedom?",
    monthlyExpense: "Monthly Expense",
    fireTarget: "FIRE Target",
    fireYears: "Years to FIRE",
    fireAge: "FIRE Age",
    currentAge: "Current Age",
    encouragements: [
      { threshold: 0, emoji: "🌱", msg: "Seed planted! The journey begins!" },
      { threshold: 10, emoji: "🌿", msg: "Growing nicely~ Keep going!" },
      { threshold: 25, emoji: "💪", msg: "Quarter done! Amazing!" },
      { threshold: 40, emoji: "🔥", msg: "On fire! Don't stop!" },
      { threshold: 50, emoji: "🎯", msg: "Halfway there!!" },
      { threshold: 60, emoji: "🚀", msg: "Accelerating now~!" },
      { threshold: 75, emoji: "⭐", msg: "3/4 done! Almost there!" },
      { threshold: 90, emoji: "🏆", msg: "Goal is RIGHT THERE!!!" },
      { threshold: 100, emoji: "🎉", msg: "GOAL ACHIEVED!! Congrats!!! 🥳🎊" },
    ],
  },
};

/* ─────────────── Currency ─────────────── */
const currencies = {
  EUR: { symbol: "€", locale: "de-DE", code: "EUR", presets: [30000, 50000, 100000, 200000], maxGoal: 500000, maxMonthly: 5000, maxInvest: 3000, stepGoal: 1000 },
  KRW: { symbol: "₩", locale: "ko-KR", code: "KRW", presets: [30000000, 50000000, 100000000, 200000000], maxGoal: 500000000, maxMonthly: 5000000, maxInvest: 3000000, stepGoal: 1000000 },
};

/* ─────────────── Themes ─────────────── */
const themes = {
  light: {
    bg: "#FFF8F0", card: "#FFFFFF", text: "#2D3436", subtext: "#999",
    muted: "#aaa", border: "#F0F0F0", trackBg: "#F0F0F0",
    cardShadow: "0 4px 20px rgba(0,0,0,0.06)",
    cardHoverShadow: "0 12px 40px rgba(0,0,0,0.12)",
    tooltipBg: "white",
  },
  dark: {
    bg: "#1A1A2E", card: "#16213E", text: "#EAEAEA", subtext: "#888",
    muted: "#666", border: "#2A2A4A", trackBg: "#2A2A4A",
    cardShadow: "0 4px 20px rgba(0,0,0,0.3)",
    cardHoverShadow: "0 12px 40px rgba(0,0,0,0.5)",
    tooltipBg: "#16213E",
  },
};

const A = {
  cash: "#FF6B9D", savings: "#00D2FF", stocks: "#FFD93D",
  goal: "#6C5CE7", green: "#55EFC4", pink: "#FD79A8", purple: "#A29BFE",
};

/* ─────────────── Simulator ─────────────── */
function simulate({ cash, savings, stocks, monthlySaving, monthlyInvest, savingsRate, stockRate, target }) {
  let c = cash, s = savings, st = stocks, months = 0;
  const history = [{ month: 0, total: c + s + st, cash: c, savings: s, stocks: st }];
  while (c + s + st < target && months < 600) {
    months++;
    s = s * (1 + savingsRate / 100 / 12) + monthlySaving;
    st = st * (1 + stockRate / 100 / 12) + monthlyInvest;
    history.push({ month: months, total: c + s + st, cash: c, savings: s, stocks: st });
  }
  return { months, history };
}

/* ─────────────── Sub-Components ─────────────── */
function SliderInput({ label, value, onChange, min, max, step, color, suffix = "", emoji, theme }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{emoji} {label}</label>
        <span style={{
          fontSize: 15, fontWeight: 800, color, background: color + "18",
          padding: "2px 12px", borderRadius: 20,
        }}>{typeof value === "number" ? value.toLocaleString() : value}{suffix}</span>
      </div>
      <div style={{ position: "relative", height: 8, borderRadius: 10, background: theme.trackBg }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 10, width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`, transition: "width 0.15s",
        }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{
            position: "absolute", top: -6, left: 0, width: "100%", height: 20,
            appearance: "none", background: "transparent", cursor: "pointer", zIndex: 2,
          }} />
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, emoji, color, theme, symbol }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: theme.muted, display: "block", marginBottom: 4 }}>
        {emoji} {label}
      </label>
      <div style={{ position: "relative" }}>
        <input type="number" value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "10px 50px 10px 14px", borderRadius: 14,
            border: `2px solid ${focused ? color : color + "44"}`, fontSize: 16, fontWeight: 700,
            color: theme.text, background: theme.card,
            outline: "none", boxSizing: "border-box", transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
            boxShadow: focused ? `0 0 0 4px ${color}22` : "none",
          }} />
        <span style={{
          position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
          fontSize: 14, fontWeight: 700, color,
        }}>{symbol}</span>
      </div>
    </div>
  );
}

function TogglePill({ options, value, onChange, theme }) {
  return (
    <div style={{
      display: "inline-flex", borderRadius: 30, overflow: "hidden",
      border: `2px solid ${theme.border}`, background: theme.card,
    }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          padding: "6px 16px", border: "none", cursor: "pointer",
          background: value === o.value ? A.goal : "transparent",
          color: value === o.value ? "white" : theme.subtext,
          fontWeight: 700, fontSize: 13, transition: "all 0.3s", fontFamily: "inherit",
        }}>{o.label}</button>
      ))}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, t, theme }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: theme.tooltipBg, borderRadius: 16, padding: "12px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "none",
    }}>
      <p style={{ fontWeight: 800, fontSize: 13, color: theme.muted, margin: 0 }}>{label}{t.monthsAfter}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700, fontSize: 14, margin: "4px 0 0" }}>
          {p.name}: {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const PIE_COLORS = [A.cash, A.savings, A.stocks];

/* ─────────────── MAIN ─────────────── */
export default function App() {
  const [lang, setLang] = useState("ko");
  const [cur, setCur] = useState("EUR");
  const [dark, setDark] = useState(false);
  const [cash, setCash] = useState(500);
  const [savings, setSavings] = useState(12751);
  const [stocks, setStocks] = useState(7041);
  const [monthlySaving, setMonthlySaving] = useState(1300);
  const [monthlyInvest, setMonthlyInvest] = useState(120);
  const [savingsRate, setSavingsRate] = useState(2.0);
  const [stockRate, setStockRate] = useState(7.0);
  const [target, setTarget] = useState(30000);
  const [customGoalInput, setCustomGoalInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [monthlyExpense, setMonthlyExpense] = useState(1500);
  const [currentAge, setCurrentAge] = useState(30);
  const [animReady, setAnimReady] = useState(false);

  useEffect(() => { setTimeout(() => setAnimReady(true), 100); }, []);

  const t = i18n[lang];
  const cc = currencies[cur];
  const theme = themes[dark ? "dark" : "light"];

  const fmt = useCallback((n) =>
    new Intl.NumberFormat(cc.locale, { style: "currency", currency: cc.code, maximumFractionDigits: 0 }).format(n),
    [cc]);

  const handleCurrencyChange = (newCur) => {
    if (newCur === cur) return;
    const f = newCur === "KRW" ? 1500 : 1 / 1500;
    setCash(Math.round(cash * f)); setSavings(Math.round(savings * f));
    setStocks(Math.round(stocks * f)); setMonthlySaving(Math.round(monthlySaving * f));
    setMonthlyInvest(Math.round(monthlyInvest * f)); setTarget(Math.round(target * f));
    setMonthlyExpense(Math.round(monthlyExpense * f)); setCur(newCur);
  };

  const totalNow = cash + savings + stocks;
  const progress = Math.min((totalNow / target) * 100, 100);
  const enc = (() => { let r = t.encouragements[0]; for (const e of t.encouragements) if (progress >= e.threshold) r = e; return r; })();

  const { months, history } = useMemo(() =>
    simulate({ cash, savings, stocks, monthlySaving, monthlyInvest, savingsRate, stockRate, target }),
    [cash, savings, stocks, monthlySaving, monthlyInvest, savingsRate, stockRate, target]);

  const chartData = useMemo(() => {
    const step = Math.max(1, Math.floor(history.length / 80));
    return history.filter((_, i) => i % step === 0 || i === history.length - 1);
  }, [history]);

  const pieData = [
    { name: t.cashLabel, value: cash },
    { name: t.savingsLabel, value: savings },
    { name: t.stocksLabel, value: stocks },
  ].filter(d => d.value > 0);

  const agg = useMemo(() => simulate({
    cash, savings: savings * 0.3, stocks: stocks + savings * 0.7,
    monthlySaving: monthlySaving * 0.3, monthlyInvest: monthlyInvest + monthlySaving * 0.7,
    savingsRate, stockRate, target
  }), [cash, savings, stocks, monthlySaving, monthlyInvest, savingsRate, stockRate, target]);

  const cons = useMemo(() => simulate({
    cash, savings: savings + stocks * 0.5, stocks: stocks * 0.5,
    monthlySaving: monthlySaving + monthlyInvest * 0.5, monthlyInvest: monthlyInvest * 0.5,
    savingsRate, stockRate, target
  }), [cash, savings, stocks, monthlySaving, monthlyInvest, savingsRate, stockRate, target]);

  const fireTarget = monthlyExpense * 12 * 25;
  const fireSim = useMemo(() => simulate({
    cash, savings, stocks, monthlySaving, monthlyInvest, savingsRate, stockRate, target: fireTarget
  }), [cash, savings, stocks, monthlySaving, monthlyInvest, savingsRate, stockRate, fireTarget]);

  useEffect(() => {
    if (progress >= 100 && !showConfetti) setShowConfetti(true);
    if (progress < 100) setShowConfetti(false);
  }, [progress]);

  const monthsToDate = (m) => {
    const d = new Date(); d.setMonth(d.getMonth() + m);
    return d.toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", { year: "numeric", month: "long" });
  };
  const yearMonth = months < 600 ? monthsToDate(months) : null;

  const applyCustomGoal = () => {
    const v = parseFloat(customGoalInput.replace(/[^0-9.]/g, ""));
    if (v > 0) { setTarget(v); setShowCustom(false); setCustomGoalInput(""); }
  };

  const cStyle = (delay = 0) => ({
    background: theme.card, borderRadius: 24, padding: 24,
    boxShadow: theme.cardShadow, transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
    opacity: animReady ? 1 : 0, transform: animReady ? "translateY(0)" : "translateY(30px)",
    transitionDelay: `${delay}ms`,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${theme.bg};transition:background 0.5s}
        @keyframes floatUp{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(-120vh) rotate(720deg);opacity:0}}
        @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.05)}70%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
        @keyframes slideL{0%{transform:translateX(-40px);opacity:0}100%{transform:translateX(0);opacity:1}}
        @keyframes slideR{0%{transform:translateX(40px);opacity:0}100%{transform:translateX(0);opacity:1}}
        @keyframes popIn{0%{transform:scale(0)}60%{transform:scale(1.1)}100%{transform:scale(1)}}
        @keyframes rainbowBorder{0%{border-color:${A.cash}}25%{border-color:${A.savings}}50%{border-color:${A.stocks}}75%{border-color:${A.goal}}100%{border-color:${A.cash}}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .hc:hover{transform:translateY(-4px)!important;box-shadow:${theme.cardHoverShadow}!important}
        .hg:hover{transform:scale(1.05)!important}
        input[type="range"]::-webkit-slider-thumb{appearance:none;width:24px;height:24px;border-radius:50%;background:white;border:3px solid currentColor;box-shadow:0 2px 10px rgba(0,0,0,0.2);cursor:pointer;transition:transform 0.2s}
        input[type="range"]::-webkit-slider-thumb:hover{transform:scale(1.3)}
        input[type="number"]::-webkit-inner-spin-button{opacity:1}
        ::selection{background:${A.goal}44}
        .mr:hover{transform:translateX(8px)}
        .sc:hover{transform:scale(1.06) translateY(-4px)}
        .pb:hover{transform:scale(1.08);box-shadow:0 4px 16px rgba(0,0,0,0.15)}
        .pb:active{transform:scale(0.95)}
        .sb{transition:width 0.8s cubic-bezier(.4,0,.2,1)}
        @media(max-width:700px){.grid2{grid-template-columns:1fr!important}}
      `}</style>

      <div style={{
        maxWidth: 960, margin: "0 auto", padding: "20px 16px 60px",
        fontFamily: "'Nunito', sans-serif", color: theme.text,
      }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 28, animation: "bounceIn 0.6s ease-out" }}>
          <div style={{ fontSize: 52, marginBottom: 4, animation: "float 3s ease-in-out infinite" }}>💰</div>
          <h1 style={{
            fontFamily: "'Baloo 2', cursive", fontSize: 36, fontWeight: 800,
            background: "linear-gradient(135deg, #FF6B9D, #6C5CE7, #00D2FF, #FFD93D)",
            backgroundSize: "300% 100%", animation: "shimmer 4s linear infinite",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4,
          }}>{t.title}</h1>
          <p style={{ fontSize: 14, color: theme.subtext, fontWeight: 600 }}>{t.subtitle}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16, flexWrap: "wrap", animation: "slideR 0.5s ease-out 0.3s both" }}>
            <TogglePill options={[{ value: "ko", label: "🇰🇷 한국어" }, { value: "en", label: "🇬🇧 English" }]} value={lang} onChange={setLang} theme={theme} />
            <TogglePill options={[{ value: "EUR", label: "€ EUR" }, { value: "KRW", label: "₩ KRW" }]} value={cur} onChange={handleCurrencyChange} theme={theme} />
            <button onClick={() => setDark(!dark)} style={{
              padding: "6px 16px", borderRadius: 30, border: `2px solid ${theme.border}`,
              background: dark ? A.goal : theme.card, color: dark ? "white" : theme.subtext,
              fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s",
            }}>{dark ? "☀️" : "🌙"} {t.darkMode}</button>
          </div>
        </div>

        {/* PROGRESS HERO */}
        <div className="hc" style={{
          ...cStyle(0), marginBottom: 20, textAlign: "center", position: "relative", overflow: "hidden",
          border: progress >= 100 ? `3px solid ${A.green}` : "3px solid transparent",
          animation: progress >= 100 ? "rainbowBorder 3s linear infinite, pulse 2s infinite" : undefined,
        }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 150, height: 150, borderRadius: "50%", background: `${A.cash}11`, animation: "float 4s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: "50%", background: `${A.savings}11`, animation: "float 5s ease-in-out infinite 1s" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 44, marginBottom: 4, animation: "wiggle 1.5s ease-in-out infinite" }}>{enc.emoji}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.subtext, marginBottom: 12 }}>{enc.msg}</div>
            <div style={{
              height: 32, borderRadius: 20, background: theme.trackBg, overflow: "hidden",
              position: "relative", margin: "0 auto 16px", maxWidth: 520,
              boxShadow: "inset 0 2px 6px rgba(0,0,0,0.08)",
            }}>
              <div style={{
                height: "100%", borderRadius: 20, width: `${Math.min(progress, 100)}%`,
                background: progress >= 100
                  ? "linear-gradient(90deg, #FFD93D, #FF6B9D, #6C5CE7, #00D2FF, #55EFC4)"
                  : `linear-gradient(90deg, ${A.cash}, ${A.goal}, ${A.savings})`,
                backgroundSize: progress >= 100 ? "300% 100%" : "100%",
                animation: progress >= 100 ? "shimmer 2s linear infinite" : undefined,
                transition: "width 1s cubic-bezier(.4,0,.2,1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 2px 12px ${A.goal}44`,
              }}>
                {progress > 12 && <span style={{ color: "white", fontWeight: 900, fontSize: 14, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>{progress.toFixed(1)}%</span>}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 36, flexWrap: "wrap" }}>
              {[
                { label: t.currentAsset, val: fmt(totalNow), color: A.cash },
                { label: t.remaining, val: target > totalNow ? fmt(target - totalNow) : t.goalDone, color: A.goal },
                { label: t.expectedDate, val: yearMonth ?? t.over600, color: A.savings },
              ].map((item, i) => (
                <div key={i} style={{ animation: `popIn 0.4s ease-out ${0.2 + i * 0.15}s both` }}>
                  <div style={{ fontSize: 12, color: theme.muted, fontWeight: 700 }}>{item.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: item.color, fontFamily: "'Baloo 2', cursive" }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="hc" style={cStyle(100)}>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, fontWeight: 800, color: A.cash, marginBottom: 16 }}>{t.currentAssets}</div>
              <NumberInput label={t.cash} value={cash} onChange={setCash} emoji="💵" color={A.cash} theme={theme} symbol={cc.symbol} />
              <NumberInput label={t.savings} value={savings} onChange={setSavings} emoji="🏦" color={A.savings} theme={theme} symbol={cc.symbol} />
              <NumberInput label={t.stocks} value={stocks} onChange={setStocks} emoji="📈" color={A.stocks} theme={theme} symbol={cc.symbol} />
            </div>
            <div className="hc" style={cStyle(200)}>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, fontWeight: 800, color: A.savings, marginBottom: 16 }}>{t.monthlySettings}</div>
              <SliderInput label={t.monthlySaving} value={monthlySaving} onChange={setMonthlySaving}
                min={0} max={cc.maxMonthly} step={cur === "KRW" ? 50000 : 50} color={A.savings} suffix={cc.symbol} emoji="💎" theme={theme} />
              <SliderInput label={t.monthlyInvest} value={monthlyInvest} onChange={setMonthlyInvest}
                min={0} max={cc.maxInvest} step={cur === "KRW" ? 10000 : 10} color={A.stocks} suffix={cc.symbol} emoji="🎯" theme={theme} />
            </div>
            <div className="hc" style={cStyle(300)}>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, fontWeight: 800, color: A.stocks, marginBottom: 16 }}>{t.rates}</div>
              <SliderInput label={t.savingsRate} value={savingsRate} onChange={setSavingsRate}
                min={0} max={10} step={0.1} color={A.savings} suffix="%" emoji="🏦" theme={theme} />
              <SliderInput label={t.stockRate} value={stockRate} onChange={setStockRate}
                min={-10} max={30} step={0.5} color={A.stocks} suffix="%" emoji="📈" theme={theme} />
            </div>
            <div className="hc" style={{ ...cStyle(400), border: `2px solid ${A.goal}22` }}>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, fontWeight: 800, color: A.goal, marginBottom: 16 }}>{t.goal}</div>
              <SliderInput label={t.goalLabel} value={target} onChange={setTarget}
                min={cur === "KRW" ? 1000000 : 1000} max={cc.maxGoal} step={cc.stepGoal}
                color={A.goal} suffix={cc.symbol} emoji="🏁" theme={theme} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                {cc.presets.map(g => (
                  <button key={g} className="pb" onClick={() => setTarget(g)} style={{
                    padding: "7px 16px", borderRadius: 20, border: "none",
                    background: target === g ? `linear-gradient(135deg, ${A.goal}, ${A.purple})` : theme.trackBg,
                    color: target === g ? "white" : theme.subtext,
                    fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.25s",
                  }}>{fmt(g)}</button>
                ))}
                <button className="pb" onClick={() => setShowCustom(!showCustom)} style={{
                  padding: "7px 16px", borderRadius: 20, border: `2px dashed ${A.goal}66`,
                  background: "transparent", color: A.goal, fontWeight: 700, fontSize: 12,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.25s",
                }}>✏️ {t.customGoal}</button>
              </div>
              {showCustom && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, animation: "popIn 0.3s ease-out" }}>
                  <input type="number" value={customGoalInput} onChange={e => setCustomGoalInput(e.target.value)}
                    placeholder={cur === "KRW" ? "50000000" : "75000"}
                    onKeyDown={e => e.key === "Enter" && applyCustomGoal()}
                    style={{
                      flex: 1, padding: "8px 14px", borderRadius: 14,
                      border: `2px solid ${A.goal}44`, fontSize: 15, fontWeight: 700,
                      color: theme.text, background: theme.card, outline: "none", fontFamily: "inherit",
                    }} />
                  <button onClick={applyCustomGoal} style={{
                    padding: "8px 20px", borderRadius: 14, border: "none",
                    background: `linear-gradient(135deg, ${A.goal}, ${A.pink})`,
                    color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                  }}>✓</button>
                </div>
              )}
            </div>
            <div className="hc" style={{ ...cStyle(500), background: dark ? "#1E1E3A" : "linear-gradient(135deg, #FFF5F5, #FFF8E1)" }}>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, fontWeight: 800, color: "#FF6348", marginBottom: 4 }}>{t.fireCalc}</div>
              <p style={{ fontSize: 12, color: theme.muted, fontWeight: 600, marginBottom: 14 }}>{t.fireDesc}</p>
              <SliderInput label={t.monthlyExpense} value={monthlyExpense} onChange={setMonthlyExpense}
                min={0} max={cc.maxMonthly} step={cur === "KRW" ? 50000 : 50} color="#FF6348" suffix={cc.symbol} emoji="🛒" theme={theme} />
              <SliderInput label={t.currentAge} value={currentAge} onChange={setCurrentAge}
                min={18} max={65} step={1} color={A.purple} suffix="" emoji="🎂" theme={theme} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
                {[
                  { emoji: "🎯", label: t.fireTarget, val: fmt(fireTarget), color: "#FF6348" },
                  { emoji: "⏳", label: t.fireYears, val: fireSim.months < 600 ? `${(fireSim.months / 12).toFixed(1)}${t.years}` : "50+", color: A.goal },
                  { emoji: "🧓", label: t.fireAge, val: fireSim.months < 600 ? `${currentAge + Math.ceil(fireSim.months / 12)}` : "—", color: A.green },
                ].map((s, i) => (
                  <div key={i} style={{
                    textAlign: "center", padding: 10, borderRadius: 16,
                    background: theme.card, border: `1px solid ${theme.border}`,
                    animation: `popIn 0.3s ease-out ${0.1 * i}s both`,
                  }}>
                    <div style={{ fontSize: 22 }}>{s.emoji}</div>
                    <div style={{ fontSize: 10, color: theme.muted, fontWeight: 700 }}>{s.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: s.color, fontFamily: "'Baloo 2', cursive" }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="hc" style={{ ...cStyle(150), minHeight: 350 }}>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, fontWeight: 800, color: A.green, marginBottom: 16 }}>{t.growthChart}</div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    {["cash", "savings", "stocks"].map(k => (
                      <linearGradient key={k} id={`g_${k}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={A[k]} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={A[k]} stopOpacity={0.03} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: theme.muted, fontWeight: 600 }}
                    tickFormatter={v => v === 0 ? t.now : `${v}m`}
                    interval={Math.max(0, Math.floor(chartData.length / 6) - 1)} />
                  <YAxis tick={{ fontSize: 11, fill: theme.muted, fontWeight: 600 }}
                    tickFormatter={v => cur === "KRW" ? `${(v / 10000).toFixed(0)}만` : `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip t={t} theme={theme} />} />
                  <ReferenceLine y={target} stroke={A.goal} strokeDasharray="8 4" strokeWidth={2} label={{ value: "🎯 Goal", position: "right", fill: A.goal, fontSize: 11, fontWeight: 700 }} />
                  <Area type="monotone" dataKey="stocks" name={t.stocksLabel} stackId="1" stroke={A.stocks} fill="url(#g_stocks)" strokeWidth={2.5} animationDuration={1200} />
                  <Area type="monotone" dataKey="savings" name={t.savingsLabel} stackId="1" stroke={A.savings} fill="url(#g_savings)" strokeWidth={2.5} animationDuration={1200} animationBegin={200} />
                  <Area type="monotone" dataKey="cash" name={t.cashLabel} stackId="1" stroke={A.cash} fill="url(#g_cash)" strokeWidth={2.5} animationDuration={1200} animationBegin={400} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="hc" style={cStyle(250)}>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, fontWeight: 800, color: A.pink, marginBottom: 12 }}>{t.assetComposition}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28 }}>
                <div style={{ position: "relative", width: 170, height: 170 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none" animationBegin={200} animationDuration={800}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie></PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: theme.muted, fontWeight: 700 }}>TOTAL</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: theme.text, fontFamily: "'Baloo 2', cursive" }}>{fmt(totalNow)}</div>
                  </div>
                </div>
                <div>
                  {pieData.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, animation: `slideR 0.4s ease-out ${0.1 * i}s both` }}>
                      <div style={{ width: 16, height: 16, borderRadius: 6, background: PIE_COLORS[i], animation: "pulse 2s infinite", animationDelay: `${i * 0.3}s` }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: theme.muted }}>{d.name}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>
                          {fmt(d.value)} <span style={{ fontSize: 11, color: theme.muted }}>({totalNow > 0 ? ((d.value / totalNow) * 100).toFixed(1) : 0}%)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { emoji: "⏰", label: t.stats.timeLeft, val: months < 600 ? `${months}${t.months}` : t.over600, color: A.cash, sub: months < 600 ? `≈ ${(months / 12).toFixed(1)}${t.years}` : "" },
                { emoji: "📅", label: t.stats.targetYear, val: months < 600 ? `${new Date(Date.now() + months * 30.44 * 86400000).getFullYear()}` : "—", color: A.savings, sub: yearMonth || "" },
                { emoji: "💰", label: t.stats.monthlyTotal, val: fmt(monthlySaving + monthlyInvest), color: A.stocks, sub: `${t.savingsPlus} + ${t.investPlus}` },
                { emoji: "🎯", label: t.stats.vGoal, val: `${progress.toFixed(1)}%`, color: A.goal, sub: `${fmt(totalNow)} / ${fmt(target)}` },
              ].map((s, i) => (
                <div key={i} className="sc hc" style={{ ...cStyle(350 + i * 60), padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 30, animation: `float 3s ease-in-out ${i * 0.4}s infinite` }}>{s.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: theme.muted, marginTop: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: "'Baloo 2', cursive" }}>{s.val}</div>
                  {s.sub && <div style={{ fontSize: 10, color: theme.muted, fontWeight: 600 }}>{s.sub}</div>}
                </div>
              ))}
            </div>

            <div className="hc" style={{ ...cStyle(550), background: dark ? "#1E1E3A" : "linear-gradient(135deg, #F0F0FF, #FFF0F5)" }}>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, fontWeight: 800, color: A.purple, marginBottom: 4 }}>{t.scenarioCompare}</div>
              <p style={{ fontSize: 12, color: theme.muted, fontWeight: 600, marginBottom: 14 }}>{t.scenarioDesc}</p>
              {[
                { label: t.aggressive, m: agg.months, color: A.cash },
                { label: `📍 ${lang === "ko" ? "현재" : "Current"}`, m: months, color: A.goal },
                { label: t.conservative, m: cons.months, color: A.savings },
              ].map((s, i) => {
                const maxM = Math.max(agg.months, months, cons.months, 1);
                return (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                      <span style={{ color: s.color }}>{s.label}</span>
                      <span style={{ color: theme.muted }}>{s.m < 600 ? `${s.m}${t.monthsUnit} (${(s.m / 12).toFixed(1)}${t.years})` : "600+"}</span>
                    </div>
                    <div style={{ height: 14, borderRadius: 10, background: theme.trackBg, overflow: "hidden" }}>
                      <div className="sb" style={{
                        height: "100%", borderRadius: 10, width: `${Math.min((s.m / maxM) * 100, 100)}%`,
                        background: `linear-gradient(90deg, ${s.color}88, ${s.color})`,
                      }} />
                    </div>
                  </div>
                );
              })}
              {agg.months < 600 && months < 600 && (
                <div style={{
                  marginTop: 8, padding: "8px 14px", borderRadius: 14,
                  background: `${A.green}15`, border: `1px solid ${A.green}33`,
                  fontSize: 12, fontWeight: 700, color: A.green, textAlign: "center",
                  animation: "popIn 0.4s ease-out",
                }}>
                  💡 {t.diffLabel}: {t.aggressive} {lang === "ko" ? "가" : "is"} {Math.abs(months - agg.months)}{t.monthsUnit} {lang === "ko" ? "빠름" : "faster"}!
                </div>
              )}
            </div>

            <div className="hc" style={{ ...cStyle(600), border: `2px solid ${A.goal}11` }}>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, fontWeight: 800, color: A.goal, marginBottom: 12 }}>{t.milestone}</div>
              {[0.25, 0.5, 0.75, 1.0].map((pct, idx) => {
                const ms = target * pct;
                const mData = history.find(h => h.total >= ms);
                const reached = totalNow >= ms;
                return (
                  <div key={pct} className="mr" style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", marginBottom: 8,
                    background: reached ? `${A.green}15` : theme.card, borderRadius: 16,
                    border: reached ? `2px solid ${A.green}66` : `2px solid ${theme.border}`,
                    transition: "all 0.3s", animation: `slideL 0.4s ease-out ${idx * 0.1}s both`,
                  }}>
                    <div style={{ fontSize: 22, animation: reached ? "wiggle 1s ease-in-out infinite" : "none" }}>{reached ? "✅" : "⬜"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>{fmt(ms)} ({(pct * 100).toFixed(0)}%)</div>
                      <div style={{ fontSize: 11, color: theme.muted, fontWeight: 600 }}>
                        {reached ? t.achieved : mData ? `${t.approx} ${mData.month}${t.months} ${t.after} (${monthsToDate(mData.month)})` : t.over600}
                      </div>
                    </div>
                    {reached && <div style={{ fontSize: 18, animation: "popIn 0.3s ease-out" }}>🎉</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 44, color: theme.muted, fontSize: 12, fontWeight: 600, animation: "bounceIn 0.6s ease-out 1s both" }}>{t.footer}</div>

        {showConfetti && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 999 }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute", left: `${Math.random() * 100}%`, top: "100%",
                fontSize: `${16 + Math.random() * 24}px`,
                animation: `floatUp ${3 + Math.random() * 5}s linear ${Math.random() * 3}s infinite`,
              }}>
                {["🎉", "🎊", "✨", "💰", "🎯", "⭐", "💎", "🏆", "🔥", "💜"][Math.floor(Math.random() * 10)]}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
