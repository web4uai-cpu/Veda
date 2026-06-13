# SRE_RUNBOOK.md

# VEDA Site Reliability Runbook

Version: 1.0

Status: Operational Standard

---

# Purpose

Provide repeatable operational procedures.

---

# Daily Checks

Verify:

* API Health
* Search Health
* Neo4j Health
* Qdrant Health
* PostgreSQL Health
* Agent Health

---

# Weekly Checks

Review:

* Error Rates
* Capacity
* Cost Trends
* Failed Jobs
* Security Alerts

---

# Monthly Checks

Review:

* Backup Restores
* Disaster Recovery
* Performance Trends
* Technical Debt

---

# Service Failure Procedure

1. Confirm incident.

2. Check dashboards.

3. Identify failing service.

4. Review logs.

5. Mitigate.

6. Escalate if required.

---

# Database Failure

Check:

* Replication
* Storage
* CPU
* Connections

---

# Search Failure

Check:

* OpenSearch Cluster
* Qdrant Cluster
* Index Status

---

# Agent Failure

Check:

* Queue Backlog
* Token Usage
* Timeouts
* Model Availability

---

# Escalation Matrix

L1

Platform Engineer

---

L2

Service Owner

---

L3

Architecture Team

---

# Reliability Targets

Availability

99.95%

---

Error Rate

<0.1%

---

Search Latency

<1 second
