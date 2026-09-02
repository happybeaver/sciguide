"use client";

import { useEffect, useState } from "react";
import { ReviewDetailEnhanced } from "./review-enhanced";
import { CollectionConfirmModal } from "./collection-confirm-modal";
import { ManualPolicyModal } from "./manual-policy-modal";

type Surface = "enterpriseLogin" | "enterprise" | "adminLogin" | "admin";
type MatchLevel = "较高匹配" | "一般匹配" | "待补充信息";
type DeclarationLevel = "国家级" | "省级" | "市级" | "区级";
type Policy = { match:MatchLevel; title:string; meta:string; amount:string; deadline:string; reason:string; status:string; region:string; demo?:boolean };

const REAL_POLICY_TITLE = "北京市经济和信息化局关于开展2026年第二批专精特新中小企业资质申报工作的通知";
const REAL_POLICY_URL = "https://jxj.beijing.gov.cn/zwgk/2024zcwj/202607/t20260722_4778499.html";
const realPolicy:Policy = {
  match:"较高匹配",
  title:REAL_POLICY_TITLE,
  meta:"北京市经济和信息化局 · 资质认定",
  amount:"资质认定（非直接补贴）",
  deadline:"2026年8月31日24:00截止",
  reason:"注册地、经营年限、营收和研发投入等基础条件符合；Ⅰ类知识产权缺失，细分市场证明待补充",
  status:"申报中",
  region:"北京市",
};

const demoPolicies:Policy[] = [
  {
    match:"较高匹配",
    title:"2026年度北京市科技型中小企业研发创新支持计划（演示数据）",
    meta:"北京市科技主管部门（演示） · 研发支持",
    amount:"最高50万元（演示）",
    deadline:"2026年9月30日截止",
    reason:"企业所属行业和研发投入方向较为符合，研发项目证明材料待补充",
    status:"申报中",
    region:"北京市",
    demo:true,
  },
  {
    match:"一般匹配",
    title:"海淀区中小企业数字化转型服务券申报指南（演示数据）",
    meta:"海淀区产业主管部门（演示） · 数字化转型",
    amount:"服务券支持（演示）",
    deadline:"2026年10月15日截止",
    reason:"企业数字化服务方向相关，但项目采购合同和服务场景仍需确认",
    status:"申报中",
    region:"海淀区",
    demo:true,
  },
  {
    match:"待补充信息",
    title:"中小企业知识产权能力提升专项申报通知（演示数据）",
    meta:"北京市知识产权主管部门（演示） · 知识产权",
    amount:"项目支持（演示）",
    deadline:"2026年11月20日截止",
    reason:"企业具备软件著作权，但知识产权项目投入和专利实施证明信息不足",
    status:"即将开始",
    region:"北京市",
    demo:true,
  },
];
const policies: Policy[] = [realPolicy,...demoPolicies];
const getDeclarationLevel=(policy:Policy):DeclarationLevel=>policy.region.endsWith("区")?"区级":policy.region.endsWith("省")?"省级":policy.region==="全国"?"国家级":"市级";
const enterpriseNav = [["概览","⌂"],["政策库","▤"],["AI 政策助手","✦"],["企业画像","◎"],["为我匹配","◇"],["我的项目","◷"]];
const adminNav = [["运营概览","⌂"],["政策中心","▤"],["政策审核","✓"],["企业与线索","◎"],["AI 问答记录","✦"]];
const latestPublishedPolicy:Policy = realPolicy;
const latestPolicyMatch = {
  title:latestPublishedPolicy.title,
  total:1,
  high:1,
  needsInfo:1,
};

export default function PrototypeClient(){
  const [surface,setSurface]=useState<Surface>("enterpriseLogin");
  const [enterpriseView,setEnterpriseView]=useState("概览");
  const [adminView,setAdminView]=useState("运营概览");
  const [profileComplete,setProfileComplete]=useState(false);
  const [favorites,setFavorites]=useState<string[]>([REAL_POLICY_TITLE]);
  const [pendingReviews,setPendingReviews]=useState(2);
  const [manualPolicyPending,setManualPolicyPending]=useState(true);
  const [policyPublished,setPolicyPublished]=useState(true);
  const [policyMatchReady,setPolicyMatchReady]=useState(true);
  const [adminPolicyFilter,setAdminPolicyFilter]=useState(true);
  const [toast,setToast]=useState("");
  const notify=(message:string)=>{setToast(message);window.setTimeout(()=>setToast(""),2400)};

  useEffect(()=>{
    const handleClick=(event:MouseEvent)=>{
      const button=(event.target as HTMLElement).closest("button");
      if(!button)return;
      const label=(button.textContent||"").replace(/\s+/g," ").trim();
      if(button.closest(".filter-row")){
        button.parentElement?.querySelectorAll("button").forEach(item=>item.classList.remove("chosen"));
        button.classList.add("chosen");
        notify(`已按“${label}”筛选`);
        return;
      }
      if(button.closest(".suggestions")){
        const composer=button.closest(".composer");
        const input=composer?.querySelector("input");
        if(input)input.value=label;
        (composer?.querySelector(".composer>div:last-of-type button") as HTMLButtonElement|null)?.click();
        return;
      }
      if(label==="显示"||label==="隐藏"){
        const input=button.parentElement?.querySelector("input");
        if(input){input.type=input.type==="password"?"text":"password";button.textContent=input.type==="password"?"显示":"隐藏"}
        return;
      }
      if(label==="☆"||label==="★"||label==="取消关注"){
        notify(label==="☆"?"政策已加入我的关注":"已取消关注该政策");
        return;
      }
      if(label.includes("搜索政策、企业或关键词")){notify("全局搜索功能已唤起");return}
      if(label==="查看政策详情 →"){setEnterpriseView("政策库");notify("已打开政策详情");return}
      if(label==="查看完整画像 →"&&surface==="enterprise"){setEnterpriseView("企业画像");return}
      if(label==="针对该政策提问"){setEnterpriseView("AI 政策助手");notify("已将当前政策带入 AI 问答");return}
      if(label.includes("查看完整诊断")){setEnterpriseView("为我匹配");return}
      if(label.includes("补充缺失信息")){setEnterpriseView("企业画像");notify("已定位到需要补充的研发信息");return}
      if(label==="›"){setEnterpriseView("为我匹配");return}
      const feedback:Record<string,string>={
        "忘记密码？":"已进入密码找回演示流程",
        "联系政策顾问":"已为您打开政策顾问服务入口",
        "搜索政策、企业或关键词 ⌘ K":"全局搜索功能已唤起",
        "♢1":"您有 1 条主演示政策提醒",
        "全部":"已展示全部申报日程",
        "订阅政策更新":"政策更新订阅已开启",
        "搜索政策":"已更新政策搜索结果",
        "☆ 收藏政策":"政策已加入我的关注",
        "★ 已收藏":"已取消关注该政策",
        "查看政府网站原文 ↗":"已定位到政府网站原文（原型演示）",
        "发起新对话":"已创建新的问答会话",
        "···":"更多操作将在正式系统中提供",
        "查看完整画像 →":"已打开企业画像摘要",
        "保存草稿":"企业画像草稿已保存",
        "添加数据源":"已打开数据源配置演示",
        "立即执行采集":"采集任务已创建，当前状态：运行中",
        "查看采集记录 →":"已展示最近一次采集记录",
        "转人工录入":"异常任务已转入人工处理",
        "重新执行":"采集任务已重新执行",
        "查看待复核":"已筛选出 1 条待复核真实政策",
        "今天":"已显示今日全部运营动态",
        "全部记录":"已显示全部跟进记录",
        "开始审核":"已进入政策审核处理",
        "导出企业列表":"企业列表导出演示已完成",
        "分配负责人":"已分配给周运营",
        "查看对话 →":"已展开问答记录",
        "打开来源网页 ↗":"已定位到政策来源网页（原型演示）"
      };
      const normalized=label.replace(/^＋\s*/,"");
      if(feedback[normalized])notify(feedback[normalized]);
      else if(button.closest(".citation")){notify("已定位到对应政策原文条款")}
      else if(button.closest(".chat-history")){notify(`已切换会话：${label}`)}
    };
    document.addEventListener("click",handleClick);
    return()=>document.removeEventListener("click",handleClick);
  },[surface]);

  return <div className="prototype-frame">
    <div className="demo-switcher"><span><i/>一期原型演示</span><div><button className={surface==="enterprise"||surface==="enterpriseLogin"?"selected":""} onClick={()=>setSurface("enterpriseLogin")}>企业端</button><button className={surface==="admin"||surface==="adminLogin"?"selected":""} onClick={()=>setSurface("adminLogin")}>运营端</button></div><small>点击切换演示角色</small></div>
    {surface==="enterpriseLogin"&&<Register onComplete={()=>{setEnterpriseView("概览");setSurface("enterprise")}}/>} {surface==="enterprise"&&<EnterpriseApp view={enterpriseView} onView={setEnterpriseView} onLogout={()=>setSurface("enterpriseLogin")} profileComplete={profileComplete} onProfileChange={setProfileComplete} policyPublished={policyPublished} favorites={favorites} onToggleFavorite={(title)=>setFavorites(items=>items.includes(title)?items.filter(item=>item!==title):[...items,title])} policyMatchReady={policyMatchReady}/>} {surface==="adminLogin"&&<AdminLogin pendingReviews={pendingReviews} onComplete={()=>{setAdminView("运营概览");setSurface("admin")}}/>} {surface==="admin"&&<AdminApp view={adminView} onView={setAdminView} onLogout={()=>setSurface("adminLogin")} pendingReviews={pendingReviews} manualPolicyPending={manualPolicyPending} onManualPolicySubmitted={()=>{if(!manualPolicyPending)setPendingReviews(count=>count+1);setManualPolicyPending(true)}} onManualPolicyResolved={()=>{setManualPolicyPending(false);setPendingReviews(count=>Math.max(0,count-1))}} profileComplete={profileComplete} policyPublished={policyPublished} policyMatchReady={adminPolicyFilter} onClearPolicyMatch={()=>setAdminPolicyFilter(false)} onPublished={(destination)=>{setPendingReviews(count=>Math.max(0,count-1));setPolicyPublished(true);setPolicyMatchReady(true);setAdminPolicyFilter(true);if(destination==="matches")setAdminView("企业与线索")}}/>}
    {toast&&<div className="demo-toast" role="status"><span>✓</span>{toast}</div>}
  </div>
}

