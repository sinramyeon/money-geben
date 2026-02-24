import { useState, useMemo, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, ReferenceLine, BarChart, Bar, Line
} from "recharts";

type Lang = "ko" | "en";
type CurKey = "EUR" | "KRW";
interface TC { bg: string; card: string; text: string; subtext: string; muted: string; border: string; trackBg: string; cardShadow: string; cardHoverShadow: string; tooltipBg: string; }
interface CC { symbol: string; locale: string; code: string; presets: number[]; maxGoal: number; maxMonthly: number; maxInvest: number; stepGoal: number; }
interface HP { month: number; total: number; cash: number; savings: number; stocks: number; }

const mkT = (ko: boolean) => ({
  title: "Money Geben", subtitle: ko ? "돈 모으는 재미, 여기서 시작 🚀" : "Start your saving journey here 🚀",
  currentAssets: ko ? "🏦 현재 자산" : "🏦 Current Assets",
  cash: ko ? "현금" : "Cash", savings: ko ? "저축 (적금/예금)" : "Savings", stocks: ko ? "투자 (ETF/주식)" : "Investments",
  monthlySettings: ko ? "📆 월간 설정" : "📆 Monthly Settings",
  monthlySaving: ko ? "월 저축액" : "Monthly Savings", monthlyInvest: ko ? "월 투자액" : "Monthly Investment",
  rates: ko ? "📊 수익률" : "📊 Returns",
  savingsRate: ko ? "저축 이자율 (연)" : "Savings Interest (Annual)", stockRate: ko ? "투자 기대 수익률 (연)" : "Expected Return (Annual)",
  goal: ko ? "🎯 목표 금액" : "🎯 Goal Amount", goalLabel: ko ? "목표" : "Goal", customGoal: ko ? "직접 입력" : "Custom",
  growthChart: ko ? "📈 자산 성장 그래프" : "📈 Asset Growth Chart",
  assetComposition: ko ? "🧩 자산 구성" : "🧩 Composition",
  milestone: ko ? "🗓 마일스톤" : "🗓 Milestones",
  stats: { timeLeft: ko ? "달성까지" : "Time Left", targetYear: ko ? "예상 연도" : "Target Year", monthlyTotal: ko ? "월 총 투입" : "Monthly Input", vGoal: ko ? "목표 대비" : "vs Goal" },
  months: ko ? "개월" : " mo", years: ko ? "년" : " yrs", monthsAfter: ko ? "개월 후" : " months later",
  achieved: ko ? "달성!" : "Done!", approx: ko ? "약" : "~", after: ko ? "후" : "later", over600: "600+",
  currentAsset: ko ? "현재 자산" : "Current", remaining: ko ? "목표까지" : "Remaining", goalDone: ko ? "달성! 🎉" : "Done! 🎉",
  expectedDate: ko ? "예상 달성일" : "Expected Date",
  cashL: ko ? "현금" : "Cash", savingsL: ko ? "저축" : "Savings", stocksL: ko ? "투자" : "Investments",
  footer: "Made with 💜 · Money Geben", now: "Now", darkMode: ko ? "다크모드" : "Dark Mode",
  heroAchieve: ko ? "달성 금액" : "Goal", heroAchieveAt: ko ? "에 달성 예상" : " expected",
  // FIRE
  fireCalc: ko ? "🔥 FIRE 목표 계산기" : "🔥 FIRE Goal Calculator",
  fireSubtitle: ko ? "FIRE = 투자 수익만으로 생활비를 충당할 수 있는 상태 (일 안 해도 OK!)" : "FIRE = Investment returns cover all living expenses (no need to work!)",
  fireHow: ko ? "❓ 어떻게 계산되나요?" : "❓ How is this calculated?",
  fireHowDesc: ko
    ? "① 은퇴 후 연간 생활비를 정합니다\n② 투자금에서 매년 꺼내 쓸 비율(인출률)을 정합니다\n③ 연간 생활비 ÷ 인출률 = 필요한 총 자산\n\n예: 월 150만원 × 12 = 연 1,800만원\n1,800만원 ÷ 4% = 4억 5천만원 필요"
    : "① Set your annual living expenses in retirement\n② Set withdrawal rate (% you take out yearly)\n③ Annual expenses ÷ Withdrawal rate = Target\n\nEx: €1,500/mo × 12 = €18,000/yr\n€18,000 ÷ 4% = €450,000 needed",
  fireSection1: ko ? "💼 내 수입과 지출" : "💼 Income & Expenses",
  fireSection2: ko ? "💰 내 저축 & 투자 (FIRE용)" : "💰 My Savings & Investments (for FIRE)",
  fireSection2Desc: ko ? "FIRE 달성을 위해 매달 얼마를 저축/투자하고, 각각의 수익률을 설정하세요" : "Set how much you save & invest monthly for FIRE, with their own rates",
  fireSection3: ko ? "📤 은퇴 설정" : "📤 Retirement Settings",
  monthlyExpense: ko ? "월 생활비 (은퇴 후 예상)" : "Monthly Expenses (in retirement)",
  monthlyIncome: ko ? "월 수입" : "Monthly Income",
  fireMonthlySave: ko ? "월 저축액" : "Monthly Savings",
  fireMonthlyInvest: ko ? "월 투자액" : "Monthly Investment",
  fireSavingsRate: ko ? "저축 이자율 (연)" : "Savings Interest Rate (Annual)",
  fireInvestRate: ko ? "투자 기대 수익률 (연)" : "Investment Return Rate (Annual)",
  currentAge: ko ? "현재 나이" : "Current Age",
  lifeExpectancy: ko ? "기대 수명" : "Life Expectancy",
  withdrawRateLabel: ko ? "연간 인출률" : "Annual Withdrawal Rate",
  withdrawTitle: ko ? "📤 인출률이란?" : "📤 What is Withdrawal Rate?",
  withdrawDesc: ko
    ? "은퇴 후 매년 모은 돈에서 생활비로 꺼내 쓰는 비율이에요."
    : "The % of your savings you withdraw yearly for living expenses.",
  withdrawWhyLower: ko
    ? "🤔 인출률이 높으면 왜 목표가 줄어들까?"
    : "🤔 Why does higher rate = lower target?",
  withdrawWhyDesc: ko
    ? "매년 더 많은 비율을 꺼내 쓰면, 같은 생활비를 만들기 위해 더 적은 돈이 필요해요.\n하지만 돈을 빨리 꺼내 쓰면 자금이 빨리 바닥날 수 있어요!"
    : "If you withdraw a bigger %, you need less total money to cover the same expenses.\nBut you'll run out of money faster!",
  withdrawExample: ko ? "예시: 연간 생활비 " : "Example: Annual expenses ",
  withdrawConclusion: ko
    ? "→ 인출률↑ = 목표 자산↓ (적게 모아도 됨) 하지만 위험↑ (빨리 소진)"
    : "→ Higher rate = Lower target (save less) BUT Higher risk (runs out faster)",
  withdrawRec: ko
    ? "💡 4%가 가장 많이 쓰이는 안전한 기준이에요 ('4% Rule')"
    : "💡 4% is the most widely used safe standard ('4% Rule')",
  fireCalcTitle: ko ? "📊 FIRE 목표 자산" : "📊 FIRE Target Amount",
  fireAnnualExp: ko ? "연간 생활비" : "Annual Expenses",
  fireNeedSave: ko ? "이만큼 모아야 은퇴 가능!" : "Save this much to retire!",
  fireNowVsGoal: ko ? "진행률" : "Progress",
  fireResult: ko ? "📈 내 FIRE 시뮬레이션 결과" : "📈 My FIRE Simulation Results",
  fireResultDesc: ko ? "위에서 입력한 저축/투자/수익률로 계산합니다" : "Calculated with your savings/investment/rates above",
  fireAge: ko ? "FIRE 나이" : "FIRE Age",
  fireMonthly: ko ? "월 저축+투자" : "Monthly Save+Invest",
  fundsLastUntil: ko ? "자금 유지" : "Funds Last",
  fundsSafe: ko ? "✅ 기대수명까지 안전!" : "✅ Safe until life expectancy!",
  fundsWarning: ko ? "⚠️ 기대수명 전에 바닥! 인출률을 낮추거나 더 모아보세요." : "⚠️ Runs out early! Lower rate or save more.",
  fundsForever: ko ? "🎉 영구적으로 유지! (수익 > 지출)" : "🎉 Lasts forever! (Returns > Expenses)",
  fireJourney: ko ? "📈 나이별 자산 성장 예측" : "📈 Asset Growth by Age",
  fireJourneyDesc: ko ? "현재 저축+투자를 유지하면 내 자산이 이렇게 불어나요" : "How your assets grow at current savings & investment rate",
  myAssets: ko ? "내 자산" : "My Assets", targetLine: ko ? "FIRE 목표" : "FIRE Target",
  postFire: ko ? "🏖 은퇴 후 자금 시뮬레이션" : "🏖 Post-Retirement Simulation",
  postFireDesc: ko ? "FIRE 후 매년 생활비를 꺼내 쓰면서 자금이 얼마나 유지되는지" : "How long funds last after FIRE while withdrawing expenses",
  remainingFunds: ko ? "잔여 자금" : "Remaining Funds",
  scenarioTitle: ko ? "📊 인출률별 비교표" : "📊 Withdrawal Rate Comparison",
  scenarioDesc: ko ? "인출률을 바꾸면 필요 자산과 은퇴 나이가 이렇게 달라져요" : "How different rates change your target & retirement age",
  rate: ko ? "인출률" : "Rate", needed: ko ? "필요 자산" : "Needed", retireAge: ko ? "은퇴 나이" : "Retire",
  lasts: ko ? "유지" : "Lasts", safety: ko ? "안전" : "Safety",
  safe: ko ? "안전" : "Safe", risky: ko ? "위험" : "Risky", cur: ko ? "현재" : "Now",
  whatIf: ko ? "🔮 What If 시뮬레이터" : "🔮 What If Simulator",
  whatIfDesc: ko ? "만약 이렇게 바꾸면 목표 달성이 얼마나 빨라질까?" : "How much faster if you change things?",
  extraSave: ko ? "추가 저축 (월)" : "Extra Savings (/mo)", extraInvest: ko ? "추가 투자 (월)" : "Extra Invest (/mo)",
  boostRate: ko ? "수익률 부스트" : "Rate Boost", result: ko ? "결과" : "Result", fasterBy: ko ? "빨라짐" : "faster",
  yearlySnapshot: ko ? "📅 연도별 자산 예측 (10년)" : "📅 10-Year Asset Forecast",
  yearlyDesc: ko ? "현재 설정 유지 시 향후 10년간 자산 변화" : "Projected assets for the next 10 years",
  yearLabel: ko ? "연도" : "Year", totalLabel: ko ? "총 자산" : "Total", gainLabel: ko ? "투자 수익" : "Gains", depositLabel: ko ? "저축+투자" : "Deposits",
  encouragements: [
    { threshold: 0, emoji: "🌱", msg: ko ? "씨앗을 심었어! 시작이 반!" : "Seed planted!" },
    { threshold: 10, emoji: "🌿", msg: ko ? "자라나고 있어~" : "Growing~" },
    { threshold: 25, emoji: "💪", msg: ko ? "1/4 왔다!" : "Quarter done!" },
    { threshold: 40, emoji: "🔥", msg: ko ? "불타오르는 중!" : "On fire!" },
    { threshold: 50, emoji: "🎯", msg: ko ? "반 왔다!!" : "Halfway!!" },
    { threshold: 60, emoji: "🚀", msg: ko ? "이제 가속!" : "Accelerating!" },
    { threshold: 75, emoji: "⭐", msg: ko ? "거의 다 왔어!" : "Almost!" },
    { threshold: 90, emoji: "🏆", msg: ko ? "코앞이야!!!" : "So close!!!" },
    { threshold: 100, emoji: "🎉", msg: ko ? "목표 달성!! 🥳🎊" : "GOAL!! 🥳🎊" },
  ],
});

