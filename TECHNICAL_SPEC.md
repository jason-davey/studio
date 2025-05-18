
# Technical Specification & Release Guide: SecureTomorrow Landing Page A/B Testing Platform

## 1. Introduction

### 1.1. Purpose of the Application
This Next.js application serves as a comprehensive platform for creating, configuring, and previewing content variations for the SecureTomorrow landing page. It follows a guided 5-step workflow: ingesting page recommendations, building/previewing the page, adjusting content, configuring A/B test variations (primarily for the Hero Section), and preparing for deployment via Firebase. It leverages AI for content suggestions (optionally guided by user-provided campaign themes/keywords) and includes a guided walkthrough for new users. It also integrates Datadog RUM for performance monitoring and includes a client-side feedback mechanism, both accessible via a fixed top navigation bar.

The application is designed with a UX-AI collaborative development approach, aiming for rapid prototyping and iterative feature enhancement to quickly deliver value.

### 1.2. High-Level Functionality
- **Fixed Top Bar:** Contains buttons for "Provide Feedback" and "Guided Walkthrough." Always visible.
- **Guided Workflow:** A 5-step accordion interface (Review, Build, Adjust, A/B Configure, Deploy) on the main page (`/`).
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
- **Forms:** React Hook Form with Zod for validation (in Quote Form).

### 1.4. Development Approach & Methodology
This application has been developed using a highly iterative and collaborative UX-AI model:
- **UX-Driven Requirements:** User experience (UX) defines the core needs, user flows, and desired outcomes.
- **AI-Assisted Implementation:** The AI partner (Firebase Studio App Prototyper) translates these requirements into functional code, including React components, Next.js pages, Genkit flows, and state management logic.
- **Rapid Prototyping & Iteration:** Features are built incrementally, allowing for quick feedback loops and adjustments. This contrasts with traditional waterfall models by delivering working software faster.
- **Conversational Development:** Changes and new features are discussed and refined through natural language interaction, with the AI generating code changes in a structured format (XML).
- **Focus on Value:** Prioritizes features that deliver direct value to the end-users (e.g., marketing team) and the business.

### 1.5. Development Chronology & Key Milestones (Conceptual)
This provides a high-level overview of the development journey:
- **Phase 0 (Foundation - Initial Setup):**
    - Basic Next.js project structure.
    - ShadCN UI and Tailwind CSS integration.
- **Phase 1 (Core A/B Content Preparation - Approx. Day 1):**
    - `/admin/ab-test-configurator` page for generating `heroConfig` JSON.
    - Client-side Hero section preview on `/landing-preview`.
    - `PLAYBOOK.md` drafted for Firebase A/B test setup.
    - *Value:* Empowered marketing to generate Firebase-compatible JSON.
- **Phase 2 (Integrated Workflow & Content Structure - Approx. Day 2-3):**
    - Refactored UI into a 5-Step Accordion Workflow on the main page (`/`).
    - Defined `PageBlueprint` type for ingesting external recommendations (Step 1).
    - Implemented multi-section preview (Hero, Benefits, Testimonials, Trust Signals, Form) in Step 2.
    - Created multi-section content adjustment UI in Step 3.
    - Migrated A/B Hero configurator to Step 4.
    - *Value:* Structured app around a clear user journey, enabling intake of external recommendations and holistic page content management.
- **Phase 3 (AI Integration & Usability Enhancements - Approx. Day 3-4):**
    - Genkit AI flow (`suggestHeroCopy`) for content suggestions (Headline, Sub-Headline, CTA) in Step 4.
    - Added "Campaign Focus" input to tailor AI suggestions.
    - Implemented Local Storage for saving/loading A/B Hero configurations (including campaign focus).
    - Guided Walkthrough feature (Top Bar button, Welcome Modal, `WalkthroughContext`, `HighlightCallout`).
    - User Feedback Modal (Top Bar button, `UIActionContext`, mailto link for submission).
    - Globally Fixed Top Bar for Walkthrough and Feedback.
    - Datadog RUM integration for performance monitoring.
    - *Value:* Boosted user productivity with AI; enhanced UX with onboarding and feedback; implemented observability.
- **Phase 4 (Authentication & Role Foundation - Paused):**
    - Initial implementation of Firebase Authentication (Login, Register pages, AuthContext) was started.
    - This feature is currently paused due to external dependencies for Firebase project admin access. Code related to direct auth functionality has been reverted to maintain app stability.
    - *Value (Future):* Foundation for multi-user application and role-based access.

## 2. Application Architecture

