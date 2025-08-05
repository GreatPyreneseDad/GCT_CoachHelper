# White-Label Coaching Platform Architecture

## Overview
Multi-tenant SaaS platform enabling coaches to create branded coaching experiences with integrated coherence monitoring, client management, and business tools.

---

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────────┐
│                        Platform Infrastructure                       │
├─────────────────────────────────────────────────────────────────────┤
│  Load Balancer  │  CDN  │  WAF  │  SSL/TLS  │  DDoS Protection    │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                      Application Layer                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│  │ Auth Service│  │ Coach Portal │  │ Client Portal          │    │
│  │             │  │              │  │                        │    │
│  │ • OAuth 2.0 │  │ • Dashboard  │  │ • Assessments         │    │
│  │ • Apple ID  │  │ • Branding   │  │ • Progress Tracking   │    │
│  │ • Google    │  │ • Analytics  │  │ • Session Booking     │    │
│  │ • JWT       │  │ • Store      │  │ • Coherence View      │    │
│  └─────────────┘  └──────────────┘  └────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                        Service Layer                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Tenant Service │ Coherence Engine │ Integration Hub │ Billing     │
│  Payment Gateway│ Notification Hub │ Analytics Engine│ Store API   │
└─────────────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                        Data Layer                                    │
├─────────────────────────────────────────────────────────────────────┤
│  PostgreSQL     │ Redis Cache      │ S3 Storage     │ Time Series │
│  (Multi-tenant) │ (Session/Cache)  │ (Media/Files)  │ (Metrics)   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Multi-Tenant Architecture

### Tenant Isolation Strategy
```typescript
// Database Schema with Row-Level Security
interface TenantModel {
  tenant_id: string;  // UUID for each coach organization
  created_at: Date;
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  client_limit: number;
  features: FeatureFlags;
}

// Middleware for tenant context
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const subdomain = req.hostname.split('.')[0];
  const customDomain = await getCustomDomain(req.hostname);
  
  const tenant = await getTenantByIdentifier(subdomain || customDomain);
  if (!tenant) {
    return res.redirect('https://platform.gctcoachhelper.com/signup');
  }
  
  req.tenant = tenant;
  req.tenantId = tenant.id;
  next();
};
```

### URL Structure
```
# Platform URLs
https://platform.gctcoachhelper.com         # Main platform
https://app.gctcoachhelper.com              # Application dashboard
https://api.gctcoachhelper.com              # API endpoints

# Coach White-Label URLs
https://[coach-slug].gctcoachhelper.com     # Subdomain approach
https://coaching.customdomain.com            # Custom domain (CNAME)

# Client Access URLs
https://[coach-slug].gctcoachhelper.com/client
https://coaching.customdomain.com/portal
```

---

## Frontend Architecture

### Tech Stack
```json
{
  "framework": "Next.js 14",
  "ui": "Tailwind CSS + Shadcn/ui",
  "state": "Zustand + React Query",
  "auth": "NextAuth.js",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts + D3.js",
  "realtime": "Socket.io",
  "i18n": "next-i18next",
  "testing": "Jest + React Testing Library"
}
```

### Project Structure
```
/frontend
├── /app                          # Next.js 14 app directory
│   ├── /(platform)              # Platform pages
│   │   ├── /signup              # Coach registration
│   │   ├── /pricing             # Tier selection
│   │   └── /demo                # Platform demo
│   ├── /(coach)                 # Coach portal
│   │   ├── /dashboard           # Main dashboard
│   │   ├── /clients             # Client management
│   │   ├── /branding            # White-label settings
│   │   ├── /store               # Web store management
│   │   └── /analytics           # Business analytics
│   ├── /(client)                # Client portal
│   │   ├── /portal              # Client dashboard
│   │   ├── /assessments         # Take assessments
│   │   ├── /sessions            # Book/view sessions
│   │   └── /progress            # Progress tracking
│   └── /api                     # API routes
├── /components
│   ├── /platform                # Platform components
│   ├── /coach                   # Coach-specific
│   ├── /client                  # Client-specific
│   ├── /shared                  # Shared components
│   └── /ui                      # Base UI components
├── /hooks                       # Custom React hooks
├── /lib                         # Utilities and helpers
├── /services                    # API service layers
├── /stores                      # Zustand stores
├── /styles                      # Global styles
└── /types                       # TypeScript types
```

---

## Core Features Implementation