const currencies: Record<CurKey, CC> = {
  EUR: { symbol: "€", locale: "de-DE", code: "EUR", presets: [30000,50000,100000,200000], maxGoal: 500000, maxMonthly: 5000, maxInvest: 3000, stepGoal: 1000 },
  KRW: { symbol: "₩", locale: "ko-KR", code: "KRW", presets: [30000000,50000000,100000000,200000000], maxGoal: 500000000, maxMonthly: 5000000, maxInvest: 3000000, stepGoal: 1000000 },
};
const themes: Record<string, TC> = {
  light: { bg:"#FFF8F0",card:"#FFFFFF",text:"#2D3436",subtext:"#999",muted:"#aaa",border:"#F0F0F0",trackBg:"#F0F0F0",cardShadow:"0 4px 20px rgba(0,0,0,0.06)",cardHoverShadow:"0 12px 40px rgba(0,0,0,0.12)",tooltipBg:"white" },
  dark: { bg:"#1A1A2E",card:"#16213E",text:"#EAEAEA",subtext:"#888",muted:"#666",border:"#2A2A4A",trackBg:"#2A2A4A",cardShadow:"0 4px 20px rgba(0,0,0,0.3)",cardHoverShadow:"0 12px 40px rgba(0,0,0,0.5)",tooltipBg:"#16213E" },
};
const A = { cash:"#FF6B9D",savings:"#00D2FF",stocks:"#FFD93D",goal:"#6C5CE7",green:"#55EFC4",pink:"#FD79A8",purple:"#A29BFE",orange:"#FF6348",blue:"#0984E3" };

function simulate(cash:number,savings:number,stocks:number,mSave:number,mInvest:number,sRate:number,stRate:number,tgt:number) {
  let c=cash,s=savings,st=stocks,m=0;
  const h:HP[]=[{month:0,total:c+s+st,cash:c,savings:s,stocks:st}];
  while(c+s+st<tgt&&m<600){m++;s=s*(1+sRate/100/12)+mSave;st=st*(1+stRate/100/12)+mInvest;h.push({month:m,total:c+s+st,cash:c,savings:s,stocks:st});}
  return {months:m,history:h};
}

function calcFIRE(age:number,curSavings:number,fSave:number,fInvest:number,fSRate:number,fIRate:number,monthlyExp:number,wRate:number,lifeExp:number) {
  const annualExp = monthlyExp * 12;
  const fireTarget = wRate > 0 ? annualExp / (wRate / 100) : 0;
  const timeline:{age:number;savings:number;target:number}[]=[];
  let savPart=curSavings*0.5, invPart=curSavings*0.5, fireAge=-1;
  for(let yr=0;yr<=70;yr++){
    const total=savPart+invPart;
    timeline.push({age:age+yr,savings:Math.round(total),target:Math.round(fireTarget)});
    if(total>=fireTarget&&fireAge<0)fireAge=age+yr;
    if(fireAge>0&&yr>fireAge-age+5)break;
    savPart=savPart*(1+fSRate/100)+fSave*12;
    invPart=invPart*(1+fIRate/100)+fInvest*12;
    if(age+yr>=100)break;
  }
  const postFire:{age:number;funds:number}[]=[];
  let yof=0;
  if(fireAge>0){
    const fIdx=fireAge-age;
    let funds=timeline[fIdx]?.savings??fireTarget;
    const postRate=fIRate*0.5;
    for(let yr=0;yr<=80;yr++){
      postFire.push({age:fireAge+yr,funds:Math.round(Math.max(0,funds))});
      if(funds<=0)break;
      funds=funds*(1+postRate/100)-annualExp;
      yof=yr+1;
    }
  }
  const scenarios=[3,3.5,4,4.5,5].map((r)=>{
    const tgt=annualExp/(r/100);
    let sp=curSavings*0.5,ip=curSavings*0.5,a=age;
    while(sp+ip<tgt&&a<100){sp=sp*(1+fSRate/100)+fSave*12;ip=ip*(1+fIRate/100)+fInvest*12;a++;}
    const fA=sp+ip>=tgt?a:-1;
    let pf=tgt,y=0;
    if(fA>0){for(let i=0;i<80;i++){if(pf<=0)break;pf=pf*(1+fIRate*0.5/100)-annualExp;y++;}}
    return {rate:r,target:Math.round(tgt),fireAge:fA,yof:y,safe:fA>0&&fA+y>=lifeExp};
  });
  return {fireTarget,fireAge,timeline,postFire,yof,scenarios};
}

