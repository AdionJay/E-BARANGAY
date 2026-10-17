/**
 * Storage key and file paths of the official PDF templates.
 * Defines: STORAGE_KEY, DEFAULT_PDF_TEMPLATE, INDIGENCY_PDF_TEMPLATE, CLEARANCE_PDF_TEMPLATE, BUSINESS_PDF_TEMPLATE, NO_PENDING_CASE_PDF_TEMPLATE, ENDORSEMENT_PDF_TEMPLATE, BLOTTER_PDF_TEMPLATE, SOLO_PARENT_PDF_TEMPLATE, CERTIFICATION_PDF_TEMPLATE, CERTIFICATE_OF_LOW_INCOME_PDF_TEMPLATE, DOCUMENT_ASSETS
 */
const STORAGE_KEY = 'ebarangay_system_v23';

// Default document types with fees and certificate body templates
// Placeholders: {fullName}, {civilStatus}, {address}, {purok}, {barangay}, {purpose}, {date}, {captain}
// Default physical PDF templates used by offered barangay documents.
// Paths are relative to index.html (inside /assets). Must be quoted strings.
const DEFAULT_PDF_TEMPLATE = 'assets/Barangay Certificate of Residency.pdf';

const INDIGENCY_PDF_TEMPLATE = 'assets/Barangay Certificate of Indigency.pdf';

const CLEARANCE_PDF_TEMPLATE = 'assets/Barangay Clearance.pdf';

const BUSINESS_PDF_TEMPLATE = 'assets/Business Permit.pdf';

const NO_PENDING_CASE_PDF_TEMPLATE = 'assets/Certificate of No Pending Case.pdf';

const ENDORSEMENT_PDF_TEMPLATE = 'assets/Barangay Endorsement.pdf';

const BLOTTER_PDF_TEMPLATE = 'assets/Blotter&Incident Report.pdf';

const SOLO_PARENT_PDF_TEMPLATE = 'assets/Barangay Certificate of Solo Parent.pdf';

const CERTIFICATION_PDF_TEMPLATE = 'assets/Barangay Certification.pdf';

const CERTIFICATE_OF_LOW_INCOME_PDF_TEMPLATE = 'assets/Certificate of Low Income.pdf';

const DOCUMENT_ASSETS = {
  'Barangay Clearance': CLEARANCE_PDF_TEMPLATE,
  'Certificate of Indigency': INDIGENCY_PDF_TEMPLATE,
  'Certificate of Residency': DEFAULT_PDF_TEMPLATE,
  'Barangay Certification': CERTIFICATION_PDF_TEMPLATE,
  'Business Permit': BUSINESS_PDF_TEMPLATE,
  'Blotter / Incident Report': BLOTTER_PDF_TEMPLATE,
  'Certificate of Good Moral Character': DEFAULT_PDF_TEMPLATE,
  'Certificate of Solo Parent': SOLO_PARENT_PDF_TEMPLATE,
  'Certificate of Low Income': CERTIFICATE_OF_LOW_INCOME_PDF_TEMPLATE,
  'Barangay Endorsement': ENDORSEMENT_PDF_TEMPLATE,
  'Certificate of No Pending Case': NO_PENDING_CASE_PDF_TEMPLATE
};
