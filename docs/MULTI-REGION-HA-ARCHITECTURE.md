# 🏢 AutoCloud Guardian – Multi-Region High Availability Architecture

## 1. Objective

To ensure high availability, fault tolerance, and minimal downtime, AutoCloud Guardian can be deployed in a multi-region active-active architecture.

This design prevents:

- Regional outages  
- Single point of failure  
- Infrastructure downtime impact  

---

## 2. Multi-Region Architecture Diagram

```mermaid
flowchart TB
    User --> Route53
    Route53 --> ALB1
    Route53 --> ALB2

    subgraph Region_A
        ALB1 --> ECS1
        ECS1 --> MongoA[(MongoDB Primary)]
    end

    subgraph Region_B
        ALB2 --> ECS2
        ECS2 --> MongoB[(MongoDB Replica)]
    end

    MongoA --> MongoB
