
# Technical Specification & Release Guide: SecureTomorrow Landing Page A/B Testing Platform

## 1. Introduction

### 1.1. Purpose of the Application
This Next.js application serves as a platform for managing and previewing content variations for the SecureTomorrow landing page, primarily focused on A/B testing the Hero Section. It provides tools to configure content, generate necessary configurations for Firebase A/B testing, and preview variations.

### 1.2. High-Level Functionality
- **A/B Test Content Configuration:** Allows users (e.g., marketing team) to define multiple text versions for the landing page's Hero Section (headline, sub-headline, CTA).
- **JSON Generation:** Automatically generates JSON output compatible with Firebase Remote Config for each content variation.
- **Local Configuration Management:** Enables users to save, load, and manage different content configurations directly in their browser's local storage.
- **Side-by-Side Preview:** Renders two selected content variations on a dedicated preview page for visual comparison.
- **Firebase Integration (Indirect):** Prepares content for A/B tests run via Firebase Remote Config and Firebase A/B Testing. Actual test setup and management occur in the Firebase console.
- **AB Tasty Integration Point:** Includes a placeholder for integrating AB Tasty's JavaScript snippet for client-side A/B testing.

### 1.3. Key Technologies Used
- **Frontend Framework:** Next.js (with App Router)
- **UI Library:** React
- **UI Components:** ShadCN UI
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, useContext for Toast)
- **A/B Test Content Delivery (Primary Method):** Firebase Remote Config
- **A/B Test Management (Primary Method):** Firebase A/B Testing (via Firebase Console)
- **Client-Side A/B Testing (Alternative/External):** Placeholder for AB Tasty
- **Generative AI (Stack):** Genkit (not actively used for core UI/content generation in the current feature set, but available in the project stack).

## 2. Application Architecture

### 2.1. Frontend Structure
- **Next.js App Router:** Used for routing and page structure (e.g., `/`, `/landing-preview`).
- **Key Directories:**
    - `src/app/`: Contains page components and layouts.
        - `page.tsx`: Main A/B Test Configurator & Manager tool.
        - `landing-preview/page.tsx`: Side-by-side preview page.
        - `layout.tsx`: Root layout, includes Toaster and AB Tasty script placeholder.
        - `globals.css`: Global styles, Tailwind directives, and ShadCN CSS theme variables (HSL).
    - `src/components/`: Reusable UI components.
        - `landing/`: Components specific to the landing page (Header, HeroSection, Benefits, etc.).
        - `ui/`: ShadCN UI components (Button, Card, Input, etc.).
    - `src/lib/`: Utility functions and Firebase initialization.
        - `firebase.ts`: Firebase SDK initialization and Remote Config setup.
        - `utils.ts`: General utility functions (e.g., `cn` for classnames).
    - `src/hooks/`: Custom React hooks.
        - `useRemoteConfigValue.ts`: Hook to fetch values from Firebase Remote Config.
        - `useToast.ts`: Hook for displaying toast notifications.
- **Styling:**
    - Tailwind CSS is the primary styling utility.
    - `src/app/globals.css` defines base styles, Tailwind layers, and CSS variables for the ShadCN theme (colors, radius).
    - Font: URW DIN (defined via `@font-face` in `globals.css` and applied via `tailwind.config.ts`).

### 2.2. Firebase Integration
- **Initialization:** `src/lib/firebase.ts` handles Firebase app initialization using environment variables.
- **Remote Config:**
    - Used to dynamically fetch content configurations for the Hero Section.
    - A default `heroConfig` parameter is defined in `firebase.ts` as a JSON string.
    - `useRemoteConfigValue` hook in `src/hooks/` fetches and parses the `heroConfig`.
- **A/B Testing:** The application prepares JSON configurations. The actual A/B test setup (variants, targeting, goals) is performed manually in the Firebase A/B Testing console.