function Register({onComplete}:{onComplete:()=>void}){
  const [mode,setMode]=useState<"login"|"register">("login");
  const [step,setStep]=useState(1);
  const [phone,setPhone]=useState("13800006688");
  const [password,setPassword]=useState("123456");
  const [error,setError]=useState("");
  const login=()=>{if(phone==="13800006688"&&password==="123456"){setError("");onComplete()}else setError("账号或密码不正确，请使用下方测试账号登录")};
  const switchMode=(next:"login"|"register")=>{setMode(next);setStep(1);setError("")};
  return <main className="register-page"><section className="register-story"><div className="brand light"><span className="brand-mark">中</span><span><b>中知院</b><small>科技政策服务平台</small></span></div><div className="register-message"><span className="eyebrow">让政策主动找到企业</span><h1>一次企业体检，<br/>看清能报什么、还缺什么</h1><p>基于权威政策原文与企业真实画像，为科技企业提供可解释的政策匹配和申报条件诊断。</p><div className="trust-row"><span>✓ 政策原文可追溯</span><span>✓ 企业数据安全保护</span><span>✓ 专业顾问人工复核</span></div></div></section><section className="register-form-wrap"><div className="register-form"><div className="auth-tabs" role="tablist"><button className={mode==="login"?"active":""} onClick={()=>switchMode("login")}>账号登录</button><button className={mode==="register"?"active":""} onClick={()=>switchMode("register")}>企业注册</button></div>{mode==="login"?<><FormTitle title="欢迎登录中知院" text="登录后继续查看企业的政策匹配结果"/><div className="test-account"><div><span>测试账号</span></div><button onClick={()=>{setPhone("13800006688");setPassword("123456");setError("")}}>一键填入</button><p><span>手机号</span><code>13800006688</code><span>密码</span><code>123456</code></p></div><label>手机号码<input value={phone} onChange={e=>setPhone(e.target.value.replace(/\s/g,""))} placeholder="请输入手机号" autoComplete="username"/></label><label>登录密码<div className="password-field"><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="请输入密码" autoComplete="current-password"/><button type="button">显示</button></div></label>{error&&<p className="auth-error"><span>!</span>{error}</p>}<div className="login-options"><label className="check"><input type="checkbox" defaultChecked/>记住登录状态</label><button>忘记密码？</button></div><button className="form-submit" onClick={login}>登录并进入企业端 <span>→</span></button><p className="login-tip">还没有企业账号？<button onClick={()=>switchMode("register")}>立即注册</button></p></>:<><div className="step-line"><span className="done">1</span><i className={step===2?"done":""}/><span className={step===2?"done":""}>2</span></div><p className="step-labels"><span>创建账号</span><span>企业信息</span></p>{step===1?<><FormTitle n="01" title="创建企业账号" text="用于接收政策提醒和保存测评结果"/><label>手机号码<input defaultValue="13900001234"/></label><label>设置密码<input type="password" defaultValue="123456" autoComplete="new-password"/></label><label>确认密码<input type="password" defaultValue="123456" autoComplete="new-password"/></label><label className="check"><input type="checkbox" defaultChecked/>我已阅读并同意《用户服务协议》和《隐私政策》</label><button className="form-submit" onClick={()=>setStep(2)}>下一步：填写企业信息 <span>→</span></button></>:<><FormTitle n="02" title="完善企业基本信息" text="仅需基础信息，进入平台后可继续补充"/><label>企业名称<input defaultValue="北京星云科技有限公司"/></label><label>统一社会信用代码<input defaultValue="91110108MA01XXXXXX"/></label><div className="two-fields"><label>所属地区<select><option>北京市</option></select></label><label>所属行业<select><option>软件和信息技术服务业</option></select></label></div><button className="form-submit" onClick={onComplete}>完成注册并进入平台 <span>→</span></button><button className="form-back" onClick={()=>setStep(1)}>返回上一步</button></>}<p className="login-tip">已有账号？<button onClick={()=>switchMode("login")}>立即登录</button></p></>}</div></section></main>
}
function FormTitle({n,title,text}:{n?:string;title:string;text:string}){return <div className="form-title">{n&&<span>{n}</span>}<div><h2>{title}</h2><p>{text}</p></div></div>}

function SideBar({type,items,active,onView,onLogout,reviewCount=0}:{type:"enterprise"|"admin";items:string[][];active:string;onView:(v:string)=>void;onLogout:()=>void;reviewCount?:number}){return <aside className={`sidebar ${type==="admin"?"admin-side":""}`}><div className="brand"><span className="brand-mark">中</span><span><b>中知院</b><small>{type==="admin"?"政策运营管理中心":"科技政策服务平台"}</small></span></div><nav>{items.map(([label,icon])=><button onClick={()=>onView(label)} className={active===label?"nav-item active":"nav-item"} key={label}><span>{icon}</span>{label}{label==="政策审核"&&reviewCount>0&&<em>{reviewCount}</em>}</button>)}</nav>{type==="enterprise"?<div className="sidebar-help"><span className="help-icon">?</span><b>需要申报帮助？</b><p>专业顾问为您解读政策</p><button>联系政策顾问</button></div>:<div className="system-status"><i/>政策采集服务正常<small>最后同步：刚刚</small></div>}<div className="user-row"><span className="avatar">{type==="admin"?"周":"陈"}</span><span><b>{type==="admin"?"周运营":"陈先生"}</b><small>{type==="admin"?"政策运营专员":"北京星云科技"}</small></span><button className="logout-icon" onClick={onLogout} title="退出登录">↪</button></div></aside>}
function AppHeader({title,subtitle,badgeCount=0,hideSearch=false,hideNotification=false}:{title:string;subtitle:string;badgeCount?:number;hideSearch?:boolean;hideNotification?:boolean}){return <header className="topbar"><div><p>{subtitle}</p><h1>{title}</h1></div>{(!hideSearch||!hideNotification)&&<div className="top-actions">{!hideSearch&&<button className="search">⌕ <span>搜索政策、企业或关键词</span><kbd>⌘ K</kbd></button>}{!hideNotification&&<button className="round">♢{badgeCount>0&&<i>{badgeCount}</i>}</button>}</div>}</header>}

function EnterpriseApp({view,onView,onLogout,profileComplete,onProfileChange,policyPublished,favorites,onToggleFavorite,policyMatchReady}:{view:string;onView:(v:string)=>void;onLogout:()=>void;profileComplete:boolean;onProfileChange:(complete:boolean)=>void;policyPublished:boolean;favorites:string[];onToggleFavorite:(title:string)=>void;policyMatchReady:boolean}){const contentClass=view==="政策库"?"policy-library-content":view==="企业画像"?"profile-content":"";return <main className="app-shell"><SideBar type="enterprise" items={enterpriseNav} active={view} onView={onView} onLogout={onLogout}/><section className={`content ${contentClass}`}><AppHeader title={view==="概览"?"下午好，陈先生":view} subtitle={view==="概览"?"2026年8月25日 · 星期二":"北京星云科技有限公司"} badgeCount={policyPublished?1:0} hideSearch={view==="政策库"} hideNotification={view==="政策库"}/>{view==="概览"&&<EnterpriseOverview onView={onView} profileComplete={profileComplete} policyPublished={policyPublished} policyMatchReady={policyMatchReady}/>} {view==="政策库"&&<PolicyLibrary policyPublished={policyPublished} favorites={favorites} onToggleFavorite={onToggleFavorite}/>} {view==="AI 政策助手"&&<AiAssistant onView={onView} profileComplete={profileComplete} policyPublished={policyPublished}/>} {view==="企业画像"&&<CompanyProfile profileComplete={profileComplete} onMatch={(complete)=>{onProfileChange(complete);onView(policyPublished?"为我匹配":"概览")}}/>} {view==="为我匹配"&&<PolicyMatches profileComplete={profileComplete} policyPublished={policyPublished} policyMatchReady={policyMatchReady}/>} {view==="我的项目"&&<EnterpriseProjects/>}</section></main>}

function EnterpriseOverview({onView,profileComplete,policyPublished,policyMatchReady}:{onView:(v:string)=>void;profileComplete:boolean;policyPublished:boolean;policyMatchReady:boolean}){
  const completion=profileComplete?100:88;
  const pendingItems=profileComplete?1:2;
  return <section className="overview-simple">
    <section className="hero-card overview-hero">
      <div className="overview-hero-copy">
        <div className="overview-heading-row"><span className="eyebrow">企业政策体检</span><span className={`overview-state ${policyPublished?"ready":"pending"}`}>{policyPublished?"政策已发布":"政策审核中"}</span></div>
        <h2>您的企业画像已完成 <strong>{completion}%</strong></h2>
        <p>{policyPublished&&policyMatchReady?"真实政策已完成企业画像比对，可查看匹配理由与缺失条件。":profileComplete?"企业资料字段已补全，政策审核发布后将自动执行条件比对。":"经营、研发和资质数据已完善，细分市场证明仍待补充。"}</p>
        <button className="primary" onClick={()=>onView(profileComplete&&policyPublished?"为我匹配":"企业画像")}>{profileComplete&&policyPublished?"查看最新匹配结果":"继续完善企业画像"} <span>→</span></button>
      </div>
      <div className="profile-orbit compact-orbit"><div className="orbit-ring"><b>{completion}%</b><small>画像完整度</small></div><span className="tag tag-a">待补充 {pendingItems} 项</span><span className="tag tag-b">{policyPublished?"较高匹配":"等待政策发布"}</span></div>
    </section>
    <div className="overview-core-grid">
      <section className="panel recommendations overview-policy-card">
        <div className="panel-head"><div><span className="section-kicker">重点政策</span><h3>{policyPublished?"较高匹配政策":"政策审核中"}</h3></div>{policyPublished&&<button onClick={()=>onView("为我匹配")}>查看结果 →</button>}</div>
        {policyPublished?<div className="policy-list">{policies.slice(0,1).map(p=><PolicyRow policy={p} key={p.title}/>)}</div>:<div className="overview-pending-row"><span>⌛</span><div><b>主演示政策正在运营审核</b><p>审核通过后将自动进入政策库、AI问答和企业匹配，无需企业重复操作。</p></div></div>}
      </section>
      <section className="ai-card overview-ai-card">
        <div className="ai-title"><span>✦</span><div><h3>政策助手</h3></div></div>
        <p>{policyPublished?"解读已审核政策，回答附政府原文依据。":"政策审核发布后即可进行有依据的问答。"}</p>
        <button className="overview-ai-entry" onClick={()=>onView("AI 政策助手")}>{policyPublished?"开始咨询":"查看助手准备状态"}<span>→</span></button>
      </section>
    </div>
  </section>;
}
function EnterpriseProjects(){
  const [draftReady,setDraftReady]=useState(false);
  return <section className="page-stack project-archive-page">
    <div className="project-alert"><span>6</span><div><b>专精特新资质申报还有6天截止</b><p>当前处于材料准备阶段，下一次站内提醒将在8月28日发送。</p></div><i>临近截止</i></div>
    <article className="project-record-card">
      <header><div><span className="project-status">准备中</span><small>申报项目 · PRJ-202608-0001</small><h2>2026年第二批专精特新中小企业资质申报</h2><p>关联政策：{REAL_POLICY_TITLE}</p></div><div className="project-countdown"><b>6</b><span>天后截止</span><small>2026年8月31日 24:00</small></div></header>
      <dl className="project-meta"><div><dt>申报企业</dt><dd>北京星云科技有限公司</dd></div><div><dt>当前阶段</dt><dd>{draftReady?"AI初稿":"材料准备"}</dd></div><div><dt>材料完整度</dt><dd>7/10 项</dd></div><div><dt>初稿状态</dt><dd>{draftReady?"已生成":"尚未生成"}</dd></div></dl>
      <div className="project-progress" aria-label="材料与初稿进度"><div className="done"><i>✓</i><span><b>项目已创建</b><small>系统自动完成</small></span></div><div className={draftReady?"done":"active"}><i>{draftReady?"✓":"2"}</i><span><b>材料准备</b><small>{draftReady?"已生成初稿":"7/10 项"}</small></span></div><div className={draftReady?"active":""}><i>3</i><span><b>AI生成初稿</b><small>{draftReady?"已生成":"待处理"}</small></span></div><div><i>4</i><span><b>校对与导出</b><small>待处理</small></span></div></div>
      <div className={`project-draft-entry ${draftReady?"ready":""}`}><span>✦</span><div><b>{draftReady?"AI申报书初稿已生成":"AI辅助申报书初稿"}</b><p>{draftReady?"已根据企业画像和现有材料生成，2处内容待补充。":"根据企业画像和现有材料生成初稿，缺失内容将标记待补充。"}</p></div><button onClick={()=>setDraftReady(true)}>{draftReady?"查看初稿":"生成初稿"} →</button></div>
    </article>
  </section>
}
function Stat({icon,color,label,value,note}:{icon:string;color:string;label:string;value:string;note:string}){return <article><span className={`stat-icon ${color}`}>{icon}</span><div><small>{label}</small><b>{value} <em>项</em></b><p>{note}</p></div></article>}
function PolicyRow({policy}:{policy:Policy}){return <article className="policy-row"><div className="match-level-badge"><b>{policy.match.replace("匹配","")}</b><small>规则匹配</small></div><div className="policy-copy"><h4>{policy.title}</h4><p className="policy-meta">{policy.meta}</p><p className="policy-reason"><span>✦</span>{policy.reason}</p></div><div className="policy-aside"><b>{policy.amount}</b><small>{policy.deadline}</small><button>›</button></div></article>}
function Deadline({day,title,left}:{day:string;title:string;left:string}){return <div className="deadline"><span><b>{day}</b><small>八月</small></span><div><b>{title}</b><small>{left}</small></div></div>}

