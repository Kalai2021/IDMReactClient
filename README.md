# IDM React Client

A React application that demonstrates OIDC PKCE authentication flow with the IDMApp-go backend.

## Features

- **OIDC PKCE Authentication**: Secure authentication using PKCE flow
- **Protected Routes**: Routes that require authentication
- **User Management**: View users from the backend
- **Token Management**: Automatic token handling and refresh
- **Modern UI**: Clean, responsive interface using Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- IDMApp-go backend running on `http://localhost:8090`
- PostgreSQL database with the required schema

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Configuration

The React client is configured to work with the IDMApp-go backend:

- **Backend URL**: `http://localhost:8090`
- **Client ID**: `react-app`
- **Redirect URI**: `http://localhost:3000/callback`

## Authentication Flow

1. **Login**: User clicks "Sign in with OIDC" button
2. **Redirect**: User is redirected to the backend's login page
3. **Authentication**: User authenticates with the backend
4. **Callback**: User is redirected back to the React app with an authorization code
5. **Token Exchange**: The app exchanges the code for an access token
6. **Dashboard**: User is redirected to the protected dashboard

## API Integration

The React client includes an API service that automatically:
- Adds authentication headers to requests
- Handles token refresh
- Redirects to login on authentication errors

## Available Scripts

- `npm start`: Start the development server
- `npm run build`: Build the app for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

## Project Structure

```
src/
├── components/          # React components
│   ├── Login.tsx       # Login page
│   ├── Callback.tsx    # OIDC callback handler
│   ├── Dashboard.tsx   # Protected dashboard
│   └── ProtectedRoute.tsx # Route protection
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── services/           # API services
│   ├── authService.ts  # OIDC authentication
│   └── apiService.ts   # Backend API calls
└── App.tsx            # Main application component
```

## Troubleshooting

### Common Issues

1. **"redirect_uri is not registered"**: Make sure the client is configured in the backend database
2. **"User not found"**: Ensure the user exists in the backend database
3. **CORS errors**: Verify the backend allows requests from `http://localhost:3000`

### Backend Requirements

The IDMApp-go backend must have:
- A client record with `client_id = "react-app"`
- Redirect URIs including `http://localhost:3000/callback`
- Users in the database for authentication
- CORS configured to allow requests from the React app

## Security Notes

- The app uses PKCE (Proof Key for Code Exchange) for enhanced security
- Access tokens are automatically managed and refreshed
- Sensitive data is not stored in localStorage
- All API calls include proper authentication headers

## Pushing to GitHub

To push this project to GitHub:

1. Initialize a git repository (if you haven't already):
   ```bash
   git init
   ```
2. Add all files and commit:
   ```bash
   git add .
   git commit -m "Initial commit"
   ```
3. Create a new repository on GitHub (via the website or CLI).
4. Add the remote (replace `<your-username>` and `<repo-name>`):
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   ```
5. Push your code:
   ```bash
   git push -u origin main
   ```

If your default branch is `master`, use `master` instead of `main` in the last command.

---

Now your project is versioned and available on GitHub for collaboration or deployment.
