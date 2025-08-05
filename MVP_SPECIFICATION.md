# GCT CoachHelper MVP Development Specification

Generated: 2025-08-04

## 1. Product Overview

### Vision
A revolutionary coaching progress tracker that uses Grounded Coherence Theory (GCT) to measure and visualize true client transformation across four key dimensions, providing coaches with scientific insights into their clients' development journey.

### Target Users
- **Primary**: Professional coaches (life, executive, health, business) seeking deeper client insights
- **Secondary**: Coaching organizations and teams wanting standardized progress tracking
- **Tertiary**: Independent consultants and therapists using coaching methodologies

### Core Value Proposition
Transform subjective coaching progress into objective, measurable insights using a scientifically-grounded framework that reveals the hidden patterns of client transformation.

## 2. Technical Architecture

### Tech Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Prisma
- **Database**: PostgreSQL + Redis (for caching)
- **Hosting**: Vercel (frontend) + Railway (backend)
- **Additional Services**: 
  - Google Sheets API (for spreadsheet integration)
  - Stripe (for payments)
  - SendGrid (for emails)
  - Chart.js (for visualizations)
  - Mixpanel (for analytics)

### System Architecture
```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Next.js App       │────▶│   API Server        │────▶│   PostgreSQL        │
│   (Coach Portal)    │     │   (Express)         │     │   (Primary DB)      │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         │                           │                             │
         │                           ▼                             │
         │                  ┌─────────────────────┐               │
         │                  │   Google Sheets     │               │
         │                  │   Integration       │               │
         │                  └─────────────────────┘               │
         │                           │                             │
         ▼                           ▼                             ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Vercel CDN        │     │   Redis Cache       │     │   Backup Storage    │
│   (Static Assets)   │     │   (Session Data)    │     │   (S3)              │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

## 3. MVP Features Specification

### Feature 1: GCT Framework Implementation
**Priority**: High
**Description**: Core implementation of Grounded Coherence Theory calculations and tracking
**User Story**: As a coach, I want to track my clients' progress across four GCT dimensions so that I can identify transformation patterns
**Acceptance Criteria**:
- [ ] Implement GCT formula: Coherence = Ψ + (ρ × Ψ) + q_optimal + (f × Ψ)
- [ ] Calculate q_optimal with saturation function
- [ ] Track velocity of change between sessions
- [ ] Provide dimension-specific insights
- [ ] Generate coherence scores in real-time
**Technical Implementation**:
```typescript
// Core GCT calculation engine
interface GCTDimensions {
  psi: number;    // Internal Consistency (0-1)
  rho: number;    // Accumulated Wisdom (0-1)
  q: number;      // Moral Activation (0-1)
  f: number;      // Social Belonging (0-1)
}

class GCTCalculator {
  calculateCoherence(dimensions: GCTDimensions): number {
    const { psi, rho, q, f } = dimensions;
    const q_optimal = this.calculateOptimalQ(q);
    return psi + (rho * psi) + q_optimal + (f * psi);
  }
  
  calculateOptimalQ(q: number): number {
    const K_m = 0.5; // Michaelis constant
    const K_i = 2.0; // Inhibition constant
    const q_max = 1.0;
    return (q_max * q) / (K_m + q + (q * q) / K_i);
  }
}
```

### Feature 2: Client Assessment System
**Priority**: High
**Description**: Comprehensive assessment tools for measuring GCT dimensions
**User Story**: As a coach, I want to assess my clients across all four dimensions so that I can establish baselines and track progress
**Acceptance Criteria**:
- [ ] Create initial assessment (40-60 questions)
- [ ] Build quick check-in assessment (10-15 questions)
- [ ] Implement dimension-specific deep dives
- [ ] Add response consistency validation
- [ ] Generate visual assessment reports
**Technical Implementation**:
```typescript
// Assessment question weighting and scoring
interface AssessmentQuestion {
  id: string;
  dimension: 'psi' | 'rho' | 'q' | 'f';
  text: string;
  weight: number;
  responseType: 'scale' | 'multiple' | 'binary';
  options?: AssessmentOption[];
}

