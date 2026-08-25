"use client";

import { FormEvent, useState } from "react";

export type ManualPolicyFormData = {
  title:string;
  department:string;
  sourceUrl:string;
  publishDate:string;
  deadline:string;
  policyType:string;
  region:string;
  content:string;
};

const INITIAL_POLICY:ManualPolicyFormData = {
  title:"北京市经济和信息化局关于开展2026年第二批专精特新中小企业资质申报工作的通知",
  department:"北京市经济和信息化局",
  sourceUrl:"https://jxj.beijing.gov.cn/zwgk/2024zcwj/202607/t20260722_4778499.html",
  publishDate:"2026-07-22",
  deadline:"2026-08-31T24:00",
  policyType:"资质认定",
  region:"北京市",
  content:"北京市开展2026年第二批专精特新中小企业资质申报，申报截止时间为2026年8月31日24:00。系统提交后将提取适用对象、申报条件和知识产权要求，并进入人工审核。",
};

export function ManualPolicyModal({onClose,onSubmit}:{onClose:()=>void;onSubmit:(policy:ManualPolicyFormData)=>void}){
  const [form,setForm]=useState(INITIAL_POLICY);
  const [attachment,setAttachment]=useState("");
  const [saved,setSaved]=useState(false);
  const [error,setError]=useState("");
  const update=(field:keyof ManualPolicyFormData,value:string)=>setForm(current=>({...current,[field]:value}));
  const submit=(event:FormEvent)=>{
    event.preventDefault();
    if(!form.title.trim()||!form.department.trim()||!form.sourceUrl.trim()){
      setError("请先填写政策名称、发布部门和原文链接");
      return;
    }
    onSubmit(form);
  };
  return <div className="modal-backdrop manual-policy-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <form className="manual-policy-modal" role="dialog" aria-modal="true" aria-labelledby="manual-policy-title" onSubmit={submit}>
      <button className="modal-close" type="button" aria-label="关闭手工录入政策" onClick={onClose}>×</button>
      <div className="manual-policy-heading"><span className="modal-icon">＋</span><div><small>MANUAL POLICY ENTRY</small><h2 id="manual-policy-title">手工录入政策</h2><p>适用于自动采集未覆盖或采集异常的政策，提交后仍需AI解析和人工审核。</p></div></div>
      <div className="manual-policy-flow"><span className="active">1 手工录入</span><i>→</i><span>2 AI解析</span><i>→</i><span>3 人工审核</span><i>→</i><span>4 发布入库</span></div>
      <div className="manual-policy-fields">
        <label className="full">政策名称 <em>必填</em><input value={form.title} onChange={event=>update("title",event.target.value)} required/></label>
        <label>发布部门 <em>必填</em><input value={form.department} onChange={event=>update("department",event.target.value)} required/></label>
        <label>政策类型<select value={form.policyType} onChange={event=>update("policyType",event.target.value)}><option>资质认定</option><option>资金支持</option><option>税收优惠</option><option>人才政策</option></select></label>
        <label className="full">政府原文链接 <em>必填</em><input type="url" value={form.sourceUrl} onChange={event=>update("sourceUrl",event.target.value)} required/></label>
        <label>发布日期<input type="date" value={form.publishDate} onChange={event=>update("publishDate",event.target.value)}/></label>
        <label>申报截止<input value={form.deadline.replace("T24:00"," 24:00")} onChange={event=>update("deadline",event.target.value)}/></label>
        <label>适用地区<select value={form.region} onChange={event=>update("region",event.target.value)}><option>北京市</option><option>全国</option><option>其他地区</option></select></label>
        <label className="manual-file">政策附件<span className={attachment?"has-file":""}>{attachment||"选择 PDF / Word 文件"}</span><input type="file" accept=".pdf,.doc,.docx" onChange={event=>setAttachment(event.target.files?.[0]?.name||"")}/></label>
        <label className="full">政策原文或摘要<textarea value={form.content} onChange={event=>update("content",event.target.value)} placeholder="粘贴政策原文，或上传附件后补充说明"/></label>
      </div>
      <div className="manual-policy-note"><span>!</span><p><b>原型演示提示</b>：当前预填真实政策用于展示重复校验。正式系统会先保存原文，再由AI提取条件和标签，低置信度字段进入人工审核。</p></div>
      {saved&&<div className="manual-draft-saved"><span>✓</span>草稿已临时保存，可继续编辑后提交</div>}
      {error&&<p className="auth-error"><span>!</span>{error}</p>}
      <div className="manual-policy-actions"><button className="secondary" type="button" onClick={onClose}>取消</button><button className="secondary" type="button" onClick={event=>{event.stopPropagation();setSaved(true);setError("")}}>保存草稿</button><button className="form-submit" type="submit">提交AI解析 <span>→</span></button></div>
    </form>
  </div>;
}
