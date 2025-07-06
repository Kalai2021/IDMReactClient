import { useCallback, useEffect } from 'react';
import logger, { Logger } from '../services/logger';

export const useLogger = (componentName?: string) => {
  // Create a logger with component context
  const componentLogger = componentName 
    ? logger.withAttrs({ component: componentName })
    : logger;

  const logContext: Record<string, any> = {
    timestamp: new Date().toISOString()
  };

  // Component lifecycle logging
  const logComponentMount = useCallback(() => {
    if (componentName) {
      componentLogger.info('Component mounted', {
        ...logContext,
        event: 'component_mount'
      });
    }
  }, [componentName, componentLogger]);

  const logComponentUnmount = useCallback(() => {
    if (componentName) {
      componentLogger.info('Component unmounted', {
        ...logContext,
        event: 'component_unmount'
      });
    }
  }, [componentName, componentLogger]);

  // User interaction logging
  const logUserInteraction = useCallback((action: string, details: Record<string, any> = {}) => {
    componentLogger.info('User interaction', {
      ...logContext,
      event: 'user_interaction',
      action,
      ...details
    });
  }, [componentLogger]);

  const logFormSubmission = useCallback((formName: string, details: Record<string, any> = {}) => {
    componentLogger.info('Form submission', {
      ...logContext,
      event: 'form_submission',
      formName,
      ...details
    });
  }, [componentLogger]);

  const logNavigation = useCallback((from: string, to: string, details: Record<string, any> = {}) => {
    componentLogger.info('Navigation', {
      ...logContext,
      event: 'navigation',
      from,
      to,
      ...details
    });
  }, [componentLogger]);

  // Error logging
  const logError = useCallback((message: string, error?: Error | null, additionalContext?: Record<string, any>) => {
    const errorContext = {
      ...logContext,
      ...additionalContext
    };
    componentLogger.error(message, error || null, errorContext);
  }, [componentLogger]);

  // Auto-log component mount/unmount
  useEffect(() => {
    logComponentMount();
    return () => {
      logComponentUnmount();
    };
  }, [logComponentMount, logComponentUnmount]);

  return {
    // Main logger methods
    info: componentLogger.info.bind(componentLogger),
    error: logError,
    warn: componentLogger.warn.bind(componentLogger),
    debug: componentLogger.debug.bind(componentLogger),
    userAction: componentLogger.userAction.bind(componentLogger),
    
    // React-specific methods
    logComponentMount,
    logComponentUnmount,
    logUserInteraction,
    logFormSubmission,
    logNavigation,
    
    // Performance and analytics
    logPageView: componentLogger.pageView.bind(componentLogger),
    logPerformance: componentLogger.performance.bind(componentLogger),
    logApiCall: componentLogger.apiCall.bind(componentLogger),
    
    // Get logger with additional attributes
    withAttrs: componentLogger.withAttrs.bind(componentLogger)
  };
}; 