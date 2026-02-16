import { useEffect, useState } from "react";
import { CalendarDays, IndianRupee, Users, Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

interface Booking {
  id: string;
  duration_minutes: number;
  total_amount: number;
  base_amount: number;
  platform_fee: number;
  status: string;
  created_at: string;
  start_time: string | null;
  user_id: string;
}

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  confirmed: "bg-primary/20 text-primary border-primary/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

const LawyerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [lawyerId, setLawyerId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("10:00");
  const [newEnd, setNewEnd] = useState("10:30");

  // Determine which sub-page to show
  const subPage = location.pathname.includes("/bookings")
    ? "bookings"
    : location.pathname.includes("/availability")
    ? "availability"
    : location.pathname.includes("/earnings")
    ? "earnings"
    : "overview";

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Get lawyer id
      const { data: lawyer } = await supabase
        .from("lawyers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!lawyer) { setLoading(false); return; }
      setLawyerId(lawyer.id);

      // Fetch bookings and slots in parallel
      const [bookingsRes, slotsRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("*")
          .eq("lawyer_id", lawyer.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("lawyer_availability")
          .select("*")
          .eq("lawyer_id", lawyer.id)
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true }),
      ]);
      setBookings((bookingsRes.data as Booking[]) ?? []);
      setSlots((slotsRes.data as Slot[]) ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  const totalEarnings = bookings
    .filter((b) => b.status === "paid" || b.status === "confirmed")
    .reduce((s, b) => s + b.base_amount, 0);

  const thisMonthEarnings = bookings
    .filter((b) => {
      const d = new Date(b.created_at);
      const now = new Date();
      return (b.status === "paid" || b.status === "confirmed") && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, b) => s + b.base_amount, 0);

  const addSlot = async () => {
    if (!lawyerId || !newDate || !newStart || !newEnd) return;
    const { error } = await supabase.from("lawyer_availability").insert({
      lawyer_id: lawyerId,
      date: newDate,
      start_time: newStart,
      end_time: newEnd,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Slot added" });
      // Refresh slots
      const { data } = await supabase
        .from("lawyer_availability")
        .select("*")
        .eq("lawyer_id", lawyerId)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true });
      setSlots((data as Slot[]) ?? []);
    }
  };

  const removeSlot = async (slotId: string) => {
    await supabase.from("lawyer_availability").delete().eq("id", slotId);
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    toast({ title: "Slot removed" });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground p-8">Loading dashboard...</p>
      </DashboardLayout>
    );
  }

  if (!lawyerId) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">No lawyer profile found. Please complete your lawyer signup first.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Lawyer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your practice from one place.</p>
        </div>

        {/* Stats (always visible) */}
        {(subPage === "overview" || subPage === "earnings") && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Bookings", value: bookings.length, icon: CalendarDays },
              { label: "Clients", value: new Set(bookings.map((b) => b.user_id)).size, icon: Users },
              { label: "This Month", value: `₹${(thisMonthEarnings / 100).toLocaleString("en-IN")}`, icon: IndianRupee },
              { label: "Total Earnings", value: `₹${(totalEarnings / 100).toLocaleString("en-IN")}`, icon: IndianRupee },
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
        )}

        {/* Bookings Section */}
        {(subPage === "overview" || subPage === "bookings") && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">
                {subPage === "overview" ? "Recent Bookings" : "All Bookings"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No bookings yet. Share your profile to get clients!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(subPage === "overview" ? bookings.slice(0, 5) : bookings).map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div>
                        <p className="text-sm font-medium">{b.duration_minutes} min consultation</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(b.created_at), "dd MMM yyyy, hh:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">₹{(b.base_amount / 100).toLocaleString("en-IN")}</span>
                        <Badge variant="outline" className={statusColor[b.status] ?? ""}>{b.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Availability Section */}
        {(subPage === "overview" || subPage === "availability") && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" /> Manage Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add slot form */}
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-xs text-muted-foreground">Date</label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-40 bg-muted/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Start</label>
                  <Input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-32 bg-muted/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">End</label>
                  <Input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-32 bg-muted/50"
                  />
                </div>
                <Button onClick={addSlot} className="gradient-cyber text-primary-foreground font-semibold">
                  <Plus className="h-4 w-4 mr-1" /> Add Slot
                </Button>
              </div>

              {/* Slot list */}
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No upcoming availability slots. Add some above!</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        slot.is_booked ? "border-primary/30 bg-primary/5" : "border-border/30 bg-muted/30"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{format(new Date(slot.date), "dd MMM yyyy")}</p>
                        <p className="text-xs text-muted-foreground">
                          {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                        </p>
                      </div>
                      {slot.is_booked ? (
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">Booked</Badge>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => removeSlot(slot.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LawyerDashboard;
