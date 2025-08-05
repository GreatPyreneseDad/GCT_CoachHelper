# GCT Assessment Scoring Algorithms

## Core Scoring Principles

### 1. Normalization
All raw scores are normalized to 0.0 - 1.0 scale for consistency across different question types.

### 2. Weighting
Questions can be weighted based on their predictive value for each dimension.

### 3. Consistency Checking
Built-in validation to flag contradictory responses.

---

## Question Type Scoring

### Scale Questions (1-10)
```python
def score_scale_question(value, reverse=False):
    """Convert 1-10 scale to 0-1 score"""
    if reverse:
        value = 11 - value
    return (value - 1) / 9
```

### Multiple Choice Questions
```python
def score_multiple_choice(selection, options):
    """Score based on option position"""
    scores = {
        'option_1': 1.0,   # Best outcome
        'option_2': 0.75,  # Good outcome
        'option_3': 0.5,   # Neutral outcome
        'option_4': 0.25,  # Poor outcome
        'option_5': 0.0    # Worst outcome
    }
    return scores.get(selection, 0.5)
```

### Percentage Questions
```python
def score_percentage(value):
    """Direct conversion of percentage to score"""
    return value / 100
```

### Frequency Questions
```python
def score_frequency(frequency):
    """Convert frequency to score"""
    frequency_scores = {
        'Always': 1.0,
        'Usually': 0.75,
        'Sometimes': 0.5,
        'Rarely': 0.25,
        'Never': 0.0
    }
    return frequency_scores.get(frequency, 0.5)
```

### Check All That Apply
```python
def score_multi_select(selected, total_options, positive_options):
    """Score based on ratio of positive selections"""
    positive_selected = len([s for s in selected if s in positive_options])
    return positive_selected / len(positive_options)
```

---

## Dimension Calculations

### Ψ (Internal Consistency) Scoring
```python
def calculate_psi_score(responses):
    """Calculate Internal Consistency dimension score"""
    
    # Define question weights
    weights = {
        'values_action_alignment': 1.5,    # Critical indicator
        'calendar_audit_followup': 1.3,    # Behavior truth
        'commitment_follow_through': 1.4,  # Reliability measure
        'inner_conflict': 1.2,            # Internal friction
        'integrity_check': 1.5,           # Core consistency
        'life_compartments': 1.1,         # Integration level
        'decision_clarity': 1.2,          # Self-knowledge
        'self_sabotage': 1.3,             # Hidden misalignment
        'morning_intention': 1.0,         # Daily practice
        'evening_reflection': 1.0,        # Closure practice
        'goal_consistency': 1.2,          # Long-term alignment
        'life_philosophy': 1.1            # Guiding principles
    }
    
    # Calculate weighted average
    total_weight = sum(weights.values())
    weighted_sum = sum(score * weights[question] 
                      for question, score in responses.items())
    
    return weighted_sum / total_weight
```

### ρ (Accumulated Wisdom) Scoring
```python
def calculate_rho_score(responses):
    """Calculate Accumulated Wisdom dimension score"""
    
    # Special handling for pattern recognition speed
    pattern_speed_score = {
        'immediately': 1.0,
        'within_days': 0.8,
        'within_weeks': 0.6,
        'after_months': 0.3,
        'dont_notice': 0.0
    }
    
    # Learning velocity multiplier
    learning_speed = responses.get('learning_speed_average', 0.5)
    base_score = calculate_weighted_average(responses)
    
    # Apply learning velocity bonus
    return base_score * (1 + (learning_speed - 0.5) * 0.2)
```

### q (Moral Activation) Scoring  
```python
def calculate_q_score(responses):
    """Calculate Moral Activation dimension score"""
    
    # Bold action counter gives bonus
    bold_actions = responses.get('bold_action_count', 0)
    bold_bonus = min(bold_actions * 0.05, 0.25)  # Max 25% bonus
    
    # Procrastination creates penalty
    procrastination_rate = responses.get('procrastination_rate', 0)
    procrastination_penalty = procrastination_rate * 0.3  # Max 30% penalty
    
    base_score = calculate_weighted_average(responses)
    return max(0, min(1, base_score + bold_bonus - procrastination_penalty))
```

