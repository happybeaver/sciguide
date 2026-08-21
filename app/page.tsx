import type { Metadata } from "next";
import PrototypeClient from "./prototype-client";

export const metadata: Metadata = {
  title: "企策通｜科技政策服务平台原型",
  description: "企业画像、政策智能匹配、条件诊断与政策运营审核的一期产品原型",
};

export default function Home() {
  return <PrototypeClient />;
}
