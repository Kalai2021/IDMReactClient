import { useCallback, useEffect } from 'react';
import logger from '../services/logger';

export const useLogger = (componentName?: string) => {
  const logContext: Record<string, any> = {
    component: componentName,
    timestamp: new Date().toISOString()
  };

  // Component lifecycle logging
  const logComponentMount = useCallback(() => {
    if (componentName) {
      logger.logInfo('Component mounted', {
        ...logContext,
        event: 'component_mount'
      });
    }
  }, [componentName]);

  const logComponentUnmount = useCallback(() => {
    if (componentName) {
      logger.logInfo('Component unmounted', {
        ...logContext,
        event: 'component_unmount'
      });
    }
  }, [componentName]);

  // User interaction logging
  const logUserInteraction = useCallback((action: string, details: Record<string, any> = {}) => {
    logger.logInfo('User interaction', {
      ...logContext,
      event: 'user_interaction',
      action,
      ...details
    });
  }, []);

  const logFormSubmission = useCallback((formName: string, details: Record<string, any> = {}) => {
    logger.logInfo('Form submission', {
      ...logContext,
      event: 'form_submission',
      formName,
      ...details
    });
  }, []);

  const logNavigation = useCallback((from: string, to: string, details: Record<string, any> = {}) => {
    logger.logInfo('Navigation', {
      ...logContext,
      event: 'navigation',
      from,
      to,
      ...details
    });
  }, []);

  // Error logging
  const logError = useCallback((message: string, error?: Error | null, additionalContext?: Record<string, any>) => {
    const errorContext = {
      ...logContext,
      ...additionalContext
    };
    logger.logError(message, error || null, errorContext);
  }, []);

  // Auto-log component mount/unmount
  useEffect(() => {
    logComponentMount();
    return () => {
      logComponentUnmount();
    };
  }, [logComponentMount, logComponentUnmount]);

  return {
    // Main logger methods
    logInfo: logger.logInfo.bind(logger),
    logError,
    logWarn: logger.logWarn.bind(logger),
    logDebug: logger.logDebug.bind(logger),
    
    // React-specific methods
    logComponentMount,
    logComponentUnmount,
    logUserInteraction,
    logFormSubmission,
    logNavigation,
    
    // Performance and analytics
    logPageView: logger.pageView.bind(logger),
    logPerformance: logger.performance.bind(logger),
    logApiCall: logger.apiCall.bind(logger)
  };
}; 