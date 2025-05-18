
# Technical Specification & Release Guide: SecureTomorrow Landing Page A/B Testing Platform

## 1. Introduction

### 1.1. Purpose of the Application
This Next.js application serves as a comprehensive platform for creating, configuring, and previewing content variations for the SecureTomorrow landing page. It follows a guided 5-step workflow: ingesting page recommendations, building/previewing the page, adjusting content, configuring A/B test variations (primarily for the Hero Section), and preparing for deployment via Firebase. It leverages AI for content suggestions (optionally guided by user-provided campaign themes/keywords) and includes a guided walkthrough for new users. It also integrates Datadog RUM for performance monitoring and includes a client-side feedback mechanism, both accessible via a fixed top navigation bar.

### 1.2. High-Level Functionality
- **Global Fixed Top Bar:** Contains buttons for "Provide Feedback" and "Guided Walkthrough," always visible.
- **Guided Workflow:** A 5-step accordion interface (Review, Build, Adjust, A/B Configure, Deploy) on the main page.
- **Recommendation Ingestion (Step 1):** Allows users to upload a JSON file (`PageBlueprint`) containing recommendations for landing page content.
- **Page Preview (Step 2):** Displays a preview of the landing page (Hero, Benefits, Testimonials, Trust Signals, Quote Form) based on the ingested or adjusted blueprint.
- **Content Adjustment (Step 3):** Enables users to fine-tune the content of the landing page blueprint for all major sections via input fields.
- **A/B Test Content Configuration (Step 4):** Allows users to define two text versions for A/B testing (e.g., Hero Section headline, sub-headline, CTA). Version A is pre-filled from Step 3.
- **AI-Assisted Content Generation (Step 4):** Provides AI-powered suggestions for A/B test copy using Genkit and Google's Gemini model. Users can provide an optional "Campaign Focus / Keywords" to further tailor these suggestions.
- **JSON Generation (Step 4):** Automatically generates JSON output compatible with Firebase Remote Config for each A/B test content variation. Allows copying or downloading of JSON.
- **Local Configuration Management (Step 4):** Enables users to save, load, and manage different A/B test content configurations (including campaign focus) directly in their browser's local storage.
- **Side-by-Side A/B Preview (Step 4):** Renders two selected A/B content variations on a dedicated preview page (`/landing-preview`) for visual comparison.
- **Deployment Guidance (Step 5):** Provides instructions for using the generated JSON in Firebase.
- **Guided Walkthrough:** An interactive, step-by-step tour of the application's features, highlighting key UI elements and explaining their purpose. Includes a welcome modal and can auto-load sample data. Triggered from the fixed top bar.
- **Firebase Integration (Indirect):** Prepares content for A/B tests run via Firebase Remote Config and Firebase A/B Testing.
- **AB Tasty Integration Point:** Placeholder for AB Tasty's JavaScript snippet.
- **Performance Monitoring:** Integrated with Datadog RUM for client-side performance and error tracking.
- **User Feedback Mechanism:** Provides a modal for users to submit feedback, which currently generates a `mailto:` link and logs to console. Triggered from the fixed top bar.

### 1.3. Key Technologies Used
- **Frontend Framework:** Next.js (with App Router)
- **UI Library:** React
- **UI Components:** ShadCN UI
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, useCallback), React Context (`UIActionContext` for global modal triggers, `WalkthroughContext` for tour logic).
- **A/B Test Content Delivery (Primary Method):** Firebase Remote Config
- **A/B Test Management (Primary Method):** Firebase A/B Testing
- **Client-Side A/B Testing (Alternative/External):** Placeholder for AB Tasty
- **Generative AI (Stack):** Genkit with Google AI (Gemini models)
- **Guided Walkthrough:** Custom implementation using React Context and DOM manipulation.
- **Performance Monitoring:** Datadog RUM Browser SDK.
- **Forms:** React Hook Form with Zod for validation.

## 2. Application Architecture

### 2.1. Frontend Structure
- **Next.js App Router:**
    - `/` (root): Main 5-step workflow application (`src/app/page.tsx`).
    - `/landing-preview`: Side-by-side A/B test preview page.
