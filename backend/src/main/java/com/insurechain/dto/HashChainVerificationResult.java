package com.insurechain.dto;

public class HashChainVerificationResult {
    private boolean valid;
    private int totalRecordsChecked;
    private Long brokenSequenceNumber;
    private String errorMessage;
    private String genesisHash;
    private String latestHash;
    private String verificationTimestamp;
    private String failureCategory;
    private String expectedHash;
    private String observedHash;

    public HashChainVerificationResult() {}

    public HashChainVerificationResult(boolean valid, int totalRecordsChecked, Long brokenSequenceNumber,
                                       String errorMessage, String genesisHash, String latestHash,
                                       String verificationTimestamp) {
        this(valid, totalRecordsChecked, brokenSequenceNumber, errorMessage, genesisHash, latestHash, verificationTimestamp, null, null, null);
    }

    public HashChainVerificationResult(boolean valid, int totalRecordsChecked, Long brokenSequenceNumber,
                                       String errorMessage, String genesisHash, String latestHash,
                                       String verificationTimestamp, String failureCategory,
                                       String expectedHash, String observedHash) {
        this.valid = valid;
        this.totalRecordsChecked = totalRecordsChecked;
        this.brokenSequenceNumber = brokenSequenceNumber;
        this.errorMessage = errorMessage;
        this.genesisHash = genesisHash;
        this.latestHash = latestHash;
        this.verificationTimestamp = verificationTimestamp;
        this.failureCategory = failureCategory;
        this.expectedHash = expectedHash;
        this.observedHash = observedHash;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public int getTotalRecordsChecked() { return totalRecordsChecked; }
    public void setTotalRecordsChecked(int totalRecordsChecked) { this.totalRecordsChecked = totalRecordsChecked; }

    public Long getBrokenSequenceNumber() { return brokenSequenceNumber; }
    public void setBrokenSequenceNumber(Long brokenSequenceNumber) { this.brokenSequenceNumber = brokenSequenceNumber; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getGenesisHash() { return genesisHash; }
    public void setGenesisHash(String genesisHash) { this.genesisHash = genesisHash; }

    public String getLatestHash() { return latestHash; }
    public void setLatestHash(String latestHash) { this.latestHash = latestHash; }

    public String getVerificationTimestamp() { return verificationTimestamp; }
    public void setVerificationTimestamp(String verificationTimestamp) { this.verificationTimestamp = verificationTimestamp; }

    public String getFailureCategory() { return failureCategory; }
    public void setFailureCategory(String failureCategory) { this.failureCategory = failureCategory; }

    public String getExpectedHash() { return expectedHash; }
    public void setExpectedHash(String expectedHash) { this.expectedHash = expectedHash; }

    public String getObservedHash() { return observedHash; }
    public void setObservedHash(String observedHash) { this.observedHash = observedHash; }
}
