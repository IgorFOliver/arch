import { ReactNode } from 'react';
import { Sidebar, SidebarProps } from '../../organisms/Sidebar/Sidebar';
import { Topbar, TopbarProps } from '../../organisms/Topbar/Topbar';

export interface AdminLayoutProps {
  sidebarProps: SidebarProps;
  topbarProps: TopbarProps;
  children: ReactNode;
}

export function AdminLayout({
  sidebarProps,
  topbarProps,
  children,
}: AdminLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <Sidebar {...sidebarProps} />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-[#120623] to-[#1b0a33]" />

        <div className="relative z-10">
          <Topbar variant="dark" {...topbarProps} />
        </div>

        <main className="relative z-10 -mt-2 m-4 flex-1 overflow-y-auto rounded-t-2xl bg-white p-6 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.15)]">
          {children}
        </main>
      </div>
    </div>
  );
}