function PolicyLibrary({policyPublished,favorites,onToggleFavorite}:{policyPublished:boolean;favorites:string[];onToggleFavorite:(title:string)=>void}){
  const [query,setQuery]=useState("");
  const [tab,setTab]=useState<"all"|"favorites">("all");
  const [selected,setSelected]=useState<Policy|null>(null);
  const publishedPolicies=policyPublished?policies:[];
  const tabPolicies=tab==="favorites"?publishedPolicies.filter(policy=>favorites.includes(policy.title)):publishedPolicies;
  const visiblePolicies=tabPolicies.filter(policy=>`${policy.title}${policy.meta}${policy.reason}`.includes(query));
  if(selected)return <PolicyDetail policy={selected} onBack={()=>setSelected(null)} favorites={favorites} onToggleFavorite={onToggleFavorite}/>;
  return <section className="page-stack">
    <div className="policy-library-tabs" role="tablist" aria-label="政策库视图">
      <button className={tab==="all"?"active":""} onClick={()=>setTab("all")}>全部政策</button>
      <button className={tab==="favorites"?"active":""} onClick={()=>setTab("favorites")}>我的关注 <span>{favorites.length}</span></button>
    </div>
    <div className="library-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索政策名称、发布部门或政策内容"/><button>搜索政策</button></div>
    <FilterRow labels={["全部地区","北京市","资质认定","申报中"]}/>
    {visiblePolicies.length?<div className="policy-catalog">{visiblePolicies.map(p=><article key={p.title}><div className="catalog-top"><span className="status">{p.demo?"演示数据":tab==="favorites"?"已关注":p.status}</span><span>{p.region}</span><span>{p.meta.split(" · ")[1]}</span><button aria-label={favorites.includes(p.title)?"取消关注":"关注政策"} onClick={()=>onToggleFavorite(p.title)}>{favorites.includes(p.title)?"★":"☆"}</button></div><h3>{p.title}</h3><p>{p.reason}。{p.demo?"该条目仅用于丰富原型列表，不参与主演示数据联动。":"政策名称、来源、截止时间与申报条件均与运营审核和企业匹配保持一致。"}</p><div className="catalog-bottom"><span><small>政策类型</small><b>{p.amount}</b></span><span><small>申报截止</small><b>{p.deadline}</b></span><button disabled={p.demo} onClick={()=>!p.demo&&setSelected(p)}>{p.demo?"演示数据（不展开）":"查看政策详情 →"}</button></div></article>)}</div>:<div className="empty-state"><span>{tab==="favorites"?"☆":"⌛"}</span><h3>{tab==="favorites"?"暂未关注政策":"暂无已发布政策"}</h3><p>{tab==="favorites"?(policyPublished?"可在“全部政策”中关注感兴趣的政策。":"政策审核发布后，可在政策库中添加关注。"):(query?"没有找到符合当前关键词的政策。":"运营端审核通过后，政策将出现在这里。")}</p></div>}
  </section>
}
function PolicyDetail({policy,onBack,favorites,onToggleFavorite}:{policy:Policy;onBack:()=>void;favorites:string[];onToggleFavorite:(title:string)=>void}){const [tab,setTab]=useState<"summary"|"source">("summary");return <section className="page-stack policy-detail"><button className="back-link" onClick={onBack}>← 返回政策知识库</button><div className="policy-detail-head"><div className="catalog-top"><span className="status">{policy.status}</span><span>{policy.region}</span><span>{policy.meta.split(" · ")[1]}</span></div><h2>{policy.title}</h2><p>北京市经济和信息化局 · 2026年7月22日发布</p><div><button onClick={()=>onToggleFavorite(policy.title)}>{favorites.includes(policy.title)?"★ 已收藏":"☆ 收藏政策"}</button><button className="form-submit">针对该政策提问</button></div></div><div className="policy-detail-layout"><article className="policy-main"><div className="detail-tabs"><button className={tab==="summary"?"active":""} onClick={()=>setTab("summary")}>结构化解读</button><button className={tab==="source"?"active":""} onClick={()=>setTab("source")}>政策原文</button></div>{tab==="summary"?<><section className="summary-callout"><span>一句话速览</span><p>北京市2026年第二批专精特新中小企业资质申报，不直接承诺固定资金补贴。</p></section><div className="detail-grid"><DetailItem label="政策类型" value="专精特新资质认定"/><DetailItem label="支持方式" value="资质培育与认定"/><DetailItem label="申报截止" value={policy.deadline}/><DetailItem label="办理方式" value="优质中小企业梯度培育平台申报"/></div><h3>申报对象</h3><p>在北京市注册、具有独立法人资格，符合中小企业划型标准，并满足有效科技型中小企业或创新型中小企业等基础要求的企业。</p><h3>核心申报条件</h3><ul className="policy-conditions"><li><span>1</span>在细分市场从事特定业务时间达到3年以上</li><li><span>2</span>上年度营业收入达到1500万元以上，主营业务收入占比达到80%以上</li><li><span>3</span>近两年研发费用均达到100万元以上，且占营业收入比重达到3%以上</li><li><span>4</span>至少拥有1项已授权Ⅰ类知识产权并产生经济效益</li></ul><h3>演示企业主要缺口</h3><p>北京星云科技目前没有已授权Ⅰ类知识产权，细分市场占有率证明待补充，因此只能判断为“较高匹配、建议人工复核”。</p></>:<div className="source-copy"><p className="source-badge">原文来源：北京市经济和信息化局官网 · 2026年8月24日已核验</p><h3>{REAL_POLICY_TITLE}</h3><p>申报时间：2026年7月22日至2026年8月31日24:00。</p><h4>一、申报范围</h4><p>申报企业需在北京市注册、具有独立法人资格，符合中小企业划型标准，并满足通知规定的资质和合规要求。</p><h4>二、重点条件</h4><p className="highlight">企业需满足细分市场经营年限、营收及主营业务占比、研发投入、资产负债率和已授权Ⅰ类知识产权等条件。</p><h4>三、结果说明</h4><p>本通知属于专精特新中小企业资质申报，原文未承诺固定金额补贴。</p></div>}</article><aside className="policy-match-side"><span className="section-kicker">与当前企业匹配</span><div className="big-score match-level"><b>{policy.match}</b><span>规则初筛<small>建议人工复核</small></span></div><Condition state="pass" title="注册与主体资格" text="北京市海淀区注册，独立法人"/><Condition state="pass" title="营收与研发投入" text="营收、主营占比和研发投入达到基础门槛"/><Condition state="partial" title="Ⅰ类知识产权" text="当前0项，为关键缺失条件"/><Condition state="unknown" title="细分市场证明" text="企业画像中尚未上传"/><button className="form-submit">查看完整诊断 →</button><hr/><small>权威来源</small><p>北京市经济和信息化局</p><button className="source-link" onClick={()=>window.open(REAL_POLICY_URL,"_blank","noopener,noreferrer")}>查看政府网站原文 ↗</button></aside></div></section>}
function DetailItem({label,value}:{label:string;value:string}){return <div><small>{label}</small><b>{value}</b></div>}
function PageIntro({kicker,title,text,action,onAction}:{kicker:string;title:string;text:string;action?:string;onAction?:()=>void}){return <div className="page-intro"><div><span className="section-kicker">{kicker}</span><h2>{title}</h2><p>{text}</p></div>{action&&<button className="form-submit" onClick={onAction}>{action}</button>}</div>}
function FilterRow({labels}:{labels:string[]}){return <div className="filter-row">{labels.map((x,i)=><button className={i===0?"chosen":""} key={x}>{x}</button>)}<i/><select><option>全部政策类型</option></select><select><option>申报状态</option></select></div>}

function AiAssistant({onView,profileComplete,policyPublished}:{onView:(view:string)=>void;profileComplete:boolean;policyPublished:boolean}){
  const [asked,setAsked]=useState(false);
  if(!policyPublished)return <div className="assistant-layout is-locked">
    <aside className="chat-history">
      <button className="new-chat" disabled>＋ 发起新对话</button>
      <small>当前会话</small>
      <button className="history-active">欢迎使用AI政策助手</button>
      <button disabled>政策审核完成后可开始提问</button>
    </aside>
    <section className="conversation">
      <div className="conversation-head"><div className="ai-title"><span>✦</span><div><h3>AI 政策助手</h3><small>当前知识库准备中 · 仅使用已审核政策</small></div></div><span className="chat-readiness-badge">待启用</span></div>
      <div className="messages locked-messages"><div className="bot-message welcome-message"><div className="bot-avatar">✦</div><div><p>您好，我是中知院AI政策助手。我会结合企业画像解读已审核政策，并提供原文引用、匹配理由和缺失条件诊断。</p><div className="chat-readiness-card"><span>⌛</span><div><h4>主演示政策正在运营审核</h4><p>政策发布后即可开始有依据的政策问答；未经核验的内容不会用于企业判断。</p><div className="readiness-steps"><i className="ready">✓ 企业画像已就绪</i><i>2 政策审核中</i><i>3 启用AI问答</i></div></div></div><div className="locked-chat-actions"><button onClick={()=>onView("企业画像")}>查看企业画像</button><button>联系政策顾问</button></div></div></div></div>
      <div className="composer locked-composer"><div className="suggestions"><button disabled>这项政策适合我们吗？</button><button disabled>还缺哪些关键条件？</button><button disabled>需要准备什么材料？</button></div><div><input disabled placeholder="政策审核发布后即可提问…"/><button disabled aria-label="发送问题">↑</button></div><small>当前暂不可发送 · 政策审核发布后自动启用</small></div>
    </section>
    <aside className="chat-context"><span className="section-kicker">当前企业</span><h3>北京星云科技</h3><div className="context-score"><b>{profileComplete?"完整":"待补充"}</b><span>画像状态</span></div><p>软件和信息技术服务业</p><p>成立 4 年 · 68 人</p><p>科技型中小企业（有效）</p><button onClick={()=>onView("企业画像")}>查看完整画像 →</button><hr/><small>问答准备状态</small><h4>企业画像核心字段已接入</h4><h4 className="context-policy-pending">已审核真实政策 0 条</h4></aside>
  </div>;
  return <div className="assistant-layout"><aside className="chat-history"><button className="new-chat">＋ 发起新对话</button><small>今天</small><button className="history-active">这项专精特新认定适合我们吗？</button><button>还缺哪些关键条件？</button><small>主演示政策</small><button>申报什么时候截止？</button><button>需要准备什么材料？</button></aside><section className="conversation"><div className="conversation-head"><div className="ai-title"><span>✦</span><div><h3>AI 政策助手</h3><small>回答基于已审核真实政策 · 原文可追溯</small></div></div><button>···</button></div><div className="messages"><div className="user-message">北京星云科技适合申报2026年第二批专精特新中小企业资质吗？</div><div className="bot-message"><div className="bot-avatar">✦</div><div><p>根据已审核政策和当前企业画像，系统初筛为<b>较高匹配</b>，但不能直接判断已具备申报资格：</p><div className="answer-policy"><span>{realPolicy.match}</span><h4>{realPolicy.title}</h4><p>{realPolicy.reason}。本政策属于资质认定，不直接承诺固定金额补贴。</p></div><div className="citation"><b>原文依据 1</b><button onClick={()=>window.open(REAL_POLICY_URL,"_blank","noopener,noreferrer")}>《2026年第二批专精特新中小企业资质申报通知》申报条件 ↗</button></div><p className="ai-note">以上为规则初筛结果，关键条件需由运营人员结合材料复核。</p></div></div>{asked&&<div className="bot-message"><div className="bot-avatar">✦</div><div><p>当前最关键的问题是<b>尚无已授权Ⅰ类知识产权</b>；另需补充细分市场占有率、重点客户或第三方证明。申报截止时间为<b>2026年8月31日24:00</b>。</p></div></div>}</div><div className="composer"><div className="suggestions"><button>我还缺哪些条件？</button><button>什么时候截止？</button><button>需要准备什么材料？</button></div><div><input placeholder="继续追问当前政策…"/><button onClick={()=>setAsked(true)}>↑</button></div><small>AI回答可能存在偏差，重要申报信息请以政策原文为准</small></div></section><aside className="chat-context"><span className="section-kicker">当前企业</span><h3>北京星云科技</h3><div className="context-score"><b>{profileComplete?"完整":"待补充"}</b><span>画像状态</span></div><p>软件和信息技术服务业</p><p>成立 4 年 · 68 人</p><p>科技型中小企业（有效）</p><button onClick={()=>onView("企业画像")}>查看完整画像 →</button><hr/><small>本次问答已使用</small><h4>企业画像核心字段</h4><h4>已审核真实政策 1 条</h4></aside></div>}