- **Key Directories:**
    - `src/app/`: Page components and layouts.
        - `layout.tsx`: Root layout, includes `UIActionProvider`, `TopBar`, `Toaster`, AB Tasty script placeholder, and Datadog RUM initialization.
        - `page.tsx`: Main 5-step workflow application with `WalkthroughProvider`.
    - `src/components/`:
        - `landing/`: Components specific to the landing page sections.
        - `ui/`: ShadCN UI components.
        - `walkthrough/`: Components for the guided walkthrough.
        - `shared/`: Components like `FeedbackModal.tsx`.
        - `layout/`: Global layout components like `TopBar.tsx`.
    - `src/contexts/`:
        - `UIActionContext.tsx`: Manages global UI states like feedback/welcome modal visibility.
        - `WalkthroughContext.tsx`: Manages state and logic for the guided walkthrough.
    - `src/lib/`: Utilities and integrations (Firebase, Datadog).
    - `src/hooks/`: Custom React hooks.
    - `src/ai/`: Genkit related files.
    - `src/types/`: TypeScript type definitions.

### 2.2. Data Flow & State Management
- **`UIActionContext` (`src/contexts/UIActionContext.tsx`):** Manages visibility of `FeedbackModal` and `WelcomeModal` (for walkthrough), triggered by `TopBar`.
- **`WalkthroughContext` (`src/contexts/WalkthroughContext.tsx`):** Manages the state of the interactive guided tour, including current step and active status. Triggered by `WelcomeModal` via `UIActionContext`.
- **`activePageBlueprint` (State in `src/app/page.tsx`):** Holds `PageBlueprint` data, loaded in Step 1, previewed in Step 2, modified in Step 3.
- **A/B Test Configurations (Step 4 in `src/app/page.tsx`):** Local storage management for A/B Hero variants.
- **Firebase Integration:** Prepares JSON for `heroConfig`. Actual A/B test setup in Firebase Console.
- **Genkit/AI:** `suggestHeroCopyFlow` called from client-side in Step 4.
- **Datadog RUM:** Initialized in `layout.tsx`.

### 2.3. Workflow Overview (5-Step Accordion on `/`)
1.  **Step 1: Review Recommendations:** Upload `PageBlueprint` JSON.
2.  **Step 2: Build & Preview Page:** Renders full landing page preview from `activePageBlueprint`.
3.  **Step 3: Adjust Content:** Edit content for all sections of `activePageBlueprint`.
4.  **Step 4: Configure A/B Test:** Configure Hero A/B variants, use AI, save/load local configs, preview on `/landing-preview`.
5.  **Step 5: Prepare for Deployment:** Guidance for Firebase.
- **Global Top Bar:** Provides access to Guided Walkthrough (via `WelcomeModal`) and Feedback (via `FeedbackModal`).

## 3. Core Features & Functionality

### 3.1. Global Top Bar (`src/components/layout/TopBar.tsx`)
- **Purpose:** Provides persistent access to global application utilities.
- **Features:**
    - Fixed position at the top of the viewport.
    - "Provide Feedback" button: Triggers `FeedbackModal` via `UIActionContext`.
    - "Guided Walkthrough" button: Triggers `WelcomeModal` via `UIActionContext`.
    - Styled with background and bottom border for visual separation.

### 3.2. User Feedback Mechanism (`src/components/shared/FeedbackModal.tsx`)
- **Purpose:** Allow users to report issues, suggest features, or provide general feedback.
- **Features:**
    - Triggered from the global `TopBar`.
    - Modal dialog managed by `UIActionContext`.
    - Form for feedback type, description, email (uses `react-hook-form`).
    - On submission: logs to console, generates `mailto:` link, shows toast.

### 3.3. Guided Walkthrough (`src/contexts/WalkthroughContext.tsx`, `src/components/walkthrough/*`)
- **Purpose:** Interactive onboarding for new users.
- **Features:**
    - `WelcomeModal.tsx`: Initial introduction, triggered by `TopBar` via `UIActionContext`.
    - `HighlightCallout.tsx`: Step-by-step guidance with overlay and callouts.
    - `WalkthroughContext.tsx`: Manages tour state, step definitions, and progression.
    - Auto-loads sample `PageBlueprint` for demonstration.