### 2.1. Frontend Structure
- **Next.js App Router:**
    - `/`: Main 5-step workflow application (`src/app/page.tsx`).
    - `/landing-preview`: Side-by-side A/B test preview page. Publicly accessible.
    - *(Future)* `/admin/tech-spec`: Page to render `TECHNICAL_SPEC.md` for admin users (pending roles).
    - *(Future)* `/login`, `/register`: User authentication pages (pending resumption of auth feature).
- **Key Directories:**
    - `src/app/`: Page components and layouts.
        - `layout.tsx`: Root layout, includes `UIActionProvider`, `TopBar`, `Toaster`, AB Tasty script placeholder, and Datadog RUM initialization.
        - `page.tsx`: Main 5-step workflow application with `WalkthroughProvider`.
    - `src/components/`:
        - `landing/`: Components specific to the landing page sections (Hero, Benefits, etc.).
        - `ui/`: ShadCN UI components.
        - `walkthrough/`: Components for the guided walkthrough (`WelcomeModal`, `HighlightCallout`).
        - `shared/`: Components like `FeedbackModal.tsx`.
        - `layout/`: Global layout components like `TopBar.tsx`.
    - `src/contexts/`:
        - `UIActionContext.tsx`: Manages global UI states like feedback/welcome modal visibility.
        - `WalkthroughContext.tsx`: Manages state and logic for the guided walkthrough.
        - *(Future)* `AuthContext.tsx`: (File exists but is unused) Will manage user authentication state.
    - `src/lib/`: Utilities and integrations (Firebase, Datadog).
    - `src/hooks/`: Custom React hooks (`useToast`, `useRemoteConfigValue`, `useMobile`).
    - `src/ai/`: Genkit related files (flows, base configuration).
    - `src/types/`: TypeScript type definitions (`recommendations.ts`).

### 2.2. Data Flow & State Management
- **`UIActionContext` (`src/contexts/UIActionContext.tsx`):** Globally manages visibility of `FeedbackModal` and `WelcomeModal` (for walkthrough), triggered by `TopBar`.
- **`WalkthroughContext` (`src/contexts/WalkthroughContext.tsx`):** Manages the state of the interactive guided tour, including current step and active status. Triggered by `WelcomeModal` via `UIActionContext`.
- **`activePageBlueprint` (State in `src/app/page.tsx`):** Holds `PageBlueprint` data, loaded in Step 1, previewed in Step 2, modified in Step 3.
- **A/B Test Configurations (Step 4 in `src/app/page.tsx`):** Local storage management for A/B Hero variants (headline, sub-headline, CTA, campaignFocus).
- **Firebase Integration:**
    - Prepares JSON for `heroConfig` (Remote Config). Actual A/B test setup in Firebase Console.
- **Genkit/AI:** `suggestHeroCopyFlow` called from client-side in Step 4.
- **Datadog RUM:** Initialized in `layout.tsx`.

### 2.3. Workflow Overview (5-Step Accordion on `/`)
1.  **Step 1: Review Recommendations:** Upload `PageBlueprint` JSON.
2.  **Step 2: Build & Preview Page:** Renders full landing page preview from `activePageBlueprint`.
3.  **Step 3: Adjust Content:** Edit content for all sections of `activePageBlueprint`.
4.  **Step 4: Configure A/B Test:** Configure Hero A/B variants, use AI, save/load local configs, preview on `/landing-preview`.
5.  **Step 5: Prepare for Deployment:** Guidance for Firebase.
- **Global Fixed Top Bar:** Provides access to Guided Walkthrough (via `WelcomeModal`), Feedback (via `FeedbackModal`).

### 2.4. System Architecture & Connections

