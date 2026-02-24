import { useState, useMemo, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, ReferenceLine, BarChart, Bar, Line
} from "recharts";

type Lang = "ko" | "en";
type CurKey = "EUR" | "KRW";
interface TC { bg:string;card:string;text:string;subtext:string;muted:string;border:string;trackBg:string;cardShadow:string;hoverShadow:string;tooltipBg:string; }
interface CC { symbol:string;locale:string;code:string;presets:number[];maxGoal:number;maxM:number;maxI:number;stepGoal:number; }
interface HP { month:number;total:number;cash:number;savings:number;stocks:number; }

const mkT=(ko:boolean)=>({
  title:"Money Geben",subtitle:ko?"돈 모으는 재미, 여기서 시작 🚀":"Start your saving journey 🚀",
  currentAssets:ko?"🏦 현재 자산":"🏦 Current Assets",
  cash:ko?"현금":"Cash",savings:ko?"저축 (적금/예금)":"Savings",stocks:ko?"투자 (ETF/주식)":"Investments",
  monthlySettings:ko?"📆 월간 설정":"📆 Monthly Settings",
  monthlySaving:ko?"월 저축액":"Monthly Savings",monthlyInvest:ko?"월 투자액":"Monthly Investment",
  rates:ko?"📊 수익률":"📊 Returns",
  savingsRate:ko?"저축 이자율 (연)":"Savings Interest (Annual)",stockRate:ko?"투자 기대수익률 (연)":"Expected Return (Annual)",
  goal:ko?"🎯 목표 금액":"🎯 Goal Amount",goalLabel:ko?"목표":"Goal",customGoal:ko?"직접 입력":"Custom",
  growthChart:ko?"📈 자산 성장 그래프":"📈 Asset Growth Chart",
  assetComposition:ko?"🧩 자산 구성":"🧩 Composition",
  milestone:ko?"🗓 마일스톤":"🗓 Milestones",
  stats:{timeLeft:ko?"달성까지":"Time Left",targetYear:ko?"예상 연도":"Target Year",monthlyTotal:ko?"월 총 투입":"Monthly Input",vGoal:ko?"목표 대비":"vs Goal"},
  mo:ko?"개월":" mo",yr:ko?"년":" yr",monthsAfter:ko?"개월 후":" months later",
  achieved:ko?"달성!":"Done!",approx:ko?"약":"~",after:ko?"후":"later",
  currentAsset:ko?"현재 자산":"Current",remaining:ko?"목표까지":"Remaining",goalDone:ko?"달성! 🎉":"Done! 🎉",
  expectedDate:ko?"예상 달성일":"Expected",
  cashL:ko?"현금":"Cash",savingsL:ko?"저축":"Savings",stocksL:ko?"투자":"Investments",
  footer:"Made with 💜 · Money Geben",now:"Now",darkMode:ko?"다크모드":"Dark Mode",
  heroAchieve:ko?"목표 금액":"Goal",heroAchieveAt:ko?"에 달성 예상":" expected",
  progress:ko?"진행률":"Progress",
  // Top section
  topSection:ko?"💰 저축 & 목표":"💰 Savings & Goals",
  topDesc:ko?"현재 자산 현황과 목표를 관리하세요":"Manage your current assets and goals",
  // Bottom section
  bottomSection:ko?"🔥 FIRE & 은퇴 설계":"🔥 FIRE & Retirement Planning",
  bottomDesc:ko?"경제적 자유와 은퇴 후 자금 계획":"Plan for financial freedom and post-retirement",
  // FIRE
  fireCalc:ko?"🔥 FIRE 목표 계산기":"🔥 FIRE Goal Calculator",
  fireSubtitle:ko?"FIRE = 투자 수익만으로 생활비를 충당 (일 안 해도 OK!)":"FIRE = Investment returns cover expenses (no work needed!)",
  fireHow:ko?"❓ 어떻게 계산되나요?":"❓ How is this calculated?",
  fireHowDesc:ko
    ?"① 은퇴 후 연간 생활비를 정합니다\n② 투자금에서 매년 꺼내 쓸 비율(인출률)을 정합니다\n③ 연간 생활비 ÷ 인출률 = 필요한 총 자산\n\n예: 월 150만원 × 12 = 연 1,800만원\n1,800만원 ÷ 4% = 4억 5천만원 필요"
    :"① Set annual expenses\n② Set withdrawal rate (%)\n③ Annual expenses ÷ rate = Target\n\nEx: €1,500/mo × 12 = €18,000/yr\n€18,000 ÷ 4% = €450,000",
  fireSection1:ko?"💼 수입 & 지출":"💼 Income & Expenses",
  fireSection2:ko?"💰 저축 & 투자 (FIRE용)":"💰 Savings & Invest (for FIRE)",
  fireSection2Desc:ko?"FIRE 달성을 위한 월 저축/투자와 각 수익률":"Monthly savings/investment and their rates for FIRE",
  fireSection3:ko?"📤 은퇴 설정":"📤 Retirement Settings",
  monthlyExpense:ko?"월 생활비 (은퇴 후)":"Monthly Expenses (retirement)",
  monthlyIncome:ko?"월 수입":"Monthly Income",
  fireMonthlySave:ko?"월 저축액":"Monthly Savings",
  fireMonthlyInvest:ko?"월 투자액":"Monthly Investment",
  fireSavingsRate:ko?"저축 이자율 (연)":"Savings Rate (Annual)",
  fireInvestRate:ko?"투자 수익률 (연)":"Investment Return (Annual)",
  currentAge:ko?"현재 나이":"Current Age",
  lifeExpectancy:ko?"기대 수명":"Life Expectancy",
  withdrawRateLabel:ko?"연간 인출률":"Withdrawal Rate",
  withdrawTitle:ko?"📤 인출률이란?":"📤 What is Withdrawal Rate?",
  withdrawDesc:ko?"은퇴 후 매년 모은 돈에서 생활비로 꺼내 쓰는 비율":"% of savings you withdraw yearly for expenses",
  withdrawWhyLower:ko?"🤔 인출률↑ 이면 왜 목표가 줄어들까?":"🤔 Why does higher rate = lower target?",
  withdrawWhyDesc:ko?"매년 더 많이 꺼내 쓰면 적은 돈으로도 같은 생활비를 충당할 수 있어요.\n하지만 돈을 빨리 꺼내 쓰면 자금이 빨리 바닥납니다!":"Withdrawing more % means you need less total. But money runs out faster!",
  withdrawExample:ko?"예시: 연간 생활비 ":"Example: Annual expenses ",
  withdrawConclusion:ko?"→ 인출률↑ = 목표↓ (적게 모아도 됨) 하지만 위험↑":"→ Higher rate = Lower target BUT Higher risk",
  withdrawRec:ko?"💡 4%가 가장 안전한 기준 ('4% Rule')":"💡 4% is the safe standard ('4% Rule')",
  fireCalcTitle:ko?"📊 FIRE 목표 자산":"📊 FIRE Target",
  fireAnnualExp:ko?"연간 생활비":"Annual Expenses",
  fireNeedSave:ko?"이만큼 모아야 은퇴 가능!":"Save this to retire!",
  fireResult:ko?"📈 시뮬레이션 결과":"📈 Simulation Results",
  fireAge:ko?"FIRE 나이":"FIRE Age",
  fireMonthly:ko?"월 저축+투자":"Monthly Save+Invest",
  fundsLastUntil:ko?"자금 유지":"Funds Last",
  fundsSafe:ko?"✅ 기대수명까지 안전!":"✅ Safe until life expectancy!",
  fundsWarning:ko?"⚠️ 기대수명 전에 바닥!":"⚠️ Runs out early!",
  fundsForever:ko?"🎉 영구 유지! (수익 > 지출)":"🎉 Lasts forever!",
  fireJourney:ko?"📈 나이별 자산 성장":"📈 Asset Growth by Age",
  fireJourneyDesc:ko?"저축+투자 유지 시 자산 변화":"Asset growth at current rates",
  myAssets:ko?"내 자산":"My Assets",targetLine:ko?"FIRE 목표":"FIRE Target",
  postFire:ko?"🏖 은퇴 후 자금 시뮬레이션":"🏖 Post-Retirement Simulation",
  postFireDesc:ko?"FIRE 후 생활비를 꺼내 쓰면서 자금이 얼마나 유지되는지":"How long funds last while withdrawing expenses",
  remainingFunds:ko?"잔여 자금":"Remaining Funds",
  scenarioTitle:ko?"📊 인출률별 비교":"📊 Rate Comparison",
  scenarioDesc:ko?"인출률에 따라 필요 자산과 은퇴 나이가 달라져요":"Different rates change target & retirement age",
  rate:ko?"인출률":"Rate",needed:ko?"필요 자산":"Needed",retireAge:ko?"은퇴":"Retire",
  lasts:ko?"유지":"Lasts",safety:ko?"안전":"Safety",
  safe:ko?"안전":"Safe",risky:ko?"위험":"Risky",cur:ko?"현재":"Now",
  whatIf:ko?"🔮 What If 시뮬레이터":"🔮 What If Simulator",
  whatIfDesc:ko?"만약 이렇게 바꾸면 목표 달성이 얼마나 빨라질까?":"How much faster if you change things?",
  extraSave:ko?"추가 저축 (월)":"Extra Save (/mo)",extraInvest:ko?"추가 투자 (월)":"Extra Invest (/mo)",
  boostRate:ko?"수익률 부스트":"Rate Boost",fasterBy:ko?"빨라짐":"faster",
  yearlySnapshot:ko?"📅 연도별 자산 예측 (10년)":"📅 10-Year Forecast",
  yearlyDesc:ko?"현재 설정 유지 시 향후 10년":"Next 10 years at current settings",
  yearLabel:ko?"연도":"Year",totalLabel:ko?"총 자산":"Total",gainLabel:ko?"수익":"Gains",depositLabel:ko?"저축+투자":"Deposits",
  enc:[
    {t:0,e:"🌱",m:ko?"씨앗을 심었어!":"Seed planted!"},
    {t:10,e:"🌿",m:ko?"자라나고 있어~":"Growing~"},
    {t:25,e:"💪",m:ko?"1/4 왔다!":"Quarter done!"},
    {t:40,e:"🔥",m:ko?"불타오르는 중!":"On fire!"},
    {t:50,e:"🎯",m:ko?"반 왔다!!":"Halfway!!"},
    {t:60,e:"🚀",m:ko?"이제 가속!":"Accelerating!"},
    {t:75,e:"⭐",m:ko?"거의 다 왔어!":"Almost!"},
    {t:90,e:"🏆",m:ko?"코앞이야!!!":"So close!!!"},
    {t:100,e:"🎉",m:ko?"목표 달성!! 🥳":"GOAL!! 🥳"},
  ],
});

