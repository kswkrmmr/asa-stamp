import { UserSidebar } from "@/components/UserSidebar";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col sm:flex-row">
      <UserSidebar />
      <main className="flex-1 p-6 sm:p-10">{children}</main>
    </div>
  );
}
