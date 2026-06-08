# CITATION_ENGINE.md

# VEDA Citation Engine Architecture

Version: 1.0

Status: Authoritative Citation Specification

Owner: Knowledge Integrity Team

---

# Purpose

The Citation Engine is the trust layer of VEDA.

Its mission is to ensure that every answer, explanation, comparison, report, and recommendation is:

* Traceable
* Verifiable
* Source-backed
* Confidence-scored
* Resistant to hallucination

The Citation Engine is the final authority before information is shown to users.

---

# Core Philosophy

Most AI Systems

```text
Question

↓

LLM

↓

Answer
```

---

VEDA

```text
Question

↓

Retrieval

↓

Evidence

↓

Citation Validation

↓

Reasoning

↓

Answer
```

---

Truth comes from sources.

Not from models.

---

# Design Principles

## Principle 1

Every Claim Must Have Evidence

Unsupported claims are rejected.

---

## Principle 2

Primary Sources First

Priority Order

```text
1 Canonical Scripture

2 Traditional Commentary

3 Verified Scholarly Sources

4 User Uploads

5 AI Generated Content
```

---

## Principle 3

Citation Before Generation

Evidence must exist before reasoning.

---

## Principle 4

Traceability

Every answer must be traceable back to original source material.

---

## Principle 5

Confidence Transparency

Users must know how trustworthy an answer is.

---

# Citation Engine Architecture

```text
User Query

↓

Retrieval Layer

↓

Evidence Packets

↓

Citation Engine

↓

Validation

↓

Confidence Scoring

↓

Approval

↓

Response Composer
```

---

# Core Components

## Citation Resolver

Purpose

Convert references into canonical citations.

Example

Input

```text
BG 2.47
```

Output

```json
{
  "reference":"BG.2.47",
  "scripture":"Bhagavad Gita",
  "chapter":2,
  "verse":47
}
```

---

## Citation Validator

Purpose

Verify references exist.

Checks

```text
Reference Exists

Scripture Exists

Verse Exists

Source Available
```

---

## Evidence Matcher

Purpose

Verify claim-to-source alignment.

---

Input

Claim

```text
Moksha is liberation.
```

---

Output

```text
Supported

Weakly Supported

Unsupported
```

---

## Confidence Engine

Purpose

Calculate reliability score.

Range

```text
0.00 – 1.00
```

---

## Hallucination Detector

Purpose

Detect unsupported statements.

---

## Citation Formatter

Purpose

Generate user-visible citations.

---

# Citation Object

Canonical Structure

```json
{
  "citation_id":"",
  "source_type":"scripture",
  "source_name":"Bhagavad Gita",
  "reference":"BG.2.47",
  "chapter":2,
  "verse":47,
  "confidence":0.98
}
```

---

# Source Types

Supported

```text
SCRIPTURE

COMMENTARY

SCHOLARLY_SOURCE

UPLOAD

AI_NOTE
```

---

# Canonical Source Model

Example

```json
{
  "id":"vrs_123",
  "source_type":"SCRIPTURE",
  "scripture":"Bhagavad Gita",
  "chapter":2,
  "verse":47
}
```

---

# Evidence Packet

The Citation Engine never reads raw retrieval.

It consumes evidence packets.

Schema

```json
{
  "packet_id":"",
  "source_id":"",
  "content":"",
  "score":0.92,
  "source_type":"SCRIPTURE"
}
```

---

# Evidence Levels

## Level A

Direct Evidence

Exact verse supports claim.

Score

```text
1.0
```

---

## Level B

Strong Evidence

Multiple supporting sources.

Score

```text
0.8–0.99
```

---

## Level C

Indirect Evidence

Inference required.

Score

```text
0.6–0.79
```

---

## Level D

Weak Evidence

Interpretation only.

Score

```text
0.4–0.59
```

---

## Level E

Unsupported

Reject.

Score

```text
0.0–0.39
```

---

# Confidence Formula

Final Confidence

```text
(
Source Quality × 0.40
)
+
(
Retrieval Score × 0.20
)
+
(
Graph Agreement × 0.15
)
+
(
Agent Agreement × 0.15
)
+
(
Citation Strength × 0.10
)
```

