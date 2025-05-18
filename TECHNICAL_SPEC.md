

# Technical Specification & Release Guide: SecureTomorrow Landing Page A/B Testing Platform

## 1. Introduction

### 1.1. Purpose of the Application
This Next.js application serves as a comprehensive platform for creating, configuring, and previewing content variations for the SecureTomorrow landing page. It follows a guided 5-step workflow: ingesting page recommendations, building/previewing the page, adjusting content, configuring A/B test variations (primarily for the Hero Section), and preparing for deployment via Firebase. It leverages AI for content suggestions (optionally guided by user-provided campaign themes/keywords) and includes a guided walkthrough for new users.

### 1.2. High-Level Functionality
- **Guided Workflow:** A 5-step accordion interface (Review, Build, Adjust, A/B Configure, Deploy).
- **Recommendation Ingestion (Step 1):** Allows users to upload a JSON file (`PageBlueprint`) containing recommendations for landing page content (e.g., hero headlines, benefits, testimonials, trust signals).
- **Page Preview (Step 2):** Displays a preview of the landing page (Hero Section, Benefits, Testimonials, Trust Signals, Quote Form) based on the ingested or adjusted blueprint.
- **Content Adjustment (Step 3):** Enables users to fine-tune the content of the landing page blueprint (Hero, Benefits, Testimonials, Trust Signals, Form Config) via input fields.
- **A/B Test Content Configuration (Step 4):** Allows users (e.g., marketing team) to define two text versions for A/B testing (e.g., Hero Section headline, sub-headline, CTA). Version A is pre-filled from Step 3.
- **AI-Assisted Content Generation (Step 4):** Provides AI-powered suggestions for A/B test copy using Genkit and Google's Gemini model. Users can provide an optional "Campaign Focus / Keywords" to further tailor these suggestions.
- **JSON Generation (Step 4):** Automatically generates JSON output compatible with Firebase Remote Config for each A/B test content variation.
- **Local Configuration Management (Step 4):** Enables users to save, load, and manage different A/B test content configurations (including campaign focus) directly in their browser's local storage.
- **Side-by-Side A/B Preview (Step 4):** Renders two selected A/B content variations on a dedicated preview page (`/landing-preview`) for visual comparison.
- **Deployment Guidance (Step 5):** Provides instructions for using the generated JSON in Firebase.
- **Guided Walkthrough:** An interactive, step-by-step tour of the application's features, highlighting key UI elements and explaining their purpose. Includes a welcome modal and can auto-load sample data.
- **Firebase Integration (Indirect):** Prepares content for A/B tests run via Firebase Remote Config and Firebase A/B Testing. Actual test setup and management occur in the Firebase console.
- **AB Tasty Integration Point:** Includes a placeholder for integrating AB Tasty's JavaScript snippet for client-side A/B testing.

### 1.3. Key Technologies Used
- **Frontend Framework:** Next.js (with App Router)
- **UI Library:** React
- **UI Components:** ShadCN UI (Accordion, Button, Card, Input, Label, Textarea, Popover, Toast, Dialog, etc.)
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, useCallback, useContext for Toast and Walkthrough)
- **A/B Test Content Delivery (Primary Method):** Firebase Remote Config
- **A/B Test Management (Primary Method):** Firebase A/B Testing (via Firebase Console)
- **Client-Side A/B Testing (Alternative/External):** Placeholder for AB Tasty
- **Generative AI (Stack):** Genkit with Google AI (Gemini models) for content suggestions.
  - Flow: `src/ai/flows/suggest-hero-copy-flow.ts` (accepts optional `campaignFocus`)
- **Guided Walkthrough:** Custom implementation using React Context and DOM manipulation for highlights.

## 2. Application Architecture

### 2.1. Frontend Structure
- **Next.js App Router:** Used for routing and page structure.
    - `/` (root): Main 5-step workflow application (`src/app/page.tsx`) with the accordion interface and guided walkthrough.
    - `/landing-preview`: Side-by-side A/B test preview page.
