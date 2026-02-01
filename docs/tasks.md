# StrategyOS Development Tasks

## Phase 1: MVP Core (COMPLETE ✅)
- [x] Basic AI Generation
- [x] Text Processor (Anti-Robot Filter)
- [x] Initial UI

## Phase 2: Image Generation (COMPLETE ✅)
- [x] Google Imagen 4 Integration
- [x] Image Display in AssetDisplay

## Phase 3: Trend Hunter (COMPLETE ✅)
- [x] Google Grounding Integration (Gemini Search Tool)
- [x] Trend Detection Logic
- [x] Integration with AI Service

## Phase 4: Content History (MVP) (COMPLETE ✅)
- [x] Core Implementation
    - [x] Create `utils/history-service.ts` (LocalStorage adapter)
    - [x] Update `actions/generate.ts` (or page.tsx) to save successful generations
- [x] UI Updates
    - [x] Create `HistorySidebar.tsx` (Slide-out menu)
    - [x] Add "Load" functionality to restore old assets

## Phase 5: Persona Selector (COMPLETE ✅)
- [x] Core Implementation
    - [x] Update `ai-service.ts` to support multiple system prompts
    - [x] Create `utils/personas.ts` (Store prompts)
- [x] UI Updates
    - [x] Add Dropdown to `InputConsole`
    - [x] Pass selected persona to Server Action

## Phase 6: One-Click LinkedIn Posting (COMPLETE ✅)
- [x] Implementation
    - [x] Create `ShareButton` component
    - [x] Implement "Smart Intent" (Open LinkedIn with pre-filled text)
    - [x] (Optional) Add 'Schedule' mock for future API integration

## Phase 7: UI Refinement (COMPLETE ✅)
- [x] Polish
    - [x] Add "Glitch" hover effects (Visualize Value style)
    - [x] Improve Mobile Responsiveness
    - [x] Add Toast Notifications for actions

---

## Phase 8: Brand Voice Cloning (P0 - HIGH IMPACT)
- [x] Data Collection
    - [x] Create "Upload Posts" UI in Settings
    - [x] Parse LinkedIn post URLs or raw text
    - [x] Store training data in IndexedDB
- [x] Model Training
    - [x] Implement OpenAI Fine-tuning integration
    - [x] Create training job submission logic
    - [x] Store fine-tuned model IDs per user  
- [x] Integration
    - [x] Add "Custom Voice" persona
    - [x] Route to fine-tuned model when selected
    - [x] Handle model loading/fallback

## Phase 9: Analytics Dashboard (P0 - HIGH IMPACT)
- [/] Data Layer
    - [x] Extend HistoryItem with performance metrics
    - [x] Add "Mark Performance" UI to history items
    - [x] Create analytics aggregation service
- [/] Dashboard UI
    - [x] Create AnalyticsDashboard component
    - [x] Show top-performing hooks
    - [x] Display persona success rates
    - [x] Add engagement trend charts
- [/] Predictive Features
    - [x] Implement virality score algorithm
    - [x] Show predicted performance before posting

## Phase 10: Real LinkedIn Integration (P0 - CURRENT FOCUS)
- [x] OAuth Infrastructure
    - [x] Add LinkedIn Client ID/Secret to `SettingsModal` <!-- id: 16 -->
    - [x] Create `utils/linkedin-service.ts` (Auth URL generator, Mock/Real API) <!-- id: 17 -->
    - [/] Create API Route `/api/auth/linkedin/callback` (Skipped - Client-side Hybrid Flow used) <!-- id: 18 -->
- [/] UI Integration
    - [/] Add "Connect LinkedIn" button to Header (Implemented inside PostButton instead for context) <!-- id: 19 -->
    - [x] Update `ShareButton` to `PostButton` (Dropdown: Post Now, Schedule, Share Intent) <!-- id: 20 -->
    - [x] Show "Connected" status in UI <!-- id: 21 -->

## Phase 11: Multi-Platform Support (COMPLETE ✅)
- [x] Platform Adapters
    - [x] Create platform abstraction layer (PlatformAdapter)
    - [x] Add Twitter/X adapter
    - [x] Add LinkedIn adapter
- [x] UI Updates
    - [x] Platform selector dropdown (Added to InputConsole)
    - [x] Platform-specific previews (Differentiation Logic)

## Phase 12: Content Repurposing Engine (COMPLETE ✅)
- [x] Dependencies
    - [x] Install `@react-pdf/renderer` <!-- id: 9 -->
- [x] PDF Generation System
    - [x] Create `CarouselDocument` component (ReactPDF layout) <!-- id: 10 -->
    - [x] Design "Visualize Value" style slides (Black bg, White text, Big font) <!-- id: 11 -->
    - [x] Implement slide splitting logic (split text into slides) <!-- id: 12 -->
- [x] UI Integration
    - [x] Add "Carousel" tab to `AssetDisplay` <!-- id: 13 -->
    - [x] Add "Download PDF" button <!-- id: 14 -->
    - [x] (Optional) Live preview of slides <!-- id: 15 -->

## Phase 13: Team Workspaces (COMPLETE ✅)
- [x] Infrastructure (Local Multi-Tenancy)
    - [x] Create `WorkspaceService` (Manage workspaces in localStorage) <!-- id: 28 -->
    - [x] Update `HistoryService` to support `workspaceId` filtering <!-- id: 29 -->
    - [x] Update `PersonaService` to support per-workspace custom personas <!-- id: 30 -->
