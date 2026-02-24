import { useState, useMemo, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, ReferenceLine, BarChart, Bar, Line
} from "recharts";

type Lang="ko"|"en"; type CurKey="EUR"|"KRW";
interface TC{bg:string;card:string;text:string;sub:string;mut:string;bdr:string;trk:string;shd:string;hov:string;tip:string;card2:string;}
interface CC{symbol:string;locale:string;code:string;presets:number[];maxG:number;maxM:number;maxI:number;stepG:number;}
interface HP{month:number;total:number;cash:number;savings:number;stocks:number;}

const T=(ko:boolean)=>({
  title:"돈아껴서 돈모으는법",sub:ko?"일하기 시러요":"Start your saving journey 🚀",
  curAssets:ko?"🏦 현재 자산":"🏦 Current Assets",
  cash:ko?"현금 (통장)":"Cash",sav:ko?"저축 (적금/예금)":"Savings",stk:ko?"투자 (ETF/주식)":"Investments",
  monthly:ko?"📆 월간 설정":"📆 Monthly Settings",
  mSave:ko?"월 저축액":"Monthly Savings",mInvest:ko?"월 투자액":"Monthly Investment",
  rates:ko?"📊 수익률 설정":"📊 Return Rates",
  sRate:ko?"저축 이자율 (연)":"Savings Interest (Annual)",iRate:ko?"투자 기대수익률 (연)":"Expected Return (Annual)",
  goal:ko?"🎯 목표 금액":"🎯 Goal Amount",goalL:ko?"목표":"Goal",custom:ko?"직접 입력":"Custom",
  chart:ko?"📈 자산 성장 그래프":"📈 Asset Growth Chart",
  comp:ko?"🧩 자산 구성":"🧩 Asset Composition",
  mile:ko?"🗓 마일스톤 타임라인":"🗓 Milestone Timeline",
  tLeft:ko?"달성까지":"Time Left",tYear:ko?"예상 연도":"Target Year",mTotal:ko?"월 투입":"Monthly",vGoal:ko?"달성률":"Progress",
  mo:ko?"개월":"mo",yr:ko?"년":"yr",after:ko?"후":"later",approx:ko?"약":"~",mAfter:ko?"개월 후":" months later",
  achieved:ko?"달성!":"Done!",goalDone:ko?"달성! 🎉":"Done! 🎉",
  curAsset:ko?"현재 자산":"Current",remaining:ko?"목표까지":"Remaining",
  expDate:ko?"예상 달성일":"Expected",
  cashL:ko?"현금":"Cash",savL:ko?"저축":"Savings",stkL:ko?"투자":"Invest",
  footer:"Made with 💜 · AI",now:"Now",dark:ko?"다크모드":"Dark Mode",
  heroGoal:ko?"목표 금액":"Goal",heroAt:ko?"에 달성 예상":" expected",
  progress:ko?"진행률":"Progress",
  // What If
  whatIf:ko?"🔮 What If 시뮬레이터":"🔮 What If Simulator",
  whatIfD:ko?"만약 이렇게 바꾸면 얼마나 빨라질까?":"How much faster if you change things?",
  exS:ko?"추가 저축 (월)":"Extra Save (/mo)",exI:ko?"추가 투자 (월)":"Extra Invest (/mo)",
  boost:ko?"수익률 부스트":"Rate Boost",faster:ko?"빨라짐":"faster",
  yearly:ko?"📅 연도별 자산 예측":"📅 10-Year Forecast",yearlyD:ko?"현재 설정 유지 시 향후 10년":"Next 10 years at current rate",
  yearL:ko?"연도":"Year",totalL:ko?"총 자산":"Total",gainL:ko?"수익":"Gains",depL:ko?"저축+투자":"Deposits",
  // FIRE
  fireTitle:ko?"🔥 FIRE 은퇴 설계":"🔥 FIRE Retirement Planner",
  fireSub:ko?"경제적 자유 (Financial Independence, Retire Early)":"Financial Independence, Retire Early",
  fireIntro:ko
    ?"FIRE란 투자 수익만으로 생활비를 충당할 수 있는 상태예요.\n일하지 않아도 투자에서 나오는 돈으로 살 수 있는 거죠!\n\n핵심 공식: 연간 생활비 ÷ 인출률 = 필요 자산\n\n예를 들어 월 150만원(연 1,800만원)이 필요하고,\n매년 투자금의 4%를 꺼내 쓴다면:\n1,800만원 ÷ 0.04 = 4억 5천만원이 필요해요."
    :"FIRE means your investment returns cover all living expenses.\nYou can live without working!\n\nCore formula: Annual expenses ÷ Withdrawal rate = Target\n\nExample: If you need €1,500/mo (€18,000/yr),\nand withdraw 4% yearly:\n€18,000 ÷ 0.04 = €450,000 needed.",
  fireHow:ko?"📖 자세한 설명 보기":"📖 Learn More",
  fireDetail:ko
    ?"🔹 인출률 (Withdrawal Rate)\n은퇴 후 매년 모은 돈에서 꺼내 쓰는 비율이에요.\n4%가 가장 안전한 기준 ('4% Rule')으로,\n미국 주식시장 역사 데이터를 기반으로 만들어졌어요.\n\n🔹 왜 인출률이 높으면 목표가 줄어들까?\n매년 더 많은 비율을 꺼내 쓰면, 같은 생활비를 만들기 위해\n더 적은 돈이 필요해요. 하지만 돈이 빨리 바닥날 위험이 있어요!\n• 3% → 안전하지만 많이 모아야 함\n• 4% → 균형 잡힌 추천 기준\n• 5% → 적게 모아도 되지만 위험\n\n🔹 은퇴 후 수익률\nFIRE 달성 후에는 보수적으로 투자하게 되어\n수익률이 절반 정도로 떨어진다고 가정합니다.\n\n🔹 저축 vs 투자\n저축은 안전하지만 이자가 낮고,\n투자는 수익이 높지만 변동성이 있어요.\n둘 다 적절히 배분하는 게 중요합니다!"
    :"🔹 Withdrawal Rate\nThe % you take out of savings yearly in retirement.\n4% is the safest standard ('4% Rule'),\nbased on US stock market historical data.\n\n🔹 Why does higher rate = lower target?\nWithdrawing more % means less total needed for same expenses.\nBut money runs out faster!\n• 3% → Safe but need more savings\n• 4% → Balanced recommendation\n• 5% → Need less but risky\n\n🔹 Post-retirement returns\nAfter FIRE, investing becomes conservative,\nso returns drop to about half.\n\n🔹 Savings vs Investment\nSavings are safe but low interest.\nInvestments have higher returns but volatility.\nBalance both appropriately!",
  fSec1:ko?"Step 1. 수입과 지출":"Step 1. Income & Expenses",
  fSec1D:ko?"매달 얼마를 벌고, 은퇴 후 얼마가 필요한가요?":"How much do you earn, and need in retirement?",
  fSec2:ko?"Step 2. 저축 & 투자 계획":"Step 2. Savings & Investment Plan",
  fSec2D:ko?"FIRE 달성을 위해 매달 얼마를 저축하고 투자하나요?":"How much will you save & invest monthly for FIRE?",
  fSec3:ko?"Step 3. 은퇴 설정":"Step 3. Retirement Settings",
  fSec3D:ko?"나이, 기대수명, 인출률을 설정하세요":"Set your age, life expectancy, and withdrawal rate",
  mExp:ko?"월 생활비 (은퇴 후)":"Monthly Expenses (retirement)",
  mInc:ko?"월 수입":"Monthly Income",
  fmSave:ko?"월 저축액":"Monthly Savings",fmInvest:ko?"월 투자액":"Monthly Investment",
  fsRate:ko?"저축 이자율 (연)":"Savings Rate (Annual)",
  fiRate:ko?"투자 수익률 (연)":"Investment Return (Annual)",
  curAge:ko?"현재 나이":"Current Age",lifeE:ko?"기대 수명":"Life Expectancy",
  wrLabel:ko?"연간 인출률":"Withdrawal Rate",
  wrRec:ko?"💡 4%가 가장 안전한 기준 ('4% Rule')":"💡 4% is the safe standard ('4% Rule')",
  wrWarn:ko?"⚠️ 높은 인출률 = 빨리 소진될 수 있어요":"⚠️ High rate = may run out faster",
  wrSafe:ko?"✅ 낮은 인출률 = 안전하지만 더 모아야 해요":"✅ Low rate = safer but need more",
  fCalc:ko?"📊 FIRE 목표 계산":"📊 FIRE Target Calculation",
  fAnnExp:ko?"연간 생활비":"Annual Expenses",
  fNeed:ko?"이만큼 모아야 은퇴 가능!":"Save this much to retire!",
  fResult:ko?"📈 시뮬레이션 결과":"📈 Simulation Results",
  fAge:ko?"FIRE 나이":"FIRE Age",fMo:ko?"월 저축+투자":"Monthly Total",
  fundsLast:ko?"자금 유지":"Funds Last",
  fundsSafe:ko?"✅ 기대수명까지 안전!":"✅ Safe until life expectancy!",
  fundsWarn:ko?"⚠️ 기대수명 전에 바닥!":"⚠️ Runs out before life expectancy!",
  fundsForever:ko?"🎉 영구 유지!":"🎉 Lasts forever!",
  fJourney:ko?"📈 나이별 자산 성장":"📈 Asset Growth by Age",
  fJourneyD:ko?"저축+투자를 유지하면 내 자산이 이렇게 불어나요":"How your assets grow at current savings & investment rate",
  myA:ko?"내 자산":"My Assets",tgtLine:ko?"FIRE 목표":"FIRE Target",
  postF:ko?"🏖 은퇴 후 자금 시뮬레이션":"🏖 Post-Retirement Simulation",
  postFD:ko?"FIRE 후 매년 생활비를 꺼내 쓰면서 자금이 얼마나 유지되는지 보여줘요.\n은퇴 후에는 보수적 투자(수익률 절반)를 가정합니다.":"Shows how long your funds last after FIRE while withdrawing expenses.\nAssumes conservative investing (half the return rate) post-retirement.",
  remFunds:ko?"잔여 자금":"Remaining Funds",
  scTitle:ko?"📊 인출률별 비교표":"📊 Withdrawal Rate Comparison",
  scDesc:ko?"인출률을 바꾸면 필요 자산과 은퇴 나이가 이렇게 달라져요.\n나에게 맞는 인출률을 찾아보세요!":"Different rates change your target & retirement age.\nFind what works for you!",
  rate:ko?"인출률":"Rate",needed:ko?"필요 자산":"Needed",retire:ko?"은퇴":"Retire",
  lasts:ko?"유지":"Lasts",safety:ko?"안전":"Safety",
  safe:ko?"안전":"Safe",risky:ko?"위험":"Risky",cur:ko?"현재":"Now",
  enc:[
    {t:0,e:"🌱",m:ko?"씨앗을 심었어! 시작이 반!":"Seed planted!"},
    {t:10,e:"🌿",m:ko?"자라나고 있어~":"Growing~"},
    {t:25,e:"💪",m:ko?"1/4 왔다! 대단해!":"Quarter done!"},
    {t:40,e:"🔥",m:ko?"불타오르는 중!":"On fire!"},
    {t:50,e:"🎯",m:ko?"반 왔다!!":"Halfway!!"},
    {t:60,e:"🚀",m:ko?"이제 가속!":"Accelerating!"},
    {t:75,e:"⭐",m:ko?"거의 다 왔어!":"Almost!"},
    {t:90,e:"🏆",m:ko?"코앞이야!!!":"So close!!!"},
    {t:100,e:"🎉",m:ko?"목표 달성!! 🥳":"GOAL!! 🥳"},
  ],
});

