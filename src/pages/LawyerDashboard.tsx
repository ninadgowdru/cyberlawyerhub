import { useEffect, useState } from "react";
import { CalendarDays, IndianRupee, Users, Clock, Plus, Trash2, CheckCircle, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { Label } from "@/components/ui/label";

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
  payment_reference_id: string | null;
  case_description: string | null;
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
  pending_verification: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  confirmed: "bg-primary/20 text-primary border-primary/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  rejected: "bg-destructive/20 text-destructive border-destructive/30",
};

const LawyerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [lawyerId, setLawyerId] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("10:00");
  const [newEnd, setNewEnd] = useState("10:30");

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
      const { data: lawyer } = await supabase
        .from("lawyers")
        .select("id, upi_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!lawyer) { setLoading(false); return; }
      setLawyerId(lawyer.id);
      setUpiId((lawyer as any).upi_id || "");

      const [bookingsRes, slotsRes] = await Promise.all([
        supabase.from("bookings").select("*").eq("lawyer_id", lawyer.id).order("created_at", { ascending: false }),
        supabase.from("lawyer_availability").select("*").eq("lawyer_id", lawyer.id).gte("date", new Date().toISOString().split("T")[0]).order("date", { ascending: true }),
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

  const pendingVerifications = bookings.filter((b) => b.status === "pending_verification");

  const verifyPayment = async (bookingId: string, approve: boolean) => {
    const newStatus = approve ? "confirmed" : "rejected";
    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", bookingId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: approve ? "Payment verified & booking confirmed" : "Booking rejected" });
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: newStatus } : b));
    }
  };

  const updateUpiId = async () => {
    if (!lawyerId) return;
    const { error } = await supabase.from("lawyers").update({ upi_id: upiId }).eq("id", lawyerId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "UPI ID updated" });
    }
  };

  const addSlot = async () => {
    if (!lawyerId || !newDate || !newStart || !newEnd) return;
    const { error } = await supabase.from("lawyer_availability").insert({
      lawyer_id: lawyerId, date: newDate, start_time: newStart, end_time: newEnd,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Slot added" });
      const { data } = await supabase.from("lawyer_availability").select("*").eq("lawyer_id", lawyerId).gte("date", new Date().toISOString().split("T")[0]).order("date", { ascending: true });
      setSlots((data as Slot[]) ?? []);
    }
  };

  const removeSlot = async (slotId: string) => {
    await supabase.from("lawyer_availability").delete().eq("id", slotId);
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    toast({ title: "Slot removed" });
  };

  if (loading) {
    return <DashboardLayout><p className="text-muted-foreground p-8">Loading dashboard...</p></DashboardLayout>;
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

        {/* Stats */}
        {(subPage === "overview" || subPage === "earnings") && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Cases", value: bookings.length, icon: CalendarDays },
              { label: "Pending Verification", value: pendingVerifications.length, icon: Clock },
              { label: "This Month", value: `₹${thisMonthEarnings.toLocaleString("en-IN")}`, icon: IndianRupee },
              { label: "Total Earnings", value: `₹${totalEarnings.toLocaleString("en-IN")}`, icon: IndianRupee },
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

        {/* UPI Settings */}
        {subPage === "overview" && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Payment Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="upiId" className="text-sm text-muted-foreground">UPI ID</Label>
                  <Input id="upiId" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="bg-muted/50" />
                </div>
                <Button onClick={updateUpiId} className="gradient-cyber text-primary-foreground font-semibold">Save UPI ID</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Clients will see a QR code generated from this UPI ID for payments.</p>
            </CardContent>
          </Card>
        )}

        {/* Pending Payment Verifications */}
        {(subPage === "overview" || subPage === "bookings") && pendingVerifications.length > 0 && (
          <Card className="glass-card border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-lg text-orange-400 flex items-center gap-2">
                <Clock className="h-5 w-5" /> Pending Payment Verifications ({pendingVerifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingVerifications.map((b) => (
                <div key={b.id} className="p-4 rounded-lg bg-muted/30 border border-border/30 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">Case Booking</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(b.created_at), "dd MMM yyyy, hh:mm a")}</p>
                    </div>
                    <span className="text-sm font-semibold">₹{b.base_amount.toLocaleString("en-IN")}</span>
                  </div>
                  {b.case_description && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Case: </span>
                      <span>{b.case_description}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Payment Ref: </span>
                    <span className="font-mono font-medium text-foreground">{b.payment_reference_id || "N/A"}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={() => verifyPayment(b.id, true)} className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" /> Verify & Confirm
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => verifyPayment(b.id, false)}>
                      <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* All Bookings */}
        {(subPage === "overview" || subPage === "bookings") && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">{subPage === "overview" ? "Recent Cases" : "All Cases"}</CardTitle>
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
                        <p className="text-sm font-medium">Case Booking</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(b.created_at), "dd MMM yyyy, hh:mm a")}</p>
                        {b.payment_reference_id && (
                          <p className="text-xs text-muted-foreground">Ref: {b.payment_reference_id}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">₹{b.base_amount.toLocaleString("en-IN")}</span>
                        <Badge variant="outline" className={statusColor[b.status] ?? ""}>{b.status.replace("_", " ")}</Badge>
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
              <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5" /> Manage Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-xs text-muted-foreground">Date</label>
                  <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-40 bg-muted/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Start</label>
                  <Input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="w-32 bg-muted/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">End</label>
                  <Input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="w-32 bg-muted/50" />
                </div>
                <Button onClick={addSlot} className="gradient-cyber text-primary-foreground font-semibold">
                  <Plus className="h-4 w-4 mr-1" /> Add Slot
                </Button>
              </div>
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No upcoming availability slots.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {slots.map((slot) => (
                    <div key={slot.id} className={`flex items-center justify-between p-3 rounded-lg border ${slot.is_booked ? "border-primary/30 bg-primary/5" : "border-border/30 bg-muted/30"}`}>
                      <div>
                        <p className="text-sm font-medium">{format(new Date(slot.date), "dd MMM yyyy")}</p>
                        <p className="text-xs text-muted-foreground">{slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}</p>
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
