/**
 * GCT (Grounded Coherence Theory) Scoring Algorithm
 * 
 * Implements the mathematical foundation for calculating coherence scores
 * based on four dimensions: PSI (Ψ), RHO (ρ), Q, and F
 * 
 * Core Formula: Coherence = Ψ + (ρ × Ψ) + q_optimal + (f × Ψ)
 */

interface DimensionScores {
  psi: number;    // Internal Consistency (0-1)
  rho: number;    // Accumulated Wisdom (0-1)
  q: number;      // Moral Activation (0-1)
  f: number;      // Social Belonging (0-1)
}

interface AssessmentResponse {
  questionId: string;
  value: number;
  dimension: string;
  questionType?: string;
  weight?: number;
}

interface CoherenceResult {
  overall: number;
  percentage: number;
  dimensions: DimensionScores;
  components: {
    baseAlignment: number;
    wisdomMultiplier: number;
    optimalCourage: number;
    relationshipMultiplier: number;
  };
  derivative?: number;
  status?: 'critical' | 'warning' | 'stable' | 'thriving' | 'breakthrough';
}

// Question weights for PSI dimension
const PSI_WEIGHTS: Record<string, number> = {
  'values_action_alignment': 1.5,
  'calendar_audit_followup': 1.3,
  'commitment_follow_through': 1.4,
  'inner_conflict': 1.2,
  'integrity_check': 1.5,
  'life_compartments': 1.1,
  'decision_clarity': 1.2,
  'self_sabotage': 1.3,
  'morning_intention': 1.0,
  'evening_reflection': 1.0,
  'goal_consistency': 1.2,
  'life_philosophy': 1.1
};

/**
 * Score scale questions (1-10 scale)
 */
function scoreScaleQuestion(value: number, reverse: boolean = false): number {
  if (reverse) {
    value = 11 - value;
  }
  return (value - 1) / 9;
}

/**
 * Score multiple choice questions
 */
function scoreMultipleChoice(selection: string): number {
  const scores: Record<string, number> = {
    'option_1': 1.0,   // Best outcome
    'option_2': 0.75,  // Good outcome
    'option_3': 0.5,   // Neutral outcome
    'option_4': 0.25,  // Poor outcome
    'option_5': 0.0    // Worst outcome
  };
  return scores[selection] || 0.5;
}

/**
 * Score frequency questions
 */
function scoreFrequency(frequency: string): number {
  const frequencyScores: Record<string, number> = {
    'Always': 1.0,
    'Usually': 0.75,
    'Sometimes': 0.5,
    'Rarely': 0.25,
    'Never': 0.0
  };
  return frequencyScores[frequency] || 0.5;
}

/**
 * Calculate PSI (Ψ) - Internal Consistency
 */
function calculatePsi(responses: AssessmentResponse[]): number {
  const psiResponses = responses.filter(r => r.dimension === 'psi' || r.dimension === 'internal_consistency');
  
  if (psiResponses.length === 0) return 0.5;
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  psiResponses.forEach(response => {
    const weight = response.weight || PSI_WEIGHTS[response.questionId] || 1.0;
    let score = response.value;
    
    // Normalize based on question type
    if (response.questionType === 'scale') {
      score = scoreScaleQuestion(response.value);
    } else if (response.questionType === 'frequency') {
      score = scoreFrequency(String(response.value));
    }
    
    totalWeight += weight;
    weightedSum += score * weight;
  });
  
  return weightedSum / totalWeight;
}

/**
 * Calculate RHO (ρ) - Accumulated Wisdom
 */
function calculateRho(responses: AssessmentResponse[]): number {
  const rhoResponses = responses.filter(r => r.dimension === 'rho' || r.dimension === 'accumulated_wisdom');
  
  if (rhoResponses.length === 0) return 0.5;
  
  // Special handling for pattern recognition speed
  const patternSpeedScores: Record<string, number> = {
    'immediately': 1.0,
    'within_days': 0.8,
    'within_weeks': 0.6,
    'after_months': 0.3,
    'dont_notice': 0.0
  };
  
  let baseScore = 0;
  let count = 0;
  
  rhoResponses.forEach(response => {
    let score = response.value;
    
    if (response.questionId === 'pattern_recognition_speed' && typeof response.value === 'string') {
      score = patternSpeedScores[response.value] || 0.5;
    } else if (response.questionType === 'scale') {
      score = scoreScaleQuestion(response.value);
    }
    
    baseScore += score;
    count++;
  });
  
  baseScore = baseScore / count;
  
  // Apply learning velocity bonus
  const learningSpeed = responses.find(r => r.questionId === 'learning_speed_average')?.value || 0.5;
  return baseScore * (1 + (learningSpeed - 0.5) * 0.2);
}

