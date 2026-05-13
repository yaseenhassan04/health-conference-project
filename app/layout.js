// app/layout.js
import { Tajawal } from "next/font/google";
import "./globals.css";
import ClientNavbar from "@/components/ClientNavbar";
import { LangProvider } from "@/context/LangContext";  // << أضف هذا
const tajawal = Tajawal({ 
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"]
});

export const metadata = {
  title: "صمود واستدامة | منصة المؤتمر العلمي لطب الباطنة",
  description: "المؤتمر العلمي الأول لطب الباطنة - مجمع ناصر الطبي، غزة. صمود واستدامة.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <body className={tajawal.className}>
        <LangProvider>          {/* << غلّف كل شي */}
          <ClientNavbar />
          <main style={{ padding: 0, margin: 0, width: '100%' }}>
            {children}
          </main>
        </LangProvider>
      </body>
    </html>
  );
}