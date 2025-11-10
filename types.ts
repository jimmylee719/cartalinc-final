export enum UserRole {
  Buyer = 'buyer',
  Supplier = 'supplier',
}

export enum AuditStatus {
  Pending = 'pending',
  InReview = 'in_review',
  Approved = 'approved',
  Rejected = 'rejected', // Note: This status might apply to the whole audit if rejected outright
}

export enum AuditItemStatus {
  PendingUpload = 'pending_upload',
  PendingReview = 'pending_review',
  Approved = 'approved',
  Rejected = 'rejected',
}

export interface Profile {
  id: string;
  fullName: string;
  companyName: string;
  companyPhotoUrl: string;
  userRole: UserRole;
  uniqueCode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

export interface Connection {
  id: string;
  buyerProfileId: string;
  supplierProfileId: string;
  status: 'pending' | 'active';
  initiatorId: string;
}

export interface ChecklistTemplate {
  id: string;
  templateName: string;
  category: string;
}

export interface TemplateItem {
  id: string;
  templateId: string;
  itemTitle: string;
  itemHelpText: {
    supplier: string;
    buyer: string;
  };
  basis?: string;
}

export interface Audit {
  id: string;
  buyerId: string;
  supplierId: string;
  status: AuditStatus;
  dueDate: string;
  auditTitle: string;
  templateIds: string[];
  approvalDate?: string;
}

export interface AuditItem {
  id: string;
  auditId: string;
  templateItemId?: string;
  itemTitle?: string;
  itemHelpText?: {
    supplier: string;
    buyer: string;
  };
  status: AuditItemStatus;
  evidenceFiles?: { url: string; name: string }[];
  supplierEvidenceText?: string;
  supplierNotes?: string;
}

export interface SupplierCustomItem {
  id: string;
  auditId: string;
  itemTitle: string;
  evidenceFiles?: { url: string; name: string }[];
  supplierEvidenceText?: string;
  supplierNotes?: string;
  status: AuditItemStatus; // Added status for review flow
}

export interface ItemComment {
  id: string;
  auditItemId?: string;
  customItemId?: string;
  userId: string;
  commentText: string;
  timestamp: string;
}