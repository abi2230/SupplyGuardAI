# TRACK_ID=PS08

# 🚨 SupplyGuard AI

### Intelligent Supply Chain Disruption Response Assistant
live demo link:https://supply-guard-ai-neon.vercel.app/

> **From disruption alerts to evidence-based decisions.**

SupplyGuard AI is an AI-powered supply chain decision-support platform that helps distributors understand the real impact of unexpected disruptions and respond faster with transparent, evidence-backed recommendations.

When a supplier stops production, a shipment gets delayed, or a warehouse faces an incident, the impact is rarely limited to one item. A single disruption can affect inventory, shipments, customer orders, delivery dates, and revenue.

**SupplyGuard AI connects these relationships automatically and turns an unstructured disruption notice into a clear, actionable impact assessment.**

---

## 🎯 Problem Statement

Supply-chain disruptions often arrive as unstructured emails, carrier notifications, or warehouse incident reports.

The difficult part is not simply detecting the disruption.

The real challenge is determining:

* Which supplier is affected?
* Which shipments are connected?
* Which products are at risk?
* Which warehouses are impacted?
* Which customer orders will be delayed?
* How much inventory is available?
* Which customers should be prioritized?
* What action should the operations team take?
* What evidence supports that recommendation?

SupplyGuard AI is designed to answer these questions in a single intelligent workflow.

---

# 💡 Our Solution

SupplyGuard AI combines **Generative AI, structured supply-chain data, deterministic business logic, relationship mapping, and evidence-based reasoning**.

### The workflow:

```text
Disruption Notice
       ↓
AI Understanding
       ↓
Entity Extraction
       ↓
Supplier / Shipment Matching
       ↓
Inventory Analysis
       ↓
Impact Tracing
       ↓
Affected Orders
       ↓
Response Options
       ↓
Evidence-Based Recommendation
       ↓
Human Decision
```

The system does not blindly trust AI output.

Instead, AI is used for understanding and reasoning, while critical calculations and business relationships are handled through deterministic application logic.

---

# 🚀 Key Features

## 🤖 1. AI Disruption Analyzer

Users can enter a supplier or carrier disruption notice in natural language.

The system identifies:

* Disruption type
* Supplier
* Product
* Shipment
* Expected delay
* Relevant entities
* Missing information
* Potential impact

The AI does not assume missing information.

If an entity cannot be confidently matched, the system requests clarification or escalates the case.

---

## 🔗 2. Supply Chain Impact Graph

SupplyGuard AI visualizes the complete relationship between:

```text
Supplier
   ↓
Shipment
   ↓
Warehouse
   ↓
Inventory
   ↓
Customer Order
   ↓
Customer
```

This allows an operations manager to understand the impact of a disruption at a glance.

Selecting a node reveals the underlying record and its relationship to the disruption.

---

## 📦 3. Inventory Risk Intelligence

The platform evaluates inventory availability and identifies products that may run out before the disrupted shipment arrives.

Key indicators include:

* Available inventory
* Reserved inventory
* Daily demand
* Days of inventory remaining
* Reorder level
* Incoming shipment
* Stock-out risk

### Example

```text
Product: P-104

Available Stock     : 35 units
Daily Demand        : 12 units
Days Remaining      : 2.9 days
Incoming Shipment   : Delayed 7 days

Risk                : 🔴 HIGH
```

---

## 🚚 4. Shipment Impact Analysis

The system identifies shipments affected by a disruption and compares:

* Original ETA
* Updated ETA
* Delay duration
* Product quantity
* Destination
* Connected customer orders

This helps operations teams understand exactly what the disruption changes.

---

# 👥 5. Affected Customer Orders

SupplyGuard AI traces disrupted inventory to customer orders.

The system highlights:

* Order ID
* Customer
* Product
* Quantity
* Required date
* Current ETA
* Revised ETA
* Days delayed
* Priority
* Revenue impact

Orders can be filtered and prioritized so the operations team knows **what needs attention first**.

---

# 💰 6. Business Impact Assessment

The platform provides an executive-level impact summary.

### Example:

```text
🚨 Critical Disruption

3 Shipments Affected
420 Units at Risk
28 Customer Orders Affected
₹4.8L Revenue at Risk
7 Days Maximum Delay
```

All important figures are calculated from the underlying application data.

---

# 🧠 7. AI Response Planner

SupplyGuard AI does not simply say:

> “Take action.”

Instead, it compares multiple possible strategies.

### Example:

