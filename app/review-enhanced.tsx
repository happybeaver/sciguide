"use client";

import { useState } from "react";

const POLICY_TITLE = "北京市经济和信息化局关于开展2026年第二批专精特新中小企业资质申报工作的通知";
const POLICY_URL = "https://jxj.beijing.gov.cn/zwgk/2024zcwj/202607/t20260722_4778499.html";

export function ReviewDetailEnhanced({onBack,onPublished}:{onBack:()=>void;onPublished:(destination:"queue"|"matches")=>void}){
  const [published,setPublished]=useState(false);
  const [returned,setReturned]=useState(false);
  return <div className="review-detail">
    <div className="review-toolbar"><button onClick={onBack}>← 返回审核队列</button><span>政策编号：COL-20260722-0001</span><div><button className="secondary" onClick={()=>setReturned(true)}>退回重解析</button><button className="publish" onClick={()=>setPublished(true)}>审核通过并发布</button></div></div>
    {returned&&<div className="warning-banner"><span>↻</span><div><b>已退回AI重新解析</b><p>任务将保留人工修改内容，并重新识别截止日期和Ⅰ类知识产权条件。</p></div><button onClick={()=>setReturned(false)}>撤销</button></div>}
    <div className="review-columns">
      <section className="source-document"><div className="document-head"><span>政策原文</span><button onClick={()=>window.open(POLICY_URL,"_blank","noopener,noreferrer")}>打开来源网页 ↗</button></div><article><p className="doc-source">北京市经济和信息化局</p><h2>{POLICY_TITLE}</h2><p className="doc-number">2026年7月22日发布</p><h3>一、申报时间</h3><p>2026年7月22日至2026年8月31日24:00。</p><h3>二、申报对象</h3><p>在北京市注册、具有独立法人资格，符合中小企业划型标准，并满足通知规定的资质和合规要求。</p><h3>三、重点条件</h3><p className="highlight">细分市场经营达到3年以上；营收、主营业务占比和研发投入达到相应门槛；至少拥有1项已授权Ⅰ类知识产权。</p><h3>四、政策性质</h3><p>本通知属于专精特新中小企业资质申报，原文未承诺固定金额补贴。</p></article></section>
      <section className="extracted-fields"><div className="document-head"><span>AI结构化结果</span><span className="confidence-pill">中等置信度 · 需人工复核</span></div><div className="field-review"><label>政策名称 <em>高</em><input defaultValue={POLICY_TITLE}/></label><div className="two-fields"><label>发布部门 <em>高</em><input defaultValue="北京市经济和信息化局"/></label><label>政策类型 <em>高</em><select><option>资质认定</option></select></label></div><div className="two-fields"><label>支持方式 <em>高</em><input defaultValue="专精特新中小企业资质认定（非直接资金补贴）"/></label><label>截止日期 <em>高</em><input defaultValue="2026-08-31 24:00"/></label></div><label>适用对象 <em>中</em><textarea defaultValue="北京市注册、具有独立法人资格，符合中小企业划型标准并满足通知基础要求的企业"/></label><label>结构化申报条件 <em>中</em></label><div className="rule-row"><select><option>上年度营业收入</option></select><select><option>不低于</option></select><input defaultValue="1500"/><span>万元</span></div><div className="rule-row"><select><option>研发费用占比</option></select><select><option>不低于</option></select><input defaultValue="3"/><span>%</span></div><div className="rule-row"><select><option>已授权Ⅰ类知识产权</option></select><select><option>不低于</option></select><input defaultValue="1"/><span>项</span></div><label>AI摘要 <em>中</em><textarea defaultValue="北京市开展2026年第二批专精特新中小企业资质申报，申报截止时间为8月31日24:00；政策不直接承诺固定资金补贴。"/></label></div></section>
    </div>
    {published&&<div className="modal-backdrop"><div className="publish-success policy-match-success"><span>✓</span><h2>政策已发布并完成规则初筛</h2><p>政策已进入前台知识库，并与主演示企业“北京星云科技有限公司”完成画像比对。</p><dl><div><dt>演示企业</dt><dd>1 家</dd></div><div><dt>匹配等级</dt><dd>较高匹配</dd></div><div><dt>需人工确认</dt><dd>2 项</dd></div></dl><div className="match-rule-note"><b>匹配依据</b><p>北京市注册 · 科技型中小企业 · 细分市场3年以上 · 营收及研发投入达标 · Ⅰ类知识产权与市场证明待核查</p></div><div className="publish-actions"><button className="secondary" onClick={()=>{setPublished(false);onPublished("queue")}}>返回审核队列</button><button className="form-submit" onClick={()=>{setPublished(false);onPublished("matches")}}>查看匹配企业 →</button></div></div></div>}
  </div>
}
