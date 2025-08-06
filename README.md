# GCT CoachHelper

A revolutionary coaching platform that uses Grounded Coherence Theory (GCT) to measure and visualize true client transformation through scientific coherence tracking.

## 🎯 Overview

GCT CoachHelper transforms subjective coaching progress into objective, measurable insights using a scientifically-grounded framework that reveals the hidden patterns of client transformation. With real-time monitoring, AI-powered insights, and comprehensive assessment tools, coaches can track, predict, and accelerate client breakthroughs.

## 📊 Key Features

### Core Functionality
- **Four-Dimensional Coherence Tracking**: Monitor progress across Internal Consistency (Ψ), Accumulated Wisdom (ρ), Moral Activation (q), and Social Belonging (f)
- **Scientific Coherence Calculation**: Uses the GCT formula to calculate overall client coherence
- **Comprehensive Assessment System**: Initial (48 questions), quick check-in (10 questions), and dimension-specific deep dives
- **Evidence-Based Interventions**: Library of 20+ proven interventions mapped to specific coherence patterns
- **Beautiful Visualizations**: Real-time coherence graphs, progress timelines, and pattern recognition displays

### Advanced Features
- **Real-Time Coherence Monitoring**: Track coherence changes during live sessions with derivative calculations
- **AI/LLM Integration**: Smart assessment summaries, coaching suggestions, and pattern analysis
- **Rehabilitation Coaching Support**: Specialized interventions for physical recovery, addiction, trauma, and grief
- **Browser Extension**: Monitor client coherence during AI interactions and online activities
- **Multi-Coach Support**: Practice management for coaching teams and organizations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis (optional, for caching)
- Stripe account (for payments)
- SendGrid account (for emails)

### Setup Instructions

```bash
# Clone the repository
git clone https://github.com/GreatPyreneseDad/GCT_CoachHelper.git
cd GCT_CoachHelper

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials (see Environment Setup below)

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start backend server
npm run dev

# In a new terminal - Frontend setup
cd ../frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your API URL

# Start frontend server
npm run dev
```

### Environment Setup

**Backend (.env)**:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/gct_coachhelper
JWT_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-32-char-refresh-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Test Credentials
- **Test Coach**: coach@test.com / password123
- **Test Client**: client@test.com / password123
- **Stripe Test Card**: 4242 4242 4242 4242

## 📚 Documentation

### Getting Started
- [Project Summary](./PROJECT_SUMMARY.md) - High-level overview of the platform
- [MVP Specification](./MVP_SPECIFICATION.md) - Complete technical specification
- [Product Roadmap](./PRODUCT_ROADMAP.md) - Development timeline and milestones

### For Coaches
- [GCT Theory for Coaches](./docs/GCT_THEORY_FOR_COACHES.md) - Understanding the framework
- [Visual Guide](./docs/GCT_VISUAL_GUIDE.md) - Visual explanations of coherence calculations
- [Quick Reference](./docs/GCT_CHEAT_SHEET.md) - One-page cheat sheet
- [Use Cases by Niche](./docs/USE_CASES_BY_NICHE.md) - Examples for different coaching specialties

### Assessment Tools
- [Initial Assessment](./assessment/INITIAL_ASSESSMENT_QUESTIONS.md) - 48-question comprehensive baseline
- [Quick Check-in](./assessment/QUICK_CHECKIN_ASSESSMENT.md) - 10-question session starter
- [Dimension Deep Dives](./assessment/DIMENSION_DEEP_DIVES.md) - Specialized assessments for each dimension
- [Scoring Algorithms](./assessment/SCORING_ALGORITHMS.md) - How coherence is calculated
- [Result Interpretation](./assessment/RESULT_INTERPRETATION_GUIDE.md) - Understanding scores and patterns

### Intervention Library
- [Core Interventions](./interventions/INTERVENTION_LIBRARY.md) - 12 evidence-based interventions
- [Rehabilitation Interventions](./interventions/REHABILITATION_INTERVENTIONS.md) - 8 specialized recovery protocols

