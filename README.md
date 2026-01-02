# NewStream

NewStream is a real-time video conferencing and streaming application built with Next.js 16 and WebRTC. It features a distinctive comic-book inspired interface and supports multi-user video rooms, screen sharing, and real-time member management.

## Features

- **Real-time Communication**: Low-latency video and audio streaming using WebRTC.
- **Screen Sharing**: Share your screen with other participants in the room.
- **Room System**: Create or join specific rooms with unique IDs.
- **Interactive UI**: Custom comic-book themed interface with dark/light mode support.
- **Member Management**: Real-time tracking of room participants.
- **Authentication**: User accounts and authentication support.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, Tailwind CSS 4
- **Real-time**: Socket.io, WebRTC
- **Styling**: Custom Tailwind configuration with CSS variables for theming

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd newstream
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Main application source (Next.js App Router).
  - `api/` - API routes, including the Socket.io server entry point.
  - `components/` - React components for UI, rooms, and streaming.
  - `hooks/` - Custom hooks for WebRTC, media streams, and state management.
  - `lib/` - Utility libraries for Socket.io and WebRTC configuration.
  - `context/` - Global state providers (Auth, etc.).

## Configuration

The application uses a custom Socket.io server integrated into the Next.js API routes. WebRTC configuration (STUN servers) can be found in `app/lib/config.js`.

## License

[MIT](LICENSE)
