import { Shield, FileText, Scale, Phone, ChevronRight, Users, Award, Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, signOut } = useAuth();

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
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" className="gradient-cyber text-primary-foreground font-semibold" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            India's #1 Cyber Fraud Legal Platform
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            Cyber Fraud?{" "}
            <span className="gradient-cyber-text">Get FIR + Lawyer</span>
            <br />
            in 5 Minutes
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Generate your FIR report for free — no signup needed. Or connect with verified cyber crime lawyers across India for expert consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gradient-cyber text-primary-foreground font-semibold text-lg px-8 py-6 rounded-xl glow-cyan" asChild>
              <Link to="/fir-report">
                <FileText className="h-5 w-5 mr-2" />
                Generate FIR Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-border/50 hover:bg-muted/50" asChild>
              <Link to="/lawyers">
                <Scale className="h-5 w-5 mr-2" />
                Find a Lawyer
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10K+", label: "FIRs Generated", icon: FileText },
              { value: "250+", label: "Verified Lawyers", icon: Users },
              { value: "4.8★", label: "Average Rating", icon: Award },
              { value: "5 min", label: "Average Response", icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <stat.icon className="h-6 w-6 text-primary mb-2" />
                <span className="text-2xl md:text-3xl font-bold gradient-cyber-text">{stat.value}</span>
                <span className="text-sm text-muted-foreground mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How It <span className="gradient-cyber-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Two simple paths to fight cyber fraud — both designed for speed and trust.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FIR Path */}
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-cyber flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Free FIR Report</h3>
              </div>
              <div className="space-y-4">
                {["Select incident type", "Enter fraud details & amount", "Upload evidence (optional)", "Download FIR PDF instantly"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground text-sm">{step}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full gradient-cyber text-primary-foreground font-semibold" asChild>
                <Link to="/fir-report">
                  Start Free FIR <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Lawyer Path */}
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Scale className="h-5 w-5 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Lawyer Consultation</h3>
              </div>
              <div className="space-y-4">
                {["Browse verified cyber lawyers", "Pick time slot & duration", "Pay securely via Stripe", "Get expert legal guidance"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-secondary/20 text-secondary text-sm font-semibold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground text-sm">{step}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full border-secondary/50 text-secondary hover:bg-secondary/10" asChild>
                <Link to="/lawyers">
                  Find Lawyer <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Helpline Section */}
      <section className="py-16 px-4 border-t border-border/30">
        <div className="container mx-auto">
          <div className="glass-card p-8 md:p-12 text-center max-w-3xl mx-auto">
            <Phone className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Emergency <span className="gradient-cyber-text">Helplines</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              If you're a victim of cyber fraud, act fast. Contact these official resources immediately.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">1930</div>
                <div className="text-sm text-muted-foreground">National Cyber Crime Helpline</div>
              </div>
              <div className="space-y-2">
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-secondary hover:underline">
                  cybercrime.gov.in
                </a>
                <div className="text-sm text-muted-foreground">Official Complaint Portal</div>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-foreground">RBI Complaint</div>
                <div className="text-sm text-muted-foreground">For banking & UPI fraud</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">CyberLawyerHub</span>
          </div>
          <p>© 2026 CyberLawyerHub. Helping India fight cyber fraud.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
