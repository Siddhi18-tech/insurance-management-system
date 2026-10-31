import { jsPDF } from 'jspdf';

export function generateReceiptPdf(policy, user) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent Line
  doc.setFillColor(12, 142, 233); // brand-500
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  // Company Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('AegisShield Insurance', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Next-Gen Policy Management & Claims Settlement System', 14, 25);
  doc.text('Official Policy Certificate & Premium Receipt', 14, 32);

  // Document Metadata (Right aligned)
  const receiptNo = `REC-${policy.policyNumber || Date.now().toString().slice(-6)}`;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Receipt ID: ${receiptNo}`, pageWidth - 14, 20, { align: 'right' });
  doc.text(`Issue Date: ${issueDate}`, pageWidth - 14, 26, { align: 'right' });
  doc.text(`Status: ${policy.status || 'Active'}`, pageWidth - 14, 32, { align: 'right' });

  let y = 56;

  // SECTION 1: Policyholder & Nominee Details
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, y, pageWidth - 28, 42, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, y, pageWidth - 28, 42, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Insured & Nominee Information', 20, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  // Left column: Policyholder
  doc.text('Policyholder Name:', 20, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(user?.name || policy.user?.name || 'Insured Client', 58, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Email / Contact:', 20, y + 26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(user?.email || policy.user?.email || 'N/A', 58, y + 26);

  // Right column: Nominee
  const nomineeName = policy.nomineeName?.trim() || 'Not Specified';
  const nomineeRelation = policy.nomineeRelation?.trim() || 'Not Specified';

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Nominee Name:', 115, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(nomineeName, 148, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Nominee Relation:', 115, y + 26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(nomineeRelation, 148, y + 26);

  y += 50;

  // SECTION 2: Policy Details
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 70, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 70, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Policy Specifications & Coverage', 20, y + 8);

  const formatCurrency = (num) => `INR ${Number(num || 0).toLocaleString('en-IN')}`;

  const policyDetails = [
    ['Policy Number', policy.policyNumber || 'N/A'],
    ['Policy Title', policy.title || 'Standard Plan'],
    ['Coverage Type', policy.policyType || 'General'],
    ['Payment Frequency', policy.paymentFrequency || 'Annual'],
    ['Term Duration', `${policy.termMonths || 12} Months`],
    ['Effective Start Date', policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-IN') : 'N/A'],
    ['Coverage Expiry Date', policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-IN') : 'N/A'],
  ];

  let currentDetailY = y + 18;
  policyDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(label, 20, currentDetailY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(value, 65, currentDetailY);

    currentDetailY += 7;
  });

  y += 78;

  // SECTION 3: Financial Premium & Coverage Summary (Table Look)
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, pageWidth - 28, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Description', 20, y + 5.5);
  doc.text('Frequency / Terms', 105, y + 5.5);
  doc.text('Amount (INR)', pageWidth - 20, y + 5.5, { align: 'right' });

  y += 8;

  const rows = [
    ['Premium Payment Due', policy.paymentFrequency || 'Annual', formatCurrency(policy.premiumAmount)],
    ['Total Insured Coverage Limit', 'Maximum Protection', formatCurrency(policy.coverageAmount)],
    ['Applicable Deductible', 'Per Claim Filing', formatCurrency(policy.deductibleAmount || 0)],
  ];

  rows.forEach(([desc, freq, amt], idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, y, pageWidth - 28, 9, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 9, pageWidth - 14, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(desc, 20, y + 6);
    doc.text(freq, 105, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(12, 142, 233);
    doc.text(amt, pageWidth - 20, y + 6, { align: 'right' });

    y += 9;
  });

  y += 12;

  // Verification & Sign-off Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Terms & Legal Attestation:', 20, y + 7);
  doc.text(
    'This electronic receipt serves as valid proof of insurance coverage issued by AegisShield.',
    20,
    y + 13
  );
  doc.text(
    'All claims and settlements remain subject to the underwriting conditions defined in the policy agreement.',
    20,
    y + 18
  );

  // Digital Signature seal (Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('AUTHORIZED REGISTRAR', pageWidth - 20, y + 13, { align: 'right' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(12, 142, 233);
  doc.text('Digitally Signed & Validated', pageWidth - 20, y + 19, { align: 'right' });

  // Footer page notes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `AegisShield Insurance Portal • System Generated on ${new Date().toLocaleString()} • Policy Ref: ${policy._id}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 8,
    { align: 'center' }
  );

  // Trigger browser download
  const cleanNumber = policy.policyNumber ? policy.policyNumber.replace(/[^a-zA-Z0-9_-]/g, '') : 'policy';
  doc.save(`Receipt-${cleanNumber}.pdf`);
}

