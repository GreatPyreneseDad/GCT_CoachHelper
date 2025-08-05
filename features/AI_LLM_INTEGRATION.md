# AI/LLM Integration Module

## Overview
Enable coaches to integrate their preferred Large Language Model APIs (OpenAI, Claude, Google Gemini, etc.) to enhance coaching capabilities with AI-powered communication, analysis, and insights generation.

---

## Core Features

### 1. Multi-Provider LLM Support

#### Supported Providers
```typescript
interface LLMProvider {
  name: string;
  apiKeyRequired: boolean;
  models: ModelConfig[];
  capabilities: ProviderCapabilities;
}

const supportedProviders: LLMProvider[] = [
  {
    name: 'OpenAI',
    apiKeyRequired: true,
    models: [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000 },
      { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 16384 }
    ],
    capabilities: {
      chat: true,
      embeddings: true,
      functionCalling: true,
      streaming: true,
      vision: true
    }
  },
  {
    name: 'Anthropic',
    apiKeyRequired: true,
    models: [
      { id: 'claude-3-opus', name: 'Claude 3 Opus', maxTokens: 200000 },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', maxTokens: 200000 },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', maxTokens: 200000 }
    ],
    capabilities: {
      chat: true,
      embeddings: false,
      functionCalling: true,
      streaming: true,
      vision: true
    }
  },
  {
    name: 'Google',
    apiKeyRequired: true,
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', maxTokens: 1048576 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', maxTokens: 1048576 }
    ],
    capabilities: {
      chat: true,
      embeddings: true,
      functionCalling: true,
      streaming: true,
      vision: true
    }
  },
  {
    name: 'Local/Custom',
    apiKeyRequired: false,
    models: [
      { id: 'custom', name: 'Custom Endpoint', maxTokens: 32000 }
    ],
    capabilities: {
      chat: true,
      embeddings: false,
      functionCalling: false,
      streaming: true,
      vision: false
    }
  }
];
```

#### Provider Configuration UI
```typescript
// components/settings/LLMConfiguration.tsx
export const LLMConfiguration: React.FC = () => {
  const [provider, setProvider] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [customEndpoint, setCustomEndpoint] = useState<string>('');

  return (
    <div className="llm-configuration">
      <h3>AI Assistant Configuration</h3>
      
      <div className="provider-selection">
        <label>Select AI Provider:</label>
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="">--Select Provider--</option>
          {supportedProviders.map(p => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      {provider && (
        <>
          <div className="api-key-input">
            <label>API Key:</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <button onClick={testConnection}>Test Connection</button>
          </div>

          <div className="model-selection">
            <label>Select Model:</label>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
              {getProviderModels(provider).map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.maxTokens.toLocaleString()} tokens)
                </option>
              ))}
            </select>
          </div>

          {provider === 'Local/Custom' && (
            <div className="custom-endpoint">
              <label>Custom Endpoint URL:</label>
              <input
                type="url"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="http://localhost:8080/v1/chat"
              />
            </div>
          )}

          <div className="usage-settings">
            <h4>AI Usage Preferences</h4>
            <label>
              <input type="checkbox" name="enableSuggestions" />
              Enable AI-powered response suggestions
            </label>
            <label>
              <input type="checkbox" name="autoSummarize" />
              Automatically summarize assessments
            </label>
            <label>
              <input type="checkbox" name="generateInsights" />
              Generate AI insights from coherence patterns
            </label>
          </div>
        </>
      )}
    </div>
  );
};
```

---

## 2. AI-Powered Features

### 2.1 Assessment Summary Generation

