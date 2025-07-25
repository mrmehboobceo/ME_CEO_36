'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Book,
  FileText,
  CalendarDays,
  Bell,
  Settings,
  Banknote,
  GraduationCap,
  HeartHandshake
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: Record<string, NavItem[]> = {
  Principal: [
    { href: '/dashboard/principal', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/principal/students', label: 'Students', icon: Users },
    { href: '/dashboard/principal/teachers', label: 'Teachers', icon: UserCheck },
    { href: '/dashboard/principal/attendance', label: 'Attendance', icon: CalendarDays },
    { href: '/dashboard/principal/fees', label: 'Fee Management', icon: Banknote },
    { href: '/dashboard/principal/leaves', label: 'Leave Requests', icon: FileText },
    { href: '/dashboard/principal/notifications', label: 'Notifications', icon: Bell },
  ],
  Teacher: [
    { href: '/dashboard/teacher', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/teacher/attendance', label: 'Mark Attendance', icon: CalendarDays },
    { href: '/dashboard/teacher/leaves', label: 'Student Leaves', icon: FileText },
  ],
  Student: [
    { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/student/attendance', label: 'My Attendance', icon: CalendarDays },
    { href: '/dashboard/student/fees', label: 'My Fees', icon: Banknote },
    { href: '/dashboard/student/leave', label: 'Apply for Leave', icon: FileText },
    { href: '/dashboard/student/notifications', label: 'Notifications', icon: Bell },
  ],
  Parent: [
    { href: '/dashboard/parent', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/parent/attendance', label: 'Child Attendance', icon: CalendarDays },
    { href: '/dashboard/parent/fees', label: "Child's Fees", icon: Banknote },
    { href: '/dashboard/parent/notifications', label: 'Notifications', icon: Bell },
  ],
};

export function SidebarNav({ role }: { role: string }) {
  const pathname = usePathname();
  const items = navItems[role] || [];

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} legacyBehavior passHref>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
