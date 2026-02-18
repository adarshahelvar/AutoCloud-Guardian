# 🧠 AutoCloud Guardian – System Design Document

## 1. System Design Overview
AutoCloud Guardian is designed as an event-driven, modular automation platform that transforms infrastructure monitoring into autonomous remediation.
The system acts as an intelligent control layer above cloud infrastructure, enabling automated detection, decision-making, and corrective execution.

---

## 2. Design Goals
The system is built with the following engineering objectives:
- High scalability
- Modular architecture
- Clear separation of concerns
- Secure cloud interaction
- Audit-grade logging
- Real-time operational visibility
- Extensible remediation logic

---

## 3. High-Level System Flow

```mermaid
flowchart LR
    A[Cloud Infrastructure Event] --> B[Incident Processor]
    B --> C[Rule Engine]
    C --> D[Remediation Executor]
    D --> E[AWS Infrastructure]
    D --> F[Logging Engine]
    F --> G[(MongoDB Atlas)]
    F --> H[WebSocket Broadcaster]
    H --> I[Admin Dashboard]