```mermaid
graph TD
    subgraph UserBrowser [User's Browser - Next.js App]
        App[Landing Page Workflow App]
        App_PageTsx["src/app/page.tsx (Main Workflow)"]
        App_LayoutTsx["src/app/layout.tsx (Global Layout)"]
        App_UIActionContext["UIActionContext"]
        App_WalkthroughContext["WalkthroughContext"]
        App_TopBar["TopBar Component"]
        App_FeedbackModal["FeedbackModal Component"]
        App_WelcomeModal["WelcomeModal Component"]
        App_GenkitFlow["Genkit: suggestHeroCopyFlow (Client Call)"]
        App_LocalStorage["Browser Local Storage (A/B Hero Configs)"]
        App_DatadogLib["Datadog RUM SDK"]

        App_LayoutTsx --> App_UIActionContext
        App_LayoutTsx --> App_TopBar
        App_LayoutTsx --> App_DatadogLib

        App_PageTsx --> App_WalkthroughContext
        App_PageTsx --> App_FeedbackModal
        App_PageTsx --> App_WelcomeModal
        App_PageTsx <--> App_LocalStorage
        App_PageTsx --> App_GenkitFlow

        App_TopBar --> App_UIActionContext

        App_WelcomeModal --> App_UIActionContext
        App_WelcomeModal --> App_WalkthroughContext
        App_FeedbackModal --> App_UIActionContext
    end

    subgraph FirebaseServices [Firebase Project]
        FB_RemoteConfig[Firebase Remote Config (heroConfig)]
        FB_ABTesting[Firebase A/B Testing (via Console)]
        FB_Hosting[Firebase Hosting (Next.js App Deployed)]
        FB_AI_Models["Google AI Models (via GoogleAI Plugin for Genkit)"]
        %% FB_Auth[Firebase Authentication (Future)]
    end

    subgraph ExternalSystems [External Systems & Tools]
        RecommendationsEngine["External: Recommendations Engine (Generates PageBlueprint JSON)"]
        DatadogPlatform["Datadog Platform"]
        ServiceNow["ServiceNow (Conceptual - via Backend)"]
        UserEmailClient["User's Email Client"]
        %% GoogleKeywordPlatform["Google Keyword Platform (Future - via Backend)"]
    end

    UserBrowser -- Firebase SDK Calls --> FB_RemoteConfig
    App_GenkitFlow -- API Call via Genkit --> FB_AI_Models
    App_DatadogLib -- Sends RUM Data --> DatadogPlatform

    RecommendationsEngine -- "*.json File Upload" --> App_PageTsx

    App_FeedbackModal -- "mailto: (current)" --> UserEmailClient
    %% App_FeedbackModal -- "HTTPS to Backend (future)" --> ServiceNow_Backend[Backend API for ServiceNow]
    %% ServiceNow_Backend -- "ServiceNow API" --> ServiceNow
    
    style UserBrowser fill:#e6f7ff,stroke:#0052cc
    style FirebaseServices fill:#fff0e6,stroke:#ff6600
    style ExternalSystems fill:#e6ffe6,stroke:#006400
```

## 3. Core Features & Functionality

### 3.1. Global Fixed Top Bar (`src/components/layout/TopBar.tsx`)
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
    - On submission: logs to console, generates `mailto:` link, shows toast. (Future: Could send to backend for ServiceNow integration).

### 3.3. Guided Walkthrough (`src/contexts/WalkthroughContext.tsx`, `src/components/walkthrough/*`)
- **Purpose:** Interactive onboarding for new users.
- **Features:**
    - `WelcomeModal.tsx`: Initial introduction, triggered by `TopBar` via `UIActionContext`.
    - `HighlightCallout.tsx`: Step-by-step guidance with overlay and callouts.
    - `WalkthroughContext.tsx`: Manages tour state, step definitions, and progression.
    - Auto-loads sample `PageBlueprint` for demonstration.

### 3.4. 5-Step Accordion Workflow (`src/app/page.tsx`)
- **Purpose:** Guides the user through landing page creation and A/B test setup.
- **Step 1: Review Recommendations:**
    - File input for uploading `PageBlueprint` JSON.
    - Displays uploaded file name and a preview of the JSON content.
- **Step 2: Build & Preview Page:**
    - Renders a full preview of the landing page (Hero, Benefits, Testimonials, Trust Signals, Quote Form) based on `activePageBlueprint`.
- **Step 3: Adjust Content:**
    - Provides UI (forms with inputs/textareas) to edit content for each section of the `activePageBlueprint`.
    - Sections include: Page Info, Hero, Benefits (list), Testimonials (list), Trust Signals (list), Form Config.
- **Step 4: Configure A/B Test (Hero Section):**
    - Version A is pre-filled from `activePageBlueprint.heroConfig`.
    - UI to configure Version B content (headline, sub-headline, CTA).
    - "Campaign Focus / Keywords" textarea for both versions to guide AI.
    - AI content suggestions (✨) for headline, sub-headline, CTA.
    - Local storage management to save/load/delete named A/B Hero configurations (including campaign focus).
    - Generates JSON for Version A and B; allows copy/download.
    - "Render A/B Versions for Preview" button (links to `/landing-preview` with configs).
- **Step 5: Prepare for Deployment:**
    - Instructions for using generated JSON in Firebase.
    - Link to Firebase Console.
    - Reference to `PLAYBOOK.md`.

### 3.5. Landing Page Preview (`/landing-preview`)
- Displays two Hero sections side-by-side based on `configA` and `configB` JSON passed in URL query parameters.
- Shows other sections (Benefits, Testimonials etc.) with default or static content.

