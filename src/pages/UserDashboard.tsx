import { useEffect, useState } from "react";
import { FileText, CalendarDays, IndianRupee, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { format } from "date-fns";

interface Booking {
  id: string;
  duration_minutes: number;
  total_amount: number;
  status: string;
  created_at: string;
  start_time: string | null;
  lawyers: {
    id: string;
    city: string;
    hourly_rate: number;
    profiles: {
      full_name: string;
    };
  };
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  confirmed: "bg-primary/20 text-primary border-primary/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, lawyers(id, city, hourly_rate, profiles:profiles!lawyers_user_id_profiles_fkey(full_name))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setBookings((data as unknown as Booking[]) ?? []);
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  const totalSpent = bookings.filter(b => b.status === "paid" || b.status === "confirmed").reduce((s, b) => s + b.total_amount, 0);
  const upcomingCount = bookings.filter(b => b.status === "confirmed" || b.status === "paid").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your activity summary.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Bookings", value: bookings.length, icon: CalendarDays },
            { label: "Upcoming", value: upcomingCount, icon: Clock },
            { label: "Total Spent", value: `₹${(totalSpent / 100).toLocaleString("en-IN")}`, icon: IndianRupee },
            { label: "FIRs Generated", value: "—", icon: FileText },
          ].map((stat) => (
            <Card key={stat.label} className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button className="gradient-cyber text-primary-foreground font-semibold" asChild>
            <Link to="/fir-report"><FileText className="h-4 w-4 mr-2" /> New FIR Report</Link>
          </Button>
          <Button variant="outline" className="border-border/50" asChild>
            <Link to="/lawyers">Find a Lawyer <ChevronRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>

        {/* Recent Bookings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No bookings yet.</p>
                <Button variant="link" className="text-primary mt-2" asChild>
                  <Link to="/lawyers">Browse lawyers to book a consultation</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {b.lawyers?.profiles?.full_name ?? "Lawyer"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.duration_minutes} min • {b.lawyers?.city} • {format(new Date(b.created_at), "dd MMM yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">₹{(b.total_amount / 100).toLocaleString("en-IN")}</span>
                      <Badge variant="outline" className={statusColor[b.status] ?? ""}>{b.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
