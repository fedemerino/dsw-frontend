import { toast } from 'sonner';

/**
 * Shows a toast notification when user needs to be authenticated
 * @param {string} action - The action that requires authentication (e.g., "agregar favoritos", "hacer una reserva")
 * @param {Function} onLoginClick - Optional callback when user clicks on "Iniciar sesión"
 */
export const showAuthRequiredToast = (action = 'realizar esta acción', onLoginClick) => {
  toast('Inicia sesión para continuar', {
    description: `Necesitas una cuenta para ${action}`,
    action: onLoginClick ? {
      label: 'Iniciar sesión',
      onClick: onLoginClick,
    } : undefined,
    duration: 4000,
    icon: '🔒',
  });
};

/**
 * Executes an action only if user is authenticated, otherwise shows a toast
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @param {Function} action - The action to execute if authenticated
 * @param {string} actionName - Name of the action for the toast message
 * @param {Function} onLoginClick - Optional callback when user clicks on "Iniciar sesión"
 * @returns {boolean} Whether the action was executed
 */
export const requireAuth = (isAuthenticated, action, actionName, onLoginClick) => {
  if (!isAuthenticated) {
    showAuthRequiredToast(actionName, onLoginClick);
    return false;
  }
  
  action();
  return true;
};

