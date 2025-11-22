/**
 * Classifies an error into a category for UI handling.
 *
 * @param {Error|Object} err - The error object
 * @returns {string} Error category: "network", "unauth", "forbidden", "generic"
 */
export function classifyError(err) {
  if (err instanceof TypeError || err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
    return "network";
  }

  const status = err?.response?.status || err?.status;

  if (status === 401) return "unauth";
  if (status === 403) return "forbidden";

  return "generic";
}

/**
 * Returns a user-friendly message based on the error category.
 *
 * @param {string} category - Error category
 * @returns {string} User-friendly message
 */
export function getErrorMessage(category) {
  switch (category) {
    case "network":
      return "Falha de comunicação com servidor.";
    case "unauth":
      return "Sessão expirada, faça login novamente.";
    case "forbidden":
      return "Acesso não autorizado.";
    case "generic":
    default:
      return "Erro inesperado.";
  }
}
