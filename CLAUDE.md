# SMITE 2 Pick/Ban Simulator - Memory Bank

## Project Overview
A SMITE 2 pick/ban drafting simulator built in React/TypeScript that allows players to practice draft strategies both locally and with friends online. The application simulates the competitive pick/ban phase of SMITE 2 matches.

## Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4.1
- **Backend/Database**: Firebase (Firestore, Auth, Realtime Database)
- **Routing**: React Router Dom v7.6
- **State Management**: React Context API + custom hooks
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint with TypeScript support

## Key Features
1. **Local Single-Player Draft**: Practice mode controlling both teams
2. **Online Multiplayer Draft**: Real-time drafting with friends via Firebase
3. **Character Management**: Complete SMITE 2 god roster with images and roles
4. **Draft Modes**: Standard (structured pick/ban order) and Freedom (flexible) modes
5. **Theme Support**: Light/dark mode toggle
6. **Audio Integration**: Character voice lines and sound effects
7. **Friends System**: Add friends, create lobbies, join drafts
8. **User Authentication**: Firebase Auth with user profiles

## Project Structure

### Core Architecture
- **Feature-based organization**: Each feature is self-contained in `/src/features/`
- **Shared utilities**: Constants, types, and utilities in `/src/constants/`, `/src/utils/`, `/src/types.ts`

### Key Directories
```
src/
├── features/
│   ├── auth/           # User authentication & profiles
│   ├── draft/          # Core drafting functionality
│   ├── friends/        # Friend management system
│   ├── landing/        # Main landing page
│   ├── layout/         # Theme, audio, headers
│   ├── lobby/          # Draft lobby management
│   ├── profile/        # User profile management
│   └── teams/          # Team display components
├── constants/
│   ├── gods.ts         # Complete SMITE 2 god roster (70+ characters)
│   └── roles.ts        # Game role definitions
├── utils/              # Shared utility functions
└── types.ts           # Global TypeScript interfaces
```

## Key Components & Architecture

### Draft System
- **DraftContext** (`src/features/draft/context/DraftContext.tsx`): Main state management
- **useDraft**: Local draft logic
- **useFirestoreDraft**: Real-time multiplayer draft logic
- **Draft Types**: Standard (structured pick/ban order) vs Freedom (flexible)

### State Management Pattern
- Context API for feature-level state
- Custom hooks for data fetching and business logic
- react-firebase-hooks for Firebase integration

### Firebase Integration
- **Firestore**: Draft data, user profiles, friend relationships
- **Auth**: User authentication
- **Realtime Database**: Presence tracking during drafts

## Character Data
- 70+ SMITE 2 gods with images, roles, and voice lines
- Stored in `src/constants/gods.ts`
- Each character has: id, name, image URL, roles array, position data
- Roles include: Carry, Mid, Solo, Jungle, Support

## Routing Structure
```
/ - Landing page
/local - Single player draft
/draft/:draftId - Real-time multiplayer draft
/lobby/:draftId - Draft lobby (pre-draft)
/login, /signup - Authentication
/profile - User profile management
/final-teams - Final team composition display
```

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run test` - Run tests
- `npm run lint` - Lint code

## Key Files to Know
- `src/App.tsx` - Main app component with routing
- `src/types.ts` - Core TypeScript interfaces (Character, Draft, Player, etc.)
- `src/constants/gods.ts` - Complete character roster
- `src/features/draft/context/DraftContext.tsx` - Draft state management
- `src/firebase.ts` - Firebase configuration and initialization
- `GEMINI.md` - Development guidelines and conventions

## Firebase Configuration
- Project: smite2pbsimulator
- Uses Firestore for persistent data
- Realtime Database for presence tracking
- Authentication for user management

## Recent Development Focus
Based on git history:
- Improved light/dark theme consistency
- Enhanced final teams display with rectangular images
- Added "return to draft" functionality
- Category separation on draft page
- Mobile-responsive improvements

## Testing
- Unit tests in `/src/test/`
- Focus on draft logic (`useDraft.test.ts`)
- Uses Vitest + React Testing Library

## Styling Approach
- Tailwind CSS for all styling
- Theme-based color schemes
- Responsive design patterns
- Background images for light/dark themes