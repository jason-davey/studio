
# Landing Page Creation & A/B Testing: Playbook

This playbook guides you through using the in-app tools to create landing page content, configure A/B tests for its Hero Section, and then deploy these tests using Firebase.

## 0. Overview of the In-App Workflow

The application provides a 5-step guided workflow:

1.  **Step 1: Review Recommendations (Optional):** Upload a JSON "Page Blueprint" file if you have one from an external recommendations tool. This can pre-fill content.
2.  **Step 2: Build & Preview Page:** See a preview of your landing page (initially the Hero section) based on the blueprint or default values.
3.  **Step 3: Adjust Content:** Fine-tune the main content of your landing page (e.g., Hero section text).
4.  **Step 4: Configure A/B Test:** Create "Version A" and "Version B" for A/B testing specific elements (like the Hero section). Version A will be pre-filled from your work in Step 3. Use AI suggestions and manage configurations locally.
5.  **Step 5: Prepare for Deployment:** Get instructions and links to take your A/B test configurations to Firebase.

## 1. Introduction to A/B Testing

A/B testing (or split testing) is a method of comparing two versions of a webpage element to determine which one performs better. In our case, we'll primarily use it to test different variations of the landing page Hero Section content (e.g., headlines, CTAs) to optimize for conversions.

**Firebase Tools Used:**
- **Firebase Remote Config:** Allows you to change the behavior and appearance of your app without publishing an app update. We'll use it to control which landing page variation a user sees.
- **Firebase Hosting:** (Implicitly used) To host your Next.js application.
- **Firebase A/B Testing:** A Firebase feature that helps you run, analyze, and scale product and marketing experiments.

## 2. Prerequisites

