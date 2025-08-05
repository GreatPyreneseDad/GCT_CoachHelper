# GCT CoachHelper Dashboard Wireframes

## Overview
These wireframes describe the key dashboard views for both coaches and clients. Each wireframe includes layout, components, and interaction patterns.

---

# 1. Coach Dashboard (Home)

```
┌─────────────────────────────────────────────────────────────────────┐
│ GCT CoachHelper  [👤 Coach Name]  [🔔 3]  [⚙️]  [Logout]          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Welcome back, Sarah!                     Today: March 15, 2024    │
│                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────┐│
│  │ Active Clients      │  │ Avg Coherence       │  │ This Week  ││
│  │      24             │  │    +12%             │  │ 8 sessions ││
│  │    ↑ 3 this month   │  │  52% → 64%          │  │ 3 breakthr ││
│  └─────────────────────┘  └─────────────────────┘  └────────────┘│
│                                                                     │
│  Today's Sessions                          Quick Actions           │
│  ┌─────────────────────────────────────┐  ┌─────────────────────┐│
│  │ 9:00  - Maria S.    Check-in      │  │ [+ New Client]      ││
│  │ 10:30 - John D.     Deep Dive     │  │ [+ Quick Assessment]││
│  │ 2:00  - Lisa M.     Breakthrough  │  │ [View All Clients]  ││
│  │ 4:00  - Ahmed K.    Initial       │  │ [Intervention Lib]  ││
│  └─────────────────────────────────────┘  └─────────────────────┘│
│                                                                     │
│  Client Alerts                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ ⚠️  Tom B. - Coherence declining (3 weeks)                  │  │
│  │ 🎉 Sarah L. - Breakthrough in q dimension!                  │  │
│  │ 📊 Mike R. - Ready for quarterly review                     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Recent Activity                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ • Maria completed weekly check-in (coherence: 67% ↑3%)      │  │
│  │ • New intervention added: "Courage Conversations"           │  │
│  │ • John's f dimension improved to 0.8                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Navigation: Dashboard | Clients | Sessions | Interventions | Analytics | Settings
```

## Key Features:
- At-a-glance practice metrics
- Today's schedule with session types
- Actionable alerts requiring attention
- Quick access to common tasks
- Recent activity feed

---

# 2. Individual Client View

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Clients          Maria Sanchez         [Edit] [Export]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────┐  ┌──────────────────────────┐│
│  │         67%                      │  │    Coherence Journey     ││
│  │    COHERENCE                     │  │    ___________...●       ││
│  │    ↑ 3% this week               │  │   /                      ││
│  │                                  │  │  /    Started: Jan 2024  ││
│  │  Current Velocity: Growing       │  │ 45%                  67% ││
│  └─────────────────────────────────┘  └──────────────────────────┘│
│                                                                     │
│  Dimension Breakdown                                                │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │     Ψ (Consistency)    ████████░░░░░░  72%  ↑5%            │  │
│  │     ρ (Wisdom)        ██████░░░░░░░░  61%  ↑2%            │  │
│  │     q (Activation)    █████░░░░░░░░░  55%  ↑8% 🎯         │  │
│  │     f (Belonging)     ████████████░░  85%  →0%            │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Current Pattern: "The Cautious Learner"                           │
│  Next Session: Tomorrow 9:00 AM - Focus on q dimension            │
│                                                                     │
│  ┌─────────────┬────────────────┬───────────────┬──────────────┐  │
│  │ Sessions    │ Assessments    │ Interventions │ Notes        │  │
│  ├─────────────┴────────────────┴───────────────┴──────────────┤  │
│  │                                                              │  │
│  │ Recent Sessions                                              │  │
│  │ ┌──────────────────────────────────────────────────────────┤  │
│  │ │ Mar 8  - Breakthrough session on fear of visibility      │  │
│  │ │ Mar 1  - Weekly check-in, identified q as focus          │  │
│  │ │ Feb 23 - Deep dive into courage patterns                 │  │
│  │ └──────────────────────────────────────────────────────────┤  │
│  │                                                              │  │
│  │ Active Interventions                                         │  │
│  │ • Micro-Courage Challenge (Day 12 of 30) - 85% complete    │  │
│  │ • Weekly vulnerability practice with sister                 │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  [Schedule Session] [Send Check-in] [Add Note] [View Full History] │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Features:
- Large coherence score with trend
- Visual dimension breakdown with sparklines
- Pattern recognition display
- Tabbed content areas
- Quick action buttons

---

