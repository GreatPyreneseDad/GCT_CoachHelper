# GCT CoachHelper Data Model

## Overview
This document defines the database schema, relationships, and data architecture for the GCT CoachHelper application.

---

## Core Entities

### Users
```sql
users {
  id: UUID (PK)
  email: String (unique, not null)
  password_hash: String (not null)
  role: Enum['coach', 'client', 'admin']
  created_at: Timestamp
  updated_at: Timestamp
  last_login: Timestamp
  is_active: Boolean
  email_verified: Boolean
  two_factor_enabled: Boolean
}
```

### Coaches
```sql
coaches {
  id: UUID (PK)
  user_id: UUID (FK -> users.id)
  practice_name: String
  coaching_focus: String
  certifications: JSON
  years_experience: Integer
  typical_client_journey: Enum['1-3mo', '3-6mo', '6-12mo', 'ongoing']
  coaching_style: JSON
  preferred_dimensions: Array[String]
  timezone: String
  availability: JSON
  stripe_account_id: String
  subscription_tier: Enum['free', 'professional', 'enterprise']
  subscription_status: Enum['active', 'cancelled', 'past_due']
  created_at: Timestamp
}
```

### Clients
```sql
clients {
  id: UUID (PK)
  user_id: UUID (FK -> users.id)
  coach_id: UUID (FK -> coaches.id)
  first_name: String (not null)
  last_name: String (not null)
  phone: String
  emergency_contact: JSON
  coaching_focus: String
  goals: JSON
  preferences: JSON
  status: Enum['active', 'paused', 'completed', 'archived']
  start_date: Date
  end_date: Date
  notes: Text (encrypted)
  created_at: Timestamp
  updated_at: Timestamp
}
```

### Assessments
```sql
assessments {
  id: UUID (PK)
  client_id: UUID (FK -> clients.id)
  type: Enum['initial', 'quick', 'deep_dive', 'custom']
  dimension_focus: String (nullable)
  status: Enum['draft', 'in_progress', 'completed']
  started_at: Timestamp
  completed_at: Timestamp
  time_spent_seconds: Integer
  created_at: Timestamp
}
```

### Assessment Responses
```sql
assessment_responses {
  id: UUID (PK)
  assessment_id: UUID (FK -> assessments.id)
  question_id: UUID (FK -> questions.id)
  response_value: JSON
  response_text: Text
  score: Decimal(3,2)
  created_at: Timestamp
}
```

### Questions
```sql
questions {
  id: UUID (PK)
  assessment_type: Enum['initial', 'quick', 'deep_dive', 'all']
  dimension: Enum['psi', 'rho', 'q', 'f']
  question_text: Text
  question_type: Enum['scale', 'multiple_choice', 'multi_select', 'text']
  options: JSON
  weight: Decimal(3,2)
  order_index: Integer
  is_active: Boolean
  created_at: Timestamp
}
```

### Coherence Scores
```sql
coherence_scores {
  id: UUID (PK)
  client_id: UUID (FK -> clients.id)
  assessment_id: UUID (FK -> assessments.id) (nullable)
  psi_score: Decimal(3,2)
  rho_score: Decimal(3,2)
  q_score: Decimal(3,2)
  f_score: Decimal(3,2)
  total_coherence: Decimal(3,2)
  coherence_percentage: Decimal(4,1)
  velocity: Decimal(5,4)
  pattern_detected: String
  calculated_at: Timestamp
  created_at: Timestamp
}
```

### Sessions
```sql
sessions {
  id: UUID (PK)
  client_id: UUID (FK -> clients.id)
  coach_id: UUID (FK -> coaches.id)
  scheduled_at: Timestamp
  duration_minutes: Integer
  type: Enum['initial', 'regular', 'deep_dive', 'breakthrough', 'review']
  status: Enum['scheduled', 'completed', 'cancelled', 'no_show']
  focus_dimension: String
  pre_session_coherence: Decimal(3,2)
  post_session_coherence: Decimal(3,2)
  notes: Text (encrypted)
  action_items: JSON
  video_recording_url: String
  created_at: Timestamp
  updated_at: Timestamp
}
```

### Interventions
```sql
interventions {
  id: UUID (PK)
  code: String (unique)
  name: String
  dimension: Enum['psi', 'rho', 'q', 'f']
  difficulty: Enum['easy', 'medium', 'advanced']
  time_minutes: Integer
  description: Text
  implementation_steps: JSON
  success_metrics: JSON
  resources_needed: JSON
  is_active: Boolean
  created_at: Timestamp
}
```

### Client Interventions
```sql
client_interventions {
  id: UUID (PK)
  client_id: UUID (FK -> clients.id)
  intervention_id: UUID (FK -> interventions.id)
  assigned_by: UUID (FK -> coaches.id)
  assigned_at: Timestamp
  status: Enum['assigned', 'in_progress', 'completed', 'abandoned']
  started_at: Timestamp
  completed_at: Timestamp
  effectiveness_rating: Integer (1-5)
  client_feedback: Text
  coach_notes: Text
  created_at: Timestamp
}
```