#### Automatic Summary Creation
```typescript
class AssessmentSummarizer {
  constructor(private llmService: LLMService) {}

  async summarizeAssessment(assessment: Assessment): Promise<AssessmentSummary> {
    const prompt = this.buildSummaryPrompt(assessment);
    
    const response = await this.llmService.generate({
      messages: [
        {
          role: 'system',
          content: `You are a coaching expert specializing in Grounded Coherence Theory. 
                   Analyze assessment results and provide actionable insights.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      maxTokens: 1000
    });

    return this.parseSummaryResponse(response);
  }

  private buildSummaryPrompt(assessment: Assessment): string {
    return `
    Client Assessment Summary Request
    
    Coherence Scores:
    - Overall: ${assessment.coherence}%
    - Ψ (Consistency): ${assessment.psi}%
    - ρ (Wisdom): ${assessment.rho}%
    - q (Activation): ${assessment.q}%
    - f (Belonging): ${assessment.f}%
    
    Pattern Detected: ${assessment.pattern}
    Assessment Type: ${assessment.type}
    
    Key Responses:
    ${this.formatKeyResponses(assessment.responses)}
    
    Please provide:
    1. Executive summary (2-3 sentences)
    2. Key strengths identified
    3. Primary growth areas
    4. Recommended focus for next session
    5. Suggested interventions from our library
    6. Progress indicators to watch
    `;
  }
}
```

#### Summary Output Format
```typescript
interface AssessmentSummary {
  executiveSummary: string;
  strengths: string[];
  growthAreas: string[];
  sessionFocus: {
    dimension: string;
    rationale: string;
    objectives: string[];
  };
  recommendedInterventions: {
    code: string;
    name: string;
    reason: string;
  }[];
  progressIndicators: string[];
  coachingQuestions: string[];
}
```

### 2.2 Smart Response Suggestions

#### Real-Time Coaching Suggestions
```typescript
class CoachingAssistant {
  private conversationContext: Message[] = [];
  private clientProfile: ClientProfile;
  
