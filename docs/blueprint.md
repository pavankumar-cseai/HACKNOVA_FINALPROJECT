# **App Name**: VerbatimFlow

## Core Features:

- Real-time Speech-to-Text: Transcribe speech to text using a lightweight ASR model like Tiny-Whisper, Vosk, or Coqui for minimal latency.
- Filler Word Removal: Automatically detect and remove filler words (e.g., 'umm', 'uhh', 'like', 'you know') using pattern matching.
- Repetition Removal: Identify and eliminate repeated phrases and n-grams based on similarity, acting as a tool.
- Grammar Correction & Auto-Formatting: Correct grammar, punctuation, capitalization and add paragraph breaks; optionally create bullet lists with models like T5-small.
- Tone and Style Adjustment: Adjust the text to match selected tone (Formal, Casual, Concise, Neutral) using rule-based transformations. 
- Latency Monitoring: Measure and log the latency of each processing step to ensure it stays within the 1500ms threshold.
- Raw vs. Processed Text Display: Show both raw transcript and cleaned, formatted text side-by-side.

## Style Guidelines:

- Primary color: Deep Blue (#3F51B5), evoking professionalism and clarity, aligning with focus on creating structured text.
- Background color: Very Light Blue (#E8EAF6), subtly related to primary hue, providing a calming and neutral base.
- Accent color: Vibrant Purple (#9C27B0), standing apart from the primary color to highlight interactive elements, about 30 degrees to the 'right' of deep blue.
- Font pairing: 'Inter' (sans-serif) for both headlines and body text.
- Code font: 'Source Code Pro' for displaying code snippets.
- Simple, professional icons to represent different functions (e.g., settings, microphone, processing stages).
- Clear, structured layout with raw text on one side and processed text on the other for easy comparison.