### 3.4. Step 1: Review Recommendations (in `src/app/page.tsx`)
- File input for JSON `PageBlueprint`. Parsing and storage in `activePageBlueprint`.

### 3.5. Step 2: Build & Preview Page (in `src/app/page.tsx`)
- Renders `HeroSection`, `BenefitsSection`, `TestimonialsSection`, `TrustSignalsSection`, `QuoteFormSection` from `activePageBlueprint`.

### 3.6. Step 3: Adjust Content (in `src/app/page.tsx`)
- Input fields for `activePageBlueprint` (Page Info, Hero, Benefits, Testimonials, Trust Signals, Form Config).

### 3.7. Step 4: Configure A/B Test (in `src/app/page.tsx`)
- Dual Version Input (A & B) for Hero content.
- Campaign Focus Input for AI tailoring.
- AI Content Suggestions (`suggestHeroCopyFlow`).
- JSON Generation, Copy & Download.
- Local Configuration Management (includes `campaignFocus`).
- "Render Pages for Preview" button to `/landing-preview`.

### 3.8. Step 5: Prepare for Deployment (in `src/app/page.tsx`)
- Instructional text, link to Firebase Console, reference to `PLAYBOOK.md`.

### 3.9. Landing Preview Page (`src/app/landing-preview/page.tsx`)
- Displays two Hero Section versions side-by-side from URL query parameters.

### 3.10. Performance Monitoring (`src/lib/datadog.ts`, `src/app/layout.tsx`)
- Datadog RUM Browser SDK integration.

## 4. Setup & Configuration

### 4.1. Environment Variables (`.env.local`)
- Required for Firebase SDK.
- Genkit flows using Google AI require API key setup.
- Datadog RUM Integration: `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN`, etc.

### 4.2. Firebase Project Setup
- See `PLAYBOOK.md`. Remote Config for `heroConfig`.

### 4.3. AB Tasty Integration
- Placeholder in `src/app/layout.tsx`.

### 4.4. Datadog Setup
- Datadog account and RUM application setup required.

## 5. Development & Build
- App: `npm run dev` (or `yarn dev`) - `http://localhost:9002`.
- Genkit: `npm run genkit:dev`.
- Build: `npm run build` (or `yarn build`).

## 6. Key Files & Directories
- **`PLAYBOOK.md`:** User-focused guide for A/B testing and app features.
- **`TECHNICAL_SPEC.md`:** (This document).
- **`src/app/layout.tsx`:** Root layout, global providers (`UIActionProvider`), `TopBar`.
- **`src/app/page.tsx`:** Main 5-step workflow application, `WalkthroughProvider`.
- **`src/contexts/UIActionContext.tsx`:** Manages global modal states.
- **`src/contexts/WalkthroughContext.tsx`:** Manages guided tour state.
- **`src/components/layout/TopBar.tsx`:** Fixed top navigation bar.
- **`src/components/shared/FeedbackModal.tsx`:** Feedback collection UI.
- **`src/components/walkthrough/`:** Walkthrough UI components.
- **`src/ai/flows/suggest-hero-copy-flow.ts`:** Genkit AI flow.
- **`src/types/recommendations.ts`:** Defines `PageBlueprint`.
- **`src/lib/datadog.ts`:** Datadog RUM initialization.

## 7. Branding Guidelines Reference
- Defined in `PLAYBOOK.md`.

