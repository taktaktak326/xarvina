# Xarvio Chat - Agri-Chan Support App

This contains everything you need to run your app locally and prepare it for deployment.

## Local Development

**Prerequisites:** Node.js

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up API Key:**
    Create a file named `.env.local` in the root of the project and add your Gemini API key:
    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```
    Replace `YOUR_GEMINI_API_KEY` with your actual key. The application code refers to this as `process.env.API_KEY` via Vite's build process, as defined in `vite.config.ts`.
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, typically on `http://localhost:5173`.

## Building for Production

To build the application for production:

1.  **Ensure API Key is available:**
    The build process requires the `GEMINI_API_KEY` to be available as an environment variable. If you set it in `.env.local` for development, ensure your build environment (e.g., CI/CD pipeline) also has access to this variable.
    ```bash
    npm run build
    ```
    This command will create a `dist` directory with the compiled static assets. The `GEMINI_API_KEY` will be embedded into the built application code where `process.env.API_KEY` is referenced.

## Deployment to Google Cloud

The application is a static single-page application (SPA) after a build and can be deployed to various Google Cloud services.

1.  **Build the application:**
    Follow the "Building for Production" steps above. Ensure the `GEMINI_API_KEY` environment variable is set in your build environment (e.g., Cloud Build, GitHub Actions, or your local terminal if building manually before uploading).

2.  **Deploy static assets:**
    The contents of the `dist` directory can be deployed to:
    *   **Google Cloud Storage (GCS) with a Load Balancer:** Configure a GCS bucket for static website hosting and set up an HTTP(S) Load Balancer for serving.
    *   **Firebase Hosting:** Firebase Hosting is a straightforward way to deploy web apps and SPAs.
    *   **App Engine (standard or flex environment):** Serve the static files using App Engine. You might need a simple `app.yaml` configuration to specify static file handlers and a catch-all for SPA routing.
    *   **Cloud Run:** Containerize the application (e.g., using a simple Nginx or Caddy server for static files within a Docker container) and deploy it to Cloud Run.

**Important for Google Cloud Deployment:**

*   **API Key Management:** The `GEMINI_API_KEY` (which gets mapped to `process.env.API_KEY` in the application code during build) **must** be configured as an environment variable in your Google Cloud build environment. **Do not hardcode the API key directly into your source code committed to version control.**
    *   For Cloud Build, you can set environment variables or use Secret Manager.
    *   For other CI/CD systems, refer to their documentation for managing secrets and environment variables.
*   **Serving `index.html` for SPA Routes:** Ensure your chosen Google Cloud service is configured to serve `index.html` for all SPA routes (e.g., for any path that doesn't match a static file, it should fall back to serving `index.html`). This is crucial for client-side routing to work correctly.
    *   Firebase Hosting handles this automatically.
    *   For GCS with a Load Balancer, you'll configure URL maps.
    *   For App Engine, `app.yaml` can define these handlers.
    *   For Cloud Run with a custom web server, configure the server (e.g., Nginx `try_files`) accordingly.

This guidance should help in deploying the application to a Google Cloud project.
