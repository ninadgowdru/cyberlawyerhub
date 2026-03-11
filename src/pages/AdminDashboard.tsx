import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, CalendarDays, BarChart3, FileText, CheckCircle, XCircle, Shield, IndianRupee } from "lucide-react";

const AdminDashboard = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [firReports, setFirReports] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "admin")) navigate("/");
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (user && userRole === "admin") fetchAllData();
  }, [user, userRole]);

  const fetchAllData = async () => {
    setLoading(true);
    const [profilesRes, lawyersRes, bookingsRes, firRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("lawyers").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("fir_reports").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    setProfiles(profilesRes.data || []);
    setLawyers(lawyersRes.data || []);
    setBookings(bookingsRes.data || []);
    setFirReports(firRes.data || []);
    setRoles(rolesRes.data || []);
    setLoading(false);
  };

  const toggleLawyerVerification = async (lawyerId: string, currentStatus: boolean) => {
    await supabase.from("lawyers").update({ is_verified: !currentStatus }).eq("id", lawyerId);
    toast({ title: `Lawyer ${!currentStatus ? "verified" : "unverified"}` });
    fetchAllData();
  };

  const updateFirStatus = async (firId: string, status: string) => {
    await supabase.from("fir_reports").update({ status }).eq("id", firId);
    toast({ title: `FIR report marked as ${status}` });
    fetchAllData();
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", bookingId);
    toast({ title: `Booking marked as ${status}` });
    fetchAllData();
  };

  const getRoleForUser = (userId: string) => roles.find((r) => r.user_id === userId)?.role || "user";

  const totalRevenue = bookings.filter(b => b.status === "paid" || b.status === "confirmed").reduce((sum, b) => sum + b.total_amount, 0);
  const totalBookings = bookings.length;
  const totalUsers = profiles.length;
  const totalLawyers = lawyers.length;
  const pendingFirs = firReports.filter(f => f.status === "submitted").length;
  const verifiedLawyers = lawyers.filter(l => l.is_verified).length;

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" /> Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage users, lawyers, bookings, and FIR reports.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Users", value: totalUsers, icon: Users },
            { label: "Lawyers", value: totalLawyers, icon: Users },
            { label: "Verified", value: verifiedLawyers, icon: CheckCircle },
            { label: "Cases", value: totalBookings, icon: CalendarDays },
            { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee },
            { label: "Pending FIRs", value: pendingFirs, icon: FileText },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <stat.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> Users</TabsTrigger>
            <TabsTrigger value="bookings"><CalendarDays className="h-4 w-4 mr-1" /> Cases</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1" /> Analytics</TabsTrigger>
            <TabsTrigger value="fir"><FileText className="h-4 w-4 mr-1" /> FIR Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>All Users ({profiles.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                        <TableCell>{p.phone || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleForUser(p.user_id) === "admin" ? "default" : "secondary"}>
                            {getRoleForUser(p.user_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Lawyers ({lawyers.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bar Council ID</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Case Fee</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lawyers.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.bar_council_id}</TableCell>
                        <TableCell>{l.city}</TableCell>
                        <TableCell>₹{l.hourly_rate}</TableCell>
                        <TableCell>{l.rating ?? "—"}</TableCell>
                        <TableCell>
                          {l.is_verified ? (
                            <Badge className="bg-green-500/20 text-green-400">Verified</Badge>
                          ) : (
                            <Badge variant="secondary">Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant={l.is_verified ? "destructive" : "default"} onClick={() => toggleLawyerVerification(l.id, l.is_verified)}>
                            {l.is_verified ? <><XCircle className="h-3 w-3 mr-1" /> Revoke</> : <><CheckCircle className="h-3 w-3 mr-1" /> Verify</>}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader><CardTitle>All Cases ({bookings.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Ref</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono text-xs">{b.id.slice(0, 8)}...</TableCell>
                        <TableCell>₹{b.total_amount}</TableCell>
                        <TableCell className="font-mono text-xs">{b.payment_reference_id || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={b.status === "confirmed" ? "default" : b.status === "cancelled" || b.status === "rejected" ? "destructive" : "secondary"}>
                            {b.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="space-x-1">
                          {(b.status === "pending" || b.status === "pending_verification") && (
                            <>
                              <Button size="sm" variant="default" onClick={() => updateBookingStatus(b.id, "confirmed")}>Confirm</Button>
                              <Button size="sm" variant="destructive" onClick={() => updateBookingStatus(b.id, "cancelled")}>Cancel</Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {bookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No cases yet</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Revenue Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-bold text-lg">₹{totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fees</span>
                    <span className="font-bold">
                      ₹{bookings.filter(b => b.status === "paid" || b.status === "confirmed").reduce((s, b) => s + b.platform_fee, 0).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Platform Stats</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Users</span><span className="font-bold">{totalUsers}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Verified Lawyers</span><span className="font-bold">{verifiedLawyers} / {totalLawyers}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Pending FIRs</span><span className="font-bold">{pendingFirs}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Confirmed Cases</span><span className="font-bold">{bookings.filter(b => b.status === "confirmed").length}</span></div>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader><CardTitle>Cases by Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {["pending_verification", "pending", "confirmed", "rejected", "cancelled"].map((status) => (
                      <div key={status} className="text-center p-4 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold">{bookings.filter(b => b.status === status).length}</p>
                        <p className="text-sm text-muted-foreground capitalize">{status.replace("_", " ")}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fir">
            <Card>
              <CardHeader><CardTitle>FIR Reports ({firReports.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {firReports.map((fir) => (
                      <TableRow key={fir.id}>
                        <TableCell className="font-medium">{fir.incident_type}</TableCell>
                        <TableCell>{fir.fraud_amount ? `₹${fir.fraud_amount.toLocaleString()}` : "—"}</TableCell>
                        <TableCell>
                          <Badge variant={fir.status === "reviewed" ? "default" : fir.status === "rejected" ? "destructive" : "secondary"}>{fir.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(fir.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="space-x-1">
                          {fir.status === "submitted" && (
                            <>
                              <Button size="sm" onClick={() => updateFirStatus(fir.id, "reviewed")}><CheckCircle className="h-3 w-3 mr-1" /> Approve</Button>
                              <Button size="sm" variant="destructive" onClick={() => updateFirStatus(fir.id, "rejected")}><XCircle className="h-3 w-3 mr-1" /> Reject</Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {firReports.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No FIR reports yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
