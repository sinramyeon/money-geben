import { useState, useMemo, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";

const COLORS = {
  cash: "#FF6B9D",
  savings: "#00D2FF",
  stocks: "#FFD93D",
  goal: "#6C5CE7",
  bg: "#FFF8F0",
  card: "#FFFFFF",
  text: "#2D3436",
  accent1: "#FF6B9D",
  accent2: "#00D2FF",
  accent3: "#FFD93D",
  accent4: "#A29BFE",
  accent5: "#55EFC4",
  accent6: "#FD79A8",
};

const ENCOURAGEMENTS = [
  { threshold: 0, emoji: "🌱", msg: "씨앗을 심었어! 시작이 반이야!" },
  { threshold: 10, emoji: "🌿", msg: "슬슬 자라나고 있어~ 계속 가자!" },
  { threshold: 25, emoji: "💪", msg: "벌써 1/4 왔다! 대단해!" },
  { threshold: 40, emoji: "🔥", msg: "불타오르는 중! 멈추지 마!" },
  { threshold: 50, emoji: "🎯", msg: "반 왔다!! 절반 돌파!!" },
  { threshold: 60, emoji: "🚀", msg: "이제 가속 붙는다~!" },
  { threshold: 75, emoji: "⭐", msg: "3/4 달성! 거의 다 왔어!" },
  { threshold: 90, emoji: "🏆", msg: "목표가 코앞이야!!!" },
  { threshold: 100, emoji: "🎉", msg: "목표 달성!! 축하해!!! 🥳🎊" },
];

function getEncouragement(pct) {
  let result = ENCOURAGEMENTS[0];
  for (const e of ENCOURAGEMENTS) {
    if (pct >= e.threshold) result = e;
  }
  return result;
}

function simulate({ cash, savings, stocks, monthlySaving, monthlyInvest, cashRate, savingsRate, stockRate, target }) {
  let c = cash, s = savings, st = stocks;
  let months = 0;
  const history = [{ month: 0, total: c + s + st, cash: c, savings: s, stocks: st }];

  while (c + s + st < target && months < 600) {
    months++;
    c = c + 0;
    s = s * (1 + savingsRate / 100 / 12) + monthlySaving;
    st = st * (1 + stockRate / 100 / 12) + monthlyInvest;
    history.push({ month: months, total: c + s + st, cash: c, savings: s, stocks: st });
  }
  return { months, history };
}

function formatEur(n) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function monthsToDate(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
}

function SliderInput({ label, value, onChange, min, max, step, color, prefix = "", suffix = "", emoji }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: "'Nunito', sans-serif" }}>
          {emoji} {label}
        </label>
        <span style={{
          fontSize: 15, fontWeight: 800, color: color,
          background: color + "18", padding: "2px 10px", borderRadius: 20,
          fontFamily: "'Nunito', sans-serif"
        }}>
          {prefix}{typeof value === "number" ? value.toLocaleString("de-DE") : value}{suffix}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%", height: 8, borderRadius: 10, outline: "none",
          appearance: "none", background: `linear-gradient(90deg, ${color} ${((value - min) / (max - min)) * 100}%, #E8E8E8 ${((value - min) / (max - min)) * 100}%)`,
          cursor: "pointer",
        }}
      />
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none; width: 22px; height: 22px; border-radius: 50%;
          background: ${color}; border: 3px solid white;
          box-shadow: 0 2px 8px ${color}66; cursor: pointer;
          transition: transform 0.15s; 
        }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }
      `}</style>
    </div>
  );
}

function NumberInput({ label, value, onChange, emoji, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#888", fontFamily: "'Nunito', sans-serif", display: "block", marginBottom: 4 }}>
        {emoji} {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type="number" value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          style={{
            width: "100%", padding: "10px 50px 10px 14px", borderRadius: 14,
            border: `2px solid ${color}44`, fontSize: 16, fontWeight: 700,
            fontFamily: "'Nunito', sans-serif", color: COLORS.text,
            background: color + "08", outline: "none", boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = color}
          onBlur={e => e.target.style.borderColor = color + "44"}
        />
        <span style={{
          position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
          fontSize: 14, fontWeight: 700, color: color, fontFamily: "'Nunito', sans-serif"
        }}>€</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "white", borderRadius: 16, padding: "12px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "none",
      fontFamily: "'Nunito', sans-serif"
    }}>
      <p style={{ fontWeight: 800, fontSize: 13, color: "#888", margin: 0 }}>{label}개월 후</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700, fontSize: 14, margin: "4px 0 0" }}>
          {p.name}: {formatEur(p.value)}
        </p>
      ))}
    </div>
  );
};

const PIE_COLORS = [COLORS.cash, COLORS.savings, COLORS.stocks];

export default function App() {
  const [cash, setCash] = useState(500);
  const [savings, setSavings] = useState(12751);
  const [stocks, setStocks] = useState(7041);
  const [monthlySaving, setMonthlySaving] = useState(1300);
  const [monthlyInvest, setMonthlyInvest] = useState(120);
  const [savingsRate, setSavingsRate] = useState(2.0);
  const [stockRate, setStockRate] = useState(7.0);
  const [target, setTarget] = useState(30000);
  const [showConfetti, setShowConfetti] = useState(false);

  const totalNow = cash + savings + stocks;
  const progress = Math.min((totalNow / target) * 100, 100);
  const enc = getEncouragement(progress);

  const { months, history } = useMemo(() =>
    simulate({ cash, savings, stocks, monthlySaving, monthlyInvest, cashRate: 0, savingsRate, stockRate, target }),
    [cash, savings, stocks, monthlySaving, monthlyInvest, savingsRate, stockRate, target]
  );

  const chartData = useMemo(() => {
    const step = Math.max(1, Math.floor(history.length / 60));
    return history.filter((_, i) => i % step === 0 || i === history.length - 1);
  }, [history]);

  const pieData = [
    { name: "현금", value: cash },
    { name: "저축", value: savings },
    { name: "투자", value: stocks },
  ].filter(d => d.value > 0);

  useEffect(() => {
    if (progress >= 100 && !showConfetti) setShowConfetti(true);
    if (progress < 100 && showConfetti) setShowConfetti(false);
  }, [progress]);

  const yearMonth = months < 600 ? monthsToDate(months) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${COLORS.bg}; }
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-120vh) rotate(720deg); opacity: 0; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes wiggle {
          0%,100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        .card {
          background: white; border-radius: 24px; padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .section-title {
          font-family: 'Baloo 2', cursive; font-size: 20px; font-weight: 800;
          margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { opacity: 1; }
      `}</style>

      <div style={{
        maxWidth: 900, margin: "0 auto", padding: "24px 16px 60px",
        fontFamily: "'Nunito', sans-serif", color: COLORS.text,
        position: "relative", overflow: "hidden"
      }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 32, animation: "bounceIn 0.6s ease-out" }}>
          <div style={{ fontSize: 48, marginBottom: 4 }}>💰</div>
          <h1 style={{
            fontFamily: "'Baloo 2', cursive", fontSize: 32, fontWeight: 800,
            background: "linear-gradient(135deg, #FF6B9D, #6C5CE7, #00D2FF)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 4,
          }}>
            Money Geben
          </h1>
          <p style={{ fontSize: 14, color: "#999", fontWeight: 600 }}>
            돈 모으는 재미, 여기서 시작 🚀
          </p>
        </div>

        {/* PROGRESS HERO */}
        <div className="card" style={{
          marginBottom: 20, textAlign: "center", position: "relative", overflow: "hidden",
          background: progress >= 100
            ? "linear-gradient(135deg, #FFD93D22, #55EFC422, #A29BFE22)"
            : "white",
          animation: progress >= 100 ? "pulse 2s infinite" : "none",
        }}>
          <div style={{ fontSize: 40, marginBottom: 4, animation: "wiggle 2s ease-in-out infinite" }}>
            {enc.emoji}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#888", marginBottom: 8 }}>
            {enc.msg}
          </div>

          {/* Progress bar */}
          <div style={{
            height: 28, borderRadius: 20, background: "#F0F0F0",
            overflow: "hidden", position: "relative", margin: "0 auto 12px", maxWidth: 500,
          }}>
            <div style={{
              height: "100%", borderRadius: 20, width: `${Math.min(progress, 100)}%`,
              background: progress >= 100
                ? "linear-gradient(90deg, #FFD93D, #FF6B9D, #6C5CE7, #00D2FF)"
                : `linear-gradient(90deg, ${COLORS.accent1}, ${COLORS.accent4})`,
              backgroundSize: progress >= 100 ? "200% 100%" : "100% 100%",
              animation: progress >= 100 ? "shimmer 2s linear infinite" : "none",
              transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {progress > 15 && (
                <span style={{ color: "white", fontWeight: 800, fontSize: 13, textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
                  {progress.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: "#aaa", fontWeight: 700 }}>현재 자산</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.accent1, fontFamily: "'Baloo 2', cursive" }}>
                {formatEur(totalNow)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#aaa", fontWeight: 700 }}>목표까지</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.accent4, fontFamily: "'Baloo 2', cursive" }}>
                {target > totalNow ? formatEur(target - totalNow) : "달성! 🎉"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#aaa", fontWeight: 700 }}>예상 달성일</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.accent2, fontFamily: "'Baloo 2', cursive" }}>
                {yearMonth ?? "600개월+"}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* LEFT: INPUTS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Current Assets */}
            <div className="card">
              <div className="section-title" style={{ color: COLORS.accent1 }}>
                🏦 현재 자산
              </div>
              <NumberInput label="현금 (통장 잔고)" value={cash} onChange={setCash} emoji="💵" color={COLORS.cash} />
              <NumberInput label="저축 (적금/예금)" value={savings} onChange={setSavings} emoji="🏦" color={COLORS.savings} />
              <NumberInput label="투자 (ETF/주식)" value={stocks} onChange={setStocks} emoji="📈" color={COLORS.stocks} />
            </div>

            {/* Monthly Flow */}
            <div className="card">
              <div className="section-title" style={{ color: COLORS.accent2 }}>
                📆 월간 설정
              </div>
              <SliderInput
                label="월 저축액" value={monthlySaving} onChange={setMonthlySaving}
                min={0} max={5000} step={50} color={COLORS.savings}
                prefix="" suffix="€" emoji="💎"
              />
              <SliderInput
                label="월 투자액" value={monthlyInvest} onChange={setMonthlyInvest}
                min={0} max={3000} step={10} color={COLORS.stocks}
                prefix="" suffix="€" emoji="🎯"
              />
            </div>

            {/* Rates */}
            <div className="card">
              <div className="section-title" style={{ color: COLORS.accent3 }}>
                📊 수익률
              </div>
              <SliderInput
                label="저축 이자율 (연)" value={savingsRate} onChange={setSavingsRate}
                min={0} max={10} step={0.1} color={COLORS.savings}
                suffix="%" emoji="🏦"
              />
              <SliderInput
                label="투자 기대 수익률 (연)" value={stockRate} onChange={setStockRate}
                min={-10} max={30} step={0.5} color={COLORS.stocks}
                suffix="%" emoji="📈"
              />
            </div>

            {/* Goal */}
            <div className="card">
              <div className="section-title" style={{ color: COLORS.goal }}>
                🎯 목표 금액
              </div>
              <SliderInput
                label="목표" value={target} onChange={setTarget}
                min={5000} max={500000} step={1000} color={COLORS.goal}
                prefix="" suffix="€" emoji="🏁"
              />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                {[30000, 50000, 100000, 200000].map(g => (
                  <button key={g} onClick={() => setTarget(g)} style={{
                    padding: "6px 14px", borderRadius: 20, border: "none",
                    background: target === g ? COLORS.goal : "#F0F0F0",
                    color: target === g ? "white" : "#888",
                    fontWeight: 700, fontSize: 12, cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                    transition: "all 0.2s",
                  }}>
                    {formatEur(g)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: CHARTS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Growth Chart */}
            <div className="card" style={{ minHeight: 340 }}>
              <div className="section-title" style={{ color: COLORS.accent5 }}>
                📈 자산 성장 그래프
              </div>
              <ResponsiveContainer width="100%" height={270}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.cash} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={COLORS.cash} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gradSav" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.savings} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={COLORS.savings} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gradStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.stocks} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={COLORS.stocks} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month" tick={{ fontSize: 11, fill: "#aaa", fontWeight: 600 }}
                    tickFormatter={v => v === 0 ? "Now" : `${v}m`}
                    interval={Math.max(0, Math.floor(chartData.length / 6) - 1)}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#aaa", fontWeight: 600 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="stocks" name="투자" stackId="1" stroke={COLORS.stocks} fill="url(#gradStock)" strokeWidth={2} />
                  <Area type="monotone" dataKey="savings" name="저축" stackId="1" stroke={COLORS.savings} fill="url(#gradSav)" strokeWidth={2} />
                  <Area type="monotone" dataKey="cash" name="현금" stackId="1" stroke={COLORS.cash} fill="url(#gradCash)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut */}
            <div className="card">
              <div className="section-title" style={{ color: COLORS.accent6 }}>
                🧩 현재 자산 구성
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={pieData} cx="50%" cy="50%"
                      innerRadius={50} outerRadius={80}
                      paddingAngle={4} dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div>
                  {pieData.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 14, height: 14, borderRadius: 6, background: PIE_COLORS[i], flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#888" }}>{d.name}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text }}>
                          {formatEur(d.value)}
                          <span style={{ fontSize: 11, color: "#bbb", marginLeft: 4 }}>
                            ({totalNow > 0 ? ((d.value / totalNow) * 100).toFixed(1) : 0}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { emoji: "⏰", label: "달성까지", val: months < 600 ? `${months}개월` : "600+", color: COLORS.accent1, sub: months < 600 ? `≈ ${(months / 12).toFixed(1)}년` : "" },
                { emoji: "📅", label: "예상 연도", val: months < 600 ? new Date(Date.now() + months * 30.44 * 86400000).getFullYear() + "년" : "—", color: COLORS.accent2, sub: yearMonth?.split(" ")[1] || "" },
                { emoji: "💰", label: "월 총 투입", val: formatEur(monthlySaving + monthlyInvest), color: COLORS.accent3, sub: `저축 ${formatEur(monthlySaving)} + 투자 ${formatEur(monthlyInvest)}` },
                { emoji: "🎯", label: "목표 대비", val: `${progress.toFixed(1)}%`, color: COLORS.accent4, sub: `${formatEur(totalNow)} / ${formatEur(target)}` },
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>{s.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", marginTop: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: "'Baloo 2', cursive" }}>{s.val}</div>
                  {s.sub && <div style={{ fontSize: 10, color: "#ccc", fontWeight: 600 }}>{s.sub}</div>}
                </div>
              ))}
            </div>

            {/* Monthly Milestone */}
            <div className="card" style={{ background: "linear-gradient(135deg, #6C5CE711, #FF6B9D11)" }}>
              <div className="section-title" style={{ color: COLORS.goal, fontSize: 17 }}>
                🗓 마일스톤 타임라인
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[0.25, 0.5, 0.75, 1.0].map(pct => {
                  const milestone = target * pct;
                  const mData = history.find(h => h.total >= milestone);
                  const reached = totalNow >= milestone;
                  return (
                    <div key={pct} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
                      background: reached ? "#55EFC422" : "white",
                      borderRadius: 14, border: reached ? "2px solid #55EFC4" : "2px solid #F0F0F0",
                    }}>
                      <div style={{ fontSize: 20 }}>{reached ? "✅" : "⬜"}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.text }}>
                          {formatEur(milestone)} ({(pct * 100).toFixed(0)}%)
                        </div>
                        <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>
                          {reached ? "달성 완료!" : mData ? `약 ${mData.month}개월 후 (${monthsToDate(mData.month)})` : "600개월+"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 40, color: "#ccc", fontSize: 12, fontWeight: 600 }}>
          Made with 💜 for money lovers · Money Geben
        </div>

        {/* Confetti */}
        {showConfetti && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 999 }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: "100%",
                fontSize: `${16 + Math.random() * 20}px`,
                animation: `floatUp ${3 + Math.random() * 4}s linear ${Math.random() * 2}s infinite`,
              }}>
                {["🎉", "🎊", "✨", "💰", "🎯", "⭐", "💎", "🏆"][Math.floor(Math.random() * 8)]}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}