const curs:Record<CurKey,CC>={
  EUR:{symbol:"€",locale:"de-DE",code:"EUR",presets:[30000,50000,100000,200000],maxG:500000,maxM:5000,maxI:3000,stepG:1000},
  KRW:{symbol:"₩",locale:"ko-KR",code:"KRW",presets:[3e7,5e7,1e8,2e8],maxG:5e8,maxM:5e6,maxI:3e6,stepG:1e6},
};
const thms:Record<string,TC>={
  light:{bg:"#F8F6F3",card:"#FFFFFF",text:"#1A1A2E",sub:"#888",mut:"#aaa",bdr:"#E8E5E0",trk:"#EDEDEB",shd:"0 2px 16px rgba(0,0,0,0.05),0 0 0 1px rgba(0,0,0,0.03)",hov:"0 12px 40px rgba(0,0,0,0.1)",tip:"white",card2:"#FAFAF8"},
  dark:{bg:"#0F0F1A",card:"#1A1A2E",text:"#F0EDE8",sub:"#777",mut:"#555",bdr:"#2A2A40",trk:"#25253A",shd:"0 2px 16px rgba(0,0,0,0.3)",hov:"0 12px 40px rgba(0,0,0,0.5)",tip:"#1A1A2E",card2:"#151528"},
};
const C={cash:"#E8836B",sav:"#5BA4CF",stk:"#D4A843",goal:"#7C6AC5",grn:"#5DB87D",pnk:"#C47DA0",prp:"#9B8EC4",org:"#D4734E",blu:"#4A8FBF"};

function sim(c:number,s:number,st:number,ms:number,mi:number,sr:number,ir:number,tgt:number){
  let _c=c,_s=s,_st=st,m=0;const h:HP[]=[{month:0,total:_c+_s+_st,cash:_c,savings:_s,stocks:_st}];
  while(_c+_s+_st<tgt&&m<1200){m++;_s=_s*(1+sr/100/12)+ms;_st=_st*(1+ir/100/12)+mi;h.push({month:m,total:_c+_s+_st,cash:_c,savings:_s,stocks:_st});}
  return{months:m,history:h};}

function calcFIRE(age:number,cur:number,fS:number,fI:number,sr:number,ir:number,mExp:number,wr:number,le:number){
  const ae=mExp*12,ft=wr>0?ae/(wr/100):0;
  const tl:{age:number;savings:number;target:number}[]=[];
  let sp=cur*0.5,ip=cur*0.5,fa=-1;
  for(let y=0;y<=70;y++){const tot=sp+ip;tl.push({age:age+y,savings:Math.round(tot),target:Math.round(ft)});
    if(tot>=ft&&fa<0)fa=age+y;if(fa>0&&y>fa-age+5)break;
    sp=sp*(1+sr/100)+fS*12;ip=ip*(1+ir/100)+fI*12;if(age+y>=100)break;}
  const pf:{age:number;funds:number}[]=[];let yof=0;
  if(fa>0){let funds=tl[fa-age]?.savings??ft;const pr=ir*0.5;
    for(let y=0;y<=80;y++){pf.push({age:fa+y,funds:Math.round(Math.max(0,funds))});if(funds<=0)break;funds=funds*(1+pr/100)-ae;yof=y+1;}}
  const sc=[3,3.5,4,4.5,5].map(r=>{const tgt=ae/(r/100);let s=cur*0.5,i=cur*0.5,a=age;
    while(s+i<tgt&&a<100){s=s*(1+sr/100)+fS*12;i=i*(1+ir/100)+fI*12;a++;}
    const fA=s+i>=tgt?a:-1;let p=tgt,y=0;
    if(fA>0){for(let j=0;j<80;j++){if(p<=0)break;p=p*(1+ir*0.5/100)-ae;y++;}}
    return{rate:r,target:Math.round(tgt),fireAge:fA,yof:y,safe:fA>0&&fA+y>=le};});
  return{ft,fa,tl,pf,yof,sc};}

