# ASTRA: Privacy-First Cognitive Optimization Engine

<p align="center">
  <em>An open-source, on-device mobile application designed to optimize cognitive performance, focus, and mental well-being using research-backed heuristics.</em>
</p>

---

## 🚀 Overview

ASTRA is a next-generation productivity and wellness application. Unlike conventional apps that rely on opaque, cloud-based machine learning models, ASTRA uses a **transparent, rule-based personalization engine** that runs entirely on-device (via React Native and Expo). 

ASTRA integrates real-time behavioral data (Android `UsageStatsManager` background tracking) with physiological and psychological inputs (sleep, HRV, hydration, emotional state) to trigger hyper-relevant, personalized interventions—whether that's a strict nudge to stop scrolling, a tailored Pomodoro interval, or a dynamically selected meditation session.

---

## 🧠 Core Modules

1. **Focus Trainer**
   Tracks application usage in the background to compute an **Attention Fragmentation Index (AFI)**. Intervenes when users enter "distraction spirals" or "binges" with personalized, tone-matched nudges (e.g., Strict, Supportive). It employs dynamic Pomodoro sessions that adapt to your historical survival times.
   
2. **Meditation Module**
   Recommends meditation sessions based on real-time stress, fatigue, and mood inputs. Instead of rigid plans, it uses readiness scores and Bayesian updating to select sessions proven to boost executive function and parasympathetic tone.

3. **Health Integration**
   Log or sync sleep hours, hydration, and HRV. ASTRA normalizes these metrics against clinical baselines to modulate your overall "Cognitive Readiness," which directly influences how the Focus Trainer and Meditation modules interact with you.

---

## 🔬 Research-Backed Architecture & Formulas

ASTRA’s core differentiation is its **Hybrid Orchestrator**. We eschewed "black-box" ML for transparent, conditionally-weighted formulas grounded in cognitive science, HCI, and human performance research. 

Below is the complete bibliography and scientific backing for every rule-based formula driving ASTRA's logic:

### 1. Attention Fragmentation & Context Switching
* **Concept:** Frequent context switches rapidly degrade executive attention and working memory.
* **ASTRA Implementation:** `Fragmented Attention Index (AFI)`. We track switch rates per minute and penalize rapid toggling between distictive apps.
* **Research Basis:** 
  > * Monsell, S. (2003). *Task switching.* Trends in Cognitive Sciences. DOI: 10.1016/S1364-6613(03)00028-7
  > * Rubinstein, D. A., et al. (2001). *Executive control of cognitive processes in task switching.* Journal of Experimental Psychology. PMC: 1424289

### 2. Shannon Entropy for Usage Distribution
* **Concept:** Entropy measures distribution uniformity—higher entropy equals more scattered attention across multiple apps.
* **ASTRA Implementation:** Computed as part of the fragmentation component to detect aimless browsing vs. focused single-app usage.
* **Research Basis:**
  > * Shannon, C. E. (1948). *A Mathematical Theory of Communication.* Bell System Technical Journal. DOI: 10.1002/j.1538-7305.1948.tb00917.x

### 3. Bayesian Updating for Compliance Probability
* **Concept:** Accurately updating the expected effectiveness of an intervention based on observed user behavior.
* **ASTRA Implementation:** `P_new = (success + 1) / (attempts + 2)`. This Bayesian estimation of binomial probability (with Laplace smoothing) dynamically ranks which nudge styles (Strict, Reflective, etc.) actually work for the user.
* **Research Basis:**
  > * Gelman, A. et al. (2013). *Bayesian Data Analysis.* 3rd ed., CRC Press.

### 4. Survival Modeling for Attention Span
* **Concept:** Time-to-event analysis models uninterrupted focus duration.
* **ASTRA Implementation:** Session survival time dictates dynamic Pomodoro adaptations. If a user consistently breaks focus at 18 minutes, the engine shortens the target interval to ensure successful completion.
* **Research Basis:**
  > * Kleinbaum, D. G., & Klein, M. (2012). *Survival Analysis.* Springer.

### 5. Implementation Intentions (Goal Cues)
* **Concept:** "If-then" planning significantly increases goal attainment.
* **ASTRA Implementation:** Nudge text is heavily personalized to tie directly into the user's explicit goals (e.g., *"Finish today's DSA problem. That internship won't apply itself."*).
* **Research Basis:**
  > * Gollwitzer, P. M., & Sheeran, P. (2006). *Implementation intentions and goal achievement: A meta-analysis of effects and processes.* Advances in Experimental Social Psychology. DOI: 10.1016/S0065-2601(06)38002-1

### 6. Cognitive Load & Executive Function
* **Concept:** Sleep duration has a non-linear (parabolic) relationship to executive function execution.
* **ASTRA Implementation:** Optimal performance is pegged at ~7 hours. ASTRA applies a parabolic normalization penalty: `(7 - sleep_hours)^2 * 0.05`. Deviating above or below 7 hours reduces the Cognitive Readiness score.
* **Research Basis:**
  > * Mander, B. A. et al. (2017). *Sleep and human cognitive performance: Affective and executive processes.* Annual Review of Psychology. PMC: 00808366
  > * 480k adult UK Biobank study linking optimum executive function to ~7 hours of sleep.

