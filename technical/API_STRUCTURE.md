# GCT CoachHelper API Structure

## Overview
RESTful API design following best practices for security, scalability, and developer experience. All endpoints return JSON and use standard HTTP status codes.

---

## Base Configuration

### Base URL
```
Production: https://api.gctcoachhelper.com/v1
Staging: https://staging-api.gctcoachhelper.com/v1
Development: http://localhost:3000/api/v1
```

### Authentication
```
Authorization: Bearer {jwt_token}
X-API-Version: 1.0
Content-Type: application/json
```

### Rate Limiting
- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated users
- 429 Too Many Requests with Retry-After header

---

## Authentication Endpoints

### POST /auth/register
Register new coach account
```json
Request:
{
  "email": "coach@example.com",
  "password": "SecurePass123!",
  "practice_name": "Transformative Coaching",
  "coaching_focus": "Life coaching",
  "timezone": "America/New_York"
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "email": "coach@example.com",
    "role": "coach"
  },
  "token": "jwt_token",
  "refresh_token": "refresh_jwt"
}
```

### POST /auth/login
Authenticate user
```json
Request:
{
  "email": "coach@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "user": {
    "id": "uuid",
    "email": "coach@example.com",
    "role": "coach",
    "last_login": "2024-03-15T10:00:00Z"
  },
  "token": "jwt_token",
  "refresh_token": "refresh_jwt"
}
```

### POST /auth/refresh
Refresh access token
```json
Request:
{
  "refresh_token": "refresh_jwt"
}

Response: 200 OK
{
  "token": "new_jwt_token",
  "refresh_token": "new_refresh_jwt"
}
```

### POST /auth/logout
Invalidate tokens
```json
Response: 204 No Content
```

---

## Coach Endpoints

### GET /coaches/profile
Get coach profile
```json
Response: 200 OK
{
  "id": "uuid",
  "practice_name": "Transformative Coaching",
  "coaching_focus": "Life coaching",
  "years_experience": 5,
  "active_clients": 12,
  "average_client_coherence": 67.5,
  "subscription": {
    "tier": "professional",
    "status": "active",
    "next_billing": "2024-04-15"
  }
}
```

### PUT /coaches/profile
Update coach profile
```json
Request:
{
  "practice_name": "New Practice Name",
  "coaching_style": ["breakthrough", "habit-building"],
  "availability": {
    "monday": ["09:00-17:00"],
    "tuesday": ["09:00-17:00"]
  }
}

Response: 200 OK
{
  "message": "Profile updated successfully",
  "coach": { /* updated coach data */ }
}
```

### GET /coaches/analytics
Get practice analytics
```json
Query params: ?from=2024-01-01&to=2024-03-31&metrics=coherence,breakthroughs

Response: 200 OK
{
  "period": {
    "from": "2024-01-01",
    "to": "2024-03-31"
  },
  "metrics": {
    "average_coherence": 64.3,
    "coherence_change": 12.5,
    "total_breakthroughs": 23,
    "most_effective_interventions": [
      {
        "name": "Micro-Courage Challenge",
        "success_rate": 0.92,
        "times_used": 15
      }
    ],
    "dimension_focus": {
      "psi": 0.25,
      "rho": 0.20,
      "q": 0.35,
      "f": 0.20
    }
  }
}
```

---

## Client Endpoints

### GET /clients
List all clients for coach
```json
Query params: ?status=active&sort=coherence_desc&page=1&limit=20

Response: 200 OK
{
  "clients": [
    {
      "id": "uuid",
      "first_name": "Maria",
      "last_name": "S.",
      "status": "active",
      "current_coherence": 67.5,
      "velocity": 0.003,
      "last_session": "2024-03-14",
      "next_session": "2024-03-21"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### POST /clients
Create new client
```json
Request:
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "coaching_focus": "Career transition",
  "goals": [
    "Find fulfilling work",
    "Improve work-life balance"
  ]
}

