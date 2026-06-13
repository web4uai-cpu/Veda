# APP_FLOW.md

# VEDA Application Flow Architecture

Version: 1.0

Status: Authoritative User Journey Specification

Priority: Critical

Owner: Product Team

---

# Purpose

This document defines:

* User Journeys
* Navigation Logic
* Screen Transitions
* Entry Points
* Discovery Paths
* Research Workflows
* Learning Workflows

This is the master blueprint for how users move through VEDA.

---

# Core Philosophy

Traditional Apps

```text
Search

↓

Answer

↓

Exit
```

VEDA

```text
Search

↓

Answer

↓

Explore

↓

Learn

↓

Research

↓

Preserve
```

---

# User Types

## Explorer

Goal

Discover concepts.

---

## Learner

Goal

Understand scriptures.

---

## Practitioner

Goal

Daily study.

---

## Scholar

Goal

Research and analysis.

---

## Researcher

Goal

Knowledge synthesis.

---

# Global Navigation

Desktop

```text
Home

Explore

Ask

Scriptures

Knowledge Map

Research

Library

Profile
```

---

Mobile

```text
Home

Explore

Ask

Library

Profile
```

---

# Entry Points

Users can begin from:

```text
Home

Search

Chat

Scripture

Concept

Knowledge Map

Upload

Research
```

---

# Home Flow

Purpose

Personalized starting point.

---

Flow

```text
Home

↓

Daily Verse

↓

Related Concepts

↓

Knowledge Map

↓

Scripture

↓

Save
```

---

# Search Flow

Purpose

Fast discovery.

---

Flow

```text
Search

↓

Results

↓

Concept

↓

Knowledge Map

↓

Research
```

---

Rule

Search should never terminate at results.

---

# Ask VEDA Flow

Purpose

AI-guided understanding.

---

Flow

```text
Ask Question

↓

Answer

↓

Sources

↓

Related Concepts

↓

Knowledge Map

↓

Research
```

---

Example

```text
What is Moksha?

↓

Answer

↓

Atman

↓

Brahman

↓

Vedanta

↓

Katha Upanishad
```

---

# Concept Discovery Flow

Purpose

Explore ideas.

---

Flow

```text
Concept

↓

Definition

↓

Scriptural Sources

↓

Related Concepts

↓

Knowledge Map

↓

Research
```

---

Example

```text
Moksha

↓

Atman

↓

Brahman

↓

Advaita

↓

Upanishads
```

---

# Scripture Reading Flow

Purpose

Deep study.

---

Flow

```text
Scripture

↓

Chapter

↓

Verse

↓

Commentary

↓

Concepts

↓

Knowledge Map
```

---

Example

```text
BG 2.47

↓

Karma

↓

Dharma

↓

Yoga
```

---

# Verse Study Flow

Purpose

Verse-centric exploration.

---

Flow

```text
Verse

↓

Translation

↓

Commentary

↓

Related Concepts

↓

Knowledge Map

↓

Research
```

---

# Knowledge Map Flow

Purpose

Non-linear discovery.

---

Flow

```text
Node

↓

Relationships

↓

Expand

↓

Related Nodes

↓

Sources

↓

Research
```

---

Example

```text
Atman

↓

Brahman

↓

Moksha

↓

Vedanta

↓

Upanishads
```

---

# Research Flow

Purpose

Scholar-grade analysis.

---

Flow

```text
Research Question

↓

Evidence

↓

Knowledge Graph

↓

Comparative Analysis

↓

Report

↓

Export
```

---

# Scholar Mode Flow

Purpose

Advanced study.

---

Flow

```text
Concept

↓

Scripture

↓

Commentary

↓

Interpretations

↓

Research
```

---

# Comparative Philosophy Flow

Purpose

Compare traditions.

---

Flow

```text
Select Concepts

↓

Select Schools

↓

Evidence Matrix

↓

Comparison

↓

Report
```

---

Example

```text
Advaita

vs

Dvaita
```

---

# Learning Path Flow

Purpose

Structured learning.

---

Flow

```text
Beginner Topic

↓

Lesson

↓

Concept

↓

Scripture

↓

Quiz

↓

Next Lesson
```

---

# Beginner Journey

Day 1

```text
Dharma
```

↓

Day 2

```text
Karma
```

↓

Day 3

```text
Atman
```

↓

Day 4

```text
Moksha
```

---

# Daily Learning Flow

Purpose

Habit formation.

---

Flow

```text
Daily Verse

↓

Explanation

↓

Related Concepts

↓

Knowledge Trail

↓

Bookmark
```

---

# Upload Flow

Purpose

Personal knowledge integration.

---

Flow

```text
Upload

↓

Processing

↓

Concept Extraction

↓

Reference Detection

↓

Graph Linking

↓

Personal Knowledge Map
```

---

# Upload Research Flow

Purpose

Connect uploads to scripture.

---

Flow

```text
Upload

↓

Extract Concepts

↓

Match Concepts

↓

Find Scriptures

↓

Create Report
```

---

# Personal Library Flow

Purpose

Knowledge preservation.

---

Flow

```text
Bookmarks

↓

Collections

↓

Notes

↓

Research Reports
```

---

# Collection Flow

Purpose

Organized study.

---

Flow

```text
Create Collection

↓

Add Concepts

↓

Add Verses

↓

Add Research

↓

Save
```

---

# Bookmark Flow

Purpose

Quick retrieval.

---

Flow

```text
Bookmark

↓

Library

↓

Reopen

↓

Continue Learning
```

---

# Citation Flow

Purpose

Trust verification.

---

Flow

```text
Answer

↓

Citation

↓

Source

↓

Verse

↓

Context
```

---

Every claim must be traceable.

---

# Knowledge Trail Flow

Purpose

Guided exploration.

---

Example

```text
Karma

↓

Dharma

↓

Atman

↓

Moksha

↓

Vedanta
```

---

User may:

```text
Save

Share

Research
```

---

# Research Workspace Flow

Purpose

Knowledge synthesis.

---

Flow

```text
Question

↓

Evidence

↓

Graph

↓

Draft Report

↓

Review Sources

↓

Export
```

---

# Mobile Flow

Home

↓

Concept

↓

Knowledge Trail

↓

Save

---

Mobile should minimize typing.

---

# Empty State Flows

No Notes

↓

Suggested Concepts

---

No Uploads

↓

Upload Guide

---

No Research

↓

Research Templates

---

# Return User Flow

Purpose

Continue progress.

---

Flow

```text
Home

↓

Continue Reading

↓

Continue Research

↓

Recent Concepts
```

---

# Notifications Flow

Purpose

Re-engagement.

---

Examples

```text
Daily Verse

Learning Reminder

Research Completed

Upload Processed
```

---

# Dead-End Prevention Rules

Never allow:

```text
Answer

↓

Stop
```

---

Always provide:

```text
Related Concepts

Knowledge Map

Research Path

Save Option
```

---

# Success Metrics

Target

Users discover:

```text
5+
```

new concepts per session.

---

Average Exploration Depth

```text
4+
```

---

Research Conversion Rate

```text
20%+
```

---

Knowledge Map Engagement

```text
50%+
```

---

# North Star Journey

User asks:

```text
What is Moksha?
```

System guides:

```text
Moksha

↓

Atman

↓

Brahman

↓

Katha Upanishad

↓

Advaita

↓

Research Report

↓

Saved Collection
```

without requiring additional searches.

---

# Application Mission

VEDA is not designed to answer questions.

VEDA is designed to guide users from curiosity to understanding.

Every screen should open a new path.

Every path should deepen knowledge.

Every interaction should move the user closer to wisdom.
