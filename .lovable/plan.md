

# AI Honeypot Scam Detection Platform

A simulated intelligence-gathering system that detects scam messages, engages with realistic human personas, and extracts actionable scam intelligence.

---

## Overview

This platform will analyze incoming scam messages, automatically detect if they're scams, respond with a believable human persona to keep scammers engaged, and extract key intelligence like bank accounts, UPI IDs, and phishing links—all in a fully simulated environment.

---

## Core Features

### 1. Dashboard Home
- **Overview metrics**: Total conversations, scams detected, intelligence extracted
- **Recent activity feed** showing latest honeypot interactions
- **Quick stats** for scam confidence averages and extraction success rate

### 2. Mock Scammer API (Simulated Messages)
- **Automated scam message generator** covering:
  - Banking/Financial scams (fake KYC, account alerts)
  - Prize/Reward scams (lottery wins, inheritance claims)
  - Government/Legal scams (tax notices, arrest threats)
  - Employment scams (fake job offers requiring payment)
- **Manual message input** option for testing custom scenarios
- **Randomized scam templates** with realistic variations

### 3. Scam Detection Engine
- AI-powered analysis of each incoming message
- **Scam confidence scoring** (0.0 to 1.0)
- Detection of key indicators:
  - Urgency and threats
  - Prize/reward claims
  - Impersonation patterns
  - Payment/verification requests

### 4. Persona Simulation Engine
- AI generates realistic human responses (age 20-45, casual tone)
- Maintains conversation continuity across multiple turns
- Asks natural follow-up questions to extract information
- Never reveals AI identity or security intent

### 5. Intelligence Extraction & Display
- **Automatic parsing** of extracted data:
  - Bank account numbers
  - IFSC codes
  - UPI IDs
  - Phishing links
  - Phone numbers
  - Wallet addresses
- **Visual intelligence cards** showing extracted data
- **Conversation status tracking** (engaging, completed, terminated)

### 6. Conversation History
- Full thread view of all honeypot conversations
- Filterable by scam type, confidence level, extraction status
- Timestamp and conversation duration tracking

---

## Technical Approach

- **Lovable Cloud** for backend and database
- **Lovable AI** (Gemini) for scam detection and persona generation
- **Clean, professional UI** with a modern dashboard design
- **Real-time conversation updates** as the AI engages

---

## MVP Scope (Starting Simple)

**Phase 1 (Initial Build):**
- Dashboard with key metrics
- Mock scammer message simulator
- AI-powered scam detection with confidence scoring
- Persona response generation
- Intelligence extraction display
- Conversation history list

**Future Enhancements:**
- Advanced analytics and charts
- Export reports (CSV/JSON)
- Multiple simultaneous conversations
- Scam pattern recognition over time

