# E-Barangay — JavaScript module map

The old single `js/app.js` (4,852 lines) was split into **87 single-purpose files**, grouped by feature folder.
Each file starts with a header comment: what it does + the functions it defines.

## How modules are "imported"

`index.html` loads the files with ordered `<script>` tags (one block per folder). The app uses inline handlers (`onclick="saveDocument()"`),
so every function stays global — this keeps it working when opened directly from a folder (file://) or Live Server, with no build step.

### Load order rules

1. `config/*` – constants and default data (no dependencies)
2. `core/*` – helpers, then `core/data-store.js`, then `core/state.js` which creates the global `data`
3. feature folders (`documents`, `certificate`, `auth`, `residents`, `secretary`, `treasurer`, ...) – any order, they only call each other at runtime
4. `app/login-bindings.js`, `app/mobile-sidebar.js`, `app/startup.js` – must stay last (startup wires everything on DOMContentLoaded)
5. `ebarangay-ui.js` – public-site UI extras

### Adding a new feature

1. Create `js/<folder>/<single-purpose>.js` with a header comment.
2. Add one `<script src="js/...">` line in `index.html` before `app/login-bindings.js`.

## Modules

### `config/`

| File | Purpose | Functions / variables |
|---|---|---|
| `constants.js` | Storage key and file paths of the official PDF templates. | `STORAGE_KEY, DEFAULT_PDF_TEMPLATE, INDIGENCY_PDF_TEMPLATE, CLEARANCE_PDF_TEMPLATE, BUSINESS_PDF_TEMPLATE, NO_PENDING_CASE_PDF_TEMPLATE, ENDORSEMENT_PDF_TEMPLATE, BLOTTER_PDF_TEMPLATE, SOLO_PARENT_PDF_TEMPLATE, CERTIFICATION_PDF_TEMPLATE, CERTIFICATE_OF_LOW_INCOME_PDF_TEMPLATE, DOCUMENT_ASSETS` |
| `doc-types-config.js` | Default document types (fees) and the extra form fields each document needs. | `DEFAULT_DOC_TYPES, DOC_FORM_FIELDS` |
| `default-data.js` | Factory-default dataset used on first run / reset. | `defaultData` |
| `purok-config.js` | Official purok list and legacy purok-name mapping. | `PUROK_LIST, PUROK_LEGACY_MAP` |

### `core/`

| File | Purpose | Functions / variables |
|---|---|---|
| `dom.js` | Tiny DOM query helpers ($ and $$). | `$(), $$()` |
| `toast.js` | Toast notification popup. | `showToast()` |
| `date-utils.js` | Date and age helpers. | `formatDate(), calcAge(), formatAge(), today()` |
| `id-utils.js` | Sequential id generator for records. | `nextId()` |
| `role-utils.js` | Current-user role helpers. | `role(), displayRole()` |
| `status-badge.js` | Coloured status badge HTML for documents/payments. | `statusBadge()` |
| `household-utils.js` | Household record normaliser. | `ensureHousehold()` |
| `html-utils.js` | HTML escaping helper. | `escapeHtml()` |
| `modal.js` | Generic close-modal helper. | `closeModal()` |
| `confirm-modal.js` | Reusable confirm / delete dialog. | `_confirmCallback, closeConfirmModal(), openConfirmModal()` |
| `data-store.js` | Load / save the app data in localStorage and make sure default users exist. | `ensureDefaultUsers(), loadData(), saveData()` |
| `state.js` | Creates the single global `data` object used by every module. | `data` |

### `documents/`

| File | Purpose | Functions / variables |
|---|---|---|
| `doc-types.js` | Document type registry: fees, templates and placeholder filling. | `ensureDocTypes(), getDocTypes(), getDocTypeNames(), getDocFee(), getDocTemplate(), fillTemplate()` |
| `doc-type-icons.js` | Font Awesome icon picked for each document type. | `getDocTypeIcon()` |
| `doc-type-admin.js` | Admin/Secretary screen to add, edit and delete document types. | `renderDocTypesTable(), openAddDocType(), openEditDocType(), openEditDocFormat(), saveDocType(), deleteDocType()` |
| `pdf-assets.js` | Look up the official PDF template linked to a document type. | `getDocumentAsset(), hasDocumentAsset()` |
| `pdf-viewer.js` | PDF.js viewer modal (open, render, zoom, page navigation, template review). | `_pdfjsDoc, _pdfjsPage, _pdfjsScale, _pdfjsPath, _pdfjsRendering, openPDFFile(), pdfjsLoadAndRender(), pdfjsRenderAllPages(), pdfjsChangePage(), pdfjsZoom(), pdfjsOpenInNewTab(), pdfjsSaveFile(), reviewDocumentAsset(), requestFromPDFReview()` |
| `send-pdf.js` | Staff action: send a released PDF to the resident. | `sendDocumentPDF(), attachPdfAssetToDocument()` |
| `request-form-fields.js` | Dynamic fields and applicant (self / on-behalf) toggle of the request form. | `fillResidentDocAutoFields(), getDocFormFieldsForType(), clearDocDynamicInputs(), updateDocDynamicFields(), onDocTypeFormChange(), onDocApplicantModeChange(), resetDocApplicantMode()` |
| `request-modal.js` | Open the Request Document modal and show the fee. | `openDocumentModal(), updateDocFeeDisplay()` |
| `request-save.js` | Collect form details and save a new document request. | `collectDocFormDetails(), saveDocument()` |
| `document-list.js` | Staff document table, delete document. | `renderDocuments(), deleteDocument()` |
| `document-view.js` | Open a document (auto-filled PDF) for review. | `viewDocument()` |
| `my-requests.js` | Resident "My Requests" screen. | `renderMyRequests()` |

### `residents/`

| File | Purpose | Functions / variables |
|---|---|---|
| `resident-lookup.js` | Resolve a resident id to a display name. | `getResidentName()` |
| `resident-photo.js` | Resident photo / avatar HTML. | `residentPhotoHtml()` |
| `resident-renumber.js` | Keep resident ids sequential (1..N). | `renumberResidents()` |
| `household-editor.js` | Household member editor inside the resident form. | `renderHouseholdEditor(), addHouseholdMemberRow(), removeHouseholdMemberRow(), collectHouseholdFromEditor()` |
| `resident-crud.js` | Resident table and add / edit / delete. | `renderResidents(), openResidentModal(), saveResident(), editResident(), deleteResident()` |
| `resident-detail.js` | Resident detail review modal. | `viewResidentDetail()` |
| `purok-records.js` | Purok name normalising and purok-based resident records. | `normalizePurok(), migratePurokNames(), selectPurokFilter(), renderPurokResidentRecords()` |

### `certificate/`

| File | Purpose | Functions / variables |
|---|---|---|
| `applicant-details.js` | Merge request + resident data into one applicant object; long date formatter. | `getApplicantDetails(), formatLongDate()` |
| `document-body.js` | Official wording (paragraphs) of every certificate type. | `buildOfficialDocumentBody()` |
| `barangay-logo.js` | Load the barangay seal as a data URL for PDFs. | `_barangayLogoDataUrl, _barangayLogoLoading, loadBarangayLogoDataUrl()` |
| `certificate-header.js` | Draw the official letterhead on a jsPDF page. | `drawCertificateHeader()` |
| `generate-filled-pdf.js` | Build the filled certificate PDF with jsPDF. | `generateFilledDocumentPDF()` |
| `filled-viewer.js` | Preview the filled document and printable HTML fallback. | `openFilledDocumentViewer(), printFilledDocumentFallback()` |
| `pdf-asset-fill.js` | Write resident data onto the official PDF assets with pdf-lib. | `pdfLibAvailable(), topYToPdfLib(), fillIndigencyPdfAsset(), fillPdfAssetWithResidentData()` |
| `pdf-download.js` | Download / view / print released certificates. | `triggerPdfBytesDownload(), downloadDocumentPDF(), viewFilledDocument(), printDocumentFallback()` |
| `captain-signature.js` | Captain e-signature canvas helpers. | `_sigDrawing, initSigCanvas(), clearCaptainSig(), saveCaptainSig(), initApproveSigCanvas(), clearApproveSigCanvas()` |

### `auth/`

| File | Purpose | Functions / variables |
|---|---|---|
| `auth-forms.js` | Switch between login, register and forgot-password forms. | `showRegisterForm(), showLoginForm(), showForgotForm()` |
| `forgot-password.js` | Forgot-password flow (find account, verify identity, reset). | `_forgotUser, forgotFindAccount(), forgotVerifyIdentity(), forgotResetPassword()` |
| `registration.js` | Resident self-registration. | `submitRegistration()` |
| `login.js` | Login form handling and role selection. | `LOGIN_ROLE_USER, onLoginRoleChange(), login()` |
| `logout.js` | Logout and session cleanup. | `logout()` |
| `registration-approval.js` | Secretary approval / rejection of pending registrations. | `renderPendingRegistrations(), approveRegistration(), rejectRegistration()` |

### `app/`

| File | Purpose | Functions / variables |
|---|---|---|
| `user-avatar.js` | Header / sidebar user avatar. | `updateUserAvatar()` |
| `app-shell.js` | Show the app after login and apply role-based menu visibility. | `showApp(), applyRoleVisibility(), showNav()` |
| `navigation.js` | Module navigation (sidebar routing). | `navigate()` |
| `login-bindings.js` | Keyboard + click reliability for the login and register forms. | `bindAuthForms()` |
| `mobile-sidebar.js` | Mobile sidebar: toggle button, close on nav click, close on overlay click. | `initMobileSidebar()` |
| `startup.js` | Application entry point — runs after every module has been loaded. | `(none — registers startup hooks only)` |

### `dashboard/`

| File | Purpose | Functions / variables |
|---|---|---|
| `dashboard.js` | Dashboard statistics and recent activity. | `renderDashboard()` |

### `secretary/`

| File | Purpose | Functions / variables |
|---|---|---|
| `secretary-dashboard.js` | Secretary dashboard: pending residents and requests. | `renderSecretary()` |
| `profiling-stats.js` | Auto-compute population and household stats. | `syncProfilingStats()` |
| `resident-verification.js` | Verify a resident. | `verifyResident(), _verifyResidentContinue()` |
| `document-review.js` | Start review and endorse a document request. | `startReview(), endorseDocument()` |
| `secretary-report.js` | Secretary document transaction report. | `getFilteredSecDocuments(), renderSecReport(), printSecReport()` |

### `treasurer/`

| File | Purpose | Functions / variables |
|---|---|---|
| `treasurer-dashboard.js` | Treasurer dashboard. | `renderTreasurer()` |
| `treasurer-report.js` | Treasurer collection report, charts and print. | `getFilteredTreasPayments(), renderTreasReport(), drawTreasCharts(), drawBarChart(), printTreasReport()` |
| `payment-collection.js` | Collect / verify / delete payments. | `openCollectModal(), onPayMethodChange(), confirmCollectPayment(), deletePayment()` |
| `payment-receipt.js` | Official payment receipt. | `_lastReceiptPaymentId, openPaymentReceipt(), printPaymentReceiptWindow()` |
| `payments-view.js` | Payments table (admin view). | `renderPayments()` |

### `captain/`

| File | Purpose | Functions / variables |
|---|---|---|
| `captain-approval.js` | Captain dashboard: approve, reject and release documents. | `renderCaptain(), approveDocument(), confirmApproveWithSig(), rejectDocument(), releaseDocument()` |

### `portal/`

| File | Purpose | Functions / variables |
|---|---|---|
| `resident-portal.js` | Resident portal home (services, my documents, payments). | `renderPortal(), portalRequestType()` |
| `resident-gcash.js` | Resident GCash payment submission. | `openResidentGcashPay(), submitResidentGcashPay()` |

### `profile/`

| File | Purpose | Functions / variables |
|---|---|---|
| `profile-view.js` | Resident "My Profile" screen and edit. | `renderProfile(), toggleProfileEdit(), saveProfileEdits()` |
| `profile-household.js` | Household section on the resident profile. | `buildProfileHouseholdHtml(), toggleProfileHouseholdEdit(), renderProfHhEditor(), profAddHhMember(), profRemoveHhMember(), collectProfHhFromEditor(), saveProfileHousehold()` |
| `profile-picture.js` | Profile picture upload and compression. | `uploadProfilePic(), compressImageDataUrl(), handleProfilePic()` |

### `national-id/`

| File | Purpose | Functions / variables |
|---|---|---|
| `id-capture.js` | Capture the National ID by upload or webcam. | `_ocrPendingImage, _ocrPendingText, _webcamStream, scanNationalId(), stopWebcam(), closeWebcamModal(), captureWebcamId(), uploadNationalId(), handleIdUpload()` |
| `ocr-engine.js` | Image preprocessing and Tesseract OCR run. | `preprocessIdImage(), runOcrOnImage()` |
| `ocr-text-utils.js` | Name / text matching helpers (levenshtein, fuzzy match). | `normalizePersonName(), fixOcrDigits(), levenshtein(), fuzzyIncludes(), cleanNameToken()` |
| `ph-id-parser.js` | Parse Philippine National ID fields from OCR text. | `parsePhilId()` |
| `ocr-matching.js` | Score OCR name against the resident name. | `scoreNameMatch()` |
| `ocr-results.js` | Show OCR results, confirm or clear ID verification. | `_ocrMatchScore, showOcrResults(), confirmOcrVerification(), clearNationalId()` |

### `notifications/`

| File | Purpose | Functions / variables |
|---|---|---|
| `notifications.js` | In-app notifications (create, list, read, delete, badge). | `addNotif(), getVisibleNotifications(), renderNotifications(), markNotifRead(), deleteNotification(), markAllRead(), clearReadNotifications(), updateNotifBadge()` |

### `admin/`

| File | Purpose | Functions / variables |
|---|---|---|
| `user-management.js` | Captain/Admin user accounts. | `renderAdmin(), openUserModal(), editUser(), saveUser(), deleteUser()` |
| `my-account.js` | Logged-in user account modal. | `openAccountModal(), saveMyAccount()` |
| `reset-data.js` | Reset all system data. | `resetData()` |
| `profiling.js` | Barangay profile (name, captain, contact). | `renderProfiling(), saveProfiling()` |
| `services.js` | Barangay services list. | `renderServices(), openServiceModal(), saveService(), completeService(), deleteService()` |
| `reports.js` | Reports screen. | `renderReports()` |

### `theme/`

| File | Purpose | Functions / variables |
|---|---|---|
| `theme.js` | Locked light theme and login theme handling. | `getPreferredTheme(), _loginTheme, applyLoginTheme(), hideInAppThemeToggle(), forcePortalLightTheme(), applyTheme(), toggleTheme(), initTheme()` |

## Notes

- Two unused leftovers from the old file were removed: `_oldRenderCaptain` and `_origNavigate` (declared but never read).
- The long `DOMContentLoaded` handler was split into named functions: `bindAuthForms()`, `initMobileSidebar()` and the small `startup.js`.
- All other function bodies are unchanged (verified statement-by-statement against the original).
