# Guide Enstp

Please review, refactor, and update our Authentication (Login/Sign Up) flow and Dashboard UI with the following requirements:

1. FIX & IMPROVE EMAIL VERIFICATION (OTP CODE INSTEAD OF LINK):
   - Switch the email verification method from email magic links to a 6-digit OTP code (One-Time Password / Verification Code).
   - Sending a short numeric code ensures 100% compatibility with all email providers (Gmail, Outlook, Yahoo, school/institutional emails) without getting flagged or blocked by strict anti-spam filters.
   - After Sign Up, redirect the user to a "Verify Code" screen where they enter the 6-digit code received in their inbox. Include a "Resend Code" (Renvoyer le code) button.

2. DYNAMIC CONDITIONAL FIELDS (ACADEMIC YEAR & SPECIALTY):
   - Academic Year Dropdown options:
     * 1ère année (Classe Préparatoire)
     * 2ème année (Classe Préparatoire)
     * 3ème année
     * 4ème année
     * 5ème année
   - Conditional Field Logic: When the user selects "3ème année", "4ème année", or "5ème année", dynamically show an additional mandatory dropdown field to select their Specialty:
     * Option A: DIB
     * Option B: DMS
   - If 1ère or 2ème année is selected, hide the Specialty field.

3. WELCOMING MESSAGE ON DASHBOARD:
   - Upon completing Sign Up or Login and redirecting to the main page/dashboard, display a personalized welcoming message placed directly above the heading: "NOUVEAU CHAPITRE. NOUVEAUX REPÈRES".
   - Example text: "Bienvenue, [First Name] ! 👋" placed right above "NOUVEAU CHAPITRE. NOUVEAUX REPÈRES".

4. GENERAL REVIEW & QUALITY ASSURANCE:
   - Ensure all user fields (First Name, Last Name, Email, Academic Year, and Specialty if applicable) are properly stored in the database (profiles table) upon sign-up completion.
   - Verify that the login works seamlessly with both personal and school emails.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://guide-enstp.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4ecb3a3b-b591-4f2f-9329-cdb24f761a88).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