| Strategy             |    Cost |  Delay | Customer Impact | Risk   |
| -------------------- | ------: | -----: | --------------- | ------ |
| Expedite Shipment    | ₹35,000 |  1 day | Low             | Low    |
| Reallocate Inventory | ₹12,000 | 2 days | Medium          | Medium |
| Part-Ship Orders     |  ₹8,000 | 3 days | Medium          | Medium |
| Notify Customers     |     Low | Higher | High            | High   |

The system explains the advantages, disadvantages, assumptions, and expected impact of each option.

---

# 💡 8. Explainable AI Recommendation

After comparing available strategies, the system generates an evidence-backed recommendation.

### Example:

> **Recommended Action:** Reallocate available inventory from Warehouse B and expedite the delayed shipment.

### Why?

Because Warehouse B has sufficient available inventory while Warehouse A is projected to reach a stock-out before the delayed shipment arrives.

The recommendation is based on the actual inventory, shipment, demand, and order records.

---

# 🔍 9. Evidence & Traceability

One of the core principles of SupplyGuard AI is:

> **No important claim without evidence.**

Every major finding can be traced back to the underlying records.

Example:

```text
Finding:
Order ORD-5821 is likely to be delayed.

Evidence:
→ Shipment S-204
→ Product P-104
→ Original ETA: September 10
→ Updated ETA: September 17
→ Required Delivery: September 12
```

This makes the system more transparent and easier for human operators to trust.

---

# 🧪 10. What-If Analysis

Operations teams can compare possible decisions before taking action.

Example:

### What if we expedite?

→ Higher cost
→ Lower customer delay
→ Lower stock-out risk

### What if we reallocate?

→ Lower cost
→ Uses existing inventory
→ May affect another warehouse

### What if we do nothing?

→ Higher stock-out probability
→ More customer orders delayed
→ Higher revenue exposure

This converts the system from a simple alert dashboard into a **decision-support platform**.

---

# ⚠️ 11. Human-in-the-Loop

SupplyGuard AI is designed to **assist humans, not replace them**.

The system recommends actions but does not automatically execute them.

When information is incomplete, ambiguous, or outside the available knowledge, the system displays:

### ⚠️ HUMAN REVIEW REQUIRED

The operations manager can:

* Approve recommendation
* Modify recommendation
* Escalate the case
* Request additional information

This prevents the system from making unsupported business decisions.

---

# 🟢 12. No-Impact Detection

Not every disruption creates an actual business impact.

SupplyGuard AI can identify situations where a disruption exists but no active business dependency is affected.

Example:

```text
Disruption Detected

Supplier Beta
Product P-999

Current Impact:
No active shipment
No inventory shortage
No affected customer orders

Result:
🟢 NO CURRENT BUSINESS IMPACT
```

Instead of forcing an alarming conclusion, the system reports the evidence honestly.

---

# 🎭 13. Demo Scenario Center

SupplyGuard AI includes multiple scenarios for demonstration and testing.

### Scenario 01 — Major Supplier Failure

Multiple shipments, inventory records, and customer orders are affected.

### Scenario 02 — Carrier Delay

A shipment is delayed but available inventory can temporarily absorb the disruption.

### Scenario 03 — Warehouse Incident

Inventory becomes unavailable at one warehouse.

### Scenario 04 — No Current Impact

A disruption exists but does not affect active business operations.

### Scenario 05 — Ambiguous Notice

The disruption does not contain enough information and requires human verification.

These scenarios demonstrate both **normal and difficult cases**.

---

# 📊 14. Analytics Dashboard

The analytics module provides a high-level view of supply-chain risk.

It can display:

* Disruptions by type
* Shipment delays
* Inventory risk
* Orders affected
* Supplier performance
* Revenue at risk
* Response strategy distribution

This allows managers to move from individual incidents to broader operational insights.

---

# 💬 15. AI Operations Copilot

SupplyGuard AI includes a conversational assistant for operations teams.

Users can ask:

> Which orders are most urgent?

> Which products will stock out first?

> Why did you recommend reallocation?

> What happens if we don't expedite?

> Which warehouse has replacement stock?

> Show me the evidence behind this recommendation.

The assistant answers using the application's available data.

If the data cannot answer a question, it clearly states that sufficient information is unavailable instead of inventing an answer.

---

# 🏗️ System Architecture

