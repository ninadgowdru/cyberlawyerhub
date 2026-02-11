import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, Eye, EyeOff, Phone, User, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CITIES = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata"];
const SPECIALIZATIONS = ["UPI Fraud", "Phishing", "Banking Fraud", "Investment Scam", "Aadhaar Fraud", "Identity Theft", "Ransomware"];

const Signup = () => {
  const [mode, setMode] = useState<"user" | "lawyer">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lawyer-specific
  const [barCouncilId, setBarCouncilId] = useState("");
  const [city, setCity] = useState("Delhi");
  const [hourlyRate, setHourlyRate] = useState("1500");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "lawyer" && !barCouncilId) {
      toast({ title: "Bar Council ID is required", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });

    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setLoading(false);
      toast({ title: "Please check your email to confirm your account." });
      navigate("/login");
      return;
    }

    // Update profile with phone
    if (phone) {
      await supabase.from("profiles").update({ phone, full_name: fullName }).eq("user_id", userId);
    }

    // Insert role
    await supabase.from("user_roles").insert({ user_id: userId, role: mode });

    // If lawyer, create lawyer profile
    if (mode === "lawyer") {
      await supabase.from("lawyers").insert({
        user_id: userId,
        bar_council_id: barCouncilId,
        city,
        hourly_rate: parseInt(hourlyRate),
        specializations: selectedSpecs,
      });
    }

    setLoading(false);
    toast({ title: "Account created!", description: "Please check your email to verify your account." });
    navigate("/login");
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast({ title: "Google signup failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold gradient-cyber-text">CyberLawyerHub</span>
        </Link>

        <div className="glass-card p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-muted-foreground text-sm mt-1">Join CyberLawyerHub today</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-lg border border-border/50 overflow-hidden">
            <button
              type="button"
              className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                mode === "user" ? "gradient-cyber text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setMode("user")}
            >
              <User className="h-4 w-4" /> User
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                mode === "lawyer" ? "gradient-cyber text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setMode("lawyer")}
            >
              <Briefcase className="h-4 w-4" /> Lawyer
            </button>
          </div>

          {mode === "user" && (
            <Button variant="outline" className="w-full border-border/50" onClick={handleGoogleSignup}>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>
          )}

          {mode === "user" && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (+91)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Lawyer-specific fields */}
            {mode === "lawyer" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="barCouncilId">Bar Council ID</Label>
                  <Input
                    id="barCouncilId"
                    placeholder="e.g. D/1234/2020"
                    value={barCouncilId}
                    onChange={(e) => setBarCouncilId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min={500}
                    max={4000}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpec(spec)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          selectedSpecs.includes(spec)
                            ? "bg-primary/20 border-primary text-primary"
                            : "border-border/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full gradient-cyber text-primary-foreground font-semibold" disabled={loading}>
              {loading ? "Creating account..." : `Sign Up as ${mode === "lawyer" ? "Lawyer" : "User"}`}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