function fmtDur(m:number,ko:boolean){
  if(m<=0)return ko?"즉시":"Now";
  const y=Math.floor(m/12),mo=m%12;
  if(y===0)return`${mo}${ko?"개월":"mo"}`;
  if(mo===0)return`${y}${ko?"년":"yr"}`;
  return`${y}${ko?"년 ":"yr "}${mo}${ko?"개월":"mo"}`;}

function Celeb({on}:{on:boolean}){
  const p=useMemo(()=>Array.from({length:60}).map((_,i)=>({id:i,l:Math.random()*100,sz:8+Math.random()*14,dur:2.5+Math.random()*3,del:Math.random()*2.5,em:["🎉","🎊","✨","💰","🎯","⭐","💎","🏆"][i%8],xd:-30+Math.random()*60,rot:Math.random()*720-360})),[]);
  if(!on)return null;
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
    <div style={{position:"absolute",top:"35%",left:"50%",transform:"translateX(-50%)",fontSize:80,animation:"tBounce 1s cubic-bezier(.36,.07,.19,.97) 0.3s both"}}>🏆</div>
    {p.map(x=>(<div key={x.id} style={{position:"absolute",left:`${x.l}%`,bottom:"-5%",fontSize:x.sz,animation:`cFly ${x.dur}s cubic-bezier(.2,.8,.3,1) ${x.del}s infinite`,"--xd":`${x.xd}px`,"--rot":`${x.rot}deg`} as React.CSSProperties}>{x.em}</div>))}
  </div>);
}

function Info({text,th}:{text:string;th:TC}){const[o,setO]=useState(false);
  return(<span style={{position:"relative",display:"inline-block",marginLeft:6,cursor:"pointer"}} onClick={()=>setO(!o)}>
    <span style={{fontSize:13,opacity:0.5}}>ℹ️</span>
    {o&&<div style={{position:"absolute",bottom:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",width:280,padding:"12px 14px",borderRadius:14,background:th.tip,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",fontSize:12,fontWeight:500,color:th.text,lineHeight:1.6,zIndex:100,animation:"popIn 0.2s",border:`1px solid ${th.bdr}`,whiteSpace:"pre-line"}}>{text}</div>}
  </span>);}

function Sl({label,value,onChange,min,max,step,color,suffix="",emoji,th,info}:{label:string;value:number;onChange:(v:number)=>void;min:number;max:number;step:number;color:string;suffix?:string;emoji:string;th:TC;info?:string}){
  const pct=Math.max(0,Math.min(100,((value-min)/(max-min))*100));
  return(<div style={{marginBottom:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <label style={{fontSize:13,fontWeight:600,color:th.text,letterSpacing:"-0.01em"}}>{emoji} {label}{info&&<Info text={info} th={th}/>}</label>
      <span style={{fontSize:14,fontWeight:700,color,background:`${color}12`,padding:"3px 14px",borderRadius:20,letterSpacing:"-0.02em"}}>{value.toLocaleString()}{suffix}</span>
    </div>
    <div style={{position:"relative",height:6,borderRadius:10,background:th.trk}}>
      <div style={{position:"absolute",left:0,top:0,height:"100%",borderRadius:10,width:`${pct}%`,background:color,transition:"width 0.15s",opacity:0.8}}/>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} style={{position:"absolute",top:-8,left:0,width:"100%",height:22,appearance:"none",background:"transparent",cursor:"pointer",zIndex:2}}/>
    </div>
  </div>);}

function NI({label,value,onChange,emoji,color,th,sym}:{label:string;value:number;onChange:(v:number)=>void;emoji:string;color:string;th:TC;sym:string}){
  const[f,setF]=useState(false);
  return(<div style={{marginBottom:16}}>
    <label style={{fontSize:12,fontWeight:600,color:th.mut,display:"block",marginBottom:6,letterSpacing:"0.02em",textTransform:"uppercase"}}>{emoji} {label}</label>
    <div style={{position:"relative"}}>
      <input type="number" value={value} onChange={e=>onChange(parseFloat(e.target.value)||0)} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{width:"100%",padding:"12px 50px 12px 16px",borderRadius:12,border:`1.5px solid ${f?color:th.bdr}`,fontSize:16,fontWeight:600,color:th.text,background:th.card,outline:"none",boxSizing:"border-box",transition:"all 0.3s",boxShadow:f?`0 0 0 3px ${color}15`:"none",letterSpacing:"-0.02em"}}/>
      <span style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",fontSize:13,fontWeight:600,color:th.mut}}>{sym}</span>
    </div>
  </div>);}

function Pill({opts,value,onChange,th}:{opts:{v:string;l:string}[];value:string;onChange:(v:string)=>void;th:TC}){
  return(<div style={{display:"inline-flex",borderRadius:12,overflow:"hidden",border:`1.5px solid ${th.bdr}`,background:th.card}}>
    {opts.map(o=>(<button key={o.v} onClick={()=>onChange(o.v)} style={{padding:"8px 18px",border:"none",cursor:"pointer",background:value===o.v?th.text:"transparent",color:value===o.v?th.card:th.sub,fontWeight:600,fontSize:13,transition:"all 0.3s",fontFamily:"inherit",letterSpacing:"-0.01em"}}>{o.l}</button>))}
  </div>);}

const Tip=({active,payload,label,sfx,th}:{active?:boolean;payload?:Array<{color:string;name:string;value:number}>;label?:string;sfx:string;th:TC})=>{
  if(!active||!payload?.length)return null;
  return(<div style={{background:th.tip,borderRadius:12,padding:"10px 14px",boxShadow:"0 4px 20px rgba(0,0,0,0.1)",border:`1px solid ${th.bdr}`}}>
    <p style={{fontWeight:600,fontSize:12,color:th.mut,margin:0}}>{label}{sfx}</p>
    {payload.map((p,i)=>(<p key={i} style={{color:p.color,fontWeight:600,fontSize:13,margin:"3px 0 0"}}>{p.name}: {p.value?.toLocaleString()}</p>))}
  </div>);};

const PC=[C.cash,C.sav,C.stk];

