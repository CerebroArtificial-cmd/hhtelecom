import type { Metadata } from "next";
import "../styles/globals.css";
import Image from "next/image";
import { Toaster } from "@/components/ui/toast";
import { ToastProvider as AppToastProvider } from "@/hooks/use-toast";
import InstallAppPrompt from "@/components/InstallAppPrompt";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "HH Telecom | Relat\u00F3rio de Visita Externa",
  description: "Aplicativo interno para coleta de dados de campo - HH Telecom",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#1d4ed8" />
      </head>
      <body suppressHydrationWarning className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col">
        <PwaRegister />
        {/* Header */}
        <header className="bg-white shadow-md py-4 px-8 text-[#6a0e0e] sticky top-0 z-50">
          <div className="container mx-auto flex flex-wrap items-center gap-2 sm:gap-3">
            <Image src="/hhtelecom-logo.png" alt="HH Telecom" width={200} height={60} priority className="h-8 sm:h-[48px] w-auto select-none" />
            <h1 className="font-semibold tracking-wide text-[18px] sm:text-[24px] md:text-[30px] text-[#4d0a0a] leading-tight">| Controle de visitas externas</h1>
          </div>
          <div className="container mx-auto">
            <InstallAppPrompt />
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 container mx-auto px-6 py-10">
          <AppToastProvider>
            {children}
            {/* Toaster global (UI dos toasts) */}
            <Toaster />
          </AppToastProvider>
        </main>

        {/* Rodapé */}
        <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} HH Telecom. Todos os direitos reservados.
        </footer>
      </body>
    </html>
  );
}