- **Key Directories:**
    - `src/app/`: Contains page components and layouts.
        - `page.tsx`: Main 5-step workflow application.
        - `landing-preview/page.tsx`: Side-by-side A/B test preview page.
        - `layout.tsx`: Root layout, includes Toaster and AB Tasty script placeholder.
        - `globals.css`: Global styles, Tailwind directives, and ShadCN CSS theme variables (HSL).
    - `src/components/`: Reusable UI components.
        - `landing/`: Components specific to the landing page (Header, HeroSection, BenefitsSection, TestimonialsSection, TrustSignalsSection, AwardsSection, QuoteFormSection, Footer).
        - `ui/`: ShadCN UI components.
        - `walkthrough/`: Components for the guided walkthrough (WelcomeModal, HighlightCallout).
    - `src/contexts/`: Global React Context providers.
        - `WalkthroughContext.tsx`: Manages state and logic for the guided walkthrough.
    - `src/lib/`: Utility functions and Firebase initialization.
        - `firebase.ts`: Firebase SDK initialization and Remote Config setup.
        - `utils.ts`: General utility functions (e.g., `cn` for classnames).
    - `src/hooks/`: Custom React hooks.
        - `useRemoteConfigValue.ts`: Hook to fetch values from Firebase Remote Config.
        - `useToast.ts`: Hook for displaying toast notifications.
    - `src/ai/`: Genkit related files.
        - `genkit.ts`: Genkit global instance initialization.
        - `dev.ts`: Entry point for Genkit development server, imports flows.
        - `flows/suggest-hero-copy-flow.ts`: Genkit flow for generating hero section copy suggestions.
    - `src/types/`: TypeScript type definitions.
        - `recommendations.ts`: Defines the `PageBlueprint` interface for the JSON recommendations.
- **Styling:**
    - Tailwind CSS is the primary styling utility.
    - `src/app/globals.css` defines base styles, Tailwind layers, and CSS variables for the ShadCN theme.
    - Font: URW DIN (defined via `@font-face` in `globals.css` and applied via `tailwind.config.ts`).

### 2.2. Data Flow & State Management
- **`activePageBlueprint` (State in `src/app/page.tsx`):** Holds the `PageBlueprint` data loaded from the JSON in Step 1. This data is used in Step 2 (Build/Preview) and can be modified in Step 3 (Adjust). Can also be pre-filled by the guided walkthrough.
- **A/B Test Configurations (Step 4):**
    - Hero content from `activePageBlueprint.heroConfig` (after Step 3 adjustments) pre-fills "Version A".
    - "Version B" (Hero content) is configured by the user.
    - AI suggestions, campaign focus, and local storage management (`heroConfigManager`) are handled within this step for A/B test Hero variations.
- **Walkthrough State (`WalkthroughContext.tsx`):**
    - Manages `isWalkthroughActive`, `currentStepIndex`, `showWelcomeModal`.
    - Controls the display and progression of the guided tour via `HighlightCallout.tsx`.
- **Firebase Integration:**
    - Initialization: `src/lib/firebase.ts`.
    - Remote Config: The application prepares JSON for `heroConfig` parameter (from Step 4). Actual A/B test setup occurs in Firebase Console.
- **Genkit/AI:**
    - Uses `ai.defineFlow` and `ai.definePrompt` for the `suggestHeroCopyFlow`.
    - The flow is called from the client-side component in Step 4.

### 2.3. Workflow Overview (5-Step Accordion)
1.  **Step 1: Review Recommendations:**
    - User uploads a `PageBlueprint` JSON file or walkthrough auto-loads a sample.
    - Application parses and stores this blueprint in `activePageBlueprint`.
2.  **Step 2: Build & Preview Page:**
    - Application renders a preview of the landing page (Hero, Benefits, Testimonials, Trust Signals, Quote Form) based on `activePageBlueprint`.
