export type ScamType = 'banking' | 'prize' | 'government' | 'employment';

interface ScamTemplate {
  type: ScamType;
  messages: string[];
}

const bankingScams: string[] = [
  "Dear Customer, Your SBI account has been blocked due to incomplete KYC. Update immediately at http://sbi-kyc-update.xyz or your account will be permanently deactivated. Call 9876543210 for assistance.",
  "ALERT: Suspicious activity detected on your HDFC account. Verify your identity now to prevent account freeze. Share your account number and OTP sent to your registered mobile.",
  "Your ICICI credit card payment of Rs 45,999 is pending. Pay immediately to avoid legal action. Transfer to A/C: 1234567890123456, IFSC: ICIC0001234",
  "Urgent: Your bank account will be closed in 24 hours. Update your PAN and Aadhaar details at our secure portal. Contact: support@bank-verify.com",
  "RBI Notice: Your account is flagged for money laundering investigation. Deposit Rs 50,000 as security to unfreeze. UPI: rbi.security@ybl"
];

const prizeScams: string[] = [
  "CONGRATULATIONS! You've won Rs 25,00,000 in the Google Lucky Draw! Pay processing fee of Rs 5,000 to claim. Transfer to UPI: googlelucky@paytm",
  "You are selected as the WINNER of iPhone 15 Pro! Courier charges: Rs 2,999 only. Pay now: http://apple-winner.in Contact: 8765432109",
  "Dear Winner, Your mobile number won $1,000,000 in UK Lottery! Send processing documents and fee of Rs 15,000. Email: uk.lottery.claims@gmail.com",
  "Amazon Lucky Customer! You won a FREE Samsung TV worth Rs 89,000! Pay GST of Rs 4,500 to receive. Account: 9876543210987654, IFSC: SBIN0012345",
  "JIOMART MEGA PRIZE: You won a Tata Safari! Processing fee Rs 25,000. WhatsApp: +91-9999888877 with your Aadhaar and PAN for verification."
];

const governmentScams: string[] = [
  "INCOME TAX DEPARTMENT: Your refund of Rs 15,450 is pending. Verify bank details immediately at http://it-refund-gov.in to receive within 24 hours.",
  "POLICE CYBER CELL: Your Aadhaar is linked to illegal activities. Appear virtually within 2 hours or face arrest. Pay fine of Rs 50,000. UPI: cybercell.fine@oksbi",
  "EPFO Notice: Your PF account blocked due to mismatch. Update details at http://epfo-update.org. Contact: 7654321098",
  "ELECTRICITY DEPT: Your connection will be cut in 2 hours for unpaid bill of Rs 8,456. Pay now to avoid disconnection. UPI: electricity.dept@ybl",
  "PASSPORT AUTHORITY: Your passport application rejected. Reapply with fee of Rs 12,000 at http://passport-seva.xyz. Urgent response required."
];

const employmentScams: string[] = [
  "CONGRATULATIONS! Selected for Amazon Work From Home job. Salary: Rs 45,000/month. Pay registration fee Rs 3,500 to start. UPI: amazon.hr@paytm",
  "URGENT HIRING: Google India needs data entry operators. Training provided. Investment: Rs 8,000 only. Returns Rs 5,000 weekly. Contact: 9988776655",
  "You're hired! TCS remote position confirmed. Complete onboarding by paying Rs 15,000 for laptop and ID card. Transfer to: A/C 5678901234567890, IFSC: HDFC0005678",
  "Part-time job offer: Earn Rs 2,000 daily from home! Just like and share posts. Registration: Rs 500. WhatsApp resume to +91-8877665544",
  "INFOSYS is hiring freshers! Salary Rs 6 LPA. Training fee Rs 25,000 refundable after joining. Apply: http://infosys-careers.xyz"
];

export const scamTemplates: ScamTemplate[] = [
  { type: 'banking', messages: bankingScams },
  { type: 'prize', messages: prizeScams },
  { type: 'government', messages: governmentScams },
  { type: 'employment', messages: employmentScams }
];

export function getRandomScamMessage(type?: ScamType): { type: ScamType; message: string } {
  let templates: ScamTemplate[];
  
  if (type) {
    templates = scamTemplates.filter(t => t.type === type);
  } else {
    templates = scamTemplates;
  }
  
  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
  const selectedMessage = selectedTemplate.messages[Math.floor(Math.random() * selectedTemplate.messages.length)];
  
  return {
    type: selectedTemplate.type,
    message: selectedMessage
  };
}

export function getScamTypeLabel(type: ScamType): string {
  const labels: Record<ScamType, string> = {
    banking: 'Banking/Financial',
    prize: 'Prize/Reward',
    government: 'Government/Legal',
    employment: 'Employment/Job'
  };
  return labels[type];
}

export function getScamTypeColor(type: ScamType): string {
  const colors: Record<ScamType, string> = {
    banking: 'bg-red-500/10 text-red-500 border-red-500/20',
    prize: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    government: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    employment: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  };
  return colors[type];
}