const curs:Record<CurKey,CC>={
  EUR:{symbol:"€",locale:"de-DE",code:"EUR",presets:[30000,50000,100000,200000],maxGoal:500000,maxM:5000,maxI:3000,stepGoal:1000},
  KRW:{symbol:"₩",locale:"ko-KR",code:"KRW",presets:[30000000,50000000,100000000,200000000],maxGoal:500000000,maxM:5000000,maxI:3000000,stepGoal:1000000},
};
const thms:Record<string,TC>={
  light:{bg:"#FFF8F0",card:"#FFFFFF",text:"#2D3436",subtext:"#999",muted:"#aaa",border:"#F0F0F0",trackBg:"#F0F0F0",cardShadow:"0 4px 20px rgba(0,0,0,0.06)",hoverShadow:"0 12px 40px rgba(0,0,0,0.12)",tooltipBg:"white"},
  dark:{bg:"#1A1A2E",card:"#16213E",text:"#EAEAEA",subtext:"#888",muted:"#666",border:"#2A2A4A",trackBg:"#2A2A4A",cardShadow:"0 4px 20px rgba(0,0,0,0.3)",hoverShadow:"0 12px 40px rgba(0,0,0,0.5)",tooltipBg:"#16213E"},
};
const A={cash:"#FF6B9D",sav:"#00D2FF",stk:"#FFD93D",goal:"#6C5CE7",grn:"#55EFC4",pnk:"#FD79A8",prp:"#A29BFE",org:"#FF6348",blu:"#0984E3"};

function sim(c:number,s:number,st:number,ms:number,mi:number,sr:number,ir:number,tgt:number){
  let _c=c,_s=s,_st=st,m=0;
  const h:HP[]=[{month:0,total:_c+_s+_st,cash:_c,savings:_s,stocks:_st}];
  while(_c+_s+_st<tgt&&m<1200){m++;_s=_s*(1+sr/100/12)+ms;_st=_st*(1+ir/100/12)+mi;h.push({month:m,total:_c+_s+_st,cash:_c,savings:_s,stocks:_st});}
  return{months:m,history:h};
}

function calcFIRE(age:number,cur:number,fS:number,fI:number,sr:number,ir:number,mExp:number,wr:number,le:number){
  const ae=mExp*12,ft=wr>0?ae/(wr/100):0;
  const tl:{age:number;savings:number;target:number}[]=[];
  let sp=cur*0.5,ip=cur*0.5,fa=-1;
  for(let y=0;y<=70;y++){
    const tot=sp+ip;
    tl.push({age:age+y,savings:Math.round(tot),target:Math.round(ft)});
    if(tot>=ft&&fa<0)fa=age+y;
    if(fa>0&&y>fa-age+5)break;
    sp=sp*(1+sr/100)+fS*12;ip=ip*(1+ir/100)+fI*12;
    if(age+y>=100)break;
  }
  const pf:{age:number;funds:number}[]=[];let yof=0;
  if(fa>0){let funds=tl[fa-age]?.savings??ft;const pr=ir*0.5;
    for(let y=0;y<=80;y++){pf.push({age:fa+y,funds:Math.round(Math.max(0,funds))});if(funds<=0)break;funds=funds*(1+pr/100)-ae;yof=y+1;}}
  const sc=[3,3.5,4,4.5,5].map(r=>{
    const tgt=ae/(r/100);let s=cur*0.5,i=cur*0.5,a=age;
    while(s+i<tgt&&a<100){s=s*(1+sr/100)+fS*12;i=i*(1+ir/100)+fI*12;a++;}
    const fA=s+i>=tgt?a:-1;let p=tgt,y=0;
    if(fA>0){for(let j=0;j<80;j++){if(p<=0)break;p=p*(1+ir*0.5/100)-ae;y++;}}
    return{rate:r,target:Math.round(tgt),fireAge:fA,yof:y,safe:fA>0&&fA+y>=le};
  });
  return{ft,fa,tl,pf,yof,sc};
}

function Celeb({active}:{active:boolean}){
  const p=useMemo(()=>Array.from({length:80}).map((_,i)=>({id:i,left:Math.random()*100,sz:8+Math.random()*16,dur:2.5+Math.random()*3,del:Math.random()*2.5,em:["🎉","🎊","✨","💰","🎯","⭐","💎","🏆","🔥","💜","🥳"][i%11],xd:-30+Math.random()*60,rot:Math.random()*720-360,isS:Math.random()>0.5,col:[A.cash,A.sav,A.stk,A.goal,A.grn,A.pnk,A.prp,A.org][i%8],st:i%3})),[]);
  if(!active)return null;
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,215,0,0.4) 0%,transparent 70%)",animation:"celebFlash 2s ease-out forwards"}}/>
    <div style={{position:"absolute",top:"35%",left:"50%",transform:"translateX(-50%)",fontSize:80,animation:"trophyBounce 1s cubic-bezier(.36,.07,.19,.97) 0.3s both"}}>🏆</div>
    {p.map(x=>(<div key={x.id} style={{position:"absolute",left:`${x.left}%`,bottom:"-5%",fontSize:x.isS?0:x.sz,animation:`confettiFly ${x.dur}s cubic-bezier(.2,.8,.3,1) ${x.del}s infinite`,"--xDrift":`${x.xd}px`,"--rotation":`${x.rot}deg`} as React.CSSProperties}>{x.isS?<div style={{width:x.sz*0.7,height:x.sz*0.7,background:x.col,borderRadius:x.st===0?"50%":"2px",transform:x.st===2?"rotate(45deg)":undefined}}/>:x.em}</div>))}
  </div>);
}