function CompanyProfile({onMatch,profileComplete}:{onMatch:(complete:boolean)=>void;profileComplete:boolean}){
  const [step,setStep]=useState(1);
  const [specialType,setSpecialType]=useState("高企认定/复审");
  const [financialYear,setFinancialYear]=useState<"2023"|"2024"|"2025">("2025");
  const financialRows=[
    ["全职员工数量（人）","52","60","68"],
    ["其中：研发人员数量（人）","18","21","24"],
    ["营业收入（万元）","2180","2750","3280"],
    ["主营业务收入（万元）","1820","2320","2820"],
    ["主营业务收入占比","83.5%","84.4%","86.0%"],
    ["主营业务收入增长率","—","27.5%","21.6%"],
    ["营业成本（万元）","1420","1780","2090"],
    ["研发费用（万元）","235","325","426"],
    ["研发费用占营业收入比例","10.8%","11.8%","13.0%"],
    ["利润总额（万元）","260","338","412"],
    ["净利润（万元）","218","286","350"],
    ["净利润增长率","—","31.2%","22.4%"],
    ["资产总额（万元）","3050","3720","4460"],
    ["净资产总额（万元）","1820","2210","2587"],
    ["负债总额（万元）","1230","1510","1873"],
    ["资产负债率","40.3%","40.6%","42.0%"],
    ["上缴税金（万元）","128","165","206"],
    ["出口额（万元）","0","0","0"],
    ["主导产品市场占有率","1.6%","1.9%","2.3%"],
  ];
  const specialTypes=["两重项目","两新项目","单项冠军","首台套/三首","高企认定/复审","新产品新技术新服务"];
  const specialFields:Record<string,[string,string][]>= {
    "两重项目":[["是否有新建项目","否"],["项目名称","暂未填写"],["项目总投资","待项目确定后填写"],["审批及建设情况","按具体项目补充"]],
    "两新项目":[["是否有设备更新项目","否"],["项目名称","暂未填写"],["设备投资情况","待项目确定后填写"],["设备国产化率","待补充"]],
    "单项冠军":[["申请产品名称","星云企业知识协同平台"],["相关领域从业时间","4年"],["近三年产品销售情况","已纳入经营财务数据"],["国内市场占有率及排名","待补充证明"]],
    "首台套/三首":[["申请名称","暂未填写"],["所属行业领域","软件和信息技术服务业"],["相关发明专利数量","0项"],["技术水平及检测情况","待补充"]],
    "高企认定/复审":[["高企状态","有效"],["证书到期时间","2026-12-31"],["科技人员占比","35.3%"],["核心知识产权","3项软件著作权；Ⅰ类知识产权待补充"]],
    "新产品新技术新服务":[["申请单位","北京星云科技有限公司"],["申请产品/服务","星云企业知识协同平台"],["创新性说明","待结合申报要求补充"],["申请材料","尚未准备"]],
  };
  const stepMeta=[
    {name:"基本信息",status:"已完成",complete:true,title:"企业基本信息",text:"企业主体、注册、行业、联系人及资质基础信息"},
    {name:"经营财务",status:"已完成",complete:true,title:"经营与财务信息",text:"选择填报年份后，录入对应年度的经营与财务数据"},
    {name:"资质能力",status:"已完成",complete:true,title:"企业资质与专业化能力",text:"梯度阶段、细分领域、认证、荣誉及相关称号"},
    {name:"知识产权",status:"已完成",complete:true,title:"知识产权及创新能力",text:"知识产权、标准制定及研发机构信息"},
    {name:"专项能力",status:"按需填写",complete:false,title:"专项申报能力",text:"选择申报方向后展示对应专项信息，未选项目无需填写"},
  ];
  return <section className="page-stack"><div className="profile-header"><div><span className="section-kicker">COMPANY PROFILE</span><p>企业画像用于政策匹配，并为AI生成申报书初稿提供基础资料</p></div><div className={profileComplete?"completion complete":"completion profile-88"}><div><b>{profileComplete?"100%":"88%"}</b><small>{profileComplete?"通用画像已完成":"待补充 1 项关键资料"}</small></div><span><i/></span></div></div><div className="profile-prototype-note"><b>原型说明</b><span>当前以文本框展示字段内容，正式系统将根据确认后的字段字典配置下拉、单选及多选项。</span></div><div className="profile-demo-summary"><div><span>虚拟演示企业</span><h3>北京星云科技有限公司</h3><p>北京市海淀区 · 软件和信息技术服务业 · 成立4年 · 68人</p></div><div className="profile-summary-tags"><span>科技型中小企业</span><span>主营业务占比86%</span><span>研发投入13%</span><span className="warning">Ⅰ类知识产权0项</span></div><small>企业为虚拟数据；匹配政策为真实政府政策</small></div><div className="profile-steps">{stepMeta.map((item,i)=><button onClick={()=>setStep(i+1)} className={step===i+1?"active":item.complete?"done":""} key={item.name}><span>{item.complete?"✓":i+1}</span><b>{item.name}</b><small>{item.status}</small></button>)}</div><div className="profile-form-card"><div className="form-card-title"><span>0{step}</span><div><h3>{stepMeta[step-1].title}</h3><p>{stepMeta[step-1].text}</p></div><i>用于政策匹配与AI初稿</i></div>
    {step===1&&<div className="form-grid"><label>企业全称<input defaultValue="北京星云科技有限公司"/></label><label>统一社会信用代码<input defaultValue="91110108MA01XXXXXX"/></label><label>企业类型<input defaultValue="有限责任公司"/></label><label>成立日期<input defaultValue="2021-06-18"/></label><label>注册地（省/市/区县）<input defaultValue="北京市 / 北京市 / 海淀区"/></label><label>注册资本<input defaultValue="1000万元"/></label><label>法定代表人及电话<input defaultValue="陈明 / 138 0000 6688"/></label><label>所属行业<input defaultValue="软件和信息技术服务业"/></label><label>企业规模<input defaultValue="中小企业（系统辅助判断）"/></label><label>联系人及电话<input defaultValue="陈先生 / 138 0000 6688"/></label><label>联系邮箱<input defaultValue="contact@example.com"/></label><label>高新技术企业及证书到期时间<input defaultValue="是 / 2026-12-31"/></label><label>近三年重大安全、质量、环保事故<input defaultValue="无"/></label><label>企业简介<input defaultValue="专注企业知识管理与协同软件研发及服务"/></label></div>}
    {step===2&&<div className="profile-financial-wrap"><div className="profile-year-note"><div><b>经营与财务数据</b><span>选择年份后填写该年度数据</span></div><label className="profile-year-selector">填报年份<select value={financialYear} onChange={event=>setFinancialYear(event.target.value as "2023"|"2024"|"2025")}><option value="2025">2025年</option><option value="2024">2024年</option><option value="2023">2023年</option></select></label></div><div className="form-grid profile-financial-fields">{financialRows.map(row=><label key={`${financialYear}-${row[0]}`}>{row[0]}<input defaultValue={row[Number(financialYear)-2022]} /></label>)}<label>主导产品名称<input defaultValue="星云企业知识协同平台"/></label></div></div>}
    {step===3&&<div className="form-grid"><label>优质中小企业梯度阶段<input defaultValue="科技型中小企业"/></label><label>主营业务、主营产品/服务<input defaultValue="企业知识管理与协同软件"/></label><label>企业从事特定细分领域<input defaultValue="企业知识管理与数字化协同"/></label><label>从事特定细分市场时间<input defaultValue="4年"/></label><label>管理体系认证<input defaultValue="ISO9000质量管理体系认证"/></label><label>荣誉奖项<input defaultValue="北京市创新创业大赛优秀企业"/></label><label>相关部门认定称号<input defaultValue="科技型中小企业（有效期内）"/></label><label>国外权威产品认证<input defaultValue="暂无"/></label><label>国内权威产品认证<input defaultValue="CMA相关检测报告"/></label><label>经营与信用状态<input defaultValue="正常"/></label></div>}
    {step===4&&<div className="form-grid"><label>已授权发明专利<input defaultValue="0项"/></label><label>已授权实用新型专利<input defaultValue="0项"/></label><label>已授权软件著作权<input defaultValue="3项"/></label><label>已受理知识产权<input defaultValue="1项发明专利申请"/></label><label>PCT专利<input defaultValue="0项"/></label><label>参与制修订标准<input defaultValue="国家标准0项 / 行业标准0项 / 国际标准0项"/></label><label>研发机构建设<input defaultValue="自建研发中心1个"/></label><label>院士专家工作站 / 博士后工作站<input defaultValue="无 / 无"/></label><label>知识产权实际应用<input defaultValue="软件著作权已用于主导产品"/></label></div>}
    {step===5&&<div className="profile-special"><div className="profile-special-types" aria-label="专项申报类型">{specialTypes.map(type=><button key={type} className={specialType===type?"active":""} onClick={()=>setSpecialType(type)}>{type}</button>)}</div><div className="profile-special-note"><span>按需填写</span><p>专项字段不计入通用画像完整度，仅在企业选择对应申报方向后使用。</p></div><div className="form-grid">{specialFields[specialType].map(([label,value])=><label key={label}>{label}<input defaultValue={value}/></label>)}</div></div>}
    <div className="form-actions"><button className="secondary">保存草稿</button><button className="form-submit" onClick={()=>step<5?setStep(step+1):onMatch(true)}>{step<5?"保存并继续":"生成初步匹配结果"} →</button></div></div></section>
}

