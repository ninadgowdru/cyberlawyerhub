import { useState } from "react";
import { Shield, ChevronLeft, ChevronRight, Download, FileText, AlertTriangle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

const INCIDENT_TYPES = [
  "UPI Fraud",
  "Phishing",
  "Banking Fraud",
  "Investment Scam",
  "Aadhaar Fraud",
];

const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "IndusInd Bank",
  "Other",
];

const CYBER_CELLS: Record<string, string> = {
  "Delhi": "011-26885656",
  "Mumbai": "022-22641261",
  "Bangalore": "080-22942264",
  "Chennai": "044-28512527",
  "Hyderabad": "040-27852040",
  "Pune": "020-26122880",
  "Kolkata": "033-22143024",
  "Ahmedabad": "079-25252626",
  "Jaipur": "0141-2741092",
  "Lucknow": "0522-2287253",
};

interface FirData {
  incidentType: string;
  amount: string;
  date: string;
  transactionId: string;
  bankName: string;
  description: string;
  evidenceFile: File | null;
  victimName: string;
  phone: string;
  whatsapp: string;
  state: string;
}

const initialData: FirData = {
  incidentType: "",
  amount: "",
  date: "",
  transactionId: "",
  bankName: "",
  description: "",
  evidenceFile: null,
  victimName: "",
  phone: "",
  whatsapp: "",
  state: "",
};

function getSeverity(amount: number): { level: string; color: string; label: string } {
  if (amount >= 100000) return { level: "high", color: "text-red-400", label: "High Severity" };
  if (amount >= 10000) return { level: "medium", color: "text-yellow-400", label: "Medium Severity" };
  return { level: "low", color: "text-green-400", label: "Low Severity" };
}

