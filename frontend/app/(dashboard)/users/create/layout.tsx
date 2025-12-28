import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thêm người dùng",
};

export default function CreateUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