3.  **Step 3: Adjust Content:**
    - User edits the content of `activePageBlueprint` (Hero, Benefits, Testimonials, Trust Signals, Form Config) via input fields.
4.  **Step 4: Configure A/B Test:**
    - "Version A" (Hero) is pre-filled using the (adjusted) Hero content from `activePageBlueprint.heroConfig`.
    *   User configures "Version B" (Hero), uses AI suggestions (with optional campaign focus).
    *   User can save/load/manage A/B Hero variations locally.
    *   User can preview "Version A" vs "Version B" (Hero sections) on `/landing-preview`.
    *   User copies/downloads JSON for Firebase.
5.  **Step 5: Prepare for Deployment:**
    - User is guided to take the generated JSON to the Firebase Console.
    - `PLAYBOOK.md` provides detailed Firebase setup instructions.
- **Guided Walkthrough:** Can be initiated from the main page header, guiding users through each step and key features using `HighlightCallout.tsx`.
- **AB Tasty:** If used, its script (added to `layout.tsx`) would override content for tests managed by that platform.

## 3. Core Features & Functionality (by Step)

### 3.1. Step 1: Review Recommendations
- **Purpose:** To ingest initial landing page content and structure from an external tool via a JSON `PageBlueprint`.
- **Features:**
    - File input for JSON (`PageBlueprint` format as defined in `src/types/recommendations.ts`).
    - JSON parsing and basic validation.
    - Display of loaded blueprint name and raw JSON.
    - Stores data in `activePageBlueprint` state.
    - Can be pre-filled by the guided walkthrough.

### 3.2. Step 2: Build & Preview Page
- **Purpose:** To visualize the landing page based on the current blueprint.
- **Features:**
    - Renders `HeroSection`, `BenefitsSection`, `TestimonialsSection`, `TrustSignalsSection`, and `QuoteFormSection` components using data from `activePageBlueprint`.

### 3.3. Step 3: Adjust Content
- **Purpose:** To allow fine-tuning of the landing page content derived from the blueprint.
- **Features:**
    - Input fields for `activePageBlueprint.heroConfig` (headline, subHeadline, ctaText, uniqueValueProposition, heroImageUrl, heroImageAltText).
    - Input fields for `activePageBlueprint.benefits` (title, description, icon for each benefit).
    - Input fields for `activePageBlueprint.testimonials` (name, location, quote, avatarImageUrl, avatarInitial, since for each testimonial).
    - Input fields for `activePageBlueprint.trustSignals` (text, details, source, imageUrl, type for each signal).
    - Input fields for `activePageBlueprint.formConfig` (headline, ctaText).
    - Changes update the `activePageBlueprint` state in real-time.

### 3.4. Step 4: Configure A/B Test
- **Purpose:** To create, manage (locally), get AI suggestions for, and prepare Hero Section content variations for A/B testing.
- **Features:**
    - Dual Version Input (A & B) for Hero content using `ABTestConfigForm`. Version A pre-filled from `activePageBlueprint.heroConfig`.
    - Campaign Focus Input for AI tailoring.
    - AI Content Suggestions (calling `suggestHeroCopy` Genkit flow).
    - Real-time JSON Generation for A/B Hero variants.
    - Copy & Download JSON for A/B Hero variants.
    - Local Configuration Management for A/B Hero variants (`localStorage` key: `heroConfigManager`), includes saving/loading `campaignFocus`.
    - "Render Pages for Preview" Button: Opens `/landing-preview` with current A/B Hero configurations.
- **Key Components Used:** `ABTestConfigForm`, `Card`, `Input`, `Label`, `Button`, `Textarea`, `Separator`, `Popover`, `useToast`, `Sparkles` icon.
- **Data Structures:**
    - `ABTestHeroConfig`: For JSON output for Firebase (Hero only).
    - `ManagedABTestHeroConfig`: For local storage of A/B Hero variants (includes `campaignFocus`).

