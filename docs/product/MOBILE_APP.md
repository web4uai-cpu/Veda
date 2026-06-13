# MOBILE_APP.md

# VEDA Mobile Platform Architecture

Version: 1.0

Status: Authoritative Mobile Product Specification

Priority: Critical

Owner: Mobile Platform Team

---

# Purpose

Defines:

* Mobile Product Strategy
* Mobile UX
* React Native Architecture
* Offline Experience
* Push Notifications
* Knowledge Map Mobile Experience
* Scripture Reading Experience
* Performance Standards

This document governs Android and iOS development.

---

# Mobile Vision

VEDA Mobile is not a smaller website.

VEDA Mobile is a personal learning companion.

---

# Mobile Mission

Help users:

* Learn daily
* Read scriptures
* Explore concepts
* Save knowledge
* Conduct lightweight research
* Access knowledge offline

---

# Core Mobile Principles

## Principle 1

Mobile First Learning

---

Desktop

```text
Research
```

---

Mobile

```text
Learning
```

---

## Principle 2

Low Friction

Most actions require:

```text
1-3 taps
```

---

## Principle 3

Offline First

Knowledge should remain available.

---

## Principle 4

Progressive Discovery

Reveal knowledge gradually.

---

## Principle 5

One-Handed Use

All primary actions reachable with thumb.

---

# Technology Stack

Framework

```text
React Native
```

Preferred

```text
Expo
```

---

Language

```text
TypeScript
```

---

State Management

```text
Zustand
```

---

Server State

```text
TanStack Query
```

---

Storage

```text
SQLite
```

For offline content.

---

Authentication

```text
Biometrics

Face ID

Fingerprint
```

Supported.

---

# Navigation Architecture

Bottom Navigation

```text
Home

Explore

Ask

Library

Profile
```

---

Maximum

```text
5 Tabs
```

---

Avoid navigation complexity.

---

# Home Screen

Purpose

Daily engagement.

---

Components

```text
Daily Verse

Continue Reading

Continue Research

Recommended Concepts

Learning Progress
```

---

Flow

```text
Open App

↓

Daily Verse

↓

Explore Concept

↓

Knowledge Trail
```

---

# Explore Screen

Purpose

Discovery.

---

Contains

```text
Concept Search

Topics

Scriptures

Knowledge Trails

Schools
```

---

# Ask Screen

Purpose

AI interaction.

---

Flow

```text
Question

↓

Answer

↓

Sources

↓

Knowledge Trail

↓

Explore
```

---

Rule

AI answers must never be dead ends.

---

# Library Screen

Purpose

Personal knowledge.

---

Contains

```text
Bookmarks

Notes

Collections

Downloads

Research Reports
```

---

# Profile Screen

Contains

```text
Account

Settings

Downloads

Language

Notifications
```

---

# Scripture Reading Experience

Purpose

Primary reading experience.

---

Structure

```text
Scripture

↓

Chapter

↓

Verse

↓

Commentary

↓

Concept Links
```

---

# Reader Features

Support

```text
Dark Mode

Font Size

Line Height

Bookmarking

Highlighting
```

---

# Reading Modes

Mode 1

Reader

---

Mode 2

Study

---

Mode 3

Scholar

---

# Study Mode

Displays

```text
Verse

Translation

Commentary

Concepts

References
```

---

# Scholar Mode

Displays

```text
Multiple Translations

Commentaries

Graph Relationships

Citations
```

---

# Knowledge Map Mobile Experience

Desktop Graph

↓

Fails On Mobile

---

Mobile Uses

```text
Cards

Paths

Mini Graphs
```

---

# Knowledge Map Modes

## Mode 1

Concept Cards

Example

```text
Moksha

↓

Atman

↓

Brahman
```

---

## Mode 2

Path Explorer

Example

```text
Karma

↓

Dharma

↓

Atman

↓

Moksha
```

---

## Mode 3

Mini Graph

Small interactive graph.

---

Maximum Nodes

```text
20
```

Visible at once.

---

# Knowledge Trails

Purpose

Learning journeys.

---

Example

```text
Beginner Vedanta

↓

Atman

↓

Brahman

↓

Moksha
```

---

User may:

```text
Save

Download

Share
```

---

# Offline Architecture

Priority Content

```text
Saved Scriptures

Bookmarks

Notes

Collections

Knowledge Trails
```

---

Offline Database

```text
SQLite
```

---

Sync Strategy

```text
Offline

↓

Local Changes

↓

Sync Queue

↓

Server
```

---

# Downloadable Content

Supported

```text
Bhagavad Gita

Upanishads

Collections

Learning Paths
```

---

# Audio Experience

Future Phase

---

Support

```text
Verse Narration

Audiobooks

Daily Learning Audio
```

---

# Push Notifications

Purpose

Habit Formation.

---

Types

```text
Daily Verse

Learning Reminder

Research Ready

Upload Complete
```

---

Default

```text
1 Notification Daily
```

---

# Widgets

Android

Supported.

---

iOS

Supported.

---

Widgets

```text
Daily Verse

Saved Concept

Learning Streak
```

---

# Search Experience

Mobile Search

↓

Concept

↓

Knowledge Trail

↓

Explore

---

Avoid overwhelming result lists.

---

# Upload Experience

Supported

```text
PDF

EPUB

DOCX
```

---

Flow

```text
Upload

↓

Processing

↓

Concept Extraction

↓

Knowledge Linking
```

---

# Research Workspace

Lightweight Version.

---

Desktop

```text
Full Research
```

---

Mobile

```text
Research Review
```

---

# Accessibility

Required

WCAG AA

---

Support

```text
Screen Readers

Large Fonts

High Contrast
```

---

# Languages

Phase 1

```text
English
```

---

Phase 2

```text
Sanskrit

Hindi
```

---

Phase 3

```text
Tamil

Telugu

Kannada

Malayalam

Bengali

Odia
```

---

# Performance Targets

Cold Start

```text
<2 Seconds
```

---

Navigation

```text
<200ms
```

---

Search

```text
<1 Second
```

---

Knowledge Map

```text
<1 Second
```

Expansion.

---

# Mobile Analytics

Track

```text
Daily Active Users

Learning Streaks

Knowledge Trail Usage

Scripture Reading Time

Offline Usage
```

---

# Anti-Patterns

Avoid

```text
Desktop Graphs

Tiny Nodes

Complex Menus

Deep Navigation

Infinite Screens
```

---

# Success Metrics

Daily Learning Completion

```text
40%+
```

---

Knowledge Trail Completion

```text
30%+
```

---

Offline Usage

```text
20%+
```

---

7-Day Retention

```text
50%+
```

---

# North Star Experience

A user opens VEDA on a phone.

Within 30 seconds they can:

```text
Read a Verse

Understand a Concept

Explore Relationships

Save Knowledge

Continue Learning
```

with minimal friction.

---

# Mobile Mission

The mobile application exists to make Sanatan knowledge accessible anywhere, anytime, even without connectivity.

Desktop helps users research.

Mobile helps users build a lifelong learning practice.