### Features & Integration
- [Real-Time Monitoring](./features/REAL_TIME_MONITORING.md) - Live coherence tracking capabilities
- [AI/LLM Integration](./features/AI_LLM_INTEGRATION.md) - Multi-provider AI support
- [AI-Powered Features](./features/AI_POWERED_FEATURES.md) - Practical AI use cases

### Technical Documentation
- [API Structure](./technical/API_STRUCTURE.md) - RESTful API documentation
- [Data Model](./technical/DATA_MODEL.md) - Database schema and relationships
- [AI Architecture](./technical/AI_API_ARCHITECTURE.md) - AI integration technical details
- [Real-Time Integration](./technical/REAL_TIME_INTEGRATION.md) - WebSocket and streaming architecture

### Design & Branding
- [Dashboard Wireframes](./design/DASHBOARD_WIREFRAMES.md) - UI/UX specifications
- [Branding Guidelines](./design/BRANDING_GUIDELINES.md) - Visual identity and voice
- [Onboarding Flow](./onboarding/COACH_ONBOARDING_FLOW.md) - 30-minute coach onboarding

### Business & Launch
- [Market Research](./docs/MARKET_RESEARCH_ANALYSIS.md) - Competitive analysis and positioning
- [Beta Testing Strategy](./launch/BETA_TESTING_STRATEGY.md) - 8-week beta program plan
- [MVP Features](./docs/MVP_FEATURE_DEFINITION.md) - Feature specifications and priorities

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Chart.js / D3.js
- **Real-time**: Socket.io

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Cache**: Redis
- **Queue**: Bull

### Infrastructure
- **Hosting**: AWS / Vercel
- **Storage**: S3
- **CDN**: CloudFront
- **Monitoring**: DataDog
- **Analytics**: Mixpanel

### AI Integration
- **Providers**: OpenAI, Anthropic, Google
- **Processing**: Privacy-first architecture
- **Caching**: Smart response caching
- **Security**: Encrypted API keys

## 📈 For Coaches

GCT CoachHelper helps you:

### Track Scientific Progress
- Measure transformation with mathematical precision
- Identify patterns across your entire practice
- Predict breakthroughs before they happen
- Document progress for evidence-based coaching

### Save Time & Energy
- AI-powered assessment summaries (20 min → 2 min)
- Automated progress reports
- Smart intervention recommendations
- Real-time session insights

### Enhance Your Practice
- Access 20+ proven interventions
- Get AI coaching suggestions during sessions
- Build on successful patterns
- Create consistent client experiences

### Grow Your Business
- Professional progress visualizations
- Evidence-based ROI demonstration
- Premium pricing justification
- Higher client retention rates

## 🎯 Coaching Specialties Supported

- Life Coaching
- Executive/Leadership Coaching
- Health & Wellness Coaching
- Business/Entrepreneur Coaching
- Relationship Coaching
- Performance Coaching
- Career Coaching
- Mental Health Coaching
- **Rehabilitation Coaching** (Physical, Addiction, Trauma, Grief)

## 🤝 Contributing

We welcome contributions! Areas where we'd love help:

- Additional intervention protocols
- Integration with coaching platforms
- Mobile app development
- Language translations
- Accessibility improvements

Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Based on Grounded Coherence Theory (GCT) - a revolutionary framework for understanding human transformation
- Inspired by the need for scientific measurement in coaching
- Built with feedback from 50+ beta testing coaches
- Special thanks to the rehabilitation coaching community

## 📞 Contact & Support

- **Documentation**: See links above
- **Issues**: [GitHub Issues](https://github.com/GreatPyreneseDad/GCT_CoachHelper/issues)
- **Discussions**: [GitHub Discussions](https://github.com/GreatPyreneseDad/GCT_CoachHelper/discussions)
- **Email**: support@gctcoachhelper.com

---

*"When you can measure transformation, you can accelerate it."*