### f (Social Belonging) Scoring
```python
def calculate_f_score(responses):
    """Calculate Social Belonging dimension score"""
    
    # Support network size has diminishing returns
    support_count = responses.get('support_network_size', 0)
    support_score = 1 - math.exp(-support_count / 3)  # Asymptotic curve
    
    # Relationship quality matters more than quantity
    quality_weight = 0.7
    quantity_weight = 0.3
    
    quality_score = responses.get('relationship_quality_average', 0)
    
    return (quality_score * quality_weight + 
            support_score * quantity_weight)
```

---

## Coherence Calculation

### Optimal q Function
```python
def q_optimal(q_raw):
    """Calculate optimal courage contribution"""
    q_max = 1.0
    K_m = 0.5    # Half-maximal activation
    K_i = 2.0    # Inhibition constant
    
    return (q_max * q_raw) / (K_m + q_raw + (q_raw**2 / K_i))
```

### Total Coherence Score
```python
def calculate_coherence(psi, rho, q, f):
    """Calculate total coherence score using GCT formula"""
    
    # Apply the coherence formula
    coherence = psi + (rho * psi) + q_optimal(q) + (f * psi)
    
    # Theoretical maximum is 4.0
    max_coherence = 4.0
    
    # Convert to percentage
    percentage = (coherence / max_coherence) * 100
    
    return {
        'raw_score': coherence,
        'percentage': percentage,
        'components': {
            'base_alignment': psi,
            'wisdom_multiplier': rho * psi,
            'optimal_courage': q_optimal(q),
            'relationship_multiplier': f * psi
        }
    }
```

---

## Consistency Validation

### Cross-Question Validation
```python
def validate_consistency(responses):
    """Check for contradictory responses"""
    
    inconsistencies = []
    
    # Check: commitment keeping vs self-sabotage
    if (responses['commitment_follow_through'] > 0.8 and 
        responses['self_sabotage_frequency'] > 0.6):
        inconsistencies.append({
            'type': 'commitment_sabotage_mismatch',
            'severity': 'moderate',
            'message': 'High commitment keeping but also high self-sabotage'
        })
    
    # Check: wisdom vs pattern repetition
    if (responses['learning_from_mistakes'] > 0.8 and 
        responses['pattern_recognition'] < 0.3):
        inconsistencies.append({
            'type': 'wisdom_pattern_mismatch',
            'severity': 'high',
            'message': 'Claims to learn but doesn\'t recognize patterns'
        })
    
    # Check: courage vs action
    if (responses['fear_response'] > 0.8 and 
        responses['bold_action_count'] == 0):
        inconsistencies.append({
            'type': 'courage_action_mismatch',
            'severity': 'moderate',
            'message': 'Claims courage but no bold actions'
        })
    
    return inconsistencies
```

### Response Quality Score
```python
def calculate_response_quality(responses, duration):
    """Assess quality of assessment responses"""
    
    quality_factors = {
        'completion_rate': len(responses) / total_questions,
        'time_appropriateness': 1 - abs(duration - expected_duration) / expected_duration,
        'consistency_score': 1 - (len(validate_consistency(responses)) * 0.1),
        'detail_level': average_text_length / expected_text_length
    }
    
    return sum(quality_factors.values()) / len(quality_factors)
```

---

## Progress Tracking

### Velocity Calculation
```python
def calculate_velocity(current_score, previous_score, days_elapsed):
    """Calculate daily coherence velocity"""
    
    if days_elapsed == 0:
        return 0
    
    daily_change = (current_score - previous_score) / days_elapsed
    
    # Classify velocity
    if daily_change > 0.005:
        classification = 'rapid_growth'
    elif daily_change > 0.001:
        classification = 'steady_growth'
    elif daily_change > -0.001:
        classification = 'plateau'
    elif daily_change > -0.005:
        classification = 'slow_decline'
    else:
        classification = 'rapid_decline'
    
    return {
        'daily_rate': daily_change,
        'classification': classification,
        'projected_30_day': current_score + (daily_change * 30)
    }
```

