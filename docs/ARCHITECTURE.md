# 🏗 AutoCloud Guardian – System Architecture

## 1. Architectural Overview
AutoCloud Guardian follows a modular, event-driven architecture designed for scalability, reliability, and extensibility.
The system acts as an autonomous remediation control layer on top of cloud infrastructure environments.

---

## 2. High-Level Architecture

```mermaid
flowchart LR
    A[Cloud Infrastructure Event<br/>CloudWatch / EventBridge] --> B[Incident Processor]
    B --> C[Rule Engine]
    C --> D[Remediation Executor]
    D --> E[AWS Services]
    D --> F[Logging Engine]
    F --> G[(MongoDB Atlas)]
    B --> G
    C --> G
    F --> H[WebSocket Broadcaster]
    H --> I[Admin Dashboard]