### 1. Coach Registration & Onboarding

#### Registration Flow
```typescript
// pages/signup/CoachRegistration.tsx
export const CoachRegistration: React.FC = () => {
  const [step, setStep] = useState<'account' | 'category' | 'tier' | 'profile'>('account');
  
  return (
    <RegistrationWizard>
      {step === 'account' && <AccountCreation />}
      {step === 'category' && <CoachingCategorySelection />}
      {step === 'tier' && <TierSelection />}
      {step === 'profile' && <InitialProfileSetup />}
    </RegistrationWizard>
  );
};

// Account Creation with OAuth
export const AccountCreation: React.FC = () => {
  return (
    <div className="auth-container">
      <h2>Create Your Coaching Platform</h2>
      
      <button onClick={() => signIn('apple')} className="oauth-button">
        <AppleIcon /> Continue with Apple
      </button>
      
      <button onClick={() => signIn('google')} className="oauth-button">
        <GoogleIcon /> Continue with Google
      </button>
      
      <div className="divider">or</div>
      
      <EmailSignupForm />
    </div>
  );
};
```

#### Coaching Category Selection
```typescript
// Dynamically configure platform based on coaching type
interface CoachingCategory {
  id: string;
  name: string;
  icon: React.FC;
  defaultInterventions: string[];
  assessmentTypes: string[];
  clientOnboardingFlow: string;
  dashboardWidgets: string[];
}

const coachingCategories: CoachingCategory[] = [
  {
    id: 'life',
    name: 'Life Coaching',
    icon: LifeIcon,
    defaultInterventions: ['goal-setting', 'values-clarification', 'vision-boarding'],
    assessmentTypes: ['initial-life', 'weekly-checkin', 'goal-progress'],
    clientOnboardingFlow: 'standard',
    dashboardWidgets: ['coherence-overview', 'goal-tracker', 'session-calendar']
  },
  {
    id: 'executive',
    name: 'Executive Coaching',
    icon: ExecutiveIcon,
    defaultInterventions: ['leadership-360', 'delegation-matrix', 'decision-framework'],
    assessmentTypes: ['leadership-assessment', 'team-dynamics', 'executive-presence'],
    clientOnboardingFlow: 'corporate',
    dashboardWidgets: ['team-coherence', 'leadership-metrics', 'roi-calculator']
  },
  {
    id: 'rehabilitation',
    name: 'Rehabilitation Coaching',
    icon: RehabIcon,
    defaultInterventions: ['micro-movement', 'recovery-milestones', 'support-mapping'],
    assessmentTypes: ['recovery-baseline', 'progress-markers', 'barrier-assessment'],
    clientOnboardingFlow: 'therapeutic',
    dashboardWidgets: ['recovery-timeline', 'coherence-trends', 'crisis-alerts']
  }
  // ... more categories
];
```

### 2. Subscription Tiers

```typescript
interface SubscriptionTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  clientLimit: number;
  features: string[];
  apiCalls: number;
  storage: string;
  customDomain: boolean;
  whiteLabel: boolean;
  priority: 'standard' | 'priority' | 'dedicated';
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 49,
    annualPrice: 470,
    clientLimit: 10,
    features: [
      'Basic coherence tracking',
      'Standard assessments',
      'Email support',
      'Basic branding'
    ],
    apiCalls: 1000,
    storage: '5GB',
    customDomain: false,
    whiteLabel: false,
    priority: 'standard'
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 149,
    annualPrice: 1430,
    clientLimit: 50,
    features: [
      'Advanced coherence analytics',
      'Custom assessments',
      'Priority support',
      'Full branding suite',
      'Web store',
      'Chrome extension',
      'API access'
    ],
    apiCalls: 10000,
    storage: '50GB',
    customDomain: true,
    whiteLabel: true,
    priority: 'priority'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 499,
    annualPrice: 4790,
    clientLimit: -1, // Unlimited
    features: [
      'Everything in Professional',
      'Unlimited clients',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Advanced security',
      'Multi-coach support'
    ],
    apiCalls: -1, // Unlimited
    storage: 'Unlimited',
    customDomain: true,
    whiteLabel: true,
    priority: 'dedicated'
  }
];
```

### 3. Coach Profile & Branding

