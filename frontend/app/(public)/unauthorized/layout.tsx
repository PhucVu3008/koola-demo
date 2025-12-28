import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Không có quyền",
};

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
