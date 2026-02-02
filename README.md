# LinguaLate

LinguaLate is an advanced translation and text adaptation tool powered by Google's Gemini API. Unlike standard translators, LinguaLate allows you to specify the target **CEFR (Common European Framework of Reference for Languages)** level for your translation, ranging from A1 (Beginner) to C2 (Proficiency).

This makes it an ideal tool for language learners, teachers, and content creators who need text adapted to a specific difficulty level.

## Features

*   **CEFR Level Adaptation**: Translate or rewrite text to match specific proficiency levels (A1.1 to C2).
*   **Multi-language Support**: Supports a wide range of global languages including English, Spanish, French, German, Vietnamese, Ukrainian, and more.
*   **UI Localization**: Interface available in English, Finnish, and Vietnamese.
*   **Dark/Light Mode**: Fully responsive theme support.
*   **Same-Language Simplification**: Can be used to simplify (or complicate) text within the same language (e.g., English -> English [A1]).
*   **Streaming Responses**: Real-time text generation for a smooth user experience.

## Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **AI Model**: Google Gemini 3 Pro (`gemini-3-pro-preview`)
*   **SDK**: `@google/genai`

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

*   A modern web browser.
*   **Google Gemini API Key**: You need a paid or free tier API key from Google AI Studio.

### 1. Get your API Key

1.  Visit [Google AI Studio](https://aistudio.google.com/).
2.  Sign in with your Google account.
3.  Click on **Get API key** in the sidebar.
4.  Click **Create API key**.
5.  Copy the key string (it starts with `AIza...`).

### 2. Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Triamas/LinguaLate.git
    cd LinguaLate
    ```

2.  **Configuration**:
    The application requires the API key to be available in the environment variable `API_KEY`.
    
    *   **If running in a local development environment (e.g., via a bundler like Vite or Webpack):**
        Create a `.env` file in the root directory and add your key:
        ```env
        API_KEY=your_actual_api_key_here
        ```
        *Note: Depending on your build tool, you might need to prefix this (e.g., `VITE_API_KEY` or `REACT_APP_API_KEY`) and update the code references accordingly, but standard Node.js environments look for `process.env.API_KEY`.*

    *   **If running in a cloud IDE or container:**
        Set the Secret or Environment Variable `API_KEY` in your project settings.

### 3. Running the App

Start your local development server.

```bash
npm install
npm start
# or
npm run dev
```

Open your browser to the local server address (usually `http://localhost:3000` or `http://localhost:5173`).

## Usage

1.  **Select Languages**: Choose your source language (or use Auto-detect) and your target language.
2.  **Select Level**: Choose the desired CEFR proficiency level (A1.1 - C2).
3.  **Enter Text**: Type or paste text into the left panel.
4.  **Translate**: Click "Translate" (or press `Ctrl + Enter`).
5.  **Review**: The adapted translation will stream into the right panel.

## Disclaimer

This tool uses Artificial Intelligence. While the CEFR adaptation is generally accurate, results may vary. Always verify important translations.
