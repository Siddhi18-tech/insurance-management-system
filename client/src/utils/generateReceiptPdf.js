import { jsPDF } from 'jspdf';

export function generateReceiptPdf(policy, user) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Header Banner (Navy corporate)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Accent Line
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 40, pageWidth, 2, 'F');

  // Company Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('AgiesShield Insurance', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Institutional Policy Certificate & Premium Electronic Receipt', 14, 25);
  doc.text('Official Policy Administration System Record', 14, 31);

  // Document Metadata (Right aligned)
  const receiptNo = `REC-${policy.policyNumber || Date.now().toString().slice(-6)}`;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Receipt No: ${receiptNo}`, pageWidth - 14, 18, { align: 'right' });
  doc.text(`Issued On: ${issueDate}`, pageWidth - 14, 24, { align: 'right' });
  doc.text(`Policy Status: ${policy.status || 'Active'}`, pageWidth - 14, 30, { align: 'right' });

  let y = 50;

  // SECTION 1: Insured, Nominee & Bank Mandate Information
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, y, pageWidth - 28, 52, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, y, pageWidth - 28, 52, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Insured Party, Nominee & Settlement Account Mandate', 20, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  // Left column: Policyholder & Contact
  doc.text('Policyholder Name:', 20, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(user?.name || policy.user?.name || 'Insured Client', 56, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Registered Email:', 20, y + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(user?.email || policy.user?.email || 'N/A', 56, y + 24);

  // Right column: Nominee
  const nomineeName = policy.nomineeName?.trim() || 'Not Specified';
  const nomineeRelation = policy.nomineeRelation?.trim() || 'Not Specified';

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Nominee Name:', 115, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(nomineeName, 146, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Relationship:', 115, y + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(nomineeRelation, 146, y + 24);

  // Bank details row
  const bank = policy.bankDetails || {};
  const bankNameStr = bank.bankName ? String(bank.bankName) : 'Not Configured';
  const rawAcc = bank.accountNumber ? String(bank.accountNumber) : '';
  const maskedAcc = rawAcc.length > 4 ? `••••••••${rawAcc.slice(-4)}` : (rawAcc || 'N/A');
  const ifscStr = bank.ifscCode ? String(bank.ifscCode) : 'N/A';

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Settlement Bank:', 20, y + 34);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(bankNameStr, 56, y + 34);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Bank A/C & IFSC:', 115, y + 34);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${maskedAcc} (${ifscStr})`, 146, y + 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Mandate: Configured for automated ECS premium debit and direct claim settlements.', 20, y + 44);

  y += 58;

  // SECTION 2: Policy Details
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 64, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 64, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Policy Specifications & Coverage Scope', 20, y + 7);

  const formatCurrency = (num) => `INR ${Number(num || 0).toLocaleString('en-IN')}`;

  const policyDetails = [
    ['Policy Number', policy.policyNumber || 'N/A'],
    ['Policy Plan Title', policy.title || 'Standard Plan'],
    ['Insurance Line / Type', policy.policyType || 'General'],
    ['Payment Frequency', policy.paymentFrequency || 'Annual'],
    ['Term Duration', `${policy.termMonths || 12} Months`],
    ['Effective Start Date', policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-IN') : 'N/A'],
    ['Coverage Expiry Date', policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-IN') : 'N/A'],
  ];

  let currentDetailY = y + 16;
  policyDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(label, 20, currentDetailY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(value, 68, currentDetailY);

    currentDetailY += 6.5;
  });

  y += 70;

  // SECTION 3: Financial Summary Table
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, pageWidth - 28, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Coverage Line', 20, y + 5);
  doc.text('Billing Terms', 105, y + 5);
  doc.text('Amount (INR)', pageWidth - 20, y + 5, { align: 'right' });

  y += 7;

  const rows = [
    ['Periodic Premium Installment', policy.paymentFrequency || 'Annual', formatCurrency(policy.premiumAmount)],
    ['Total Insured Coverage Sum', 'Maximum Admissible Limit', formatCurrency(policy.coverageAmount)],
    ['Applicable Policy Deductible', 'Per Claim Incurred', formatCurrency(policy.deductibleAmount || 0)],
  ];

  rows.forEach(([desc, freq, amt], idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, y, pageWidth - 28, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 8, pageWidth - 14, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(desc, 20, y + 5.5);
    doc.text(freq, 105, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(amt, pageWidth - 20, y + 5.5, { align: 'right' });

    y += 8;
  });

  y += 12;

  // Legal and digital attestation box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Statutory Declaration:', 20, y + 6);
  doc.text(
    'This computer-generated receipt serves as authentic certificate of active insurance coverage.',
    20,
    y + 11
  );
  doc.text(
    'All premium remittances and claims remain governed by statutory insurance underwriting guidelines.',
    20,
    y + 16
  );

  // Digital Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('REGISTRAR & UNDERWRITER', pageWidth - 20, y + 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(37, 99, 235);
  doc.text('Digitally Authenticated Document', pageWidth - 20, y + 17, { align: 'right' });

  // Page Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `AgiesShield Insurance Portal • System Generated on ${new Date().toLocaleString('en-IN')} • Policy ID: ${policy._id}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 8,
    { align: 'center' }
  );

  // Download trigger
  const cleanNumber = policy.policyNumber ? policy.policyNumber.replace(/[^a-zA-Z0-9_-]/g, '') : 'policy';
  doc.save(`PolicyReceipt-${cleanNumber}.pdf`);
}
