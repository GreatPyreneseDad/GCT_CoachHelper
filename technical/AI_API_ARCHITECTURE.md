# AI API Architecture

## Overview
Technical architecture for integrating multiple LLM providers into GCT CoachHelper, enabling coaches to leverage AI for enhanced coaching capabilities while maintaining security, privacy, and cost control.

---

## System Design

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  Coach Dashboard │ Session Interface │ Settings │ Analytics     │
└────────────────────┬───────────────────────────┘                │
                     │                                             │
┌────────────────────▼───────────────────────────────────────────┐
│                      AI Service Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ LLM Gateway   │  │ Prompt Engine│  │ Response Processor │  │
│  │               │  │              │  │                    │  │
│  │ • Router      │  │ • Templates  │  │ • Parser           │  │
│  │ • Rate Limit │  │ • Builder    │  │ • Validator        │  │
│  │ • Retry      │  │ • Optimizer  │  │ • Sanitizer        │  │
│  └───────────────┘  └──────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                     │                                             
┌────────────────────▼───────────────────────────────────────────┐
│                    Provider Adapters                            │
├─────────────────────────────────────────────────────────────────┤
│  OpenAI  │  Anthropic  │  Google  │  Azure  │  Local/Custom   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. LLM Gateway Service

```typescript
// src/services/ai/LLMGateway.ts
import { RateLimiter } from 'rate-limiter-flexible';

export interface LLMRequest {
  provider: string;
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  userId: string;
  operationType: 'summary' | 'suggestion' | 'analysis' | 'message';
}

export class LLMGateway {
  private providers: Map<string, LLMProvider>;
  private rateLimiters: Map<string, RateLimiter>;
  private circuitBreakers: Map<string, CircuitBreaker>;

  constructor(
    private config: LLMConfig,
    private usageTracker: UsageTracker,
    private cache: CacheService
  ) {
    this.initializeProviders();
    this.setupRateLimiters();
    this.setupCircuitBreakers();
  }

  async request(request: LLMRequest): Promise<LLMResponse> {
    // 1. Check rate limits
    await this.checkRateLimit(request.userId, request.provider);

    // 2. Check usage limits
    const withinLimits = await this.usageTracker.checkLimits(
      request.userId,
      this.estimateTokens(request)
    );
    if (!withinLimits) {
      throw new UsageLimitExceededError();
    }

    // 3. Check cache for similar requests
    const cacheKey = this.generateCacheKey(request);
    const cached = await this.cache.get(cacheKey);
    if (cached && request.operationType !== 'message') {
      return cached;
    }

    // 4. Route to appropriate provider
    const provider = this.providers.get(request.provider);
    if (!provider) {
      throw new ProviderNotConfiguredError(request.provider);
    }

    // 5. Execute with circuit breaker
    const circuitBreaker = this.circuitBreakers.get(request.provider);
    try {
      const response = await circuitBreaker.execute(() => 
        provider.complete(request)
      );

      // 6. Track usage
      await this.usageTracker.trackUsage(request, response);

      // 7. Cache if appropriate
      if (this.shouldCache(request)) {
        await this.cache.set(cacheKey, response, this.getCacheTTL(request));
      }

      return response;
    } catch (error) {
      this.handleProviderError(error, request);
      throw error;
    }
  }

  async stream(request: LLMRequest): Promise<AsyncIterator<LLMStreamChunk>> {
    // Similar flow but returns stream
    const provider = this.providers.get(request.provider);
    return provider.stream(request);
  }

  private estimateTokens(request: LLMRequest): number {
    // Rough estimation: 1 token ≈ 4 characters
    const messageLength = request.messages
      .map(m => m.content.length)
      .reduce((a, b) => a + b, 0);
    return Math.ceil(messageLength / 4) + (request.maxTokens || 1000);
  }
}
```

### 2. Provider Adapters

```typescript
// src/services/ai/providers/OpenAIAdapter.ts
import OpenAI from 'openai';

export class OpenAIAdapter implements LLMProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const completion = await this.client.chat.completions.create({
      model: request.model,
      messages: this.transformMessages(request.messages),
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
      user: request.userId, // For abuse monitoring
    });

    return {
      content: completion.choices[0].message.content,
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      },
      model: completion.model,
      finishReason: completion.choices[0].finish_reason,
    };
  }

  async *stream(request: LLMRequest): AsyncIterator<LLMStreamChunk> {
    const stream = await this.client.chat.completions.create({
      ...this.buildRequest(request),
      stream: true,
    });

    for await (const chunk of stream) {
      yield {
        content: chunk.choices[0]?.delta?.content || '',
        isComplete: chunk.choices[0]?.finish_reason === 'stop',
      };
    }
  }

  private transformMessages(messages: Message[]): OpenAI.ChatCompletionMessageParam[] {
    return messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));
  }
}
```