```typescript
// components/coach/BrandingCustomization.tsx
export const BrandingCustomization: React.FC = () => {
  const { tenant } = useTenant();
  const [branding, setBranding] = useState<BrandingConfig>(tenant.branding);
  
  return (
    <div className="branding-container">
      <h2>Customize Your Brand</h2>
      
      <Section title="Basic Information">
        <Input 
          label="Business Name" 
          value={branding.businessName}
          onChange={(e) => updateBranding({ businessName: e.target.value })}
        />
        <TextArea 
          label="Tagline" 
          value={branding.tagline}
          maxLength={100}
        />
      </Section>
      
      <Section title="Visual Identity">
        <LogoUploader 
          currentLogo={branding.logo}
          onUpload={handleLogoUpload}
        />
        <ColorPicker 
          label="Primary Color"
          value={branding.primaryColor}
          onChange={(color) => updateBranding({ primaryColor: color })}
        />
        <ColorPicker 
          label="Secondary Color"
          value={branding.secondaryColor}
          onChange={(color) => updateBranding({ secondaryColor: color })}
        />
        <FontSelector 
          value={branding.fontFamily}
          onChange={(font) => updateBranding({ fontFamily: font })}
        />
      </Section>
      
      <Section title="Social Media">
        <SocialMediaLinks 
          links={branding.socialMedia}
          onChange={updateSocialMedia}
        />
      </Section>
      
      <Section title="Custom Domain">
        {tenant.tier === 'professional' || tenant.tier === 'enterprise' ? (
          <CustomDomainSetup 
            currentDomain={branding.customDomain}
            onSetup={handleDomainSetup}
          />
        ) : (
          <UpgradePrompt feature="Custom Domain" requiredTier="Professional" />
        )}
      </Section>
      
      <Section title="Email Templates">
        <EmailTemplateEditor 
          templates={branding.emailTemplates}
          onChange={updateEmailTemplates}
        />
      </Section>
      
      <PreviewPanel branding={branding} />
    </div>
  );
};
```

### 4. Coach Dashboard

```typescript
// components/coach/Dashboard.tsx
export const CoachDashboard: React.FC = () => {
  const { clients } = useClients();
  const { coherenceData } = useCoherenceMonitoring();
  
  return (
    <DashboardLayout>
      <Header>
        <h1>Coach Dashboard</h1>
        <QuickActions />
      </Header>
      
      <MetricsRow>
        <MetricCard 
          title="Active Clients" 
          value={clients.active.length}
          change="+2 this week"
        />
        <MetricCard 
          title="Avg Coherence" 
          value={`${coherenceData.average}%`}
          change="+5% this month"
        />
        <MetricCard 
          title="Sessions This Week" 
          value={coherenceData.sessionsThisWeek}
        />
        <MetricCard 
          title="Revenue This Month" 
          value={`$${coherenceData.monthlyRevenue}`}
        />
      </MetricsRow>
      
      <ClientMonitoringGrid>
        <h2>Client Coherence Monitor</h2>
        <TriageFilter />
        
        <ClientGrid>
          {clients.map(client => (
            <ClientCard 
              key={client.id}
              client={client}
              coherence={coherenceData[client.id]}
              triageColor={getTriageColor(coherenceData[client.id])}
            />
          ))}
        </ClientGrid>
      </ClientMonitoringGrid>
      
      <RecentActivity />
      <UpcomingSessions />
    </DashboardLayout>
  );
};

// Triage Color System
const getTriageColor = (coherence: ClientCoherence): TriageColor => {
  const { current, derivative, trend } = coherence;
  
  // Critical (Red) - Needs immediate attention
  if (current < 40 || derivative < -0.05 || trend === 'declining_fast') {
    return 'critical';
  }
  
  // Warning (Yellow) - Monitor closely
  if (current < 60 || derivative < -0.02 || trend === 'declining') {
    return 'warning';
  }
  
  // Stable (Blue) - Maintaining
  if (Math.abs(derivative) < 0.02 && trend === 'stable') {
    return 'stable';
  }
  
  // Thriving (Green) - Positive growth
  if (derivative > 0.02 || trend === 'improving') {
    return 'thriving';
  }
  
  // Breakthrough (Purple) - Exceptional progress
  if (derivative > 0.05 || trend === 'breakthrough') {
    return 'breakthrough';
  }
  
  return 'stable';
};
```

### 5. Client Portal

