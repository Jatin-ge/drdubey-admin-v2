"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  MapPin,
  Youtube,
  Image as ImageIcon,
  Trophy,
  Wrench,
  FileText,
  Bell,
  Receipt,
  Ticket,
  LogOut,
} from "lucide-react";
import { toast } from "react-hot-toast";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    toast.success("Logged out successfully");
    router.push("/");
  };

  const routes = [
    {
      href: `/admin`,
      label: "Overview",
      icon: <LayoutDashboard className="h-4 w-4" />,
      active: pathname === `/admin`,
    },
    {
      href: `/admin/patients`,
      label: "Patients",
      icon: <Users className="h-4 w-4" />,
      active: pathname === `/admin/patients`,
    },
    {
      href: `/admin/appointment`,
      label: "Appointments",
      icon: <Calendar className="h-4 w-4" />,
      active: pathname === `/admin/appointment`,
    },
    {
      href: `/admin/calendar`,
      label: "Calendar",
      icon: <CalendarDays className="h-4 w-4" />,
      active: pathname === `/admin/calendar`,
    },
    {
      href: `/admin/tokens`,
      label: "OPD Tokens",
      icon: <Ticket className="h-4 w-4" />,
      active: pathname === `/admin/tokens`,
    },
    {
      href: `/admin/followups`,
      label: "Follow-Ups",
      icon: <Bell className="h-4 w-4" />,
      active: pathname === `/admin/followups`,
    },
    {
      href: `/admin/billing`,
      label: "Billing",
      icon: <Receipt className="h-4 w-4" />,
      active: pathname === `/admin/billing`,
    },
    {
      href: `/admin/closeddate/jaipur`,
      label: "Jaipur",
      icon: <MapPin className="h-4 w-4" />,
      active: pathname === `/admin/closeddate/jaipur`,
    },
    {
      href: `/admin/youtube`,
      label: "Youtube",
      icon: <Youtube className="h-4 w-4" />,
      active: pathname === `/admin/youtube`,
    },
    {
      href: `/admin/manage_image`,
      label: "Gallery",
      icon: <ImageIcon className="h-4 w-4" />,
      active: pathname === `/admin/manage_image`,
    },
    {
      href: `/admin/achievements`,
      label: "Achievements",
      icon: <Trophy className="h-4 w-4" />,
      active: pathname === `/admin/achievements`,
    },
    {
      href: `/admin/services`,
      label: "Services",
      icon: <Wrench className="h-4 w-4" />,
      active: pathname === `/admin/services`,
    },
    {
      href: `/admin/blogs`,
      label: "Blogs",
      icon: <FileText className="h-4 w-4" />,
      active: pathname === `/admin/blogs`,
    },
    {
      href: `/admin/events`,
      label: "Events",
      icon: <Calendar className="h-4 w-4" />,
      active: pathname === `/admin/events`,
    },
  ];

  return (
    <nav
      className={cn(
        "flex items-center space-x-4 lg:space-x-6 bg-white p-2 rounded-lg",
        className
      )}
      {...props}
    >
      <div className="flex-1 flex items-center space-x-1 lg:space-x-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-gray-100",
              route.active
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {route.icon}
            <span>{route.label}</span>
          </Link>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all hover:bg-red-100 text-red-600 ml-auto"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </button>
    </nav>
  );
}
