# Real-Time Monitoring Integration Architecture

## Overview
Technical implementation guide for integrating the coherence derivative tracker and conversation analyzer from GCT Assistant into the CoachHelper platform.

---

## System Architecture

### Component Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                     CoachHelper Platform                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌───────────┐│
│  │ Session Manager │    │ Real-Time Engine  │    │ Analytics ││
│  │                 │───▶│                   │───▶│  Engine   ││
│  │ • Video/Audio   │    │ • Coherence Calc  │    │           ││
│  │ • Text Chat     │    │ • Derivative Track │    │ • Storage ││
│  │ • AI Monitor    │    │ • Pattern Detect  │    │ • ML      ││
│  └─────────────────┘    └──────────────────┘    └───────────┘│
│           ▲                       │                      │      │
│           │                       ▼                      ▼      │
│  ┌─────────────────┐    ┌──────────────────┐    ┌───────────┐│
│  │ Client Portal   │    │ Coach Dashboard  │    │   APIs    ││
│  │                 │    │                   │    │           ││
│  │ • Extension     │    │ • Live Monitor   │    │ • REST    ││
│  │ • Web App       │    │ • Alerts         │    │ • WS      ││
│  │ • Mobile        │    │ • Analytics      │    │ • GraphQL ││
│  └─────────────────┘    └──────────────────┘    └───────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Integration Points

### 1. Real-Time Engine Implementation

#### 1.1 Coherence Calculation Service
```typescript
// src/services/coherence/RealTimeCoherenceService.ts
import { CoherenceAnalyzer } from '@gct/coherence-analyzer';

export class RealTimeCoherenceService {
  private analyzer: CoherenceAnalyzer;
  private sessions: Map<string, SessionTracker>;
  
  constructor() {
    this.analyzer = new CoherenceAnalyzer();
    this.sessions = new Map();
  }

  startSession(sessionId: string, clientId: string) {
    this.sessions.set(sessionId, {
      clientId,
      startTime: Date.now(),
      analyzer: new CoherenceAnalyzer(),
      scoreLog: [],
      conversationLog: []
    });
  }

  processText(sessionId: string, text: string, speaker: 'client' | 'coach') {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    if (speaker === 'client') {
      const analysis = session.analyzer.analyzeResponse(text, null, `msg_${Date.now()}`);
      
      // Emit real-time update
      this.emitUpdate(sessionId, {
        coherence: analysis.metrics,
        derivative: analysis.derivative,
        insights: analysis.insights
      });
      
      // Store for persistence
      this.storeAnalysis(sessionId, analysis);
      
      // Check alerts
      this.checkAlerts(session, analysis);
    }
    
    return analysis;
  }

  private checkAlerts(session: SessionTracker, analysis: AnalysisResult) {
    // Breakthrough detection
    if (analysis.derivative.average > 0.05) {
      this.emitAlert(session.sessionId, {
        type: 'breakthrough',
        severity: 'positive',
        message: 'Client experiencing breakthrough moment',
        suggestedAction: 'Acknowledge and reinforce the insight'
      });
    }
    
    // Stagnation detection
    if (this.detectStagnation(session.scoreLog)) {
      this.emitAlert(session.sessionId, {
        type: 'stagnation',
        severity: 'warning',
        message: 'Conversation may be stuck',
        suggestedAction: 'Try a pattern interrupt or new perspective'
      });
    }
    
    // Rehabilitation-specific alerts
    if (session.clientProfile?.type === 'rehabilitation') {
      this.checkRehabilitationAlerts(session, analysis);
    }
  }
}
```

