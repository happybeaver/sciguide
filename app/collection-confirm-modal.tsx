"use client";

import { useState } from "react";

type Scope = "all" | "specified";

const collectionSources = [
  { name: "工业和信息化部", schedule: "每日 2 次", available: true },
  { name: "北京市经济和信息化局", schedule: "每 4 小时", available: true },
  { name: "北京市科学技术委员会", schedule: "每 4 小时", available: true },
  { name: "国家税务总局", schedule: "每日 1 次", available: true },
  { name: "北京市发展改革委", schedule: "正在运行", available: false },
  { name: "海淀区人民政府", schedule: "已暂停", available: false },
];

export function CollectionConfirmModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (count: number) => void;
}) {
  const availableNames = collectionSources.filter(source => source.available).map(source => source.name);
  const [scope, setScope] = useState<Scope>("all");
  const [selected, setSelected] = useState<string[]>(availableNames.slice(0, 1));
  const taskCount = scope === "all" ? availableNames.length : selected.length;

  const toggleSource = (name: string) => {
    setSelected(items => items.includes(name) ? items.filter(item => item !== name) : [...items, name]);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="collection-modal-title">
      <section className="collection-confirm-modal">
        <button className="modal-close" onClick={onClose} aria-label="关闭">×</button>
        <span className="modal-icon">↻</span>
        <h2 id="collection-modal-title">手动立即采集</h2>
        <p>本次操作仅临时执行一次，不会修改各数据源的自动采集计划。</p>

        <div className="scope-options">
          <label className={scope === "all" ? "selected" : ""}>
            <input type="radio" name="collection-scope" checked={scope === "all"} onChange={() => setScope("all")} />
            <span><b>全部正常数据源</b><small>启动 4 个任务，自动跳过运行中和已暂停的数据源</small></span>
          </label>
          <label className={scope === "specified" ? "selected" : ""}>
            <input type="radio" name="collection-scope" checked={scope === "specified"} onChange={() => setScope("specified")} />
            <span><b>指定数据源</b><small>从可用数据源中选择一个或多个执行</small></span>
          </label>
        </div>

        {scope === "specified" && (
          <div className="source-checklist">
            {collectionSources.map(source => (
              <label className={!source.available ? "disabled" : ""} key={source.name}>
                <input
                  type="checkbox"
                  disabled={!source.available}
                  checked={source.available && selected.includes(source.name)}
                  onChange={() => toggleSource(source.name)}
                />
                <span><b>{source.name}</b><small>{source.schedule}</small></span>
              </label>
            ))}
          </div>
        )}

        <div className="collection-skip-note"><span>i</span>系统将自动跳过 1 个正在运行、1 个已暂停的数据源。</div>
        <div className="collection-modal-actions">
          <span>本次预计启动 <b>{taskCount}</b> 个采集任务</span>
          <button className="secondary" onClick={onClose}>取消</button>
          <button className="form-submit" disabled={taskCount === 0} onClick={() => onConfirm(taskCount)}>确认开始采集</button>
        </div>
      </section>
    </div>
  );
}