### Action Items
```sql
action_items {
  id: UUID (PK)
  client_id: UUID (FK -> clients.id)
  session_id: UUID (FK -> sessions.id) (nullable)
  intervention_id: UUID (FK -> interventions.id) (nullable)
  title: String
  description: Text
  due_date: Date
  status: Enum['pending', 'in_progress', 'completed', 'overdue']
  completed_at: Timestamp
  created_at: Timestamp
  updated_at: Timestamp
}
```

### Messages
```sql
messages {
  id: UUID (PK)
  sender_id: UUID (FK -> users.id)
  recipient_id: UUID (FK -> users.id)
  thread_id: UUID
  message_text: Text (encrypted)
  attachments: JSON
  is_read: Boolean
  read_at: Timestamp
  created_at: Timestamp
}
```

### Analytics Events
```sql
analytics_events {
  id: UUID (PK)
  user_id: UUID (FK -> users.id)
  event_type: String
  event_data: JSON
  ip_address: String
  user_agent: String
  created_at: Timestamp
}
```

### Breakthroughs
```sql
breakthroughs {
  id: UUID (PK)
  client_id: UUID (FK -> clients.id)
  dimension: Enum['psi', 'rho', 'q', 'f', 'overall']
  magnitude: Decimal(3,2)
  before_score: Decimal(3,2)
  after_score: Decimal(3,2)
  trigger_event: String
  description: Text
  detected_at: Timestamp
  created_at: Timestamp
}
```

---

## Relationships

```
coaches (1) ─── (N) clients
clients (1) ─── (N) assessments
clients (1) ─── (N) coherence_scores
clients (1) ─── (N) sessions
clients (1) ─── (N) client_interventions
clients (1) ─── (N) action_items
clients (1) ─── (N) breakthroughs

assessments (1) ─── (N) assessment_responses
assessments (1) ─── (1) coherence_scores

questions (1) ─── (N) assessment_responses

sessions (1) ─── (N) action_items

interventions (1) ─── (N) client_interventions
client_interventions (1) ─── (N) action_items

users (1) ─── (N) messages (as sender)
users (1) ─── (N) messages (as recipient)
users (1) ─── (N) analytics_events
```

---

## Indexes

### Performance Indexes
```sql
CREATE INDEX idx_clients_coach_id ON clients(coach_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_assessments_client_id ON assessments(client_id);
CREATE INDEX idx_assessments_type_status ON assessments(type, status);
CREATE INDEX idx_coherence_scores_client_id ON coherence_scores(client_id);
CREATE INDEX idx_coherence_scores_calculated_at ON coherence_scores(calculated_at);
CREATE INDEX idx_sessions_client_id ON sessions(client_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_analytics_events_user_id_type ON analytics_events(user_id, event_type);
```

---

## Data Security

### Encryption
- All PII fields encrypted at rest
- Session notes and client notes use AES-256 encryption
- Messages encrypted end-to-end
- Encryption keys rotated quarterly

### Access Control
- Row-level security for multi-tenant isolation
- Coaches can only access their own clients
- Clients can only access their own data
- Admin access logged and audited

### Compliance
- HIPAA-compliant data handling
- GDPR-ready with data export/deletion
- SOC 2 Type II audit trail
- Regular security audits

---

## Calculated Fields

### Coherence Calculation
```python
def calculate_coherence(psi, rho, q, f):
    q_optimal = (1.0 * q) / (0.5 + q + (q**2 / 2.0))
    coherence = psi + (rho * psi) + q_optimal + (f * psi)
    percentage = (coherence / 4.0) * 100
    return round(percentage, 1)
```

### Velocity Calculation
```python
def calculate_velocity(current, previous, days):
    if days == 0:
        return 0
    return round((current - previous) / days, 4)
```

### Pattern Detection
```python
patterns = {
    'wise_coward': lambda s: s['rho'] > 0.7 and s['q'] < 0.4,
    'lonely_hero': lambda s: s['psi'] > 0.7 and s['f'] < 0.4,
    'people_pleaser': lambda s: s['psi'] < 0.4 and s['f'] > 0.7,
    'reckless_repeater': lambda s: s['rho'] < 0.4 and s['q'] > 0.7
}
```

---

## Data Retention

### Active Data
- All active client data retained indefinitely
- Session recordings retained for 90 days
- Messages retained for 1 year

### Archived Data
- Completed client data archived after 1 year
- Archived data moved to cold storage
- Available for reporting but not real-time access

### Deletion Policy
- User-requested deletion within 30 days
- Automatic anonymization after 3 years inactive
- Aggregate analytics data retained indefinitely

---

## Backup Strategy

### Real-time Replication
- Primary database with streaming replica
- Cross-region backup for disaster recovery
- Point-in-time recovery for 30 days

### Scheduled Backups
- Daily full backups retained 30 days
- Weekly backups retained 90 days
- Monthly backups retained 1 year

### Export Capabilities
- Coach can export all practice data
- Clients can export personal data
- Standard formats: CSV, JSON, PDF

This data model provides a robust foundation for tracking client transformation while maintaining security, performance, and compliance requirements.