/**
 * Calculate Q - Moral Activation
 */
function calculateQ(responses: AssessmentResponse[]): number {
  const qResponses = responses.filter(r => r.dimension === 'q' || r.dimension === 'moral_activation');
  
  if (qResponses.length === 0) return 0.5;
  
  let baseScore = 0;
  let count = 0;
  
  qResponses.forEach(response => {
    let score = response.value;
    
    if (response.questionType === 'scale') {
      score = scoreScaleQuestion(response.value);
    }
    
    baseScore += score;
    count++;
  });
  
  baseScore = baseScore / count;
  
  // Bold action counter gives bonus
  const boldActions = responses.find(r => r.questionId === 'bold_action_count')?.value || 0;
  const boldBonus = Math.min(boldActions * 0.05, 0.25); // Max 25% bonus
  
  // Procrastination creates penalty
  const procrastinationRate = responses.find(r => r.questionId === 'procrastination_rate')?.value || 0;
  const procrastinationPenalty = procrastinationRate * 0.3; // Max 30% penalty
  
  return Math.max(0, Math.min(1, baseScore + boldBonus - procrastinationPenalty));
}

/**
 * Calculate F - Social Belonging
 */
function calculateF(responses: AssessmentResponse[]): number {
  const fResponses = responses.filter(r => r.dimension === 'f' || r.dimension === 'social_belonging');
  
  if (fResponses.length === 0) return 0.5;
  
  // Support network size has diminishing returns
  const supportCount = responses.find(r => r.questionId === 'support_network_size')?.value || 0;
  const supportScore = 1 - Math.exp(-supportCount / 3); // Asymptotic curve
  
  // Calculate quality score
  let qualityScore = 0;
  let qualityCount = 0;
  
  fResponses.forEach(response => {
    if (response.questionId !== 'support_network_size') {
      let score = response.value;
      
      if (response.questionType === 'scale') {
        score = scoreScaleQuestion(response.value);
      }
      
      qualityScore += score;
      qualityCount++;
    }
  });
  
  if (qualityCount > 0) {
    qualityScore = qualityScore / qualityCount;
  }
  
  // Relationship quality matters more than quantity
  const qualityWeight = 0.7;
  const quantityWeight = 0.3;
  
  return (qualityScore * qualityWeight) + (supportScore * quantityWeight);
}

/**
 * Calculate optimal q function (prevents over-activation)
 */
function qOptimal(qRaw: number): number {
  const qMax = 1.0;
  const Km = 0.5;    // Michaelis constant - half-maximal activation
  const Ki = 2.0;    // Inhibition constant
  
  return (qMax * qRaw) / (Km + qRaw + (qRaw * qRaw / Ki));
}

/**
 * Calculate overall GCT coherence score using the official formula
 */
function calculateOverallCoherence(dimensions: DimensionScores): CoherenceResult {
  const { psi, rho, q, f } = dimensions;
  
  // Apply the GCT formula: Coherence = Ψ + (ρ × Ψ) + q_optimal + (f × Ψ)
  const baseAlignment = psi;
  const wisdomMultiplier = rho * psi;
  const optimalCourage = qOptimal(q);
  const relationshipMultiplier = f * psi;
  
  const coherence = baseAlignment + wisdomMultiplier + optimalCourage + relationshipMultiplier;
  
  // Theoretical maximum is 4.0
  const maxCoherence = 4.0;
  
  // Convert to percentage
  const percentage = (coherence / maxCoherence) * 100;
  
  return {
    overall: coherence,
    percentage: Math.round(percentage),
    dimensions: {
      psi: Math.round(psi * 100),
      rho: Math.round(rho * 100),
      q: Math.round(q * 100),
      f: Math.round(f * 100),
    },
    components: {
      baseAlignment,
      wisdomMultiplier,
      optimalCourage,
      relationshipMultiplier,
    },
  };
}