# 3. Client Portal Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ My Growth Journey                    Hi Maria! 👋    [Support] [↗] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│          Your Coherence Score                                       │
│                                                                     │
│                    ╭─────────╮                                     │
│                   ╱           ╲                                    │
│                  │     67%     │     You're Growing! 🌱           │
│                   ╲           ╱                                    │
│                    ╰─────────╯                                     │
│                                                                     │
│               3% better than last week!                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  Your Four Dimensions                        │  │
│  │                                                              │  │
│  │  Consistency (Ψ)    ████████████████░░░░  72% ↑            │  │
│  │  "How aligned are your actions with your values?"          │  │
│  │                                                              │  │
│  │  Wisdom (ρ)        ████████████░░░░░░░  61% ↑            │  │
│  │  "How well do you learn from experience?"                  │  │
│  │                                                              │  │
│  │  Activation (q)    ███████████░░░░░░░░  55% ↑↑ Focus     │  │
│  │  "How courageously do you take action?"                    │  │
│  │                                                              │  │
│  │  Belonging (f)     █████████████████░░░  85% →            │  │
│  │  "How supported are you by others?"                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  This Week's Focus: Building Courage 💪                            │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Your Micro-Courage Challenge - Day 12 of 30                 │  │
│  │                                                              │  │
│  │ Today: Start a conversation with someone new                │  │
│  │ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ◉ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ │  │
│  │                                                              │  │
│  │ [I Did It!] [I Need Support] [Skip Today]                   │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Next Session: Tomorrow 9:00 AM with Coach Sarah                  │
│  [Join Video Call] [Reschedule] [Message Coach]                    │
│                                                                     │
│  Your Progress Story                                               │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │     ^                                                        │  │
│  │ 70% │              ●                                        │  │
│  │     │           ●     ●                                     │  │
│  │ 60% │       ●             ●                                 │  │
│  │     │   ●                                                   │  │
│  │ 50% │ ●                                                     │  │
│  │     └─────────────────────────────────────────────>         │  │
│  │     Jan    Feb    Mar    Apr    May    Jun                 │  │
│  │                                                              │  │
│  │ 🎯 Breakthrough moments  ⭐ Milestone achieved               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Features:
- Friendly, encouraging tone
- Large visual coherence score
- Simple dimension explanations
- Current challenge/homework
- Progress visualization
- Easy session access

---

# 4. Assessment Interface

```
┌─────────────────────────────────────────────────────────────────────┐
│ Weekly Check-In                                    Save & Exit [X]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Let's see how you're doing this week...                          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Question 3 of 10                              ○○●○○○○○○○    │  │
│  │                                                              │  │
│  │ This week, I did something that scared me but felt         │  │
│  │ important:                                                  │  │
│  │                                                              │  │
│  │ ○ Several brave actions                                     │  │
│  │ ○ One significant brave action                              │  │
│  │ ● Small courage steps                                       │  │
│  │ ○ Wanted to but didn't                                      │  │
│  │ ○ Avoided all challenges                                    │  │
│  │                                                              │  │
│  │ Can you share an example? (optional)                        │  │
│  │ ┌──────────────────────────────────────────────────────┐   │  │
│  │ │ I finally asked my boss about the promotion...       │   │  │
│  │ └──────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │            [← Previous]  [Next →]                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Your Progress                                                      │
│  ████████████████████████░░░░░░░░░░░░░░░░░░░░░░  30% Complete    │
│                                                                     │
│  💡 Tip: Answer honestly - there are no "right" answers here      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Features:
- Clean, focused interface
- Progress indicator
- Optional elaboration fields
- Save progress capability
- Encouraging tips

---

# 5. Session Planning Interface

```
┌─────────────────────────────────────────────────────────────────────┐
│ Session Planning: Maria Sanchez - March 16, 9:00 AM               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Pre-Session Snapshot                   Suggested Focus            │
│  ┌─────────────────────┐              ┌──────────────────────┐   │
│  │ Coherence: 67% ↑3%  │              │ 🎯 Courage Building  │   │
│  │ Pattern: Cautious   │              │                      │   │
│  │ Last Week:          │              │ Based on:            │   │
│  │ • Micro-courage 85% │              │ • Low q score (55%)  │   │
│  │ • 1 breakthrough    │              │ • Recent progress    │   │
│  │ • Energy: High      │              │ • Client goals       │   │
│  └─────────────────────┘              └──────────────────────┘   │
│                                                                     │
│  Session Structure Builder                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ ⏱ Check-In (10 min)                                  [⚙️]  │  │
│  │   □ Review micro-courage progress                           │  │
│  │   □ Celebrate promotion conversation                        │  │
│  │   □ Quick coherence check                                   │  │
│  │                                                              │  │
│  │ ⏱ Main Focus: Courage Breakthrough (30 min)         [⚙️]  │  │
│  │   □ Fear-setting exercise for next level                    │  │
│  │   □ Design bigger courage challenge                         │  │
│  │   □ Practice difficult conversation                         │  │
│  │   + Add item                                                 │  │
│  │                                                              │  │
│  │ ⏱ Integration (10 min)                              [⚙️]  │  │
│  │   □ Connect courage to other dimensions                     │  │
│  │   □ Plan week's practice                                    │  │
│  │   □ Schedule next session                                   │  │
│  │                                                              │  │
│  │ [+ Add Section]                                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Intervention Options                  Resources                    │
│  ┌────────────────────┐              ┌──────────────────────┐   │
│  │ □ Fear-Setting     │              │ 📎 Courage worksheet │   │
│  │ □ Courage Conv.    │              │ 📎 Fear inventory    │   │
│  │ □ Bold Action Plan │              │ 📎 Success stories   │   │
│  └────────────────────┘              └──────────────────────┘   │
│                                                                     │
│  [Save Plan] [Start Session] [Send to Client]                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Features:
- Pre-session client snapshot
- AI-suggested focus areas
- Customizable session structure
- Integrated intervention library
- Resource attachment