// Dynamic scoring based on response patterns
function calculateDimensionScore(
  responses: AssessmentResponse[],
  dimension: string
): number {
  // Weighted average with consistency checks
}
```

### Feature 3: Progress Visualization Dashboard
**Priority**: High
**Description**: Interactive dashboards showing client transformation over time
**User Story**: As a coach, I want to visualize my clients' progress so that I can identify patterns and celebrate wins
**Acceptance Criteria**:
- [ ] Create radar chart for current dimension scores
- [ ] Build line graph for coherence over time
- [ ] Design heatmap for pattern recognition
- [ ] Add velocity indicators
- [ ] Enable period comparisons
**Technical Implementation**:
```javascript
// Chart.js configuration for GCT visualizations
const radarConfig = {
  type: 'radar',
  data: {
    labels: ['Consistency (Ψ)', 'Wisdom (ρ)', 'Activation (q)', 'Belonging (f)'],
    datasets: [{
      label: 'Current State',
      data: [psi, rho, q, f],
      backgroundColor: 'rgba(102, 126, 234, 0.2)',
      borderColor: 'rgb(102, 126, 234)',
    }]
  },
  options: {
    scales: { r: { beginAtZero: true, max: 1 } }
  }
};
```

### Feature 4: Session Notes & Insights
**Priority**: Medium
**Description**: Link coaching session notes to dimension changes and generate insights
**User Story**: As a coach, I want to document sessions and see how they impact GCT scores so that I can refine my approach
**Acceptance Criteria**:
- [ ] Create session note templates
- [ ] Link notes to dimension changes
- [ ] Generate AI-powered insights
- [ ] Track intervention effectiveness
- [ ] Export session summaries
**Technical Implementation**:
```typescript
interface SessionNote {
  id: string;
  clientId: string;
  date: Date;
  dimensionFocus: GCTDimension[];
  interventions: string[];
  observations: string;
  nextSteps: string;
  preScores: GCTDimensions;
  postScores?: GCTDimensions;
}
```

### Feature 5: Client Report Generation
**Priority**: Medium
**Description**: Automated report generation for client reviews and documentation
**User Story**: As a coach, I want to generate professional reports so that clients can see their progress clearly
**Acceptance Criteria**:
- [ ] Create PDF report templates
- [ ] Include visual progress charts
- [ ] Add coach observations
- [ ] Highlight breakthrough moments
- [ ] Enable custom branding
**Technical Implementation**:
```typescript
// Report generation using React PDF
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';

const ClientReport = ({ client, sessions, scores }) => (
  <Document>
    <Page size="A4">
      <View>
        <Text>GCT Progress Report for {client.name}</Text>
        <ProgressChart data={scores} />
        <InsightsSummary sessions={sessions} />
      </View>
    </Page>
  </Document>
);
```

## 4. Data Models

### User Model (Coach)
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "organization": "string?",
  "subscription": {
    "plan": "basic|pro|enterprise",
    "status": "active|trial|cancelled",
    "validUntil": "date"
  },
  "settings": {
    "timezone": "string",
    "notifications": "boolean",
    "branding": "json"
  },
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Client Model
```json
{
  "id": "uuid",
  "coachId": "uuid",
  "name": "string",
  "email": "string?",
  "demographics": {
    "age": "number?",
    "occupation": "string?",
    "goals": "string[]"
  },
  "status": "active|paused|completed",
  "startDate": "date",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Assessment Model
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "type": "initial|checkin|deep",
  "responses": [{
    "questionId": "string",
    "value": "any",
    "timestamp": "timestamp"
  }],
  "scores": {
    "psi": "number",
    "rho": "number",
    "q": "number",
    "f": "number",
    "coherence": "number"
  },
  "completed_at": "timestamp"
}
```

### Session Model
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "coachId": "uuid",
  "date": "timestamp",
  "duration": "number",
  "notes": {
    "observations": "string",
    "interventions": "string[]",
    "breakthroughs": "string[]",
    "nextSteps": "string"
  },
  "preAssessment": "uuid?",
  "postAssessment": "uuid?",
  "created_at": "timestamp"
}
```

## 5. API Endpoints

### Authentication
- `POST /api/auth/register` - Coach registration
- `POST /api/auth/login` - Coach login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Password reset

### Clients
- `GET /api/clients` - List all clients for coach
- `GET /api/clients/:id` - Get specific client details
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Archive client
- `GET /api/clients/:id/progress` - Get client progress data

### Assessments
- `GET /api/assessments/questions` - Get assessment questions
- `POST /api/assessments` - Submit assessment
- `GET /api/assessments/:id` - Get assessment results
- `GET /api/clients/:id/assessments` - List client assessments