export default function App(){
  const[lang,setLang]=useState<Lang>("ko");
  const[cur,setCur]=useState<CurKey>("EUR");
  const[dk,setDk]=useState(false);
  const[cash,setCash]=useState(0);
  const[sav,setSav]=useState(0);
  const[stk,setStk]=useState(0);
  const[mS,setMS]=useState(0);
  const[mI,setMI]=useState(0);
  const[sR,setSR]=useState(2.0);
  const[iR,setIR]=useState(7.0);
  const[target,setTarget]=useState(0);
  const[custG,setCustG]=useState("");
  const[showCust,setShowCust]=useState(false);
  const[celeb,setCeleb]=useState(false);
  const[fInc,setFInc]=useState(0);
  const[fExp,setFExp]=useState(0);
  const[fSv,setFSv]=useState(0);
  const[fIv,setFIv]=useState(0);
  const[fSR,setFSR]=useState(2.0);
  const[fIR,setFIR]=useState(7.0);
  const[age,setAge]=useState(30);
  const[wR,setWR]=useState(4.0);
  const[lifeE,setLifeE]=useState(85);
  const[exS,setExS]=useState(0);
  const[exI,setExI]=useState(0);
  const[bR,setBR]=useState(0);
  const[anim,setAnim]=useState(false);
  const[showDetail,setShowDetail]=useState(false);

  useEffect(()=>{setTimeout(()=>setAnim(true),100);},[]);
  const ko=lang==="ko";const t=useMemo(()=>T(ko),[ko]);
  const cc=curs[cur];const th=thms[dk?"dark":"light"];
  const fmt=useCallback((n:number)=>new Intl.NumberFormat(cc.locale,{style:"currency",currency:cc.code,maximumFractionDigits:0}).format(n),[cc]);
  const fs=useCallback((n:number)=>{if(cur==="KRW"){if(n>=1e8)return`${(n/1e8).toFixed(1)}억`;if(n>=1e4)return`${(n/1e4).toFixed(0)}만`;}if(n>=1e6)return`${(n/1e6).toFixed(1)}M`;if(n>=1e3)return`${(n/1e3).toFixed(0)}k`;return n.toLocaleString();},[cur]);

  const chgCur=(nc:string)=>{if(nc===cur)return;const f=nc==="KRW"?1500:1/1500;const R=Math.round;
    setCash(R(cash*f));setSav(R(sav*f));setStk(R(stk*f));setMS(R(mS*f));setMI(R(mI*f));setTarget(R(target*f));
    setFInc(R(fInc*f));setFExp(R(fExp*f));setFSv(R(fSv*f));setFIv(R(fIv*f));setExS(R(exS*f));setExI(R(exI*f));setCur(nc as CurKey);};

  const tot=cash+sav+stk;
  const prog=target>0?Math.min((tot/target)*100,100):0;
  const enc=(()=>{let r=t.enc[0];for(const e of t.enc)if(prog>=e.t)r=e;return r;})();
  const{months,history}=useMemo(()=>sim(cash,sav,stk,mS,mI,sR,iR,target),[cash,sav,stk,mS,mI,sR,iR,target]);
  const wiSim=useMemo(()=>sim(cash,sav,stk,mS+exS,mI+exI,sR,iR+bR,target),[cash,sav,stk,mS,mI,sR,iR,target,exS,exI,bR]);
  const cd=useMemo(()=>{const s=Math.max(1,Math.floor(history.length/80));return history.filter((_,i)=>i%s===0||i===history.length-1);},[history]);
  const pd=[{name:t.cashL,value:cash},{name:t.savL,value:sav},{name:t.stkL,value:stk}].filter(d=>d.value>0);
  const fire=useMemo(()=>calcFIRE(age,tot,fSv,fIv,fSR,fIR,fExp,wR,lifeE),[age,tot,fSv,fIv,fSR,fIR,fExp,wR,lifeE]);
  const fProg=fire.ft>0?Math.min((tot/fire.ft)*100,100):0;
  const fLA=fire.fa>0?fire.fa+fire.yof:-1;const fSafe=fLA>=lifeE||fire.yof>=60;
  const savRate=fInc>0?((fInc-fExp)/fInc*100):0;
  const ae=fExp*12;

  const m2d=(m:number)=>{const d=new Date();d.setMonth(d.getMonth()+m);return d.toLocaleDateString(ko?"ko-KR":"en-US",{year:"numeric",month:"long"});};
  const durStr=fmtDur(months,ko);

  const yearly=useMemo(()=>{const d:{year:number;total:number;dep:number;gain:number}[]=[];let s=sav,st=stk,c=cash;
    for(let y=1;y<=10;y++){const prev=c+s+st;for(let m=0;m<12;m++){s=s*(1+sR/100/12)+mS;st=st*(1+iR/100/12)+mI;}
      const total=c+s+st;const dep=(mS+mI)*12;d.push({year:new Date().getFullYear()+y,total:Math.round(total),dep:Math.round(dep),gain:Math.round(Math.max(0,total-prev-dep))});}return d;},[cash,sav,stk,mS,mI,sR,iR]);

  useEffect(()=>{if(prog>=100&&!celeb)setCeleb(true);if(prog<100)setCeleb(false);},[prog,celeb]);
  const applyCust=()=>{const v=parseFloat(custG.replace(/[^0-9.]/g,""));if(v>0){setTarget(v);setShowCust(false);setCustG("");}};
  const cs=(d=0):React.CSSProperties=>({background:th.card,borderRadius:20,padding:28,boxShadow:th.shd,transition:"all 0.4s cubic-bezier(.4,0,.2,1)",opacity:anim?1:0,transform:anim?"translateY(0)":"translateY(20px)",transitionDelay:`${d}ms`});
  const wiDiff=months-wiSim.months;const hasWI=exS>0||exI>0||bR>0;
  const W=680; // max content width

  const secHead=(title:string,desc:string,col:string)=>(<div style={{marginBottom:20}}><div style={{fontFamily:"'Baloo 2',cursive",fontSize:22,fontWeight:800,color:col,letterSpacing:"-0.02em"}}>{title}</div>{desc&&<p style={{fontSize:13,color:th.mut,fontWeight:500,marginTop:4,lineHeight:1.6}}>{desc}</p>}</div>);
  const divider=(title:string,desc:string,col:string)=>(<div style={{margin:"48px auto 28px",textAlign:"center",maxWidth:W}}><div style={{height:1,background:`linear-gradient(90deg,transparent,${col}33,transparent)`,marginBottom:20}}/><div style={{fontFamily:"'Baloo 2',cursive",fontSize:26,fontWeight:800,color:col,letterSpacing:"-0.02em"}}>{title}</div><p style={{fontSize:13,color:th.mut,fontWeight:500,marginTop:4}}>{desc}</p></div>);
  const stepLabel=(text:string,desc:string,col:string,num:number)=>(<div style={{margin:"20px 0 12px"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><div style={{width:28,height:28,borderRadius:"50%",background:col,color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700}}>{num}</div><div style={{fontSize:15,fontWeight:700,color:col,letterSpacing:"-0.01em"}}>{text}</div></div>{desc&&<p style={{fontSize:12,color:th.mut,marginLeft:38}}>{desc}</p>}</div>);

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Baloo+2:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}body{background:${th.bg};transition:background 0.5s}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
        @keyframes popIn{0%{transform:scale(0)}60%{transform:scale(1.05)}100%{transform:scale(1)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes cFly{0%{transform:translateY(0) translateX(0) rotate(0);opacity:1}100%{transform:translateY(-110vh) translateX(var(--xd,0px)) rotate(var(--rot,360deg));opacity:0}}
        @keyframes tBounce{0%{transform:translateX(-50%) scale(0) translateY(100px);opacity:0}50%{transform:translateX(-50%) scale(1.2) translateY(-20px);opacity:1}100%{transform:translateX(-50%) scale(1) translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.7}}
        .hc:hover{transform:translateY(-3px)!important;box-shadow:${th.hov}!important}
        input[type="range"]::-webkit-slider-thumb{appearance:none;width:20px;height:20px;border-radius:50%;background:white;border:2px solid ${th.bdr};box-shadow:0 1px 6px rgba(0,0,0,0.15);cursor:pointer}
        input[type="number"]::-webkit-inner-spin-button{opacity:1}
        .pb{transition:all 0.2s}.pb:hover{transform:scale(1.05)}.pb:active{transform:scale(0.97)}
        @media(max-width:720px){.g2{grid-template-columns:1fr!important}}
      `}</style>
      <Celeb on={celeb}/>
      <div style={{maxWidth:960,margin:"0 auto",padding:"24px 16px 60px",fontFamily:"'Nunito',sans-serif",color:th.text}}>

        {/* HEADER */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:6,animation:"float 3s ease-in-out infinite"}}>💰</div>
          <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:38,fontWeight:800,color:th.text,letterSpacing:"-0.03em",marginBottom:4}}>{t.title}</h1>
          <p style={{fontSize:14,color:th.sub,fontWeight:500}}>{t.sub}</p>
          <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:18,flexWrap:"wrap"}}>
            <Pill opts={[{v:"ko",l:"🇰🇷 한국어"},{v:"en",l:"🇬🇧 EN"}]} value={lang} onChange={v=>setLang(v as Lang)} th={th}/>
            <Pill opts={[{v:"EUR",l:"€ EUR"},{v:"KRW",l:"₩ KRW"}]} value={cur} onChange={chgCur} th={th}/>
            <button onClick={()=>setDk(!dk)} style={{padding:"8px 18px",borderRadius:12,border:`1.5px solid ${th.bdr}`,background:dk?th.text:th.card,color:dk?th.card:th.sub,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{dk?"☀️":"🌙"}</button>
          </div>
        </div>

        {/* ═══════ HERO ═══════ */}
        <div className="hc" style={{...cs(0),maxWidth:W,margin:"0 auto 24px",textAlign:"center",border:prog>=100?`2px solid ${C.grn}`:`1px solid ${th.bdr}`}}>
          <div style={{fontSize:40,marginBottom:6,animation:"wiggle 2s ease-in-out infinite"}}>{enc.e}</div>
          <div style={{fontSize:15,fontWeight:600,color:th.sub,marginBottom:16}}>{enc.m}</div>
          {/* Circular progress */}
          <div style={{position:"relative",width:140,height:140,margin:"0 auto 16px"}}>
            <svg width="140" height="140" style={{transform:"rotate(-90deg)"}}>
              <circle cx="70" cy="70" r="60" fill="none" stroke={th.trk} strokeWidth="10"/>
              <circle cx="70" cy="70" r="60" fill="none" stroke={prog>=100?C.grn:C.goal} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${prog*3.77} ${377-prog*3.77}`} style={{transition:"stroke-dasharray 1s cubic-bezier(.4,0,.2,1)"}}/>
            </svg>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:800,color:th.text,fontFamily:"'Baloo 2',cursive",lineHeight:1}}>{prog.toFixed(1)}%</div>
              <div style={{fontSize:10,color:th.mut,fontWeight:600}}>{t.progress}</div>
            </div>
          </div>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,maxWidth:560,margin:"0 auto"}}>
            {[{l:t.curAsset,v:fmt(tot),c:C.cash,e:"💵"},{l:t.heroGoal,v:fmt(target),c:C.goal,e:"🎯"},{l:t.remaining,v:target>tot?fmt(target-tot):t.goalDone,c:C.pnk,e:"📊"},{l:t.expDate,v:months>=1200?(ko?"100년+":"100yr+"):durStr,c:C.sav,e:"📅"}].map((x,i)=>(
              <div key={i} style={{animation:`popIn 0.4s ease-out ${0.1+i*0.1}s both`}}>
                <div style={{fontSize:18}}>{x.e}</div>
                <div style={{fontSize:10,color:th.mut,fontWeight:600,marginTop:2,textTransform:"uppercase",letterSpacing:"0.04em"}}>{x.l}</div>
                <div style={{fontSize:16,fontWeight:800,color:x.c,fontFamily:"'Baloo 2',cursive",letterSpacing:"-0.02em"}}>{x.v}</div>
              </div>))}
          </div>
          {months<1200&&target>tot&&(<div style={{marginTop:14,padding:"8px 20px",borderRadius:12,background:th.card2,display:"inline-block",border:`1px solid ${th.bdr}`}}><span style={{fontSize:13,fontWeight:600,color:th.sub}}>🗓 <strong style={{color:C.goal}}>{m2d(months)}</strong>{t.heroAt}</span></div>)}
        </div>

        {/* ═══════ INPUTS: Goal, Assets, Monthly — centered ═══════ */}
        <div style={{maxWidth:W,margin:"0 auto",display:"flex",flexDirection:"column",gap:20}}>
          <div className="hc" style={{...cs(100),border:`1.5px solid ${C.goal}22`}}>
            <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:C.goal,marginBottom:16}}>{t.goal}</div>
            <Sl label={t.goalL} value={target} onChange={setTarget} min={cur==="KRW"?1e6:1000} max={cc.maxG} step={cc.stepG} color={C.goal} suffix={cc.symbol} emoji="🏁" th={th}/>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {cc.presets.map(g=>(<button key={g} className="pb" onClick={()=>setTarget(g)} style={{padding:"8px 18px",borderRadius:12,border:"none",background:target===g?th.text:th.trk,color:target===g?th.card:th.sub,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{fmt(g)}</button>))}
              <button className="pb" onClick={()=>setShowCust(!showCust)} style={{padding:"8px 18px",borderRadius:12,border:`1.5px dashed ${C.goal}44`,background:"transparent",color:C.goal,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✏️ {t.custom}</button>
            </div>
            {showCust&&(<div style={{marginTop:12,display:"flex",gap:8}}><input type="number" value={custG} onChange={e=>setCustG(e.target.value)} placeholder={cur==="KRW"?"50000000":"75000"} onKeyDown={e=>e.key==="Enter"&&applyCust()} style={{flex:1,padding:"10px 16px",borderRadius:12,border:`1.5px solid ${C.goal}44`,fontSize:15,fontWeight:600,color:th.text,background:th.card,outline:"none",fontFamily:"inherit"}}/><button onClick={applyCust} style={{padding:"10px 22px",borderRadius:12,border:"none",background:th.text,color:th.card,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✓</button></div>)}
          </div>

          <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <div className="hc" style={cs(150)}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:C.cash,marginBottom:16}}>{t.curAssets}</div>
              <NI label={t.cash} value={cash} onChange={setCash} emoji="💵" color={C.cash} th={th} sym={cc.symbol}/>
              <NI label={t.sav} value={sav} onChange={setSav} emoji="🏦" color={C.sav} th={th} sym={cc.symbol}/>
              <NI label={t.stk} value={stk} onChange={setStk} emoji="📈" color={C.stk} th={th} sym={cc.symbol}/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              <div className="hc" style={cs(200)}>
                <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:C.sav,marginBottom:16}}>{t.monthly}</div>
                <Sl label={t.mSave} value={mS} onChange={setMS} min={0} max={cc.maxM} step={cur==="KRW"?50000:50} color={C.sav} suffix={cc.symbol} emoji="💎" th={th}/>
                <Sl label={t.mInvest} value={mI} onChange={setMI} min={0} max={cc.maxI} step={cur==="KRW"?10000:10} color={C.stk} suffix={cc.symbol} emoji="🎯" th={th}/>
              </div>
              <div className="hc" style={cs(250)}>
                <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:C.stk,marginBottom:16}}>{t.rates}</div>
                <Sl label={t.sRate} value={sR} onChange={setSR} min={0} max={10} step={0.1} color={C.sav} suffix="%" emoji="🏦" th={th}/>
                <Sl label={t.iRate} value={iR} onChange={setIR} min={-10} max={30} step={0.5} color={C.stk} suffix="%" emoji="📈" th={th}/>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ CHARTS & ANALYSIS ═══════ */}
        <div style={{maxWidth:W,margin:"32px auto 0",display:"flex",flexDirection:"column",gap:20}}>
          <div className="hc" style={cs(300)}>
            {secHead(t.chart,"",C.grn)}
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cd} margin={{top:5,right:10,left:0,bottom:5}}>
                <defs>
                  <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.cash} stopOpacity={0.35}/><stop offset="100%" stopColor={C.cash} stopOpacity={0.02}/></linearGradient>
                  <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.sav} stopOpacity={0.35}/><stop offset="100%" stopColor={C.sav} stopOpacity={0.02}/></linearGradient>
                  <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.stk} stopOpacity={0.35}/><stop offset="100%" stopColor={C.stk} stopOpacity={0.02}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={th.bdr}/>
                <XAxis dataKey="month" tick={{fontSize:11,fill:th.mut}} tickFormatter={(v:number)=>v===0?t.now:`${v}m`} interval={Math.max(0,Math.floor(cd.length/6)-1)}/>
                <YAxis tick={{fontSize:11,fill:th.mut}} tickFormatter={(v:number)=>fs(v)}/>
                <Tooltip content={<Tip sfx={t.mAfter} th={th}/>}/>
                <ReferenceLine y={target} stroke={C.goal} strokeDasharray="8 4" strokeWidth={1.5} label={{value:"🎯",position:"right",fontSize:14}}/>
                <Area type="monotone" dataKey="stocks" name={t.stkL} stackId="1" stroke={C.stk} fill="url(#gi)" strokeWidth={2}/>
                <Area type="monotone" dataKey="savings" name={t.savL} stackId="1" stroke={C.sav} fill="url(#gs)" strokeWidth={2}/>
                <Area type="monotone" dataKey="cash" name={t.cashL} stackId="1" stroke={C.cash} fill="url(#gc)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <div className="hc" style={cs(350)}>
              {secHead(t.comp,"",C.pnk)}
              <div style={{position:"relative",width:160,height:160,margin:"0 auto"}}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart><Pie data={pd} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" stroke="none">{pd.map((_,i)=><Cell key={i} fill={PC[i]}/>)}</Pie></PieChart>
                </ResponsiveContainer>
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                  <div style={{fontSize:10,color:th.mut}}>TOTAL</div>
                  <div style={{fontSize:14,fontWeight:800,color:th.text,fontFamily:"'Baloo 2',cursive"}}>{fs(tot)}</div>
                </div>
              </div>
              {pd.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}><div style={{width:10,height:10,borderRadius:3,background:PC[i]}}/><div style={{flex:1,fontSize:12,fontWeight:600,color:th.mut}}>{d.name}</div><div style={{fontSize:13,fontWeight:700,color:th.text}}>{fmt(d.value)}</div></div>))}
            </div>

            <div className="hc" style={{...cs(400),background:dk?"#151528":"linear-gradient(135deg,#F8F0FF,#FFF0F5)"}}>
              {secHead(t.whatIf,t.whatIfD,C.prp)}
              <Sl label={t.exS} value={exS} onChange={setExS} min={0} max={cur==="KRW"?2e6:2000} step={cur==="KRW"?50000:50} color={C.sav} suffix={cc.symbol} emoji="💎" th={th}/>
              <Sl label={t.exI} value={exI} onChange={setExI} min={0} max={cur==="KRW"?2e6:2000} step={cur==="KRW"?50000:50} color={C.stk} suffix={cc.symbol} emoji="📈" th={th}/>
              <Sl label={t.boost} value={bR} onChange={setBR} min={0} max={10} step={0.5} color={C.grn} suffix="%" emoji="⚡" th={th}/>
              {hasWI&&(<div style={{marginTop:8,padding:"12px 16px",borderRadius:14,textAlign:"center",background:wiDiff>0?`${C.grn}12`:`${C.cash}12`,border:`1px solid ${wiDiff>0?C.grn:C.cash}22`}}>
                <div style={{fontSize:20,fontWeight:800,color:wiDiff>0?C.grn:C.cash,fontFamily:"'Baloo 2',cursive"}}>{wiDiff>0?`⚡ ${fmtDur(wiDiff,ko)} ${t.faster}!`:ko?"변화 없음":"No change"}</div>
              </div>)}
            </div>
          </div>

          {/* Yearly + Milestone */}
          <div className="hc" style={cs(450)}>
            {secHead(t.yearly,t.yearlyD,C.org)}
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={yearly} margin={{top:5,right:5,left:0,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={th.bdr}/>
                <XAxis dataKey="year" tick={{fontSize:10,fill:th.mut}}/>
                <YAxis tick={{fontSize:10,fill:th.mut}} tickFormatter={(v:number)=>fs(v)}/>
                <Tooltip contentStyle={{background:th.tip,borderRadius:12,border:`1px solid ${th.bdr}`}} formatter={(v:any,n:any)=>[fmt(v??0),n==="dep"?t.depL:t.gainL]}/>
                <Bar dataKey="dep" name="dep" stackId="a" fill={C.sav} radius={[0,0,0,0]}/>
                <Bar dataKey="gain" name="gain" stackId="a" fill={C.stk} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
            <div style={{marginTop:12,maxHeight:200,overflowY:"auto",borderRadius:12,border:`1px solid ${th.bdr}`}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:th.trk}}>{[t.yearL,t.totalL,t.depL,t.gainL].map((h,i)=>(<th key={i} style={{padding:"8px 10px",fontWeight:600,color:th.mut,textAlign:i===0?"left":"right"}}>{h}</th>))}</tr></thead>
                <tbody>{yearly.map((r,i)=>{const hit=i>0&&yearly[i-1].total<target&&r.total>=target;
                  return(<tr key={i} style={{background:hit?`${C.grn}12`:i%2===0?"transparent":th.trk+"44"}}>
                    <td style={{padding:"6px 10px",fontWeight:600}}>{r.year}{hit&&" 🎯"}</td>
                    <td style={{padding:"6px 10px",textAlign:"right",fontWeight:700}}>{fmt(r.total)}</td>
                    <td style={{padding:"6px 10px",textAlign:"right",color:C.sav}}>{fmt(r.dep)}</td>
                    <td style={{padding:"6px 10px",textAlign:"right",color:C.stk}}>{fmt(r.gain)}</td>
                  </tr>);})}</tbody>
              </table>
            </div>
          </div>

          <div className="hc" style={{...cs(500),border:`1px solid ${C.goal}15`}}>
            <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:C.goal,marginBottom:12}}>{t.mile}</div>
            {[0.25,0.5,0.75,1.0].map((pct)=>{const ms=target*pct,mD=history.find(h=>h.total>=ms),reached=tot>=ms;
              return(<div key={pct} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",marginBottom:8,background:reached?`${C.grn}10`:th.card2,borderRadius:14,border:reached?`1.5px solid ${C.grn}44`:`1px solid ${th.bdr}`,transition:"all 0.3s"}}>
                <div style={{fontSize:20}}>{reached?"✅":"⬜"}</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{fmt(ms)} ({(pct*100).toFixed(0)}%)</div><div style={{fontSize:11,color:th.mut}}>{reached?t.achieved:mD?`${t.approx} ${fmtDur(mD.month,ko)} ${t.after} (${m2d(mD.month)})`:ko?"100년+":"100yr+"}</div></div>
                {reached&&<div style={{fontSize:16}}>🎉</div>}
              </div>);})}
          </div>
        </div>

        {/* ═══════ FIRE SECTION ═══════ */}
        {divider(t.fireTitle,t.fireSub,C.org)}

        <div style={{maxWidth:W,margin:"0 auto",display:"flex",flexDirection:"column",gap:20}}>
          {/* FIRE Intro */}
          <div className="hc" style={{...cs(100),background:dk?"#1E1E30":"linear-gradient(135deg,#FFF8F5,#FFF5F0)",border:`1.5px solid ${C.org}22`}}>
            <div style={{fontFamily:"'Baloo 2',cursive",fontSize:22,fontWeight:800,color:C.org,marginBottom:8}}>🔥 FIRE{ko?"란 무엇인가요?":" — What is it?"}</div>
            <p style={{fontSize:13,color:th.text,lineHeight:1.8,whiteSpace:"pre-line",fontWeight:500}}>{t.fireIntro}</p>

            <button onClick={()=>setShowDetail(!showDetail)} style={{marginTop:14,width:"100%",padding:"12px 16px",borderRadius:14,border:`1.5px solid ${C.blu}22`,background:`${C.blu}06`,color:C.blu,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
              {showDetail?"▼":"▶"} {t.fireHow}
            </button>
            {showDetail&&(<div style={{marginTop:12,padding:"16px 20px",borderRadius:14,background:th.card,border:`1px solid ${th.bdr}`,fontSize:13,color:th.text,lineHeight:1.9,whiteSpace:"pre-line",fontWeight:500,animation:"popIn 0.2s"}}>{t.fireDetail}</div>)}
          </div>

          {/* FIRE Inputs */}
          <div className="hc" style={{...cs(200),background:dk?"#1E1E30":th.card,border:`1.5px solid ${C.org}15`}}>
            {stepLabel(t.fSec1,t.fSec1D,C.blu,1)}
            <NI label={t.mInc} value={fInc} onChange={setFInc} emoji="💼" color={C.grn} th={th} sym={cc.symbol}/>
            <NI label={t.mExp} value={fExp} onChange={setFExp} emoji="🛒" color={C.org} th={th} sym={cc.symbol}/>
            {/* Savings Rate */}
            <div style={{padding:"10px 14px",borderRadius:14,background:th.card2,border:`1px solid ${th.bdr}`,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:600,color:th.text}}>📊 {ko?"저축률":"Savings Rate"}<Info text={ko?"수입 중 저축 비율. 높을수록 빨리 FIRE!":"% saved. Higher = FIRE sooner!"} th={th}/></span>
                <span style={{fontSize:16,fontWeight:800,color:savRate>=50?C.grn:savRate>=20?C.stk:C.cash}}>{savRate.toFixed(1)}%</span>
              </div>
              <div style={{height:6,borderRadius:6,background:th.trk,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:6,width:`${Math.max(0,Math.min(savRate,100))}%`,background:savRate>=50?C.grn:savRate>=20?C.stk:C.cash,transition:"width 0.5s"}}/>
              </div>
            </div>

            {stepLabel(t.fSec2,t.fSec2D,C.sav,2)}
            <NI label={t.fmSave} value={fSv} onChange={setFSv} emoji="🏦" color={C.sav} th={th} sym={cc.symbol}/>
            <Sl label={t.fsRate} value={fSR} onChange={setFSR} min={0} max={10} step={0.1} color={C.sav} suffix="%" emoji="💰" th={th}/>
            <NI label={t.fmInvest} value={fIv} onChange={setFIv} emoji="📈" color={C.stk} th={th} sym={cc.symbol}/>
            <Sl label={t.fiRate} value={fIR} onChange={setFIR} min={0} max={15} step={0.1} color={C.stk} suffix="%" emoji="🚀" th={th} info={ko?"장기 평균 ~7%. 보수적 5~6%":"Long-term ~7%. Conservative 5-6%"}/>

            {stepLabel(t.fSec3,t.fSec3D,C.org,3)}
            <Sl label={t.curAge} value={age} onChange={setAge} min={18} max={65} step={1} color={C.prp} emoji="🎂" th={th}/>
            <Sl label={t.lifeE} value={lifeE} onChange={setLifeE} min={60} max={100} step={1} color={C.pnk} emoji="🧬" th={th}/>
            <Sl label={t.wrLabel} value={wR} onChange={setWR} min={2} max={6} step={0.1} color={C.org} suffix="%" emoji="📤" th={th} info={ko?"은퇴 후 매년 모은 돈의 몇 %를 꺼내 쓸 건지":"% of savings you withdraw yearly in retirement"}/>
            {wR>=4.5&&(<div style={{padding:"8px 14px",borderRadius:12,background:`${C.cash}10`,fontSize:12,fontWeight:600,color:C.cash,marginBottom:10}}>{t.wrWarn}</div>)}
            {wR<=3.0&&(<div style={{padding:"8px 14px",borderRadius:12,background:`${C.grn}10`,fontSize:12,fontWeight:600,color:C.grn,marginBottom:10}}>{t.wrSafe}</div>)}
            <div style={{padding:"6px 14px",borderRadius:12,background:`${C.grn}08`,fontSize:12,fontWeight:600,color:C.grn,marginBottom:8}}>{t.wrRec}</div>
          </div>

          {/* FIRE Target */}
          <div className="hc" style={{...cs(300),background:dk?"#1E1E30":"linear-gradient(135deg,#FFF8F5,#FFF5EE)",border:`1.5px solid ${C.org}22`,textAlign:"center"}}>
            <div style={{fontSize:12,fontWeight:600,color:th.mut,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t.fCalc}</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,flexWrap:"wrap",fontSize:15,fontWeight:600,marginBottom:12}}>
              <span style={{padding:"4px 12px",borderRadius:10,background:`${C.org}12`,color:C.org}}>{fmt(ae)}{ko?"/년":"/yr"}</span><span>÷</span>
              <span style={{padding:"4px 12px",borderRadius:10,background:`${C.prp}12`,color:C.prp}}>{wR}%</span><span>=</span>
            </div>
            <div style={{fontSize:36,fontWeight:800,color:C.org,fontFamily:"'Baloo 2',cursive",letterSpacing:"-0.03em"}}>🎯 {fmt(fire.ft)}</div>
            <div style={{fontSize:13,color:th.text,fontWeight:600,marginTop:4}}>{t.fNeed}</div>
            {/* Circular progress for FIRE */}
            <div style={{position:"relative",width:100,height:100,margin:"16px auto 8px"}}>
              <svg width="100" height="100" style={{transform:"rotate(-90deg)"}}>
                <circle cx="50" cy="50" r="42" fill="none" stroke={th.trk} strokeWidth="8"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke={C.org} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${fProg*2.64} ${264-fProg*2.64}`} style={{transition:"stroke-dasharray 1s"}}/>
              </svg>
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:800,color:C.org,fontFamily:"'Baloo 2',cursive"}}>{fProg.toFixed(1)}%</div>
              </div>
            </div>
            <div style={{fontSize:11,color:th.mut}}>{fmt(tot)} / {fmt(fire.ft)}</div>
          </div>

          {/* Results */}
          <div className="hc" style={{...cs(350)}}>
            {secHead(t.fResult,"",C.org)}
            <div style={{fontSize:11,color:th.mut,marginBottom:12,padding:"6px 12px",borderRadius:10,background:th.card2,border:`1px solid ${th.bdr}`}}>
              {ko?`🏦 저축 ${fmt(fSv)}/월 (${fSR}%) + 📈 투자 ${fmt(fIv)}/월 (${fIR}%)`:`🏦 ${fmt(fSv)}/mo (${fSR}%) + 📈 ${fmt(fIv)}/mo (${fIR}%)`}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[
                {e:"🧓",l:t.fAge,v:fire.fa>0?`${fire.fa}${ko?"세":""}`:"-",c:C.grn,s:fire.fa>0?`${fire.fa-age}${t.yr} ${t.after}`:""},
                {e:"💰",l:t.fMo,v:fmt(fSv+fIv),c:C.blu,s:""},
                {e:"🏖",l:t.fundsLast,v:fLA>0?`${fLA}${ko?"세":""}`:"-",c:fSafe?C.grn:C.cash,s:fire.yof>=60?"∞":`${fire.yof}${t.yr}`},
                {e:"🧬",l:t.lifeE,v:`${lifeE}${ko?"세":""}`,c:C.pnk,s:fSafe?"✅":"⚠️"},
              ].map((x,i)=>(
                <div key={i} style={{textAlign:"center",padding:14,borderRadius:16,background:th.card2,border:`1px solid ${th.bdr}`}}>
                  <div style={{fontSize:22}}>{x.e}</div>
                  <div style={{fontSize:10,color:th.mut,fontWeight:600,marginTop:2}}>{x.l}</div>
                  <div style={{fontSize:20,fontWeight:800,color:x.c,fontFamily:"'Baloo 2',cursive"}}>{x.v}</div>
                  {x.s&&<div style={{fontSize:10,color:th.mut}}>{x.s}</div>}
                </div>))}
            </div>
            <div style={{marginTop:12,padding:"10px 16px",borderRadius:14,textAlign:"center",background:fSafe?`${C.grn}10`:`${C.cash}10`,border:`1px solid ${fSafe?C.grn:C.cash}22`}}>
              <span style={{fontSize:14,fontWeight:700}}>{fire.yof>=60?t.fundsForever:fSafe?t.fundsSafe:t.fundsWarn}</span>
            </div>
          </div>

          {/* Charts */}
          {fire.tl.length>2&&(<div className="hc" style={{...cs(400),background:dk?"#151528":"#FDFAF5"}}>
            {secHead(t.fJourney,t.fJourneyD,C.org)}
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={fire.tl.filter((_,i)=>i%2===0||i===fire.tl.length-1)} margin={{top:5,right:10,left:0,bottom:5}}>
                <defs><linearGradient id="gF" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.org} stopOpacity={0.3}/><stop offset="100%" stopColor={C.org} stopOpacity={0.02}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={th.bdr}/>
                <XAxis dataKey="age" tick={{fontSize:10,fill:th.mut}} label={{value:ko?"나이":"Age",position:"insideBottom",offset:-2,fontSize:10,fill:th.mut}}/>
                <YAxis tick={{fontSize:10,fill:th.mut}} tickFormatter={(v:number)=>fs(v)}/>
                <Tooltip content={<Tip sfx={ko?"세":" yrs"} th={th}/>}/>
                <ReferenceLine y={fire.ft} stroke={C.org} strokeDasharray="8 4" strokeWidth={1.5} label={{value:`🔥 ${fs(fire.ft)}`,position:"right",fill:C.org,fontSize:10}}/>
                {fire.fa>0&&<ReferenceLine x={fire.fa} stroke={C.grn} strokeDasharray="4 4" label={{value:`🎉 ${fire.fa}`,position:"top",fill:C.grn,fontSize:10}}/>}
                <Area type="monotone" dataKey="savings" name={t.myA} stroke={C.org} fill="url(#gF)" strokeWidth={2}/>
                <Line type="monotone" dataKey="target" name={t.tgtLine} stroke={C.cash} strokeDasharray="6 3" strokeWidth={1.5} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>)}

          {fire.pf.length>2&&(<div className="hc" style={{...cs(450),background:dk?"#151528":"#F5FDF5"}}>
            {secHead(t.postF,t.postFD,C.grn)}
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={fire.pf} margin={{top:5,right:10,left:0,bottom:5}}>
                <defs><linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.grn} stopOpacity={0.3}/><stop offset="100%" stopColor={C.grn} stopOpacity={0.02}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={th.bdr}/>
                <XAxis dataKey="age" tick={{fontSize:10,fill:th.mut}} label={{value:ko?"나이":"Age",position:"insideBottom",offset:-2,fontSize:10,fill:th.mut}}/>
                <YAxis tick={{fontSize:10,fill:th.mut}} tickFormatter={(v:number)=>fs(v)}/>
                <Tooltip content={<Tip sfx={ko?"세":" yrs"} th={th}/>}/>
                <ReferenceLine x={lifeE} stroke={C.pnk} strokeDasharray="4 4" label={{value:`🧬 ${lifeE}`,position:"top",fill:C.pnk,fontSize:10}}/>
                <Area type="monotone" dataKey="funds" name={t.remFunds} stroke={C.grn} fill="url(#gP)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>)}

          <div className="hc" style={cs(500)}>
            {secHead(t.scTitle,t.scDesc,C.prp)}
            <div style={{borderRadius:14,overflow:"hidden",border:`1px solid ${th.bdr}`}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:th.trk}}>{[t.rate,t.needed,t.retire,t.lasts,t.safety].map((h,i)=>(<th key={i} style={{padding:"10px 8px",fontWeight:600,color:th.mut,textAlign:"center"}}>{h}</th>))}</tr></thead>
                <tbody>{fire.sc.map((s,i)=>{const isCur=Math.abs(s.rate-wR)<0.01;
                  return(<tr key={i} style={{background:isCur?`${C.goal}10`:i%2===0?"transparent":th.trk+"44"}}>
                    <td style={{padding:"10px 8px",textAlign:"center",fontWeight:700,color:isCur?C.goal:th.text}}>{s.rate}%{isCur&&` ← ${t.cur}`}</td>
                    <td style={{padding:"10px 8px",textAlign:"center",fontWeight:600}}>{fs(s.target)}</td>
                    <td style={{padding:"10px 8px",textAlign:"center",fontWeight:700,color:s.fireAge>0?C.org:th.mut}}>{s.fireAge>0?s.fireAge:"-"}</td>
                    <td style={{padding:"10px 8px",textAlign:"center"}}>{s.yof>60?"∞":`${s.yof}${t.yr}`}</td>
                    <td style={{padding:"10px 8px",textAlign:"center"}}><span style={{fontSize:10,fontWeight:600,padding:"3px 10px",borderRadius:10,background:s.safe?`${C.grn}15`:`${C.cash}15`,color:s.safe?C.grn:C.cash}}>{s.safe?`✅ ${t.safe}`:`⚠️ ${t.risky}`}</span></td>
                  </tr>);})}</tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{textAlign:"center",marginTop:48,color:th.mut,fontSize:12,fontWeight:500}}>{t.footer}</div>
      </div>
    </>
  );
}