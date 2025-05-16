
# Technical Specification & Release Guide: SecureTomorrow Landing Page A/B Testing Platform

## 1. Introduction

### 1.1. Purpose of the Application
This Next.js application serves as a comprehensive platform for creating, configuring, and previewing content variations for the SecureTomorrow landing page. It follows a guided 5-step workflow: ingesting page recommendations, building/previewing the page, adjusting content, configuring A/B test variations (primarily for the Hero Section), and preparing for deployment via Firebase. It leverages AI for content suggestions (optionally guided by user-provided campaign themes/keywords).

### 1.2. High-Level Functionality
- **Guided Workflow:** A 5-step accordion interface (Review, Build, Adjust, A/B Configure, Deploy).
- **Recommendation Ingestion (Step 1):** Allows users to upload a JSON file (`PageBlueprint`) containing recommendations for landing page content (e.g., hero headlines, benefits, testimonials, trust signals).
- **Page Preview (Step 2):** Displays a preview of the landing page (initially focused on the Hero Section, expandable to other sections) based on the ingested or adjusted blueprint.
- **Content Adjustment (Step 3):** Enables users to fine-tune the content of the landing page blueprint (e.g., Hero section text).
- **A/B Test Content Configuration (Step 4):** Allows users (e.g., marketing team) to define two text versions for A/B testing (e.g., Hero Section headline, sub-headline, CTA). Version A is pre-filled from Step 3.
- **AI-Assisted Content Generation (Step 4):** Provides AI-powered suggestions for A/B test copy using Genkit and Google's Gemini model. Users can provide an optional "Campaign Focus / Keywords" to further tailor these suggestions.
- **JSON Generation (Step 4):** Automatically generates JSON output compatible with Firebase Remote Config for each A/B test content variation.
- **Local Configuration Management (Step 4):** Enables users to save, load, and manage different A/B test content configurations (including campaign focus) directly in their browser's local storage.
- **Side-by-Side A/B Preview (Step 4):** Renders two selected A/B content variations on a dedicated preview page (`/landing-preview`) for visual comparison.
- **Deployment Guidance (Step 5):** Provides instructions for using the generated JSON in Firebase.
- **Firebase Integration (Indirect):** Prepares content for A/B tests run via Firebase Remote Config and Firebase A/B Testing. Actual test setup and management occur in the Firebase console.
- **AB Tasty Integration Point:** Includes a placeholder for integrating AB Tasty's JavaScript snippet for client-side A/B testing.

### 1.3. Key Technologies Used
- **Frontend Framework:** Next.js (with App Router)
- **UI Library:** React
- **UI Components:** ShadCN UI (Accordion, Button, Card, Input, Label, Textarea, Popover, Toast, etc.)
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, useCallback, useContext for Toast)
- **A/B Test Content Delivery (Primary Method):** Firebase Remote Config
- **A/B Test Management (Primary Method):** Firebase A/B Testing (via Firebase Console)
- **Client-Side A/B Testing (Alternative/External):** Placeholder for AB Tasty
- **Generative AI (Stack):** Genkit with Google AI (Gemini models) for content suggestions.
  - Flow: `src/ai/flows/suggest-hero-copy-flow.ts` (accepts optional `campaignFocus`)

## 2. Application Architecture

### 2.1. Frontend Structure
- **Next.js App Router:** Used for routing and page structure.
    - `/` (root): Main 5-step workflow application (`src/app/page.tsx`) with the accordion interface.
    - `/landing-preview`: Side-by-side A/B test preview page.
- **Key Directories:**
    - `src/app/`: Contains page components and layouts.
        - `page.tsx`: Main 5-step workflow application.
        - `landing-preview/page.tsx`: Side-by-side A/B test preview page.
        - `layout.tsx`: Root layout, includes Toaster and AB Tasty script placeholder.
        - `globals.css`: Global styles, Tailwind directives, and ShadCN CSS theme variables (HSL).
    - `src/components/`: Reusable UI components.
        - `landing/`: Components specific to the landing page (Header, HeroSection, Benefits, etc.).
        - `ui/`: ShadCN UI components.
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
- **`activePageBlueprint` (State in `src/app/page.tsx`):** Holds the `PageBlueprint` data loaded from the JSON in Step 1. This data is used in Step 2 (Build/Preview) and can be modified in Step 3 (Adjust).
- **A/B Test Configurations (Step 4):**
    - Hero content from `activePageBlueprint` (after Step 3 adjustments) pre-fills "Version A".
    - "Version B" is configured by the user.
    - AI suggestions, campaign focus, and local storage management (`heroConfigManager`) are handled within this step for A/B test variations.