```text
                  ┌─────────────────────┐
                  │   User / Operator   │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   Web Dashboard     │
                  │  Analytics + Graph  │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    Python Backend   │
                  └──────────┬──────────┘
                             │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
      ┌────────────┐ ┌──────────────┐ ┌──────────────┐
      │ Gemini AI  │ │ Business     │ │ Data Layer   │
      │ Reasoning  │ │ Logic        │ │ SQLite       │
      └────────────┘ └──────────────┘ └──────────────┘
             │               │                │
             └───────────────┼────────────────┘
                             ▼
                  ┌─────────────────────┐
                  │ Impact Assessment   │
                  │ + Evidence Engine   │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Response Planner    │
                  │ Human Decision      │
                  └─────────────────────┘
```

---

# 🧠 AI vs Deterministic Logic

A key engineering decision in SupplyGuard AI is separating AI reasoning from deterministic computation.

### Gemini AI handles:

* Understanding unstructured disruption notices
* Extracting entities
* Interpreting natural language
* Explaining findings
* Comparing response strategies
* Generating recommendations

### Application logic handles:

* Inventory calculations
* Days-of-inventory calculation
* Shipment matching
* Order impact calculation
* Revenue calculations
* Relationship mapping
* Priority calculation
* Data validation

This architecture improves reliability and reduces hallucination risk.

---

# 🛠️ Technology Stack

### Backend

* Python
* FastAPI / Flask
* SQLite

### AI

* Google Gemini API
* Gemini embeddings where required
* Evidence-grounded retrieval

### Frontend

* HTML
* CSS
* JavaScript
* Interactive charts
* Interactive relationship visualization

### Data

* Suppliers
* Products
* Warehouses
* Inventory
* Shipments
* Orders
* Customers

---

# 📁 Project Structure

```text
SupplyGuard-AI/
│
├── app.py
├── requirements.txt
├── README.md
│
├── data/
│   ├── suppliers.json
│   ├── products.json
│   ├── inventory.json
│   ├── shipments.json
│   ├── orders.json
│   └── customers.json
│
├── documents/
│   └── disruption_scenarios/
│
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── analyzer.html
│   ├── impact.html
│   ├── orders.html
│   ├── inventory.html
│   ├── response.html
│   └── analytics.html
│
└── static/
    ├── css/
    └── js/
```

---

# ⚙️ Installation & Setup

Clone the repository and install the dependencies:

```bash
pip install -r requirements.txt
```

Set the Gemini API key:

```text
GEMINI_API_KEY=your_api_key
```

Then start the complete application:

```bash
python app.py
```

Open:

```text
http://localhost:8000
```

The backend and frontend are served together from a single application.

---

# 🔐 Security

* API keys are stored using environment variables.
* Secrets are never hardcoded.
* API keys are never committed to GitHub.
* AI responses are constrained by available application data.
* Unsupported or ambiguous cases are escalated instead of guessed.

---

# 🎥 Demo

### Live Demo

**Coming Soon**

### Demo Video

**Coming Soon**

The demonstration will cover:

1. Normal disruption
2. Impact tracing
3. Inventory risk
4. Affected customer orders
5. Response comparison
6. AI recommendation
7. Evidence traceability
8. Difficult / ambiguous case
9. No-impact scenario
10. Human escalation

---

# 🏆 Why SupplyGuard AI?

SupplyGuard AI is not designed as another generic chatbot.

It focuses on the real operational question:

> **“A disruption happened. What does it actually affect, what can we do, and why?”**

The platform combines:

**Generative AI + Structured Data + Relationship Mapping + Deterministic Logic + Evidence + Explainability + Human Oversight**

This makes the solution useful for real-world supply-chain operations while keeping critical decisions under human control.

---

# 🌟 Innovation Highlights

### 🔗 Impact Intelligence

Automatically traces disruptions through the supply-chain dependency network.

### 🧠 Evidence-First AI

AI recommendations are grounded in actual business records.

### 📊 Decision Intelligence

Transforms raw disruption information into actionable response strategies.

### 🧪 What-If Simulation

Allows operators to compare possible decisions before acting.

### ⚠️ Responsible AI

Uncertain cases are escalated rather than guessed.

### 🟢 No-Impact Awareness

The system can correctly determine when a disruption has no current business impact.

---

# 👩‍💻 Developed By

## **ABISHNA K.**

### Designed & Developed by ABISHNA K.

**NexusTiq24 Hackathon — Supply Chain Intelligence**

---

# 📌 Track Information

**TRACK_ID: PS08**

**Track:** Supply Chain – Disruption Response Assistant

**Project:** SupplyGuard AI

---

## 🚀 Vision

SupplyGuard AI aims to transform supply-chain disruption management from a reactive process into an **intelligent, transparent, and evidence-driven decision workflow**.

> **Detect the disruption.
> Trace the impact.
> Compare the options.
> Make the right decision.**





developed by ABISHNA.K
