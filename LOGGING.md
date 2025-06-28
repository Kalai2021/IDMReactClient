# Fluentd Logging Integration

This document describes the Fluentd logging integration for the IDM React Client application.

## Overview

The application uses Fluentd for centralized logging with the following features:

- **Structured Logging**: All logs are structured JSON with consistent fields
- **Batch Processing**: Logs are batched for performance and sent to Fluentd
- **Multiple Destinations**: Logs are stored in files and Elasticsearch
- **Real-time Monitoring**: Kibana provides real-time log visualization
- **Error Tracking**: Comprehensive error logging with stack traces
- **Performance Monitoring**: API call timing and user interaction tracking

## Architecture

```
React App → Fluentd → Elasticsearch → Kibana
                ↓
            File Storage
```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

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

### Docker Compose

The `docker-compose.yml` file includes:

- **Fluentd**: Log aggregation service
- **Elasticsearch**: Log storage and search
- **Kibana**: Log visualization dashboard

## Log Structure

All logs follow this structure:

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

## Log Levels

- **ERROR**: Application errors, API failures, authentication issues
- **WARN**: Warning conditions, deprecated features
- **INFO**: General information, user actions, page views
- **DEBUG**: Detailed debugging information

## Log Categories

### Authentication Logs
- User login/logout events
- Authentication state changes
- Token refresh operations
- Session management

### API Logs
- All API requests and responses
- Request timing and performance
- Error responses and retries
- Authentication headers

### User Interaction Logs
- Button clicks and form submissions
- Page navigation
- Component lifecycle events
- User preferences

### Performance Logs
- Page load times
- API response times
- Component render times
- Memory usage

## Usage Examples

### Basic Logging

```typescript
import logger from '../services/logger';

// Info logging
await logger.logInfo('User logged in', {
  userId: 'user123',
  email: 'user@example.com'
});

// Error logging
try {
  // Some operation
} catch (error) {
  await logger.logError('Operation failed', error, {
    operation: 'create_user',
    userId: 'user123'
  });
}
```

### Using the useLogger Hook

```typescript
import { useLogger } from '../hooks/useLogger';

const MyComponent = () => {
  const logger = useLogger();

  const handleClick = () => {
    logger.logUserInteraction('button_clicked', {
      buttonId: 'submit',
      page: 'dashboard'
    });
  };

  return <button onClick={handleClick}>Submit</button>;
};
```

### API Call Logging

The API service automatically logs all requests and responses:

```typescript
// This is automatically logged
const users = await apiService.getUsers();
```

## Monitoring and Visualization

### Kibana Dashboard

Access Kibana at `http://localhost:5601` to view logs:

1. **Discover**: Search and filter logs
2. **Visualize**: Create charts and graphs
3. **Dashboard**: Build custom dashboards
4. **Management**: Configure indices and settings

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

// API calls with response time > 1000ms
{
  "query": {
    "bool": {
      "must": [
        { "match": { "message": "API Response" } },
        { "range": { "fields.duration": { "gt": 1000 } } }
      ]
    }
  }
}
```

## File Storage

Logs are stored in the following locations:

- **Error logs**: `/var/log/fluentd/error/`
- **Warning logs**: `/var/log/fluentd/warn/`
- **Info logs**: `/var/log/fluentd/info/`
- **Debug logs**: `/var/log/fluentd/debug/`

## Performance Considerations

- **Batch Processing**: Logs are batched (10 logs per batch) for performance
- **Async Logging**: All logging operations are asynchronous
- **Fallback**: Console logging is used if Fluentd is unavailable
- **Timeout**: Log requests timeout after 3 seconds

## Troubleshooting

### Fluentd Not Receiving Logs

1. Check if Fluentd is running: `docker-compose ps fluentd`
2. Verify endpoint configuration: `REACT_APP_FLUENT_ENDPOINT`
3. Check network connectivity between containers
4. Review Fluentd logs: `docker-compose logs fluentd`

### Elasticsearch Connection Issues

1. Check Elasticsearch status: `curl http://localhost:9200/_cluster/health`
2. Verify indices are created: `curl http://localhost:9200/_cat/indices`
3. Check Elasticsearch logs: `docker-compose logs elasticsearch`

### High Memory Usage

1. Reduce batch size in logger configuration
2. Increase flush interval
3. Monitor Elasticsearch memory settings
4. Consider log rotation and retention policies

## Security Considerations

- **Sensitive Data**: Never log passwords, tokens, or PII
- **Network Security**: Use HTTPS for production Fluentd endpoints
- **Access Control**: Restrict access to Kibana and Elasticsearch
- **Data Retention**: Implement log retention policies

## Production Deployment

For production deployment:

1. **Use HTTPS**: Configure SSL/TLS for all services
2. **Authentication**: Enable Elasticsearch security features
3. **Monitoring**: Set up alerts for error rates and performance
4. **Backup**: Implement log backup and recovery procedures 