Response: 201 Created
{
  "client": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "status": "active",
    "portal_access": {
      "url": "https://portal.gctcoachhelper.com/join/abc123",
      "temporary_password": "Welcome123!"
    }
  }
}
```

### GET /clients/{id}
Get client details
```json
Response: 200 OK
{
  "id": "uuid",
  "first_name": "Maria",
  "last_name": "Sanchez",
  "status": "active",
  "start_date": "2024-01-15",
  "current_scores": {
    "psi": 0.72,
    "rho": 0.61,
    "q": 0.55,
    "f": 0.85,
    "coherence": 67.5
  },
  "pattern": "cautious_learner",
  "recent_breakthroughs": [
    {
      "date": "2024-03-08",
      "dimension": "q",
      "magnitude": 0.08
    }
  ],
  "active_interventions": [
    {
      "name": "Micro-Courage Challenge",
      "progress": 0.85,
      "days_remaining": 5
    }
  ]
}
```

### PUT /clients/{id}
Update client
```json
Request:
{
  "status": "paused",
  "notes": "Taking a break for medical reasons"
}

Response: 200 OK
{
  "message": "Client updated successfully",
  "client": { /* updated client data */ }
}
```

---

## Assessment Endpoints

### GET /assessments/questions
Get assessment questions
```json
Query params: ?type=quick&dimension=psi

Response: 200 OK
{
  "questions": [
    {
      "id": "uuid",
      "text": "This week, my actions matched my stated priorities:",
      "type": "multiple_choice",
      "dimension": "psi",
      "options": [
        {"value": "completely", "label": "Completely (90-100%)", "score": 1.0},
        {"value": "mostly", "label": "Mostly (70-89%)", "score": 0.75},
        {"value": "somewhat", "label": "Somewhat (50-69%)", "score": 0.5},
        {"value": "barely", "label": "Barely (30-49%)", "score": 0.25},
        {"value": "not_at_all", "label": "Not at all (<30%)", "score": 0.0}
      ]
    }
  ]
}
```

### POST /assessments
Create new assessment
```json
Request:
{
  "client_id": "uuid",
  "type": "initial"
}

Response: 201 Created
{
  "assessment": {
    "id": "uuid",
    "type": "initial",
    "status": "in_progress",
    "access_url": "https://app.gctcoachhelper.com/assessment/abc123"
  }
}
```

### POST /assessments/{id}/responses
Submit assessment responses
```json
Request:
{
  "responses": [
    {
      "question_id": "uuid",
      "value": "mostly",
      "text": null
    },
    {
      "question_id": "uuid", 
      "value": 7,
      "text": "I've been working on consistency"
    }
  ]
}

Response: 200 OK
{
  "message": "Responses saved",
  "progress": 0.30,
  "status": "in_progress"
}
```

### POST /assessments/{id}/complete
Complete assessment and calculate scores
```json
Response: 200 OK
{
  "assessment": {
    "id": "uuid",
    "status": "completed",
    "completed_at": "2024-03-15T10:30:00Z"
  },
  "scores": {
    "psi": 0.65,
    "rho": 0.72,
    "q": 0.48,
    "f": 0.81,
    "coherence": 58.5,
    "pattern": "wise_coward"
  },
  "interpretation": {
    "zone": "growing",
    "velocity": 0.002,
    "priority_dimension": "q",
    "recommended_interventions": ["q-001", "q-002"]
  }
}
```

---

## Session Endpoints

### GET /sessions
List sessions
```json
Query params: ?client_id=uuid&from=2024-03-01&status=scheduled

Response: 200 OK
{
  "sessions": [
    {
      "id": "uuid",
      "client": {
        "id": "uuid",
        "name": "Maria Sanchez"
      },
      "scheduled_at": "2024-03-21T09:00:00Z",
      "duration_minutes": 60,
      "type": "regular",
      "focus_dimension": "q",
      "status": "scheduled"
    }
  ]
}
```

### POST /sessions
Schedule new session
```json
Request:
{
  "client_id": "uuid",
  "scheduled_at": "2024-03-21T09:00:00Z",
  "duration_minutes": 60,
  "type": "deep_dive",
  "focus_dimension": "q"
}