function Info({text,theme}:{text:string;theme:TC}){const[o,setO]=useState(false);return(<span style={{position:"relative",display:"inline-block",marginLeft:6,cursor:"pointer"}} onClick={()=>setO(!o)}><span style={{fontSize:14,opacity:0.6}}>ℹ️</span>{o&&(<div style={{position:"absolute",bottom:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",width:280,padding:"12px 14px",borderRadius:14,background:theme.tooltipBg,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",fontSize:12,fontWeight:600,color:theme.text,lineHeight:1.6,zIndex:100,animation:"popIn 0.2s",border:`1px solid ${theme.border}`,whiteSpace:"pre-line"}}>{text}</div>)}</span>);}

function Slider({label,value,onChange,min,max,step,color,suffix="",emoji,theme,info}:{label:string;value:number;onChange:(v:number)=>void;min:number;max:number;step:number;color:string;suffix?:string;emoji:string;theme:TC;info?:string}){
  const pct=Math.max(0,Math.min(100,((value-min)/(max-min))*100));
  return(<div style={{marginBottom:18}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <label style={{fontSize:13,fontWeight:700,color:theme.text}}>{emoji} {label}{info&&<Info text={info} theme={theme}/>}</label>
      <span style={{fontSize:15,fontWeight:800,color,background:color+"18",padding:"2px 12px",borderRadius:20}}>{value.toLocaleString()}{suffix}</span>
    </div>
    <div style={{position:"relative",height:8,borderRadius:10,background:theme.trackBg}}>
      <div style={{position:"absolute",left:0,top:0,height:"100%",borderRadius:10,width:`${pct}%`,background:`linear-gradient(90deg,${color}88,${color})`,transition:"width 0.15s"}}/>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} style={{position:"absolute",top:-6,left:0,width:"100%",height:20,appearance:"none",background:"transparent",cursor:"pointer",zIndex:2}}/>
    </div>
  </div>);
}

function NumIn({label,value,onChange,emoji,color,theme,symbol}:{label:string;value:number;onChange:(v:number)=>void;emoji:string;color:string;theme:TC;symbol:string}){
  const[f,setF]=useState(false);
  return(<div style={{marginBottom:14}}>
    <label style={{fontSize:12,fontWeight:700,color:theme.muted,display:"block",marginBottom:4}}>{emoji} {label}</label>
    <div style={{position:"relative"}}>
      <input type="number" value={value} onChange={e=>onChange(parseFloat(e.target.value)||0)} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{width:"100%",padding:"10px 50px 10px 14px",borderRadius:14,border:`2px solid ${f?color:color+"44"}`,fontSize:16,fontWeight:700,color:theme.text,background:theme.card,outline:"none",boxSizing:"border-box",transition:"all 0.3s",boxShadow:f?`0 0 0 4px ${color}22`:"none"}}/>
      <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:14,fontWeight:700,color}}>{symbol}</span>
    </div>
  </div>);
}

function Pill({options,value,onChange,theme}:{options:{value:string;label:string}[];value:string;onChange:(v:string)=>void;theme:TC}){
  return(<div style={{display:"inline-flex",borderRadius:30,overflow:"hidden",border:`2px solid ${theme.border}`,background:theme.card}}>
    {options.map(o=>(<button key={o.value} onClick={()=>onChange(o.value)} style={{padding:"6px 16px",border:"none",cursor:"pointer",background:value===o.value?A.goal:"transparent",color:value===o.value?"white":theme.subtext,fontWeight:700,fontSize:13,transition:"all 0.3s",fontFamily:"inherit"}}>{o.label}</button>))}
  </div>);
}

const CTip=({active,payload,label,sfx,theme}:{active?:boolean;payload?:Array<{color:string;name:string;value:number}>;label?:string;sfx:string;theme:TC})=>{
  if(!active||!payload?.length)return null;
  return(<div style={{background:theme.tooltipBg,borderRadius:16,padding:"12px 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.15)"}}>
    <p style={{fontWeight:800,fontSize:13,color:theme.muted,margin:0}}>{label}{sfx}</p>
    {payload.map((p,i)=>(<p key={i} style={{color:p.color,fontWeight:700,fontSize:14,margin:"4px 0 0"}}>{p.name}: {p.value?.toLocaleString()}</p>))}
  </div>);
};

const PC=[A.cash,A.sav,A.stk];

// Format months to readable duration
function fmtDur(m:number,ko:boolean):{short:string;long:string}{
  if(m<=0)return{short:ko?"즉시":"Now",long:ko?"이미 달성!":"Already achieved!"};
  const y=Math.floor(m/12),mo=m%12;
  if(y===0)return{short:`${mo}${ko?"개월":" mo"}`,long:`${mo}${ko?"개월":"months"}`};
  if(mo===0)return{short:`${y}${ko?"년":" yr"}`,long:`${y}${ko?"년":"years"}`};
  return{short:`${y}${ko?"년":"yr"} ${mo}${ko?"개월":"mo"}`,long:`${y}${ko?"년 ":"yr "}${mo}${ko?"개월":"mo"}`};
}