function PolicyMatches({profileComplete,policyPublished,policyMatchReady}:{profileComplete:boolean;policyPublished:boolean;policyMatchReady:boolean}){
  const [selected,setSelected]=useState(0);
  const [declarationLevel,setDeclarationLevel]=useState<"全部"|DeclarationLevel>("全部");
  const [consult,setConsult]=useState<"closed"|"form"|"success">("closed");
  if(!policyPublished)return <section className="page-stack"><p className="page-description">仅使用已经运营审核发布的政策进行规则初筛</p><div className="empty-state"><span>◇</span><h3>暂无可匹配的已发布政策</h3><p>主演示政策审核发布后，系统会自动生成企业匹配结果。</p></div></section>;
  const visiblePolicies=declarationLevel==="全部"?policies:policies.filter(policy=>getDeclarationLevel(policy)===declarationLevel);
  const p=visiblePolicies[selected];
  return <section className="page-stack policy-matches-page">
    <div className="match-layout"><div className="match-list"><div className="match-filter-bar"><FilterRow labels={["全部结果 4","较高匹配 2","一般匹配 1","待补充信息 1"]}/><label>申报层级<select value={declarationLevel} onChange={event=>{setDeclarationLevel(event.target.value as "全部"|DeclarationLevel);setSelected(0)}}><option value="全部">全部层级</option><option value="国家级">国家级</option><option value="省级">省级</option><option value="市级">市级</option><option value="区级">区级</option></select></label></div>{visiblePolicies.length?visiblePolicies.map((item,i)=><button onClick={()=>setSelected(i)} className={`match-card ${selected===i?"selected":""}`} key={item.title}><div className="match-level-badge"><b>{item.match.replace("匹配","")}</b><small>规则匹配</small></div><div><span className="match-tags"><i>{getDeclarationLevel(item)}</i><i>{item.region}</i><i>{item.demo?"演示数据":item.status}</i></span><h3>{item.title}</h3><p>{item.demo?item.reason:profileComplete?"注册地、经营年限、营收和研发投入等基础条件符合；Ⅰ类知识产权缺失，细分市场证明已补充待复核":item.reason}</p><small>{item.meta}</small></div><span className="match-arrow">›</span></button>):<div className="match-empty"><span>◇</span><h3>暂无{declarationLevel}匹配政策</h3><p>当前已发布政策中没有该申报层级的匹配结果。</p></div>}</div>
      {p?<aside className="diagnosis">{p.demo?<DemoPolicyDiagnosis policy={p}/>:<><div className="diagnosis-head"><span className="section-kicker">MATCH REPORT · 真实主线</span><h3>{p.title}</h3><div className="match-level"><b>{p.match}</b><span>规则初筛<small>建议人工复核</small></span></div></div><div className="condition-overview"><span><b>6</b><small>已满足</small></span><span><b>1</b><small>关键缺失</small></span><span><b>{profileComplete?0:1}</b><small>待补充</small></span></div><div className="condition-list"><Condition state="pass" title="注册与主体资格" text="北京市海淀区注册，独立法人"/><Condition state="pass" title="经营与研发条件" text="经营年限、营收、主营占比、研发投入和负债率符合基础门槛"/><Condition state="partial" title="Ⅰ类知识产权" text="当前0项，为需要人工核查的关键缺失条件"/>{profileComplete?<Condition state="pass" title="细分市场证明" text="已补充客户清单及专项说明，等待运营复核"/>:<Condition state="unknown" title="细分市场证明" text="尚未上传市场占有率、重点客户或第三方证明"/>}</div><button className="form-submit" disabled={profileComplete}>{profileComplete?"资料已补充，等待复核 ✓":"补充缺失信息 →"}</button><button className="consult-button" onClick={()=>setConsult("form")}>预约顾问人工复核</button><p className="diagnosis-note">一期不预测官方得分，也不自动判定申报资格。</p></>}</aside>:<aside className="diagnosis diagnosis-empty"><span>◇</span><h3>请选择其他申报层级</h3><p>切换筛选条件后，这里将显示对应政策的匹配诊断。</p></aside>}
    </div>
    {consult!=="closed"&&p&&!p.demo&&(
      <ConsultModal state={consult} policy={p} onSubmit={()=>setConsult("success")} onClose={()=>setConsult("closed")}/>
    )}
  </section>
}
function DemoPolicyDiagnosis({policy}:{policy:Policy}){
  const counts=policy.match==="较高匹配"?[5,0,1]:policy.match==="一般匹配"?[3,1,2]:[2,0,3];
  return <><div className="diagnosis-head"><span className="section-kicker">MATCH REPORT · 演示数据</span><h3>{policy.title}</h3><div className="match-level"><b>{policy.match}</b><span>静态示例<small>不参与主演示联动</small></span></div></div><div className="condition-overview"><span><b>{counts[0]}</b><small>已满足</small></span><span><b>{counts[1]}</b><small>关键缺失</small></span><span><b>{counts[2]}</b><small>待补充</small></span></div><div className="condition-list"><Condition state="pass" title="地区与行业方向" text="企业注册地区和所属行业符合演示规则"/><Condition state={policy.match==="一般匹配"?"partial":"unknown"} title="专项申报条件" text={policy.reason}/><Condition state="unknown" title="证明材料完整性" text="尚需核对项目合同、投入凭证或专项说明"/></div><button className="form-submit" disabled>演示结果，无需操作</button><p className="diagnosis-note">本条为虚拟演示政策，仅用于展示多政策列表和不同匹配等级。</p></>
}
function ConsultModal({state,policy,onSubmit,onClose}:{state:"form"|"success";policy:Policy;onSubmit:()=>void;onClose:()=>void}){return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="consult-modal"><button className="modal-close" onClick={onClose}>×</button>{state==="form"?<><span className="modal-icon">☎</span><h2>预约政策顾问人工复核</h2><p>顾问将结合企业情况进一步核对政策口径与申报条件。</p><div className="consult-policy"><small>咨询政策</small><b>{policy.title}</b><span>{policy.match}</span></div><label>联系人<input defaultValue="陈先生"/></label><label>联系电话<input defaultValue="138 0000 6688"/></label><label>希望沟通时间<select><option>工作日 14:00—17:00</option><option>工作日 09:00—12:00</option></select></label><label>补充说明<textarea defaultValue="希望核查Ⅰ类知识产权和细分市场证明条件。"/></label><button className="form-submit" onClick={onSubmit}>提交咨询申请</button></>:<div className="success-state"><span>✓</span><h2>咨询申请已提交</h2><p>服务编号：ZX-20260821-0038</p><b>政策顾问将在1个工作日内联系您</b><button className="form-submit" onClick={onClose}>完成</button></div>}</div></div>}
function Condition({state,title,text}:{state:string;title:string;text:string}){return <div className={`condition ${state}`}><span>{state==="pass"?"✓":state==="partial"?"!":"?"}</span><div><b>{title}</b><p>{text}</p></div></div>}
function Favorites({policyPublished,favorites,onToggleFavorite}:{policyPublished:boolean;favorites:string[];onToggleFavorite:(title:string)=>void}){const items=(policyPublished?policies:[]).filter(policy=>favorites.includes(policy.title));return <section className="page-stack"><PageIntro kicker="MY COLLECTION" title="我的关注" text={`已关注 ${items.length} 条政策，系统将持续提醒申报时间`}/>{items.length?<div className="policy-catalog">{items.map(p=><article key={p.title}><div className="catalog-top"><span className="status">已关注</span><span>{p.region}</span><button onClick={()=>onToggleFavorite(p.title)}>取消关注</button></div><h3>{p.title}</h3><p>{p.reason}</p><div className="catalog-bottom"><span><small>申报截止</small><b>{p.deadline}</b></span><button>查看政策详情 →</button></div></article>)}</div>:<div className="empty-state"><span>☆</span><h3>暂未关注政策</h3><p>{policyPublished?"可前往政策知识库收藏感兴趣的政策。":"运营审核发布政策后，即可在政策库中关注。"}</p></div>}</section>}

function AdminLogin({pendingReviews:_pendingReviews,onComplete}:{pendingReviews:number;onComplete:()=>void}){const [account,setAccount]=useState("admin");const [password,setPassword]=useState("123456");const [error,setError]=useState("");const login=()=>{if(account==="admin"&&password==="123456"){setError("");onComplete()}else setError("运营账号或密码错误，请使用测试账号登录")};return <main className="admin-login-page"><section className="admin-login-brand"><div className="brand light"><span className="brand-mark">中</span><span><b>中知院</b><small>政策运营管理中心</small></span></div><div><span className="eyebrow">POLICY OPERATIONS</span><h1>让每一条政策<br/>有来源、有审核、有反馈</h1><p>统一管理政策采集、AI结构化、人工审核与企业服务线索。</p></div></section><section className="admin-login-form"><div className="login-role"><span>运营端安全登录</span><i>内部人员专用</i></div><FormTitle title="登录运营管理中心" text="企业账号无法访问此后台"/><div className="test-account"><div><span>运营测试账号</span><b>角色：政策运营管理员</b></div><button onClick={()=>{setAccount("admin");setPassword("123456");setError("")}}>一键填入</button><p><span>账号</span><code>admin</code><span>密码</span><code>123456</code></p></div><label>运营账号<input value={account} onChange={e=>setAccount(e.target.value)} autoComplete="username"/></label><label>登录密码<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>{error&&<p className="auth-error"><span>!</span>{error}</p>}<label className="check"><input type="checkbox" defaultChecked/>记住本次登录</label><button className="form-submit" onClick={login}>进入运营后台 <span>→</span></button><p className="security-note">运营操作将记录账号、时间与操作内容</p></section></main>}

function AdminApp({view,onView,onLogout,pendingReviews,manualPolicyPending,onManualPolicySubmitted,onManualPolicyResolved,profileComplete,policyPublished,policyMatchReady,onClearPolicyMatch,onPublished}:{view:string;onView:(v:string)=>void;onLogout:()=>void;pendingReviews:number;manualPolicyPending:boolean;onManualPolicySubmitted:()=>void;onManualPolicyResolved:()=>void;profileComplete:boolean;policyPublished:boolean;policyMatchReady:boolean;onClearPolicyMatch:()=>void;onPublished:(destination:"queue"|"matches")=>void}){const activeView=view==="政策采集"||view==="政策管理"?"政策中心":view;const viewMatches=()=>onView("企业与线索");return <main className="app-shell admin-app"><SideBar type="admin" items={adminNav} active={activeView} onView={onView} onLogout={onLogout} reviewCount={pendingReviews}/><section className="content"><AppHeader title={activeView} subtitle="政策运营管理中心 · 今日数据已更新" badgeCount={pendingReviews}/>{activeView==="运营概览"&&<AdminOverview onView={onView} pendingReviews={pendingReviews} manualPolicyPending={manualPolicyPending} policyPublished={policyPublished}/>} {activeView==="政策中心"&&<PolicyCenterWorkspace onView={onView} pendingReviews={pendingReviews} onManualPolicySubmitted={onManualPolicySubmitted} policyPublished={policyPublished} manualPolicyPending={manualPolicyPending}/>} {activeView==="政策审核"&&<ReviewQueue pendingReviews={pendingReviews} manualPolicyPending={manualPolicyPending} policyPublished={policyPublished} onManualPolicyResolved={onManualPolicyResolved} onPublished={onPublished} onViewMatches={viewMatches}/>} {activeView==="企业与线索"&&<EnterpriseLeads profileComplete={profileComplete} policyMatchReady={policyMatchReady} onClearPolicyMatch={onClearPolicyMatch}/>} {activeView==="AI 问答记录"&&<QaLogs policyPublished={policyPublished}/>}</section></main>}