function generatePDF(data: FirData) {
  const doc = new jsPDF();
  const amount = parseFloat(data.amount) || 0;
  const severity = getSeverity(amount);

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CYBER CRIME FIR REPORT", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Generated via CyberLawyerHub", 105, 27, { align: "center" });
  doc.setDrawColor(34, 211, 238);
  doc.line(20, 32, 190, 32);

  // Severity
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Severity: ${severity.label}`, 20, 42);

  // Victim Details
  doc.setFontSize(14);
  doc.text("VICTIM DETAILS", 20, 55);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.victimName || "N/A"}`, 20, 63);
  doc.text(`Phone: +91 ${data.phone}`, 20, 70);
  doc.text(`WhatsApp: +91 ${data.whatsapp || data.phone}`, 20, 77);
  doc.text(`State: ${data.state || "N/A"}`, 20, 84);

  // Incident Details
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INCIDENT DETAILS", 20, 97);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Type: ${data.incidentType}`, 20, 105);
  doc.text(`Amount Lost: Rs. ${amount.toLocaleString("en-IN")}`, 20, 112);
  doc.text(`Date of Incident: ${data.date}`, 20, 119);
  doc.text(`Transaction ID: ${data.transactionId || "N/A"}`, 20, 126);
  doc.text(`Bank: ${data.bankName || "N/A"}`, 20, 133);

  // Description
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INCIDENT DESCRIPTION", 20, 146);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const descLines = doc.splitTextToSize(data.description || "No description provided.", 170);
  doc.text(descLines, 20, 154);

  const yAfterDesc = 154 + descLines.length * 6 + 10;

  // Important Contacts
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT CONTACTS & RESOURCES", 20, yAfterDesc);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  let y = yAfterDesc + 8;
  doc.text("1. National Cyber Crime Helpline: 1930", 20, y);
  y += 7;
  doc.text("2. Online Complaint: https://cybercrime.gov.in", 20, y);
  y += 7;
  doc.text("3. RBI Complaint (Banking/UPI): https://cms.rbi.org.in", 20, y);
  y += 7;
  doc.text("4. Your nearest Cyber Crime Cell (see contacts below)", 20, y);
  y += 12;

  // State-wise contacts
  if (y < 240) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("STATE-WISE CYBER CRIME CELL CONTACTS", 20, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    Object.entries(CYBER_CELLS).forEach(([state, phone]) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${state}: ${phone}`, 20, y);
      y += 6;
    });
  }

  // Footer CTA
  y += 10;
  if (y > 270) { doc.addPage(); y = 20; }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Need Expert Legal Help?", 20, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Visit CyberLawyerHub to connect with verified cyber crime lawyers.", 20, y + 7);

  doc.save("CyberLawyerHub_FIR_Report.pdf");
}

const FirReport = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FirData>(initialData);
  const { toast } = useToast();

  const steps = ["Incident Type", "Details", "Evidence", "Contact Info", "Summary"];
  const progress = ((step + 1) / steps.length) * 100;

  const update = (field: keyof FirData, value: string | File | null) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const canNext = (): boolean => {
    switch (step) {
      case 0: return !!data.incidentType;
      case 1: return !!data.amount && !!data.date;
      case 2: return true;
      case 3: return !!data.phone && data.phone.length === 10;
      default: return true;
    }
  };

  const handleDownload = () => {
    generatePDF(data);
    toast({ title: "FIR Report Downloaded!", description: "Your PDF has been saved successfully." });
  };

  const amount = parseFloat(data.amount) || 0;
  const severity = getSeverity(amount);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold gradient-cyber-text">CyberLawyerHub</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="gradient-cyber-text">FIR Report</span> Generator
            </h1>
            <p className="text-muted-foreground">Free for everyone — no signup required</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              {steps.map((s, i) => (
                <span key={s} className={i <= step ? "text-primary font-medium" : ""}>{s}</span>
              ))}
            </div>
            <Progress value={progress} className="h-2 bg-muted" />
          </div>

          {/* Form Card */}
          <div className="glass-card p-6 md:p-8">
            {/* Step 0: Incident Type */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Select Incident Type</h2>
                  <p className="text-sm text-muted-foreground">Choose the category that best describes the cyber fraud.</p>
                </div>
                <div className="space-y-2">
                  <Label>Incident Type *</Label>
                  <Select value={data.incidentType} onValueChange={(v) => update("incidentType", v)}>
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Select type of fraud" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border z-50">
                      {INCIDENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Fraud Details</h2>
                  <p className="text-sm text-muted-foreground">Provide financial and transaction details.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount Lost (₹) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 25000"
                      value={data.amount}
                      onChange={(e) => update("amount", e.target.value)}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Incident *</Label>
                    <Input
                      type="date"
                      value={data.date}
                      onChange={(e) => update("date", e.target.value)}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Transaction ID</Label>
                    <Input
                      placeholder="e.g. TXN123456789"
                      value={data.transactionId}
                      onChange={(e) => update("transactionId", e.target.value)}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Select value={data.bankName} onValueChange={(v) => update("bankName", v)}>
                      <SelectTrigger className="bg-muted/50 border-border/50">
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border z-50">
                        {BANKS.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Describe what happened</Label>
                  <Textarea
                    placeholder="Briefly describe the fraud incident..."
                    value={data.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={4}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                {amount > 0 && (
                  <div className={`flex items-center gap-2 text-sm ${severity.color}`}>
                    <AlertTriangle className="h-4 w-4" />
                    {severity.label} — ₹{amount.toLocaleString("en-IN")} lost
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Evidence */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Upload Evidence</h2>
                  <p className="text-sm text-muted-foreground">Optional — attach a screenshot or document as proof.</p>
                </div>
                <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4 text-sm">
                    {data.evidenceFile ? data.evidenceFile.name : "Drag & drop or click to upload"}
                  </p>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => update("evidenceFile", e.target.files?.[0] || null)}
                    className="max-w-xs mx-auto bg-muted/50 border-border/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: Evidence is not included in the PDF but should be submitted along with your FIR to the police.
                </p>
              </div>
            )}

            {/* Step 3: Contact */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Contact Information</h2>
                  <p className="text-sm text-muted-foreground">For police contact and lawyer callbacks.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Your Full Name</Label>
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      value={data.victimName}
                      onChange={(e) => update("victimName", e.target.value)}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number (+91) *</Label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-muted/50 border border-border/50 rounded-md text-sm text-muted-foreground">+91</span>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        maxLength={10}
                        value={data.phone}
                        onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))}
                        className="bg-muted/50 border-border/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Number (if different)</Label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-muted/50 border border-border/50 rounded-md text-sm text-muted-foreground">+91</span>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        maxLength={10}
                        value={data.whatsapp}
                        onChange={(e) => update("whatsapp", e.target.value.replace(/\D/g, ""))}
                        className="bg-muted/50 border-border/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select value={data.state} onValueChange={(v) => update("state", v)}>
                      <SelectTrigger className="bg-muted/50 border-border/50">
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border z-50">
                        {Object.keys(CYBER_CELLS).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Summary */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Review & Download</h2>
                  <p className="text-sm text-muted-foreground">Verify your details before generating the FIR PDF.</p>
                </div>

                {amount > 0 && (
                  <div className={`glass-card p-4 flex items-center gap-3 ${severity.color}`}>
                    <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">{severity.label}</div>
                      <div className="text-sm text-muted-foreground">Amount lost: ₹{amount.toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  {[
                    ["Incident Type", data.incidentType],
                    ["Amount Lost", `₹${amount.toLocaleString("en-IN")}`],
                    ["Date", data.date],
                    ["Transaction ID", data.transactionId || "N/A"],
                    ["Bank", data.bankName || "N/A"],
                    ["Name", data.victimName || "N/A"],
                    ["Phone", data.phone ? `+91 ${data.phone}` : "N/A"],
                    ["State", data.state || "N/A"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                  {data.description && (
                    <div className="pt-2">
                      <span className="text-muted-foreground text-xs">Description:</span>
                      <p className="mt-1 text-muted-foreground">{data.description}</p>
                    </div>
                  )}
                </div>

                <Button onClick={handleDownload} className="w-full gradient-cyber text-primary-foreground font-semibold py-6 text-lg rounded-xl glow-cyan">
                  <Download className="h-5 w-5 mr-2" />
                  Download FIR PDF — Free
                </Button>

                <div className="glass-card p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">Need expert legal guidance?</p>
                  <Button variant="outline" className="border-secondary/50 text-secondary" asChild>
                    <Link to="/lawyers">
                      <Scale className="h-4 w-4 mr-2" />
                      Find a Cyber Lawyer
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              {step < 4 && (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext()}
                  className="gradient-cyber text-primary-foreground font-semibold"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirReport;