export default function App(){
  const[lang,setLang]=useState<Lang>("ko");
  const[cur,setCur]=useState<CurKey>("EUR");
  const[dark,setDark]=useState(false);
  const[cash,setCash]=useState(500);
  const[sav,setSav]=useState(12751);
  const[stk,setStk]=useState(7041);
  const[mS,setMS]=useState(1300);
  const[mI,setMI]=useState(120);
  const[sR,setSR]=useState(2.0);
  const[iR,setIR]=useState(7.0);
  const[target,setTarget]=useState(30000);
  const[custG,setCustG]=useState("");
  const[showCust,setShowCust]=useState(false);
  const[showCeleb,setShowCeleb]=useState(false);
  // FIRE
  const[fIncome,setFIncome]=useState(3500);
  const[fExpense,setFExpense]=useState(1500);
  const[fSave,setFSave]=useState(1300);
  const[fInvest,setFInvest]=useState(120);
  const[fSR,setFSR]=useState(2.0);
  const[fIR,setFIR]=useState(7.0);
  const[age,setAge]=useState(30);
  const[wR,setWR]=useState(4.0);
  const[lifeE,setLifeE]=useState(85);
  // What If
  const[exS,setExS]=useState(0);
  const[exI,setExI]=useState(0);
  const[bR,setBR]=useState(0);
  const[anim,setAnim]=useState(false);
  const[showHow,setShowHow]=useState(false);
  const[showWhy,setShowWhy]=useState(false);

  useEffect(()=>{setTimeout(()=>setAnim(true),100);},[]);
  const ko=lang==="ko";
  const t=useMemo(()=>mkT(ko),[ko]);
  const cc=curs[cur];
  const th=thms[dark?"dark":"light"];
  const fmt=useCallback((n:number)=>new Intl.NumberFormat(cc.locale,{style:"currency",currency:cc.code,maximumFractionDigits:0}).format(n),[cc]);
  const fS=useCallback((n:number)=>{if(cur==="KRW"){if(n>=1e8)return`${(n/1e8).toFixed(1)}억`;if(n>=1e4)return`${(n/1e4).toFixed(0)}만`;}if(n>=1e6)return`${(n/1e6).toFixed(1)}M`;if(n>=1e3)return`${(n/1e3).toFixed(0)}k`;return n.toLocaleString();},[cur]);

  const chgCur=(nc:string)=>{if(nc===cur)return;const f=nc==="KRW"?1500:1/1500;
    setCash(Math.round(cash*f));setSav(Math.round(sav*f));setStk(Math.round(stk*f));
    setMS(Math.round(mS*f));setMI(Math.round(mI*f));setTarget(Math.round(target*f));
    setFIncome(Math.round(fIncome*f));setFExpense(Math.round(fExpense*f));
    setFSave(Math.round(fSave*f));setFInvest(Math.round(fInvest*f));
    setExS(Math.round(exS*f));setExI(Math.round(exI*f));setCur(nc as CurKey);};

  const tot=cash+sav+stk;
  const prog=target>0?Math.min((tot/target)*100,100):0;
  const enc=(()=>{let r=t.enc[0];for(const e of t.enc)if(prog>=e.t)r=e;return r;})();
  const{months,history}=useMemo(()=>sim(cash,sav,stk,mS,mI,sR,iR,target),[cash,sav,stk,mS,mI,sR,iR,target]);
  const wiSim=useMemo(()=>sim(cash,sav,stk,mS+exS,mI+exI,sR,iR+bR,target),[cash,sav,stk,mS,mI,sR,iR,target,exS,exI,bR]);
  const cd=useMemo(()=>{const s=Math.max(1,Math.floor(history.length/80));return history.filter((_,i)=>i%s===0||i===history.length-1);},[history]);
  const pd=[{name:t.cashL,value:cash},{name:t.savingsL,value:sav},{name:t.stocksL,value:stk}].filter(d=>d.value>0);
  const fire=useMemo(()=>calcFIRE(age,tot,fSave,fInvest,fSR,fIR,fExpense,wR,lifeE),[age,tot,fSave,fInvest,fSR,fIR,fExpense,wR,lifeE]);
  const fireProg=fire.ft>0?Math.min((tot/fire.ft)*100,100):0;
  const fLA=fire.fa>0?fire.fa+fire.yof:-1;
  const fSafe=fLA>=lifeE||fire.yof>=60;
  const savRate=fIncome>0?((fIncome-fExpense)/fIncome*100):0;
  const ae=fExpense*12;
  const wrEx=[3,4,5].map(r=>({rate:r,target:Math.round(ae/(r/100))}));

  // Duration formatting
  const durStr=fmtDur(months,ko);
  const m2d=(m:number)=>{const d=new Date();d.setMonth(d.getMonth()+m);return d.toLocaleDateString(ko?"ko-KR":"en-US",{year:"numeric",month:"long"});};

  // Yearly
  const yearly=useMemo(()=>{const d:{year:number;total:number;dep:number;gain:number}[]=[];let s=sav,st=stk,c=cash;
    for(let y=1;y<=10;y++){const prev=c+s+st;for(let m=0;m<12;m++){s=s*(1+sR/100/12)+mS;st=st*(1+iR/100/12)+mI;}const total=c+s+st;const dep=(mS+mI)*12;
      d.push({year:new Date().getFullYear()+y,total:Math.round(total),dep:Math.round(dep),gain:Math.round(Math.max(0,total-prev-dep))});}return d;},[cash,sav,stk,mS,mI,sR,iR]);

  useEffect(()=>{if(prog>=100&&!showCeleb)setShowCeleb(true);if(prog<100)setShowCeleb(false);},[prog,showCeleb]);
  const applyCust=()=>{const v=parseFloat(custG.replace(/[^0-9.]/g,""));if(v>0){setTarget(v);setShowCust(false);setCustG("");}};
  const cs=(d=0):React.CSSProperties=>({background:th.card,borderRadius:24,padding:24,boxShadow:th.cardShadow,transition:"all 0.4s cubic-bezier(.4,0,.2,1)",opacity:anim?1:0,transform:anim?"translateY(0)":"translateY(30px)",transitionDelay:`${d}ms`});
  const wiDiff=months-wiSim.months;
  const hasWI=exS>0||exI>0||bR>0;
  const sh=(title:string,desc:string,col:string)=>(<><div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:col,marginBottom:4}}>{title}</div>{desc&&<p style={{fontSize:12,color:th.muted,fontWeight:600,marginBottom:16,lineHeight:1.5}}>{desc}</p>}</>);
  const secLbl=(text:string,col:string)=>(<div style={{fontSize:14,fontWeight:800,color:col,marginBottom:8,marginTop:8,padding:"6px 12px",borderRadius:10,background:`${col}10`,borderLeft:`4px solid ${col}`}}>{text}</div>);
  const divider=(title:string,desc:string,color:string,emoji:string)=>(<div style={{margin:"32px 0 20px",textAlign:"center",position:"relative"}}><div style={{position:"absolute",top:"50%",left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${color}44,transparent)`}}/><div style={{position:"relative",display:"inline-block",padding:"10px 28px",borderRadius:20,background:th.card,border:`2px solid ${color}33`,boxShadow:th.cardShadow}}><div style={{fontSize:24,marginBottom:2}}>{emoji}</div><div style={{fontFamily:"'Baloo 2',cursive",fontSize:22,fontWeight:800,color}}>{title}</div><p style={{fontSize:12,color:th.muted,fontWeight:600,margin:0}}>{desc}</p></div></div>);

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}body{background:${th.bg};transition:background 0.5s}
        @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
        @keyframes slideL{0%{transform:translateX(-40px);opacity:0}100%{transform:translateX(0);opacity:1}}
        @keyframes popIn{0%{transform:scale(0)}60%{transform:scale(1.1)}100%{transform:scale(1)}}
        @keyframes rainbowBorder{0%{border-color:${A.cash}}25%{border-color:${A.sav}}50%{border-color:${A.stk}}75%{border-color:${A.goal}}100%{border-color:${A.cash}}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes heroGlow{0%,100%{box-shadow:0 0 20px ${A.goal}22,0 4px 20px rgba(0,0,0,0.06)}50%{box-shadow:0 0 40px ${A.goal}44,0 4px 20px rgba(0,0,0,0.06)}}
        @keyframes confettiFly{0%{transform:translateY(0) translateX(0) rotate(0) scale(1);opacity:1}25%{opacity:1}100%{transform:translateY(-110vh) translateX(var(--xDrift,0px)) rotate(var(--rotation,360deg)) scale(0.3);opacity:0}}
        @keyframes celebFlash{0%{transform:translate(-50%,-50%) scale(0);opacity:0.8}100%{transform:translate(-50%,-50%) scale(4);opacity:0}}
        @keyframes trophyBounce{0%{transform:translateX(-50%) scale(0) translateY(100px);opacity:0}40%{transform:translateX(-50%) scale(1.3) translateY(-20px);opacity:1}60%{transform:translateX(-50%) scale(0.9) translateY(10px)}100%{transform:translateX(-50%) scale(1) translateY(0)}}
        @keyframes ringBurst{0%{width:40px;height:40px;opacity:0.8}100%{width:500px;height:500px;opacity:0}}
        .hc:hover{transform:translateY(-4px)!important;box-shadow:${th.hoverShadow}!important}
        input[type="range"]::-webkit-slider-thumb{appearance:none;width:24px;height:24px;border-radius:50%;background:white;border:3px solid currentColor;box-shadow:0 2px 10px rgba(0,0,0,0.2);cursor:pointer}
        input[type="number"]::-webkit-inner-spin-button{opacity:1}::selection{background:${A.goal}44}
        .mr{transition:all 0.3s}.mr:hover{transform:translateX(8px)}
        .sc{transition:all 0.3s}.sc:hover{transform:scale(1.06) translateY(-4px)}
        .pb{transition:all 0.25s}.pb:hover{transform:scale(1.08)}.pb:active{transform:scale(0.95)}
        @media(max-width:700px){.grid2{grid-template-columns:1fr!important}}
      `}</style>
      <Celeb active={showCeleb}/>
      <div style={{maxWidth:960,margin:"0 auto",padding:"20px 16px 60px",fontFamily:"'Nunito',sans-serif",color:th.text}}>

        {/* HEADER */}
        <div style={{textAlign:"center",marginBottom:28,animation:"bounceIn 0.6s ease-out"}}>
          <div style={{fontSize:52,marginBottom:4,animation:"float 3s ease-in-out infinite"}}>💰</div>
          <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:36,fontWeight:800,background:"linear-gradient(135deg,#FF6B9D,#6C5CE7,#00D2FF,#FFD93D)",backgroundSize:"300% 100%",animation:"shimmer 4s linear infinite",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{t.title}</h1>
          <p style={{fontSize:14,color:th.subtext,fontWeight:600}}>{t.subtitle}</p>
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:16,flexWrap:"wrap"}}>
            <Pill options={[{value:"ko",label:"🇰🇷 한국어"},{value:"en",label:"🇬🇧 EN"}]} value={lang} onChange={v=>setLang(v as Lang)} theme={th}/>
            <Pill options={[{value:"EUR",label:"€ EUR"},{value:"KRW",label:"₩ KRW"}]} value={cur} onChange={chgCur} theme={th}/>
            <button onClick={()=>setDark(!dark)} style={{padding:"6px 16px",borderRadius:30,border:`2px solid ${th.border}`,background:dark?A.goal:th.card,color:dark?"white":th.subtext,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{dark?"☀️":"🌙"} {t.darkMode}</button>
          </div>
        </div>

        {/* ═══════════ HERO ═══════════ */}
        <div className="hc" style={{...cs(0),marginBottom:20,textAlign:"center",position:"relative",overflow:"hidden",border:prog>=100?`3px solid ${A.grn}`:"3px solid transparent",animation:prog>=100?"rainbowBorder 3s linear infinite,pulse 2s infinite":"heroGlow 4s ease-in-out infinite"}}>
          <div style={{position:"relative",zIndex:1}}>
            <div style={{fontSize:44,marginBottom:4,animation:"wiggle 1.5s ease-in-out infinite"}}>{enc.e}</div>
            <div style={{fontSize:15,fontWeight:700,color:th.subtext,marginBottom:12}}>{enc.m}</div>
            {/* Progress bar with % always visible */}
            <div style={{position:"relative",maxWidth:520,margin:"0 auto 8px"}}>
              <div style={{height:32,borderRadius:20,background:th.trackBg,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:20,width:`${Math.min(prog,100)}%`,background:prog>=100?"linear-gradient(90deg,#FFD93D,#FF6B9D,#6C5CE7,#00D2FF,#55EFC4)":`linear-gradient(90deg,${A.cash},${A.goal},${A.sav})`,backgroundSize:prog>=100?"300% 100%":"100%",animation:prog>=100?"shimmer 2s linear infinite":undefined,transition:"width 1s cubic-bezier(.4,0,.2,1)"}}/>
              </div>
              {/* % label - always visible, positioned smart */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:32,display:"flex",alignItems:"center",justifyContent:prog<15?"flex-start":"center",paddingLeft:prog<15?`calc(${Math.min(prog,100)}% + 8px)`:0}}>
                <span style={{fontWeight:900,fontSize:14,color:prog<15?A.goal:"white",textShadow:prog>=15?"0 1px 4px rgba(0,0,0,0.3)":"none"}}>{prog.toFixed(1)}%</span>
              </div>
            </div>
            {/* 4-stat hero */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,maxWidth:640,margin:"12px auto 0"}}>
              {[
                {l:t.currentAsset,v:fmt(tot),c:A.cash,e:"💵"},
                {l:t.heroAchieve,v:fmt(target),c:A.goal,e:"🎯"},
                {l:t.remaining,v:target>tot?fmt(target-tot):t.goalDone,c:A.pnk,e:"📊"},
                {l:t.expectedDate,v:months>=1200?(ko?"100년+":"100yr+"):durStr.short,c:A.sav,e:"📅"},
              ].map((x,i)=>(
                <div key={i} style={{animation:`popIn 0.4s ease-out ${0.2+i*0.12}s both`}}>
                  <div style={{fontSize:20}}>{x.e}</div>
                  <div style={{fontSize:11,color:th.muted,fontWeight:700}}>{x.l}</div>
                  <div style={{fontSize:17,fontWeight:900,color:x.c,fontFamily:"'Baloo 2',cursive",lineHeight:1.2}}>{x.v}</div>
                </div>
              ))}
            </div>
            {months<1200&&target>tot&&(<div style={{marginTop:12,padding:"6px 18px",borderRadius:20,background:`linear-gradient(135deg,${A.goal}15,${A.sav}15)`,display:"inline-block"}}><span style={{fontSize:13,fontWeight:700}}>🗓 <strong style={{color:A.goal}}>{m2d(months)}</strong>{t.heroAchieveAt} → <strong style={{color:A.sav}}>{fmt(target)}</strong></span></div>)}
          </div>
        </div>

        {/* ═══════════ SECTION 1: SAVINGS & GOALS ═══════════ */}
        {divider(t.topSection,t.topDesc,A.goal,"💰")}

        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div className="hc" style={cs(100)}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:A.cash,marginBottom:16}}>{t.currentAssets}</div>
              <NumIn label={t.cash} value={cash} onChange={setCash} emoji="💵" color={A.cash} theme={th} symbol={cc.symbol}/>
              <NumIn label={t.savings} value={sav} onChange={setSav} emoji="🏦" color={A.sav} theme={th} symbol={cc.symbol}/>
              <NumIn label={t.stocks} value={stk} onChange={setStk} emoji="📈" color={A.stk} theme={th} symbol={cc.symbol}/>
            </div>
            <div className="hc" style={cs(200)}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:A.sav,marginBottom:16}}>{t.monthlySettings}</div>
              <Slider label={t.monthlySaving} value={mS} onChange={setMS} min={0} max={cc.maxM} step={cur==="KRW"?50000:50} color={A.sav} suffix={cc.symbol} emoji="💎" theme={th}/>
              <Slider label={t.monthlyInvest} value={mI} onChange={setMI} min={0} max={cc.maxI} step={cur==="KRW"?10000:10} color={A.stk} suffix={cc.symbol} emoji="🎯" theme={th}/>
            </div>
            <div className="hc" style={cs(300)}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:A.stk,marginBottom:16}}>{t.rates}</div>
              <Slider label={t.savingsRate} value={sR} onChange={setSR} min={0} max={10} step={0.1} color={A.sav} suffix="%" emoji="🏦" theme={th}/>
              <Slider label={t.stockRate} value={iR} onChange={setIR} min={-10} max={30} step={0.5} color={A.stk} suffix="%" emoji="📈" theme={th}/>
            </div>
            <div className="hc" style={{...cs(400),border:`2px solid ${A.goal}22`}}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:A.goal,marginBottom:16}}>{t.goal}</div>
              <Slider label={t.goalLabel} value={target} onChange={setTarget} min={cur==="KRW"?1e6:1000} max={cc.maxGoal} step={cc.stepGoal} color={A.goal} suffix={cc.symbol} emoji="🏁" theme={th}/>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6}}>
                {cc.presets.map(g=>(<button key={g} className="pb" onClick={()=>setTarget(g)} style={{padding:"7px 16px",borderRadius:20,border:"none",background:target===g?`linear-gradient(135deg,${A.goal},${A.prp})`:th.trackBg,color:target===g?"white":th.subtext,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{fmt(g)}</button>))}
                <button className="pb" onClick={()=>setShowCust(!showCust)} style={{padding:"7px 16px",borderRadius:20,border:`2px dashed ${A.goal}66`,background:"transparent",color:A.goal,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✏️ {t.customGoal}</button>
              </div>
              {showCust&&(<div style={{marginTop:12,display:"flex",gap:8}}><input type="number" value={custG} onChange={e=>setCustG(e.target.value)} placeholder={cur==="KRW"?"50000000":"75000"} onKeyDown={e=>e.key==="Enter"&&applyCust()} style={{flex:1,padding:"8px 14px",borderRadius:14,border:`2px solid ${A.goal}44`,fontSize:15,fontWeight:700,color:th.text,background:th.card,outline:"none",fontFamily:"inherit"}}/><button onClick={applyCust} style={{padding:"8px 20px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${A.goal},${A.pnk})`,color:"white",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>✓</button></div>)}
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div className="hc" style={{...cs(150),minHeight:350}}>
              {sh(t.growthChart,"",A.grn)}
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={cd} margin={{top:5,right:10,left:0,bottom:5}}>
                  <defs>
                    <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A.cash} stopOpacity={0.5}/><stop offset="100%" stopColor={A.cash} stopOpacity={0.03}/></linearGradient>
                    <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A.sav} stopOpacity={0.5}/><stop offset="100%" stopColor={A.sav} stopOpacity={0.03}/></linearGradient>
                    <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A.stk} stopOpacity={0.5}/><stop offset="100%" stopColor={A.stk} stopOpacity={0.03}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={th.border}/>
                  <XAxis dataKey="month" tick={{fontSize:11,fill:th.muted}} tickFormatter={(v:number)=>v===0?t.now:`${v}m`} interval={Math.max(0,Math.floor(cd.length/6)-1)}/>
                  <YAxis tick={{fontSize:11,fill:th.muted}} tickFormatter={(v:number)=>fS(v)}/>
                  <Tooltip content={<CTip sfx={t.monthsAfter} theme={th}/>}/>
                  <ReferenceLine y={target} stroke={A.goal} strokeDasharray="8 4" strokeWidth={2} label={{value:"🎯",position:"right",fontSize:14}}/>
                  <Area type="monotone" dataKey="stocks" name={t.stocksL} stackId="1" stroke={A.stk} fill="url(#gi)" strokeWidth={2.5} animationDuration={1200}/>
                  <Area type="monotone" dataKey="savings" name={t.savingsL} stackId="1" stroke={A.sav} fill="url(#gs)" strokeWidth={2.5} animationDuration={1200}/>
                  <Area type="monotone" dataKey="cash" name={t.cashL} stackId="1" stroke={A.cash} fill="url(#gc)" strokeWidth={2.5} animationDuration={1200}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <div className="hc" style={cs(250)}>
                <div style={{fontFamily:"'Baloo 2',cursive",fontSize:17,fontWeight:800,color:A.pnk,marginBottom:12}}>{t.assetComposition}</div>
                <div style={{position:"relative",width:"100%",maxWidth:160,margin:"0 auto"}}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart><Pie data={pd} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none">{pd.map((_,i)=><Cell key={i} fill={PC[i]}/>)}</Pie></PieChart>
                  </ResponsiveContainer>
                  <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                    <div style={{fontSize:9,color:th.muted}}>TOTAL</div>
                    <div style={{fontSize:13,fontWeight:900,color:th.text,fontFamily:"'Baloo 2',cursive"}}>{fS(tot)}</div>
                  </div>
                </div>
                {pd.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}><div style={{width:12,height:12,borderRadius:4,background:PC[i]}}/><div style={{flex:1,fontSize:12,fontWeight:700,color:th.muted}}>{d.name}</div><div style={{fontSize:13,fontWeight:800,color:th.text}}>{fmt(d.value)}</div></div>))}
              </div>
              <div style={{display:"grid",gridTemplateRows:"1fr 1fr 1fr 1fr",gap:10}}>
                {[{e:"⏰",l:t.stats.timeLeft,v:months>=1200?(ko?"100년+":"100yr+"):durStr.short,c:A.cash},{e:"📅",l:t.stats.targetYear,v:months<1200?`${new Date(Date.now()+months*30.44*864e5).getFullYear()}`:"-",c:A.sav},{e:"💰",l:t.stats.monthlyTotal,v:fmt(mS+mI),c:A.stk},{e:"🎯",l:t.stats.vGoal,v:`${prog.toFixed(1)}%`,c:A.goal}].map((s,i)=>(
                  <div key={i} className="sc hc" style={{...cs(300+i*50),padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:22,animation:`float 3s ease-in-out ${i*0.4}s infinite`}}>{s.e}</div>
                    <div><div style={{fontSize:10,fontWeight:700,color:th.muted}}>{s.l}</div><div style={{fontSize:16,fontWeight:900,color:s.c,fontFamily:"'Baloo 2',cursive"}}>{s.v}</div></div>
                  </div>
                ))}
              </div>
            </div>

            {/* What If */}
            <div className="hc" style={{...cs(450),background:dark?"#1E2040":"linear-gradient(135deg,#F5F0FF,#FFF0F8)"}}>
              {sh(t.whatIf,t.whatIfDesc,A.prp)}
              <Slider label={t.extraSave} value={exS} onChange={setExS} min={0} max={cur==="KRW"?2e6:2000} step={cur==="KRW"?50000:50} color={A.sav} suffix={cc.symbol} emoji="💎" theme={th}/>
              <Slider label={t.extraInvest} value={exI} onChange={setExI} min={0} max={cur==="KRW"?2e6:2000} step={cur==="KRW"?50000:50} color={A.stk} suffix={cc.symbol} emoji="📈" theme={th}/>
              <Slider label={t.boostRate} value={bR} onChange={setBR} min={0} max={10} step={0.5} color={A.grn} suffix="%" emoji="⚡" theme={th}/>
              {hasWI&&(<div style={{marginTop:8,padding:"12px 16px",borderRadius:16,textAlign:"center",background:wiDiff>0?`${A.grn}15`:`${A.cash}15`,border:`2px solid ${wiDiff>0?A.grn:A.cash}33`}}>
                <div style={{fontSize:22,fontWeight:900,color:wiDiff>0?A.grn:A.cash,fontFamily:"'Baloo 2',cursive"}}>{wiDiff>0?`⚡ ${fmtDur(wiDiff,ko).short} ${t.fasterBy}!`:ko?"변화 없음":"No change"}</div>
              </div>)}
            </div>

            {/* Yearly */}
            <div className="hc" style={cs(500)}>
              {sh(t.yearlySnapshot,t.yearlyDesc,A.org)}
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={yearly} margin={{top:5,right:5,left:0,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={th.border}/>
                  <XAxis dataKey="year" tick={{fontSize:10,fill:th.muted}}/>
                  <YAxis tick={{fontSize:10,fill:th.muted}} tickFormatter={(v:number)=>fS(v)}/>
                  <Tooltip contentStyle={{background:th.tooltipBg,borderRadius:12,border:"none"}} formatter={(v:number,n:string)=>[fmt(v),n==="dep"?t.depositLabel:t.gainLabel]}/>
                  <Bar dataKey="dep" name="dep" stackId="a" fill={A.sav}/>
                  <Bar dataKey="gain" name="gain" stackId="a" fill={A.stk} radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
              <div style={{marginTop:10,maxHeight:220,overflowY:"auto",borderRadius:12,border:`1px solid ${th.border}`}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:th.trackBg}}>{[t.yearLabel,t.totalLabel,t.depositLabel,t.gainLabel].map((h,i)=>(<th key={i} style={{padding:"8px 10px",fontWeight:700,color:th.muted,textAlign:i===0?"left":"right"}}>{h}</th>))}</tr></thead>
                  <tbody>{yearly.map((r,i)=>{const hit=i>0&&yearly[i-1].total<target&&r.total>=target;
                    return(<tr key={i} style={{background:hit?`${A.grn}15`:i%2===0?"transparent":th.trackBg+"44"}}>
                      <td style={{padding:"6px 10px",fontWeight:700}}>{r.year} {hit&&"🎯"}</td>
                      <td style={{padding:"6px 10px",textAlign:"right",fontWeight:800}}>{fmt(r.total)}</td>
                      <td style={{padding:"6px 10px",textAlign:"right",color:A.sav}}>{fmt(r.dep)}</td>
                      <td style={{padding:"6px 10px",textAlign:"right",color:A.stk}}>{fmt(r.gain)}</td>
                    </tr>);})}</tbody>
                </table>
              </div>
            </div>

            {/* Milestone */}
            <div className="hc" style={{...cs(550),border:`2px solid ${A.goal}11`}}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:A.goal,marginBottom:12}}>{t.milestone}</div>
              {[0.25,0.5,0.75,1.0].map((pct,idx)=>{
                const ms=target*pct,mD=history.find(h=>h.total>=ms),reached=tot>=ms;
                return(<div key={pct} className="mr" style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",marginBottom:8,background:reached?`${A.grn}15`:th.card,borderRadius:16,border:reached?`2px solid ${A.grn}66`:`2px solid ${th.border}`,animation:`slideL 0.4s ease-out ${idx*0.1}s both`}}>
                  <div style={{fontSize:22,animation:reached?"wiggle 1s ease-in-out infinite":"none"}}>{reached?"✅":"⬜"}</div>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:800}}>{fmt(ms)} ({(pct*100).toFixed(0)}%)</div><div style={{fontSize:11,color:th.muted}}>{reached?t.achieved:mD?`${t.approx} ${fmtDur(mD.month,ko).short} ${t.after} (${m2d(mD.month)})`:ko?"100년+":"100yr+"}</div></div>
                  {reached&&<div style={{fontSize:18}}>🎉</div>}
                </div>);
              })}
            </div>
          </div>
        </div>

        {/* ═══════════ SECTION 2: FIRE & RETIREMENT ═══════════ */}
        {divider(t.bottomSection,t.bottomDesc,A.org,"🔥")}

        <div className="grid2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"start"}}>
          {/* LEFT: FIRE Calculator */}
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div className="hc" style={{...cs(100),background:dark?"#1E1E3A":"linear-gradient(135deg,#FFF5F5,#FFF0E8)",border:`2px solid ${A.org}22`}}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:22,fontWeight:800,color:A.org,marginBottom:2}}>{t.fireCalc}</div>
              <p style={{fontSize:13,color:th.text,fontWeight:600,marginBottom:12,lineHeight:1.6,padding:"8px 12px",borderRadius:12,background:`${A.org}08`,border:`1px solid ${A.org}15`}}>{t.fireSubtitle}</p>

              <button onClick={()=>setShowHow(!showHow)} style={{width:"100%",padding:"10px 14px",borderRadius:14,border:`2px solid ${A.blu}33`,background:`${A.blu}08`,color:A.blu,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:14,textAlign:"left"}}>
                {showHow?"▼":"▶"} {t.fireHow}
              </button>
              {showHow&&(<div style={{padding:"12px 16px",borderRadius:14,background:th.card,border:`1px solid ${th.border}`,marginBottom:14,fontSize:13,color:th.text,lineHeight:1.8,whiteSpace:"pre-line",animation:"popIn 0.2s"}}>{t.fireHowDesc}</div>)}

              {secLbl(t.fireSection1,A.blu)}
              <NumIn label={t.monthlyIncome} value={fIncome} onChange={setFIncome} emoji="💼" color={A.grn} theme={th} symbol={cc.symbol}/>
              <NumIn label={t.monthlyExpense} value={fExpense} onChange={setFExpense} emoji="🛒" color={A.org} theme={th} symbol={cc.symbol}/>
              <div style={{margin:"4px 0 12px",padding:"10px 14px",borderRadius:14,background:th.card,border:`1px solid ${th.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:700,color:th.text}}>📊 {ko?"저축률":"Savings Rate"}<Info text={ko?"수입 중 저축 비율. 높을수록 빨리 FIRE!":"% of income saved. Higher = FIRE sooner!"} theme={th}/></span>
                  <span style={{fontSize:16,fontWeight:900,color:savRate>=50?A.grn:savRate>=20?A.stk:A.cash}}>{savRate.toFixed(1)}%</span>
                </div>
                <div style={{height:8,borderRadius:6,background:th.trackBg,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:6,width:`${Math.max(0,Math.min(savRate,100))}%`,background:savRate>=50?A.grn:savRate>=20?A.stk:A.cash,transition:"width 0.5s"}}/>
                </div>
              </div>

              {secLbl(t.fireSection2,A.sav)}
              <p style={{fontSize:11,color:th.muted,marginBottom:10}}>{t.fireSection2Desc}</p>
              <NumIn label={t.fireMonthlySave} value={fSave} onChange={setFSave} emoji="🏦" color={A.sav} theme={th} symbol={cc.symbol}/>
              <Slider label={t.fireSavingsRate} value={fSR} onChange={setFSR} min={0} max={10} step={0.1} color={A.sav} suffix="%" emoji="💰" theme={th}/>
              <NumIn label={t.fireMonthlyInvest} value={fInvest} onChange={setFInvest} emoji="📈" color={A.stk} theme={th} symbol={cc.symbol}/>
              <Slider label={t.fireInvestRate} value={fIR} onChange={setFIR} min={0} max={15} step={0.1} color={A.stk} suffix="%" emoji="🚀" theme={th} info={ko?"장기 평균 ~7%. 보수적 5~6%":"Long-term avg ~7%. Conservative 5-6%"}/>

              {secLbl(t.fireSection3,A.org)}
              <Slider label={t.currentAge} value={age} onChange={setAge} min={18} max={65} step={1} color={A.prp} emoji="🎂" theme={th}/>
              <Slider label={t.lifeExpectancy} value={lifeE} onChange={setLifeE} min={60} max={100} step={1} color={A.pnk} emoji="🧬" theme={th}/>
              <Slider label={t.withdrawRateLabel} value={wR} onChange={setWR} min={2} max={6} step={0.1} color={A.org} suffix="%" emoji="📤" theme={th}/>

              {/* Withdrawal explanation */}
              <div style={{padding:"14px 16px",borderRadius:16,background:th.card,border:`1px solid ${A.org}33`,marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:800,color:A.org,marginBottom:6}}>{t.withdrawTitle}</div>
                <p style={{fontSize:12,color:th.text,lineHeight:1.6,marginBottom:8}}>{t.withdrawDesc}</p>
                <button onClick={()=>setShowWhy(!showWhy)} style={{padding:"6px 12px",borderRadius:10,border:`1px solid ${A.prp}33`,background:`${A.prp}08`,color:A.prp,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",marginBottom:8}}>{showWhy?"▼":"▶"} {t.withdrawWhyLower}</button>
                {showWhy&&(<div style={{animation:"popIn 0.2s"}}>
                  <p style={{fontSize:12,color:th.text,lineHeight:1.7,marginBottom:8,whiteSpace:"pre-line"}}>{t.withdrawWhyDesc}</p>
                  <div style={{fontSize:11,color:th.muted,marginBottom:6}}>{t.withdrawExample}{fmt(ae)}</div>
                  <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${th.border}`,marginBottom:8}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <thead><tr style={{background:th.trackBg}}><th style={{padding:"6px 8px",textAlign:"center",color:th.muted}}>{ko?"인출률":"Rate"}</th><th style={{padding:"6px 8px",textAlign:"center",color:th.muted}}>{ko?"필요 자산":"Target"}</th><th style={{padding:"6px 8px",textAlign:"center",color:th.muted}}>{ko?"위험도":"Risk"}</th></tr></thead>
                      <tbody>{wrEx.map((ex,i)=>(<tr key={i} style={{background:ex.rate===4?`${A.goal}12`:i%2===0?"transparent":th.trackBg+"44"}}><td style={{padding:"6px 8px",textAlign:"center",fontWeight:800,color:ex.rate===4?A.goal:th.text}}>{ex.rate}%{ex.rate===4&&(ko?" ← 추천":" ← rec.")}</td><td style={{padding:"6px 8px",textAlign:"center",fontWeight:700}}>{fS(ex.target)}</td><td style={{padding:"6px 8px",textAlign:"center"}}>{ex.rate<=3?"🟢"+(ko?" 안전":" Safe"):ex.rate<=4?"🟡"+(ko?" 보통":" OK"):"🔴"+(ko?" 위험":" Risky")}</td></tr>))}</tbody>
                    </table>
                  </div>
                  <div style={{padding:"8px 12px",borderRadius:10,background:`${A.org}08`,fontSize:12,fontWeight:700,color:A.org}}>{t.withdrawConclusion}</div>
                </div>)}
                <div style={{marginTop:8,padding:"6px 12px",borderRadius:10,background:`${A.grn}10`,fontSize:12,fontWeight:700,color:A.grn}}>{t.withdrawRec}</div>
              </div>

              {/* FIRE TARGET */}
              <div style={{padding:"16px",borderRadius:16,background:`linear-gradient(135deg,${A.org}08,${A.goal}08)`,border:`2px solid ${A.org}22`,marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:800,color:th.muted,marginBottom:6}}>{t.fireCalcTitle}</div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",fontSize:14,fontWeight:700,marginBottom:8}}>
                  <span style={{padding:"4px 10px",borderRadius:10,background:`${A.org}15`,color:A.org}}>{t.fireAnnualExp}: {fmt(ae)}</span><span>÷</span>
                  <span style={{padding:"4px 10px",borderRadius:10,background:`${A.prp}15`,color:A.prp}}>{wR}%</span><span>=</span>
                </div>
                <div style={{fontSize:28,fontWeight:900,color:A.org,fontFamily:"'Baloo 2',cursive"}}>🎯 {fmt(fire.ft)}</div>
                <div style={{fontSize:12,color:th.text,fontWeight:600,marginTop:4}}>{t.fireNeedSave}</div>
                {/* FIRE progress bar with % always visible */}
                <div style={{position:"relative",marginTop:10}}>
                  <div style={{height:12,borderRadius:8,background:th.trackBg,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:8,width:`${fireProg}%`,background:`linear-gradient(90deg,${A.org}88,${A.org})`,transition:"width 0.5s"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:11,color:th.muted}}>
                    <span>{fmt(tot)}</span>
                    <span style={{fontWeight:800,color:A.org}}>{fireProg.toFixed(1)}%</span>
                    <span>{fmt(fire.ft)}</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div style={{fontSize:15,fontWeight:800,color:A.org,marginBottom:4}}>{t.fireResult}</div>
              <div style={{fontSize:11,color:th.muted,marginBottom:10,padding:"6px 10px",borderRadius:10,background:`${A.blu}08`,border:`1px solid ${A.blu}15`}}>
                {ko?`🏦 저축 ${fmt(fSave)}/월 (${fSR}%) + 📈 투자 ${fmt(fInvest)}/월 (${fIR}%)`:`🏦 ${fmt(fSave)}/mo (${fSR}%) + 📈 ${fmt(fInvest)}/mo (${fIR}%)`}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {e:"🧓",l:t.fireAge,v:fire.fa>0?`${fire.fa}${ko?"세":""}`:"-",c:A.grn,s:fire.fa>0?`${fire.fa-age}${t.yr} ${t.after}`:""},
                  {e:"💰",l:t.fireMonthly,v:fmt(fSave+fInvest),c:A.blu,s:""},
                  {e:"🏖",l:t.fundsLastUntil,v:fLA>0?`${fLA}${ko?"세":""}`:"-",c:fSafe?A.grn:A.cash,s:fire.yof>=60?"∞":`${fire.yof}${t.yr}`},
                  {e:"🧬",l:t.lifeExpectancy,v:`${lifeE}${ko?"세":""}`,c:A.pnk,s:fSafe?"✅":"⚠️"},
                ].map((x,i)=>(
                  <div key={i} style={{textAlign:"center",padding:12,borderRadius:16,background:th.card,border:`1px solid ${th.border}`}}>
                    <div style={{fontSize:24}}>{x.e}</div>
                    <div style={{fontSize:10,color:th.muted,fontWeight:700}}>{x.l}</div>
                    <div style={{fontSize:20,fontWeight:900,color:x.c,fontFamily:"'Baloo 2',cursive"}}>{x.v}</div>
                    {x.s&&<div style={{fontSize:10,color:th.muted}}>{x.s}</div>}
                  </div>
                ))}
              </div>
              <div style={{marginTop:10,padding:"10px 16px",borderRadius:16,textAlign:"center",background:fSafe?`${A.grn}15`:`${A.cash}15`,border:`1px solid ${fSafe?A.grn:A.cash}33`}}>
                <span style={{fontSize:14,fontWeight:800}}>{fire.yof>=60?t.fundsForever:fSafe?t.fundsSafe:t.fundsWarning}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Charts & Scenarios */}
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {fire.tl.length>2&&(<div className="hc" style={{...cs(150),background:dark?"#1E2040":"#FFFAF5"}}>
              {sh(t.fireJourney,t.fireJourneyDesc,A.org)}
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={fire.tl.filter((_,i)=>i%2===0||i===fire.tl.length-1)} margin={{top:5,right:10,left:0,bottom:5}}>
                  <defs><linearGradient id="gF" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A.org} stopOpacity={0.4}/><stop offset="100%" stopColor={A.org} stopOpacity={0.03}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={th.border}/>
                  <XAxis dataKey="age" tick={{fontSize:10,fill:th.muted}} label={{value:ko?"나이":"Age",position:"insideBottom",offset:-2,fontSize:10,fill:th.muted}}/>
                  <YAxis tick={{fontSize:10,fill:th.muted}} tickFormatter={(v:number)=>fS(v)}/>
                  <Tooltip content={<CTip sfx={ko?"세":" yrs"} theme={th}/>}/>
                  <ReferenceLine y={fire.ft} stroke={A.org} strokeDasharray="8 4" strokeWidth={2} label={{value:`🔥 ${fS(fire.ft)}`,position:"right",fill:A.org,fontSize:10}}/>
                  {fire.fa>0&&<ReferenceLine x={fire.fa} stroke={A.grn} strokeDasharray="4 4" label={{value:`🎉 ${fire.fa}`,position:"top",fill:A.grn,fontSize:10}}/>}
                  <Area type="monotone" dataKey="savings" name={t.myAssets} stroke={A.org} fill="url(#gF)" strokeWidth={2.5} animationDuration={1200}/>
                  <Line type="monotone" dataKey="target" name={t.targetLine} stroke={A.cash} strokeDasharray="6 3" strokeWidth={1.5} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>)}

            {fire.pf.length>2&&(<div className="hc" style={{...cs(250),background:dark?"#1E2040":"#F0FFF5"}}>
              {sh(t.postFire,t.postFireDesc,A.grn)}
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={fire.pf} margin={{top:5,right:10,left:0,bottom:5}}>
                  <defs><linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A.grn} stopOpacity={0.4}/><stop offset="100%" stopColor={A.grn} stopOpacity={0.03}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={th.border}/>
                  <XAxis dataKey="age" tick={{fontSize:10,fill:th.muted}} label={{value:ko?"나이":"Age",position:"insideBottom",offset:-2,fontSize:10,fill:th.muted}}/>
                  <YAxis tick={{fontSize:10,fill:th.muted}} tickFormatter={(v:number)=>fS(v)}/>
                  <Tooltip content={<CTip sfx={ko?"세":" yrs"} theme={th}/>}/>
                  <ReferenceLine x={lifeE} stroke={A.pnk} strokeDasharray="4 4" label={{value:`🧬 ${lifeE}`,position:"top",fill:A.pnk,fontSize:10}}/>
                  <Area type="monotone" dataKey="funds" name={t.remainingFunds} stroke={A.grn} fill="url(#gP)" strokeWidth={2.5} animationDuration={1200}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>)}

            <div className="hc" style={cs(350)}>
              {sh(t.scenarioTitle,t.scenarioDesc,A.prp)}
              <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${th.border}`}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:th.trackBg}}>{[t.rate,t.needed,t.retireAge,t.lasts,t.safety].map((h,i)=>(<th key={i} style={{padding:"8px 6px",fontWeight:700,color:th.muted,textAlign:"center",fontSize:11}}>{h}</th>))}</tr></thead>
                  <tbody>{fire.sc.map((s,i)=>{const isCur=Math.abs(s.rate-wR)<0.01;
                    return(<tr key={i} style={{background:isCur?`${A.goal}15`:i%2===0?"transparent":th.trackBg+"44"}}>
                      <td style={{padding:"8px 6px",textAlign:"center",fontWeight:800,color:isCur?A.goal:th.text}}>{s.rate}%{isCur&&` ← ${t.cur}`}</td>
                      <td style={{padding:"8px 6px",textAlign:"center",fontWeight:700}}>{fS(s.target)}</td>
                      <td style={{padding:"8px 6px",textAlign:"center",fontWeight:800,color:s.fireAge>0?A.org:th.muted}}>{s.fireAge>0?s.fireAge:"-"}</td>
                      <td style={{padding:"8px 6px",textAlign:"center"}}>{s.yof>60?"∞":`${s.yof}${t.yr}`}</td>
                      <td style={{padding:"8px 6px",textAlign:"center"}}><span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,background:s.safe?`${A.grn}20`:`${A.cash}20`,color:s.safe?A.grn:A.cash}}>{s.safe?`✅ ${t.safe}`:`⚠️ ${t.risky}`}</span></td>
                    </tr>);})}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div style={{textAlign:"center",marginTop:44,color:th.muted,fontSize:12,fontWeight:600}}>{t.footer}</div>
      </div>
    </>
  );
}