- **Firebase Integration:**
    - Initialization: `src/lib/firebase.ts`.
    - Remote Config: The application prepares JSON for `heroConfig` parameter (from Step 4). Actual A/B test setup occurs in Firebase Console.
- **Genkit/AI:**
    - Uses `ai.defineFlow` and `ai.definePrompt` for the `suggestHeroCopyFlow`.
    - The flow is called from the client-side component in Step 4 (and potentially Step 3 in future).

### 2.3. Workflow Overview (5-Step Accordion)
1.  **Step 1: Review Recommendations:**
    - User uploads a `PageBlueprint` JSON file.
    - Application parses and stores this blueprint.
2.  **Step 2: Build & Preview Page:**
    - Application renders a preview of the landing page (initially Hero Section, expandable) based on the `activePageBlueprint`.
3.  **Step 3: Adjust Content:**
    - User edits the content of the `activePageBlueprint` (e.g., Hero Section text) via input fields.
    - (Future: AI content suggestions, guided UI tweaks using Genkit chat).
4.  **Step 4: Configure A/B Test:**
    - "Version A" is pre-filled using the (adjusted) Hero content from `activePageBlueprint`.
    *   User configures "Version B", uses AI suggestions (with optional campaign focus).
    *   User can save/load/manage A/B variations locally.
    *   User can preview "Version A" vs "Version B" on `/landing-preview`.
    *   User copies/downloads JSON for Firebase.
5.  **Step 5: Prepare for Deployment:**
    - User is guided to take the generated JSON to the Firebase Console.
    - `PLAYBOOK.md` provides detailed Firebase setup instructions.
- **AB Tasty:** If used, its script (added to `layout.tsx`) would override content for tests managed by that platform.

## 3. Core Features & Functionality (by Step)

### 3.1. Step 1: Review Recommendations
- **Purpose:** To ingest initial landing page content and structure from an external tool via a JSON `PageBlueprint`.
- **Features:**
    - File input for JSON (`PageBlueprint` format as defined in `src/types/recommendations.ts`).
    - JSON parsing and basic validation (implicit through type casting).
    - Display of loaded blueprint name and raw JSON.
    - Stores data in `activePageBlueprint` state.

### 3.2. Step 2: Build & Preview Page
- **Purpose:** To visualize the landing page based on the current blueprint.
- **Features:**
    - Renders `HeroSection` component using `activePageBlueprint.heroConfig`.
    - (Future: Could render other sections like Benefits, Testimonials, Trust Signals based on `activePageBlueprint`).

### 3.3. Step 3: Adjust Content
- **Purpose:** To allow fine-tuning of the landing page content derived from the blueprint.
- **Features:**
    - Input fields for `activePageBlueprint.heroConfig` (headline, subHeadline, ctaText, uniqueValueProposition).
    - Changes update the `activePageBlueprint` state in real-time.
    - (Future: AI content suggestions directly in this step; advanced AI chat for UI/content refinement).

### 3.4. Step 4: Configure A/B Test (formerly main A/B Test Configurator)
- **Purpose:** To create, manage (locally), get AI suggestions for, and prepare Hero Section content variations for A/B testing.
- **Features:**
    - Dual Version Input (A & B) using `ABTestConfigForm`. Version A pre-filled from `activePageBlueprint`.
    - Campaign Focus Input for AI tailoring.
    - AI Content Suggestions (calling `suggestHeroCopy` Genkit flow).
    - Real-time JSON Generation for A/B variants.
    - Copy & Download JSON for A/B variants.
    - Local Configuration Management for A/B variants (`localStorage` key: `heroConfigManager`), now includes saving/loading `campaignFocus`.
    - "Render Pages for Preview" Button: Opens `/landing-preview` with current A/B configurations.
- **Key Components Used:** `ABTestConfigForm`, `Card`, `Input`, `Label`, `Button`, `Textarea`, `Separator`, `Popover`, `useToast`, `Sparkles` icon.
- **Data Structures:**
    - `ABTestHeroConfig`: For JSON output for Firebase.
    - `ManagedABTestHeroConfig`: For local storage of A/B variants (includes `campaignFocus`).

### 3.5. Step 5: Prepare for Deployment
- **Purpose:** To guide the user on using the generated A/B test JSON with Firebase.
- **Features:**
    - Instructional text.
    - Link to Firebase Console.
    - Prominent reference to `PLAYBOOK.md`.

### 3.6. Landing Preview Page (`src/app/landing-preview/page.tsx`)
- **Purpose:** To display two versions of the Hero Section side-by-side for A/B test comparison.
- **Functionality:** Reads `configA` and `configB` JSON strings from URL query parameters.

