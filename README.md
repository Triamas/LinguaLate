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

## Setup

1.  Clone the repository.
2.  Set up your environment variables. You will need a valid Google Gemini API key.
    ```bash
    export API_KEY=your_api_key_here
    ```
3.  Open `index.html` in a browser or serve via a simple HTTP server (e.g., `npx serve`).

*Note: This project uses ES modules and imports React and the Gemini SDK directly from CDNs, so no complex build step (like Webpack or Vite) is strictly required to run the code provided, although a development server is recommended.*