## 8. Future Considerations / Roadmap
- **Design System Tokens Integration:** Foundation laid by component structure. Future work could involve defining and consuming brand tokens for multi-brand theming.
- **Advanced AI - Gemini Chat for UI/Content (Step 3):** Consider more conversational AI interaction for content adjustments.
- **Full Blueprint Editing (Step 3):** Allow adding/deleting items in lists (Benefits, Testimonials, Trust Signals).
- **Backend for Firebase Management & ServiceNow Integration:** For direct Remote Config updates and ServiceNow ticket creation.
- **Error Handling & Validation:** Enhance for JSON parsing, AI flows, localStorage.
- **AI Theme Generation:** AI to suggest campaign themes.
- **Direct Integration with Keyword Platforms (Backend Task):** For fetching keywords.
- **Advanced UX Analysis AI (External Tool):** The "Recommendations Engine" (external to this app) is envisioned to perform advanced UX evaluations.
- **Walkthrough Enhancements:** More sophisticated highlighting, dynamic steps.
- **UX Rubrics for Recommendations Engine:** The external "Recommendations Engine" (which produces the `PageBlueprint`) is responsible for incorporating analysis based on Usability Heuristics (Nielsen), Accessibility (WCAG), and behavioral models like COM-B. This application consumes the resulting content recommendations from the `PageBlueprint`. Future enhancements to the *engine* could feed even more refined blueprints into this application.

## 9. User Flow Diagram (Conceptual for 5-Step Workflow with Top Bar)
```mermaid
graph TD
    subgraph Global UI
        TopBar[Fixed Top Bar]
        TopBar -- Click Guided Walkthrough --> WT_Trigger(UIAction: Show Welcome Modal)
        TopBar -- Click Provide Feedback --> FB_Trigger(UIAction: Show Feedback Modal)
    end

    subgraph Main Application Flow
        Start(User Navigates to App /) --> PageLoad(Page Loads with Accordion)
        PageLoad --> AccordionInterface(5-Step Accordion UI)
        
        AccordionInterface -- Step 1 --> R_Panel(Step 1: Review Recommendations Panel)
        R_Panel -- Upload JSON Blueprint / Walkthrough Loads Sample --> R_Loaded{Blueprint Loaded?}
        R_Loaded -- Yes --> ABP_State(State: activePageBlueprint Updated)
        
        ABP_State --> P_Panel(Step 2: Build & Preview Panel)
        P_Panel -- Display Full Page Preview from activePageBlueprint --> P_Reviewed{User Reviews Preview}
        
        P_Reviewed --> A_Panel(Step 3: Adjust Content Panel)
        A_Panel -- User Edits Content Sections --> ABP_State
        
        ABP_State --> AB_Panel(Step 4: Configure A/B Test Panel)
        AB_Panel -- Pre-fill Version A --> AB_Config{User Configures Version B, Uses AI, Saves/Loads Local}
        AB_Config -- Render A/B Preview --> PreviewPage[/landing-preview Page]
        AB_Config -- Generate/Copy/Download JSON --> D_Panel(Step 5: Prepare for Deployment Panel)
        
        D_Panel -- User Takes JSON to Firebase --> FirebaseSetup[Firebase A/B Test Setup]
        FirebaseSetup -- Refer to PLAYBOOK.md --> FirebaseSetup
        R_Loaded -- No / Error --> R_Panel
    end

    subgraph Walkthrough Sub-Flow
        WT_Trigger --> WC_Modal_Display(UIActionContext -> WelcomeModal Displays)
        WC_Modal_Display -- Start Tour --> WC_StartTour(WalkthroughContext: actuallyStartWalkthrough)
        WC_StartTour --> WT_Active(Walkthrough Active: HighlightCallout shows step 1)
        WT_Active -- Next/Prev --> WT_Active
        WT_Active -- End Tour --> WT_End(Walkthrough Ends)
        WC_Modal_Display -- Skip Tour --> WT_End
    end

    subgraph Feedback Sub-Flow
        FB_Trigger --> FB_Modal_Display(UIActionContext -> FeedbackModal Displays)
        FB_Modal_Display -- User Fills Form & Submits --> FB_Action{Feedback Action}
        FB_Action -- Log to Console & Generate Mailto --> FB_Toast(Toast with Mailto Link)
        FB_Toast -- User Clicks Link --> FB_EmailClient(Opens User's Email Client)
        FB_Modal_Display -- User Cancels/Closes --> PageLoad
    end
```
