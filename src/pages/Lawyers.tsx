import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Search, MapPin, Star, IndianRupee, Filter, X, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

const CITIES = ["All Cities", "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata"];

interface Lawyer {
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
  profile?: { full_name: string; avatar_url: string | null };
}

const LawyerCard = ({ lawyer }: { lawyer: Lawyer }) => {
  const name = lawyer.profile?.full_name || "Unnamed Lawyer";
  const rating = Number(lawyer.rating) || 0;
  const reviewCount = lawyer.review_count || 0;
  const photoUrl = lawyer.photo_url || lawyer.profile?.avatar_url;

  return (
    <div className="glass-card p-6 flex flex-col h-full hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <Scale className="h-7 w-7 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            {lawyer.is_verified && (
              <Badge variant="outline" className="border-primary/50 text-primary text-[10px] px-1.5 flex-shrink-0">
                Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>{lawyer.city}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      {lawyer.specializations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {lawyer.specializations.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary" className="text-[10px] px-2 py-0.5 bg-secondary/50">
              {spec}
            </Badge>
          ))}
          {lawyer.specializations.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-secondary/50">
              +{lawyer.specializations.length - 3}
            </Badge>
          )}
        </div>
      )}

      {lawyer.bio && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{lawyer.bio}</p>
      )}
      {!lawyer.bio && <div className="flex-1" />}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
        <div className="flex items-center gap-1 text-primary font-semibold">
          <IndianRupee className="h-4 w-4" />
          <span>{lawyer.hourly_rate}</span>
          <span className="text-xs text-muted-foreground font-normal">/hr</span>
        </div>
        <Button size="sm" className="gradient-cyber text-primary-foreground font-semibold" asChild>
          <Link to={`/lawyers/${lawyer.id}`}>Book Now</Link>
        </Button>
      </div>
    </div>
  );
};

const Lawyers = () => {
  const { user, signOut } = useAuth();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [rateRange, setRateRange] = useState([500, 4000]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lawyers")
      .select("*, profile:profiles!lawyers_user_id_fkey(full_name, avatar_url)");

    if (!error && data) {
      setLawyers(data.map((l: any) => ({ ...l, profile: l.profile?.[0] || l.profile })));
    }
    setLoading(false);
  };

  const filtered = lawyers.filter((l) => {
    const name = l.profile?.full_name?.toLowerCase() || "";
    const specs = l.specializations.join(" ").toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = !q || name.includes(q) || specs.includes(q);
    const matchesCity = cityFilter === "All Cities" || l.city === cityFilter;
    const matchesRate = l.hourly_rate >= rateRange[0] && l.hourly_rate <= rateRange[1];
    const matchesRating = (Number(l.rating) || 0) >= minRating;
    return matchesSearch && matchesCity && matchesRate && matchesRating;
  });

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
            <Link to="/lawyers" className="text-foreground font-medium">Find Lawyer</Link>
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
              <Button variant="ghost" size="sm" asChild><Link to="/login">Login</Link></Button>
              <Button size="sm" className="gradient-cyber text-primary-foreground font-semibold" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Find a <span className="gradient-cyber-text">Cyber Lawyer</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Browse verified cyber crime lawyers across India. Filter by city, rate, and specialization.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="border-border/50"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {(minRating > 0 || rateRange[0] > 500 || rateRange[1] < 4000) && (
              <span className="ml-2 w-2 h-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="glass-card p-6 mb-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Advanced Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setRateRange([500, 4000]); setMinRating(0); }}
                className="text-xs text-muted-foreground"
              >
                <X className="h-3 w-3 mr-1" /> Reset
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Rate: ₹{rateRange[0]} — ₹{rateRange[1]}/hr
              </label>
              <Slider
                min={500}
                max={4000}
                step={100}
                value={rateRange}
                onValueChange={setRateRange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Minimum Rating: {minRating > 0 ? `${minRating}+` : "Any"}
              </label>
              <div className="flex gap-2">
                {[0, 3, 3.5, 4, 4.5].map((r) => (
                  <Button
                    key={r}
                    variant={minRating === r ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMinRating(r)}
                    className={minRating === r ? "gradient-cyber text-primary-foreground" : "border-border/50"}
                  >
                    {r === 0 ? "Any" : `${r}+`}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card p-6 h-64 animate-pulse">
                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No lawyers found</h3>
            <p className="text-muted-foreground text-sm">
              {lawyers.length === 0
                ? "No lawyers have registered yet. Check back soon!"
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} lawyer{filtered.length !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((lawyer) => (
                <LawyerCard key={lawyer.id} lawyer={lawyer} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Lawyers;
