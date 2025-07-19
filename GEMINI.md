# Gemini Project Guidelines

This document outlines the development conventions for this project to ensure consistency and quality.

## Tech Stack

- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Backend:** Firebase
- **Testing:** Vitest, React Testing Library

## Project Structure

The project follows a feature-based architecture. Each feature is a self-contained module with its own components, hooks, and context.

- **`src/features`**: Contains all feature modules.
- **`src/constants`**: For application-wide constants.
- **`src/utils`**: For shared utility functions.
- **`src/types.ts`**: For global type definitions.

## State Management

- **Local State:** Use `useState` for component-level state.
- **Feature State:** Use `useContext` for state shared within a feature.
- **Server State:** Use `react-firebase-hooks` for interacting with Firebase.

## Styling

- Use Tailwind CSS for all styling.
- Avoid writing custom CSS files unless absolutely necessary.

## Testing

- Write unit and integration tests for all new features.
- Use Vitest for running tests and React Testing Library for testing components.
- Ensure all tests are passing before committing code.