```typescript
// components/client/ClientPortal.tsx
export const ClientPortal: React.FC = () => {
  const { coach } = useCoachBranding();
  const { client } = useClientAuth();
  
  return (
    <ThemedLayout branding={coach.branding}>
      <ClientHeader 
        logo={coach.branding.logo}
        businessName={coach.branding.businessName}
      />
      
      <ClientDashboard>
        <WelcomeSection>
          <h1>Welcome back, {client.firstName}!</h1>
          <CoherenceSnapshot coherence={client.currentCoherence} />
        </WelcomeSection>
        
        <QuickActions>
          <ActionCard 
            icon={AssessmentIcon}
            title="Take Assessment"
            description="Complete your weekly check-in"
            onClick={() => navigate('/assessments/weekly')}
          />
          <ActionCard 
            icon={SessionIcon}
            title="Book Session"
            description="Schedule time with {coach.name}"
            onClick={() => navigate('/sessions/book')}
          />
          <ActionCard 
            icon={ProgressIcon}
            title="View Progress"
            description="See your coherence journey"
            onClick={() => navigate('/progress')}
          />
        </QuickActions>
        
        <ProgressChart data={client.coherenceHistory} />
        <UpcomingSessions sessions={client.upcomingSessions} />
        <RecentInsights insights={client.recentInsights} />
      </ClientDashboard>
    </ThemedLayout>
  );
};
```

### 6. OAuth Integration

```typescript
// lib/auth/oauth-config.ts
import NextAuth from 'next-auth';
import AppleProvider from 'next-auth/providers/apple';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'name email',
          response_mode: 'form_post',
          response_type: 'code'
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.provider = token.provider;
      return session;
    }
  }
};
```

### 7. Calendar Integration

```typescript
// services/integrations/CalendarService.ts
export class CalendarIntegrationService {
  async syncWithGoogle(accessToken: string) {
    const calendar = google.calendar({ version: 'v3', auth: accessToken });
    
    // Create coaching calendar if not exists
    const coachingCalendar = await this.findOrCreateCalendar(calendar, 'Coaching Sessions');
    
    // Sync sessions
    const sessions = await this.getUpcomingSessions();
    for (const session of sessions) {
      await calendar.events.insert({
        calendarId: coachingCalendar.id,
        requestBody: {
          summary: `Coaching: ${session.clientName}`,
          description: `Coherence: ${session.coherence}%\nFocus: ${session.focus}`,
          start: { dateTime: session.startTime },
          end: { dateTime: session.endTime },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 30 }
            ]
          }
        }
      });
    }
  }
  
  async syncWithApple(accessToken: string) {
    // Apple Calendar integration via CalDAV
    const client = new CalDAVClient({
      serverUrl: 'https://caldav.icloud.com',
      credentials: { accessToken }
    });
    
    // Similar sync logic for Apple Calendar
  }
}
```

### 8. Chrome Extension Integration

```typescript
// components/coach/ExtensionIntegration.tsx
export const ExtensionIntegration: React.FC = () => {
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [coherenceStream, setCoherenceStream] = useState<CoherenceData[]>([]);
  
  useEffect(() => {
    // Listen for messages from Chrome extension
    window.addEventListener('message', (event) => {
      if (event.data.type === 'COHERENCE_UPDATE') {
        handleCoherenceUpdate(event.data.payload);
      }
    });
    
    // Establish WebSocket connection for real-time updates
    const ws = new WebSocket('wss://api.gctcoachhelper.com/coherence-stream');
    ws.on('coherence-data', (data) => {
      setCoherenceStream(prev => [...prev, data]);
    });
    
    return () => ws.close();
  }, []);
  
  return (
    <div className="extension-integration">
      <h3>Browser Extension</h3>
      
      {!extensionConnected ? (
        <InstallPrompt>
          <p>Install the GCT Coherence Monitor extension to track client conversations</p>
          <button onClick={installExtension}>
            Install Chrome Extension
          </button>
        </InstallPrompt>
      ) : (
        <LiveMonitor>
          <h4>Live Coherence Monitoring</h4>
          <CoherenceStreamDisplay data={coherenceStream} />
        </LiveMonitor>
      )}
    </div>
  );
};
```

### 9. Web Store Integration