```typescript
// src/services/ai/providers/AnthropicAdapter.ts
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicAdapter implements LLMProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const message = await this.client.messages.create({
      model: request.model,
      messages: this.transformMessages(request.messages),
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature,
      metadata: { user_id: request.userId },
    });

    return {
      content: message.content[0].text,
      usage: {
        promptTokens: message.usage.input_tokens,
        completionTokens: message.usage.output_tokens,
        totalTokens: message.usage.input_tokens + message.usage.output_tokens,
      },
      model: message.model,
      finishReason: message.stop_reason,
    };
  }

  private transformMessages(messages: Message[]): Anthropic.MessageParam[] {
    // Handle system message separately for Anthropic
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    return userMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
  }
}
```

### 3. Prompt Engine

```typescript
// src/services/ai/PromptEngine.ts
export class PromptEngine {
  private templates: Map<string, PromptTemplate>;

  constructor() {
    this.loadTemplates();
  }

  buildPrompt(
    operation: string,
    context: PromptContext
  ): Message[] {
    const template = this.templates.get(operation);
    if (!template) {
      throw new Error(`No template found for operation: ${operation}`);
    }

    return [
      {
        role: 'system',
        content: this.renderTemplate(template.system, context),
      },
      {
        role: 'user',
        content: this.renderTemplate(template.user, context),
      },
    ];
  }

  private loadTemplates() {
    this.templates = new Map([
      ['assessmentSummary', {
        system: `You are an expert coach trained in Grounded Coherence Theory (GCT).
                Your role is to analyze assessment results and provide actionable insights.
                Always maintain a supportive, growth-oriented tone.
                Focus on patterns and opportunities rather than deficits.`,
        user: `Analyze this client assessment:
              
              Coherence Scores:
              - Overall: {{coherence}}%
              - Ψ (Consistency): {{psi}}% - {{psiDescription}}
              - ρ (Wisdom): {{rho}}% - {{rhoDescription}}
              - q (Activation): {{q}}% - {{qDescription}}
              - f (Belonging): {{f}}% - {{fDescription}}
              
              Pattern: {{pattern}}
              Key Responses: {{keyResponses}}
              
              Provide:
              1. Executive summary (2-3 sentences)
              2. Top 3 strengths
              3. Primary growth opportunity
              4. Recommended next steps
              5. One powerful coaching question`
      }],
      ['coachingSuggestion', {
        system: `You are a coaching assistant helping generate powerful responses.
                Consider the client's current coherence state and conversation flow.
                Suggestions should be brief, impactful, and aligned with GCT principles.`,
        user: `Client just said: "{{clientMessage}}"
              
              Context:
              - Current coherence: {{coherence}}% ({{trend}})
              - Lowest dimension: {{lowestDimension}}
              - Session focus: {{sessionFocus}}
              - Time in session: {{sessionTime}} minutes
              
              Suggest:
              1. A powerful question that addresses their {{lowestDimension}}
              2. A brief reflection that validates their experience
              3. An action-oriented response that builds {{lowestDimension}}`
      }],
    ]);
  }

  private renderTemplate(template: string, context: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] || match;
    });
  }
}
```

### 4. Response Processor

```typescript
// src/services/ai/ResponseProcessor.ts
export class ResponseProcessor {
  constructor(
    private validator: ResponseValidator,
    private parser: ResponseParser,
    private sanitizer: ResponseSanitizer
  ) {}

  async process(
    rawResponse: string,
    expectedFormat: ResponseFormat
  ): Promise<ProcessedResponse> {
    // 1. Sanitize for safety
    const sanitized = this.sanitizer.clean(rawResponse);

    // 2. Parse into expected format
    const parsed = this.parser.parse(sanitized, expectedFormat);

    // 3. Validate content
    const validation = await this.validator.validate(parsed, expectedFormat);
    if (!validation.isValid) {
      throw new InvalidResponseError(validation.errors);
    }

    // 4. Post-process based on type
    return this.postProcess(parsed, expectedFormat);
  }

  private postProcess(
    parsed: any,
    format: ResponseFormat
  ): ProcessedResponse {
    switch (format) {
      case 'assessmentSummary':
        return this.processAssessmentSummary(parsed);
      case 'coachingSuggestion':
        return this.processCoachingSuggestion(parsed);
      case 'patternAnalysis':
        return this.processPatternAnalysis(parsed);
      default:
        return parsed;
    }
  }

  private processAssessmentSummary(parsed: any): AssessmentSummary {
    return {
      executiveSummary: this.limitLength(parsed.executiveSummary, 300),
      strengths: this.limitArray(parsed.strengths, 3),
      growthAreas: this.limitArray(parsed.growthAreas, 3),
      recommendedInterventions: this.mapInterventions(parsed.recommendations),
      coachingQuestion: this.validateQuestion(parsed.coachingQuestion),
    };
  }
}
```