function PolicyCenterWorkspace({onView,pendingReviews,onManualPolicySubmitted,policyPublished,manualPolicyPending}:{onView:(view:string)=>void;pendingReviews:number;onManualPolicySubmitted:()=>void;policyPublished:boolean;manualPolicyPending:boolean}){
  const [tab,setTab]=useState<"policies"|"sources"|"tasks">("policies");
  return <section className="collection-workspace policy-center-workspace"><div className="collection-workspace-tabs" role="tablist" aria-label="政策中心功能"><button className={tab==="policies"?"active":""} onClick={()=>setTab("policies")}>政策管理</button><button className={tab==="sources"?"active":""} onClick={()=>setTab("sources")}>数据源</button><button className={tab==="tasks"?"active":""} onClick={()=>setTab("tasks")}>采集任务</button></div>{tab==="policies"?<PolicyManagement policyPublished={policyPublished} manualPolicyPending={manualPolicyPending} onSubmit={onManualPolicySubmitted} onViewReview={()=>onView("政策审核")}/>:tab==="sources"?<SourceManagement onOpenTasks={()=>setTab("tasks")}/>:<CollectionTasks onView={onView} pendingReviews={pendingReviews} onManualPolicySubmitted={onManualPolicySubmitted}/>}</section>
}
const reviewRows=[{title:REAL_POLICY_TITLE,source:"北京市经济和信息化局",risk:"关键条件需人工确认",confidence:"中等",time:"16:21"}];
function AdminOverview({onView,pendingReviews,manualPolicyPending,policyPublished}:{onView:(v:string)=>void;pendingReviews:number;manualPolicyPending:boolean;policyPublished:boolean}){
  const target=pendingReviews>0?"政策审核":"政策中心";
  return <section className="page-stack">
    <div className="admin-overview-summary"><div><span className="section-kicker">今日待办</span><h2>{pendingReviews>0?`${pendingReviews} 条政策记录等待人工审核`:"当前审核任务已完成"}</h2><p>审核确认后，政策才会进入企业端政策库和匹配流程。</p></div><button onClick={()=>onView(target)}>{pendingReviews>0?"进入审核队列":"查看已发布政策"} →</button></div>
    <section className="stats admin-stats admin-stats-compact"><Stat icon="↓" color="green" label="今日采集" value="1" note="来自北京市经信局"/><Stat icon="✓" color="blue" label="已发布" value={policyPublished?"1":"0"} note="真实政策主演示"/></section>
    <section className="panel admin-review-overview"><div className="panel-head"><div><h3>{pendingReviews>0?"待处理政策":"审核任务已完成"}</h3></div></div>{pendingReviews>0?<ReviewTable compact manualPolicyPending={manualPolicyPending} policyPublished={policyPublished} includeBase={pendingReviews>(manualPolicyPending?1:0)}/>:<div className="empty-state compact"><span>✓</span><h3>当前无待审核政策</h3><p>主演示真实政策已发布。</p></div>}</section>
  </section>
}
function Activity({time,title,text}:{time:string;title:string;text:string}){return <div className="activity"><span>{time}</span><i/><div><b>{title}</b><p>{text}</p></div></div>}
function ReviewTable({compact=false,manualPolicyPending=false,policyPublished=false,includeBase,onOpen,onOpenManual}:{compact?:boolean;manualPolicyPending?:boolean;policyPublished?:boolean;includeBase?:boolean;onOpen?:()=>void;onOpenManual?:()=>void}){const showBase=includeBase??!policyPublished;const rows=[...(showBase?reviewRows.map(row=>({...row,kind:"base" as const})):[]),...(manualPolicyPending?[{title:REAL_POLICY_TITLE,source:"手工录入 · 北京市经济和信息化局",risk:"疑似重复政策，需人工确认",confidence:"待复核",time:"刚刚",kind:"manual" as const}]:[])];return <div className="data-table"><div className="table-row table-head"><span>政策名称</span><span>审核原因</span><span>置信度</span><span>采集时间</span><span>操作</span></div>{rows.slice(0,compact?1:rows.length).map((r,index)=><div className="table-row" key={`${r.kind}-${r.source}-${index}`}><span><b>{r.title}</b><small>{r.source}</small></span><span><i className="risk-dot"/>{r.risk}</span><span><b className="low-confidence">{r.confidence}</b></span><span>{r.time}</span><span><button onClick={r.kind==="base"?onOpen:onOpenManual}>{r.kind==="base"?"开始审核":"核对重复"}</button></span></div>)}</div>}
function ReviewQueue({pendingReviews,manualPolicyPending,policyPublished,onManualPolicyResolved,onPublished,onViewMatches}:{pendingReviews:number;manualPolicyPending:boolean;policyPublished:boolean;onManualPolicyResolved:()=>void;onPublished:(destination:"queue"|"matches")=>void;onViewMatches:()=>void}){const [open,setOpen]=useState(false);const [manualOpen,setManualOpen]=useState(false);const [manualResolved,setManualResolved]=useState(false);const [published,setPublished]=useState(false);const includeBase=pendingReviews>(manualPolicyPending?1:0);const completePublish=(destination:"queue"|"matches")=>{onPublished(destination);setOpen(false);setPublished(destination==="queue")};return <section className="page-stack review-page-stack"><div className="page-intro"><div><span className="section-kicker">POLICY REVIEW</span><p>{`当前共 ${pendingReviews} 条政策记录待审核，AI预处理完成后由运营人员核对发布`}</p></div></div>{open?<ReviewDetailEnhanced onBack={()=>setOpen(false)} onPublished={completePublish}/>:manualOpen?<ManualPolicyDuplicateReview onBack={()=>setManualOpen(false)} onResolve={()=>{setManualOpen(false);setManualResolved(true);onManualPolicyResolved()}}/>:<>{manualResolved&&<div className="success-banner"><span>✓</span><div><b>手工录入记录已合并</b><p>系统保留了原文来源与操作日志，政策库未生成重复记录。</p></div><button onClick={()=>setManualResolved(false)}>×</button></div>}{published&&<div className="success-banner policy-published-banner"><span>✓</span><div><b>真实政策发布成功，规则初筛已完成</b><p>主演示企业北京星云科技为“较高匹配”，Ⅰ类知识产权和细分市场证明仍需人工确认。</p></div><button className="banner-action" onClick={onViewMatches}>查看匹配企业 →</button><button className="banner-close" onClick={()=>setPublished(false)}>×</button></div>}{pendingReviews>0?<><div className="review-warning"><span>!</span><div><b>{pendingReviews}条政策记录需要人工复核</b><p>{manualPolicyPending?"其中1条来自手工录入，系统检测到与已有政策记录疑似重复。":"AI已提取政策名称、来源和截止时间；适用对象与关键条件需运营人员确认。"}</p></div><button>查看待复核</button></div><FilterRow labels={[`全部 ${pendingReviews}`,`关键条件待确认 ${includeBase?1:0}`,manualPolicyPending?"疑似重复 1":"来源正常","人工录入"]}/><ReviewTable manualPolicyPending={manualPolicyPending} policyPublished={policyPublished} includeBase={includeBase} onOpen={()=>setOpen(true)} onOpenManual={()=>setManualOpen(true)}/><p className="table-tip">自动采集与手工录入均须经过人工审核后才能进入前台政策库</p></>:!published&&!manualResolved&&<div className="empty-state"><span>✓</span><h3>当前无待审核政策</h3><p>主演示真实政策已完成审核并进入政策管理。</p></div>}</>}</section>}
function SourceManagement({onOpenTasks}:{onOpenTasks:()=>void}){const sources=[
  {name:"北京市经济和信息化局",level:"北京市",status:"正常",sync:"18分钟前",frequency:"每4小时",domain:"jxj.beijing.gov.cn",scope:["政策文件","办事通知","附件"],preset:true},
  {name:"工业和信息化部",level:"国家级",status:"正常",sync:"12分钟前",frequency:"每日2次",domain:"miit.gov.cn",scope:["政策文件","通知公告"],preset:false},
  {name:"北京市科学技术委员会",level:"北京市",status:"正常",sync:"26分钟前",frequency:"每4小时",domain:"kw.beijing.gov.cn",scope:["申报日历","政策文件"],preset:false},
  {name:"海淀区人民政府",level:"海淀区",status:"结构异常",sync:"2小时前",frequency:"每日1次",domain:"bjhd.gov.cn",scope:["政策通知"],preset:false},
  {name:"国家税务总局",level:"国家级",status:"正常",sync:"3小时前",frequency:"每日1次",domain:"chinatax.gov.cn",scope:["税收政策"],preset:false},
  {name:"北京市发展改革委",level:"北京市",status:"需要验证",sync:"1天前",frequency:"每日1次",domain:"fgw.beijing.gov.cn",scope:["政策文件"],preset:false},
];return <section className="page-stack"><div className="page-intro"><div><span className="section-kicker">DATA SOURCES</span><p>政府官方网站已预置，可直接用于自动或手动采集演示</p></div><button className="form-submit">＋ 添加数据源</button></div><div className="source-preset-banner"><span>✓</span><div><b>北京市经济和信息化局数据源已预置</b><p>已配置政策文件、办事通知和附件采集范围，可切换到“采集任务”手动触发。</p></div><button onClick={onOpenTasks}>查看采集任务 →</button></div><div className="source-grid">{sources.map(source=><article className={source.preset?"source-card preset":"source-card"} key={source.name}><div><div className="source-statuses"><span className={source.status==="正常"?"source-ok":"source-warn"}>{source.status}</span>{source.preset&&<span className="preset-badge">演示预置</span>}</div><button>···</button></div><h3>{source.name}</h3><p>覆盖范围：{source.level}</p><code>{source.domain}</code><div className="source-scope">{source.scope.map(item=><span key={item}>{item}</span>)}</div><dl><div><dt>最近同步</dt><dd>{source.sync}</dd></div><div><dt>采集频率</dt><dd>{source.frequency}</dd></div></dl><button className="source-action" onClick={onOpenTasks}>查看采集记录 →</button></article>)}</div></section>}
type CollectionTaskDetail = {taskId:string;source:string;status:string;change:string;time:string;trigger:string;start:string;end:string;duration:string;scanned:string;attachments:string;added:string;updated:string;duplicates:string;failed:string;aiStatus:string};
const collectionTasks:CollectionTaskDetail[]=[
  {taskId:"COL-20260722-0001",source:"北京市经济和信息化局",status:"采集完成",change:"1 / 0",time:"16:20",trigger:"自动采集 · 每4小时",start:"2026-08-21 16:12",end:"2026-08-21 16:20",duration:"8分12秒",scanned:"1页",attachments:"0个",added:"1条",updated:"0条",duplicates:"0条",failed:"0条",aiStatus:"已完成 · 1条真实政策进入人工审核"},
  {taskId:"COL-20260821-1542",source:"海淀区人民政府",status:"页面结构异常",change:"0 / 0",time:"15:42",trigger:"自动采集 · 每日1次",start:"2026-08-21 15:41",end:"2026-08-21 15:42",duration:"1分06秒",scanned:"1页",attachments:"0个",added:"0条",updated:"0条",duplicates:"0条",failed:"1条",aiStatus:"未进入AI解析"},
];
function CollectionTasks({onView,pendingReviews,onManualPolicySubmitted}:{onView:(view:string)=>void;pendingReviews:number;onManualPolicySubmitted:()=>void}){
  const [errorOpen,setErrorOpen]=useState(false);
  const [running,setRunning]=useState(false);
  const [confirmOpen,setConfirmOpen]=useState(false);
  const [manualEntryOpen,setManualEntryOpen]=useState(false);
  const [manualSubmitted,setManualSubmitted]=useState(false);
  const [manualCount,setManualCount]=useState(0);
  const [detailTask,setDetailTask]=useState<CollectionTaskDetail|null>(null);
  return <section className="page-stack"><div className="page-intro"><div><span className="section-kicker">COLLECTION TASKS</span><p>主演示展示1条真实政策的自动采集、解析和异常分流</p></div><button className="form-submit" onClick={()=>setConfirmOpen(true)}>手动立即采集</button></div> {confirmOpen&&<CollectionConfirmModal onClose={()=>setConfirmOpen(false)} onConfirm={(count)=>{setManualCount(count);setRunning(true);setConfirmOpen(false)}}/>}{manualEntryOpen&&<ManualPolicyModal onClose={()=>setManualEntryOpen(false)} onSubmit={()=>{onManualPolicySubmitted();setManualEntryOpen(false);setManualSubmitted(true)}}/>}{detailTask&&<CollectionTaskDrawer task={detailTask} onClose={()=>setDetailTask(null)} onViewPolicies={()=>{setDetailTask(null);onView("政策审核")}}/>}<section className="stats admin-stats"><Stat icon="↻" color="green" label="运行中" value={running?String(manualCount):"0"} note={running?"手动任务已进入队列":"当前没有运行任务"}/><Stat icon="✓" color="blue" label="今日成功" value="1" note="新增1条真实政策"/><Stat icon="!" color="amber" label="待审核" value={String(pendingReviews)} note={pendingReviews?"政策字段或重复记录待复核":"当前无待审核记录"}/><Stat icon="×" color="coral" label="今日失败" value="1" note="页面结构已变化"/></section>{manualSubmitted&&<div className="success-banner"><span>✓</span><div><b>异常任务已转为手工录入</b><p>录入内容已提交AI解析并进入政策审核队列。</p></div><button onClick={()=>onView("政策审核")}>查看审核队列 →</button></div>}{running&&<div className="success-banner"><span>↻</span><div><b>已启动 {manualCount} 个手动采集任务</b><p>系统正在采集所选政府网站，完成后将自动进入AI解析流程。</p></div><button onClick={()=>{setRunning(false);setManualCount(0)}}>×</button></div>}{errorOpen&&<div className="collection-error"><div><span>!</span><b>海淀区人民政府采集失败</b><p>页面结构发生变化，正文选择器无法定位；系统已暂停该来源自动发布。</p></div><dl><div><dt>错误类型</dt><dd>页面结构异常</dd></div><div><dt>连续失败</dt><dd>3次</dd></div><div><dt>最后成功</dt><dd>2026-08-20 16:30</dd></div></dl><button className="secondary" onClick={()=>{setErrorOpen(false);setManualEntryOpen(true)}}>转人工录入</button><button className="form-submit" onClick={()=>{setErrorOpen(false);setManualCount(1);setRunning(true)}}>重新执行</button></div>}<div className="data-table collection-table"><div className="table-row table-head"><span>数据来源</span><span>运行状态</span><span>新增/更新</span><span>执行时间</span><span>操作</span></div>{collectionTasks.map(task=>{const failed=task.status==="页面结构异常";return <div className={`table-row ${failed?"failed-row":""}`} key={task.taskId}><span><b>{task.source}</b><small>{failed?"需要人工处理":"主演示真实政策"}</small></span><span>{task.status}</span><span>{task.change}</span><span>{task.time}</span><span><button onClick={()=>{if(failed){setDetailTask(null);setErrorOpen(true)}else{setErrorOpen(false);setDetailTask(task)}}}>{failed?"查看异常":"查看详情"}</button></span></div>})}</div></section>
}
function CollectionTaskDrawer({task,onClose,onViewPolicies}:{task:CollectionTaskDetail;onClose:()=>void;onViewPolicies:()=>void}){
  const complete=task.status==="采集完成";
  return <div className="drawer-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><aside className="collection-task-drawer" role="dialog" aria-modal="true" aria-labelledby="collection-task-title"><div className="drawer-head"><div><span className="section-kicker">COLLECTION DETAIL</span><h2 id="collection-task-title">采集任务详情</h2></div><button aria-label="关闭采集任务详情" onClick={onClose}>×</button></div><section className="task-source-summary"><span className={complete?"task-state done":"task-state processing"}>{complete?"✓":"↻"}</span><div><small>{task.taskId}</small><h3>{task.source}</h3><p>{task.trigger}</p></div><b className={complete?"status-done":"status-processing"}>{task.status}</b></section><div className="task-time-grid"><div><small>开始时间</small><b>{task.start}</b></div><div><small>{complete?"完成时间":"预计完成"}</small><b>{task.end}</b></div><div><small>任务耗时</small><b>{task.duration}</b></div></div><section className="drawer-section"><div className="drawer-section-title"><h3>采集结果</h3><span>{complete?"本次任务已完成":"数据持续更新中"}</span></div><div className="task-result-grid"><div><small>扫描页面</small><b>{task.scanned}</b></div><div><small>解析附件</small><b>{task.attachments}</b></div><div className="result-added"><small>新增政策</small><b>{task.added}</b></div><div><small>更新政策</small><b>{task.updated}</b></div><div><small>重复跳过</small><b>{task.duplicates}</b></div><div><small>采集失败</small><b>{task.failed}</b></div></div></section><section className="drawer-section"><div className="drawer-section-title"><h3>处理进度</h3><span>{complete?"全部完成":"AI解析中"}</span></div><div className="task-progress"><div className="progress-step done"><i>✓</i><div><b>任务创建</b><p>已按数据源采集计划启动任务</p></div><time>{task.start.slice(-5)}</time></div><div className="progress-step done"><i>✓</i><div><b>网页与附件采集</b><p>完成正文、通知附件和来源信息保存</p></div><time>{complete?"16:17":"16:15"}</time></div><div className={`progress-step ${complete?"done":"active"}`}><i>{complete?"✓":"↻"}</i><div><b>AI结构化解析</b><p>{task.aiStatus}</p></div><time>{complete?task.end.slice(-5):"进行中"}</time></div><div className={`progress-step ${complete?"done":"pending"}`}><i>{complete?"✓":"4"}</i><div><b>质量判断与分流</b><p>{complete?"根据来源状态和字段置信度进入审核或抽检":"解析完成后自动判断是否需要人工审核"}</p></div><time>{complete?"完成":"待处理"}</time></div></div></section><div className="drawer-actions"><button className="secondary" onClick={onClose}>关闭</button><button className="form-submit" disabled={!complete} onClick={onViewPolicies}>{complete?"查看新增政策 →":"解析完成后进入审核"}</button></div></aside></div>
}
function PolicyManagement({policyPublished,manualPolicyPending,onSubmit,onViewReview}:{policyPublished:boolean;manualPolicyPending:boolean;onSubmit:()=>void;onViewReview:()=>void}){
  const [open,setOpen]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const submitPolicy=()=>{onSubmit();setOpen(false);setSubmitted(true)};
  const visiblePolicies=policyPublished?policies:demoPolicies;
  const effectiveCount=visiblePolicies.filter(policy=>policy.status==="申报中").length;
  return <section className="page-stack"><div className="page-intro compact-page-intro"><div><span className="section-kicker">POLICY MANAGEMENT</span><p>共展示 {visiblePolicies.length} 条记录：{policyPublished?"1条真实主演示政策，":""}其余为列表演示数据</p></div><button className="form-submit" onClick={()=>setOpen(true)}>＋ 手工录入政策</button></div>{(submitted||manualPolicyPending)&&<div className="success-banner manual-entry-banner"><span>↻</span><div><b>手工录入政策已提交AI解析</b><p>系统检测到已有同名政策记录，已进入审核队列等待运营人员确认是否合并。</p></div><button onClick={onViewReview}>查看审核队列 →</button></div>}<FilterRow labels={[`全部 ${visiblePolicies.length}`,`有效 ${effectiveCount}`,"即将生效 1","已下架 0"]}/><div className="data-table"><div className="table-row table-head"><span>政策名称</span><span>政策类型</span><span>发布状态</span><span>申报截止</span><span>操作</span></div>{visiblePolicies.map(policy=><div className="table-row" key={policy.title}><span><b>{policy.title}</b><small>{policy.meta.split(" · ")[0]}{policy.demo?" · 列表演示":" · 2026年7月22日"}</small></span><span>{policy.meta.split(" · ")[1]}</span><span><b className={policy.status==="申报中"?"status-done":"status-demo"}>{policy.status==="申报中"?"前台有效":"即将生效"}</b></span><span>{policy.deadline.replace("截止","")}</span><span>{policy.demo?<button disabled>演示条目</button>:<button onClick={()=>window.open(REAL_POLICY_URL,"_blank","noopener,noreferrer")}>查看原文</button>}</span></div>)}</div>{open&&<ManualPolicyModal onClose={()=>setOpen(false)} onSubmit={submitPolicy}/>}</section>
}
function ManualPolicyDuplicateReview({onBack,onResolve}:{onBack:()=>void;onResolve:()=>void}){
  return <section className="manual-review-panel"><div className="review-toolbar"><button onClick={onBack}>← 返回审核队列</button><span>录入编号：MAN-20260825-0001</span><div><button className="secondary" onClick={onBack}>保留待确认</button><button className="publish" onClick={onResolve}>合并到已有记录</button></div></div><div className="manual-review-card"><div className="manual-review-title"><span>!</span><div><small>DUPLICATE CHECK</small><h2>检测到疑似重复政策</h2><p>手工录入内容与系统已有政策记录的名称、发布部门和原文链接一致。</p></div><b>建议合并</b></div><div className="manual-compare"><section><small>本次手工录入</small><h3>{REAL_POLICY_TITLE}</h3><dl><div><dt>发布部门</dt><dd>北京市经济和信息化局</dd></div><div><dt>发布日期</dt><dd>2026年7月22日</dd></div><div><dt>原文链接</dt><dd>与已有政策一致</dd></div><div><dt>处理状态</dt><dd>AI解析完成，待人工确认</dd></div></dl></section><i>≈</i><section><small>系统已有记录</small><h3>{REAL_POLICY_TITLE}</h3><dl><div><dt>发布部门</dt><dd>北京市经济和信息化局</dd></div><div><dt>记录状态</dt><dd>已进入政策处理流程</dd></div><div><dt>申报截止</dt><dd>2026年8月31日24:00</dd></div><div><dt>已有版本</dt><dd>1个采集记录</dd></div></dl></section></div><div className="manual-review-advice"><span>✓</span><div><b>一期建议操作：合并到已有记录</b><p>保留手工录入来源、操作人和时间作为审计记录，不新增重复政策，也不会重复触发企业匹配。</p></div></div></div></section>
}
function EnterpriseLeads({profileComplete,policyMatchReady,onClearPolicyMatch}:{profileComplete:boolean;policyMatchReady:boolean;onClearPolicyMatch:()=>void}){
  const pendingConditionCount=profileComplete?1:2;
  const regularRows=[
    ["北京星云科技有限公司",profileComplete?"画像已完整 / 待匹配":"画像较完整 / 待匹配","咨询专精特新认定","周运营","待首次联系"],
    ["北京智衡数据技术有限公司","画像较完整 / 待匹配","关注研发创新支持","林运营","待首次联系"],
    ["海淀云策软件有限公司","画像待补充 / 待匹配","关注数字化转型服务券","王运营","资料待补充"],
    ["北京启元知识产权服务有限公司","画像较完整 / 待匹配","咨询知识产权专项","陈运营","已联系"],
  ];
  const matchedRows=[
    ["北京星云科技有限公司",`较高匹配 / 需确认${pendingConditionCount}项`,profileComplete?"基础条件符合；Ⅰ类知识产权缺失，市场证明已补充待复核":"基础条件符合；Ⅰ类知识产权缺失，市场证明待补充","周运营","待跟进"],
    ["北京智衡数据技术有限公司","较高匹配 / 待确认1项","行业方向与研发投入符合，项目证明材料待确认","林运营","待跟进"],
    ["海淀云策软件有限公司","一般匹配 / 待确认2项","注册地区符合，采购合同与服务场景信息不足","王运营","资料待补充"],
    ["北京启元知识产权服务有限公司","待补充信息 / 待确认2项","经营信息基本符合，专利实施与项目投入证明缺失","陈运营","暂缓跟进"],
  ];
  const [selected,setSelected]=useState<string|null>(null);
  const [listGenerated,setListGenerated]=useState(false);
  const rows=policyMatchReady?matchedRows:regularRows;
  if(selected)return <EnterpriseLeadDetail name={selected} profileComplete={profileComplete} onBack={()=>setSelected(null)}/>;
  return <section className="page-stack enterprise-leads-page">
    <div className="page-intro compact-page-intro lead-page-actions"><button className="secondary">导出企业列表</button>{policyMatchReady&&<button className="form-submit" disabled={listGenerated} onClick={()=>setListGenerated(true)}>{listGenerated?"跟进名单已生成 ✓":"生成跟进名单"}</button>}</div>
    {policyMatchReady&&<div className="policy-match-filter compact"><div className="match-filter-copy"><span>当前筛选政策</span><h3>{latestPolicyMatch.title}</h3></div><dl><div><dt>企业结果</dt><dd>4</dd></div><div><dt>较高匹配</dt><dd>2</dd></div><div><dt>待确认</dt><dd>3</dd></div></dl><button className="secondary compact-filter-exit" onClick={()=>{onClearPolicyMatch();setListGenerated(false)}}>退出筛选</button></div>}
    {listGenerated&&<div className="success-banner"><span>✓</span><div><b>主演示企业跟进任务已生成</b><p>北京星云科技已加入运营跟进队列，可打开企业详情核查关键条件并记录沟通结果。</p></div><button onClick={()=>setListGenerated(false)}>×</button></div>}
    <section className="stats admin-stats">{policyMatchReady?<><Stat icon="◇" color="green" label="本政策匹配企业" value="4" note="1条真实主线、3条演示"/><Stat icon="✓" color="blue" label="较高匹配" value="2" note="含主演示企业"/><Stat icon="△" color="amber" label="待确认企业" value="3" note="需补充或人工核对"/><Stat icon="◎" color="coral" label="待运营跟进" value={listGenerated?"2":"0"} note={listGenerated?"跟进名单已生成":"尚未生成跟进名单"}/></>:<><Stat icon="◎" color="green" label="企业线索" value="4" note="1条真实主线、3条演示"/><Stat icon="✓" color="blue" label="完成测评" value="3" note={profileComplete?"主演示画像已补全":"部分画像字段待补充"}/><Stat icon="✦" color="amber" label="政策线索" value="4" note="覆盖多类政策咨询"/><Stat icon="△" color="coral" label="今日待联系" value="3" note="等待运营跟进"/></>}</section>
    <div className="data-table lead-table"><div className="table-row table-head"><span>企业名称</span><span>{policyMatchReady?"政策匹配":"画像/匹配"}</span><span>{policyMatchReady?"匹配理由/缺失条件":"意向信号"}</span><span>负责人</span><span>跟进状态</span></div>{rows.map((r,rowIndex)=><button className={`table-row lead-row ${rowIndex>0?"demo-row":""}`} onClick={()=>rowIndex===0&&setSelected(r[0])} key={r[0]}>{r.map((c,i)=><span key={c}>{i===0?<><b>{c}</b><small>{rowIndex===0?"软件和信息技术服务业 · 主演示企业":"演示企业 · 列表数据"}</small></>:c}{i===4&&<i>{rowIndex===0?"查看 →":"演示"}</i>}</span>)}</button>)}</div>
    <p className="table-tip">第一条为可进入详情的主演示企业，其余条目用于丰富列表展示，不参与流程联动</p>
  </section>
}
function EnterpriseLeadDetail({name,profileComplete,onBack}:{name:string;profileComplete:boolean;onBack:()=>void}){
  const [adding,setAdding]=useState(false);
  const [saved,setSaved]=useState(false);
  const [profileExpanded,setProfileExpanded]=useState(false);
  const [draftExpanded,setDraftExpanded]=useState(false);
  return <section className="page-stack lead-detail"><div className="lead-detail-head"><button className="back-link" onClick={onBack}>← 返回企业列表</button><div><button className="secondary">分配负责人</button><button className="form-submit" onClick={()=>{setAdding(true);setSaved(false)}}>＋ 添加跟进记录</button></div></div>{saved&&<div className="success-banner"><span>✓</span><div><b>跟进记录已保存</b><p>企业状态已更新为“跟进中”，记录已写入服务时间线。</p></div><button onClick={()=>setSaved(false)}>×</button></div>}<div className="company-summary"><span className="company-logo">星</span><div><span className="lead-level">主演示企业</span><h2>{name}</h2><p>软件和信息技术服务业 · 北京市海淀区 · 成立4年 · 68人</p></div><dl><div><dt>画像状态</dt><dd>{profileComplete?"已完成":"填写中"}</dd></div><div><dt>主演示政策</dt><dd>1项</dd></div><div><dt>规则初筛</dt><dd>较高匹配</dd></div><div><dt>负责人</dt><dd>周运营</dd></div></dl></div><div className="lead-detail-grid"><section className="lead-main-stack"><section className="panel"><div className="panel-head"><div><span className="section-kicker">COMPANY PROFILE</span><h3>企业画像摘要</h3></div><button onClick={()=>setProfileExpanded(!profileExpanded)}>{profileExpanded?"收起画像":"查看完整画像"} →</button></div><div className="profile-tags"><span>科技型中小企业</span><span>软件和信息服务</span><span>细分市场4年</span><span>主营占比86%</span><span>研发投入13%</span><span className="missing">Ⅰ类知识产权0项</span></div><div className="detail-grid"><DetailItem label="上年度营收" value="3,280万元"/><DetailItem label="资产负债率" value="42%"/><DetailItem label="研发费用" value="426万元"/><DetailItem label="知识产权" value="3项软著"/></div>{profileExpanded&&<div className="ops-profile-sections"><span>基本信息</span><span>经营财务</span><span>资质能力</span><span>知识产权</span><span>专项能力</span><small>经营财务数据可按年份查看；专项能力按企业选择的申报方向展示。</small></div>}<div className="ops-draft-status"><span>✦</span><div><b>AI申报书初稿</b><p>已根据企业画像和现有材料生成 · 待企业校对</p>{draftExpanded&&<small>当前初稿存在2处待补充内容，运营人员可查看并协助企业核对。</small>}</div><button onClick={()=>setDraftExpanded(!draftExpanded)}>{draftExpanded?"收起":"查看初稿"}</button></div></section><section className="panel lead-match-diagnosis simplified"><div className="lead-match-head"><div><span className="section-kicker">PHASE 1 POLICY MATCH</span><h3>重点政策匹配结果</h3></div><span>真实政策</span></div><div className="diagnosis-policy-title simple"><div className="simple-match-badge"><b>较高</b><small>规则匹配</small></div><div><span>建议人工复核</span><h4>{REAL_POLICY_TITLE}</h4><p>北京市经济和信息化局 · 资质认定 · 2026年8月31日24:00截止</p></div></div><div className="simple-match-groups"><article className="matched"><span>✓</span><div><b>基础条件较为匹配</b><p>北京注册、科技型中小企业、经营年限、营收、研发投入和资产负债率等信息满足初筛条件。</p></div></article><article className="pending"><span>?</span><div><b>政策专项条件待确认</b><p>按政策原文核对专项材料及口径，由运营人员结合企业资料复核。</p></div></article><article className="missing"><span>!</span><div><b>关键字段缺失</b><p>当前无已授权发明专利，需核查企业知识产权情况。</p></div></article></div><div className="phase-one-review-note"><span>1</span><p><b>系统自动初筛</b>：根据企业画像与政策条件生成“符合、缺失、待确认”结果。</p><i>→</i><span>2</span><p><b>运营人员复核</b>：确认关键条件后，再将结果展示给企业。</p></div><div className="followup-advice simple"><p>匹配结果仅用于政策筛选参考，最终申报条件以政策原文及人工复核为准。</p><div><button className="secondary" onClick={()=>window.open(REAL_POLICY_URL,"_blank","noopener,noreferrer")}>查看政府网站原文 ↗</button><button className="form-submit" onClick={()=>{setAdding(true);setSaved(false)}}>添加跟进记录</button></div></div></section></section><aside className="panel service-timeline"><div className="panel-head"><h3>服务跟进时间线</h3><button>全部记录</button></div>{saved&&<Timeline time="刚刚" title="电话跟进已完成" text="已联系企业负责人，约定明天下午进一步沟通申报条件。"/>}<Timeline time="今天 15:42" title="AI申报书初稿已生成" text="企业可继续校对并补充缺失内容"/><Timeline time="今天 14:18" title="完成企业测评" text={`企业画像状态已更新为${profileComplete?"已完成":"填写中"}`}/><Timeline time="8月20日 10:35" title="AI政策问答" text="咨询2026年第二批专精特新资质申报"/>{adding&&<div className="followup-form"><h4>添加跟进记录</h4><label>跟进方式<select><option>电话沟通</option><option>微信沟通</option><option>线下面谈</option></select></label><label>跟进结果<textarea defaultValue="核查企业知识产权及政策专项条件，并协助校对AI申报书初稿。"/></label><div><button className="form-back" onClick={()=>setAdding(false)}>取消</button><button className="form-submit" onClick={()=>{setAdding(false);setSaved(true)}}>保存记录</button></div></div>}</aside></div></section>
}
function Timeline({time,title,text}:{time:string;title:string;text:string}){return <div className="timeline-item"><i/><div><small>{time}</small><b>{title}</b><p>{text}</p></div></div>}
function QaLogs({policyPublished}:{policyPublished:boolean}){const rows=[
  {company:"北京星云科技",time:"今天 15:42",question:"2026年第二批专精特新认定还缺哪些条件？",source:"已引用真实政策原文1条",status:"建议人工复核",demo:false},
  {company:"北京智衡数据",time:"今天 14:36",question:"研发创新支持计划需要准备哪些项目材料？",source:"演示问答 · 已引用政策原文2条",status:"来源正常",demo:true},
  {company:"海淀云策软件",time:"昨天 16:20",question:"数字化转型服务券是否适合软件服务企业？",source:"演示问答 · 企业采购信息待补充",status:"待补充信息",demo:true},
  {company:"北京启元知产",time:"8月24日 10:05",question:"软件著作权能否满足知识产权专项申报要求？",source:"演示问答 · 已引用政策原文1条",status:"已人工复核",demo:true},
];return <section className="page-stack"><div className="page-intro compact-page-intro"><div><span className="section-kicker">AI QA AUDIT</span><p>共展示4条记录：1条主演示问答，3条列表演示数据</p></div></div><FilterRow labels={[`全部问答 ${policyPublished?4:0}`,`需人工复核 ${policyPublished?2:0}`,`来源正常 ${policyPublished?3:0}`,"用户点踩 0"]}/>{policyPublished?<div className="qa-list">{rows.map(q=><article className={q.demo?"demo-row":""} key={q.question}><div className="avatar">{q.company[0]}</div><div><small>{q.company} · {q.time}{q.demo?" · 演示数据":" · 主演示"}</small><h3>{q.question}</h3><p>{q.source}</p></div><span>{q.status}</span><button disabled={q.demo}>{q.demo?"演示记录":"查看对话 →"}</button></article>)}</div>:<div className="empty-state"><span>✦</span><h3>暂无该政策问答记录</h3><p>政策审核发布并被企业问询后，回答与原文引用记录将在此留痕。</p></div>}</section>}