### 7. HRV & Attention / Autonomic Regulation
* **Concept:** Higher Heart Rate Variability (specifically HF-HRV, vagal tone) strongly predicts better attention, cognitive status, and self-regulation.
* **ASTRA Implementation:** `normalize_hrv`. High relative HRV boosts the Cognitive Readiness index, signaling the user is capable of intense focus tasks. Low HRV flags potential fatigue or stress.
* **Research Basis:**
  > * Thayer, J. F., et al. (2009). *Heart Rate Variability, Prefrontal Neural Function, and Cognitive Performance...* Annals of Behavioral Medicine. PMC: 6088366
  > * Laborde, S., et al. (2017). *Heart Rate Variability and Cardiac Vagal Tone in Psychophysiological Research.* PMC: 5624990

### 8. Hydration & Cognitive Function
* **Concept:** Mild dehydration (even 1-2% body water loss) demonstrably impairs attention, reaction time, and executive function.
* **ASTRA Implementation:** `hydration_flag`. Checks if fluid intake meets the >60% threshold of the custom daily target. If unmet, Cognitive Readiness is handicapped.
* **Research Basis:**
  > * Benton, D. (2011). *Dehydration influences mood and cognition: A plausible hypothesis?* Nutrients. DOI: 10.3390/nu3010001

### 9. Aerobic Exercise & Cognition
* **Concept:** Moderate aerobic exercise induces neuroplastic changes and directly boosts cognitive readiness and working memory.
* **ASTRA Implementation:** `normalize_exercise`. Meeting daily moderate/vigorous exercise thresholds provides a positive modifier to the daily lifestyle score.
* **Research Basis:**
  > * Smith, P. J. et al. (2010). *Aerobic exercise and neurocognitive performance: A meta-analytic review...* Psychosomatic Medicine. DOI: 10.1097/PSY.0b013e3181e37269

### 10. Sedentary Behavior & Cognitive Risk
* **Concept:** Prolonged sedentary time correlates with systemic cognitive performance decline over the day.
* **ASTRA Implementation:** `normalize_sedentary`. Long periods without detected movement incrementally increase the fatigue multiplier.
* **Research Basis:**
  > * Biswas, A., et al. (2015). *Sedentary time and its association with risk for disease incidence, mortality, and hospitalization in adults.* Annals of Internal Medicine. DOI: 10.7326/M14-1651

### 11. Interval Dependency (Pomodoro)
* **Concept:** Breaking exertion into short intervals with enforced breaks improves sustained attention.
* **ASTRA Implementation:** Used as a core engineering structural heuristic for the Focus Trainer.
* **Research Basis:**
  > * Cirillo, F. (2006). *The Pomodoro Technique.* (Validated by broader task-vigilance research).

### 12. Emotion & Self-Regulation
* **Concept:** Emotional reactivity drastically modulates an individual's response to interventions.
* **ASTRA Implementation:** `EmotionalReactivityScore`. Evaluated during onboarding, determining if a user receives aggressive/strict nudges (which work for low-reactivity) or supportive/reflective nudges (required for high-reactivity).
* **Research Basis:**
  > * Gross, J. J. (2007). *Emotion regulation: Conceptual and empirical foundations.* Handbook of Emotion Regulation. DOI: 10.1093/oxfordhb/9780198229266.003.0001

### 13. Self-Efficacy and Behavior Change
* **Concept:** Belief in one's ability to succeed strongly dictates adherence to interventions.
* **ASTRA Implementation:** `SelfEfficacyScore`. Drives the strictness compatibility matrix within the Orchestrator Store.
* **Research Basis:**
  > * Bandura, A. (1977). *Self-efficacy: Toward a unifying theory of behavioral change.* Psychological Review. DOI: 10.1037/0033-295X.84.2.191

### 14. Rule-Based Personalization in Psychology
* **Concept:** Predictable rule-based segmentation outperforms random triggers in digital behavior change.
* **ASTRA Implementation:** Forms the architectural DNA of ASTRA. By combining explicit conditionals (e.g., `if HRV is low AND sleep < 6h THEN attention=risk`), ASTRA remains deterministic, fast, and transparent.
* **Research Basis:**
  > * Fogg, B. J. (2003). *Persuasive Technology: Using Computers to Change What We Think and Do.* Morgan Kaufmann.

### 15. Contextual Behavior Patterns
* **Concept:** Time of day, environmental cues, and existing states alter engagement receptivity.
* **ASTRA Implementation:** `ContextState` detection biases interventions based on normalized TimeOfDay indices.
* **Research Basis:**
  > * Consolvo, S., et al. (2008). *Activity sensing in the wild: A field trial of UbiFit Garden.* CHI.

---

## 🛠 Setup & Installation

**Prerequisites:**
- Node.js & npm/yarn
- React Native environment (Expo CLI)
- Java 17 (JDK)
- Android SDK

**Run the Project:**
```bash
# Clone the repository
git clone https://github.com/harshitsaini17/astra-insomniac-hackathon.git
cd astra-insomniac-hackathon

# Install dependencies
npm install

# Build & Run on Android (Requires physical device for UsageStats tracking)
npx expo run:android
```

*(Note: On initial launch upon device, ASTRA will require "Usage Access" permissions to correctly compute the Fragmented Attention Index).*

---

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
