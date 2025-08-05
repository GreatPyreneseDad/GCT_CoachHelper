'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  TrendingUp,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/portal', icon: Home },
  { name: 'Progress', href: '/portal/progress', icon: TrendingUp },
  { name: 'Sessions', href: '/portal/sessions', icon: Calendar },
  { name: 'Assessments', href: '/portal/assessments', icon: MessageSquare },
  { name: 'Resources', href: '/portal/resources', icon: FileText },
  { name: 'Settings', href: '/portal/settings', icon: Settings },
];

// Mock coach branding - in production, fetch from API
const coachBranding = {
  businessName: 'Transform Life Coaching',
  logo: '',
  primaryColor: '#2563eb',
  secondaryColor: '#7c3aed',
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Apply coach branding
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', coachBranding.primaryColor);
    root.style.setProperty('--secondary', coachBranding.secondaryColor);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header 
        className="border-b bg-card"
        style={{ borderTopColor: coachBranding.primaryColor, borderTopWidth: '3px' }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link href="/portal" className="flex items-center gap-3">
                {coachBranding.logo ? (
                  <img 
                    src={coachBranding.logo} 
                    alt={coachBranding.businessName}
                    className="h-8 w-8 rounded"
                  />
                ) : (
                  <div 
                    className="h-8 w-8 rounded flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: coachBranding.primaryColor }}
                  >
                    {coachBranding.businessName.charAt(0)}
                  </div>
                )}
                <span className="hidden md:block font-semibold text-lg">
                  {coachBranding.businessName}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/portal' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">Sarah Mitchell</p>
                  <p className="text-xs text-muted-foreground">Client</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.jpg" />
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t px-4 py-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/portal' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.jpg" />
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">Sarah Mitchell</p>
                <p className="text-xs text-muted-foreground">Client</p>
              </div>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-4">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {coachBranding.businessName}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/portal/help" className="hover:underline">Help</Link>
              <Link href="/portal/privacy" className="hover:underline">Privacy</Link>
              <Link href="/portal/terms" className="hover:underline">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}