### 3.6. AI Content Suggestions (`src/ai/flows/suggest-hero-copy-flow.ts`)
- Genkit flow that suggests hero copy (headline, sub-headline, CTA).
- Input: copy type, current text, product info, count, and optional `campaignFocus`.
- Output: Array of string suggestions.
- Integrated into Step 4 of the main workflow.

### 3.7. Performance Monitoring (`src/lib/datadog.ts`, `src/app/layout.tsx`)
- Datadog RUM Browser SDK integrated.
- Initializes in `layout.tsx` using environment variables.
- Collects client-side performance metrics and errors.

## 4. Setup & Configuration

### 4.1. Environment Variables (`.env.local`)
- **Required for Firebase SDK (Remote Config etc.):**
    - `NEXT_PUBLIC_FIREBASE_API_KEY`
    - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    - `NEXT_PUBLIC_FIREBASE_APP_ID`
    - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- Genkit flows using Google AI require API key setup.
- **Datadog RUM Integration:**
    - `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN`
    - `NEXT_PUBLIC_DATADOG_APPLICATION_ID`
    - `NEXT_PUBLIC_DATADOG_SITE` (e.g., 'datadoghq.com')
    - `NEXT_PUBLIC_DATADOG_SERVICE_NAME` (e.g., 'securetomorrow-landing-builder')
    - `NEXT_PUBLIC_APP_ENV` (e.g., 'development', 'production')
    - `NEXT_PUBLIC_APP_VERSION` (e.g., '1.0.0')

### 4.2. Firebase Project Setup
- See `PLAYBOOK.md`.
- Remote Config for `heroConfig`.
- *(Future)* Firebase Authentication enablement.

### 4.3. AB Tasty Integration
- Placeholder in `src/app/layout.tsx`.

### 4.4. Datadog Setup
- Datadog account and RUM application setup required.

### 4.5. Considerations for Scalability, Risk, Compliance, & Data
- **Scalability:**
    - Client-side focus with reliance on scalable cloud services (Firebase, Datadog).
    - User-specific data (A/B Hero configs) stored in browser Local Storage. (Future: Migrating this to Firestore per user would enhance scalability).
    - Future token-based design system could aid multi-brand scalability.
- **Risk Mitigation:**
    - No direct client-side modification of Firebase A/B tests or sensitive Remote Config parameters. Users are guided to the secure Firebase Console.
    - Generated JSON is for content; platform management for Firebase is separate.
    - *(Future)* Firebase Auth will handle secure user authentication.
- **Compliance & Data Sovereignty:**
    - The app primarily handles content configuration.
    - Data entered by users for A/B Hero configs is stored in their browser's Local Storage.
    - Feedback data (if email provided) is currently handled via `mailto:` or console.
    - *(Future)* User authentication data will be managed by Firebase Authentication.
    - Firebase/Datadog data residency depends on their respective configurations.
    - Any production deployment must adhere to Greenstone's data governance policies.
- **Legal:** The "free legal will" mentioned in example content is illustrative; actual legal product details are external to this tool's function.
- **APIs:**
    - Internal: Genkit flow for AI suggestions.
    - External (Conceptual/Future): ServiceNow (via backend), Google Keyword platforms (via backend).
- **Tracking:** Datadog RUM for performance and errors.

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
- **`src/lib/firebase.ts`:** Firebase SDK initialization (App, Remote Config).
- **`src/lib/datadog.ts`:** Datadog RUM initialization.

## 7. Branding Guidelines Reference
- Defined in `PLAYBOOK.md`.

## 8. Future Considerations / Roadmap
- **User Authentication & Roles (Currently Paused):**
    - Firebase Authentication for login/registration.
    - Role-Based Access Control (RBAC):
        - **Admin Role:** Access to a rendered version of `TECHNICAL_SPEC.md` in-app.
        - **Creator Role:** Access to the main 5-step workflow.
    - Secure role management (potentially via Firebase Admin SDK on a backend or custom claims).
- **User-Specific Data Persistence (Firestore):**
    - Store "Managed A/B Hero Configurations" in Firestore, linked to user IDs, instead of Local Storage.
    - Store feedback submissions in Firestore, potentially linking to user IDs.
