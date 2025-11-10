
import { Profile, ChecklistTemplate, TemplateItem, Audit, AuditItem, UserRole, AuditStatus, AuditItemStatus, SupplierCustomItem, ItemComment, Connection } from '../types';

export const PROFILES: Profile[] = [
    {
        id: 'user_buyer_zespri',
        fullName: 'Jane Doe',
        companyName: 'Zespri International',
        companyPhotoUrl: 'https://picsum.photos/seed/zespri/200',
        userRole: UserRole.Buyer,
        uniqueCode: 'ZESP123',
        contactName: 'Jane Doe',
        contactPhone: '+64 7 572 7600',
        contactEmail: 'jane.doe@zespri.com',
    },
    {
        id: 'user_supplier_kiwi_orchard',
        fullName: 'John Smith',
        companyName: 'Kiwi Orchard Ltd',
        companyPhotoUrl: 'default_cat_avatar',
        userRole: UserRole.Supplier,
        uniqueCode: 'KIWI456',
        contactName: 'John Smith',
        contactPhone: '+64 21 123 4567',
        contactEmail: 'john.s@kiwiorchard.co.nz',
    },
    {
        id: 'user_supplier_apple_farms',
        fullName: 'Mary Anne',
        companyName: 'Apple Farms BOP',
        companyPhotoUrl: 'https://picsum.photos/seed/apple/200',
        userRole: UserRole.Supplier,
        uniqueCode: 'APPL789',
        contactName: 'Mary Anne',
        contactPhone: '+64 22 987 6543',
        contactEmail: 'mary@applefarms.co.nz',
    },
    {
        id: 'user_buyer_test',
        fullName: 'Test Buyer',
        companyName: 'Test Buyer Co.',
        companyPhotoUrl: 'https://picsum.photos/seed/testbuyer/200',
        userRole: UserRole.Buyer,
        uniqueCode: 'BUYER1',
        contactName: 'Test Buyer',
        contactPhone: '+1 123 456 7890',
        contactEmail: 'buyer@mail.com',
    },
    {
        id: 'user_supplier_test',
        fullName: 'Test Supplier',
        companyName: 'Test Supplier Farms',
        companyPhotoUrl: 'default_cat_avatar',
        userRole: UserRole.Supplier,
        uniqueCode: 'SUPPL1',
        contactName: 'Test Supplier',
        contactPhone: '+1 098 765 4321',
        contactEmail: 'supplier@mail.com',
    }
];

export const CONNECTIONS: Connection[] = [
    { id: 'conn_1', buyerProfileId: 'user_buyer_zespri', supplierProfileId: 'user_supplier_kiwi_orchard', status: 'active', initiatorId: 'user_buyer_zespri' },
    { id: 'conn_2', buyerProfileId: 'user_buyer_zespri', supplierProfileId: 'user_supplier_apple_farms', status: 'active', initiatorId: 'user_buyer_zespri' },
];


export const TEMPLATES: ChecklistTemplate[] = [
  { id: 'template_1', templateName: 'WorkSafe - Health & Safety Essentials', category: 'H&S' },
  { id: 'template_2', templateName: 'MPI - Food Act & Traceability', category: 'Food Safety' },
  { id: 'template_3', templateName: 'EPA - Agrichemical Management', category: 'Environment' },
  { id: 'template_4', templateName: 'NZGAP - Social Practice & Employment', category: 'Social' },
  { id: 'template_5', templateName: 'HACCP - Food Safety Plan', category: 'Food Safety' },
  { id: 'template_6', templateName: 'Organic Certification', category: 'Certification' },
  { id: 'template_7', templateName: 'Export Document Package', category: 'Export' },
  { id: 'template_8', templateName: 'Biosecurity & IHS Compliance (MPI)', category: 'Biosecurity' },
  { id: 'template_9', templateName: 'Consumer Goods Safety (Commerce Commission)', category: 'Product Safety' },
];

