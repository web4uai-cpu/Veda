# DESIGN_SYSTEM.md

# VEDA Design System

Version: 1.0

Status: Authoritative Design Specification

Owner: Design Team

Priority: Critical

---

# Purpose

This document defines:

* Visual Identity
* Color System
* Typography
* Component Library
* Layout Rules
* Mobile Design
* Accessibility
* Knowledge Graph Visualization
* Dark Mode
* Interaction Standards

All interfaces must follow this design system.

---

# Design Philosophy

VEDA should feel like:

A living library of knowledge.

Not an AI chatbot.

Not a social network.

Not a productivity application.

The user should feel:

* Curiosity
* Calmness
* Trust
* Discovery
* Intellectual depth

---

# Brand Attributes

```text
Wise

Timeless

Elegant

Scholarly

Accessible

Trustworthy

Modern
```

---

# Visual Identity

Core Inspiration

```text
Ancient Manuscripts

Palm Leaf Texts

Temple Geometry

Library Archives

Knowledge Graphs

Modern Research Platforms
```

---

# Design Language

Keywords

```text
Minimal

Structured

Readable

Evidence-Based

Calm

Focused
```

---

# Color System

## Primary

VEDA Saffron

```text
#C97A24
```

Purpose

```text
Primary Actions

Highlights

Brand Elements
```

---

## Secondary

Deep Indigo

```text
#243B63
```

Purpose

```text
Knowledge Elements

Headers

Navigation
```

---

## Neutral Background

```text
#F8F5EF
```

---

## Surface

```text
#FFFFFF
```

---

## Text Primary

```text
#1F2937
```

---

## Text Secondary

```text
#6B7280
```

---

## Success

```text
#0F8A5F
```

---

## Warning

```text
#D97706
```

---

## Error

```text
#B91C1C
```

---

# Dark Mode

Background

```text
#111827
```

---

Surface

```text
#1F2937
```

---

Text

```text
#F9FAFB
```

---

Accent

```text
#D28D3A
```

---

# Color Usage Ratio

```text
70% Neutral

20% Indigo

10% Saffron
```

Avoid overusing accent colors.

---

# Typography

## English Font

Primary

```text
Inter
```

Fallback

```text
System Sans
```

---

## Sanskrit Font

Primary

```text
Noto Sans Devanagari
```

Fallback

```text
Mukta
```

---

## Serif Display Font

For scripture titles

```text
Cormorant Garamond
```

---

# Type Scale

Display

```text
48px
```

---

H1

```text
36px
```

---

H2

```text
30px
```

---

H3

```text
24px
```

---

Body

```text
16px
```

---

Caption

```text
14px
```

---

Footnote

```text
12px
```

---

# Sanskrit Rendering Rules

Always display:

```text
Sanskrit

↓

Transliteration

↓

Translation
```

Example

```text
आत्मा

Ātman

Self
```

Never mix these into one line.

---

# Layout Grid

Desktop

```text
12 Columns
```

---

Tablet

```text
8 Columns
```

---

Mobile

```text
4 Columns
```

---

Spacing System

```text
4

8

12

16

24

32

48

64
```

Only use scale values.

---

# Corner Radius

Small

```text
8px
```

---

Medium

```text
12px
```

---

Large

```text
16px
```

---

Cards

```text
20px
```

---

# Shadows

Subtle only.

Avoid heavy elevation.

---

Level 1

```text
Soft Surface Shadow
```

---

Level 2

```text
Floating Panel
```

---

No dramatic shadows.

---

# Icon System

Library

```text
Lucide Icons
```

---

Custom Icons

Required

```text
Scripture

Verse

Knowledge

Research

Graph

Commentary
```

---

# Core Component Library

## Button

Variants

```text
Primary

Secondary

Ghost

Danger
```

---

## Input

Used for:

```text
Search

Chat

Research
```

---

## Search Bar

Flagship Component

Always visible.

---

## Knowledge Card

Most important component.

Structure

```text
Title

Summary

Source

Related Concepts

Action
```

---

# Knowledge Card States

```text
Default

Expanded

Saved

Referenced
```

---

# Citation Card

Structure

```text
Source

Reference

Confidence

Open
```

---

# Verse Card

Structure

```text
Reference

Sanskrit

Translation

Commentary

Actions
```

---

# Concept Card

Structure

```text
Concept

Definition

Relationships

Sources
```

---

# Research Card

Structure

```text
Topic

Evidence Count

Sources

Status
```

---

# Navigation

Desktop

```text
Left Sidebar
```

Contains

```text
Explore

Scriptures

Knowledge Map

Research

Library
```

---

Mobile

Bottom Navigation

```text
Home

Explore

Ask

Library

Profile
```

---

# Knowledge Graph Visualization

Flagship Feature

---

Node Types

```text
Concept

Verse

Scripture

Person

Commentary

School
```

---

Node Shapes

```text
Concept = Circle

Scripture = Rectangle

Verse = Pill

Commentary = Hexagon

School = Diamond
```

---

Node Size

Based on:

```text
Importance

References

Popularity
```

---

Edge Types

```text
Explains

Related

Supports

Comments On
```

---

Knowledge Graph Visual Hierarchy

---

# Search Experience

Universal Search

Searches

```text
Concepts

Scriptures

Verses

Commentaries

Research

Uploads
```

---

Results Grouping

```text
Concepts

Scriptures

Verses

Commentaries

Uploads
```

---

# Chat Experience

Chat is not the primary UI.

Chat is a knowledge tool.

---

Answer Layout

```text
Summary

Sources

Graph Links

Related Concepts

Explore Further
```

---

# Research Workspace

Layout

```text
Question

↓

Evidence Panel

↓

Knowledge Graph

↓

Report Builder

↓

Export
```

---

# Upload Experience

Workflow

```text
Upload

↓

Processing

↓

Knowledge Extraction

↓

Graph Linking

↓

Results
```

---

Display

```text
Concepts Found

References Found

Relationships Found
```

---

# Accessibility

Required

```text
WCAG AA

Keyboard Navigation

Screen Readers

Color Contrast Compliance
```

---

# Motion System

Principle

Meaningful Motion Only

---

Allowed

```text
Expansion

Node Reveal

Loading State

Transition
```

---

Avoid

```text
Decorative Animation

Auto-Playing Motion
```

---

# Loading States

Use

```text
Skeletons
```

Not spinners.

---

# Empty States

Always guide exploration.

Example

```text
No saved notes yet.

Explore Bhagavad Gita →
```

---

# Mobile Rules

Priority

```text
Touch First
```

---

Minimum Touch Target

```text
44px
```

---

One-Handed Navigation

Required.

---

# Design Tokens

Future Export

```json
{
  "colors": {},
  "spacing": {},
  "radius": {},
  "typography": {}
}
```

Single source of truth.

---

# Anti-Patterns

Never Use

```text
Neon Colors

AI Gradients

Chat Bubble Overload

Infinite Scroll Walls

Hidden Citations

Tiny Sanskrit Text
```

---

# Visual North Star

When users open VEDA they should feel:

"I am entering a trusted library of living knowledge."

not

"I am chatting with an AI."

---

# Design Mission

The VEDA Design System exists to make profound knowledge approachable, trustworthy, and discoverable.

The interface should disappear behind the experience of learning.

Knowledge should feel connected.

Sources should feel visible.

Exploration should feel natural.

Wisdom should feel accessible.