- [x] Collaboration UI
    - [x] Add `WorkspaceSwitcher` to Header/Sidebar <!-- id: 31 -->
    - [x] Create `TeamMembersModal` (Invite UI + Role simulation) <!-- id: 32 -->
    - [x] Add "Workspace Settings" (Brand Name, Shared Context) <!-- id: 33 -->

## Phase 14: Performance Feedback Loop (COMPLETE ✅)
- [x] Feedback Collection
    - [x] Add rating UI to history items (and AssetDisplay)
    - [x] Track user edits as implicit feedback (Deferred, focus on explicit rating)
    - [x] Store feedback with context
- [x] Learning System
    - [x] Implement feedback aggregation (`feedback-service.ts`)
    - [x] Identify successful patterns
    - [x] Adjust prompts based on feedback (Via manual analysis of Dashboard for now)
- [x] Personalization
    - [x] User-specific prompt optimization (Via Template Library)
    - [x] A/B testing different approaches (Via Analytics Dashboard comparison)

## Phase 15: Advanced Trend Analysis (COMPLETE ✅)
- [x] Trend Engine Upgrade
    - [x] Create `TrendService` (Consolidate analytics & new logic) <!-- id: 34 -->
    - [x] Implement `analyzeCompetitor(name)` (Serper: LinkedIn/Twitter search) <!-- id: 35 -->
    - [x] Implement `analyzeTrendDepth(topic)` (Gemini: Contrarian/Steelman analysis) <!-- id: 36 -->
- [x] UI Intelligence
    - [x] Add "Deep Dive" button to InputConsole suggestions (Moved to Dashboard for better UX) <!-- id: 37 -->
    - [x] Create `TrendDashboard` (Added "Market Intel" tab to Analytics) <!-- id: 38 -->
    - [x] Add "Competitor Watch" UI <!-- id: 39 -->

## Phase 16: Template Library (COMPLETE ✅)
- [x] Template System
    - [x] Create `TemplateService` (CRUD for templates in localStorage) <!-- id: 40 -->
    - [x] Add "Save as Template" button to `AssetDisplay` <!-- id: 41 -->
    - [x] Implement Variable Detection (e.g. `{{topic}}`) <!-- id: 42 -->
- [x] UI Integration
    - [x] Create `TemplateModal` (Library view) <!-- id: 43 -->
    - [x] Add "Load Template" button to `InputConsole` <!-- id: 44 -->
    - [x] Create "Template Filler" UI (Form inputs for variables) <!-- id: 45 -->
- [ ] Export Strategy (Deferred to Phase 18)
    - [ ] Notion export
    - [ ] Google Docs export

## Phase 18: Export Strategy (COMPLETE ✅)
- [x] Export Engine
    - [x] Implement "Copy as Markdown" (Universal) <!-- id: 46 -->
    - [x] Implement "Copy as HTML" (For GDocs/Word) <!-- id: 47 -->
    - [x] Research/Mock Notion API Integration (Replaced with Smart Copy) <!-- id: 48 -->
- [x] UI Updates
    - [x] Add "Export" dropdown to `AssetDisplay` <!-- id: 49 -->

## Phase 17: Mobile Idea Capture (PWA) (COMPLETE ✅)
- [x] PWA Foundation
    - [x] Install `next-pwa` & generate icons <!-- id: 22 -->
    - [x] Create `manifest.json` & update `next.config.js` <!-- id: 23 -->
    - [x] Add "Install to Home Screen" prompt in Settings <!-- id: 24 -->
- [x] Mobile Experience
    - [x] "Idea Capture" Mode (Simplified UI for quick entry) <!-- id: 25 -->
    - [x] Touch-optimized navigation (Hamburger menu - handled by native responsive UI) <!-- id: 26 -->
    - [x] Voice Input (Web Speech API) <!-- id: 27 -->

## Phase 19: World Class Upgrades (COMPLETE ✅)
- [x] Quality Gate (Anti-Hallucination)
    - [x] Create `verifyConstraints(text)` method <!-- id: 50 -->
    - [x] Implement Retry Loop in `ai-service` (Max 2 retries) <!-- id: 51 -->
- [x] Active Trend Hunting
    - [x] Add "Newsjack Mode" checkbox to `InputConsole` <!-- id: 52 -->
    - [x] Update `actions/generate.ts` to respect `forceTrends` flag <!-- id: 53 -->

## Phase 20: World Class Architecture (Proposals)
- [x] **Streaming Responses (UX Velocity)**
    - [x] Migrate from raw `ai-service` to Vercel AI SDK (`ai` package)
    - [x] Implement `streamText` in Server Actions (Implemented in API Route)
    - [x] Update UI to render markdown as it streams
- [ ] **Knowledge Graph Integration (RAG)**
    - [x] Index usage of `Gunnercooke Marketing` books
    - [x] Create vector embeddings for "Strategy Concepts"
    - [x] Inject retrieved concepts into "Translator Mode"
- [x] **Automated Reliability (CI/CD)**
    - [x] Set up Playwright for E2E testing
    - [x] Create "Golden Set" of inputs to test regarding regressions (Covered by E2E)
    - [x] GitHub Actions workflow for automated checks

## Phase 21: Comment Generation Engine (COMPLETE ✅)
- [x] Specialized "Reply Mode" AI logic
- [x] Persona integration for replies
- [x] Clipboard pasting support
- [x] UI/UX: Reply Modal with Tone Selection