export const TEMPLATE_ITEMS: TemplateItem[] = [
  // WorkSafe - H&S
  { id: 'item_1_1', templateId: 'template_1', itemTitle: 'Hazard & Risk Register', itemHelpText: { supplier: 'Upload your current Hazard Register. It must identify all significant hazards and outline control measures.', buyer: 'Verify the register is up-to-date and covers key operational risks (e.g., machinery, falls, substances).' }, basis: 'Health and Safety at Work Act 2015' },
  { id: 'item_1_2', templateId: 'template_1', itemTitle: 'Emergency Procedures', itemHelpText: { supplier: 'Provide your documented emergency plan, including contact numbers and assembly points.', buyer: 'Check that the plan is clearly displayed, accessible to all staff, and covers likely emergencies (e.g., fire, medical, chemical spill).' }, basis: 'Health and Safety at Work Act 2015, General Risk and Workplace Management Regulations' },
  
  // MPI - Food Safety
  { id: 'item_2_1', templateId: 'template_2', itemTitle: 'Product Traceability Log', itemHelpText: { supplier: 'Provide a sample from your traceability system, showing how you can trace a product one step forward and one step back.', buyer: 'Ensure the log demonstrates effective traceability, linking batches of produce to specific locations and dates.' }, basis: 'Food Act 2014 & Food Regulations 2015' },
  { id: 'item_2_2', templateId: 'template_2', itemTitle: 'Pest Management Records', itemHelpText: { supplier: 'Provide your pest control log, including details of bait station checks, treatments, and sightings.', buyer: 'Check for regular, dated entries that show a proactive approach to pest management in and around storage/packing areas.' }, basis: 'Food Act 2014 & Food Regulations 2015' },
  
  // EPA - Environment
  { id: 'item_3_1', templateId: 'template_3', itemTitle: 'Agrichemical Inventory', itemHelpText: { supplier: 'Upload a list of all hazardous substances (agrichemicals) stored on site.', buyer: 'Verify the inventory is current and matches the Safety Data Sheets (SDS) available on site.' }, basis: 'Hazardous Substances and New Organisms (HSNO) Act 1996' },
  { id: 'item_3_2', templateId: 'template_3', itemTitle: 'Chemical Storage Area Inspection', itemHelpText: { supplier: 'Upload photos of your primary chemical storage area, showing signage, spill kits, and security.', buyer: 'Confirm the storage area is locked, bunded (if required), correctly signed (HSNO), and away from drains or waterways.' }, basis: 'Hazardous Substances and New Organisms (HSNO) Act 1996' },

  // NZGAP - Social
  { id: 'item_4_1', templateId: 'template_4', itemTitle: 'Employment Agreement Sample', itemHelpText: { supplier: 'Provide a blank or redacted copy of your standard employment agreement for staff.', buyer: 'Check that the agreement complies with NZ employment law, including wage rates, leave entitlements, and hours of work.' }, basis: 'Employment Relations Act 2000 & Minimum Wage Act 1983' },
  
  // HACCP - Food Safety Plan
  { id: 'item_5_1', templateId: 'template_5', itemTitle: 'HACCP Plan Document', itemHelpText: { supplier: 'Upload your complete HACCP plan document, including your hazard analysis and team details.', buyer: 'Review the plan for completeness and ensure it correctly identifies all potential food safety hazards relevant to the operation.' }, basis: 'MPI - Hazard Analysis and Critical Control Point (HACCP) Principles' },
  { id: 'item_5_2', templateId: 'template_5', itemTitle: 'Critical Control Point (CCP) Monitoring Logs', itemHelpText: { supplier: 'Provide a recent example of your CCP monitoring logs (e.g., temperature checks for a cool store).', buyer: 'Verify logs are being completed correctly, at the specified frequency, and show that critical limits are being met.' }, basis: 'MPI - Hazard Analysis and Critical Control Point (HACCP) Principles' },
  { id: 'item_5_3', templateId: 'template_5', itemTitle: 'Corrective Action Records', itemHelpText: { supplier: 'Upload a record of a corrective action taken when a critical limit was not met.', buyer: 'Ensure the record details the deviation, the action taken to correct it, and the steps to prevent recurrence.' }, basis: 'MPI - Hazard Analysis and Critical Control Point (HACCP) Principles' },

  // Organic Certification
  { id: 'item_6_1', templateId: 'template_6', itemTitle: 'Current Organic Certificate', itemHelpText: { supplier: 'Upload a valid, current organic certificate from an accredited NZ provider (e.g., BioGro, AsureQuality).', buyer: 'Check the certificate is valid, current, and covers the products being supplied. Verify the certification body is legitimate.' }, basis: 'MPI - Official Organic Assurance Programme (OOAP)' },
  
  // Export Document Package
  { id: 'item_7_1', templateId: 'template_7', itemTitle: 'Phytosanitary Certificate', itemHelpText: { supplier: 'Upload a sample MPI Phytosanitary Certificate for a recent, similar shipment.', buyer: 'Check that the certificate details match the product and destination requirements for pest and disease-free status.' }, basis: 'MPI - Export Certification Standards' },
  { id: 'item_7_2', templateId: 'template_7', itemTitle: 'Commercial Invoice & Packing List', itemHelpText: { supplier: 'Provide an example of a commercial invoice and packing list for an export order.', buyer: 'Verify documents are clear, accurate, and contain all necessary information for customs and the importer.' }, basis: 'NZ Customs Service - Export Entry Rules' },
  { id: 'item_7_3', templateId: 'template_7', itemTitle: 'Customs Entry Declaration', itemHelpText: { supplier: 'Provide a sample of a completed customs entry declaration form for a recent shipment.', buyer: 'Confirm the declaration accurately reflects the goods, value, and origin as per NZ Customs Service requirements.' }, basis: 'NZ Customs Service - Export Entry Rules' },
  { id: 'item_7_4', templateId: 'template_7', itemTitle: 'Certificate of Origin', itemHelpText: { supplier: 'Upload a Certificate of Origin if required for preferential tariff rates under a Free Trade Agreement (e.g., CPTPP, NZ-China FTA).', buyer: 'Verify the certificate is correctly issued by an authorized body and corresponds to the shipment details.' }, basis: 'NZ Customs Service - Export Entry Rules' },

  // Biosecurity & IHS Compliance (MPI)
  { id: 'item_8_1', templateId: 'template_8', itemTitle: 'Import Health Standard (IHS) Declaration', itemHelpText: { supplier: 'Provide the signed declaration confirming compliance with the relevant MPI Import Health Standard for your product category.', buyer: 'Check that the provided IHS is correct for the product and destination market, and that the declaration is correctly filled out.' }, basis: 'MPI - Biosecurity Act 1993 & Import Health Standards (IHS)' },
  { id: 'item_8_2', templateId: 'template_8', itemTitle: 'Biosecurity Operator Registration', itemHelpText: { supplier: 'Upload evidence of registration as a Biosecurity Transitional Facility or Containment Facility operator, if applicable.', buyer: 'Verify the registration is current and appropriate for the type of goods being handled.' }, basis: 'MPI - Biosecurity Act 1993 & Import Health Standards (IHS)' },

  // Consumer Goods Safety (Commerce Commission)
  { id: 'item_9_1', templateId: 'template_9', itemTitle: 'Product Safety Compliance Declaration', itemHelpText: { supplier: 'Provide a declaration that all food-contact materials, packaging, and any other consumer goods components comply with relevant NZ product safety standards.', buyer: 'Review the declaration to ensure it covers all applicable materials and references the appropriate regulations under the Commerce Commission.' }, basis: 'Commerce Commission - Consumer Guarantees Act 1993 & Fair Trading Act 1986' },
];