### 3.7. Landing Page Components (`src/components/landing/`)
- Standard landing page components (Header, HeroSection, etc.). `HeroSection` is dynamically populated.
- (Future: Add `BenefitsSection`, `TestimonialsSection`, `TrustSignalsSection` that can also be populated from `activePageBlueprint`).

### 3.8. AI Flow (`src/ai/flows/suggest-hero-copy-flow.ts`)
- **Purpose:** To generate hero section copy suggestions for A/B testing.
- **Input:** `SuggestHeroCopyInput` (copyType, currentText, productName, productDescription, count, campaignFocus).
- **Output:** `SuggestHeroCopyOutput` (array of suggestions).

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
- **`PLAYBOOK.md`:** User-focused guide for A/B testing workflow with Firebase.
- **`TECHNICAL_SPEC.md`:** (This document).
- **`src/app/page.tsx`:** Main 5-step workflow application.
- **`src/ai/flows/suggest-hero-copy-flow.ts`:** Genkit flow for AI suggestions.
- **`src/types/recommendations.ts`:** Defines `PageBlueprint`.
- Other files as previously listed.

## 7. Branding Guidelines Reference
- Defined in `PLAYBOOK.md`.

## 8. Future Considerations / Roadmap
- **Tokens-Based Design System:** Explore integrating a design tokens system for more flexible multi-brand UI management. Current component structure is a good base for this, allowing dynamic styling based on loaded tokens.
- **Advanced AI - Gemini Chat for UI Dev (Step 3):** Consider using AI chat (e.g., via Genkit) in "Step 3: Adjust" for more interactive UI/content refinement beyond simple suggestions. This could involve users describing desired changes, and AI providing guidance or even code snippets for simple style adjustments if a token system is in place.
- **Full Blueprint Rendering (Step 2 & 3):** Expand "Step 2: Build & Preview" and "Step 3: Adjust" to handle more sections from the `PageBlueprint` (e.g., Benefits, Testimonials, Trust Signals, Footer). This would involve creating corresponding React components in `src/components/landing/` that accept props from the blueprint.
- **Backend for Firebase Management:** For direct creation/management of multiple Firebase Remote Config parameters or saving blueprints to Firestore, a backend service using the Firebase Admin SDK would be necessary. This would enable true CMS-like capabilities.
- **Error Handling & Validation:** Enhance error handling for JSON parsing (Step 1), AI flows, and localStorage operations. Implement more robust validation for the `PageBlueprint` structure.
- **AI Theme Generation:** Explore AI capabilities to suggest campaign themes or focus areas based on product information or goals.
- **Direct Integration with Keyword Platforms:** Requires backend development for secure API access to platforms like Google Ads API.
- **Advanced UX Analysis AI:** The concepts for AI-led UX evaluation (Nielsen's Heuristics, WCAG, COM-B model) mentioned by the user are excellent ideas for a separate, advanced analytics tool or future AI-powered features within this application's ecosystem. This would likely involve more complex Genkit flows, potentially tool use for web scraping or accessibility checks, and sophisticated prompt engineering.
- **Rate Limiting/Cost for AI:** Monitor and manage if using paid AI models extensively.
- The `useRemoteConfigValue` hook is not currently used by the main landing page structure in the 5-step workflow but remains available for other potential uses.

## 9. User Flow Diagram (Conceptual for 5-Step Workflow)

```mermaid
graph TD
    A[Start: User Navigates to App /] --> B(Step 1: Review Recommendations Panel);
    B -- Upload JSON Blueprint --> C{Blueprint Loaded?};
    C -- Yes --> D(State: activePageBlueprint Updated);
    D --> E(Step 2: Build & Preview Panel);
    E -- Display Hero from activePageBlueprint.heroConfig --> F{User Reviews Preview};
    F --> G(Step 3: Adjust Content Panel);
    G -- User Edits Hero Content --> H(State: activePageBlueprint.heroConfig Updated);
    H --> I(Step 4: Configure A/B Test Panel);
    I -- Pre-fill Version A from activePageBlueprint.heroConfig --> J{User Configures Version B};
    J -- Use AI Suggestions (Optional: with Campaign Focus) --> J;
    J -- Manage Local A/B Configs (Save/Load) --> J;
    J -- Render A/B Preview --> K[/landing-preview Page];
    J -- Generate/Copy/Download JSON for A & B --> L(Step 5: Prepare for Deployment Panel);
    L -- User Takes JSON to Firebase Console --> M[Firebase A/B Test Setup];
    M -- Refer to PLAYBOOK.md --> M;
    C -- No / Error --> B;
```