---

# Source Quality Scores

```text
Canonical Scripture      1.00

Traditional Commentary   0.90

Scholarly Source         0.80

User Upload              0.50

AI Generated Note        0.20
```

---

# Claim Verification

Pipeline

```text
Claim

↓

Extract Concepts

↓

Find Sources

↓

Match Evidence

↓

Score Confidence

↓

Approve/Reject
```

---

# Claim Categories

## Factual

Example

```text
Bhagavad Gita contains 18 chapters.
```

Requires direct source.

---

## Conceptual

Example

```text
Moksha refers to liberation.
```

Requires scripture support.

---

## Interpretive

Example

```text
Advaita views Atman and Brahman as identical.
```

Requires commentary support.

---

## Comparative

Example

```text
Advaita differs from Dvaita.
```

Requires multiple sources.

---

# Hallucination Detection

Triggers

---

Reference Not Found

---

Verse Does Not Exist

---

Source Missing

---

Citation Mismatch

---

Invented Commentary

---

Invalid Sanskrit

---

Action

```text
BLOCK RESPONSE
```

---

# Response Approval Rules

Rule 1

No Source

↓

Reject

---

Rule 2

Invalid Citation

↓

Reject

---

Rule 3

Confidence Below 0.60

↓

Flag Uncertainty

---

Rule 4

Conflicting Evidence

↓

Show Multiple Views

---

# Multi-Agent Validation

Each agent submits citations.

Example

```json
{
  "agent":"upanishad_agent",
  "citations":[]
}
```

---

Citation Agent verifies independently.

---

Agent citations are never trusted automatically.

---

# User Upload Citations

Format

```json
{
  "source_type":"UPLOAD",
  "upload_id":"",
  "page":23
}
```

---

Special Rule

Uploads cannot override canonical scripture.

---

# Citation Display Modes

## Standard Mode

```text
Answer

Sources

Confidence
```

---

## Scholar Mode

```text
Answer

Verse

Original Sanskrit

Commentary

Sources

Confidence
```

---

## Research Mode

```text
Executive Summary

Evidence Table

Source Matrix

Confidence Analysis
```

---

# Citation Ranking

Priority

```text
Canonical Scripture

↓

Commentary

↓

Scholar Sources

↓

Uploads
```

---

# Citation Storage

PostgreSQL

Table

```sql
citations
```

Fields

```sql
id

source_id

source_type

reference

confidence

created_at
```

---

# Audit Logging

Every citation decision stored.

Example

```json
{
  "request_id":"",
  "claim":"",
  "decision":"approved",
  "confidence":0.91
}
```

---

# Citation Metrics

Track

```text
Citation Accuracy

Citation Coverage

False Citation Rate

Unsupported Claim Rate

Hallucination Rate
```

---

# Service Level Objectives

Citation Accuracy

```text
> 99%
```

---

Unsupported Claims

```text
< 0.5%
```

---

Hallucination Rate

```text
Near Zero
```

---

# Failure Modes

## Missing Citation

Action

```text
Block Claim
```

---

## Missing Verse

Action

```text
Reject Reference
```

---

## Retrieval Failure

Action

```text
Return Uncertainty
```

---

## Agent Disagreement

Action

```text
Require Multiple Perspectives
```

---

# Future Enhancements

Planned

* Manuscript Citation Support
* Academic Citation Formats
* Verse Similarity Citation
* Cross-Scripture Citation Graph
* Citation Explainability Dashboard
* Community Citation Verification

---

# Non-Negotiable Rules

1. No source, no claim.

2. No citation, no answer.

3. Canonical scripture outranks commentary.

4. Commentary outranks interpretation.

5. User uploads never override scripture.

6. AI generated content is never treated as evidence.

7. Confidence must be visible.

8. Every answer must be traceable.

9. Every citation must be verifiable.

10. The Citation Engine has veto authority over the response.

---

# Citation Mission

The Citation Engine exists to guarantee that every piece of knowledge delivered by VEDA can be traced to evidence, verified by sources, scored for confidence, and inspected by users.

It is the trust infrastructure of the platform.

Knowledge creates understanding.

Citations create trust.

Trust creates authority.