### Sessions
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id` - Update session
- `GET /api/clients/:id/sessions` - List client sessions
- `GET /api/sessions/:id/insights` - Get AI insights

### Reports
- `POST /api/reports/generate` - Generate client report
- `GET /api/reports/:id` - Download report
- `POST /api/reports/email` - Email report to client

### Analytics
- `GET /api/analytics/coach` - Coach dashboard stats
- `GET /api/analytics/clients/:id` - Client analytics
- `GET /api/analytics/patterns` - Pattern recognition data

## 6. User Interface Specifications

### Pages/Screens

1. **Dashboard**
   - Coach overview with key metrics
   - Active client cards with coherence scores
   - Recent session activity
   - Quick actions menu

2. **Client Profile**
   - Client information and goals
   - Current GCT scores with radar chart
   - Progress timeline
   - Session history
   - Quick assessment buttons

3. **Assessment Interface**
   - Clean question presentation
   - Progress indicator
   - Auto-save functionality
   - Immediate score calculation
   - Visual feedback

4. **Session Notes**
   - Structured note template
   - Dimension focus selector
   - Intervention tracker
   - Before/after mini-assessment
   - Voice-to-text option

5. **Analytics Dashboard**
   - Multi-client comparison
   - Pattern identification
   - Success rate metrics
   - Intervention effectiveness
   - Export options

6. **Settings**
   - Profile management
   - Subscription details
   - Branding customization
   - Integration settings
   - Data export

### Design System
- **Primary Color**: #667eea (GCT Purple)
- **Secondary Color**: #764ba2 (Deep Purple)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Amber)
- **Typography**: Inter for UI, Merriweather for reports
- **Component Library**: Radix UI + Tailwind CSS
- **Icons**: Heroicons
- **Charts**: Chart.js with custom theme

## 7. Development Roadmap

### Week 1: Foundation Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up PostgreSQL and Prisma schema
- [ ] Configure authentication with NextAuth
- [ ] Create base UI components
- [ ] Implement GCT calculation engine
- [ ] Set up testing framework

### Week 2: Core Features
- [ ] Build client management system
- [ ] Create assessment questionnaire engine
- [ ] Implement GCT scoring algorithms
- [ ] Design dashboard layouts
- [ ] Add session note functionality
- [ ] Create basic visualizations

### Week 3: Advanced Features
- [ ] Develop progress tracking system
- [ ] Build report generation engine
- [ ] Add analytics dashboard
- [ ] Implement data export
- [ ] Create client portal preview
- [ ] Add email notifications

### Week 4: Integration & Polish
- [ ] Google Sheets integration
- [ ] Stripe payment setup
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Error handling and logging
- [ ] User onboarding flow

### Week 5: Testing & Launch Prep
- [ ] Comprehensive testing
- [ ] Beta user feedback integration
- [ ] Documentation completion
- [ ] Marketing site setup
- [ ] Launch sequence preparation
- [ ] Support system activation

## 8. Testing Strategy

### Unit Tests
- GCT calculation accuracy
- Assessment scoring logic
- Data validation rules
- API endpoint responses
- Authentication flows

### Integration Tests
- Full user journeys
- Payment processing
- Email delivery
- Report generation
- Data export functionality

### User Acceptance Tests
- [ ] Coach can onboard and set up profile
- [ ] Coach can add and assess clients
- [ ] Assessments calculate correct scores
- [ ] Progress visualizations update properly
- [ ] Reports generate without errors
- [ ] Billing processes correctly

### Performance Tests
- Page load time < 2 seconds
- Assessment submission < 500ms
- Report generation < 5 seconds
- Dashboard refresh < 1 second

## 9. Deployment Instructions

### Development Setup
```bash
# Clone repository
git clone https://github.com/GreatPyreneseDad/GCT_CoachHelper.git
cd GCT_CoachHelper

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - GOOGLE_SHEETS_API_KEY
# - STRIPE_SECRET_KEY
# - SENDGRID_API_KEY

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Production Deployment

#### Frontend (Vercel)
```bash
# Connect to GitHub repo in Vercel dashboard
# Set environment variables
# Deploy automatically on push to main
```

#### Backend (Railway)
```bash
# Create new Railway project
# Connect GitHub repo
# Add PostgreSQL and Redis
# Set environment variables
# Deploy automatically
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/gct_coachhelper

# Authentication
NEXTAUTH_URL=https://app.gctcoachhelper.com
NEXTAUTH_SECRET=your-secret-key

# External Services
GOOGLE_SHEETS_API_KEY=your-api-key
STRIPE_SECRET_KEY=sk_live_xxx
SENDGRID_API_KEY=SG.xxx

# Analytics
MIXPANEL_TOKEN=your-project-token
```

## 10. Success Metrics & Monitoring

### Key Performance Indicators
- **User Acquisition**: 100 coaches in first 3 months
- **Activation Rate**: 80% complete first client assessment
- **Retention**: 70% monthly active usage
- **Client Success**: Average coherence improvement of 15%
- **Revenue**: $10k MRR within 6 months

### Technical Metrics
- **Uptime**: 99.9% availability
- **Performance**: <2s page loads
- **Error Rate**: <0.1% of requests
- **Support Tickets**: <5% of users

### Monitoring Tools
- **Analytics**: Mixpanel for user behavior
- **Error Tracking**: Sentry for exceptions
- **Performance**: Vercel Analytics
- **Uptime**: UptimeRobot
- **Support**: Intercom for user communication

---

## Implementation Notes for Claude Code

This specification provides a complete blueprint for building the GCT CoachHelper MVP. The system is designed to be:

1. **Scalable**: Architecture supports growth from individual coaches to organizations
2. **Extensible**: Plugin system for future integrations
3. **User-Friendly**: Built with coaches' workflow in mind
4. **Data-Driven**: Every feature measures its impact
5. **Secure**: Enterprise-grade security for sensitive client data

Start with the foundation setup and progress through each week's milestones. The GCT calculation engine is the core component that everything else builds upon.