### 2.3. A/B Testing Workflow
1.  **Content Configuration:** User defines content for "Version A" and "Version B" in the A/B Test Configurator tool (`/`).
2.  **Local Management:** User can save these configurations locally in their browser for later use.
3.  **Preview:** User clicks "Render Pages for Preview" to view both active configurations side-by-side on `/landing-preview`.
4.  **JSON Export:** User copies or downloads the generated JSON for each version.
5.  **Firebase Setup:** User navigates to the Firebase Console and uses the copied JSON to define variants for the `heroConfig` parameter within an A/B Test.
    - Detailed steps are in `PLAYBOOK.md`.
6.  **Live Test:** Once the A/B test is started in Firebase, users visiting the live landing page (if it were to use `useRemoteConfigValue` for the hero section) would see variations based on Firebase's assignment.
- **AB Tasty:** If AB Tasty is used, its script (added to `layout.tsx`) would override content changes for tests managed by that platform.

## 3. Core Features & Functionality

### 3.1. A/B Test Configurator & Manager (`src/app/page.tsx`)
- **Purpose:** To create, manage (locally), and prepare Hero Section content variations for A/B testing.
- **Features:**
    - **Dual Version Input:** Separate forms for "Version A" and "Version B" allowing input for Headline, Sub-Headline, and CTA text.
    - **Real-time JSON Generation:** Displays the generated JSON for each version as the user types.
    - **Copy & Download JSON:** Buttons to copy the generated JSON to the clipboard or download it as a `.json` file for each version.
    - **Local Configuration Management:**
        - Users can name and save the content of Version A or Version B.
        - Saved configurations are listed, showing name and headline.
        - Ability to load any saved configuration back into the Version A or Version B form.
        - Ability to delete saved configurations.
        - Uses browser `localStorage` with the key `heroConfigManager`.
    - **"Render Pages for Preview" Button:** Opens the `/landing-preview` page in a new tab, passing the current JSON configurations from Version A and Version B forms as URL query parameters (`configA` and `configB`).
    - **Guidance Footer:** Provides instructions and links for using the generated JSON with Firebase and consulting the `PLAYBOOK.md`.
- **Key Components Used:** `ConfigForm` (for individual version input), `Card`, `Input`, `Label`, `Button`, `Textarea`, `Separator`, `useToast`.
- **Data Structures:**
    - `HeroConfig`: `{ headline: string; subHeadline: string; ctaText: string; }`
    - `ManagedHeroConfig`: `{ id: string; name: string; headline: string; subHeadline: string; ctaText: string; }` (for local storage)

### 3.2. Landing Preview Page (`src/app/landing-preview/page.tsx`)
- **Purpose:** To display two versions of the Hero Section side-by-side for visual comparison.
- **Functionality:**
    - On load, attempts to read `configA` and `configB` JSON strings from URL query parameters.
    - Parses these JSON strings into `HeroConfig` objects.
    - Renders two instances of the `HeroSection` component, passing the parsed configurations as props.
    - If URL parameters are missing or invalid, it falls back to predefined default `HeroConfig` objects.
    - Includes other static landing page sections (`BenefitsSection`, `TestimonialsSection`, `AwardsSection`, `QuoteFormSection`, `Footer`) for context.
- **Error Handling:** Displays an alert if URL parameters cannot be parsed or are incomplete.

### 3.3. Landing Page Components (`src/components/landing/`)
- **`Header.tsx`:** Displays the site logo (links to `/`) and a "Get a Quote" button (links to `#quote-form` on `/landing-preview`).
- **`HeroSection.tsx`:**
    - Accepts `headline`, `subHeadline`, `ctaText` as props.
    - Displays these dynamic texts.
    - Includes a static background image and "The Real Reward™" feature box.
    - CTA button links to `#quote-form`.
- **`BenefitsSection.tsx`:** Static component displaying key benefits.
- **`TestimonialsSection.tsx`:** Static component displaying customer testimonials.
- **`AwardsSection.tsx`:** Static component displaying awards.
- **`QuoteFormSection.tsx`:** Multi-step form for users to request a life insurance quote.
    - Uses `react-hook-form` and `zod` for validation.
    - Form progress is shown.
    - On submission, logs data to console and shows a toast (no actual backend submission).
- **`Footer.tsx`:** Static footer with copyright information.

