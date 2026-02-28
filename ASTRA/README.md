<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo_SDK-54-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-4.5-FFD700?style=for-the-badge" alt="Zustand" />
  <img src="https://img.shields.io/badge/Groq_LLM-llama--3.3--70b-FF6600?style=for-the-badge" alt="Groq" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

<h1 align="center">ASTRA</h1>
<h3 align="center">Adaptive System for Thoughtful Response Architecture</h3>

<p align="center">
  <strong>A privacy-first, on-device cognitive optimization engine that uses transparent, research-backed heuristics — not black-box ML — to help you focus, recover, and perform.</strong>
</p>

<p align="center">
  Built with React Native + Expo · 100% on-device processing · Zero cloud data transmission
</p>

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Modules](#core-modules)
4. [The Hybrid Orchestrator Agent](#the-hybrid-orchestrator-agent)
5. [Research-Backed Formulas & Rule Engine](#research-backed-formulas--rule-engine)
   - [Attention Fragmentation Index (AFI)](#1-attention-fragmentation-index-afi)
   - [Shannon Entropy for Usage Distribution](#2-shannon-entropy-for-usage-distribution)
   - [Distractiveness Score (DS)](#3-distractiveness-score-ds)
   - [Personality-Based Impulsivity & Strictness](#4-personality-based-impulsivity--strictness)
   - [Goal Conflict Score (GCS)](#5-goal-conflict-score-gcs)
   - [Pomodoro Survival Modeling](#6-pomodoro-survival-modeling)
   - [Bayesian Compliance Probability](#7-bayesian-compliance-probability)
   - [Cognitive Readiness Score (CRS)](#8-cognitive-readiness-score-crs)
   - [Attention Forecasting Heatmap](#9-attention-forecasting-heatmap)
   - [Dopamine Binge Detection](#10-dopamine-binge-detection)
   - [Sleep Normalization (Gaussian)](#11-sleep-normalization-gaussian)
   - [HRV Normalization & Autonomic Regulation](#12-hrv-normalization--autonomic-regulation)
   - [Hydration & Cognitive Function](#13-hydration--cognitive-function)
   - [Exercise Normalization & Neuroplasticity](#14-exercise-normalization--neuroplasticity)
   - [Sedentary Behavior Penalty](#15-sedentary-behavior-penalty)
   - [Composite Health Scores](#16-composite-health-scores)
   - [Health Trend Detection & Chronic Patterns](#17-health-trend-detection--chronic-patterns)
   - [Meditation Suitability Score (MSS)](#18-meditation-suitability-score-mss)
   - [Meditation Rule Engine](#19-meditation-rule-engine)
   - [Context Inference Engine](#20-context-inference-engine)
   - [Behavioral Gap Analysis](#21-behavioral-gap-analysis)
   - [Strategy Selection & Tone Calibration](#22-strategy-selection--tone-calibration)
   - [Emotion & Self-Regulation Model](#23-emotion--self-regulation-model)
   - [Implementation Intentions (Goal Cues)](#24-implementation-intentions-goal-cues)
   - [Self-Efficacy & Behavior Change](#25-self-efficacy--behavior-change)
6. [Onboarding & Personality Profiling](#onboarding--personality-profiling)
7. [Tech Stack](#tech-stack)
8. [Project Structure](#project-structure)
9. [Setup & Installation](#setup--installation)
10. [Configuration](#configuration)
11. [Testing](#testing)
12. [Full Bibliography](#full-bibliography)
13. [License](#license)

---

## Overview

ASTRA is a **next-generation cognitive optimization mobile application** designed for individuals who want to take control of their focus, mental well-being, and productivity with full transparency into *why* the system recommends what it does.

Unlike conventional wellness apps that rely on opaque cloud-based ML models, ASTRA implements a **transparent, deterministic rule-based personalization engine** that runs entirely on-device. Every formula, threshold, and decision pathway is grounded in peer-reviewed cognitive science, psychophysiology, and human-computer interaction research.

### Key Differentiators

| Feature | ASTRA | Typical Wellness Apps |
|---|---|---|
| **Data Processing** | 100% on-device | Cloud-dependent |
| **Decision Engine** | Transparent rule-based + LLM hybrid | Black-box ML |
| **Personalization** | Big Five personality-calibrated | Generic segmentation |
| **Intervention Style** | Adaptive tone, strictness, modality | One-size-fits-all |
| **Research Basis** | Every formula cites peer-reviewed literature | Unspecified |
| **User Autonomy** | Override always allowed; user sees all context | Opaque recommendations |

### What ASTRA Does

- **Tracks app usage** in real-time via Android `UsageStatsManager` to compute an Attention Fragmentation Index
- **Intervenes intelligently** when users enter distraction spirals with personality-calibrated nudges
- **Adapts Pomodoro sessions** to your actual survival time using survival analysis
- **Monitors health signals** (sleep, HRV, hydration, exercise, stress, fatigue) to compute Cognitive Readiness
- **Recommends meditation** based on real-time stress, fatigue, mood, and HRV using the Meditation Suitability Score
- **Runs a 5-stage agentic pipeline** that combines all module data, infers context, analyzes behavioral gaps, selects strategy, and generates personalized directives — enhanced by Groq LLM (llama-3.3-70b)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                            │
│  Dashboard · FocusSession · CognitiveTraining · Meditate · Health  │
│  Heatmap · Settings · NudgeOverlay (global modal)                  │
├─────────────────────────────────────────────────────────────────────┤
│                    STATE MANAGEMENT (6 Zustand Stores)              │
│  Onboarding · Focus · Health · Meditation · Personalization        │
│  Orchestrator                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                BEHAVIORAL ORCHESTRATOR AGENT (5 Stages)             │
│  ContextCollector → StateIngestion → ContextInference →            │
│  BehavioralGap → StrategySelector → DirectiveGeneration            │
│  → Groq LLM Enhancement (hybrid merge)                            │
├─────────────────────────────────────────────────────────────────────┤
│                       RULE ENGINES                                  │
│  Health Rules · Meditation Rules · Focus Rules · Rule Engine       │
├─────────────────────────────────────────────────────────────────────┤
│                  MATH / COMPUTATION LAYER                           │
│  AFI · CRS · DS · Compliance · Survival · Dopamine Detection      │
│  Goal Conflict · Personality Strictness · Attention Forecasting    │
├─────────────────────────────────────────────────────────────────────┤
│                      NORMALIZATION LAYER                            │
│  Health Normalizers · Meditation Normalizers · Focus Normalizers   │
├─────────────────────────────────────────────────────────────────────┤
│                     SERVICES LAYER                                  │
│  UsageStatsService · HealthService · ActivityRecognition           │
│  BackgroundTaskService                                             │
├─────────────────────────────────────────────────────────────────────┤
│                    PERSISTENCE LAYER                                │
│  AsyncStorage (Zustand middleware) · SQLite (database/)            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Modules

### 1. Focus Trainer

Tracks real-time app usage via Android's `UsageStatsManager` to compute the **Attention Fragmentation Index (AFI)** — a composite metric of context switches, unlock frequency, session duration, and usage entropy. When fragmentation exceeds thresholds, ASTRA triggers personalized nudges calibrated to the user's personality profile.

**Capabilities:**
- Real-time AFI computation from background usage data
- Dynamic Pomodoro sessions that adapt length based on survival analysis of past sessions
- Dopamine binge detection (single-app binges >20 min, switch bursts >15 switches/5 min)
- Per-app Distractiveness Scoring with goal-conflict escalation
- Dual N-Back and Attention Switching cognitive training games
- Personal Focus Heatmap (7×24 grid) predicting optimal focus windows

### 2. Health Integration

Manual or synced logging of sleep, exercise, hydration, stress, fatigue, and HRV. All inputs are normalized against clinical baselines using research-derived functions, then composed into a master **Cognitive Readiness** score.

**Computed Scores (each 0–100):**

| Score | Formula |
|---|---|
| SleepScore | `0.8 × normalizeSleep(hours) + 0.2 × normalizeSleepQuality(quality)` |
| RecoveryScore | `0.55 × SleepScore + 0.25 × HRVScore + 0.20 × StressScore` |
| LifestyleScore | `0.45 × ExerciseScore + 0.35 × HydrationScore + 0.20 × SedentaryScore` |
| **CognitiveReadiness** | `0.6 × RecoveryScore + 0.4 × LifestyleScore` |

**Attention Capacity Mapping:**

| CognitiveReadiness | Level | Recommended Focus (min) |
|---|---|---|
| ≥ 80 | High | 25 |
| 60–79 | Moderate | 15 |
| 40–59 | Light | 8 |
| < 40 | Recovery | 0 (rest) |

### 3. Meditation Module

Recommends and tracks meditation sessions based on the **Meditation Suitability Score (MSS)** — a weighted composite of stress, fatigue, mood, HRV, available time, and experience level.

**Session Types:** Mindfulness · Body Scan · Breathing · Yoga Nidra  
**Intents:** Focus · Calm · Sleep · Recovery · Energy  
**Experience Levels:** Novice · Intermediate · Advanced

### 4. Personalization Engine

A 3-layer adaptive system:
- **Layer 1 — Baseline:** Personality-derived strictness, nudge tone, focus length, intervention tolerance (from onboarding)
- **Layer 2 — Behavioral Adaptation:** Bayesian compliance tracking per intervention type, adaptive strictness (levels 1–5), intervention fatigue prevention, nudge effectiveness ranking
- **Layer 3 — Contextual Decisions:** Real-time intervention suitability scoring, recovery recommendations, habit suggestions, uninstall risk monitoring

---

## The Hybrid Orchestrator Agent

The **Behavioral Orchestrator** is ASTRA's decision brain — a 5-stage agentic pipeline that unifies all module data into a single `PersonalizationDirective`.

```
Stage 1: State Ingestion
    │  Agentic self-collection from all 5 Zustand stores
    │  Builds unified UserState (static + semi-dynamic + dynamic + behavioral signals)
    ▼
Stage 2: Context Inference
    │  8 priority-ordered rules classify the user's current mode
    │  (performance-ready, maintenance, fatigued, reactive, overloaded, drifting, recovering, opportunity)
    ▼
Stage 3: Behavioral Gap Analysis
    │  5 gap dimensions: goalVsFocus, distractionDeviation, complianceGap,
    │  sessionSkipRate, recoveryNeglect → weighted composite → level classification
    ▼
Stage 4: Strategy Selection
    │  Maps (context × gap × personality) → strategy type, tone, strictness,
    │  timing, modality
    ▼
Stage 5: Directive Generation
    │  Rule-based structural directive + Groq LLM voice personalization
    │  Output: PersonalizationDirective with nudge, module messages, recommendations
    ▼
Output: Hybrid Rules + LLM Directive
```

The orchestrator auto-runs every **60 seconds** on the Dashboard, continuously adapting to behavioral changes. Rules provide the structural backbone; the LLM (Groq llama-3.3-70b-versatile) personalizes the voice and tone based on the user's personality profile.

---

## Research-Backed Formulas & Rule Engine

Every computational model in ASTRA is grounded in peer-reviewed literature. Below is the complete specification of each formula, the exact code implementation, and the scientific justification.

---

### 1. Attention Fragmentation Index (AFI)

**Formula:**

```
AFI = α·S + β·U + γ·(1/D) + δ·H
```

| Component | Symbol | Weight | Description |
|---|---|---|---|
| Switch Rate | S | α = 0.30 | App switches per hour (min-max normalized) |
| Unlock Rate | U | β = 0.20 | Screen unlocks per hour (min-max normalized) |
| Inverse Duration | 1/D | γ = 0.25 | Shorter avg session duration → higher fragmentation |
| Usage Entropy | H | δ = 0.25 | Shannon entropy of app time distribution (normalized) |

**Classification:**

| AFI | Level |
|---|---|
| < 0.30 | Deep Focus |
| 0.30–0.59 | Moderate |
| ≥ 0.60 | Fragmented |

**Research Basis:**  
Frequent context switches rapidly degrade executive attention and working memory. The cost of switching between tasks is well-documented to cause performance decrements of 20–40% on the subsequent task.

> - Monsell, S. (2003). *Task switching.* Trends in Cognitive Sciences, 7(3), 134–140. DOI: [10.1016/S1364-6613(03)00028-7](https://doi.org/10.1016/S1364-6613(03)00028-7)
> - Rubinstein, J. S., Meyer, D. E., & Evans, J. E. (2001). *Executive control of cognitive processes in task switching.* Journal of Experimental Psychology: Human Perception and Performance, 27(4), 763–797. PMID: [11518143](https://pubmed.ncbi.nlm.nih.gov/11518143/)

---

### 2. Shannon Entropy for Usage Distribution

**Formula:**

```
H = -Σ pᵢ · log₂(pᵢ)
H_norm = H / log₂(N)
```

where `pᵢ` is the proportion of total usage time spent in app `i`, and `N` is the number of unique apps used.

**Implementation:** Computed within the AFI model as the δ·H component. Higher normalized entropy indicates attention scattered uniformly across many apps (aimless browsing), while lower entropy indicates concentrated usage in one or two apps.

**Research Basis:**  
Shannon entropy is the foundational measure of information-theoretic uncertainty. Applied to behavioral data, it quantifies the "spread" of user engagement across discrete categories.

> - Shannon, C. E. (1948). *A Mathematical Theory of Communication.* Bell System Technical Journal, 27(3), 379–423. DOI: [10.1002/j.1538-7305.1948.tb00917.x](https://doi.org/10.1002/j.1538-7305.1948.tb00917.x)

---

### 3. Distractiveness Score (DS)

**Formula (per app i):**

```
DSᵢ = w₁·Tᵢ + w₂·Fᵢ + w₃·Cᵢ
```

| Component | Symbol | Weight | Description |
|---|---|---|---|
| Normalized Daily Time | Tᵢ | w₁ = 0.40 | Average daily time in app (min-max normalized, 0–4h range) |
| Open Frequency | Fᵢ | w₂ = 0.35 | Number of times app opened per day (normalized, 0–100 range) |
| Focus Conflict | Cᵢ | w₃ = 0.25 | Proportion of app usage during scheduled focus windows (0–1) |

**Classification:** Apps with DSᵢ > 0.55 are classified as **distractive** and surfaced in nudge messages and the dashboard.

**Research Basis:**  
Digital distraction metrics combine time-on-task deviation, frequency of interruption, and goal-context conflict. The weighting reflects that total time investment and the habitual checking pattern (frequency) are the strongest predictors of attentional capture.

> - Mark, G., Gudith, D., & Klocke, U. (2008). *The cost of interrupted work: More speed and stress.* Proceedings of the SIGCHI Conference on Human Factors in Computing Systems. DOI: [10.1145/1357054.1357072](https://doi.org/10.1145/1357054.1357072)
> - Consolvo, S., McDonald, D. W., et al. (2008). *Activity sensing in the wild: A field trial of UbiFit Garden.* CHI 2008. DOI: [10.1145/1357054.1357335](https://doi.org/10.1145/1357054.1357335)

---

### 4. Personality-Based Impulsivity & Strictness

**Impulsivity Index:**

```
II = ((7 - C) + N - 1) / 12,    II ∈ [0, 1]
```

where C = Conscientiousness (Likert 1–7) and N = Neuroticism (Likert 1–7).

Low conscientiousness combined with high neuroticism yields high impulsivity, which maps to stricter intervention levels:

| Impulsivity Index | Blocking Level | Label |
|---|---|---|
| < 0.30 | Level 1 | Reflective only |
| 0.30–0.59 | Level 2 | Soft block (delays) |
| ≥ 0.60 | Level 3 | Hard block allowed |

**User override is always permitted** — the system recommends strictness but never removes autonomy.

**Research Basis:**  
The Big Five model of personality is the most empirically validated taxonomy in differential psychology. Conscientiousness inversely predicts impulsive behavior, while neuroticism amplifies reactive responding. The combination yields a robust proxy for self-regulatory capacity.

> - Costa, P. T., & McCrae, R. R. (1992). *Revised NEO Personality Inventory (NEO-PI-R) and NEO Five-Factor Inventory (NEO-FFI) professional manual.* Psychological Assessment Resources.
> - DeYoung, C. G. (2011). *Impulsivity as a personality trait.* In K. D. Vohs & R. F. Baumeister (Eds.), Handbook of Self-Regulation (2nd ed.). Guilford Press.

---

### 5. Goal Conflict Score (GCS)

**Formula:**

```
GCS = Ig × Mc × DSᵢ
```

| Component | Description | Range |
|---|---|---|
| Ig | Goal importance (user-set, 0–1) | 0–1 |
| Mc | Context mismatch (0 = aligned app, 0.7–1.0 = during scheduled focus) | 0–1 |
| DSᵢ | Distractiveness score of the currently active app | 0–1 |

If GCS > 0.70, the system escalates to a stronger intervention (from reflective → soft delay → hard block).

**Context Mismatch Computation:**
- App in goal's allowed list → Mc = 0
- Unscheduled goal, non-allowed app → Mc = 0.5
- Within scheduled focus window → Mc = 0.7 + 0.3 × progress (deeper into window = higher mismatch)
- Outside scheduled window → Mc = 0.3

**Research Basis:**  
Goal-behavior conflict generates cognitive dissonance that can either motivate corrective action or cause disengagement. ASTRA uses the conflict signal to time interventions at the moment of maximum receptivity.

> - Carver, C. S., & Scheier, M. F. (1998). *On the Self-Regulation of Behavior.* Cambridge University Press.
> - Gollwitzer, P. M., & Sheeran, P. (2006). *Implementation intentions and goal achievement: A meta-analysis.* Advances in Experimental Social Psychology, 38, 69–119. DOI: [10.1016/S0065-2601(06)38002-1](https://doi.org/10.1016/S0065-2601(06)38002-1)

---

### 6. Pomodoro Survival Modeling

**Concept:** Time-to-event (survival) analysis applied to focus session durations. The "event" is a distraction that ends the focus session.

**Algorithm:**
1. Compute E[T] = moving average of actual focus durations over the last N = 5 sessions
2. Compute success rate = proportion of sessions completed ≥ 90% of planned duration
3. Apply adjustment factor:

| Success Rate | Factor | Effect |
|---|---|---|
| ≥ 80% | 1.08 (growth) | Increase session length by 8% |
| 50–79% | 1.00 (stable) | Maintain current length |
| < 50% | 0.90 (shrink) | Decrease by 10% |

4. Next session duration = clamp(E[T] × factor, 10 min, 60 min)

**Break Schedule:** Standard 5-min break; every 4th session → 15-min long break.

**Research Basis:**  
Survival analysis (time-to-event modeling) is standard in clinical trials and reliability engineering. Applied here, it treats each focus session as an observation where the user either "survives" to completion or "fails" due to distraction. The adaptive interval ensures the user is challenged but not overwhelmed — a principle of progressive overload from learning science.

> - Kleinbaum, D. G., & Klein, M. (2012). *Survival Analysis: A Self-Learning Text* (3rd ed.). Springer.
> - Cirillo, F. (2006). *The Pomodoro Technique.* (Validated by broader vigilance decrement research in cognitive psychology.)
> - Mackworth, N. H. (1948). *The breakdown of vigilance during prolonged visual search.* Quarterly Journal of Experimental Psychology, 1(1), 6–21.

---

### 7. Bayesian Compliance Probability

**Formula (Laplace-smoothed posterior):**

```
P(comply | intervention) = (s + 1) / (n + 2)
```

where s = number of times the user complied and n = total nudges delivered.

| Observed | P | Interpretation |
|---|---|---|
| 0 attempts | 0.50 | Uninformative prior (Beta(1,1)) |
| 1/1 success | 0.67 | Optimistic estimate |
| 0/1 success | 0.33 | Pessimistic estimate |

If P < 0.40, the system **escalates** to a stronger intervention type.

**Trend Detection:** Compares recent-window P vs. overall P; delta > 0.10 → improving, < -0.10 → declining.

**Research Basis:**  
This is the posterior mean of a Beta-Binomial model with a Laplace (uniform) prior, the standard Bayesian approach for estimating binomial proportions with sparse observations.

> - Gelman, A., Carlin, J. B., Stern, H. S., Dunson, D. B., Vehtari, A., & Rubin, D. B. (2013). *Bayesian Data Analysis* (3rd ed.). CRC Press/Chapman & Hall.

---

### 8. Cognitive Readiness Score (CRS)

**Focus Trainer CRS (normalized 0–1):**

```
CRS = a·SleepQuality + b·HRV_norm + c·ActivityLevel - d·AFI_recent
```

| Weight | Value | Component |
|---|---|---|
| a | 0.30 | Sleep quality (normalized 0–1) |
| b | 0.25 | HRV (normalized 0–1) |
| c | 0.20 | Physical activity level (normalized 0–1) |
| d | 0.25 | Recent AFI (subtracted — higher fragmentation penalizes readiness) |

**Activity Recommendation Mapping:**

| CRS | Recommendation |
|---|---|
| ≥ 0.65 | Deep focus session |
| 0.40–0.64 | Meditation |
| 0.25–0.39 | Light exercise |
| < 0.25 | Rest |

**Research Basis:**  
The CRS is modeled after the Psychomotor Vigilance Task (PVT) literature which demonstrates that sleep quality, autonomic regulation (HRV), and physical activity are the three strongest modifiable predictors of sustained attention capacity.

> - Lim, J., & Dinges, D. F. (2010). *A meta-analysis of the impact of short-term sleep deprivation on cognitive variables.* Psychological Bulletin, 136(3), 375–389. DOI: [10.1037/a0018883](https://doi.org/10.1037/a0018883)
> - Thayer, J. F., Hansen, A. L., Saus-Rose, E., & Johnsen, B. H. (2009). *Heart rate variability, prefrontal neural function, and cognitive performance.* Annals of Behavioral Medicine, 37(2), 141–153. PMC: [6088366](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6088366/)

---

### 9. Attention Forecasting Heatmap

**Algorithm:** Rolling 7-day window of AFI measurements aggregated per (dayOfWeek, hour) → 7×24 = 168 HourBlock entries.

For each block:
1. Compute weighted average AFI from all historical samples for that (day, hour)
2. Confidence = min(sampleCount / 7, 1) (more data → higher confidence)
3. Classify block quality:

| Predicted AFI | Label |
|---|---|
| < 0.25 | Optimal |
| 0.25–0.39 | Good |
| 0.40–0.59 | Fair |
| ≥ 0.60 | Poor |

The heatmap enables ASTRA to suggest the **best hours for focused work** based on the user's own historical attention patterns.

**Research Basis:**  
Time-of-day effects on cognitive performance follow well-established circadian patterns. Individual differences are substantial, making personalized profiling (rather than population averages) essential for practical recommendation systems.

> - Schmidt, C., Collette, F., Cajochen, C., & Peigneux, P. (2007). *A time to think: Circadian rhythms in human cognition.* Cognitive Neuropsychology, 24(7), 755–789. DOI: [10.1080/02643290701754158](https://doi.org/10.1080/02643290701754158)

---

### 10. Dopamine Binge Detection

Detects two patterns of compulsive digital behavior:

| Pattern | Trigger | Threshold |
|---|---|---|
| **Long Binge** | Single distractive app session | > 20 minutes continuous use |
| **Switch Burst** | Rapid app-switching frenzy | ≥ 15 app switches in a 5-minute sliding window |

**Reset Protocol:**
1. `breathing-exercise` — 1-minute guided breathing (always)
2. `walk-suggestion` — 5-minute walk (for long-session binge only)
3. `reflection-nudge` — "What were you hoping to accomplish?" (always)

**Research Basis:**  
Compulsive digital media use activates mesolimbic dopamine pathways similarly to substance use disorders. Variable-ratio reinforcement schedules in social media create dopaminergic "seeking" loops identifiable by extended single-app engagement or rapid context-switching.

> - Montag, C., Lachmann, B., Herrlich, M., & Zweig, K. (2019). *Addictive features of social media/messenger platforms and freemium games against the background of psychological and economic theories.* International Journal of Environmental Research and Public Health, 16(14), 2612. DOI: [10.3390/ijerph16142612](https://doi.org/10.3390/ijerph16142612)
> - Alter, A. (2017). *Irresistible: The Rise of Addictive Technology and the Business of Keeping Us Hooked.* Penguin Press.

---

### 11. Sleep Normalization (Gaussian)

**Formula:**

```
SleepScore = 100 × exp(-0.5 × ((hours - μ) / σ)²)
```

where μ = 7.0 hours (optimal) and σ = 1.0 hour.

This produces a bell curve centered at 7 hours: sleeping 6h or 8h yields ~61, sleeping 5h or 9h yields ~14. The parabolic penalty is intentional — both under- and over-sleeping impair executive function.

**Research Basis:**  
A landmark study of ~500,000 UK Biobank adults found that 7 hours of sleep is the inflection point for optimal cognitive performance, with both shorter and longer durations associated with measurable executive function decline following a near-Gaussian decay pattern.

> - Li, Y., Sahakian, B. J., Kang, J., et al. (2022). *The brain structure and genetic mechanisms underlying the nonlinear association between sleep duration, cognition and mental health.* Nature Aging, 2, 425–437. DOI: [10.1038/s43587-022-00210-2](https://doi.org/10.1038/s43587-022-00210-2)
> - Mander, B. A., Winer, J. R., & Walker, M. P. (2017). *Sleep and human aging.* Neuron, 94(1), 19–36. DOI: [10.1016/j.neuron.2017.02.004](https://doi.org/10.1016/j.neuron.2017.02.004)

---

### 12. HRV Normalization & Autonomic Regulation

**Formula:**

```
HRVScore = clamp((RMSSD_ms / 50) × 100, 0, 100)
```

Baseline: RMSSD of 50ms maps to a perfect score of 100. Higher HRV indicates stronger parasympathetic (vagal) tone, which strongly predicts better executive attention, cognitive flexibility, and emotional regulation.

**Research Basis:**  
The neurovisceral integration model demonstrates that heart rate variability — specifically high-frequency HRV reflecting vagal tone — is functionally linked to prefrontal cortex-mediated cognitive control. Lower HRV is a reliable biomarker of cognitive fatigue and stress.

> - Thayer, J. F., Åhs, F., Fredrikson, M., Sollers, J. J., & Wager, T. D. (2012). *A meta-analysis of heart rate variability and neuroimaging studies: Implications for heart rate variability as a marker of stress and health.* Neuroscience & Biobehavioral Reviews, 36(2), 747–756. DOI: [10.1016/j.neubiorev.2011.11.009](https://doi.org/10.1016/j.neubiorev.2011.11.009)
> - Laborde, S., Mosley, E., & Thayer, J. F. (2017). *Heart rate variability and cardiac vagal tone in psychophysiological research.* Frontiers in Psychology, 8, 213. PMC: [5624990](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5624990/)

---

### 13. Hydration & Cognitive Function

**Formula:**

```
HydrationScore = clamp((water_ml / target_ml) × 100, 0, 100)
```

Target: 35 ml/kg/day (personalized by body weight) or 2000 ml default.

**Rule Engine Trigger:** If intake < 60% of daily target → urgent hydration flag + cognitive readiness penalty.

**Research Basis:**  
Even mild dehydration (1–2% body water loss) demonstrably impairs attention, reaction time, working memory, and executive function. The 35 ml/kg/day target aligns with EFSA dietary reference values.

> - Benton, D. (2011). *Dehydration influences mood and cognition: A plausible hypothesis?* Nutrients, 3(5), 555–573. DOI: [10.3390/nu3050555](https://doi.org/10.3390/nu3050555)
> - Adan, A. (2012). *Cognitive performance and dehydration.* Journal of the American College of Nutrition, 31(2), 71–78. DOI: [10.1080/07315724.2012.10720011](https://doi.org/10.1080/07315724.2012.10720011)

---

### 14. Exercise Normalization & Neuroplasticity

**Formula:**

```
ExerciseScore = 20                                  (if exercise = 0 min)
ExerciseScore = clamp((minutes / 30) × 100, 0, 100) (otherwise)
```

A floor of 20 prevents zero-exercise days from catastrophically collapsing the lifestyle score. The 30-minute target reflects WHO physical activity guidelines.

**Rule Engine Trigger:** If exercise ≥ 20 min → CognitiveReadiness gets a +5 boost.

**Research Basis:**  
Acute aerobic exercise induces BDNF release and hippocampal neurogenesis, directly improving working memory, cognitive flexibility, and attention. The effect is dose-dependent, with 20–30 minutes of moderate-intensity exercise providing the most reliable cognitive gains.

> - Smith, P. J., Blumenthal, J. A., Hoffman, B. M., et al. (2010). *Aerobic exercise and neurocognitive performance: A meta-analytic review of randomized controlled trials.* Psychosomatic Medicine, 72(3), 239–252. DOI: [10.1097/PSY.0b013e3181d14633](https://doi.org/10.1097/PSY.0b013e3181d14633)
> - Hillman, C. H., Erickson, K. I., & Kramer, A. F. (2008). *Be smart, exercise your heart: Exercise effects on brain and cognition.* Nature Reviews Neuroscience, 9, 58–65. DOI: [10.1038/nrn2298](https://doi.org/10.1038/nrn2298)

---

### 15. Sedentary Behavior Penalty

**Formula:**

```
SedentaryScore = clamp(100 × (1 - hours / 8), 0, 100)
```

Linear decay from 100 (0h sitting) to 0 (8h+ sitting). The score inversely encodes sedentary time as a penalty factor in the LifestyleScore.

**Rule Engine Trigger:** If sedentary hours ≥ 6 → warning flag + "Take a Walk" recommendation.

**Research Basis:**  
Prolonged uninterrupted sitting is independently associated with cognitive decline, reduced cerebral blood flow, and impaired executive function — even among otherwise physically active individuals.

> - Biswas, A., Oh, P. I., Faulkner, G. E., et al. (2015). *Sedentary time and its association with risk for disease incidence, mortality, and hospitalization in adults.* Annals of Internal Medicine, 162(2), 123–132. DOI: [10.7326/M14-1651](https://doi.org/10.7326/M14-1651)
> - Wheeler, M. J., Dunstan, D. W., Smith, B., et al. (2019). *Morning exercise mitigates the impact of prolonged sitting on cerebral blood flow in older adults.* Journal of Applied Physiology, 126(4), 1049–1055.

---

### 16. Composite Health Scores

**RecoveryScore (how well you've recovered):**

```
RecoveryScore = 0.55 × SleepScore + 0.25 × HRVScore + 0.20 × StressScore
```

Sleep is weighted highest because it is the single most impactful modifiable factor for next-day cognitive performance.

**LifestyleScore (how well you're maintaining lifestyle behaviors):**

```
LifestyleScore = 0.45 × ExerciseScore + 0.35 × HydrationScore + 0.20 × SedentaryScore
```

**CognitiveReadiness (master score):**

```
CognitiveReadiness = 0.6 × RecoveryScore + 0.4 × LifestyleScore
```

Recovery is weighted 60% vs. 40% for lifestyle because acute recovery state (sleep, stress, HRV) has a larger immediate effect on executive attention capacity than habitual lifestyle factors.

**Research Basis:**  
The hierarchical composition (sub-scores → composite → master) follows the structure of validated cognitive performance prediction models used in military and aviation contexts, where multi-domain physiological monitoring feeds into a single readiness index.

> - Balkin, T. J., Bliese, P. D., Belenky, G., et al. (2004). *Comparative utility of instruments for monitoring sleepiness-related performance decrements in the operational environment.* Journal of Sleep Research, 13(3), 219–227.

---

### 17. Health Trend Detection & Chronic Patterns

**Trend Detection:**
- Compute 7-day rolling average and 14-day rolling average for any health metric
- If 7-day avg is >10% lower than 14-day avg → **downward trend** flagged
- If 7-day avg is >10% higher → **upward trend**

**Chronic Low Detection:**
- If CognitiveReadiness has been below **50** for **≥ 3 consecutive days** → **urgent "Reduce Load" flag**
- Recommendation: reduce cognitive load for 48–72 hours

**Pearson Correlation:** Available for cross-metric analysis (e.g., correlating sleep with readiness) using standard Pearson r computation.

**Research Basis:**  
Cumulative sleep debt and sustained cognitive underperformance follow non-linear trajectories where recovery requires disproportionately longer rest periods. The 3-day chronic threshold reflects research showing that ≥3 nights of restricted sleep produces cognitive deficits equivalent to total sleep deprivation.

> - Van Dongen, H. P., Maislin, G., Mullington, J. M., & Dinges, D. F. (2003). *The cumulative cost of additional wakefulness.* Sleep, 26(2), 117–126. DOI: [10.1093/sleep/26.2.117](https://doi.org/10.1093/sleep/26.2.117)

---

### 18. Meditation Suitability Score (MSS)

**Sub-scores:**

```
RelaxationReadiness = 0.5 × norm_stress + 0.3 × norm_fatigue + 0.2 × norm_mood
ActivationReadiness = 0.4 × norm_mood + 0.35 × norm_time + 0.25 × norm_experience
```

**MSS (intent-dependent):**

For calm / sleep / recovery intents:
```
MSS = 0.6 × RelaxationReadiness + 0.3 × norm_hrv + 0.1 × norm_time
```

For focus / energy intents:
```
MSS = 0.5 × ActivationReadiness + 0.3 × norm_hrv + 0.2 × norm_time
```

**Session Type Selection:**

| Intent | MSS < 40 | MSS ≥ 70 | Default |
|---|---|---|---|
| Sleep / Recovery | Yoga Nidra | Body Scan | Body Scan |
| Calm | Body Scan | Breathing | Body Scan |
| Focus | Breathing | Mindfulness | Breathing |
| Energy | Breathing | Breathing | Breathing |

**Attention Boost Estimate:**

```
boost = BaseBoost_type × (MSS / 100)
```

| Type | Base Boost |
|---|---|
| Mindfulness | +8 |
| Breathing | +6 |
| Body Scan | +5 |
| Yoga Nidra | −2 (recovery-oriented, reduces arousal) |

**Research Basis:**  
Meditation type-specific cognitive effects are well-documented. Mindfulness meditation shows the strongest improvements in sustained attention and cognitive flexibility, while breathing exercises are most effective at reducing cortisol and activating the parasympathetic nervous system. Yoga Nidra specifically targets recovery through conscious relaxation.

> - Creswell, J. D. (2017). *Mindfulness interventions.* Annual Review of Psychology, 68, 491–516. DOI: [10.1146/annurev-psych-042716-051139](https://doi.org/10.1146/annurev-psych-042716-051139)
> - Moszeik, E. N., von Oertzen, T., & Mönkemöller, K. (2022). *Effectiveness of a short Yoga Nidra meditation on stress, sleep, and well-being.* BMC Psychiatry, 22, 72. PMC: [8734923](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8734923/)
> - Zaccaro, A., Piarulli, A., Laurino, M., et al. (2018). *How breath-control can change your life: A systematic review on psycho-physiological correlates of slow breathing.* Frontiers in Human Neuroscience, 12, 353. PMC: [6137615](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6137615/)

---

### 19. Meditation Rule Engine

Six priority-ordered rules (lower number = higher priority):

| # | Rule | Trigger | Action | Citation |
|---|---|---|---|---|
| 1 | **Micro-session** | Available time < 6 min | Force breathing, cap at 5 min | Time-constraint adaptation |
| 2 | **Fatigue Recovery** | Fatigue ≥ 4 + focus intent | Override to Yoga Nidra, MSS −10 | PMC8734923 (Yoga Nidra efficacy) |
| 3 | **Low HRV + Stress** | HRV < 40ms + stress ≥ 4 | Override to breathing | PMC9899909 (HRV biofeedback) |
| 4 | **Novice Guided** | Novice + ≥ 10 min available | Recommend guided breathing | Standard meditation pedagogy |
| 5 | **Density Limit** | ≥ 2 large sessions (15+ min) today | Cap to 5-min micro only | Overtraining prevention |
| 6 | **Efficacy Check** | Last session rated ≥ 4 + post-HRV > 1.03× pre-HRV | Boost flag for effective type, MSS +5 | PMC9899909 (HRV improvement marker) |

---

### 20. Context Inference Engine

Eight priority-ordered context modes, evaluated on the unified `UserState`:

| Priority | Mode | Key Triggers | Confidence Calc |
|---|---|---|---|
| 1 | `overloaded` | Stress ≥ 4 AND fatigue ≥ 4 | 0.6 + (stress + fatigue − 8) × 0.1 |
| 2 | `emotionally-reactive` | Stress ≥ 4 AND (neuroticism ≥ 5 OR reactivity > 0.6) | 0.5 + reactivity × 0.3 |
| 3 | `cognitively-fatigued` | CRS < 0.4 OR fatigue ≥ 4 | 0.5 + dynamic modifiers |
| 4 | `drifting` | Compliance < 0.4 AND distraction > 0.6, or declining + 2+ days no focus | 0.6 + distraction × 0.2 |
| 5 | `recovering` | Last session successful + CRS < 0.6 + fatigue ≥ 3 | 0.6 |
| 6 | `performance-ready` | CRS > 0.7 AND sleep ≥ 7h AND fatigue ≤ 2 AND AFI < 0.3 | 0.6 + CRS × 0.2 |
| 7 | `opportunity-window` | CRS > 0.6 AND AFI < 0.4 AND weekly focus < 120 min | 0.5 + CRS × 0.2 |
| 8 | `maintenance` | No strong signals (fallback) | 0.5 |

First high-confidence match wins. This implements a **rule-based context classification system** following the persuasive technology paradigm of delivering the right intervention at the right moment.

**Research Basis:**

> - Fogg, B. J. (2003). *Persuasive Technology: Using Computers to Change What We Think and Do.* Morgan Kaufmann.
> - Consolvo, S., McDonald, D. W., & Landay, J. A. (2009). *Theory-driven design strategies for technologies that support behavior change in everyday life.* CHI 2009. DOI: [10.1145/1518701.1518766](https://doi.org/10.1145/1518701.1518766)

---

### 21. Behavioral Gap Analysis

Five dimensions of goal-behavior tension:

| Dimension | Formula | Weight |
|---|---|---|
| **Goal vs. Focus** | urgency × (1 − weekly_minutes / expected_minutes) | 0.30 |
| **Distraction Deviation** | actual_distraction − (impulsivity × 0.5 + 0.2) | 0.25 |
| **Compliance Gap** | (0.5 + C/14) − actual_compliance | 0.20 |
| **Session Skip Rate** | (1 − survival_rate) × 0.7 + min(days_since_focus/7, 1) × 0.3 | 0.15 |
| **Recovery Neglect** | (fatigue_pressure × 0.4 + stress_pressure × 0.3 + CRS_signal × 0.3) × was_active | 0.10 |

**Overall Gap Level:**

| Score | Level |
|---|---|
| < 0.20 | Low |
| 0.20–0.44 | Moderate |
| 0.45–0.69 | High |
| ≥ 0.70 | Critical |

**Research Basis:**  
The gap analysis operationalizes *control theory* for self-regulation: behavior change is driven by the perceived discrepancy between the current state and the goal state. Larger discrepancies require stronger corrective signals.

> - Carver, C. S., & Scheier, M. F. (1982). *Control theory: A useful conceptual framework for personality–social, clinical, and health psychology.* Psychological Bulletin, 92(1), 111–135.
> - Powers, W. T. (1973). *Behavior: The Control of Perception.* Aldine.

---

### 22. Strategy Selection & Tone Calibration

**Strategy Type Selection (context × gap × personality):**

| Condition | Strategy |
|---|---|
| Overloaded / Fatigued / Recovering | `recovery-first` |
| Emotionally reactive + high authority resistance | `reflective` |
| Emotionally reactive + low authority resistance | `supportive` |
| Critical gap + cognitive readiness > 0.5 | `enforcing` |
| High gap + high authority resistance | `reflective` |
| High gap + low authority resistance | `enforcing` |
| Moderate gap | `reflective` |
| Performance-ready / Opportunity | `opportunity-driven` |
| Default | `supportive` |

**Tone Selection (strategy × personality):**

| Strategy | Condition | Tone |
|---|---|---|
| Recovery / Supportive | High emotional reactivity (>0.6) | `supportive` |
| Recovery / Supportive | Low self-efficacy (<0.4) | `confidence_building` |
| Reflective | High self-efficacy (>0.7) | `challenge` |
| Enforcing | High authority resistance (>0.6) | `challenge` |
| Enforcing | High self-efficacy (>0.6) | `sharp` |
| Opportunity | High self-efficacy (>0.6) | `challenge` |
| Opportunity | Low self-efficacy | `confidence_building` |

**Strictness Modifiers:**
- Critical gap → +1 (max 5)
- High gap → +1 (max 4)
- Authority resistance > 0.6 → −1 (min 1)
- Impulsivity > 0.7 → +1 (max 5)
- Intervention fatigue > 0.6 → −1 (min 1)

**Research Basis:**  
Personality-calibrated intervention delivery is significantly more effective than generic messaging. Authority-resistant individuals respond better to reflective prompts than direct commands, while high-self-efficacy individuals respond well to challenge framing.

> - Fogg, B. J. (2003). *Persuasive Technology.* Morgan Kaufmann.
> - Noar, S. M., Benac, C. N., & Harris, M. S. (2007). *Does tailoring matter? Meta-analytic review of tailored print health behavior change interventions.* Psychological Bulletin, 133(4), 673–693. DOI: [10.1037/0033-2909.133.4.673](https://doi.org/10.1037/0033-2909.133.4.673)

---

### 23. Emotion & Self-Regulation Model

**Emotional Reactivity Score (ERS):** Computed during onboarding from NLP analysis of the user's free-text response about their emotional state after distraction. Emotion words are mapped to valence scores (−1 to +1), with high negative valence (guilt, shame, anxiety) yielding high reactivity.

**Application:** ERS > 0.6 routes the user to `supportive` or `confidence_building` nudge tones. Low ERS with indifference markers triggers `sharp` tones to create productive friction.

**Research Basis:**  
Emotional reactivity modulates the efficacy of behavioral interventions — highly reactive individuals require validation and support, while low-reactivity individuals benefit from more confrontational approaches.

> - Gross, J. J. (2015). *Emotion regulation: Current status and future prospects.* Psychological Inquiry, 26(1), 1–26. DOI: [10.1080/1047840X.2014.940781](https://doi.org/10.1080/1047840X.2014.940781)

---

### 24. Implementation Intentions (Goal Cues)

Nudge text is heavily personalized to tie directly into the user's explicit goals and ideal future self (captured during onboarding). This operationalizes "if-then" planning from goal-setting research.

**Example:** If the user's goal is "DSA practice for internship" and their ideal future self is "software engineer at a top company," a drifting-mode nudge might say: *"Your DSA goal is gathering dust — 0 sessions today. That internship won't apply itself."*

**Research Basis:**  
Implementation intentions — specific if-then plans — have a medium-to-large effect (d = 0.65) on goal attainment across 94 independent studies.

> - Gollwitzer, P. M., & Sheeran, P. (2006). *Implementation intentions and goal achievement: A meta-analysis of effects and processes.* Advances in Experimental Social Psychology, 38, 69–119. DOI: [10.1016/S0065-2601(06)38002-1](https://doi.org/10.1016/S0065-2601(06)38002-1)

---

### 25. Self-Efficacy & Behavior Change

**Self-Efficacy Score (SES):** Computed from NLP analysis of the user's open-ended responses. Indicators of self-efficacy ("I can," "I'm working on," "I've improved") boost the score; indicators of helplessness ("I can't," "impossible," "never") lower it.

**Application:** SES drives the strictness compatibility matrix — higher self-efficacy users tolerate and respond well to more challenging interventions, while lower self-efficacy users need micro-wins and encouragement.

**Research Basis:**  
Perceived self-efficacy is one of the strongest predictors of behavior change adherence. Interventions that exceed the user's self-efficacy level cause disengagement; those calibrated to it produce sustainable change.

> - Bandura, A. (1977). *Self-efficacy: Toward a unifying theory of behavioral change.* Psychological Review, 84(2), 191–215. DOI: [10.1037/0033-295X.84.2.191](https://doi.org/10.1037/0033-295X.84.2.191)
> - Bandura, A. (1997). *Self-Efficacy: The Exercise of Control.* W. H. Freeman.

---

## Onboarding & Personality Profiling

ASTRA's 10-step onboarding flow captures both structured (Likert-scale) and open-ended personality data:

| Step | Type | Data Captured |
|---|---|---|
| 1. Welcome | — | Introduction |
| 2. Structured 1 | Likert 1–7 | Conscientiousness (×2), Neuroticism (×2) |
| 3. Structured 2 | Likert 1–7 | Openness, Agreeableness, Extraversion |
| 4. Structured 3 | Likert 1–7 | Authority Resistance (×2), Strictness Preference, Autonomy Preference |
| 5. Core Goal | Free text | Goal category, urgency, motivation type |
| 6. Primary Distraction | Free text | Distraction type vector |
| 7. Emotional State | Free text | Emotional reactivity, valence |
| 8. Ideal Future Self | Free text | Used in personalized nudge content |
| 9. Self-Identified Weakness | Free text | Self-efficacy indicators |
| 10. Summary | Review | Profile confirmation |

**Profile Build Pipeline:**  
Big Five extraction → NLP text analysis → Scoring engine (GUS, ERS, SES, DTV) → Behavioral model (Impulsivity, Authority Resistance, Strictness Compatibility, Nudge Tone, Uninstall Risk, Baseline Focus) → Response prediction matrix seed → Personalized summary generation

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native 0.81 + Expo SDK 54 |
| **Language** | TypeScript (strict mode) |
| **State Management** | Zustand 4.5 (6 stores, AsyncStorage persistence) |
| **Local Storage** | MMKV + AsyncStorage |
| **Database** | expo-sqlite (SQLite) |
| **Navigation** | React Navigation 6 (Bottom Tab Navigator) |
| **LLM** | Groq API — `llama-3.3-70b-versatile` (temperature 0.7, max 300 tokens) |
| **UI** | React Native StyleSheet (dark theme, `#0D1117` base), react-native-svg, react-native-reanimated |
| **Testing** | Jest + ts-jest |

---

## Project Structure

```
ASTRA/
├── App.js                                    # Entry point
├── src/
│   ├── app/
│   │   ├── App.tsx                           # Root component (NavigationContainer)
│   │   └── Navigation.tsx                    # Bottom tab navigator (6 tabs)
│   ├── screens/
│   │   ├── DashboardScreen.tsx               # AFI gauge, CRS, orchestrator card, auto-nudge timer
│   │   ├── FocusSessionScreen.tsx            # Pomodoro session runner
│   │   ├── CognitiveTrainingScreen.tsx       # Dual N-Back + Attention Switching
│   │   ├── HeatmapScreen.tsx                 # Focus hour heatmap visualization
│   │   ├── MeditateScreen.tsx                # Meditation launcher + ASTRA recommendation
│   │   ├── HealthScreen.tsx                  # Health dashboard + daily input form
│   │   ├── OnboardingScreen.tsx              # 10-step personality profiling
│   │   └── SettingsScreen.tsx                # Configuration
│   ├── components/
│   │   ├── NudgeOverlay.tsx                  # Global animated nudge popup
│   │   ├── health/                           # 12 health UI components
│   │   └── meditate/                         # 10 meditation UI components
│   ├── modules/
│   │   ├── agent/                            # Behavioral Orchestrator Agent
│   │   │   ├── engine/                       # 5-stage pipeline (6 files)
│   │   │   ├── llm/                          # Groq client + prompt engineering
│   │   │   ├── store/                        # Orchestrator Zustand store
│   │   │   └── types/                        # Orchestrator type definitions
│   │   ├── focusTrainer/                     # Focus module
│   │   │   ├── math/                         # 10 math models (AFI, CRS, DS, etc.)
│   │   │   ├── engine/                       # AdaptiveBlocker, InterventionEngine, NudgeManager
│   │   │   ├── services/                     # UsageStats, Health, ActivityRecognition, Background
│   │   │   ├── training/                     # DualNBack, AttentionSwitching engines
│   │   │   └── store/                        # Focus Zustand store
│   │   ├── health/                           # Health module
│   │   │   ├── engine/                       # Normalizers, scores, rules, trends
│   │   │   ├── constants/                    # Tunable thresholds and weights
│   │   │   └── store/                        # Health Zustand store (persisted)
│   │   ├── meditation/                       # Meditation module
│   │   │   ├── engine/                       # MSS computation, rules, normalizers
│   │   │   ├── constants/                    # MSS weights and thresholds
│   │   │   └── store/                        # Meditation Zustand store (persisted)
│   │   ├── onboarding/                       # Onboarding + personality profiling
│   │   │   ├── engine/                       # ProfileBuilder, SummaryGenerator, ResponsePrediction
│   │   │   ├── nlp/                          # Text analysis (keywords, valence, categories)
│   │   │   ├── scoring/                      # ScoringEngine, BehavioralModel
│   │   │   └── store/                        # Onboarding Zustand store
│   │   ├── personalization/                  # Adaptive personalization engine
│   │   │   ├── engine/                       # PersonalizationEngine (3-layer orchestrator)
│   │   │   ├── layers/                       # Baseline, BehavioralAdaptation, ContextualDecision
│   │   │   ├── tracking/                     # AttentionEvolution, HabitEngine
│   │   │   └── store/                        # Personalization Zustand store
│   │   └── shared/                           # Shared types, engine, storage
│   ├── engine/                               # Re-exports for all module engines
│   ├── constants/                            # Re-exports for all module constants
│   ├── database/                             # SQLite schema + repository
│   ├── store/                                # Re-exports for all stores
│   └── types/                                # Re-exports for shared types
└── __tests__/                                # Jest test suites
```

---

## Setup & Installation

### Prerequisites

- **Node.js** ≥ 18 and npm/yarn
- **Java 17** (JDK) for Android builds
- **Android SDK** with API level 34+
- **Physical Android device** (required for `UsageStatsManager` background tracking — emulators have limited UsageStats support)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/harshitsaini17/astra-insomniac-hackathon.git
cd astra-insomniac-hackathon

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env and add your Groq API key:
#   GROQ_API_KEY=gsk_xxx...
#   EXPO_PUBLIC_GROQ_API_KEY=gsk_xxx...

# 4. Build and run on Android
npx expo run:android
```

> **Note:** On first launch, ASTRA will request **Usage Access** permissions (Settings → Apps → Special Access → Usage Access). This is required for the Attention Fragmentation Index to function.

---

## Configuration

### Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `GROQ_API_KEY` | Groq API key (server-side) | Yes |
| `EXPO_PUBLIC_GROQ_API_KEY` | Groq API key (client-side, inlined at build) | Yes |

### Tunable Constants

All weights, thresholds, and model parameters are centralized in constant files for easy tuning:

| File | Contents |
|---|---|
| `src/modules/focusTrainer/models/constants.ts` | AFI weights, DS weights, CRS weights, Pomodoro defaults, dopamine thresholds, N-Back/Attention Switching config |
| `src/modules/health/constants/health-constants.ts` | Sleep μ/σ, HRV baseline, hydration target, composite score weights, rule thresholds, trend windows |
| `src/modules/meditation/constants/meditation-constants.ts` | MSS formula weights, attention boost by type, normalization params, duration defaults, rule thresholds |

---

## Testing

```bash
# Run all tests
npm test

# Run specific test suites
npx jest --testPathPattern=mathModels
npx jest --testPathPattern=onboarding
```

Test coverage includes:
- Math model unit tests (AFI, CRS, DS, compliance, survival)
- Onboarding profile builder validation

---

## Full Bibliography

The following peer-reviewed publications form the scientific foundation of ASTRA's rule-based engine:

1. **Monsell, S.** (2003). Task switching. *Trends in Cognitive Sciences*, 7(3), 134–140.
2. **Rubinstein, J. S., Meyer, D. E., & Evans, J. E.** (2001). Executive control of cognitive processes in task switching. *Journal of Experimental Psychology: HPP*, 27(4), 763–797.
3. **Shannon, C. E.** (1948). A Mathematical Theory of Communication. *Bell System Technical Journal*, 27(3), 379–423.
4. **Mark, G., Gudith, D., & Klocke, U.** (2008). The cost of interrupted work. *CHI 2008*.
5. **Costa, P. T., & McCrae, R. R.** (1992). *Revised NEO Personality Inventory (NEO-PI-R)*. PAR.
6. **DeYoung, C. G.** (2011). Impulsivity as a personality trait. In *Handbook of Self-Regulation* (2nd ed.). Guilford.
7. **Carver, C. S., & Scheier, M. F.** (1998). *On the Self-Regulation of Behavior.* Cambridge.
8. **Gollwitzer, P. M., & Sheeran, P.** (2006). Implementation intentions and goal achievement. *AESP*, 38, 69–119.
9. **Kleinbaum, D. G., & Klein, M.** (2012). *Survival Analysis* (3rd ed.). Springer.
10. **Cirillo, F.** (2006). *The Pomodoro Technique*.
11. **Mackworth, N. H.** (1948). The breakdown of vigilance during prolonged visual search. *QJEP*, 1(1), 6–21.
12. **Gelman, A., et al.** (2013). *Bayesian Data Analysis* (3rd ed.). CRC Press.
13. **Li, Y., Sahakian, B. J., et al.** (2022). Brain structure and genetic mechanisms underlying sleep-cognition association. *Nature Aging*, 2, 425–437.
14. **Mander, B. A., Winer, J. R., & Walker, M. P.** (2017). Sleep and human aging. *Neuron*, 94(1), 19–36.
15. **Lim, J., & Dinges, D. F.** (2010). Sleep deprivation and cognitive variables. *Psychological Bulletin*, 136(3), 375–389.
16. **Thayer, J. F., et al.** (2012). Heart rate variability and neuroimaging. *Neurosci. Biobehav. Rev.*, 36(2), 747–756.
17. **Laborde, S., Mosley, E., & Thayer, J. F.** (2017). Heart rate variability and cardiac vagal tone. *Frontiers in Psychology*, 8, 213.
18. **Benton, D.** (2011). Dehydration influences mood and cognition. *Nutrients*, 3(5), 555–573.
19. **Adan, A.** (2012). Cognitive performance and dehydration. *JACN*, 31(2), 71–78.
20. **Smith, P. J., et al.** (2010). Aerobic exercise and neurocognitive performance. *Psychosomatic Medicine*, 72(3), 239–252.
21. **Hillman, C. H., Erickson, K. I., & Kramer, A. F.** (2008). Exercise effects on brain and cognition. *Nature Reviews Neuroscience*, 9, 58–65.
22. **Biswas, A., et al.** (2015). Sedentary time and disease risk. *Annals of Internal Medicine*, 162(2), 123–132.
23. **Van Dongen, H. P., et al.** (2003). The cumulative cost of additional wakefulness. *Sleep*, 26(2), 117–126.
24. **Creswell, J. D.** (2017). Mindfulness interventions. *Annual Review of Psychology*, 68, 491–516.
25. **Moszeik, E. N., et al.** (2022). Yoga Nidra effectiveness. *BMC Psychiatry*, 22, 72.
26. **Zaccaro, A., et al.** (2018). Slow breathing and psychophysiology. *Frontiers in Human Neuroscience*, 12, 353.
27. **Montag, C., et al.** (2019). Addictive features of social media. *IJERPH*, 16(14), 2612.
28. **Fogg, B. J.** (2003). *Persuasive Technology.* Morgan Kaufmann.
29. **Consolvo, S., et al.** (2009). Theory-driven design for behavior change. *CHI 2009*.
30. **Schmidt, C., et al.** (2007). Circadian rhythms in human cognition. *Cognitive Neuropsychology*, 24(7), 755–789.
31. **Carver, C. S., & Scheier, M. F.** (1982). Control theory for personality-social, clinical, and health psychology. *Psychological Bulletin*, 92(1), 111–135.
32. **Powers, W. T.** (1973). *Behavior: The Control of Perception.* Aldine.
33. **Noar, S. M., et al.** (2007). Tailored health behavior change interventions. *Psychological Bulletin*, 133(4), 673–693.
34. **Gross, J. J.** (2015). Emotion regulation: Current status and future prospects. *Psychological Inquiry*, 26(1), 1–26.
35. **Bandura, A.** (1977). Self-efficacy: Toward a unifying theory. *Psychological Review*, 84(2), 191–215.
36. **Bandura, A.** (1997). *Self-Efficacy: The Exercise of Control.* W. H. Freeman.
37. **Balkin, T. J., et al.** (2004). Instruments for monitoring sleepiness-related performance decrements. *J. Sleep Research*, 13(3), 219–227.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with conviction that <strong>transparent, research-grounded systems</strong> are the future of personal AI.<br/>
  ASTRA — because you deserve to know <em>why</em>.
</p>
