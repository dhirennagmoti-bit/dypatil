package com.insurechain.dto;

import java.util.ArrayList;
import java.util.List;

public class ClaimDetailResponse {
    private ClaimDto claim;
    private PolicyDto policy;
    private List<ClaimEvidenceDto> evidence = new ArrayList<>();
    private EligibilityResultDto eligibilityEvaluation;
    private AiExtractionDto aiExtraction;
    private List<AuditLogDto> auditLogs = new ArrayList<>();

    public ClaimDetailResponse() {}

    public ClaimDetailResponse(ClaimDto claim, PolicyDto policy, List<ClaimEvidenceDto> evidence,
                               EligibilityResultDto eligibilityEvaluation, AiExtractionDto aiExtraction,
                               List<AuditLogDto> auditLogs) {
        this.claim = claim;
        this.policy = policy;
        this.evidence = evidence;
        this.eligibilityEvaluation = eligibilityEvaluation;
        this.aiExtraction = aiExtraction;
        this.auditLogs = auditLogs;
    }

    public ClaimDto getClaim() { return claim; }
    public void setClaim(ClaimDto claim) { this.claim = claim; }

    public PolicyDto getPolicy() { return policy; }
    public void setPolicy(PolicyDto policy) { this.policy = policy; }

    public List<ClaimEvidenceDto> getEvidence() { return evidence; }
    public void setEvidence(List<ClaimEvidenceDto> evidence) { this.evidence = evidence; }

    public EligibilityResultDto getEligibilityEvaluation() { return eligibilityEvaluation; }
    public void setEligibilityEvaluation(EligibilityResultDto eligibilityEvaluation) { this.eligibilityEvaluation = eligibilityEvaluation; }

    public AiExtractionDto getAiExtraction() { return aiExtraction; }
    public void setAiExtraction(AiExtractionDto aiExtraction) { this.aiExtraction = aiExtraction; }

    public List<AuditLogDto> getAuditLogs() { return auditLogs; }
    public void setAuditLogs(List<AuditLogDto> auditLogs) { this.auditLogs = auditLogs; }
}