### 2.1. Firebase Project Setup
- Ensure you have a Firebase project created. If not, create one at [https://console.firebase.google.com/](https://console.firebase.google.com/).
- Your project should have Billing enabled if you plan to use Firebase A/B Testing features extensively.
- Ensure Genkit AI models (like Gemini via Google AI plugin) are configured if you intend to use the AI suggestion features and are outside any free quotas or need specific project billing.

### 2.2. Add Firebase to Your Next.js App
- The project is already configured with the Firebase SDK. The initialization logic is in `src/lib/firebase.ts`.
- **Crucially, you must create a `.env.local` file** in the root of your project. Copy the contents of `.env.example` (if it exists, otherwise create it from scratch) into `.env.local` and replace the placeholder values with your actual Firebase project's configuration credentials. You can find these in your Firebase project settings (Project Overview > Project settings > General > Your apps > SDK setup and configuration).
  Example `.env.local` content:
  ```env
  NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
  # ... (other Firebase config variables)
  ```
- **Important:** After creating or modifying `.env.local`, you **MUST restart your Next.js development server** for the changes to take effect.

## 3. Using the In-App Landing Page Workflow Tool (Root `/` path)

Navigate to the root of your application (e.g., `http://localhost:9002/`). This is the main tool.

### 3.1. Step 1: Review Recommendations (Optional)
- If you have a JSON file (a "Page Blueprint") from a URL scraping tool or other source with content recommendations:
    - Click "Upload File" and select your JSON file.
    - The tool will attempt to parse it. If successful, its content will be used to pre-fill the Hero section in the subsequent steps.
    - You'll see a preview of the loaded JSON.
    - Click "Proceed to Build".
- If you don't have a blueprint, you can skip this step or the app might use default values.

### 3.2. Step 2: Build & Preview Page
- This step shows a preview of the Hero Section based on the blueprint loaded in Step 1 (or defaults).
- Review the preview.
- Click "Proceed to Adjust".

### 3.3. Step 3: Adjust Content
- Here, you can edit the Headline, Sub-Headline, CTA Text, and Unique Value Proposition for the Hero Section.
- These changes will form the basis of "Version A" in your A/B test.
- Click "Configure A/B Test".

### 3.4. Step 4: Configure A/B Test
This panel is where you define two versions (A and B) of Hero section content for your A/B test.
- **Version A:** Will be pre-filled with the content you finalized in Step 3.
- **Version B:** Input alternative content for Headline, Sub-Headline, and CTA Text.
- **Campaign Focus / Keywords (for A & B):** Optionally, provide text in the "Campaign Focus / Keywords" textarea for each version. This text will guide the AI when generating suggestions, making them more relevant.
- **AI Content Suggestions (for A & B):** Use the "✨ Suggest with AI" buttons to get AI-generated ideas. These suggestions will be tailored if you've provided text in the "Campaign Focus" field.
- **Local Configuration Management (for A/B Variants):**
    - You can save the current state of Version A or B (headline, sub-headline, CTA, and campaign focus) locally.
    - Enter a name in "Save Version ... Content As:" and click "Save Content".
    - Saved configurations appear in the "Managed A/B Hero Configurations" list, allowing you to load them back.
- **JSON Generation:** The tool automatically generates the JSON string for `heroConfig` for Version A and B. You can **Copy** or **Download** this JSON. This is what you'll use in Firebase.
- **Preview A/B Versions:** Click "Render A/B Versions for Preview". This opens the `/landing-preview` page with both Version A and B (as currently configured in the forms) displayed side-by-side.
- Once satisfied, click "Proceed to Deployment Steps".

### 3.5. Step 5: Prepare for Deployment
- This panel provides instructions for using the JSON generated in Step 4 with Firebase Remote Config and A/B Testing.
- It includes a direct link to the Firebase Console.
- It emphasizes consulting this `PLAYBOOK.md` for detailed Firebase setup.

## 4. Configuring Firebase Remote Config (Using JSON from Step 4)

### 4.1. Access Remote Config
- Go to your Firebase project in the Firebase Console.
- In the left-hand navigation pane, under the "Engage" section (or "Build" in newer UIs), click on **Remote Config**.

### 4.2. Define the `heroConfig` Parameter
1.  Click **"Add parameter"** or **"Create configuration"**.
2.  **Parameter key:** Enter `heroConfig`.
3.  **Data type:** Select **String**.
4.  **Default value (server-side):** This is your **control/baseline** version.
    - Use the **JSON generated for "Version A" (your baseline)** from Step 4 of the in-app tool. Copy it.
    - Paste the copied JSON here. For example:
      ```json
      {"headline":"Ensure Your Family's Financial Security","subHeadline":"(even when you can't be there for them)","ctaText":"Secure My Family's Future Now"}
      ```
5.  Click **"Save"**.

### 4.3. Adding Variations for an A/B Test in Firebase
You will define your variations when creating an A/B test (see Section 6). The A/B Testing tool will override the default `heroConfig` value for users in specific experiment variants. You will use the JSON generated by the in-app tool (Step 4) for each variant.

### 4.4. Publish Changes
- After defining your parameter and its default value in the Firebase Console, click **"Publish changes"** in the Remote Config dashboard.

## 5. Deploying Your App (if code changes were made)
- If you made structural code changes beyond what the in-app tool configures, ensure your Next.js application is deployed.
  ```bash
  firebase deploy --only hosting
  ```

## 6. Creating an A/B Test in Firebase Console

### 6.1. Navigate to A/B Testing
- In the Firebase Console, under the "Engage" section, click on **A/B Testing**.

### 6.2. Set Up a New Experiment
1.  Click **"Create experiment"**.
2.  Choose **Remote Config**.
3.  **Basics:** Name your experiment (e.g., "Hero Headline Test - Q3").
4.  **Targeting:** Define your target users and activation event.
5.  **Goals:** Select your primary metric (e.g., a custom conversion event).
6.  **Variants:**
    *   **Baseline:** This is your control group.
        *   Parameter: Select `heroConfig`.
        *   Value: It should typically use the "parameter's default value" (which you set in step 4.2 using the JSON from "Version A" of the in-app tool).
    *   **Variant A (or your experimental variant, e.g., "Variant B" from the tool):**
        *   Click **"Add variant"**. Name it (e.g., "New Headline CTA").
        *   Parameter: `heroConfig`.
        *   Value: Use the **JSON generated for "Version B"** (or your chosen experimental version) from Step 4 of the in-app tool. Copy it and paste it here. For example:
          ```json
          {"headline":"Unlock Financial Peace of Mind","subHeadline":"(protecting your loved ones, always)","ctaText":"Get Protected Today"}
          ```
    *   **Distribution:** Adjust user percentages for each variant.
7.  Click **"Review"** and then **"Start experiment"**.

## 7. Iterating and Adding New Variations

1.  **Hypothesize:** What do you want to improve?
2.  **Use the In-App Tool (Steps 3 & 4):**
    *   Adjust content in Step 3 if needed for your new baseline.
    *   In Step 4, configure "Version A" (new baseline) and "Version B" (new experimental).
    *   Use AI suggestions and Campaign Focus as needed.
    *   Preview on `/landing-preview`.
3.  **Download/Copy JSON:** For the version you want to use as your new experimental variant in Firebase, copy or download its JSON.
4.  **A/B Test Setup:** In Firebase A/B Testing, create a new experiment or edit an existing one, pasting the new JSON for the relevant variant.

## 8. Branding Considerations for Test Variations
When designing new content variations for your A/B tests, ensure they align with the established brand identity. Key elements to consider are:

*   **Brand Colors (from Visual Identity Guide):**
    *   Greenstone Real Purple: `#912680` (Often used as a primary brand color)
    *   Greenstone Choosi Blue: `#003753` (A strong secondary or accent color)
    *   Greenstone GFS Green: `#00a77f` (Can be used for accents or specific calls to action)
    *   Greenstone Shine Yellow: `#ffc40c` (Excellent for highlights and prominent CTAs)
    *   Refer to your full brand guidelines for other colors like GFS Purple (`#4f2d7f`) and Grey (`#4d4d4d`).
*   **Font:**
    *   The project uses **URW DIN** as its primary font. Ensure all text content in your variations maintains this typography for consistency.
*   **Logo Usage:**
    *   The application's logo is located at `/public/resources/logo.png`. Ensure its presentation is consistent.

## 9. Troubleshooting

- **Error: `FirebaseError: Installations: Missing App configuration value: "projectId"`**
    *   **Solution:** Ensure `.env.local` is correct and restart dev server. See 2.2.
- **Remote Config Values Not Updating:**
    *   Ensure "Publish changes" in Firebase Remote Config. Note fetch intervals.
- **A/B Test Not Starting/No Data:**
    *   Check activation event. Verify Firebase Analytics.
- **Preview Page (`/landing-preview`) Not Showing Correct Content:**
    *   Ensure you clicked "Render A/B Versions for Preview" from Step 4. Check URL for `configA` and `configB`.
- **AI Suggestions Not Working:**
    *   Check browser console. Ensure Genkit dev server (`npm run genkit:dev`) is running if testing locally. Verify Firebase/Google Cloud project setup for Genkit. Try using "Campaign Focus" for better results.
- **JSON Blueprint Upload Error (Step 1):**
    *   Ensure the file is valid JSON and matches the expected `PageBlueprint` structure (see `src/types/recommendations.ts` for an idea, though this might evolve). Key fields like `pageName` and `heroConfig` are usually expected.

This playbook should provide a solid foundation for using the in-app tools and Firebase for A/B testing. Good luck!
