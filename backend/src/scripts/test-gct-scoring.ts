import { calculateGCTCoherence, getCoherenceStatus } from '../utils/gct-scoring';

console.log('🧪 Testing GCT Scoring Algorithm\n');

// Test Case 1: High coherence individual
console.log('Test 1: High Coherence Individual');
const highCoherenceResponses = [
  // PSI questions
  { questionId: 'values_action_alignment', value: 9, dimension: 'psi', questionType: 'scale', weight: 1.5 },
  { questionId: 'calendar_audit_followup', value: 8, dimension: 'psi', questionType: 'scale', weight: 1.3 },
  { questionId: 'inner_conflict', value: 2, dimension: 'psi', questionType: 'scale', weight: 1.2 }, // reverse scored
  
  // RHO questions
  { questionId: 'learning_from_mistakes', value: 0.9, dimension: 'rho', questionType: 'multiple_choice' },
  { questionId: 'pattern_recognition_speed', value: 'immediately', dimension: 'rho', questionType: 'multiple_choice' },
  
  // Q questions
  { questionId: 'fear_response', value: 0.9, dimension: 'q', questionType: 'multiple_choice' },
  { questionId: 'bold_action_count', value: 8, dimension: 'q', questionType: 'multiple_choice' },
  { questionId: 'procrastination_rate', value: 0.1, dimension: 'q', questionType: 'multiple_choice' },
  
  // F questions
  { questionId: 'support_network_size', value: 5, dimension: 'f', questionType: 'multiple_choice' },
  { questionId: 'authentic_relationships', value: 0.9, dimension: 'f', questionType: 'multiple_choice' },
];

const result1 = calculateGCTCoherence(highCoherenceResponses);
console.log('Results:', {
  overall: result1.overall.toFixed(2),
  percentage: result1.percentage + '%',
  dimensions: result1.dimensions,
  status: result1.status,
});
console.log('Components:', {
  baseAlignment: result1.components.baseAlignment.toFixed(3),
  wisdomMultiplier: result1.components.wisdomMultiplier.toFixed(3),
  optimalCourage: result1.components.optimalCourage.toFixed(3),
  relationshipMultiplier: result1.components.relationshipMultiplier.toFixed(3),
});

// Test Case 2: Low coherence individual
console.log('\n\nTest 2: Low Coherence Individual');
const lowCoherenceResponses = [
  // PSI questions
  { questionId: 'values_action_alignment', value: 3, dimension: 'psi', questionType: 'scale', weight: 1.5 },
  { questionId: 'calendar_audit_followup', value: 2, dimension: 'psi', questionType: 'scale', weight: 1.3 },
  { questionId: 'inner_conflict', value: 9, dimension: 'psi', questionType: 'scale', weight: 1.2 }, // reverse scored
  
  // RHO questions
  { questionId: 'learning_from_mistakes', value: 0.2, dimension: 'rho', questionType: 'multiple_choice' },
  { questionId: 'pattern_recognition_speed', value: 'dont_notice', dimension: 'rho', questionType: 'multiple_choice' },
  
  // Q questions
  { questionId: 'fear_response', value: 0.1, dimension: 'q', questionType: 'multiple_choice' },
  { questionId: 'bold_action_count', value: 0, dimension: 'q', questionType: 'multiple_choice' },
  { questionId: 'procrastination_rate', value: 0.8, dimension: 'q', questionType: 'multiple_choice' },
  
  // F questions
  { questionId: 'support_network_size', value: 0, dimension: 'f', questionType: 'multiple_choice' },
  { questionId: 'authentic_relationships', value: 0.1, dimension: 'f', questionType: 'multiple_choice' },
];

const result2 = calculateGCTCoherence(lowCoherenceResponses);
console.log('Results:', {
  overall: result2.overall.toFixed(2),
  percentage: result2.percentage + '%',
  dimensions: result2.dimensions,
  status: result2.status,
});

// Test Case 3: Derivative calculation
console.log('\n\nTest 3: Derivative Calculation (Growth Trajectory)');
const previousScores = [
  { score: 45, timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) }, // 3 weeks ago
  { score: 48, timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }, // 2 weeks ago
  { score: 52, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },  // 1 week ago
];

const currentResponses = [
  { questionId: 'values_action_alignment', value: 6, dimension: 'psi', questionType: 'scale', weight: 1.5 },
  { questionId: 'learning_from_mistakes', value: 0.6, dimension: 'rho', questionType: 'multiple_choice' },
  { questionId: 'fear_response', value: 0.5, dimension: 'q', questionType: 'multiple_choice' },
  { questionId: 'support_network_size', value: 3, dimension: 'f', questionType: 'multiple_choice' },
];

const result3 = calculateGCTCoherence(currentResponses, previousScores);
console.log('Current Score:', result3.percentage + '%');
console.log('Weekly Derivative:', result3.derivative?.toFixed(3));
console.log('Status:', result3.status);

// Test Case 4: Status determination
console.log('\n\nTest 4: Status Determination');
const statusTests = [
  { score: 35, derivative: -0.04, expected: 'critical' },
  { score: 55, derivative: -0.02, expected: 'warning' },
  { score: 65, derivative: 0.01, expected: 'stable' },
  { score: 75, derivative: 0.02, expected: 'thriving' },
  { score: 90, derivative: 0.05, expected: 'breakthrough' },
];

statusTests.forEach(test => {
  const status = getCoherenceStatus(test.score, test.derivative);
  console.log(`Score: ${test.score}%, Derivative: ${test.derivative} => Status: ${status} (expected: ${test.expected})`);
});

// Test Case 5: Formula validation
console.log('\n\nTest 5: GCT Formula Validation');
console.log('Formula: Coherence = Ψ + (ρ × Ψ) + q_optimal + (f × Ψ)');
console.log('Testing with unit values...');

const unitTest = {
  psi: 1.0,
  rho: 0.5,
  q: 0.5,
  f: 0.5,
};

// Manual calculation
const qOpt = (1.0 * 0.5) / (0.5 + 0.5 + (0.5 * 0.5 / 2.0)); // q_optimal function
const expectedCoherence = unitTest.psi + (unitTest.rho * unitTest.psi) + qOpt + (unitTest.f * unitTest.psi);
console.log('Expected coherence:', expectedCoherence.toFixed(3));
console.log('Maximum possible coherence: 4.0');
console.log('This gives percentage:', ((expectedCoherence / 4.0) * 100).toFixed(1) + '%');

console.log('\n✅ GCT Scoring tests completed!');