### 3.5. Step 5: Prepare for Deployment
- **Purpose:** To guide the user on using the generated A/B test JSON with Firebase.
- **Features:**
    - Instructional text.
    - Link to Firebase Console.
    - Prominent reference to `PLAYBOOK.md`.

### 3.6. Landing Preview Page (`src/app/landing-preview/page.tsx`)
- **Purpose:** To display two versions of the Hero Section side-by-side for A/B test comparison.
- **Functionality:** Reads `configA` and `configB` JSON strings (Hero content) from URL query parameters.

### 3.7. Landing Page Components (`src/components/landing/`)
- Standard landing page components (Header, HeroSection, BenefitsSection, TestimonialsSection, TrustSignalsSection, AwardsSection, QuoteFormSection, Footer). Dynamically populated from `activePageBlueprint` in Step 2 & 3, or specific Hero configs in `/landing-preview`.

### 3.8. AI Flow (`src/ai/flows/suggest-hero-copy-flow.ts`)
- **Purpose:** To generate hero section copy suggestions for A/B testing.
- **Input:** `SuggestHeroCopyInput` (copyType, currentText, productName, productDescription, count, campaignFocus).
- **Output:** `SuggestHeroCopyOutput` (array of suggestions).

### 3.9. Guided Walkthrough (`src/contexts/WalkthroughContext.tsx`, `src/components/walkthrough/*`)
- **Purpose:** To provide an interactive onboarding experience for new users.
- **Features:**
    - Welcome modal (`WelcomeModal.tsx`).
    - Step-by-step guidance through the 5-step workflow.
    - Highlighting of key UI elements using `HighlightCallout.tsx`.
    - Text callouts explaining features.
    - Ability to start/end the tour.
    - Auto-loading of sample data for a hands-on experience.
    - Managed via React Context (`WalkthroughContext.tsx`) for global state.

## 4. Setup & Configuration

### 4.1. Environment Variables (`.env.local`)
- Required for Firebase SDK. See `PLAYBOOK.md`.
- Genkit flows using Google AI require API key setup.

### 4.2. Firebase Project Setup
- See `PLAYBOOK.md`. Remote Config for `heroConfig` is key for A/B tests.

### 4.3. AB Tasty Integration
- Placeholder in `src/app/layout.tsx`.

## 5. Development & Build

### 5.1. Running the Development Server
- App: `npm run dev` (or `yarn dev`) - `http://localhost:9002`.
- Genkit: `npm run genkit:dev`.

### 5.2. Building for Production
- `npm run build` (or `yarn build`).

## 6. Key Files & Directories
- **`PLAYBOOK.md`:** User-focused guide for A/B testing workflow with Firebase, including use of the guided walkthrough.
- **`TECHNICAL_SPEC.md`:** (This document).
- **`src/app/page.tsx`:** Main 5-step workflow application.
- **`src/ai/flows/suggest-hero-copy-flow.ts`:** Genkit flow for AI suggestions.
- **`src/types/recommendations.ts`:** Defines `PageBlueprint`.
- **`src/contexts/WalkthroughContext.tsx`:** Manages state for the guided walkthrough.
- **`src/components/walkthrough/`:** Contains UI components for the walkthrough (WelcomeModal, HighlightCallout).
- Other files as previously listed.

## 7. Branding Guidelines Reference
- Defined in `PLAYBOOK.md`.