- **Backend for ServiceNow Integration:** Create a Firebase Cloud Function or other backend service to securely create ServiceNow tickets from feedback submissions.
- **Design System Tokens Integration:** Foundation laid by component structure. Future work could involve defining and consuming brand tokens for multi-brand theming.
- **Advanced AI - Gemini Chat for UI/Content (Step 3):** Consider more conversational AI interaction for content adjustments.
- **Full Blueprint Editing (Step 3):** Allow adding/deleting items in lists (Benefits, Testimonials, Trust Signals).
- **AI Theme Generation:** AI to suggest campaign themes.
- **Direct Integration with Keyword Platforms (Backend Task):** For fetching keywords.
- **Advanced UX Analysis AI (External Tool - Recommendations Engine):** The external "Recommendations Engine" (which produces the `PageBlueprint`) is responsible for incorporating analysis based on Usability Heuristics (Nielsen), Accessibility (WCAG), and behavioral models like COM-B, as detailed by UX. This application consumes the resulting content recommendations from the `PageBlueprint`.
- **Enhanced Reporting Tool Integration:** The external "Recommendations Engine" could be enhanced with AI-led UX evaluation using frameworks like Nielsen's Heuristics, WCAG, and COM-B to generate more refined `PageBlueprint` data for this application.

## 9. User Flow Diagram (Conceptual for 5-Step Workflow with Top Bar)
```mermaid
graph TD
    subgraph GlobalUI [Global UI]
        UserNav["User visits /"]
        UserNav --> AppLoad["Load Main App (/ page.tsx)"]
        TopBarComp["TopBar Component"]
        TopBarComp -- Click Guided Walkthrough --> UIAction_ShowWelcomeModal["UIAction: Show Welcome Modal"]
        TopBarComp -- Click Provide Feedback --> UIAction_ShowFeedbackModal["UIAction: Show Feedback Modal"]
    end

    subgraph MainApp [Main Application Flow]
        AppLoad --> AccordionInterface["5-Step Accordion UI (page.tsx)"]
        
        AccordionInterface -- Step 1 --> Step1Panel["Step 1: Review Recommendations Panel"]
        Step1Panel -- Upload JSON Blueprint / Walkthrough Loads Sample --> BlueprintState["State: activePageBlueprint Updated"]
        
        BlueprintState --> Step2Panel["Step 2: Build & Preview Panel"]
        Step2Panel -- Display Full Page Preview --> UserReviewsPreview{"User Reviews Preview"}
        
        UserReviewsPreview --> Step3Panel["Step 3: Adjust Content Panel"]
        Step3Panel -- User Edits Content Sections --> BlueprintState
        
        BlueprintState --> Step4Panel["Step 4: Configure A/B Test Panel"]
        Step4Panel -- Pre-fill Version A --> UserConfiguresAB{"User Configures Version B, Uses AI, Saves/Loads Local"}
        UserConfiguresAB -- Render A/B Preview --> PreviewPage["/landing-preview Page"]
        UserConfiguresAB -- Generate/Copy/Download JSON --> Step5Panel["Step 5: Prepare for Deployment Panel"]
        
        Step5Panel -- User Takes JSON to Firebase --> FirebaseConsoleSetup["External: Firebase A/B Test Setup"]
        FirebaseConsoleSetup -- Refer to PLAYBOOK.md --> FirebaseConsoleSetup
    end

    subgraph WalkthroughFlow [Walkthrough Sub-Flow]
        UIAction_ShowWelcomeModal --> WelcomeModalDisplay["UIActionContext -> WelcomeModal Displays"]
        WelcomeModalDisplay -- Start Tour --> WalkthroughStart["WalkthroughContext: actuallyStartWalkthrough"]
        WalkthroughStart --> WalkthroughActive["Walkthrough Active: HighlightCallout shows steps"]
        WalkthroughActive -- Next/Prev/End --> WalkthroughEnd["Walkthrough Ends / Modal Closes"]
        WelcomeModalDisplay -- Skip Tour --> WalkthroughEnd
    end

    subgraph FeedbackFlow [Feedback Sub-Flow]
        UIAction_ShowFeedbackModal --> FeedbackModalDisplay["UIActionContext -> FeedbackModal Displays"]
        FeedbackModalDisplay -- User Fills Form & Submits --> FeedbackAction{"Feedback Action: Log & Mailto"}
        FeedbackAction --> FeedbackToast["Toast with Mailto Link"]
        FeedbackToast -- User Clicks Link --> UserEmailClient_External["External: User's Email Client"]
        FeedbackModalDisplay -- User Cancels/Closes --> FeedbackModalDisplay
    end

    style GlobalUI fill:#f0f8ff,stroke:#4682b4
    style MainApp fill:#e6ffe6,stroke:#2e8b57
    style WalkthroughFlow fill:#fff0f5,stroke:#db7093
    style FeedbackFlow fill:#fffff0,stroke:#ffd700
```
