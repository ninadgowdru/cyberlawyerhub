import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, MapPin, Star, IndianRupee, Scale, ArrowLeft, Briefcase, CheckCircle, LogOut, Loader2, QrCode, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LawyerData {
  id: string;
  user_id: string;
  bar_council_id: string;
  photo_url: string | null;
  hourly_rate: number;
  city: string;
  specializations: string[];
  bio: string | null;
  experience_years: number | null;
  rating: number | null;
  review_count: number | null;
  is_verified: boolean | null;
  upi_id: string | null;
  profile?: { full_name: string; avatar_url: string | null };
}

const LawyerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [lawyer, setLawyer] = useState<LawyerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  useEffect(() => {
    if (id) fetchLawyer();
  }, [id]);

  const fetchLawyer = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lawyers")
      .select("*, profile:profiles!lawyers_user_id_profiles_fkey(full_name, avatar_url)")
      .eq("id", id!)
      .maybeSingle();

    if (!error && data) {
      const profile = Array.isArray(data.profile) ? data.profile[0] : data.profile;
      setLawyer({ ...data, profile } as LawyerData);
    }
    setLoading(false);
  };

  const handleBookCase = async () => {
    if (!user || !lawyer) return;
    if (!referenceId.trim()) {
      toast({ title: "Please enter payment reference ID", variant: "destructive" });
      return;
    }
    if (!caseDescription.trim()) {
      toast({ title: "Please describe your case", variant: "destructive" });
      return;
    }

    setBookingLoading(true);
    try {
      const baseAmount = lawyer.hourly_rate;
      const platformFee = Math.round(baseAmount * 0.25);
      const totalAmount = baseAmount + platformFee;

      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        lawyer_id: lawyer.id,
        duration_minutes: 0,
        base_amount: baseAmount,
        platform_fee: platformFee,
        total_amount: totalAmount,
        currency: "inr",
        status: "pending_verification",
        payment_reference_id: referenceId.trim(),
        case_description: caseDescription.trim(),
      });

      if (error) throw error;
      setBookingSubmitted(true);
      toast({ title: "Booking submitted!", description: "The lawyer will verify your payment." });
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Scale className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lawyer not found</h2>
          <p className="text-muted-foreground mb-6">This profile may have been removed.</p>
          <Button asChild><Link to="/lawyers">Browse Lawyers</Link></Button>
        </div>
      </div>
    );
  }

  const name = lawyer.profile?.full_name || "Unnamed Lawyer";
  const rating = Number(lawyer.rating) || 0;
  const reviewCount = lawyer.review_count || 0;
  const photoUrl = lawyer.photo_url || lawyer.profile?.avatar_url;
  const experience = lawyer.experience_years || 0;
  const baseAmount = lawyer.hourly_rate;
  const platformFee = Math.round(baseAmount * 0.25);
  const totalAmount = baseAmount + platformFee;
  const upiId = lawyer.upi_id || "lawyer@upi";

  // Generate UPI QR URL
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalAmount}&cu=INR`)}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold gradient-cyber-text">CyberLawyerHub</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/fir-report" className="hover:text-foreground transition-colors">FIR Report</Link>
            <Link to="/lawyers" className="hover:text-foreground transition-colors">Find Lawyer</Link>
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-1" /> Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild><Link to="/login">Login</Link></Button>
              <Button size="sm" className="gradient-cyber text-primary-foreground font-semibold" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <Link to="/lawyers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to directory
        </Link>

        {/* Profile Header */}
        <div className="glass-card p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
              {photoUrl ? (
                <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <Scale className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{name}</h1>
                {lawyer.is_verified && <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{lawyer.city}</span>
                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{experience} yrs exp</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(rating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                  ))}
                  <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed">{lawyer.bio || "This lawyer has not added a bio yet."}</p>
            </div>
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-3">Specializations</h2>
              {lawyer.specializations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {lawyer.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary" className="px-3 py-1 bg-secondary/50">{spec}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No specializations listed.</p>
              )}
            </div>
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-3">Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Bar Council ID</span><p className="font-medium mt-0.5">{lawyer.bar_council_id}</p></div>
                <div><span className="text-muted-foreground">Experience</span><p className="font-medium mt-0.5">{experience} years</p></div>
                <div><span className="text-muted-foreground">City</span><p className="font-medium mt-0.5">{lawyer.city}</p></div>
                <div><span className="text-muted-foreground">Verification</span><p className="font-medium mt-0.5">{lawyer.is_verified ? "Verified ✓" : "Pending"}</p></div>
              </div>
            </div>
          </div>

          {/* Right column — Booking card */}
          <div className="space-y-6">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Book Full Case</h2>

              {bookingSubmitted ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
                  <p className="font-semibold mb-1">Booking Submitted!</p>
                  <p className="text-sm text-muted-foreground">The lawyer will verify your payment and confirm the booking.</p>
                  <Button variant="outline" className="mt-4" onClick={() => { setBookingSubmitted(false); setReferenceId(""); setCaseDescription(""); }}>
                    Book Another Case
                  </Button>
                </div>
              ) : (
                <>
                  {/* Price breakdown */}
                  <div className="text-sm space-y-1 mb-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Case Fee</span>
                      <span>₹{baseAmount}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Platform fee (25%)</span>
                      <span>₹{platformFee}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold text-foreground">
                      <span>Total</span>
                      <span>₹{totalAmount}</span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Scan to pay via UPI</p>
                    <div className="inline-block p-3 bg-white rounded-xl">
                      <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">UPI ID: <span className="font-mono font-medium text-foreground">{upiId}</span></p>
                  </div>

                  {/* Case description */}
                  <div className="space-y-2 mb-3">
                    <Label htmlFor="caseDesc">Describe Your Case</Label>
                    <Textarea
                      id="caseDesc"
                      placeholder="Brief description of your legal issue..."
                      value={caseDescription}
                      onChange={(e) => setCaseDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Reference ID */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="refId">Payment Reference ID</Label>
                    <Input
                      id="refId"
                      placeholder="Enter UPI transaction reference ID"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Enter the transaction ID after completing payment</p>
                  </div>

                  <Button
                    className="w-full gradient-cyber text-primary-foreground font-semibold"
                    size="lg"
                    disabled={!user || bookingLoading}
                    onClick={handleBookCase}
                  >
                    {bookingLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
                    ) : (
                      "Submit Booking"
                    )}
                  </Button>
                  {!user && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      <Link to="/login" className="text-primary hover:underline">Log in</Link> to book a case.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="glass-card p-8 mb-6">
        <div className="flex gap-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  </div>
);

export default LawyerProfile;
