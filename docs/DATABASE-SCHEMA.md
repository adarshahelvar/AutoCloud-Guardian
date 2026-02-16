# 🗄 AutoCloud Guardian – Database Schema Design

## 1. Overview

AutoCloud Guardian uses MongoDB Atlas as its primary data store.

The database is designed to:

- Track incident lifecycle
- Store remediation actions
- Maintain audit logs
- Enable historical analysis
- Support horizontal scalability

The schema follows a document-oriented design aligned with event-driven architecture.

---

## 2. Core Collections

1. Incidents
2. RemediationActions
3. AuditLogs
4. Rules
5. SystemMetrics (optional future extension)

---

## 3. Incidents Collection

Represents infrastructure incidents detected by the system.

### Schema Structure

```json
{
  "_id": "ObjectId",
  "incidentId": "string",
  "source": "CloudWatch | EventBridge",
  "resourceId": "string",
  "resourceType": "EC2 | RDS | Service",
  "metricType": "CPU | Memory | Disk | Health",
  "metricValue": "number",
  "thresholdBreached": "number",
  "status": "OPEN | PROCESSING | RESOLVED | FAILED",
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "createdAt": "Date",
  "updatedAt": "Date",
  "resolvedAt": "Date"
}
