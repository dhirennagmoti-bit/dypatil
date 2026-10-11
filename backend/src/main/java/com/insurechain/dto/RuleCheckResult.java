package com.insurechain.dto;

public class RuleCheckResult {
    private String rule;
    private boolean passed;
    private String message;

    public RuleCheckResult() {}

    public RuleCheckResult(String rule, boolean passed, String message) {
        this.rule = rule;
        this.passed = passed;
        this.message = message;
    }

    public String getRule() { return rule; }
    public void setRule(String rule) { this.rule = rule; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
