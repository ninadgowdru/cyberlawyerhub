import { Link } from "react-router-dom";
import { CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const BookingSuccess = () => (
  <div className="min-h-screen bg-background">
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold gradient-cyber-text">CyberLawyerHub</span>
        </Link>
      </div>
    </nav>
    <div className="container mx-auto px-4 pt-32 pb-16 max-w-lg text-center">
      <div className="glass-card p-10">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-6">
          Your consultation has been booked. You'll receive a confirmation email with session details shortly.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link to="/lawyers">Browse More Lawyers</Link>
          </Button>
          <Button asChild className="gradient-cyber text-primary-foreground font-semibold">
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default BookingSuccess;
