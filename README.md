# SolarExpert

AI-assisted diagnostics and system design for residential solar and inverter setups. Describe a problem in plain language, or list your appliances, and get expert-grade guidance — grounded in a curated knowledge base, not AI guesswork.

## What it does

SolarExpert has two core tools:

### 🔧 Troubleshoot
Describe what's going wrong with your solar or inverter setup — a beeping overload warning, flickering lights, a battery that won't last the night — and the system matches your description against a knowledge base of known fault patterns, then returns:
- The most likely cause
- A confidence level (high / medium / low match)
- Step-by-step fix instructions
- A plain-language explanation of *why* it happens

### ⚡ Design a System
List the appliances you want to power, your backup duration needs, and your location. The system calculates:
- Recommended panel wattage
- Battery bank size (Ah)
- Inverter rating (kVA)
- Daily energy consumption
- Optimal panel orientation and tilt for your latitude

All calculations are done by a deterministic engine — the AI only explains the results and flags risks (e.g. thin safety margins, undersizing). It never performs or overrides the actual sizing math.

## How it works

```
User description / appliance list
            ↓
   Knowledge base match (troubleshoot)
   or deterministic calculation (design)
            ↓
        AI explanation layer
            ↓
   Structured, validated JSON response
            ↓
        Rendered UI result
```

The AI is deliberately constrained: it is only ever allowed to explain, translate, or narrate results that come from a fixed knowledge base or a calculation engine. It cannot invent fault causes, troubleshooting steps, or system specs that aren't already present in the supplied data. If no knowledge-base entry matches closely enough, the system says so honestly instead of guessing.

## Tech stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js Server Actions
- **AI**: Gemini API (`@google/genai`) with structured JSON output via response schemas
- **Calculations**: Custom deterministic sizing and solar-orientation logic (`lib/solarMath.ts`)
- **Knowledge base**: Static, curated fault-matching data (`lib/knowledgeBase.ts`)

## Project structure

```
├── app/
│   ├── troubleshoot/
│   │   ├── page.tsx          # Troubleshoot UI
│   │   └── _components/
│   │       └── diagnosisPanel.tsx
│   ├── design/
│   │   └── page.tsx          # System design UI
│   └── _components/
│       └── headers.tsx       # Shared navigation header
├── lib/
│   ├── actions.ts            # Server actions: diagnoseIssue, designSystem
│   ├── knowledgeBase.ts       # Fault matching logic + data
│   ├── solarMath.ts          # Sizing + orientation calculations
│   └── types.ts              # Shared TypeScript types
```

## Getting started

### Prerequisites
- Node.js 18+
- A Gemini API key ([Google AI Studio](https://aistudio.google.com/))

### Setup

```bash
git clone <repo-url>
cd solarexpert
npm install
```

Create a `.env.local` file:

```
GEMINI_API_KEY=your_api_key_here
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000/troubleshoot](http://localhost:3000/troubleshoot) or `/design`.

## Design principles

- **Knowledge base first, AI second** — the AI explains and formats; it does not decide facts.
- **Fail honest, not confident** — when there's no good match or the AI response is malformed, the system falls back to a clear "no match" or raw knowledge-base result rather than showing a broken or fabricated answer.
- **Validated output** — every AI response is checked against an expected shape before it reaches the UI; malformed or truncated responses are caught and handled gracefully.
- **Deterministic math stays deterministic** — sizing and orientation calculations never pass through the AI; only their *explanation* does.

## Roadmap ideas

- [ ] Expand knowledge base coverage (more fault patterns, appliance types)
- [ ] Multi-domain expert system pattern (electrical, agriculture, etc.) reusing the same architecture
- [ ] Export system design as a shareable PDF spec sheet
- [ ] Offline-first fallback for troubleshooting using knowledge base alone

## License

_Add your license here._