### 5. Security & Privacy Layer

```typescript
// src/services/ai/SecurityLayer.ts
export class AISecurityLayer {
  private piiDetector: PIIDetector;
  private encryptor: Encryptor;

  async secureLLMRequest(
    request: LLMRequest,
    sensitiveData: SensitiveContext
  ): Promise<SecuredLLMRequest> {
    // 1. Detect and replace PII
    const piiMap = new Map<string, string>();
    const sanitizedMessages = request.messages.map(msg => {
      const { sanitized, replacements } = this.piiDetector.sanitize(msg.content);
      replacements.forEach((replacement, original) => {
        piiMap.set(replacement, original);
      });
      return { ...msg, content: sanitized };
    });

    // 2. Add privacy instructions
    const privacyMessage: Message = {
      role: 'system',
      content: `PRIVACY NOTICE: All personal information has been removed. 
               Use only generic references. Do not attempt to guess or generate 
               personal details. Focus on patterns and insights only.`
    };

    // 3. Create secured request
    return {
      ...request,
      messages: [privacyMessage, ...sanitizedMessages],
      metadata: {
        piiMap: await this.encryptor.encrypt(piiMap),
        originalUserId: request.userId,
        timestamp: Date.now(),
      },
    };
  }

  async restorePII(
    response: LLMResponse,
    metadata: SecuredMetadata
  ): Promise<LLMResponse> {
    const piiMap = await this.encryptor.decrypt(metadata.piiMap);
    
    let restoredContent = response.content;
    piiMap.forEach((original, placeholder) => {
      restoredContent = restoredContent.replace(
        new RegExp(placeholder, 'g'),
        original
      );
    });

    return { ...response, content: restoredContent };
  }
}
```

### 6. Cost Management Service

```typescript
// src/services/ai/CostManager.ts
export class AICostManager {
  private readonly pricingTable = {
    openai: {
      'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
    },
    anthropic: {
      'claude-3-opus': { prompt: 0.015, completion: 0.075 },
      'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
      'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 },
    },
    google: {
      'gemini-1.5-pro': { prompt: 0.00125, completion: 0.005 },
      'gemini-1.5-flash': { prompt: 0.000075, completion: 0.0003 },
    },
  };

  async checkBudget(
    userId: string,
    estimatedCost: number
  ): Promise<BudgetCheck> {
    const usage = await this.getMonthlyUsage(userId);
    const limits = await this.getUserLimits(userId);

    const projectedTotal = usage.totalCost + estimatedCost;
    const budgetRemaining = limits.monthlyBudget - projectedTotal;
    const percentUsed = (projectedTotal / limits.monthlyBudget) * 100;

    return {
      approved: projectedTotal <= limits.monthlyBudget,
      currentUsage: usage.totalCost,
      estimatedCost,
      projectedTotal,
      budgetRemaining,
      percentUsed,
      recommendation: this.getBudgetRecommendation(percentUsed, estimatedCost),
    };
  }

  private getBudgetRecommendation(
    percentUsed: number,
    operationCost: number
  ): string {
    if (percentUsed > 90) {
      return 'Budget nearly exhausted. Consider using lower-cost models.';
    } else if (percentUsed > 75) {
      return 'Approaching budget limit. Monitor usage closely.';
    } else if (operationCost > 0.50) {
      return 'This operation is expensive. Consider if full analysis is needed.';
    }
    return 'Within normal usage parameters.';
  }
}
```

### 7. Database Schema

