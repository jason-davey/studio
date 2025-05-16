
# Technical Specification & Release Guide: SecureTomorrow Landing Page A/B Testing Platform

## 1. Introduction

### 1.1. Purpose of the Application
This Next.js application serves as a platform for managing and previewing content variations for the SecureTomorrow landing page, primarily focused on A/B testing the Hero Section. It provides tools to configure content, generate necessary configurations for Firebase A/B testing, preview variations, and leverage AI for content suggestions (optionally guided by user-provided campaign themes/keywords).

### 1.2. High-Level Functionality
- **A/B Test Content Configuration:** Allows users (e.g., marketing team) to define multiple text versions for the landing page's Hero Section (headline, sub-headline, CTA).
- **AI-Assisted Content Generation:** Provides AI-powered suggestions for headlines, sub-headlines, and CTAs using Genkit and Google's Gemini model. Users can provide an optional "Campaign Focus / Keywords" to further tailor these suggestions.
- **JSON Generation:** Automatically generates JSON output compatible with Firebase Remote Config for each content variation.
- **Local Configuration Management:** Enables users to save, load, and manage different content configurations (including campaign focus) directly in their browser's local storage.
- **Side-by-Side Preview:** Renders two selected content variations on a dedicated preview page for visual comparison.
- **Firebase Integration (Indirect):** Prepares content for A/B tests run via Firebase Remote Config and Firebase A/B Testing. Actual test setup and management occur in the Firebase console.
- **AB Tasty Integration Point:** Includes a placeholder for integrating AB Tasty's JavaScript snippet for client-side A/B testing.

### 1.3. Key Technologies Used
- **Frontend Framework:** Next.js (with App Router)
- **UI Library:** React
- **UI Components:** ShadCN UI (Button, Card, Input, Label, Textarea, Popover, Toast, etc.)
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, useCallback, useContext for Toast)
- **A/B Test Content Delivery (Primary Method):** Firebase Remote Config
- **A/B Test Management (Primary Method):** Firebase A/B Testing (via Firebase Console)
- **Client-Side A/B Testing (Alternative/External):** Placeholder for AB Tasty
- **Generative AI (Stack):** Genkit with Google AI (Gemini models) for content suggestions.
  - Flow: `src/ai/flows/suggest-hero-copy-flow.ts` (accepts optional `campaignFocus`)

## 2. Application Architecture

### 2.1. Frontend Structure
- **Next.js App Router:** Used for routing and page structure (e.g., `/`, `/landing-preview`).
- **Key Directories:**
    - `src/app/`: Contains page components and layouts.
        - `page.tsx`: Main A/B Test Configurator & Manager tool with AI suggestions (supports campaign focus input, and local storage for hero configurations including campaign focus).
        - `landing-preview/page.tsx`: Side-by-side preview page.
        - `layout.tsx`: Root layout, includes Toaster and AB Tasty script placeholder.
        - `globals.css`: Global styles, Tailwind directives, and ShadCN CSS theme variables (HSL).
    - `src/components/`: Reusable UI components.
        - `landing/`: Components specific to the landing page (Header, HeroSection, Benefits, etc.).
        - `ui/`: ShadCN UI components.
    - `src/lib/`: Utility functions and Firebase initialization.
        - `firebase.ts`: Firebase SDK initialization and Remote Config setup.
        - `utils.ts`: General utility functions (e.g., `cn` for classnames).
    - `src/hooks/`: Custom React hooks.
        - `useRemoteConfigValue.ts`: Hook to fetch values from Firebase Remote Config (not currently used by main pages but available).
        - `useToast.ts`: Hook for displaying toast notifications.
    - `src/ai/`: Genkit related files.
        - `genkit.ts`: Genkit global instance initialization.
        - `dev.ts`: Entry point for Genkit development server, imports flows.
        - `flows/suggest-hero-copy-flow.ts`: Genkit flow for generating hero section copy suggestions, enhanced to consider an optional `campaignFocus` string.
- **Styling:**
    - Tailwind CSS is the primary styling utility.
    - `src/app/globals.css` defines base styles, Tailwind layers, and CSS variables for the ShadCN theme.
    - Font: URW DIN (defined via `@font-face` in `globals.css` and applied via `tailwind.config.ts`).

### 2.2. Firebase Integration
- **Initialization:** `src/lib/firebase.ts` handles Firebase app initialization.
- **Remote Config:**
    - The application prepares JSON for `heroConfig` parameter.
    - Actual A/B test setup and management occur in the Firebase Console.
- **Genkit/AI:**
    - Uses `ai.defineFlow` and `ai.definePrompt` for the `suggestHeroCopyFlow`.
    - The flow is called from the client-side component `src/app/page.tsx`.
    - The `suggestHeroCopyFlow` input now includes an optional `campaignFocus` field to allow users to guide AI suggestions with specific themes or keywords.

### 2.3. A/B Testing Workflow
1.  **Content Configuration:** User defines content for "Version A" and "Version B" in the A/B Test Configurator tool (`/`).
    - **Campaign Focus (Optional):** User can input a campaign theme or keywords into a dedicated textarea for each version to tailor AI suggestions.
    - **AI Assistance:** User can click "✨ Suggest with AI" buttons to get AI-generated suggestions for headlines, sub-headlines, and CTAs. These suggestions will now be influenced by the provided campaign focus, if any.
2.  **Local Management:** User can save these configurations (headline, sub-headline, CTA, and campaign focus) locally in their browser for later use.
3.  **Preview:** User clicks "Render Pages for Preview" to view both active configurations side-by-side on `/landing-preview`.
4.  **JSON Export:** User copies or downloads the generated JSON for each version.
5.  **Firebase Setup:** User navigates to the Firebase Console and uses the copied JSON to define variants for the `heroConfig` parameter within an A/B Test.
    - Detailed steps are in `PLAYBOOK.md`.