### Breakthrough Detection
```python
def detect_breakthroughs(score_history):
    """Identify significant positive shifts"""
    
    breakthroughs = []
    
    for i in range(1, len(score_history)):
        current = score_history[i]
        previous = score_history[i-1]
        
        # Single dimension breakthrough
        for dimension in ['psi', 'rho', 'q', 'f']:
            if current[dimension] - previous[dimension] > 0.15:
                breakthroughs.append({
                    'date': current['date'],
                    'type': 'dimension_breakthrough',
                    'dimension': dimension,
                    'magnitude': current[dimension] - previous[dimension]
                })
        
        # Total coherence breakthrough
        if current['coherence'] - previous['coherence'] > 0.1:
            breakthroughs.append({
                'date': current['date'],
                'type': 'coherence_breakthrough',
                'magnitude': current['coherence'] - previous['coherence']
            })
    
    return breakthroughs
```

---

## Intervention Recommendations

### Dimension Priority Algorithm
```python
def prioritize_dimensions(scores):
    """Determine which dimension to focus on"""
    
    # Calculate improvement potential
    potentials = {}
    for dim, score in scores.items():
        # Lower scores have higher potential
        base_potential = 1 - score
        
        # Psi gets priority as multiplier
        if dim == 'psi':
            base_potential *= 1.5
        
        # Consider impact on coherence
        if dim in ['rho', 'f']:  # Multiplier dimensions
            impact = scores['psi'] * base_potential
        else:
            impact = base_potential
        
        potentials[dim] = impact
    
    # Sort by potential impact
    return sorted(potentials.items(), key=lambda x: x[1], reverse=True)
```

### Intervention Matching
```python
def recommend_interventions(dimension_scores, client_preferences):
    """Match interventions to client needs"""
    
    recommendations = []
    priority_dimensions = prioritize_dimensions(dimension_scores)
    
    for dimension, potential in priority_dimensions[:2]:  # Top 2 priorities
        if dimension == 'psi' and dimension_scores['psi'] < 0.5:
            recommendations.extend([
                'values_clarification_workshop',
                'daily_alignment_check_in',
                'calendar_audit_exercise'
            ])
        elif dimension == 'rho' and dimension_scores['rho'] < 0.5:
            recommendations.extend([
                'pattern_recognition_journal',
                'weekly_wisdom_extraction',
                'mentor_matching'
            ])
        elif dimension == 'q' and dimension_scores['q'] < 0.5:
            recommendations.extend([
                'micro_courage_challenges',
                'fear_facing_hierarchy',
                'accountability_partnership'
            ])
        elif dimension == 'f' and dimension_scores['f'] < 0.5:
            recommendations.extend([
                'relationship_audit',
                'vulnerability_practice',
                'community_connection_plan'
            ])
    
    return recommendations
```

---

## Implementation Notes

### Data Storage Format
```json
{
  "assessment_id": "uuid",
  "client_id": "uuid",
  "date": "2024-01-15",
  "type": "initial|quick|deep_dive",
  "responses": {
    "question_id": {
      "value": "response_value",
      "score": 0.75,
      "dimension": "psi",
      "weight": 1.2
    }
  },
  "dimension_scores": {
    "psi": 0.65,
    "rho": 0.72,
    "q": 0.48,
    "f": 0.81
  },
  "coherence": {
    "raw": 2.34,
    "percentage": 58.5,
    "components": {...}
  },
  "quality_metrics": {
    "completion_rate": 1.0,
    "consistency_score": 0.95,
    "duration_minutes": 42
  }
}
```

### Edge Case Handling
1. **Missing responses**: Use dimension average or 0.5 neutral
2. **Outlier detection**: Flag scores >3 standard deviations
3. **Gaming prevention**: Check for all max/min patterns
4. **Cultural adaptation**: Adjustable weights by coach
5. **Language barriers**: Simplified scoring for translations

These algorithms provide the mathematical foundation for transforming subjective coaching assessments into objective, trackable metrics that reveal true transformation patterns.