```sql
-- API key storage
CREATE TABLE coach_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  provider VARCHAR(50) NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_hint VARCHAR(20), -- Last 4 characters for identification
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP,
  last_rotated TIMESTAMP DEFAULT NOW(),
  UNIQUE(coach_id, provider)
);

-- Usage tracking
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  client_id UUID REFERENCES clients(id),
  session_id UUID REFERENCES sessions(id),
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  operation_type VARCHAR(50) NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  estimated_cost DECIMAL(10, 4),
  response_time_ms INTEGER,
  cache_hit BOOLEAN DEFAULT false,
  error_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Monthly aggregates for quick lookups
CREATE TABLE ai_usage_monthly (
  coach_id UUID NOT NULL REFERENCES coaches(id),
  year_month VARCHAR(7) NOT NULL, -- YYYY-MM
  provider VARCHAR(50) NOT NULL,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  operation_counts JSONB DEFAULT '{}',
  last_updated TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (coach_id, year_month, provider)
);

-- AI operation results cache
CREATE TABLE ai_cache (
  cache_key VARCHAR(64) PRIMARY KEY, -- SHA-256 hash
  operation_type VARCHAR(50) NOT NULL,
  request_hash VARCHAR(64) NOT NULL,
  response_data JSONB NOT NULL,
  token_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  hit_count INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_ai_usage_coach_month ON ai_usage_logs(coach_id, created_at);
CREATE INDEX idx_ai_cache_expires ON ai_cache(expires_at);
CREATE INDEX idx_api_keys_active ON coach_api_keys(coach_id, is_active);
```

### 8. API Endpoints

```typescript
// src/routes/ai.routes.ts
router.post('/ai/configure', authenticate, async (req, res) => {
  const { provider, apiKey, model } = req.body;
  
  // Validate API key with provider
  const isValid = await validateAPIKey(provider, apiKey);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid API key' });
  }
  
  // Store encrypted
  await aiService.storeAPIKey(req.user.coachId, provider, apiKey);
  
  // Test with simple prompt
  const testResult = await aiService.testConfiguration(provider, model);
  
  res.json({
    success: true,
    testResult,
    models: getAvailableModels(provider),
  });
});

router.post('/ai/summarize/assessment/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { useCache = true } = req.body;
  
  // Check permissions
  const assessment = await assessmentService.get(id);
  if (!canAccessAssessment(req.user, assessment)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Generate summary
  const summary = await aiService.summarizeAssessment(
    assessment,
    req.user.coachId,
    { useCache }
  );
  
  res.json({ summary });
});

router.post('/ai/suggest/response', authenticate, rateLimit, async (req, res) => {
  const { sessionId, clientMessage, coherenceData } = req.body;
  
  // Verify session ownership
  if (!await ownsSession(req.user.coachId, sessionId)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Generate suggestions
  const suggestions = await aiService.generateCoachingSuggestions({
    sessionId,
    clientMessage,
    coherenceData,
    coachId: req.user.coachId,
  });
  
  res.json({ suggestions });
});

router.get('/ai/usage', authenticate, async (req, res) => {
  const { month = getCurrentMonth() } = req.query;
  
  const usage = await aiService.getUsageStats(req.user.coachId, month);
  const limits = await aiService.getLimits(req.user.coachId);
  
  res.json({ usage, limits });
});
```

---

## Deployment Considerations

### Environment Variables
```env
# AI Provider Keys (encrypted in production)
OPENAI_API_KEY_ENCRYPTION_KEY=
ANTHROPIC_API_KEY_ENCRYPTION_KEY=
GOOGLE_AI_API_KEY_ENCRYPTION_KEY=

# Rate Limiting
AI_RATE_LIMIT_PER_MINUTE=20
AI_RATE_LIMIT_PER_HOUR=100

# Caching
AI_CACHE_TTL_SECONDS=3600
AI_CACHE_MAX_SIZE_MB=100

# Cost Controls
AI_DEFAULT_MONTHLY_BUDGET=50.00
AI_DEFAULT_TOKEN_LIMIT=1000000
```

### Monitoring & Alerts
```typescript
// src/monitoring/ai-metrics.ts
export const AIMetrics = {
  requestDuration: new Histogram({
    name: 'ai_request_duration_seconds',
    help: 'AI API request duration',
    labelNames: ['provider', 'model', 'operation'],
  }),
  
  tokenUsage: new Counter({
    name: 'ai_tokens_used_total',
    help: 'Total tokens used',
    labelNames: ['provider', 'model', 'operation'],
  }),
  
  costTracking: new Counter({
    name: 'ai_cost_dollars_total',
    help: 'Total cost in dollars',
    labelNames: ['provider', 'model'],
  }),
  
  errorRate: new Counter({
    name: 'ai_errors_total',
    help: 'AI API errors',
    labelNames: ['provider', 'error_type'],
  }),
};
```

This architecture ensures secure, scalable, and cost-effective AI integration while maintaining privacy and providing coaches with powerful tools to enhance their practice.