---

# 6. Progress Analytics View

```
┌─────────────────────────────────────────────────────────────────────┐
│ Analytics Dashboard                    [Date Range: Last 90 Days ▼] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Practice Overview                                                  │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                   Average Client Coherence                     │ │
│  │  70% ┤                                          ●              │ │
│  │      │                                     ●         ●         │ │
│  │  60% ┤                               ●                         │ │
│  │      │                         ●                               │ │
│  │  50% ┤                   ●                                     │ │
│  │      │             ●                                           │ │
│  │  40% ┤       ●                                                 │ │
│  │      └─────────────────────────────────────────────────────── │ │
│  │        Jan         Feb         Mar         Apr                 │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐                 │
│  │ Success Metrics    │  │ Dimension Focus     │                 │
│  │                    │  │                     │                 │
│  │ 78% clients       │  │ Ψ: 25% of work     │                 │
│  │ improving         │  │ ρ: 20% of work     │                 │
│  │                    │  │ q: 35% of work     │                 │
│  │ 12 breakthroughs  │  │ f: 20% of work     │                 │
│  │ this month        │  │                     │                 │
│  └─────────────────────┘  └─────────────────────┘                 │
│                                                                     │
│  Most Effective Interventions                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 1. Micro-Courage Challenge      92% success   ████████████   │ │
│  │ 2. Values Excavation           88% success   ███████████    │ │
│  │ 3. Daily Three Protocol        85% success   ███████████    │ │
│  │ 4. Vulnerability Practice      82% success   ██████████     │ │
│  │ 5. Pattern Interrupt           78% success   ██████████     │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Client Patterns                      Action Items                  │
│  ┌────────────────────┐             ┌───────────────────────────┐ │
│  │ • 40% start as     │             │ ⚠️ 3 clients plateauing  │ │
│  │   "Wise Cowards"   │             │ 🎯 Schedule reviews      │ │
│  │ • Avg time to      │             │ 📈 q interventions       │ │
│  │   breakthrough: 6wk │             │    showing best ROI      │ │
│  │ • f highest        │             │ 💡 Consider group        │ │
│  │   starting score   │             │    courage challenge     │ │
│  └────────────────────┘             └───────────────────────────┘ │
│                                                                     │
│  [Export Report] [Share with Supervisor] [Print]                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Features:
- Practice-wide coherence trends
- Intervention effectiveness data
- Pattern recognition insights
- Actionable recommendations
- Export capabilities

---

# Mobile Responsive Patterns

## Phone View (Client Portal)
```
┌─────────────────┐
│ Hi Maria! 👋    │
│                 │
│    ╭─────╮      │
│   ╱  67% ╲     │
│   ╲  ↑3% ╱     │
│    ╰─────╯      │
│                 │
│ Your Dimensions │
│ ▼               │
│ Consistency 72% │
│ ████████░░ ↑    │
│                 │
│ Wisdom 61%      │
│ ██████░░░░ ↑    │
│                 │
│ Courage 55% 🎯  │
│ █████░░░░░ ↑↑   │
│                 │
│ Belonging 85%   │
│ █████████░ →    │
│                 │
│ Today's Task    │
│ ┌─────────────┐ │
│ │Start convo  │ │
│ │with someone │ │
│ │new          │ │
│ │             │ │
│ │ [Did It!]   │ │
│ └─────────────┘ │
│                 │
│ [●] [📊] [💬] [?]│
└─────────────────┘
```

---

# Design Principles

## Visual Hierarchy
1. **Primary**: Current coherence score
2. **Secondary**: Dimension breakdown
3. **Tertiary**: Actions and interventions

## Color System
- **Green**: Growth, positive change
- **Yellow**: Attention needed
- **Red**: Crisis or decline
- **Blue**: Neutral information
- **Purple**: Mastery level

## Information Architecture
- **Progressive Disclosure**: Start simple, reveal complexity
- **Context-Sensitive**: Show relevant info for current task
- **Action-Oriented**: Clear next steps always visible

## Accessibility
- High contrast ratios
- Keyboard navigation
- Screen reader friendly
- Clear focus states
- No color-only information

These wireframes provide the foundation for a user-friendly, coach-centric interface that makes coherence tracking intuitive and actionable.