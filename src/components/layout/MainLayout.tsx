import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  showSidebar?: boolean;
}

export function MainLayout({ children, showFooter = true, showSidebar }: MainLayoutProps) {
  const location = useLocation();
  // Default to showing sidebar if not explicitly disabled, but hide on specific public paths if showSidebar is undefined
  const isPublicPath = ['/', '/auth', '/landing'].includes(location.pathname);
  const shouldShowSidebar = showSidebar !== undefined
    ? showSidebar
    : !isPublicPath;

  if (shouldShowSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <div className="flex min-h-screen flex-col w-full">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="mr-4 hidden md:flex">
              {/* Breadcrumbs or Title could go here */}
            </div>
            <div className="ml-auto w-full flex-1 md:w-auto md:flex-none">
              <Header variant="sidebar" />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
          {showFooter && <Footer />}
        </div>
      </SidebarProvider>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="public" />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}