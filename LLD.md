# Low-Level Design (LLD): TripCircle

## 1. Component Architecture
TripCircle organizes its React application into smart `pages` and presentation `components`.

### Key Components
- **`App.jsx`**: Root component. Manages global router (`BrowserRouter`) and initializes global Firebase Auth state listeners.
- **`TripAssistant.jsx`**: The floating AI widget. Manages conversation history state, handles Gemini API network requests, and renders markdown responses.
- **`TripWizard.jsx`**: A controlled multi-step form for trip creation. Manages complex local state for Dates, Budgets, and Geocoding resolution before committing to Firestore.

## 2. Database Schema (Cloud Firestore)

Firestore is a NoSQL document database. Data is aggressively denormalized to optimize for rapid read performance.

### `users` Collection
- `uid` (String, PK)
- `name` (String)
- `email` (String)
- `avatar` (String)
- `lastSeen` (Timestamp)

### `trips` Collection
- `id` (String, PK auto-generated)
- `name` (String)
- `location` (String)
- `coordinates` (Map: `{ lat: Number, lng: Number }`)
- `budget` (Number)
- `creatorId` (String, FK -> users)
- `members` (Array of Strings [uid]) - *Used for ACL and filtering.*
- `tags` (Array of Strings)
- `createdAt` (Timestamp)

### `chats` Collection
- `id` (String, PK auto-generated)
- `tripId` (String, FK -> trips)
- `participantIds` (Array of Strings [uid]) - *Security Rules enforce access based on this array.*
- `participantsData` (Map: `{ uid: { name, avatar } }`) - *Denormalized to prevent N+1 queries when rendering inbox lists.*
- `updatedAt` (Timestamp)

### `messages` (Subcollection of `chats`)
- `id` (String, PK auto-generated)
- `text` (String)
- `senderId` (String)
- `createdAt` (Timestamp)

## 3. Core Services

### `chatService.js`
Abstracts Firestore logic away from React components.
- `createTripGroupChat(tripId, tripName, creatorData)`: Batches a write to create a `chats` document and initializes the `participantsData` map.
- `sendMessage(chatId, senderData, text)`: Writes to the `messages` subcollection and simultaneously updates the parent chat's `updatedAt` timestamp for sorting.

### `geocode.js`
Abstracts external API calls.
- `geocodeLocation(locationString)`: Fetches data from `nominatim.openstreetmap.org`. Implements a manual debounce/rate-limit wrapper to respect OpenStreetMap's 1-request-per-second API policy.

## 4. AI LLM Integration (Gemini)

The LLM logic is encapsulated within the `TripAssistant` component.

### Prompt Injection Logic
When a user asks for an itinerary, the application silently prefixes the prompt with context:
```javascript
const systemContext = `You are a professional travel agent. 
The user is traveling to ${trip.location} with a budget of $${trip.budget}.
Please provide a day-by-day itinerary formatted exactly as markdown bullet points.`;

const response = await model.generateContent(systemContext + "\n\n" + userInput);
```
This ensures the LLM adheres to structured output requirements without relying on the user to write complex prompts.

## 5. Security Rules Implementation
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // TRIPS: Anyone can read. Only auth users can create. Only owners can delete.
    match /trips/{tripId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null; 
      allow delete: if request.auth.uid == resource.data.creatorId;
    }

    // CHATS: Strictly restricted to array inclusion.
    match /chats/{chatId} {
      allow read, update: if request.auth.uid in resource.data.participantIds;
      
      match /messages/{messageId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participantIds;
      }
    }
  }
}
```
