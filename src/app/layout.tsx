import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Dashboard",
  description: "Bun + Next.js Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <Sidebar />
          <div className="ml-16 transition-[margin] group-hover:ml-56">
            <TopBar />
            <main className="p-4 md:p-6">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