```typescript
// components/coach/WebStore.tsx
export const CoachWebStore: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>();
  
  return (
    <StoreManagement>
      <StoreHeader>
        <h2>Your Coaching Store</h2>
        <StoreStatus enabled={storeSettings?.enabled} />
      </StoreHeader>
      
      <ProductManager>
        <ProductGrid>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
        
        <AddProductButton onClick={() => setShowProductModal(true)} />
      </ProductManager>
      
      <StoreCustomization>
        <StorefrontPreview settings={storeSettings} />
        <PaymentSettings />
        <ShippingSettings />
        <TaxSettings />
      </StoreCustomization>
    </StoreManagement>
  );
};

// Product types for coaches
interface CoachingProduct {
  id: string;
  type: 'digital' | 'physical' | 'service' | 'course';
  name: string;
  description: string;
  price: number;
  images: string[];
  inventory?: number;
  deliveryMethod: 'instant' | 'scheduled' | 'shipped';
  category: 'book' | 'course' | 'worksheet' | 'session' | 'merchandise';
}
```

### 10. Real-Time Coherence Dashboard

```typescript
// components/coach/CoherenceMonitor.tsx
export const RealTimeCoherenceMonitor: React.FC = () => {
  const { clients } = useClients();
  const [liveData, setLiveData] = useState<Map<string, CoherenceStream>>();
  
  return (
    <MonitorGrid>
      {clients.map(client => (
        <ClientMonitorCard key={client.id}>
          <ClientHeader>
            <Avatar src={client.avatar} />
            <ClientName>{client.name}</ClientName>
            <TriageIndicator color={client.triageStatus} />
          </ClientHeader>
          
          <CoherenceDisplay>
            <CurrentScore>{client.coherence.current}%</CurrentScore>
            <DerivativeIndicator 
              value={client.coherence.derivative}
              direction={client.coherence.trend}
            />
          </CoherenceDisplay>
          
          <MiniChart data={client.coherence.recent} />
          
          <QuickActions>
            <IconButton icon={MessageIcon} onClick={() => messageClient(client.id)} />
            <IconButton icon={SessionIcon} onClick={() => scheduleSession(client.id)} />
            <IconButton icon={AlertIcon} onClick={() => setAlert(client.id)} />
          </QuickActions>
        </ClientMonitorCard>
      ))}
    </MonitorGrid>
  );
};

// Triage color coding
const TriageIndicator: React.FC<{ color: TriageStatus }> = ({ color }) => {
  const colors = {
    critical: '#EF4444',    // Red - Immediate attention
    warning: '#F59E0B',     // Yellow - Monitor closely
    stable: '#3B82F6',      // Blue - Maintaining
    thriving: '#10B981',    // Green - Positive growth
    breakthrough: '#8B5CF6' // Purple - Exceptional progress
  };
  
  return (
    <div 
      className="triage-indicator"
      style={{ backgroundColor: colors[color] }}
      title={`Status: ${color}`}
    />
  );
};
```

---

## Database Schema Updates

```sql
-- Multi-tenant schema
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tier VARCHAR(20) NOT NULL,
  client_limit INTEGER,
  custom_domain VARCHAR(255),
  branding JSONB DEFAULT '{}',
  features JSONB DEFAULT '{}',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coach profiles with tenant association
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  oauth_provider VARCHAR(20),
  oauth_id VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  profile JSONB DEFAULT '{}',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Client users under coach tenants
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id),
  email VARCHAR(255) NOT NULL,
  oauth_provider VARCHAR(20),
  oauth_id VARCHAR(255),
  coherence_data JSONB DEFAULT '{}',
  triage_status VARCHAR(20) DEFAULT 'stable',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

-- Store products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  images JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Real-time coherence data
CREATE TABLE coherence_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL,
  coherence_score DECIMAL(5, 2),
  dimensions JSONB NOT NULL,
  derivative DECIMAL(6, 4),
  source VARCHAR(50), -- 'extension', 'session', 'assessment'
  metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_clients_tenant_coach ON clients(tenant_id, coach_id);
CREATE INDEX idx_coherence_client_time ON coherence_streams(client_id, timestamp DESC);
```

---

## Deployment Configuration

### Environment Variables
```env
# OAuth Providers
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
APPLE_KEY_ID=
APPLE_TEAM_ID=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Multi-tenant Config
PLATFORM_DOMAIN=gctcoachhelper.com
WILDCARD_SSL_CERT=

# Stripe
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Services
REDIS_URL=
DATABASE_URL=
S3_BUCKET=
CLOUDFRONT_URL=

# Chrome Extension
EXTENSION_ID=
EXTENSION_SECRET=
```

This architecture provides a complete white-label platform for coaches with full customization, multi-tenant isolation, and integrated coherence monitoring capabilities.