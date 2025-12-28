import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cập nhật người dùng",
};

export default function EditUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