Response: 201 Created
{
  "session": {
    "id": "uuid",
    "scheduled_at": "2024-03-21T09:00:00Z",
    "calendar_link": "https://calendar.google.com/event?id=abc123",
    "video_link": "https://zoom.us/j/123456789"
  }
}
```

### PUT /sessions/{id}
Update session
```json
Request:
{
  "status": "completed",
  "notes": "Breakthrough in courage dimension",
  "action_items": [
    {
      "title": "Practice daily courage challenge",
      "due_date": "2024-03-28"
    }
  ]
}

Response: 200 OK
{
  "message": "Session updated",
  "coherence_change": 0.03
}
```

---

## Intervention Endpoints

### GET /interventions
List available interventions
```json
Query params: ?dimension=q&difficulty=easy

Response: 200 OK
{
  "interventions": [
    {
      "id": "uuid",
      "code": "q-001",
      "name": "Micro-Courage Challenge",
      "dimension": "q",
      "difficulty": "easy",
      "time_minutes": 15,
      "success_rate": 0.92,
      "description": "Daily small acts of courage..."
    }
  ]
}
```

### POST /interventions/assign
Assign intervention to client
```json
Request:
{
  "client_id": "uuid",
  "intervention_id": "uuid",
  "notes": "Start with level 3-4 challenges"
}

Response: 201 Created
{
  "assignment": {
    "id": "uuid",
    "intervention": "Micro-Courage Challenge",
    "status": "assigned",
    "tracking_url": "https://app.gctcoachhelper.com/track/abc123"
  }
}
```

### PUT /interventions/assignments/{id}
Update intervention progress
```json
Request:
{
  "status": "completed",
  "effectiveness_rating": 5,
  "client_feedback": "This changed everything!"
}

Response: 200 OK
{
  "message": "Intervention updated",
  "dimension_improvement": 0.08
}
```

---

## Messaging Endpoints

### GET /messages/threads
Get message threads
```json
Response: 200 OK
{
  "threads": [
    {
      "thread_id": "uuid",
      "participant": {
        "id": "uuid",
        "name": "Maria Sanchez",
        "role": "client"
      },
      "last_message": {
        "text": "Thank you for the resources!",
        "sent_at": "2024-03-15T14:30:00Z",
        "is_read": true
      },
      "unread_count": 0
    }
  ]
}
```

### POST /messages
Send message
```json
Request:
{
  "recipient_id": "uuid",
  "thread_id": "uuid",
  "text": "Great progress this week! Here's your next challenge..."
}

Response: 201 Created
{
  "message": {
    "id": "uuid",
    "sent_at": "2024-03-15T15:00:00Z",
    "delivered": true
  }
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email already exists"
      }
    ]
  },
  "request_id": "req_abc123"
}
```

### Common Error Codes
- 400: Bad Request - Invalid input
- 401: Unauthorized - Invalid or missing token
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource doesn't exist
- 409: Conflict - Resource already exists
- 429: Too Many Requests - Rate limit exceeded
- 500: Internal Server Error

---

## Webhooks

### Available Events
```
client.created
client.assessment.completed
client.breakthrough.detected
client.intervention.completed
session.completed
subscription.updated
```

### Webhook Payload
```json
{
  "event": "client.breakthrough.detected",
  "created_at": "2024-03-15T10:00:00Z",
  "data": {
    "client_id": "uuid",
    "dimension": "q",
    "magnitude": 0.15,
    "new_coherence": 71.2
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { GCTCoachHelper } from '@gctcoachhelper/sdk';

const gct = new GCTCoachHelper({
  apiKey: process.env.GCT_API_KEY
});

// Get client coherence
const client = await gct.clients.get('client_id');
console.log(`${client.first_name}'s coherence: ${client.current_scores.coherence}%`);

// Create assessment
const assessment = await gct.assessments.create({
  client_id: 'client_id',
  type: 'quick'
});
```

### Python
```python
from gctcoachhelper import GCTCoachHelper

gct = GCTCoachHelper(api_key=os.environ['GCT_API_KEY'])

# List active clients
clients = gct.clients.list(status='active')
for client in clients:
    print(f"{client.first_name}: {client.current_coherence}%")

# Assign intervention
assignment = gct.interventions.assign(
    client_id='client_id',
    intervention_id='q-001'
)
```

This API structure provides a clean, intuitive interface for building coaching applications while maintaining security and scalability.