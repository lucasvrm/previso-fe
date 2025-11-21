// Custom Cypress commands
Cypress.Commands.add('login', (userId) => {
  // Mock login - store user ID in session storage
  window.sessionStorage.setItem('userId', userId);
});
