import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thông tin hệ thống",
};

export default function SystemInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