### 3.4. UI Components (`src/components/ui/`)
- Consists of pre-built and styled components from ShadCN UI (e.g., `Button.tsx`, `Card.tsx`, `Input.tsx`, `Dialog.tsx`, `Toast.tsx`, etc.).
- These components are highly customizable and adhere to the theme defined in `globals.css`.

## 4. Setup & Configuration

### 4.1. Environment Variables (`.env.local`)
- A `.env.local` file (copied from `.env.example` or created manually) is required in the project root.
- It must contain the following Firebase project credentials, prefixed with `NEXT_PUBLIC_`:
    - `NEXT_PUBLIC_FIREBASE_API_KEY`
    - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    - `NEXT_PUBLIC_FIREBASE_APP_ID`
    - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- **Important:** The Next.js development server must be restarted after creating or modifying `.env.local`.

### 4.2. Firebase Project Setup
- A Firebase project must be set up.
- Web app must be added to the Firebase project to obtain the configuration credentials.
- Remote Config and A/B Testing services should be enabled/used in the Firebase console.
- Refer to `PLAYBOOK.md` for detailed setup instructions.

### 4.3. AB Tasty Integration
- A placeholder comment exists in `src/app/layout.tsx` within the `<head>` section.
- The AB Tasty JavaScript snippet (obtained from the AB Tasty platform) should be pasted here to enable A/B tests managed by AB Tasty.

## 5. Development & Build

### 5.1. Running the Development Server
- Using npm: `npm run dev`
- Using yarn: `yarn dev`
- The application will typically be available at `http://localhost:9002`.

### 5.2. Building for Production
- Using npm: `npm run build`
- Using yarn: `yarn build`
- This command creates an optimized production build in the `.next` folder.

## 6. Key Files & Directories
- **`PLAYBOOK.md`:** A user-focused guide detailing the workflow for setting up and running A/B tests using the in-app tool and Firebase.
- **`TECHNICAL_SPEC.md`:** (This document) Provides a detailed technical overview of the application.
- **`src/app/globals.css`:** Contains global styles, Tailwind CSS directives, and CSS variables for the ShadCN UI theme.
- **`tailwind.config.ts`:** Configuration file for Tailwind CSS, including font setup.
- **`next.config.ts`:** Next.js configuration, including image remote patterns.
- **`src/lib/firebase.ts`:** Core Firebase SDK initialization and Remote Config setup.
- **`src/app/page.tsx`:** Source code for the A/B Test Configurator and Manager tool.
- **`src/app/landing-preview/page.tsx`:** Source code for the side-by-side landing page preview.
- **`src/components/landing/HeroSection.tsx`:** The React component whose content is dynamically changed for A/B testing.

## 7. Branding Guidelines Reference
- **Primary Font:** URW DIN
- **Key Brand Colors (as per `PLAYBOOK.md` and visual identity):**
    - Greenstone Real Purple: `#912680` (Primary)
    - Greenstone Choosi Blue: `#003753` (Secondary/Accent)
    - Greenstone GFS Green: `#00a77f` (Accent/CTA)
    - Greenstone Shine Yellow: `#ffc40c` (Highlight/CTA)
- **Logo:** Located at `/public/resources/logo.png`.

## 8. Known Issues / Future Considerations
- **Client-Side Limitations:** The application cannot directly manage Firebase Remote Config parameters or A/B tests (create, update, start, stop) due to the security implications of using Firebase Admin SDK on the client. These actions must be performed in the Firebase console.
- **Local Storage Scope:** Saved configurations in the A/B Test Configurator are stored in the user's browser and are not shared across users or devices.
- **Genkit Usage:** Currently, Genkit is part of the tech stack but not actively integrated into features like AI-assisted content generation for the A/B testing tool. This is a potential area for future enhancement.
- **Error Handling in `useRemoteConfigValue`:** Currently, this hook is not used by the main landing page or preview page as they rely on URL parameters or local configurations for the preview. If a "live" landing page were to use it, its error handling and default value logic would be critical.
- **Scalability of Local Configs:** For a very large number of local configurations, performance of `localStorage` might degrade, but this is unlikely for typical use cases.
      