function CelebrationOverlay({active}:{active:boolean}) {
  const p=useMemo(()=>Array.from({length:80}).map((_,i)=>({id:i,left:Math.random()*100,size:8+Math.random()*16,dur:2.5+Math.random()*3,delay:Math.random()*2.5,emoji:["🎉","🎊","✨","💰","🎯","⭐","💎","🏆","🔥","💜","🥳"][Math.floor(Math.random()*11)],xd:-30+Math.random()*60,rot:Math.random()*720-360,isS:Math.random()>0.5,col:[A.cash,A.savings,A.stocks,A.goal,A.green,A.pink,A.purple,A.orange][Math.floor(Math.random()*8)],st:Math.floor(Math.random()*3)})),[]);
  if(!active)return null;
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,215,0,0.4) 0%,transparent 70%)",animation:"celebFlash 2s ease-out forwards"}}/>
    <div style={{position:"absolute",top:"35%",left:"50%",transform:"translateX(-50%)",fontSize:80,animation:"trophyBounce 1s cubic-bezier(.36,.07,.19,.97) 0.3s both"}}>🏆</div>
    {p.map((x)=>(<div key={x.id} style={{position:"absolute",left:`${x.left}%`,bottom:"-5%",fontSize:x.isS?0:x.size,animation:`confettiFly ${x.dur}s cubic-bezier(.2,.8,.3,1) ${x.delay}s infinite`,"--xDrift":`${x.xd}px`,"--rotation":`${x.rot}deg`} as React.CSSProperties}>{x.isS?<div style={{width:x.size*0.7,height:x.size*0.7,background:x.col,borderRadius:x.st===0?"50%":"2px",transform:x.st===2?"rotate(45deg)":undefined}}/>:x.emoji}</div>))}
    {[0,1,2].map((i)=>(<div key={i} style={{position:"absolute",top:"50%",left:"50%",width:40,height:40,borderRadius:"50%",border:`3px solid ${[A.goal,A.stocks,A.cash][i]}`,transform:"translate(-50%,-50%)",animation:`ringBurst 1.5s ease-out ${i*0.2}s forwards`,opacity:0}}/>))}
  </div>);
}

function InfoBubble({text,theme}:{text:string;theme:TC}) {
  const [open,setOpen]=useState(false);
  return(<span style={{position:"relative",display:"inline-block",marginLeft:6,cursor:"pointer"}} onClick={()=>setOpen(!open)}>
    <span style={{fontSize:14,opacity:0.6}}>ℹ️</span>
    {open&&(<div style={{position:"absolute",bottom:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",width:280,padding:"12px 14px",borderRadius:14,background:theme.tooltipBg,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",fontSize:12,fontWeight:600,color:theme.text,lineHeight:1.6,zIndex:100,animation:"popIn 0.2s ease-out",border:`1px solid ${theme.border}`,whiteSpace:"pre-line"}}>{text}</div>)}
  </span>);
}

function SliderInput({label,value,onChange,min,max,step,color,suffix="",emoji,theme,info}:{label:string;value:number;onChange:(v:number)=>void;min:number;max:number;step:number;color:string;suffix?:string;emoji:string;theme:TC;info?:string}) {
  const pct=Math.max(0,Math.min(100,((value-min)/(max-min))*100));
  return(<div style={{marginBottom:18}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <label style={{fontSize:13,fontWeight:700,color:theme.text}}>{emoji} {label}{info&&<InfoBubble text={info} theme={theme}/>}</label>
      <span style={{fontSize:15,fontWeight:800,color,background:color+"18",padding:"2px 12px",borderRadius:20}}>{value.toLocaleString()}{suffix}</span>
    </div>
    <div style={{position:"relative",height:8,borderRadius:10,background:theme.trackBg}}>
      <div style={{position:"absolute",left:0,top:0,height:"100%",borderRadius:10,width:`${pct}%`,background:`linear-gradient(90deg,${color}88,${color})`,transition:"width 0.15s"}}/>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e)=>onChange(parseFloat(e.target.value))} style={{position:"absolute",top:-6,left:0,width:"100%",height:20,appearance:"none",background:"transparent",cursor:"pointer",zIndex:2}}/>
    </div>
  </div>);
}

function NumberInput({label,value,onChange,emoji,color,theme,symbol}:{label:string;value:number;onChange:(v:number)=>void;emoji:string;color:string;theme:TC;symbol:string}) {
  const [f,setF]=useState(false);
  return(<div style={{marginBottom:14}}>
    <label style={{fontSize:12,fontWeight:700,color:theme.muted,display:"block",marginBottom:4}}>{emoji} {label}</label>
    <div style={{position:"relative"}}>
      <input type="number" value={value} onChange={(e)=>onChange(parseFloat(e.target.value)||0)} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{width:"100%",padding:"10px 50px 10px 14px",borderRadius:14,border:`2px solid ${f?color:color+"44"}`,fontSize:16,fontWeight:700,color:theme.text,background:theme.card,outline:"none",boxSizing:"border-box",transition:"all 0.3s",boxShadow:f?`0 0 0 4px ${color}22`:"none"}}/>
      <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:14,fontWeight:700,color}}>{symbol}</span>
    </div>
  </div>);
}

function TogglePill({options,value,onChange,theme}:{options:{value:string;label:string}[];value:string;onChange:(v:string)=>void;theme:TC}) {
  return(<div style={{display:"inline-flex",borderRadius:30,overflow:"hidden",border:`2px solid ${theme.border}`,background:theme.card}}>
    {options.map((o)=>(<button key={o.value} onClick={()=>onChange(o.value)} style={{padding:"6px 16px",border:"none",cursor:"pointer",background:value===o.value?A.goal:"transparent",color:value===o.value?"white":theme.subtext,fontWeight:700,fontSize:13,transition:"all 0.3s",fontFamily:"inherit"}}>{o.label}</button>))}
  </div>);
}

const CTip=({active,payload,label,sfx,theme}:{active?:boolean;payload?:Array<{color:string;name:string;value:number}>;label?:string;sfx:string;theme:TC})=>{
  if(!active||!payload?.length)return null;
  return(<div style={{background:theme.tooltipBg,borderRadius:16,padding:"12px 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.15)"}}>
    <p style={{fontWeight:800,fontSize:13,color:theme.muted,margin:0}}>{label}{sfx}</p>
    {payload.map((p,i)=>(<p key={i} style={{color:p.color,fontWeight:700,fontSize:14,margin:"4px 0 0"}}>{p.name}: {p.value?.toLocaleString()}</p>))}
  </div>);
};

const PC=[A.cash,A.savings,A.stocks];

