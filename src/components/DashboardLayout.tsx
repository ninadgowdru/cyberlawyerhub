import { ReactNode } from "react";
import { Shield, LogOut, FileText, Scale, CalendarDays, LayoutDashboard, IndianRupee, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

const userLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/bookings", label: "My Bookings", icon: CalendarDays },
  { to: "/fir-report", label: "New FIR Report", icon: FileText },
  { to: "/lawyers", label: "Find Lawyer", icon: Scale },
];

const lawyerLinks = [
  { to: "/lawyer/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/lawyer/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/lawyer/dashboard/availability", label: "Availability", icon: Clock },
  { to: "/lawyer/dashboard/earnings", label: "Earnings", icon: IndianRupee },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  const links = userRole === "lawyer" ? lawyerLinks : userLinks;

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold gradient-cyber-text">CyberLawyerHub</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-60 fixed top-16 left-0 bottom-0 flex-col border-r border-border/50 bg-card/30 backdrop-blur-md p-4 gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                location.pathname === link.to
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </aside>

        {/* Mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card border-t border-border/50 flex justify-around py-2">
          {links.slice(0, 4).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors",
                location.pathname === link.to ? "text-primary" : "text-muted-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label.split(" ").pop()}
            </Link>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 md:ml-60 p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