export const AUDITS: Audit[] = [
  {
    id: 'audit_1',
    buyerId: 'user_buyer_zespri',
    supplierId: 'user_supplier_kiwi_orchard',
    status: AuditStatus.InReview,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    auditTitle: 'Zespri 2024 Q3 Compliance Audit',
    templateIds: ['template_1', 'template_2'],
  },
  {
    id: 'audit_2',
    buyerId: 'user_buyer_zespri',
    supplierId: 'user_supplier_apple_farms',
    status: AuditStatus.Pending,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    auditTitle: 'Apple Farms Onboarding Check',
    templateIds: ['template_1'],
  },
   {
    id: 'audit_3',
    buyerId: 'user_buyer_zespri',
    supplierId: 'user_supplier_kiwi_orchard',
    status: AuditStatus.Approved,
    dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approvalDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    auditTitle: 'Zespri 2024 Q2 Finalized Audit',
    templateIds: ['template_1', 'template_2', 'template_4'],
  },
];

export const AUDIT_ITEMS: AuditItem[] = [
  // Audit 1 for Kiwi Orchard
  { id: 'audit_item_1', auditId: 'audit_1', templateItemId: 'item_1_1', status: AuditItemStatus.Approved, evidenceFiles: [{ url: 'https://picsum.photos/seed/hazard/400/300', name: 'Hazard_Register.jpg' }], supplierNotes: 'Here is our latest register.' },
  { id: 'audit_item_2', auditId: 'audit_1', templateItemId: 'item_1_2', status: AuditItemStatus.Rejected, evidenceFiles: [{ url: 'https://picsum.photos/seed/incident/400/300', name: 'Incident_Log.pdf' }], supplierNotes: 'This is the log from last month.' },
  { id: 'audit_item_3', auditId: 'audit_1', templateItemId: 'item_2_1', status: AuditItemStatus.PendingReview, supplierEvidenceText: 'All staff undergo a 2-day induction process covering all key safety procedures. Records are held in the main office.', supplierNotes: 'Plan updated this year.' },
  { id: 'audit_item_4', auditId: 'audit_1', templateItemId: 'item_2_2', status: AuditItemStatus.PendingReview, evidenceFiles: [{ url: 'https://picsum.photos/seed/pest/400/300', name: 'Pest_Control.xls' }], supplierNotes: '' },
  
  // Audit 2 for Apple Farms
  { id: 'audit_item_6', auditId: 'audit_2', templateItemId: 'item_1_1', status: AuditItemStatus.PendingUpload },
  { id: 'audit_item_7', auditId: 'audit_2', templateItemId: 'item_1_2', status: AuditItemStatus.PendingUpload },
  
  // Audit 3 (Approved)
  { id: 'audit_item_9', auditId: 'audit_3', templateItemId: 'item_1_1', status: AuditItemStatus.Approved, evidenceFiles: [{ url: 'https://picsum.photos/seed/hazard2/400/300', name: 'Hazard_Register_Q2.jpg' }] },
  { id: 'audit_item_10', auditId: 'audit_3', templateItemId: 'item_1_2', status: AuditItemStatus.Approved, evidenceFiles: [{ url: 'https://picsum.photos/seed/incident2/400/300', name: 'Incident_Log_Q2.pdf' }] },
  { id: 'audit_item_11', auditId: 'audit_3', templateItemId: 'item_2_1', status: AuditItemStatus.Approved, supplierEvidenceText: 'We use a fully digital system from packhouse to distributor.' },
  { id: 'audit_item_12', auditId: 'audit_3', templateItemId: 'item_2_2', status: AuditItemStatus.Approved, evidenceFiles: [{ url: 'https://picsum.photos/seed/clean2/400/300', name: 'Cleaning_Schedule_Q2.pdf' }] },
  { id: 'audit_item_13', auditId: 'audit_3', templateItemId: 'item_4_1', status: AuditItemStatus.Approved, evidenceFiles: [{ url: 'https://picsum.photos/seed/wages2/400/300', name: 'Sample_Contract.pdf' }] },
];

export const SUPPLIER_CUSTOM_ITEMS: SupplierCustomItem[] = [
    { id: 'custom_item_1', auditId: 'audit_1', itemTitle: 'Gender Friendly Toilets', status: AuditItemStatus.PendingReview, evidenceFiles: [{ url: 'https://picsum.photos/seed/toilets/400/300', name: 'toilet_policy.jpg' }], supplierNotes: 'We installed new signs last month.' },
];

export const ITEM_COMMENTS: ItemComment[] = [
    { id: 'comment_1', auditItemId: 'audit_item_2', userId: 'user_buyer_zespri', commentText: 'The photo is too blurry, I cannot read the dates. Please re-upload.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { id: 'comment_2', auditItemId: 'audit_item_2', userId: 'user_supplier_kiwi_ orchard', commentText: 'Sorry about that. I have uploaded a clearer photo now.', timestamp: new Date().toISOString() },
];
