# NotaChess Game

This project is a React application using Vite as the build tool and WebSocket for real-time communication. It includes proxy configuration to handle WebSocket and API requests during development.

## Getting Started

### Prerequisites

- Node.js (>=14.x)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/0xPriyanshuJha/PriyanshuJha21BAI10239
cd PriyanshuJha21BAI10239
```    
2. Install Dependencies
```bash
npm install
```

3. Vite Proxy Configuration
To avoid CORS issues during development, the Vite server is configured to proxy API and WebSocket requests to the backend server.

API Requests: Requests to /api are proxied to http://localhost:3000.
WebSocket Requests: Requests to /socket.io are proxied to http://localhost:3000 with WebSocket support enabled.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
```bash
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // API server URL
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000', // WebSocket server URL
        changeOrigin: true,
        ws: true, // This option is necessary for WebSocket support
      },
    },
  },
});
```
4. Using Middleware: You can use the cors middleware package to handle CORS:
```bash
npm install cors
```

5. Run the Application
```bash
npm run dev
 ```
6. Run the server
```bash
node server.js
```


### Key Points:
- **Prerequisites**: List of requirements.
- **Installation**: Steps to set up the project.
- **Configuration**: How to configure Vite for proxying.
- **Running the Application**: Commands to start the development server.
- **License and Acknowledgements**: Licensing information and credits.