/**
 * Calculate coherence derivative (rate of change)
 */
function calculateDerivative(
  currentScore: number,
  previousScores: Array<{ score: number; timestamp: Date }>
): number {
  if (previousScores.length < 2) return 0;
  
  // Sort by timestamp
  const sorted = [...previousScores].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );
  
  // Use linear regression for more accurate derivative
  const n = sorted.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  const firstTime = sorted[0].timestamp.getTime();
  
  sorted.forEach((point) => {
    // Convert time to days from first measurement
    const x = (point.timestamp.getTime() - firstTime) / (1000 * 60 * 60 * 24);
    const y = point.score / 100; // Normalize to 0-1
    
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });
  
  // Calculate slope (rate of change per day)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  // Return as weekly rate
  return slope * 7;
}

/**
 * Determine coherence status based on score and derivative
 */
export function getCoherenceStatus(
  score: number,
  derivative: number = 0
): 'critical' | 'warning' | 'stable' | 'thriving' | 'breakthrough' {
  // Convert daily derivative thresholds to weekly
  const rapidGrowth = 0.005 * 7;    // > 0.035/week
  const steadyGrowth = 0.001 * 7;   // > 0.007/week
  const slowDecline = -0.005 * 7;   // > -0.035/week
  
  // Critical: Low score or rapidly declining
  if (score < 40 || (score < 60 && derivative < slowDecline)) {
    return 'critical';
  }
  
  // Warning: Below average or declining
  if (score < 60 || derivative < -0.01) {
    return 'warning';
  }
  
  // Breakthrough: High score and rapidly improving
  if (score > 85 && derivative > rapidGrowth) {
    return 'breakthrough';
  }
  
  // Thriving: Good score and improving
  if (score > 70 && derivative > steadyGrowth) {
    return 'thriving';
  }
  
  // Stable: Default state
  return 'stable';
}

/**
 * Main function to calculate GCT coherence from assessment responses
 */
export function calculateGCTCoherence(
  responses: AssessmentResponse[],
  previousScores?: Array<{ score: number; timestamp: Date }>
): CoherenceResult {
  // Calculate individual dimensions
  const dimensions: DimensionScores = {
    psi: calculatePsi(responses),
    rho: calculateRho(responses),
    q: calculateQ(responses),
    f: calculateF(responses),
  };
  
  // Calculate overall coherence using GCT formula
  const result = calculateOverallCoherence(dimensions);
  
  // Calculate derivative if previous scores provided
  if (previousScores && previousScores.length > 0) {
    const allScores = [...previousScores, { score: result.percentage, timestamp: new Date() }];
    result.derivative = calculateDerivative(result.percentage, allScores);
  }
  
  // Determine status
  result.status = getCoherenceStatus(result.percentage, result.derivative || 0);
  
  return result;
}

/**
 * Validate assessment responses for consistency
 */
export function validateConsistency(responses: Record<string, any>): Array<{
  type: string;
  severity: string;
  message: string;
}> {
  const inconsistencies = [];
  
  // Check: commitment keeping vs self-sabotage
  if (responses['commitment_follow_through'] > 0.8 && 
      responses['self_sabotage_frequency'] > 0.6) {
    inconsistencies.push({
      type: 'commitment_sabotage_mismatch',
      severity: 'moderate',
      message: 'High commitment keeping but also high self-sabotage'
    });
  }
  
  // Check: wisdom vs pattern repetition
  if (responses['learning_from_mistakes'] > 0.8 && 
      responses['pattern_recognition'] < 0.3) {
    inconsistencies.push({
      type: 'wisdom_pattern_mismatch',
      severity: 'high',
      message: 'Claims to learn but doesn\'t recognize patterns'
    });
  }
  
  // Check: courage vs action
  if (responses['fear_response'] > 0.8 && 
      responses['bold_action_count'] === 0) {
    inconsistencies.push({
      type: 'courage_action_mismatch',
      severity: 'moderate',
      message: 'Claims courage but no bold actions'
    });
  }
  
  return inconsistencies;
}

// Export all functions for testing
export {
  calculatePsi,
  calculateRho,
  calculateQ,
  calculateF,
  calculateOverallCoherence,
  calculateDerivative,
  qOptimal,
  DimensionScores,
  AssessmentResponse,
  CoherenceResult,
};