## 8. Future Considerations / Roadmap
- **Design System Tokens Integration:** The current component-based structure (e.g., in `src/components/landing/`) is a good foundation. Future work could involve defining brand tokens (colors, fonts, spacing) that these components consume, allowing for easier multi-brand theming if the "Recommendations Engine" provides brand-specific tokens as part of the `PageBlueprint`.
- **Advanced AI - Gemini Chat for UI/Content (Step 3):** Consider integrating a more conversational AI interaction in "Step 3: Adjust Content." Users could describe desired changes (e.g., "Make this headline more urgent," "Shorten this benefit description") and the AI (via Genkit) could offer specific revisions or options.
- **Full Blueprint Editing (Step 3):** Allow adding/deleting items in lists (Benefits, Testimonials, Trust Signals) in Step 3, not just editing existing ones. This would require more complex state management for these arrays.
- **Backend for Firebase Management:** For direct creation/management of multiple Firebase Remote Config parameters (if each "landing page" created in a CMS-like fashion needed its own parameter) or saving blueprints to Firestore, a backend service using the Firebase Admin SDK would be necessary. This would enable true CMS-like capabilities beyond local storage.
- **Error Handling & Validation:** Enhance error handling for JSON parsing (Step 1), AI flows, and localStorage operations. Implement more robust validation for the `PageBlueprint` structure.
- **AI Theme Generation:** Explore AI capabilities to suggest campaign themes or focus areas based on product information or goals, rather than just generating copy based on a user-provided theme.
- **Direct Integration with Keyword Platforms (Backend Task):** Requires backend development for secure API access to platforms like Google Ads API to fetch keywords.
- **Advanced UX Analysis AI (External Tool):** The "Recommendations Engine" is envisioned to perform advanced UX evaluations (Nielsen's Heuristics, WCAG, COM-B model), as described by the user. The output of this engine (the `PageBlueprint`) is consumed by this application. This application does not implement these UX analysis rubrics itself but provides the UI to work with the resulting content recommendations.
- **Rate Limiting/Cost for AI:** Monitor and manage if using paid AI models extensively.
- The `useRemoteConfigValue` hook is not currently used by the main landing page structure in the 5-step workflow (as content comes from `activePageBlueprint`) but remains available for other potential uses.
- **Walkthrough Enhancements:** More sophisticated element highlighting (e.g., using SVG overlays for non-rectangular shapes), dynamic step generation based on app state, better handling of scrolling and off-screen elements.

## 9. User Flow Diagram (Conceptual for 5-Step Workflow)

```mermaid
graph TD
    A[Start: User Navigates to App /] --> B(Step 1: Review Recommendations Panel);
    B -- Upload JSON Blueprint / Walkthrough Loads Sample --> C{Blueprint Loaded?};
    C -- Yes --> D(State: activePageBlueprint Updated);
    D --> E(Step 2: Build & Preview Panel);
    E -- Display Full Page Preview from activePageBlueprint --> F{User Reviews Preview};
    F --> G(Step 3: Adjust Content Panel);
    G -- User Edits Content Sections (Hero, Benefits, etc.) --> H(State: activePageBlueprint Updated);
    H --> I(Step 4: Configure A/B Test Panel);
    I -- Pre-fill Version A (Hero) from activePageBlueprint.heroConfig --> J{User Configures Version B (Hero)};
    J -- Use AI Suggestions (Optional: with Campaign Focus) --> J;
    J -- Manage Local A/B Hero Configs (Save/Load) --> J;
    J -- Render A/B Preview (Hero) --> K[/landing-preview Page];
    J -- Generate/Copy/Download JSON for A & B (Hero) --> L(Step 5: Prepare for Deployment Panel);
    L -- User Takes JSON to Firebase Console --> M[Firebase A/B Test Setup];
    M -- Refer to PLAYBOOK.md --> M;
    C -- No / Error --> B;

    WT_Start[User clicks Walkthrough Toggle] --> WT_Modal(Welcome Modal);
    WT_Modal -- Start Tour --> WT_Step1(Guides through Step 1);
    WT_Step1 --> WT_Step2(Guides through Step 2);
    WT_Step2 --> WT_Step3(Guides through Step 3);
    WT_Step3 --> WT_Step4(Guides through Step 4);
    WT_Step4 --> WT_Step5(Guides through Step 5);
    WT_Step5 --> WT_End(Walkthrough Ends);
    WT_Modal -- Skip Tour --> WT_End;
```

    