#### 1.2 WebSocket Integration
```typescript
// src/websocket/CoherenceWebSocket.ts
export class CoherenceWebSocket {
  private io: Server;
  private coherenceService: RealTimeCoherenceService;

  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: { origin: process.env.CLIENT_URL }
    });
    
    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      socket.on('join-session', ({ sessionId, role }) => {
        socket.join(`session:${sessionId}`);
        socket.join(`session:${sessionId}:${role}`);
      });

      socket.on('transcription', ({ sessionId, text, speaker }) => {
        const analysis = this.coherenceService.processText(sessionId, text, speaker);
        
        // Send to coach dashboard
        this.io.to(`session:${sessionId}:coach`).emit('coherence-update', {
          analysis,
          timestamp: Date.now()
        });
        
        // Send simplified version to client if enabled
        if (this.shouldShareWithClient(sessionId)) {
          this.io.to(`session:${sessionId}:client`).emit('progress-update', {
            coherence: analysis.metrics.overall,
            trend: analysis.derivative.trend
          });
        }
      });
    });
  }
}
```

### 2. Audio/Video Integration

#### 2.1 Speech-to-Text Pipeline
```typescript
// src/services/transcription/TranscriptionService.ts
export class TranscriptionService {
  private speechClient: SpeechClient;
  private audioProcessor: AudioProcessor;

  async processAudioStream(stream: MediaStream, sessionId: string) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    
    // Process audio chunks
    this.audioProcessor.on('audioChunk', async (chunk) => {
      const transcript = await this.transcribeChunk(chunk);
      
      if (transcript.text.length > 10) {
        // Send to coherence analyzer
        EventBus.emit('transcription', {
          sessionId,
          text: transcript.text,
          speaker: transcript.speaker,
          confidence: transcript.confidence
        });
      }
    });
  }

  private async transcribeChunk(chunk: AudioChunk): Promise<Transcript> {
    // Use Google Speech-to-Text or similar
    const response = await this.speechClient.recognize({
      audio: { content: chunk.data },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        enableSpeakerDiarization: true,
        enableAutomaticPunctuation: true
      }
    });

    return this.processTranscript(response);
  }
}
```

#### 2.2 Video Session Component
```typescript
// src/components/session/VideoSession.tsx
export const VideoSession: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [coherenceData, setCoherenceData] = useState<CoherenceData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  useEffect(() => {
    const socket = io();
    
    socket.emit('join-session', { sessionId, role: 'coach' });
    
    socket.on('coherence-update', (data) => {
      setCoherenceData(data.analysis);
      updateCoherenceGraph(data.analysis);
    });
    
    socket.on('alert', (alert) => {
      setAlerts(prev => [...prev, alert]);
      showAlertNotification(alert);
    });
    
    return () => socket.disconnect();
  }, [sessionId]);

  return (
    <div className="video-session-container">
      <div className="video-area">
        <VideoCall sessionId={sessionId} onAudioStream={handleAudioStream} />
      </div>
      
      <div className="coherence-sidebar">
        <CoherenceMonitor data={coherenceData} />
        <DerivativeGraph data={coherenceData?.scoreLog} />
        <AlertPanel alerts={alerts} />
      </div>
    </div>
  );
};
```

### 3. Client Browser Extension

#### 3.1 Extension Architecture
```typescript
// extension/src/content/CoachHelperExtension.ts
export class CoachHelperExtension {
  private coherenceAnalyzer: CoherenceAnalyzer;
  private apiClient: APIClient;
  private widget: CoherenceWidget;

  async initialize() {
    // Check if on supported platform
    const platform = this.detectPlatform();
    if (!platform) return;

    // Authenticate with CoachHelper
    const auth = await this.authenticate();
    if (!auth.success) return;

    // Start monitoring
    this.startMonitoring(platform);
    this.widget.show();
  }

  private startMonitoring(platform: Platform) {
    const observer = new MutationObserver((mutations) => {
      const newMessages = this.detectNewMessages(mutations, platform);
      
      newMessages.forEach(message => {
        const analysis = this.coherenceAnalyzer.analyzeResponse(
          message.text,
          message.context
        );
        
        // Update local widget
        this.widget.update(analysis);
        
        // Send to coach if in session
        if (this.isInCoachingSession()) {
          this.apiClient.sendCoherenceUpdate({
            source: 'browser_extension',
            platform: platform.name,
            analysis,
            timestamp: Date.now()
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
}
```

