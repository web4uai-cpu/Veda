# AUTH.md

# VEDA Authentication & Authorization Architecture

Version: 1.0

Status: Authoritative Identity Specification

Owner: Platform Security Team

Priority: Critical

---

# Purpose

This document defines:

* Authentication
* Authorization
* Session Management
* Identity Providers
* RBAC
* API Security
* Agent Authentication
* Service Authentication

This is the source of truth for all access control inside VEDA.

---

# Security Principles

1. Zero Trust

2. Least Privilege

3. Default Deny

4. Audit Everything

5. Verify Every Request

---

# Authentication Architecture

```text
User

↓

Identity Provider

↓

Auth Service

↓

JWT

↓

API Gateway

↓

Services
```

---

# Identity Providers

Supported

```text
Email + Password

Google

GitHub

Apple

Passkeys
```

Future

```text
Microsoft

LinkedIn

Institution Login
```

---

# Authentication Methods

## Email Authentication

Requirements

```text
Verified Email

Strong Password

MFA Optional
```

---

## OAuth Authentication

Supported

```text
Google

GitHub

Apple
```

---

## Passkeys

Preferred Method

Technology

```text
WebAuthn
```

---

# Session Model

Session Type

```text
JWT Access Token

Refresh Token
```

---

Access Token

```text
15 Minutes
```

---

Refresh Token

```text
30 Days
```

---

# Token Storage

Web

```text
HTTP Only Cookies
```

---

Mobile

```text
Secure Storage
```

---

Forbidden

```text
localStorage

sessionStorage
```

for auth tokens.

---

# JWT Claims

```json
{
  "sub":"",
  "email":"",
  "role":"",
  "permissions":[],
  "iat":0,
  "exp":0
}
```

---

# User Roles

## GUEST

Capabilities

```text
Browse Public Knowledge

Limited Search
```

---

## USER

Capabilities

```text
Ask VEDA

Bookmarks

Notes

Collections

Uploads
```

---

## SCHOLAR

Capabilities

```text
Research Mode

Advanced Exports

High Limits
```

---

## MODERATOR

Capabilities

```text
Review Content

Review Reports

Manage Flags
```

---

## ADMIN

Capabilities

```text
Full System Access
```

---

# Permission Model

Format

```text
resource:action
```

Examples

```text
research:create

research:export

upload:create

upload:delete

graph:read

admin:manage
```

---

# RBAC Matrix

USER

```text
graph:read

search:read

upload:create

note:create
```

---

SCHOLAR

```text
research:create

research:export

upload:create

graph:read
```

---

ADMIN

```text
*
```

---

# API Authentication

Header

```http
Authorization: Bearer TOKEN
```

Required For

```text
Chat

Research

Uploads

Bookmarks

Collections
```

---

# Public APIs

Allowed Without Login

```text
Public Search

Concept Pages

Scripture Pages
```

Read Only.

---

# Service Authentication

Technology

```text
mTLS
```

and

```text
Service JWT
```

---

Services Must Never Trust Network Location.

---

# Agent Authentication

Every agent execution requires:

```json
{
  "agent_id":"",
  "trace_id":"",
  "permissions":[]
}
```

---

# Upload Security

Checks

```text
Virus Scan

File Type Validation

Size Validation
```

---

Allowed Formats

```text
PDF

EPUB

DOCX

TXT

MD
```

---

# Password Policy

Minimum

```text
12 Characters
```

Requires

```text
Uppercase

Lowercase

Number

Special Character
```

---

# MFA

Optional For Users

Required For

```text
Moderator

Admin
```

---

# Audit Logging

Log

```text
Login

Logout

Role Change

Permission Change

Upload

Export
```

---

# Security Events

```text
LOGIN_SUCCESS

LOGIN_FAILED

TOKEN_REFRESHED

ROLE_CHANGED

ACCOUNT_LOCKED
```

---

# Account Protection

Failed Attempts

```text
5
```

---

Action

```text
Temporary Lock
```

Duration

```text
15 Minutes
```

---

# Data Privacy

Users can:

```text
Export Data

Delete Account

Delete Uploads
```

---

# Non-Negotiable Rules

1. All requests authenticated unless public.
2. No localStorage tokens.
3. JWT required.
4. MFA for privileged accounts.
5. Audit all sensitive actions.
6. Service-to-service authentication mandatory.
7. Principle of least privilege.

---

# Authentication Mission

The authentication system exists to protect knowledge, users, infrastructure, and trust while remaining frictionless for legitimate users.