  async generateSuggestion(
    clientMessage: string,
    currentCoherence: CoherenceData
  ): Promise<CoachingSuggestion> {
    // Update context
    this.conversationContext.push({
      role: 'client',
      content: clientMessage,
      coherence: currentCoherence
    });

    const prompt = `
    Current conversation context and client state:
    
    Client Message: "${clientMessage}"
    Current Coherence: ${currentCoherence.overall}%
    Trend: ${currentCoherence.derivative.trend}
    Pattern: ${this.clientProfile.pattern}
    
    Recent Context:
    ${this.formatRecentContext()}
    
    Based on GCT principles and the client's current state, suggest:
    1. A powerful coaching question
    2. A reflective statement
    3. An action-oriented response
    
    Consider the client's coherence trend and adapt your suggestions accordingly.
    `;

    const response = await this.llmService.generate({
      messages: [
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 500
    });

    return this.parseSuggestions(response);
  }

  private getSystemPrompt(): string {
    return `You are an expert coach trained in Grounded Coherence Theory.
            Your suggestions should:
            - Address the specific dimension showing lowest coherence
            - Match the client's current emotional state
            - Move them toward greater coherence
            - Be concise and powerful
            - Avoid giving advice unless specifically about the coaching process`;
  }
}
```

#### Suggestion UI Component
```typescript
// components/session/AISuggestions.tsx
export const AISuggestions: React.FC<{ 
  suggestions: CoachingSuggestion,
  onSelect: (suggestion: string) => void 
}> = ({ suggestions, onSelect }) => {
  const [selectedTab, setSelectedTab] = useState<'question' | 'reflect' | 'action'>('question');

  return (
    <div className="ai-suggestions-panel">
      <div className="suggestion-header">
        <h4>AI Coaching Assistant</h4>
        <span className="coherence-context">
          Client coherence: {suggestions.coherenceContext}% 
          {suggestions.trend === 'improving' ? '↗️' : suggestions.trend === 'declining' ? '↘️' : '→'}
        </span>
      </div>

      <div className="suggestion-tabs">
        <button 
          className={selectedTab === 'question' ? 'active' : ''}
          onClick={() => setSelectedTab('question')}
        >
          Powerful Question
        </button>
        <button 
          className={selectedTab === 'reflect' ? 'active' : ''}
          onClick={() => setSelectedTab('reflect')}
        >
          Reflection
        </button>
        <button 
          className={selectedTab === 'action' ? 'active' : ''}
          onClick={() => setSelectedTab('action')}
        >
          Action Step
        </button>
      </div>

      <div className="suggestion-content">
        {selectedTab === 'question' && (
          <SuggestionCard
            content={suggestions.question}
            rationale={suggestions.questionRationale}
            onUse={() => onSelect(suggestions.question)}
          />
        )}
        {selectedTab === 'reflect' && (
          <SuggestionCard
            content={suggestions.reflection}
            rationale={suggestions.reflectionRationale}
            onUse={() => onSelect(suggestions.reflection)}
          />
        )}
        {selectedTab === 'action' && (
          <SuggestionCard
            content={suggestions.actionStep}
            rationale={suggestions.actionRationale}
            onUse={() => onSelect(suggestions.actionStep)}
          />
        )}
      </div>
    </div>
  );
};
```

### 2.3 Pattern Analysis & Insights

#### Deep Pattern Recognition
```typescript
class PatternAnalyzer {
  async analyzeClientPatterns(
    clientId: string,
    timeRange: DateRange
  ): Promise<PatternInsights> {
    // Gather historical data
    const assessments = await this.getAssessments(clientId, timeRange);
    const sessions = await this.getSessions(clientId, timeRange);
    const interventions = await this.getInterventions(clientId, timeRange);

    const analysisPrompt = `
    Analyze the following client data for patterns and insights:
    
    Assessment History:
    ${this.formatAssessmentHistory(assessments)}
    
    Session Notes Summary:
    ${this.formatSessionNotes(sessions)}
    
    Intervention Effectiveness:
    ${this.formatInterventionData(interventions)}
    
    Please identify:
    1. Recurring patterns in the client's journey
    2. Breakthrough moments and their triggers
    3. Stagnation periods and potential causes
    4. Dimension interactions (how changes in one affect others)
    5. Predictive indicators for future progress
    6. Blind spots in the coaching approach
    7. Recommended strategic adjustments
    `;

    const response = await this.llmService.generate({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in pattern recognition and coaching analytics.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.4,
      maxTokens: 2000
    });

    return this.parsePatternInsights(response);
  }
}
```

### 2.4 Client Communication Templates

#### AI-Generated Messages
```typescript
class CommunicationAssistant {
  async generateClientMessage(
    context: MessageContext
  ): Promise<DraftMessage> {
    const templates = {
      sessionReminder: this.buildSessionReminderPrompt,
      progressUpdate: this.buildProgressUpdatePrompt,
      homeworkFollowup: this.buildHomeworkFollowupPrompt,
      encouragement: this.buildEncouragementPrompt,
      checkIn: this.buildCheckInPrompt
    };

    const prompt = templates[context.type](context);

    const response = await this.llmService.generate({
      messages: [
        {
          role: 'system',
          content: `Generate a warm, professional message that reflects the coach's voice
                   and considers the client's current coherence state and patterns.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      maxTokens: 300
    });

    return {
      subject: this.extractSubject(response),
      body: this.extractBody(response),
      tone: this.analyzeTone(response),
      personalizationPoints: this.extractPersonalization(response)
    };
  }

  private buildProgressUpdatePrompt(context: MessageContext): string {
    return `
    Create a progress update message for a client with these details:
    
    Client Name: ${context.clientName}
    Coaching Focus: ${context.coachingFocus}
    Current Coherence: ${context.currentCoherence}% (${context.coherenceTrend})
    Weeks in Program: ${context.weeksInProgram}
    Recent Breakthrough: ${context.recentBreakthrough || 'None noted'}
    Next Session: ${context.nextSessionDate}
    
    The message should:
    - Celebrate specific progress
    - Reference their coherence improvement
    - Connect to their stated goals
    - Maintain encouragement without being overly cheerful
    - Include a forward-looking element
    `;
  }
}
```

### 2.5 Session Intelligence

#### AI-Powered Session Planning
```typescript
class SessionPlanner {
  async generateSessionPlan(
    clientId: string,
    sessionNumber: number
  ): Promise<SessionPlan> {
    const clientData = await this.gatherClientContext(clientId);
    
    const planningPrompt = `
    Create a detailed session plan based on:
    
    Client Pattern: ${clientData.pattern}
    Current Focus: ${clientData.focus}
    Last Session Outcomes: ${clientData.lastSessionSummary}
    Homework Completion: ${clientData.homeworkStatus}
    Current Coherence: ${clientData.coherenceScores}
    Active Interventions: ${clientData.activeInterventions}
    
    Generate:
    1. Session objectives (3 specific, measurable goals)
    2. Opening check-in questions
    3. Main session structure with time allocations
    4. Potential resistance points and how to address them
    5. Suggested interventions based on current state
    6. Homework assignments
    7. Success metrics for the session
    `;

    const response = await this.llmService.generate({
      messages: [
        {
          role: 'system',
          content: 'You are a master coach creating strategic session plans using GCT principles.'
        },
        {
          role: 'user',
          content: planningPrompt
        }
      ],
      temperature: 0.5,
      maxTokens: 1500
    });

    return this.parseSessionPlan(response);
  }
}
```

---

## 3. Privacy & Security

### 3.1 Data Handling
```typescript
class SecureLLMService {
  private encryptionService: EncryptionService;
  
  async processWithPrivacy(
    data: SensitiveData,
    operation: LLMOperation
  ): Promise<any> {
    // Remove PII before sending to LLM
    const sanitized = this.sanitizeData(data);
    
    // Add privacy instructions to system prompt
    const privacyPrompt = `
    IMPORTANT: This is coaching data. You must:
    - Never store or remember specific client details
    - Treat all information as confidential
    - Focus on patterns and insights, not personal details
    - Use generic terms instead of real names
    `;

    // Process with LLM
    const result = await this.llmService.generate({
      messages: [
        { role: 'system', content: privacyPrompt + operation.systemPrompt },
        { role: 'user', content: sanitized }
      ],
      ...operation.parameters
    });

    // Log usage for compliance
    await this.auditLog.record({
      operation: operation.type,
      timestamp: Date.now(),
      tokenCount: result.usage.totalTokens,
      sanitizationApplied: true
    });

    return result;
  }

  private sanitizeData(data: any): string {
    // Replace names with roles
    let sanitized = JSON.stringify(data);
    sanitized = sanitized.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[CLIENT]');
    sanitized = sanitized.replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]');
    sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
    return sanitized;
  }
}
```

### 3.2 API Key Management
```typescript
// Secure storage of API keys
class APIKeyManager {
  async storeKey(provider: string, key: string): Promise<void> {
    // Encrypt key before storage
    const encrypted = await this.encrypt(key);
    
    await db.api_keys.upsert({
      coach_id: this.currentCoachId,
      provider,
      encrypted_key: encrypted,
      key_hash: this.hashKey(key),
      last_rotated: new Date(),
      is_active: true
    });
  }

  async getKey(provider: string): Promise<string> {
    const record = await db.api_keys.findOne({
      coach_id: this.currentCoachId,
      provider,
      is_active: true
    });

    if (!record) throw new Error('No API key configured');
    
    return this.decrypt(record.encrypted_key);
  }
}
```

---

## 4. Cost Management

### 4.1 Usage Tracking
```typescript
interface UsageTracker {
  trackUsage(operation: LLMOperation, response: LLMResponse): Promise<void>;
  getMonthlyUsage(coachId: string): Promise<UsageSummary>;
  setUsageLimits(coachId: string, limits: UsageLimits): Promise<void>;
  checkLimits(coachId: string, estimatedTokens: number): Promise<boolean>;
}

class TokenUsageManager implements UsageTracker {
  async trackUsage(operation: LLMOperation, response: LLMResponse): Promise<void> {
    await db.llm_usage.create({
      coach_id: operation.coachId,
      provider: operation.provider,
      model: operation.model,
      operation_type: operation.type,
      prompt_tokens: response.usage.promptTokens,
      completion_tokens: response.usage.completionTokens,
      total_tokens: response.usage.totalTokens,
      estimated_cost: this.calculateCost(operation.provider, operation.model, response.usage),
      timestamp: new Date()
    });
  }

  private calculateCost(provider: string, model: string, usage: TokenUsage): number {
    const pricing = {
      'openai': {
        'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
        'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 }
      },
      'anthropic': {
        'claude-3-opus': { prompt: 0.015, completion: 0.075 },
        'claude-3-sonnet': { prompt: 0.003, completion: 0.015 }
      }
    };

    const modelPricing = pricing[provider]?.[model];
    if (!modelPricing) return 0;

    return (usage.promptTokens * modelPricing.prompt / 1000) + 
           (usage.completionTokens * modelPricing.completion / 1000);
  }
}
```

### 4.2 Usage Dashboard
```typescript
// components/settings/AIUsageDashboard.tsx
export const AIUsageDashboard: React.FC = () => {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [limits, setLimits] = useState<UsageLimits | null>(null);

  return (
    <div className="ai-usage-dashboard">
      <h3>AI Usage This Month</h3>
      
      <div className="usage-stats">
        <div className="stat-card">
          <h4>Total Tokens</h4>
          <p className="stat-value">{usage?.totalTokens.toLocaleString()}</p>
          <p className="stat-limit">Limit: {limits?.monthlyTokens.toLocaleString()}</p>
          <ProgressBar value={usage?.totalTokens} max={limits?.monthlyTokens} />
        </div>

        <div className="stat-card">
          <h4>Estimated Cost</h4>
          <p className="stat-value">${usage?.estimatedCost.toFixed(2)}</p>
          <p className="stat-limit">Budget: ${limits?.monthlyBudget.toFixed(2)}</p>
          <ProgressBar value={usage?.estimatedCost} max={limits?.monthlyBudget} />
        </div>

        <div className="stat-card">
          <h4>Operations</h4>
          <ul>
            <li>Summaries: {usage?.operations.summaries}</li>
            <li>Suggestions: {usage?.operations.suggestions}</li>
            <li>Messages: {usage?.operations.messages}</li>
            <li>Analysis: {usage?.operations.analysis}</li>
          </ul>
        </div>
      </div>

      <div className="usage-controls">
        <h4>Usage Limits</h4>
        <label>
          Monthly Token Limit:
          <input 
            type="number" 
            value={limits?.monthlyTokens} 
            onChange={(e) => updateLimit('monthlyTokens', e.target.value)}
          />
        </label>
        <label>
          Monthly Budget ($):
          <input 
            type="number" 
            value={limits?.monthlyBudget} 
            onChange={(e) => updateLimit('monthlyBudget', e.target.value)}
          />
        </label>
        <label>
          <input type="checkbox" checked={limits?.alertAt80Percent} />
          Alert me at 80% usage
        </label>
      </div>
    </div>
  );
};
```

---

## 5. Integration Examples

### 5.1 Assessment Flow with AI
```typescript
// Enhanced assessment completion flow
async function completeAssessmentWithAI(assessmentId: string) {
  // 1. Calculate traditional coherence scores
  const scores = await calculateCoherenceScores(assessmentId);
  
  // 2. Generate AI summary if enabled
  if (coachSettings.aiEnabled && coachSettings.autoSummarize) {
    const summary = await aiService.summarizeAssessment(assessmentId, scores);
    
    // 3. Store summary with assessment
    await db.assessments.update(assessmentId, {
      ai_summary: summary,
      ai_generated_at: new Date()
    });
    
    // 4. Generate session recommendations
    const recommendations = await aiService.generateSessionRecommendations(
      scores,
      summary
    );
    
    // 5. Notify coach with insights
    await notifyCoach({
      type: 'assessment_complete',
      assessmentId,
      scores,
      summary,
      recommendations
    });
  }
}
```

### 5.2 Live Session Enhancement
```typescript
// Real-time AI assistance during sessions
class EnhancedSessionManager {
  private aiAssistant: CoachingAssistant;
  private coherenceTracker: SessionCoherenceTracker;
  
  async processClientStatement(text: string, timestamp: number) {
    // 1. Track coherence
    const coherenceData = this.coherenceTracker.trackCoherence(text, timestamp);
    
    // 2. Get AI suggestions if enabled
    if (this.coachSettings.enableSuggestions) {
      const suggestions = await this.aiAssistant.generateSuggestion(
        text,
        coherenceData
      );
      
      // 3. Display suggestions to coach
      this.ui.showSuggestions(suggestions);
    }
    
    // 4. Check for breakthrough moments
    if (coherenceData.derivative.current > 0.05) {
      const breakthroughAnalysis = await this.aiAssistant.analyzeBreakthrough(
        text,
        coherenceData,
        this.sessionContext
      );
      
      this.ui.highlightBreakthrough(breakthroughAnalysis);
    }
  }
}
```

---

## 6. Best Practices & Guidelines

### 6.1 Ethical AI Usage
1. **Transparency**: Always inform clients when AI is being used
2. **Human Override**: Coach always has final decision
3. **Privacy First**: No client data stored by AI providers
4. **Augmentation**: AI enhances, never replaces coach
5. **Continuous Learning**: Regularly review AI suggestions for bias

### 6.2 Prompt Engineering for Coaches
```typescript
// Coaching-specific prompt templates
const coachingPrompts = {
  breakthroughAnalysis: `
    Analyze this breakthrough moment:
    Context: {context}
    Statement: "{statement}"
    Coherence shift: {beforeCoherence}% → {afterCoherence}%
    
    Identify:
    1. What shifted for the client
    2. The insight they reached
    3. How to reinforce this breakthrough
    4. Next steps to maintain momentum
  `,
  
  interventionSelection: `
    Based on these client metrics:
    {metrics}
    
    Recent patterns:
    {patterns}
    
    Recommend the top 3 interventions from our library and explain why each would be effective for this specific client.
  `
};
```

This AI/LLM integration module transforms GCT CoachHelper into an intelligent coaching platform that leverages the power of modern language models while maintaining the human-centered approach essential to effective coaching.