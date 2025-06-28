# IDM React Client

A React-based Identity Management System client with centralized logging using Fluentd, Elasticsearch, and Kibana.

## Features

- **User Management** - Create, update, delete, and manage user accounts
- **Group Management** - Organize users into groups and manage group policies
- **Organization Management** - Manage organizational structure and hierarchy
- **Role Management** - Define and assign roles and permissions
- **Centralized Logging** - Comprehensive logging with Fluentd, Elasticsearch, and Kibana
- **Real-time Monitoring** - Monitor application performance and user interactions
- **Error Tracking** - Automatic error capture and reporting

## Architecture

```
React App → Fluentd → Elasticsearch → Kibana
                ↓
            File Storage
```

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd IDMReactClient
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8080
REACT_APP_CALLBACK_URL=http://localhost:3000/callback

# Fluentd Logging Configuration
REACT_APP_FLUENT_ENDPOINT=http://localhost:24224
REACT_APP_LOGGING_ENABLED=true

# Environment
NODE_ENV=development
```

### 4. Start the Application

#### Option A: Development Mode (with logging infrastructure)
```bash
# Start all services including logging
docker-compose up -d

# Start React development server
npm start
```

#### Option B: Development Mode (without logging)
```bash
# Set logging to disabled in .env
REACT_APP_LOGGING_ENABLED=false

# Start React development server
npm start
```

### 5. Access the Application

- **React App**: http://localhost:3000
- **Kibana Dashboard**: http://localhost:5601
- **Elasticsearch**: http://localhost:9200
- **Backend API**: http://localhost:8080

## Project Structure

```
IDMReactClient/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Login.tsx
│   │   ├── UserManagement.tsx
│   │   ├── GroupManagement.tsx
│   │   ├── OrganizationManagement.tsx
│   │   └── RoleManagement.tsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useLogger.ts
│   ├── services/           # API and utility services
│   │   ├── apiService.ts
│   │   ├── authService.ts
│   │   ├── customAuthService.ts
│   │   └── logger.ts
│   └── App.tsx
├── fluentd.conf            # Fluentd configuration
├── docker-compose.yml      # Docker services configuration
├── LOGGING.md              # Detailed logging documentation
└── README.md
```

## Logging Integration

The application includes comprehensive logging with the following features:

### Log Categories
- **Authentication** - Login/logout events, token refresh
- **API Calls** - Request/response logging with timing
- **User Interactions** - Button clicks, form submissions, navigation
- **Component Lifecycle** - Mount/unmount events
- **Performance** - Page load times, API response times
- **Errors** - React errors, API failures, authentication issues

### Log Structure
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "message": "User action performed",
  "service": "idmreactclient-frontend",
  "environment": "development",
  "fields": {
    "userId": "user123",
    "action": "button_click",
    "page": "dashboard"
  }
}
```

### Using Logging in Components

```typescript
import { useLogger } from '../hooks/useLogger';

const MyComponent = () => {
  const logger = useLogger('MyComponent');

  const handleClick = () => {
    logger.logUserInteraction('button_clicked', {
      buttonId: 'submit',
      page: 'dashboard'
    });
  };

  return <button onClick={handleClick}>Submit</button>;
};
```

For detailed logging documentation, see [LOGGING.md](LOGGING.md).

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

## Docker Services

The `docker-compose.yml` includes:

- **idm-backend** - Go backend API
- **postgres** - Database
- **idm-react-client** - React frontend
- **fluentd** - Log aggregation
- **elasticsearch** - Log storage and search
- **kibana** - Log visualization

## Monitoring and Debugging

### Kibana Dashboard

Access Kibana at http://localhost:5601 to:
- Search and filter logs
- Create visualizations and dashboards
- Monitor application performance
- Track user interactions

### Sample Queries

```json
// All errors in the last hour
{
  "query": {
    "bool": {
      "must": [
        { "match": { "level": "ERROR" } },
        { "range": { "timestamp": { "gte": "now-1h" } } }
      ]
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Fluentd not receiving logs**
   - Check if Fluentd is running: `docker-compose ps fluentd`
   - Verify endpoint configuration in `.env`
   - Check Fluentd logs: `docker-compose logs fluentd`

2. **Elasticsearch connection issues**
   - Check Elasticsearch status: `curl http://localhost:9200/_cluster/health`
   - Verify indices: `curl http://localhost:9200/_cat/indices`

3. **React app not connecting to backend**
   - Ensure backend is running: `docker-compose ps idm-backend`
   - Check API URL in `.env`
   - Verify network connectivity

### Log Files

Logs are stored in:
- **Error logs**: `/var/log/fluentd/error/`
- **Info logs**: `/var/log/fluentd/info/`
- **Debug logs**: `/var/log/fluentd/debug/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the [LOGGING.md](LOGGING.md) for detailed logging information
- Review the troubleshooting section above
- Create an issue in the repository
