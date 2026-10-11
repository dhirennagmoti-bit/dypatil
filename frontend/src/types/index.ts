export type RoleType =
  | 'POLICYHOLDER'
  | 'CLAIMS_OFFICER'
  | 'SUPERVISOR'
  | 'INSURER_ADMIN'
  | 'AUDITOR'
  | 'PLATFORM_ADMIN';

export type ClaimStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PENDING_SUPERVISOR_REVIEW'
  | 'ADDITIONAL_INFO_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: RoleType;
  insurerId?: string | null;
  insurerName?: string | null;
  phone?: string | null;
  active: boolean;
}

export interface Insurer {
  id: string;
  name: string;
  code: string;
  description: string;
  contactEmail?: string;
  contactPhone?: string;
  highValueThreshold?: number;
  active: boolean;
  createdAt: string;
}

export interface Policy {
  id: string;
  insurerId: string;
  insurerName: string;
  policyNumber: string;
  title: string;
  description?: string;
  category: string;
  coverageLimit: number;
  deductible: number;
  filingWindowDays: number;
  excludedCategories: string; // JSON string e.g. '["WAR", "EARTHQUAKE"]'
  policyRulesDescription?: string;
  effectiveDate: string;
  expiryDate: string;
  active: boolean;
  createdAt: string;
}

export interface Claim {
  id: string;
  claimReference: string;
  policyId: string;
  policyTitle: string;
  policyNumber: string;
  policyholderId: string;
  policyholderName: string;
  insurerId: string;
  insurerName: string;
  category: string;
  requestedAmount: number;
  approvedAmount?: number | null;
  incidentDate: string;
  filingDate: string;
  narrative: string;
  incidentLocation?: string;
  status: ClaimStatus;
  incidentId?: string | null;
  incidentFingerprint: string;
  duplicateSuspected: boolean;
  duplicateReason?: string | null;
  highValue?: boolean;
  highValueThreshold?: number;
  coverageLimit?: number;
  deductible?: number;
  suggestedPayoutAmount?: number;
  eligible?: boolean;
  officerRecommendation?: 'APPROVE' | 'REJECT' | null;
  officerRecommendationJustification?: string | null;
  officerRecommendedAt?: string | null;
  officerId?: string | null;
  supervisorDecision?: 'APPROVED' | 'REJECTED' | null;
  supervisorDecisionJustification?: string | null;
  supervisorDecidedAt?: string | null;
  supervisorId?: string | null;
  adminProcessingStatus?: string | null;
  adminNotes?: string | null;
  settlementReference?: string | null;
  adminProcessedAt?: string | null;
  adminId?: string | null;
  policyRulesSnapshot?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimEvidence {
  id: string;
  claimId: string;
  fileName: string;
  fileType?: string;
  fileUrl: string;
  fileSizeBytes?: number;
  description?: string;
  uploadedAt: string;
}

export interface RuleCheckResult {
  rule: string;
  passed: boolean;
  message: string;
}

export interface EligibilityResult {
  eligible: boolean;
  suggestedPayoutAmount: number;
  primaryExplanation: string;
  rules: RuleCheckResult[];
}

export interface AiInconsistencyFlag {
  field?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export interface AiExtraction {
  id: string;
  claimId: string;
  extractedSummary: string;
  extractedEntitiesJson: string;
  hasInconsistency: boolean;
  inconsistencyFlagsJson: string;
  confidenceScore: number;
  reviewPromptNote: string;
  processedAt: string;
}

export interface AuditLog {
  id: string;
  sequenceNumber: number;
  claimId?: string;
  insurerId?: string;
  insurerName: string;
  actorId?: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  previousState?: string;
  newState?: string;
  decisionReason?: string;
  ipAddress?: string;
  timestamp: string;
  previousHash: string;
  currentHash: string;
}

export interface HashChainVerificationResult {
  valid: boolean;
  totalRecordsChecked: number;
  brokenSequenceNumber?: number | null;
  errorMessage?: string | null;
  genesisHash: string;
  latestHash: string;
  verificationTimestamp: string;
  failureCategory?: string | null;
  expectedHash?: string | null;
  observedHash?: string | null;
}

export interface InsurerMetrics {
  insurerId: string;
  insurerName: string;
  totalPolicies: number;
  totalClaims: number;
  submittedClaims: number;
  underReviewClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  paidClaims: number;
  pendingOfficerReviews: number;
  pendingSupervisorDecisions: number;
  highValuePendingClaims: number;
  approvedAwaitingAdmin: number;
  refusedViolationsCount: number;
  highValueThreshold: number;
  totalRequestedAmount: number;
  totalApprovedAmount: number;
}

export interface ClaimDetailResponse {
  claim: Claim;
  policy?: Policy;
  evidence: ClaimEvidence[];
  eligibilityEvaluation?: EligibilityResult;
  aiExtraction?: AiExtraction;
  auditLogs: AuditLog[];
}