#### 3.2 Widget Component
```typescript
// extension/src/components/Widget.tsx
export const CoherenceWidget: React.FC = () => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <ShadowRoot>
      <div className={`coherence-widget ${isMinimized ? 'minimized' : ''}`}>
        <header>
          <h3>Coherence Monitor</h3>
          <button onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? '⬆' : '⬇'}
          </button>
        </header>
        
        {!isMinimized && analysis && (
          <div className="widget-body">
            <CoherenceScore value={analysis.metrics.overall} />
            <DimensionBreakdown dimensions={analysis.metrics} />
            <DerivativeIndicator derivative={analysis.derivative} />
            <MiniGraph data={analysis.scoreLog} />
          </div>
        )}
      </div>
    </ShadowRoot>
  );
};
```

### 4. Database Schema Updates

#### 4.1 Real-Time Tables
```sql
-- Real-time coherence tracking
CREATE TABLE coherence_realtime (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  timestamp TIMESTAMP NOT NULL,
  speaker VARCHAR(10) NOT NULL,
  text TEXT,
  psi_score DECIMAL(3,2),
  rho_score DECIMAL(3,2),
  q_score DECIMAL(3,2),
  f_score DECIMAL(3,2),
  overall_score DECIMAL(3,2),
  derivative_instant DECIMAL(5,4),
  derivative_average DECIMAL(5,4),
  trend VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_coherence_realtime_session_timestamp 
ON coherence_realtime(session_id, timestamp);

-- Alerts table
CREATE TABLE session_alerts (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  suggested_action TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. API Endpoints

#### 5.1 Real-Time Endpoints
```typescript
// src/routes/realtime.ts
router.post('/sessions/:sessionId/coherence', async (req, res) => {
  const { sessionId } = req.params;
  const { text, speaker, timestamp } = req.body;
  
  const analysis = await coherenceService.processText(sessionId, text, speaker);
  
  // Store in database
  await db.coherence_realtime.create({
    session_id: sessionId,
    timestamp,
    speaker,
    text,
    ...analysis.metrics,
    derivative_instant: analysis.derivative.current,
    derivative_average: analysis.derivative.average,
    trend: analysis.derivative.trend
  });
  
  res.json({ analysis });
});

router.get('/sessions/:sessionId/coherence/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  const listener = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  eventBus.on(`coherence:${req.params.sessionId}`, listener);
  
  req.on('close', () => {
    eventBus.off(`coherence:${req.params.sessionId}`, listener);
  });
});
```

---

## Deployment Considerations

### Performance Requirements
- Coherence calculation: <100ms per message
- WebSocket latency: <50ms
- Transcription latency: <2s
- Graph update rate: 60fps

### Scaling Strategy
```yaml
# kubernetes/coherence-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coherence-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: coherence
        image: gctcoachhelper/coherence-service:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        env:
        - name: REDIS_URL
          value: redis://redis-cluster:6379
        - name: ENABLE_CLUSTERING
          value: "true"
```

### Monitoring & Observability
```typescript
// src/monitoring/coherence-metrics.ts
export const CoherenceMetrics = {
  processingTime: new Histogram({
    name: 'coherence_processing_duration_seconds',
    help: 'Time to calculate coherence scores',
    labelNames: ['session_type', 'client_type']
  }),
  
  alertsGenerated: new Counter({
    name: 'coherence_alerts_total',
    help: 'Total alerts generated',
    labelNames: ['alert_type', 'severity']
  }),
  
  activeMonitoringSessions: new Gauge({
    name: 'coherence_active_sessions',
    help: 'Number of active monitoring sessions'
  })
};
```

This integration architecture ensures seamless real-time coherence monitoring across all coaching interactions while maintaining performance and scalability.