6.  **Live Test:** Managed via Firebase.
- **AB Tasty:** If AB Tasty is used, its script (added to `layout.tsx`) would override content changes for tests managed by that platform.

## 3. Core Features & Functionality

### 3.1. A/B Test Configurator & Manager (`src/app/page.tsx`)
- **Purpose:** To create, manage (locally), get AI suggestions for, and prepare Hero Section content variations for A/B testing.
- **Features:**
    - **Dual Version Input:** Separate forms for "Version A" and "Version B".
    - **Campaign Focus Input:** Each version form includes a textarea for optional campaign themes or keywords to guide AI suggestions.
    - **AI Content Suggestions:**
        - "✨ Suggest with AI" buttons next to Headline, Sub-Headline, and CTA Text inputs.
        - Calls `suggestHeroCopy` Genkit flow, passing the `campaignFocus` text.
        - Displays suggestions in a popover, allowing users to apply them.
    - **Real-time JSON Generation:** Displays generated JSON for each version.
    - **Copy & Download JSON:** Buttons for each version.
    - **Local Configuration Management:**
        - Save/Load/Delete configurations using browser `localStorage` (key: `heroConfigManager`). Configurations store headline, sub-headline, CTA text, and the campaign focus.
    - **"Render Pages for Preview" Button:** Opens `/landing-preview` with current configurations.
    - **Guidance Footer:** Instructions and links for Firebase and `PLAYBOOK.md`.
- **Key Components Used:** `ConfigForm` (refactored), `Card`, `Input`, `Label`, `Button`, `Textarea`, `Separator`, `Popover`, `useToast`, `Sparkles` icon.
- **Data Structures:**
    - `HeroConfig`: `{ headline: string; subHeadline: string; ctaText: string; }` (This is the structure for the JSON output).
    - `ManagedHeroConfig`: `{ id: string; name: string; headline: string; subHeadline: string; ctaText: string; campaignFocus?: string; }` (Structure for local storage).
    - `SuggestHeroCopyInput` now includes `campaignFocus: string | undefined`.

### 3.2. Landing Preview Page (`src/app/landing-preview/page.tsx`)
- **Purpose:** To display two versions of the Hero Section side-by-side.
- **Functionality:**
    - Reads `configA` and `configB` JSON strings from URL query parameters.
    - Renders two `HeroSection` components.
    *   Falls back to defaults if parameters are missing/invalid.
    *   Includes other static landing page sections for context.

### 3.3. Landing Page Components (`src/components/landing/`)
- **`Header.tsx`:** Logo links to `/` (configurator). "Get a Quote" links to `#quote-form` on `/landing-preview`.
- **`HeroSection.tsx`:** Accepts `headline`, `subHeadline`, `ctaText`.
- Other components: `BenefitsSection`, `TestimonialsSection`, `AwardsSection`, `QuoteFormSection`, `Footer`.

### 3.4. AI Flow (`src/ai/flows/suggest-hero-copy-flow.ts`)
- **Purpose:** To generate hero section copy suggestions using an AI model.
- **Input:** `SuggestHeroCopyInput` (copyType, currentText, productName, productDescription, count, campaignFocus). The `campaignFocus` field allows the AI to tailor suggestions.
- **Output:** `SuggestHeroCopyOutput` (array of suggestions).
- **Technology:** Genkit, configured to use a Google AI model.
- **Prompt:** Instructs the AI to act as a marketing copywriter, considering the product, copy type, and any provided `campaignFocus`.

## 4. Setup & Configuration

### 4.1. Environment Variables (`.env.local`)
- Required for Firebase SDK. See `PLAYBOOK.md` for details.
- Genkit flows using Google AI will require appropriate API keys to be configured for the Google AI plugin if not using a free tier or if specific project quotas are needed. (This is typically handled in Genkit initialization or environment setup for Genkit).

### 4.2. Firebase Project Setup
- See `PLAYBOOK.md`. Remote Config is key.

### 4.3. AB Tasty Integration
- Placeholder in `src/app/layout.tsx`.

## 5. Development & Build

### 5.1. Running the Development Server
- App: `npm run dev` (or `yarn dev`) - typically `http://localhost:9002`.
- Genkit (for AI flows, if testing/developing them separately): `npm run genkit:dev` (or `genkit:watch`). The Next.js app calls server actions that invoke these flows.

### 5.2. Building for Production
- `npm run build` (or `yarn build`).

## 6. Key Files & Directories
- **`PLAYBOOK.md`:** User-focused guide for A/B testing workflow.
- **`TECHNICAL_SPEC.md`:** (This document).
- **`src/app/page.tsx`:** A/B Test Configurator with AI and local configuration management.
- **`src/ai/flows/suggest-hero-copy-flow.ts`:** Genkit flow for AI suggestions.
- Other files as previously listed.

## 7. Branding Guidelines Reference
- Defined in `PLAYBOOK.md`.

## 8. Known Issues / Future Considerations
- **Client-Side Limitations for Firebase Management:** Still applies.
- **Local Storage Scope:** Still applies.
- **AI Suggestion Quality:** Dependent on the model and prompt. Prompts may need refinement over time. The `campaignFocus` feature aims to improve relevance.
- **Error Handling for AI Flow:** Basic error handling exists (toast, console log). Could be made more robust.
- **Rate Limiting/Cost for AI:** If using paid AI models, consider usage limits and costs.
- The `useRemoteConfigValue` hook is not currently used by the main landing page or preview page.
      

    