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
  total_amount: number;
  status: string;
  created_at: string;
  case_description: string | null;
  payment_reference_id: string | null;
  lawyers: {
    id: string;
    city: string;
    hourly_rate: number;
    profiles: { full_name: string };
  };
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  pending_verification: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  confirmed: "bg-primary/20 text-primary border-primary/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  rejected: "bg-destructive/20 text-destructive border-destructive/30",
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
  const pendingCount = bookings.filter(b => b.status === "pending_verification").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your activity summary.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Cases", value: bookings.length, icon: CalendarDays },
            { label: "Pending", value: pendingCount, icon: Clock },
            { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, icon: IndianRupee },
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

        <div className="flex flex-wrap gap-3">
          <Button className="gradient-cyber text-primary-foreground font-semibold" asChild>
            <Link to="/fir-report"><FileText className="h-4 w-4 mr-2" /> New FIR Report</Link>
          </Button>
          <Button variant="outline" className="border-border/50" asChild>
            <Link to="/lawyers">Find a Lawyer <ChevronRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Recent Cases</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No bookings yet.</p>
                <Button variant="link" className="text-primary mt-2" asChild>
                  <Link to="/lawyers">Browse lawyers to book a case</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {(b.lawyers as any)?.profiles?.full_name ?? "Lawyer"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(b.lawyers as any)?.city} • {format(new Date(b.created_at), "dd MMM yyyy")}
                      </p>
                      {b.case_description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{b.case_description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">₹{b.total_amount.toLocaleString("en-IN")}</span>
                      <Badge variant="outline" className={statusColor[b.status] ?? ""}>{b.status.replace("_", " ")}</Badge>
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
