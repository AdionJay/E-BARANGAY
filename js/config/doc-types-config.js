/**
 * Default document types (fees) and the extra form fields each document needs.
 * Defines: DEFAULT_DOC_TYPES, DOC_FORM_FIELDS
 */
const DEFAULT_DOC_TYPES = [
  { name: 'Barangay Clearance', fee: 50, pdfAsset: CLEARANCE_PDF_TEMPLATE, template: '' },
  { name: 'Certificate of Indigency', fee: 0, pdfAsset: INDIGENCY_PDF_TEMPLATE, template: '' },
  { name: 'Certificate of Residency', fee: 30, pdfAsset: DEFAULT_PDF_TEMPLATE, template: '' },
  { name: 'Barangay Certification', fee: 30, pdfAsset: CERTIFICATION_PDF_TEMPLATE, template: '' },
  { name: 'Business Permit', fee: 200, pdfAsset: BUSINESS_PDF_TEMPLATE, template: '' },
  { name: 'Blotter / Incident Report', fee: 0, pdfAsset: BLOTTER_PDF_TEMPLATE, template: '' },
  { name: 'Certificate of Good Moral Character', fee: 30, pdfAsset: DEFAULT_PDF_TEMPLATE, template: '' },
  { name: 'Certificate of Solo Parent', fee: 0, pdfAsset: SOLO_PARENT_PDF_TEMPLATE, template: '' },
  { name: 'Certificate of Low Income', fee: 0, pdfAsset: CERTIFICATE_OF_LOW_INCOME_PDF_TEMPLATE, template: '' },
  { name: 'Barangay Endorsement', fee: 30, pdfAsset: ENDORSEMENT_PDF_TEMPLATE, template: '' },
  { name: 'Certificate of No Pending Case', fee: 30, pdfAsset: NO_PENDING_CASE_PDF_TEMPLATE, template: '' }
];

// Extra form fields required per official document wording template.
// Profile fields (name, civil status, address, purok, gender, birthdate) are always auto-filled.
const DOC_FORM_FIELDS = {
  'Barangay Clearance': ['purpose'],
  'Certificate of Indigency': ['purpose', 'monthlyIncome', 'employmentStatus', 'beneficiaryName'],
  'Certificate of Residency': ['purpose', 'yearsResiding', 'completeAddress'],
  'Barangay Certification': ['purpose', 'completeAddress'],
  'Business Permit': ['businessName', 'ownerName', 'businessAddress', 'businessPurpose'],
  'Blotter / Incident Report': ['incidentDetails'],
  'Certificate of Solo Parent': ['soloCircumstance', 'childrenCount'],
  'Certificate of Low Income': ['purpose', 'monthlyIncome'],
  'Barangay Endorsement': ['Date','receivingOffice','Officeaddress','Full Name','civilStatus','endorsementReason'],
  'Certificate of No Pending Case': ['Full Name','civilStatus','purpose']
};
