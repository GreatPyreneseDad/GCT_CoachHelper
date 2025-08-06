/**
 * GCT Assessment Questions
 * Based on the four dimensions: PSI (Ψ), RHO (ρ), Q, and F
 */

export interface GCTQuestion {
  id: string;
  dimension: 'psi' | 'rho' | 'q' | 'f';
  text: string;
  type: 'scale' | 'multiple_choice' | 'frequency' | 'text';
  options?: Array<{ value: string; label: string; score?: number }>;
  weight: number;
  reverse?: boolean;
}

export const GCT_INITIAL_ASSESSMENT: GCTQuestion[] = [
  // Part 1: Internal Consistency (Ψ)
  {
    id: 'values_action_alignment',
    dimension: 'psi',
    text: 'On a scale of 1-10, how well do your daily actions reflect your stated values?',
    type: 'scale',
    weight: 1.5,
  },
  {
    id: 'calendar_audit_followup',
    dimension: 'psi',
    text: 'If someone looked at your calendar for the last month, would it reflect what you say matters most to you?',
    type: 'scale',
    weight: 1.3,
  },
  {
    id: 'goal_consistency',
    dimension: 'psi',
    text: 'Think about a major goal you\'ve had for over 6 months. How consistently do you work toward it?',
    type: 'multiple_choice',
    options: [
      { value: 'daily', label: 'Daily actions toward the goal', score: 1.0 },
      { value: 'weekly', label: 'Weekly progress with some gaps', score: 0.75 },
      { value: 'monthly', label: 'Monthly bursts of activity', score: 0.5 },
      { value: 'rarely', label: 'Rarely take action despite wanting to', score: 0.25 },
      { value: 'abandoned', label: 'I\'ve essentially abandoned it', score: 0.0 },
    ],
    weight: 1.2,
  },
  {
    id: 'inner_conflict',
    dimension: 'psi',
    text: 'How often do you experience inner conflict between different parts of yourself?',
    type: 'frequency',
    options: [
      { value: 'rarely', label: 'Rarely - I feel unified in my decisions', score: 1.0 },
      { value: 'sometimes', label: 'Sometimes - occasional internal debates', score: 0.75 },
      { value: 'often', label: 'Often - frequent "should vs want" battles', score: 0.5 },
      { value: 'constantly', label: 'Constantly - I feel like multiple people inside', score: 0.25 },
    ],
    weight: 1.2,
    reverse: true,
  },
  {
    id: 'integrity_check',
    dimension: 'psi',
    text: 'In the last month, how often did you do something that went against your values?',
    type: 'frequency',
    options: [
      { value: 'never', label: 'Never', score: 1.0 },
      { value: 'once_twice', label: 'Once or twice', score: 0.8 },
      { value: 'weekly', label: 'Weekly', score: 0.5 },
      { value: 'several_weekly', label: 'Several times per week', score: 0.25 },
      { value: 'daily', label: 'Daily', score: 0.0 },
    ],
    weight: 1.5,
    reverse: true,
  },
  {
    id: 'commitment_follow_through',
    dimension: 'psi',
    text: 'When you make commitments to yourself, how often do you keep them?',
    type: 'multiple_choice',
    options: [
      { value: '90_100', label: '90-100% of the time', score: 1.0 },
      { value: '70_89', label: '70-89% of the time', score: 0.8 },
      { value: '50_69', label: '50-69% of the time', score: 0.6 },
      { value: '30_49', label: '30-49% of the time', score: 0.4 },
      { value: 'less_30', label: 'Less than 30% of the time', score: 0.2 },
    ],
    weight: 1.4,
  },
  {
    id: 'life_compartments',
    dimension: 'psi',
    text: 'How integrated vs compartmentalized do you feel your life is?',
    type: 'multiple_choice',
    options: [
      { value: 'fully_integrated', label: 'Fully integrated - I\'m the same person everywhere', score: 1.0 },
      { value: 'mostly_integrated', label: 'Mostly integrated with minor adjustments', score: 0.8 },
      { value: 'somewhat_compartmentalized', label: 'Somewhat compartmentalized by necessity', score: 0.6 },
      { value: 'very_compartmentalized', label: 'Very compartmentalized - different personas', score: 0.3 },
      { value: 'completely_fragmented', label: 'Completely fragmented - no connection between areas', score: 0.0 },
    ],
    weight: 1.1,
  },
  {
    id: 'decision_clarity',
    dimension: 'psi',
    text: 'When making important decisions, how clear are you on what you truly want?',
    type: 'scale',
    weight: 1.2,
  },
  {
    id: 'self_sabotage',
    dimension: 'psi',
    text: 'How often do you find yourself sabotaging your own progress?',
    type: 'frequency',
    options: [
      { value: 'never', label: 'Never - I\'m my own best ally', score: 1.0 },
      { value: 'rarely', label: 'Rarely - occasional slip-ups', score: 0.8 },
      { value: 'sometimes', label: 'Sometimes - noticeable pattern', score: 0.5 },
      { value: 'often', label: 'Often - regular self-sabotage', score: 0.25 },
      { value: 'constantly', label: 'Constantly - I\'m my own worst enemy', score: 0.0 },
    ],
    weight: 1.3,
    reverse: true,
  },
  {
    id: 'morning_intention',
    dimension: 'psi',
    text: 'How often do you start your day with clear intention aligned to your values?',
    type: 'frequency',
    options: [
      { value: 'every_day', label: 'Every day', score: 1.0 },
      { value: '5_6_days', label: '5-6 days per week', score: 0.85 },
      { value: '3_4_days', label: '3-4 days per week', score: 0.6 },
      { value: '1_2_days', label: '1-2 days per week', score: 0.3 },
      { value: 'rarely_never', label: 'Rarely or never', score: 0.0 },
    ],
    weight: 1.0,
  },
  {
    id: 'evening_reflection',
    dimension: 'psi',
    text: 'Before bed, I feel my day was well-spent and aligned with my priorities:',
    type: 'frequency',
    options: [
      { value: 'almost_always', label: 'Almost always', score: 1.0 },
      { value: 'usually', label: 'Usually', score: 0.75 },
      { value: 'sometimes', label: 'Sometimes', score: 0.5 },
      { value: 'rarely', label: 'Rarely', score: 0.25 },
      { value: 'almost_never', label: 'Almost never', score: 0.0 },
    ],
    weight: 1.0,
  },
  {
    id: 'life_philosophy',
    dimension: 'psi',
    text: 'I have a clear life philosophy that guides my daily decisions:',
    type: 'scale',
    weight: 1.1,
  },

  // Part 2: Accumulated Wisdom (ρ)
  {
    id: 'learning_from_mistakes',
    dimension: 'rho',
    text: 'When something goes wrong in your life, what\'s your typical response?',
    type: 'multiple_choice',
    options: [
      { value: 'deep_reflection', label: 'Deep reflection to extract lessons', score: 1.0 },
      { value: 'some_analysis', label: 'Some analysis of what happened', score: 0.75 },
      { value: 'brief_acknowledgment', label: 'Brief acknowledgment then move on', score: 0.5 },
      { value: 'blame_others', label: 'Blame circumstances or others', score: 0.25 },
      { value: 'repeat_patterns', label: 'Repeat the same patterns', score: 0.0 },
    ],
    weight: 1.2,
  },
  {
    id: 'pattern_recognition_speed',
    dimension: 'rho',
    text: 'How quickly do you recognize when you\'re repeating an unhelpful pattern?',
    type: 'multiple_choice',
    options: [
      { value: 'immediately', label: 'Immediately - I catch myself in the moment', score: 1.0 },
      { value: 'within_days', label: 'Within days - I notice soon after', score: 0.8 },
      { value: 'within_weeks', label: 'Within weeks - It takes some time', score: 0.6 },
      { value: 'after_months', label: 'After months - Usually others point it out', score: 0.3 },
      { value: 'dont_notice', label: 'I don\'t notice patterns', score: 0.0 },
    ],
    weight: 1.3,
  },
  {
    id: 'cross_domain_learning',
    dimension: 'rho',
    text: 'How often do you apply lessons from one area of life to another?',
    type: 'frequency',
    options: [
      { value: 'constantly', label: 'Constantly - I see connections everywhere', score: 1.0 },
      { value: 'frequently', label: 'Frequently - I make connections often', score: 0.8 },
      { value: 'sometimes', label: 'Sometimes - When it\'s obvious', score: 0.5 },
      { value: 'rarely', label: 'Rarely - I keep areas separate', score: 0.25 },
      { value: 'never', label: 'Never - Each situation is unique', score: 0.0 },
    ],
    weight: 1.0,
  },
  {
    id: 'mistake_integration',
    dimension: 'rho',
    text: 'Think about your biggest mistake from 5 years ago. How has it influenced your life?',
    type: 'multiple_choice',
    options: [
      { value: 'transformed', label: 'Transformed how I approach similar situations', score: 1.0 },
      { value: 'significantly_changed', label: 'Significantly changed my behavior', score: 0.8 },
      { value: 'moderate_adjustments', label: 'Some moderate adjustments', score: 0.5 },
      { value: 'minor_influence', label: 'Minor influence on decisions', score: 0.25 },
      { value: 'no_impact', label: 'No impact - would probably repeat it', score: 0.0 },
    ],
    weight: 1.2,
  },
  {
    id: 'advice_application',
    dimension: 'rho',
    text: 'When you receive good advice, how likely are you to actually implement it?',
    type: 'multiple_choice',
    options: [
      { value: 'very_likely', label: 'Very likely - I actively seek and apply wisdom', score: 1.0 },
      { value: 'likely', label: 'Likely - I usually try suggestions', score: 0.75 },
      { value: 'somewhat_likely', label: 'Somewhat likely - If it resonates', score: 0.5 },
      { value: 'unlikely', label: 'Unlikely - I prefer my own way', score: 0.25 },
      { value: 'very_unlikely', label: 'Very unlikely - I rarely take advice', score: 0.0 },
    ],
    weight: 0.9,
  },
  {
    id: 'wisdom_sharing',
    dimension: 'rho',
    text: 'How often do others seek your advice based on your life experience?',
    type: 'frequency',
    options: [
      { value: 'very_frequently', label: 'Very frequently - I\'m a go-to person', score: 1.0 },
      { value: 'often', label: 'Often - People value my perspective', score: 0.75 },
      { value: 'sometimes', label: 'Sometimes - Occasional requests', score: 0.5 },
      { value: 'rarely', label: 'Rarely - Few ask my opinion', score: 0.25 },
      { value: 'never', label: 'Never - No one seeks my wisdom', score: 0.0 },
    ],
    weight: 0.8,
  },

  // Part 3: Moral Activation (q)
  {
    id: 'difficult_conversations',
    dimension: 'q',
    text: 'When you know a difficult conversation is needed, how quickly do you initiate it?',
    type: 'multiple_choice',
    options: [
      { value: 'immediately', label: 'Immediately - I don\'t delay', score: 1.0 },
      { value: 'within_days', label: 'Within a few days', score: 0.75 },
      { value: 'within_weeks', label: 'Within a few weeks', score: 0.5 },
      { value: 'after_months', label: 'After months of avoiding', score: 0.25 },
      { value: 'never', label: 'I almost never initiate them', score: 0.0 },
    ],
    weight: 1.2,
  },
  {
    id: 'comfort_zone',
    dimension: 'q',
    text: 'How often do you intentionally step outside your comfort zone?',
    type: 'frequency',
    options: [
      { value: 'daily', label: 'Daily - Constant growth edge', score: 1.0 },
      { value: 'weekly', label: 'Weekly - Regular challenges', score: 0.8 },
      { value: 'monthly', label: 'Monthly - Periodic pushes', score: 0.5 },
      { value: 'rarely', label: 'Rarely - Only when forced', score: 0.25 },
      { value: 'never', label: 'Never - I stay comfortable', score: 0.0 },
    ],
    weight: 1.1,
  },
  {
    id: 'fear_response',
    dimension: 'q',
    text: 'When fear arises about taking action, what happens?',
    type: 'multiple_choice',
    options: [
      { value: 'act_despite', label: 'I act despite the fear', score: 1.0 },
      { value: 'pause_then_act', label: 'I pause, then usually act', score: 0.75 },
      { value: 'fifty_fifty', label: '50/50 whether I act or not', score: 0.5 },
      { value: 'usually_stop', label: 'I usually let fear stop me', score: 0.25 },
      { value: 'fear_wins', label: 'Fear always wins', score: 0.0 },
    ],
    weight: 1.3,
  },
  {
    id: 'bold_action_count',
    dimension: 'q',
    text: 'In the last 3 months, how many bold actions have you taken toward your goals?',
    type: 'multiple_choice',
    options: [
      { value: '10_plus', label: '10+ bold moves', score: 10 },
      { value: '5_9', label: '5-9 bold moves', score: 7 },
      { value: '2_4', label: '2-4 bold moves', score: 3 },
      { value: '1', label: '1 bold move', score: 1 },
      { value: '0', label: 'No bold moves', score: 0 },
    ],
    weight: 1.0,
  },
  {
    id: 'procrastination_rate',
    dimension: 'q',
    text: 'What percentage of important tasks do you procrastinate on?',
    type: 'multiple_choice',
    options: [
      { value: 'less_10', label: 'Less than 10%', score: 0.1 },
      { value: '10_25', label: '10-25%', score: 0.175 },
      { value: '26_50', label: '26-50%', score: 0.38 },
      { value: '51_75', label: '51-75%', score: 0.63 },
      { value: 'more_75', label: 'More than 75%', score: 0.875 },
    ],
    weight: 1.0,
  },

  // Part 4: Social Belonging (f)
  {
    id: 'support_network_size',
    dimension: 'f',
    text: 'How many people could you call at 2 AM in a crisis who would answer and help?',
    type: 'multiple_choice',
    options: [
      { value: '5_plus', label: '5 or more', score: 5 },
      { value: '3_4', label: '3-4 people', score: 3.5 },
      { value: '1_2', label: '1-2 people', score: 1.5 },
      { value: 'maybe_1', label: 'Maybe 1 person', score: 0.5 },
      { value: '0', label: 'No one', score: 0 },
    ],
    weight: 1.0,
  },
  {
    id: 'authentic_relationships',
    dimension: 'f',
    text: 'In how many relationships can you be completely yourself?',
    type: 'multiple_choice',
    options: [
      { value: 'many', label: 'Many (5+)', score: 1.0 },
      { value: 'several', label: 'Several (3-4)', score: 0.8 },
      { value: 'few', label: 'A few (1-2)', score: 0.5 },
      { value: 'maybe_one', label: 'Maybe one', score: 0.25 },
      { value: 'none', label: 'None', score: 0.0 },
    ],
    weight: 1.2,
  },
  {
    id: 'relationship_quality',
    dimension: 'f',
    text: 'The majority of your relationships are:',
    type: 'multiple_choice',
    options: [
      { value: 'deep_nurturing', label: 'Deep and nurturing', score: 1.0 },
      { value: 'positive_supportive', label: 'Positive and supportive', score: 0.75 },
      { value: 'mixed', label: 'Mixed bag', score: 0.5 },
      { value: 'superficial_draining', label: 'Superficial or draining', score: 0.25 },
      { value: 'toxic_absent', label: 'Toxic or absent', score: 0.0 },
    ],
    weight: 1.1,
  },
  {
    id: 'vulnerability_practice',
    dimension: 'f',
    text: 'How often do you share vulnerabilities with others?',
    type: 'frequency',
    options: [
      { value: 'regularly', label: 'Regularly - It\'s natural for me', score: 1.0 },
      { value: 'often', label: 'Often with trusted people', score: 0.75 },
      { value: 'sometimes', label: 'Sometimes when necessary', score: 0.5 },
      { value: 'rarely', label: 'Rarely - It\'s very hard', score: 0.25 },
      { value: 'never', label: 'Never - I keep walls up', score: 0.0 },
    ],
    weight: 0.9,
  },
];

// Quick check-in uses a subset of questions
export const GCT_QUICK_CHECKIN: GCTQuestion[] = [
  GCT_INITIAL_ASSESSMENT.find(q => q.id === 'values_action_alignment')!,
  GCT_INITIAL_ASSESSMENT.find(q => q.id === 'inner_conflict')!,
  GCT_INITIAL_ASSESSMENT.find(q => q.id === 'learning_from_mistakes')!,
  GCT_INITIAL_ASSESSMENT.find(q => q.id === 'pattern_recognition_speed')!,
  GCT_INITIAL_ASSESSMENT.find(q => q.id === 'fear_response')!,
  GCT_INITIAL_ASSESSMENT.find(q => q.id === 'bold_action_count')!,
  GCT_INITIAL_ASSESSMENT.find(q => q.id === 'authentic_relationships')!,
  GCT_INITIAL_ASSESSMENT.find(q => q.id === 'relationship_quality')!,
  {
    id: 'overall_coherence',
    dimension: 'psi',
    text: 'Overall, how coherent and aligned do you feel today?',
    type: 'scale',
    weight: 1.0,
  },
  {
    id: 'energy_level',
    dimension: 'psi',
    text: 'What is your energy level right now?',
    type: 'scale',
    weight: 0.8,
  },
];