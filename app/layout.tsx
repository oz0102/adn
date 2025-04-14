// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import AuthProvider from "@/components/session-provider";
import { SessionProvider } from "@/components/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ADN Global",
  description: "ADN Global Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}



// // app/(dashboard)/layout.tsx
// "use client"

// import { Sidebar } from "@/components/dashboard/sidebar"
// import { Header } from "@/components/dashboard/header"
// import { SessionProvider } from "@/components/session-provider"
// import { ThemeProvider } from "@/components/theme-provider"
// import { Toaster } from "@/components/ui/toaster"

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body>
//         <SessionProvider>
//           <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
//             <div className="flex h-screen overflow-hidden">
//               <Sidebar />
//               <div className="flex flex-col flex-1 w-0 overflow-hidden">
//                 <Header />
//                 <main className="relative flex-1 overflow-y-auto focus:outline-none p-6">
//                   {children}
//                 </main>
//               </div>
//             </div>
//             <Toaster />
//           </ThemeProvider>
//         </SessionProvider>
//       </body>
//     </html>
//   )
// }