export default function App() {
  const [lang,setLang]=useState<Lang>("ko");
  const [cur,setCur]=useState<CurKey>("EUR");
  const [dark,setDark]=useState(false);
  const [cash,setCash]=useState(500);
  const [savings,setSavings]=useState(12751);
  const [stocks,setStocks]=useState(7041);
  const [mSave,setMSave]=useState(1300);
  const [mInvest,setMInvest]=useState(120);
  const [sRate,setSRate]=useState(2.0);
  const [stRate,setStRate]=useState(7.0);
  const [target,setTarget]=useState(30000);
  const [custGoal,setCustGoal]=useState("");
  const [showCust,setShowCust]=useState(false);
  const [showCeleb,setShowCeleb]=useState(false);
  // FIRE - fully independent inputs
  const [fireIncome,setFireIncome]=useState(3500);
  const [fireExpense,setFireExpense]=useState(1500);
  const [fireSave,setFireSave]=useState(1300);
  const [fireInvest,setFireInvest]=useState(120);
  const [fireSRate,setFireSRate]=useState(2.0);
  const [fireIRate,setFireIRate]=useState(7.0);
  const [age,setAge]=useState(30);
  const [wRate,setWRate]=useState(4.0);
  const [lifeExp,setLifeExp]=useState(85);
  // What If
  const [exSave,setExSave]=useState(0);
  const [exInvest,setExInvest]=useState(0);
  const [boostRate,setBoostRate]=useState(0);
  const [anim,setAnim]=useState(false);
  const [showHow,setShowHow]=useState(false);
  const [showWhy,setShowWhy]=useState(false);

  useEffect(()=>{setTimeout(()=>setAnim(true),100);},[]);
  const ko=lang==="ko";
  const t=useMemo(()=>mkT(ko),[ko]);
  const cc=currencies[cur];
  const theme=themes[dark?"dark":"light"];
  const fmt=useCallback((n:number)=>new Intl.NumberFormat(cc.locale,{style:"currency",currency:cc.code,maximumFractionDigits:0}).format(n),[cc]);
  const fmtS=useCallback((n:number)=>{if(cur==="KRW"){if(n>=100000000)return`${(n/100000000).toFixed(1)}억`;if(n>=10000)return`${(n/10000).toFixed(0)}만`;}if(n>=1000000)return`${(n/1000000).toFixed(1)}M`;if(n>=1000)return`${(n/1000).toFixed(0)}k`;return n.toLocaleString();},[cur]);

  const chgCur=(nc:string)=>{
    if(nc===cur)return;const f=nc==="KRW"?1500:1/1500;
    setCash(Math.round(cash*f));setSavings(Math.round(savings*f));setStocks(Math.round(stocks*f));
    setMSave(Math.round(mSave*f));setMInvest(Math.round(mInvest*f));setTarget(Math.round(target*f));
    setFireIncome(Math.round(fireIncome*f));setFireExpense(Math.round(fireExpense*f));
    setFireSave(Math.round(fireSave*f));setFireInvest(Math.round(fireInvest*f));
    setExSave(Math.round(exSave*f));setExInvest(Math.round(exInvest*f));
    setCur(nc as CurKey);
  };

  const tot=cash+savings+stocks;
  const prog=Math.min((tot/target)*100,100);
  const enc=(()=>{let r=t.encouragements[0];for(const e of t.encouragements)if(prog>=e.threshold)r=e;return r;})();
  const {months,history}=useMemo(()=>simulate(cash,savings,stocks,mSave,mInvest,sRate,stRate,target),[cash,savings,stocks,mSave,mInvest,sRate,stRate,target]);
  const wiSim=useMemo(()=>simulate(cash,savings,stocks,mSave+exSave,mInvest+exInvest,sRate,stRate+boostRate,target),[cash,savings,stocks,mSave,mInvest,sRate,stRate,target,exSave,exInvest,boostRate]);
  const cd=useMemo(()=>{const s=Math.max(1,Math.floor(history.length/80));return history.filter((_,i)=>i%s===0||i===history.length-1);},[history]);
  const pd=[{name:t.cashL,value:cash},{name:t.savingsL,value:savings},{name:t.stocksL,value:stocks}].filter((d)=>d.value>0);

  // FIRE uses its OWN inputs
  const fire=useMemo(()=>calcFIRE(age,tot,fireSave,fireInvest,fireSRate,fireIRate,fireExpense,wRate,lifeExp),[age,tot,fireSave,fireInvest,fireSRate,fireIRate,fireExpense,wRate,lifeExp]);
  const fireProg=fire.fireTarget>0?Math.min((tot/fire.fireTarget)*100,100):0;
  const fLastAge=fire.fireAge>0?fire.fireAge+fire.yof:-1;
  const fSafe=fLastAge>=lifeExp||fire.yof>=60;
  const fireSavingsRate=fireIncome>0?((fireIncome-fireExpense)/fireIncome*100):0;

  // Withdrawal rate examples for visual
  const annualExp=fireExpense*12;
  const wrExamples=[3,4,5].map(r=>({rate:r,target:Math.round(annualExp/(r/100)),risk:r>=5?2:r>=4.5?1:0}));

  // Yearly
  const yearly=useMemo(()=>{
    const d:{year:number;total:number;deposits:number;gains:number}[]=[];
    let s=savings,st=stocks,c=cash;
    for(let yr=1;yr<=10;yr++){
      const prev=c+s+st;
      for(let m=0;m<12;m++){s=s*(1+sRate/100/12)+mSave;st=st*(1+stRate/100/12)+mInvest;}
      const total=c+s+st;const dep=(mSave+mInvest)*12;
      d.push({year:new Date().getFullYear()+yr,total:Math.round(total),deposits:Math.round(dep),gains:Math.round(Math.max(0,total-prev-dep))});
    }
    return d;
  },[cash,savings,stocks,mSave,mInvest,sRate,stRate]);

  useEffect(()=>{if(prog>=100&&!showCeleb)setShowCeleb(true);if(prog<100)setShowCeleb(false);},[prog,showCeleb]);
  const m2d=(m:number)=>{const d=new Date();d.setMonth(d.getMonth()+m);return d.toLocaleDateString(ko?"ko-KR":"en-US",{year:"numeric",month:"long"});};
  const ym=months<600?m2d(months):null;
  const applyCust=()=>{const v=parseFloat(custGoal.replace(/[^0-9.]/g,""));if(v>0){setTarget(v);setShowCust(false);setCustGoal("");}};
  const cs=(d=0):React.CSSProperties=>({background:theme.card,borderRadius:24,padding:24,boxShadow:theme.cardShadow,transition:"all 0.4s cubic-bezier(.4,0,.2,1)",opacity:anim?1:0,transform:anim?"translateY(0)":"translateY(30px)",transitionDelay:`${d}ms`});
  const wiDiff=months-wiSim.months;
  const hasWI=exSave>0||exInvest>0||boostRate>0;
  const sh=(title:string,desc:string,color:string)=>(<><div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color,marginBottom:4}}>{title}</div>{desc&&<p style={{fontSize:12,color:theme.muted,fontWeight:600,marginBottom:16,lineHeight:1.5}}>{desc}</p>}</>);
  const secLabel=(text:string,color:string)=>(<div style={{fontSize:14,fontWeight:800,color,marginBottom:8,marginTop:8,padding:"6px 12px",borderRadius:10,background:`${color}10`,borderLeft:`4px solid ${color}`}}>{text}</div>);

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}body{background:${theme.bg};transition:background 0.5s}
        @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.05)}70%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
        @keyframes slideL{0%{transform:translateX(-40px);opacity:0}100%{transform:translateX(0);opacity:1}}
        @keyframes popIn{0%{transform:scale(0)}60%{transform:scale(1.1)}100%{transform:scale(1)}}
        @keyframes rainbowBorder{0%{border-color:${A.cash}}25%{border-color:${A.savings}}50%{border-color:${A.stocks}}75%{border-color:${A.goal}}100%{border-color:${A.cash}}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes heroGlow{0%,100%{box-shadow:0 0 20px ${A.goal}22,0 4px 20px rgba(0,0,0,0.06)}50%{box-shadow:0 0 40px ${A.goal}44,0 4px 20px rgba(0,0,0,0.06)}}
        @keyframes confettiFly{0%{transform:translateY(0) translateX(0) rotate(0) scale(1);opacity:1}25%{opacity:1}100%{transform:translateY(-110vh) translateX(var(--xDrift,0px)) rotate(var(--rotation,360deg)) scale(0.3);opacity:0}}
        @keyframes celebFlash{0%{transform:translate(-50%,-50%) scale(0);opacity:0.8}100%{transform:translate(-50%,-50%) scale(4);opacity:0}}
        @keyframes trophyBounce{0%{transform:translateX(-50%) scale(0) translateY(100px);opacity:0}40%{transform:translateX(-50%) scale(1.3) translateY(-20px);opacity:1}60%{transform:translateX(-50%) scale(0.9) translateY(10px)}80%{transform:translateX(-50%) scale(1.05) translateY(-5px)}100%{transform:translateX(-50%) scale(1) translateY(0)}}
        @keyframes ringBurst{0%{width:40px;height:40px;opacity:0.8;border-width:3px}100%{width:500px;height:500px;opacity:0;border-width:1px}}
        .hc:hover{transform:translateY(-4px)!important;box-shadow:${theme.cardHoverShadow}!important}
        input[type="range"]::-webkit-slider-thumb{appearance:none;width:24px;height:24px;border-radius:50%;background:white;border:3px solid currentColor;box-shadow:0 2px 10px rgba(0,0,0,0.2);cursor:pointer;transition:transform 0.2s}
        input[type="range"]::-webkit-slider-thumb:hover{transform:scale(1.3)}
        input[type="number"]::-webkit-inner-spin-button{opacity:1}::selection{background:${A.goal}44}
        .mr{transition:all 0.3s}.mr:hover{transform:translateX(8px)}
        .sc{transition:all 0.3s}.sc:hover{transform:scale(1.06) translateY(-4px)}
        .pb{transition:all 0.25s}.pb:hover{transform:scale(1.08);box-shadow:0 4px 16px rgba(0,0,0,0.15)}.pb:active{transform:scale(0.95)}
        @media(max-width:700px){.grid2{grid-template-columns:1fr!important}}
      `}</style>
      <CelebrationOverlay active={showCeleb}/>
      <div style={{maxWidth:960,margin:"0 auto",padding:"20px 16px 60px",fontFamily:"'Nunito',sans-serif",color:theme.text}}>
        {/* HEADER */}
        <div style={{textAlign:"center",marginBottom:28,animation:"bounceIn 0.6s ease-out"}}>
          <div style={{fontSize:52,marginBottom:4,animation:"float 3s ease-in-out infinite"}}>💰</div>
          <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:36,fontWeight:800,background:"linear-gradient(135deg,#FF6B9D,#6C5CE7,#00D2FF,#FFD93D)",backgroundSize:"300% 100%",animation:"shimmer 4s linear infinite",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{t.title}</h1>
          <p style={{fontSize:14,color:theme.subtext,fontWeight:600}}>{t.subtitle}</p>
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:16,flexWrap:"wrap"}}>
            <TogglePill options={[{value:"ko",label:"🇰🇷 한국어"},{value:"en",label:"🇬🇧 EN"}]} value={lang} onChange={(v)=>setLang(v as Lang)} theme={theme}/>
            <TogglePill options={[{value:"EUR",label:"€ EUR"},{value:"KRW",label:"₩ KRW"}]} value={cur} onChange={chgCur} theme={theme}/>
            <button onClick={()=>setDark(!dark)} style={{padding:"6px 16px",borderRadius:30,border:`2px solid ${theme.border}`,background:dark?A.goal:theme.card,color:dark?"white":theme.subtext,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{dark?"☀️":"🌙"} {t.darkMode}</button>
          </div>
        </div>

        {/* HERO */}
        <div className="hc" style={{...cs(0),marginBottom:20,textAlign:"center",position:"relative",overflow:"hidden",border:prog>=100?`3px solid ${A.green}`:"3px solid transparent",animation:prog>=100?"rainbowBorder 3s linear infinite,pulse 2s infinite":"heroGlow 4s ease-in-out infinite"}}>
          <div style={{position:"relative",zIndex:1}}>
            <div style={{fontSize:44,marginBottom:4,animation:"wiggle 1.5s ease-in-out infinite"}}>{enc.emoji}</div>
            <div style={{fontSize:15,fontWeight:700,color:theme.subtext,marginBottom:12}}>{enc.msg}</div>
            <div style={{height:32,borderRadius:20,background:theme.trackBg,overflow:"hidden",margin:"0 auto 16px",maxWidth:520}}>
              <div style={{height:"100%",borderRadius:20,width:`${Math.min(prog,100)}%`,background:prog>=100?"linear-gradient(90deg,#FFD93D,#FF6B9D,#6C5CE7,#00D2FF,#55EFC4)":`linear-gradient(90deg,${A.cash},${A.goal},${A.savings})`,backgroundSize:prog>=100?"300% 100%":"100%",animation:prog>=100?"shimmer 2s linear infinite":undefined,transition:"width 1s cubic-bezier(.4,0,.2,1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {prog>12&&<span style={{color:"white",fontWeight:900,fontSize:14,textShadow:"0 1px 4px rgba(0,0,0,0.3)"}}>{prog.toFixed(1)}%</span>}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,maxWidth:620,margin:"0 auto"}}>
              {[{l:t.currentAsset,v:fmt(tot),c:A.cash,e:"💵"},{l:t.heroAchieve,v:fmt(target),c:A.goal,e:"🎯"},{l:t.remaining,v:target>tot?fmt(target-tot):t.goalDone,c:A.pink,e:"📊"},{l:t.expectedDate,v:ym??t.over600,c:A.savings,e:"📅"}].map((x,i)=>(
                <div key={i} style={{animation:`popIn 0.4s ease-out ${0.2+i*0.12}s both`}}>
                  <div style={{fontSize:20}}>{x.e}</div>
                  <div style={{fontSize:11,color:theme.muted,fontWeight:700}}>{x.l}</div>
                  <div style={{fontSize:18,fontWeight:900,color:x.c,fontFamily:"'Baloo 2',cursive",lineHeight:1.2}}>{x.v}</div>
                </div>
              ))}
            </div>
            {ym&&target>tot&&(<div style={{marginTop:14,padding:"8px 20px",borderRadius:20,background:`linear-gradient(135deg,${A.goal}15,${A.savings}15)`,display:"inline-block"}}><span style={{fontSize:13,fontWeight:700}}>🗓 <strong style={{color:A.goal}}>{ym}</strong>{t.heroAchieveAt} → <strong style={{color:A.savings}}>{fmt(target)}</strong></span></div>)}
          </div>
        </div>

        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"start"}}>
          {/* LEFT */}
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div className="hc" style={cs(100)}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:A.cash,marginBottom:16}}>{t.currentAssets}</div>
              <NumberInput label={t.cash} value={cash} onChange={setCash} emoji="💵" color={A.cash} theme={theme} symbol={cc.symbol}/>
              <NumberInput label={t.savings} value={savings} onChange={setSavings} emoji="🏦" color={A.savings} theme={theme} symbol={cc.symbol}/>
              <NumberInput label={t.stocks} value={stocks} onChange={setStocks} emoji="📈" color={A.stocks} theme={theme} symbol={cc.symbol}/>
            </div>
            <div className="hc" style={cs(200)}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:A.savings,marginBottom:16}}>{t.monthlySettings}</div>
              <SliderInput label={t.monthlySaving} value={mSave} onChange={setMSave} min={0} max={cc.maxMonthly} step={cur==="KRW"?50000:50} color={A.savings} suffix={cc.symbol} emoji="💎" theme={theme}/>
              <SliderInput label={t.monthlyInvest} value={mInvest} onChange={setMInvest} min={0} max={cc.maxInvest} step={cur==="KRW"?10000:10} color={A.stocks} suffix={cc.symbol} emoji="🎯" theme={theme}/>
            </div>
            <div className="hc" style={cs(300)}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:A.stocks,marginBottom:16}}>{t.rates}</div>
              <SliderInput label={t.savingsRate} value={sRate} onChange={setSRate} min={0} max={10} step={0.1} color={A.savings} suffix="%" emoji="🏦" theme={theme}/>
              <SliderInput label={t.stockRate} value={stRate} onChange={setStRate} min={-10} max={30} step={0.5} color={A.stocks} suffix="%" emoji="📈" theme={theme}/>
            </div>
            <div className="hc" style={{...cs(400),border:`2px solid ${A.goal}22`}}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:A.goal,marginBottom:16}}>{t.goal}</div>
              <SliderInput label={t.goalLabel} value={target} onChange={setTarget} min={cur==="KRW"?1000000:1000} max={cc.maxGoal} step={cc.stepGoal} color={A.goal} suffix={cc.symbol} emoji="🏁" theme={theme}/>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6}}>
                {cc.presets.map((g)=>(<button key={g} className="pb" onClick={()=>setTarget(g)} style={{padding:"7px 16px",borderRadius:20,border:"none",background:target===g?`linear-gradient(135deg,${A.goal},${A.purple})`:theme.trackBg,color:target===g?"white":theme.subtext,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{fmt(g)}</button>))}
                <button className="pb" onClick={()=>setShowCust(!showCust)} style={{padding:"7px 16px",borderRadius:20,border:`2px dashed ${A.goal}66`,background:"transparent",color:A.goal,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✏️ {t.customGoal}</button>
              </div>
              {showCust&&(<div style={{marginTop:12,display:"flex",gap:8}}><input type="number" value={custGoal} onChange={(e)=>setCustGoal(e.target.value)} placeholder={cur==="KRW"?"50000000":"75000"} onKeyDown={(e)=>e.key==="Enter"&&applyCust()} style={{flex:1,padding:"8px 14px",borderRadius:14,border:`2px solid ${A.goal}44`,fontSize:15,fontWeight:700,color:theme.text,background:theme.card,outline:"none",fontFamily:"inherit"}}/><button onClick={applyCust} style={{padding:"8px 20px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${A.goal},${A.pink})`,color:"white",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>✓</button></div>)}
            </div>

            {/* ══════ FIRE ══════ */}
            <div className="hc" style={{...cs(500),background:dark?"#1E1E3A":"linear-gradient(135deg,#FFF5F5,#FFF0E8)",border:`2px solid ${A.orange}22`}}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:22,fontWeight:800,color:A.orange,marginBottom:2}}>{t.fireCalc}</div>
              <p style={{fontSize:13,color:theme.text,fontWeight:600,marginBottom:12,lineHeight:1.6,padding:"8px 12px",borderRadius:12,background:`${A.orange}08`,border:`1px solid ${A.orange}15`}}>{t.fireSubtitle}</p>

              <button onClick={()=>setShowHow(!showHow)} style={{width:"100%",padding:"10px 14px",borderRadius:14,border:`2px solid ${A.blue}33`,background:`${A.blue}08`,color:A.blue,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:14,textAlign:"left"}}>
                {showHow?"▼":"▶"} {t.fireHow}
              </button>
              {showHow&&(<div style={{padding:"12px 16px",borderRadius:14,background:theme.card,border:`1px solid ${theme.border}`,marginBottom:14,fontSize:13,color:theme.text,lineHeight:1.8,whiteSpace:"pre-line",animation:"popIn 0.2s ease-out"}}>{t.fireHowDesc}</div>)}

              {/* Section 1: Income & Expenses */}
              {secLabel(t.fireSection1, A.blue)}
              <NumberInput label={t.monthlyIncome} value={fireIncome} onChange={setFireIncome} emoji="💼" color={A.green} theme={theme} symbol={cc.symbol}/>
              <NumberInput label={t.monthlyExpense} value={fireExpense} onChange={setFireExpense} emoji="🛒" color={A.orange} theme={theme} symbol={cc.symbol}/>

              {/* Savings rate */}
              <div style={{margin:"4px 0 12px",padding:"10px 14px",borderRadius:14,background:theme.card,border:`1px solid ${theme.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:700,color:theme.text}}>📊 {ko?"저축률":"Savings Rate"}<InfoBubble text={ko?"수입 중 저축하는 비율. 높을수록 빨리 FIRE 달성!":"% of income you save. Higher = FIRE sooner!"} theme={theme}/></span>
                  <span style={{fontSize:16,fontWeight:900,color:fireSavingsRate>=50?A.green:fireSavingsRate>=20?A.stocks:A.cash}}>{fireSavingsRate.toFixed(1)}%</span>
                </div>
                <div style={{height:8,borderRadius:6,background:theme.trackBg,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:6,width:`${Math.max(0,Math.min(fireSavingsRate,100))}%`,background:fireSavingsRate>=50?A.green:fireSavingsRate>=20?A.stocks:A.cash,transition:"width 0.5s"}}/>
                </div>
                <div style={{fontSize:11,color:theme.muted,marginTop:4}}>{ko?`매달 ${fmt(Math.max(0,fireIncome-fireExpense))} 여유 → 연 ${fmt(Math.max(0,(fireIncome-fireExpense)*12))}`:`${fmt(Math.max(0,fireIncome-fireExpense))}/mo surplus → ${fmt(Math.max(0,(fireIncome-fireExpense)*12))}/yr`}</div>
              </div>

              {/* Section 2: Savings & Investment (FIRE's own) */}
              {secLabel(t.fireSection2, A.savings)}
              <p style={{fontSize:11,color:theme.muted,marginBottom:10,lineHeight:1.5}}>{t.fireSection2Desc}</p>
              <NumberInput label={t.fireMonthlySave} value={fireSave} onChange={setFireSave} emoji="🏦" color={A.savings} theme={theme} symbol={cc.symbol}/>
              <SliderInput label={t.fireSavingsRate} value={fireSRate} onChange={setFireSRate} min={0} max={10} step={0.1} color={A.savings} suffix="%" emoji="💰" theme={theme}/>
              <NumberInput label={t.fireMonthlyInvest} value={fireInvest} onChange={setFireInvest} emoji="📈" color={A.stocks} theme={theme} symbol={cc.symbol}/>
              <SliderInput label={t.fireInvestRate} value={fireIRate} onChange={setFireIRate} min={0} max={15} step={0.1} color={A.stocks} suffix="%" emoji="🚀" theme={theme} info={ko?"주식/ETF 장기 평균 약 7%. 보수적으로 5~6% 추천":"Long-term stock/ETF avg ~7%. Conservatively 5-6%"}/>

              {/* Section 3: Retirement settings */}
              {secLabel(t.fireSection3, A.orange)}
              <SliderInput label={t.currentAge} value={age} onChange={setAge} min={18} max={65} step={1} color={A.purple} emoji="🎂" theme={theme}/>
              <SliderInput label={t.lifeExpectancy} value={lifeExp} onChange={setLifeExp} min={60} max={100} step={1} color={A.pink} emoji="🧬" theme={theme}/>
              <SliderInput label={t.withdrawRateLabel} value={wRate} onChange={setWRate} min={2} max={6} step={0.1} color={A.orange} suffix="%" emoji="📤" theme={theme}/>

              {/* ════ WITHDRAWAL RATE VISUAL EXPLANATION ════ */}
              <div style={{padding:"14px 16px",borderRadius:16,background:theme.card,border:`1px solid ${A.orange}33`,marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:800,color:A.orange,marginBottom:6}}>{t.withdrawTitle}</div>
                <p style={{fontSize:12,color:theme.text,lineHeight:1.6,marginBottom:10}}>{t.withdrawDesc}</p>

                <button onClick={()=>setShowWhy(!showWhy)} style={{padding:"6px 12px",borderRadius:10,border:`1px solid ${A.purple}33`,background:`${A.purple}08`,color:A.purple,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",marginBottom:8}}>
                  {showWhy?"▼":"▶"} {t.withdrawWhyLower}
                </button>

                {showWhy&&(<div style={{animation:"popIn 0.2s ease-out"}}>
                  <p style={{fontSize:12,color:theme.text,lineHeight:1.7,marginBottom:10,whiteSpace:"pre-line"}}>{t.withdrawWhyDesc}</p>
                  <div style={{fontSize:11,color:theme.muted,marginBottom:6}}>{t.withdrawExample}{fmt(annualExp)}</div>
                  <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${theme.border}`}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <thead><tr style={{background:theme.trackBg}}>
                        <th style={{padding:"6px 8px",textAlign:"center",color:theme.muted,fontWeight:700}}>{ko?"인출률":"Rate"}</th>
                        <th style={{padding:"6px 8px",textAlign:"center",color:theme.muted,fontWeight:700}}>{ko?"필요 자산":"Target"}</th>
                        <th style={{padding:"6px 8px",textAlign:"center",color:theme.muted,fontWeight:700}}>{ko?"위험도":"Risk"}</th>
                      </tr></thead>
                      <tbody>{wrExamples.map((ex,i)=>(
                        <tr key={i} style={{background:ex.rate===4?`${A.goal}12`:i%2===0?"transparent":theme.trackBg+"44"}}>
                          <td style={{padding:"6px 8px",textAlign:"center",fontWeight:800,color:ex.rate===4?A.goal:theme.text}}>{ex.rate}% {ex.rate===4&&(ko?"← 추천":"← rec.")}</td>
                          <td style={{padding:"6px 8px",textAlign:"center",fontWeight:700}}>{fmtS(ex.target)}</td>
                          <td style={{padding:"6px 8px",textAlign:"center"}}>{ex.rate<=3?"🟢 "+( ko?"안전":"Safe"):ex.rate<=4?"🟡 "+(ko?"보통":"OK"):"🔴 "+(ko?"위험":"Risky")}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                  <div style={{marginTop:8,padding:"8px 12px",borderRadius:10,background:`${A.orange}08`,border:`1px solid ${A.orange}22`,fontSize:12,fontWeight:700,color:A.orange}}>{t.withdrawConclusion}</div>
                </div>)}

                <div style={{marginTop:8,padding:"6px 12px",borderRadius:10,background:`${A.green}10`,fontSize:12,fontWeight:700,color:A.green}}>{t.withdrawRec}</div>
              </div>

              {/* ════ FIRE TARGET CALCULATION ════ */}
              <div style={{padding:"16px",borderRadius:16,background:`linear-gradient(135deg,${A.orange}08,${A.goal}08)`,border:`2px solid ${A.orange}22`,marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:800,color:theme.muted,marginBottom:6}}>{t.fireCalcTitle}</div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",fontSize:14,fontWeight:700,color:theme.text,marginBottom:8}}>
                  <span style={{padding:"4px 10px",borderRadius:10,background:`${A.orange}15`,color:A.orange}}>{t.fireAnnualExp}: {fmt(annualExp)}</span>
                  <span>÷</span>
                  <span style={{padding:"4px 10px",borderRadius:10,background:`${A.purple}15`,color:A.purple}}>{wRate}%</span>
                  <span>=</span>
                </div>
                <div style={{fontSize:28,fontWeight:900,color:A.orange,fontFamily:"'Baloo 2',cursive"}}>🎯 {fmt(fire.fireTarget)}</div>
                <div style={{fontSize:12,color:theme.text,fontWeight:600,marginTop:4}}>{t.fireNeedSave}</div>
                <div style={{marginTop:10,height:10,borderRadius:6,background:theme.trackBg,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:6,width:`${fireProg}%`,background:`linear-gradient(90deg,${A.orange}88,${A.orange})`,transition:"width 0.5s"}}/>
                </div>
                <div style={{fontSize:11,color:theme.muted,marginTop:4,textAlign:"right"}}>{t.fireNowVsGoal}: {fmt(tot)} / {fmt(fire.fireTarget)} ({fireProg.toFixed(1)}%)</div>
              </div>

              {/* ════ SIMULATION RESULTS ════ */}
              <div style={{fontSize:15,fontWeight:800,color:A.orange,marginBottom:4}}>{t.fireResult}</div>
              <div style={{fontSize:11,color:theme.muted,marginBottom:10,padding:"6px 10px",borderRadius:10,background:`${A.blue}08`,border:`1px solid ${A.blue}15`}}>
                {ko?`🏦 저축 ${fmt(fireSave)}/월 (${fireSRate}%) + 📈 투자 ${fmt(fireInvest)}/월 (${fireIRate}%)`:`🏦 Save ${fmt(fireSave)}/mo (${fireSRate}%) + 📈 Invest ${fmt(fireInvest)}/mo (${fireIRate}%)`}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {e:"🧓",l:t.fireAge,v:fire.fireAge>0?`${fire.fireAge}${ko?"세":""}`:"-",c:A.green,s:fire.fireAge>0?`${fire.fireAge-age}${t.years} ${t.after}`:""},
                  {e:"💰",l:t.fireMonthly,v:fmt(fireSave+fireInvest),c:A.blue,s:ko?`저축 ${fmt(fireSave)} + 투자 ${fmt(fireInvest)}`:`Sav ${fmt(fireSave)} + Inv ${fmt(fireInvest)}`},
                  {e:"🏖",l:t.fundsLastUntil,v:fLastAge>0?`${fLastAge}${ko?"세":""}`:"-",c:fSafe?A.green:A.cash,s:fire.yof>=60?"∞":`${fire.yof}${t.years}`},
                  {e:"🧬",l:t.lifeExpectancy,v:`${lifeExp}${ko?"세":""}`,c:A.pink,s:fSafe?"✅":"⚠️"},
                ].map((x,i)=>(
                  <div key={i} style={{textAlign:"center",padding:12,borderRadius:16,background:theme.card,border:`1px solid ${theme.border}`}}>
                    <div style={{fontSize:24}}>{x.e}</div>
                    <div style={{fontSize:10,color:theme.muted,fontWeight:700}}>{x.l}</div>
                    <div style={{fontSize:20,fontWeight:900,color:x.c,fontFamily:"'Baloo 2',cursive"}}>{x.v}</div>
                    {x.s&&<div style={{fontSize:10,color:theme.muted}}>{x.s}</div>}
                  </div>
                ))}
              </div>
              <div style={{marginTop:10,padding:"10px 16px",borderRadius:16,textAlign:"center",background:fSafe?`${A.green}15`:`${A.cash}15`,border:`1px solid ${fSafe?A.green:A.cash}33`}}>
                <span style={{fontSize:14,fontWeight:800}}>{fire.yof>=60?t.fundsForever:fSafe?t.fundsSafe:t.fundsWarning}</span>
              </div>
            </div>

            {/* FIRE Charts */}
            {fire.timeline.length>2&&(<div className="hc" style={{...cs(550),background:dark?"#1E2040":"#FFFAF5"}}>
              {sh(t.fireJourney,t.fireJourneyDesc,A.orange)}
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={fire.timeline.filter((_,i)=>i%2===0||i===fire.timeline.length-1)} margin={{top:5,right:10,left:0,bottom:5}}>
                  <defs><linearGradient id="gF" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A.orange} stopOpacity={0.4}/><stop offset="100%" stopColor={A.orange} stopOpacity={0.03}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border}/>
                  <XAxis dataKey="age" tick={{fontSize:10,fill:theme.muted}} label={{value:ko?"나이":"Age",position:"insideBottom",offset:-2,fontSize:10,fill:theme.muted}}/>
                  <YAxis tick={{fontSize:10,fill:theme.muted}} tickFormatter={(v:number)=>fmtS(v)}/>
                  <Tooltip content={<CTip sfx={ko?"세":" yrs"} theme={theme}/>}/>
                  <ReferenceLine y={fire.fireTarget} stroke={A.orange} strokeDasharray="8 4" strokeWidth={2} label={{value:`🔥 ${fmtS(fire.fireTarget)}`,position:"right",fill:A.orange,fontSize:10}}/>
                  {fire.fireAge>0&&<ReferenceLine x={fire.fireAge} stroke={A.green} strokeDasharray="4 4" label={{value:`🎉 ${fire.fireAge}`,position:"top",fill:A.green,fontSize:10}}/>}
                  <Area type="monotone" dataKey="savings" name={t.myAssets} stroke={A.orange} fill="url(#gF)" strokeWidth={2.5} animationDuration={1200}/>
                  <Line type="monotone" dataKey="target" name={t.targetLine} stroke={A.cash} strokeDasharray="6 3" strokeWidth={1.5} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>)}

            {fire.postFire.length>2&&(<div className="hc" style={{...cs(600),background:dark?"#1E2040":"#F0FFF5"}}>
              {sh(t.postFire,t.postFireDesc,A.green)}
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={fire.postFire} margin={{top:5,right:10,left:0,bottom:5}}>
                  <defs><linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A.green} stopOpacity={0.4}/><stop offset="100%" stopColor={A.green} stopOpacity={0.03}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border}/>
                  <XAxis dataKey="age" tick={{fontSize:10,fill:theme.muted}}/>
                  <YAxis tick={{fontSize:10,fill:theme.muted}} tickFormatter={(v:number)=>fmtS(v)}/>
                  <Tooltip content={<CTip sfx={ko?"세":" yrs"} theme={theme}/>}/>
                  <ReferenceLine x={lifeExp} stroke={A.pink} strokeDasharray="4 4" label={{value:`🧬 ${lifeExp}`,position:"top",fill:A.pink,fontSize:10}}/>
                  <Area type="monotone" dataKey="funds" name={t.remainingFunds} stroke={A.green} fill="url(#gP)" strokeWidth={2.5} animationDuration={1200}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>)}

            <div className="hc" style={cs(650)}>
              {sh(t.scenarioTitle,t.scenarioDesc,A.purple)}
              <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${theme.border}`}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:theme.trackBg}}>{[t.rate,t.needed,t.retireAge,t.lasts,t.safety].map((h,i)=>(<th key={i} style={{padding:"8px 6px",fontWeight:700,color:theme.muted,textAlign:"center",fontSize:11}}>{h}</th>))}</tr></thead>
                  <tbody>{fire.scenarios.map((s,i)=>{
                    const isCur=Math.abs(s.rate-wRate)<0.01;
                    return(<tr key={i} style={{background:isCur?`${A.goal}15`:i%2===0?"transparent":theme.trackBg+"44"}}>
                      <td style={{padding:"8px 6px",textAlign:"center",fontWeight:800,color:isCur?A.goal:theme.text}}>{s.rate}% {isCur&&`← ${t.cur}`}</td>
                      <td style={{padding:"8px 6px",textAlign:"center",fontWeight:700}}>{fmtS(s.target)}</td>
                      <td style={{padding:"8px 6px",textAlign:"center",fontWeight:800,color:s.fireAge>0?A.orange:theme.muted}}>{s.fireAge>0?s.fireAge:"-"}</td>
                      <td style={{padding:"8px 6px",textAlign:"center"}}>{s.yof>60?"∞":`${s.yof}${t.years}`}</td>
                      <td style={{padding:"8px 6px",textAlign:"center"}}><span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,background:s.safe?`${A.green}20`:`${A.cash}20`,color:s.safe?A.green:A.cash}}>{s.safe?`✅ ${t.safe}`:`⚠️ ${t.risky}`}</span></td>
                    </tr>);
                  })}</tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div className="hc" style={{...cs(150),minHeight:350}}>
              {sh(t.growthChart,"",A.green)}
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={cd} margin={{top:5,right:10,left:0,bottom:5}}>
                  <defs>
                    <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A.cash} stopOpacity={0.5}/><stop offset="100%" stopColor={A.cash} stopOpacity={0.03}/></linearGradient>
                    <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A.savings} stopOpacity={0.5}/><stop offset="100%" stopColor={A.savings} stopOpacity={0.03}/></linearGradient>
                    <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A.stocks} stopOpacity={0.5}/><stop offset="100%" stopColor={A.stocks} stopOpacity={0.03}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border}/>
                  <XAxis dataKey="month" tick={{fontSize:11,fill:theme.muted}} tickFormatter={(v:number)=>v===0?t.now:`${v}m`} interval={Math.max(0,Math.floor(cd.length/6)-1)}/>
                  <YAxis tick={{fontSize:11,fill:theme.muted}} tickFormatter={(v:number)=>fmtS(v)}/>
                  <Tooltip content={<CTip sfx={t.monthsAfter} theme={theme}/>}/>
                  <ReferenceLine y={target} stroke={A.goal} strokeDasharray="8 4" strokeWidth={2} label={{value:"🎯",position:"right",fontSize:14}}/>
                  <Area type="monotone" dataKey="stocks" name={t.stocksL} stackId="1" stroke={A.stocks} fill="url(#gi)" strokeWidth={2.5} animationDuration={1200}/>
                  <Area type="monotone" dataKey="savings" name={t.savingsL} stackId="1" stroke={A.savings} fill="url(#gs)" strokeWidth={2.5} animationDuration={1200} animationBegin={200}/>
                  <Area type="monotone" dataKey="cash" name={t.cashL} stackId="1" stroke={A.cash} fill="url(#gc)" strokeWidth={2.5} animationDuration={1200} animationBegin={400}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <div className="hc" style={cs(250)}>
                <div style={{fontFamily:"'Baloo 2',cursive",fontSize:17,fontWeight:800,color:A.pink,marginBottom:12}}>{t.assetComposition}</div>
                <div style={{position:"relative",width:"100%",maxWidth:160,margin:"0 auto"}}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart><Pie data={pd} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none">{pd.map((_,i)=><Cell key={i} fill={PC[i]}/>)}</Pie></PieChart>
                  </ResponsiveContainer>
                  <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                    <div style={{fontSize:9,color:theme.muted}}>TOTAL</div>
                    <div style={{fontSize:13,fontWeight:900,color:theme.text,fontFamily:"'Baloo 2',cursive"}}>{fmt(tot)}</div>
                  </div>
                </div>
                {pd.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}><div style={{width:12,height:12,borderRadius:4,background:PC[i],flexShrink:0}}/><div style={{flex:1,fontSize:12,fontWeight:700,color:theme.muted}}>{d.name}</div><div style={{fontSize:13,fontWeight:800,color:theme.text}}>{fmt(d.value)}</div></div>))}
              </div>
              <div style={{display:"grid",gridTemplateRows:"1fr 1fr 1fr 1fr",gap:10}}>
                {[{e:"⏰",l:t.stats.timeLeft,v:months<600?`${months}${t.months}`:t.over600,c:A.cash},{e:"📅",l:t.stats.targetYear,v:months<600?`${new Date(Date.now()+months*30.44*86400000).getFullYear()}`:"-",c:A.savings},{e:"💰",l:t.stats.monthlyTotal,v:fmt(mSave+mInvest),c:A.stocks},{e:"🎯",l:t.stats.vGoal,v:`${prog.toFixed(1)}%`,c:A.goal}].map((s,i)=>(
                  <div key={i} className="sc hc" style={{...cs(300+i*50),padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:22,animation:`float 3s ease-in-out ${i*0.4}s infinite`}}>{s.e}</div>
                    <div><div style={{fontSize:10,fontWeight:700,color:theme.muted}}>{s.l}</div><div style={{fontSize:16,fontWeight:900,color:s.c,fontFamily:"'Baloo 2',cursive"}}>{s.v}</div></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hc" style={{...cs(500),background:dark?"#1E2040":"linear-gradient(135deg,#F5F0FF,#FFF0F8)"}}>
              {sh(t.whatIf,t.whatIfDesc,A.purple)}
              <SliderInput label={t.extraSave} value={exSave} onChange={setExSave} min={0} max={cur==="KRW"?2000000:2000} step={cur==="KRW"?50000:50} color={A.savings} suffix={cc.symbol} emoji="💎" theme={theme}/>
              <SliderInput label={t.extraInvest} value={exInvest} onChange={setExInvest} min={0} max={cur==="KRW"?2000000:2000} step={cur==="KRW"?50000:50} color={A.stocks} suffix={cc.symbol} emoji="📈" theme={theme}/>
              <SliderInput label={t.boostRate} value={boostRate} onChange={setBoostRate} min={0} max={10} step={0.5} color={A.green} suffix="%" emoji="⚡" theme={theme}/>
              {hasWI&&(<div style={{marginTop:8,padding:"12px 16px",borderRadius:16,textAlign:"center",background:wiDiff>0?`${A.green}15`:`${A.cash}15`,border:`2px solid ${wiDiff>0?A.green:A.cash}33`}}>
                <div style={{fontSize:22,fontWeight:900,color:wiDiff>0?A.green:A.cash,fontFamily:"'Baloo 2',cursive"}}>{wiDiff>0?`⚡ ${wiDiff}${t.months} ${t.fasterBy}!`:ko?"변화 없음":"No change"}</div>
              </div>)}
            </div>

            <div className="hc" style={cs(550)}>
              {sh(t.yearlySnapshot,t.yearlyDesc,A.orange)}
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={yearly} margin={{top:5,right:5,left:0,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border}/>
                  <XAxis dataKey="year" tick={{fontSize:10,fill:theme.muted}}/>
                  <YAxis tick={{fontSize:10,fill:theme.muted}} tickFormatter={(v:number)=>fmtS(v)}/>
                  <Tooltip contentStyle={{background:theme.tooltipBg,borderRadius:12,border:"none"}} formatter={(value:number,name:string)=>[fmt(value),name==="deposits"?t.depositLabel:t.gainLabel]}/>
                  <Bar dataKey="deposits" name="deposits" stackId="a" fill={A.savings}/>
                  <Bar dataKey="gains" name="gains" stackId="a" fill={A.stocks} radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
              <div style={{marginTop:10,maxHeight:240,overflowY:"auto",borderRadius:12,border:`1px solid ${theme.border}`}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:theme.trackBg}}>{[t.yearLabel,t.totalLabel,t.depositLabel,t.gainLabel].map((h,i)=>(<th key={i} style={{padding:"8px 10px",fontWeight:700,color:theme.muted,textAlign:i===0?"left":"right"}}>{h}</th>))}</tr></thead>
                  <tbody>{yearly.map((r,i)=>{
                    const hit=i>0&&yearly[i-1].total<target&&r.total>=target;
                    return(<tr key={i} style={{background:hit?`${A.green}15`:i%2===0?"transparent":theme.trackBg+"44"}}>
                      <td style={{padding:"6px 10px",fontWeight:700}}>{r.year} {hit&&"🎯"}</td>
                      <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800}}>{fmt(r.total)}</td>
                      <td style={{padding:"6px 10px",textAlign:"right",color:A.savings}}>{fmt(r.deposits)}</td>
                      <td style={{padding:"6px 10px",textAlign:"right",color:A.stocks}}>{fmt(r.gains)}</td>
                    </tr>);
                  })}</tbody>
                </table>
              </div>
            </div>

            <div className="hc" style={{...cs(600),border:`2px solid ${A.goal}11`}}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:A.goal,marginBottom:12}}>{t.milestone}</div>
              {[0.25,0.5,0.75,1.0].map((pct,idx)=>{
                const ms=target*pct,mD=history.find((h)=>h.total>=ms),reached=tot>=ms;
                return(<div key={pct} className="mr" style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",marginBottom:8,background:reached?`${A.green}15`:theme.card,borderRadius:16,border:reached?`2px solid ${A.green}66`:`2px solid ${theme.border}`,transition:"all 0.3s",animation:`slideL 0.4s ease-out ${idx*0.1}s both`}}>
                  <div style={{fontSize:22,animation:reached?"wiggle 1s ease-in-out infinite":"none"}}>{reached?"✅":"⬜"}</div>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:800}}>{fmt(ms)} ({(pct*100).toFixed(0)}%)</div><div style={{fontSize:11,color:theme.muted}}>{reached?t.achieved:mD?`${t.approx} ${mD.month}${t.months} ${t.after}`:t.over600}</div></div>
                  {reached&&<div style={{fontSize:18}}>🎉</div>}
                </div>);
              })}
            </div>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:44,color:theme.muted,fontSize:12,fontWeight:600}}>{t.footer}</div>
      </div>
    </>
  );
}