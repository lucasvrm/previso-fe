describe('Predictions Grid E2E Tests', () => {
  const TEST_USER_ID = 'test-user-123';
  const API_URL = Cypress.env('API_URL') || 'https://bipolar-engine.onrender.com';

  beforeEach(() => {
    // Visit the app and intercept API calls
    cy.visit('/');
  });

  it('should load predictions and display 5 cards with correct probabilities', () => {
    // Intercept the initial predictions API call for 3 days
    cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*window_days=3*`, {
      fixture: 'predictions-3days.json'
    }).as('getPredictions3Days');

    // Mock session/auth if needed
    cy.window().then((win) => {
      win.sessionStorage.setItem('userId', TEST_USER_ID);
    });

    // Navigate to predictions page (adjust route as needed)
    cy.visit('/dashboard'); // or wherever PredictionsGrid is displayed

    // Wait for API call
    cy.wait('@getPredictions3Days');

    // Verify 5 prediction cards are rendered
    cy.get('[role="group"]').should('have.length', 5);

    // Verify progress bars have correct widths
    cy.contains('Estado de Humor').parent().parent()
      .find('.progress-fill').should('have.css', 'width').and('match', /65/);
    
    cy.contains('Risco de Recaída').parent().parent()
      .find('.progress-fill').should('have.css', 'width').and('match', /42/);

    cy.contains('Risco de Suicidalidade').parent().parent()
      .find('.progress-fill').should('have.css', 'width').and('match', /15/);

    // Verify percentages are displayed
    cy.contains('65% de probabilidade').should('be.visible');
    cy.contains('42% de probabilidade').should('be.visible');
    cy.contains('15% de probabilidade').should('be.visible');
  });

  it('should display sensitive warning for suicidality prediction', () => {
    cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*`, {
      fixture: 'predictions-3days.json'
    }).as('getPredictions');

    cy.window().then((win) => {
      win.sessionStorage.setItem('userId', TEST_USER_ID);
    });

    cy.visit('/dashboard');
    cy.wait('@getPredictions');

    // Find the suicidality card
    cy.contains('Risco de Suicidalidade').parents('.bg-white').within(() => {
      // Verify sensitive warning is displayed
      cy.get('[data-testid="sensitive-warning"]').should('exist');
      cy.contains('Atenção:').should('be.visible');
      cy.contains('Se você estiver em crise').should('be.visible');
      cy.contains('CVV').should('be.visible');
      cy.contains('Ligue 188').should('be.visible');
    });
  });

  it('should re-fetch predictions when window_days selector changes', () => {
    // Intercept initial 3-day predictions
    cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*window_days=3*`, {
      fixture: 'predictions-3days.json'
    }).as('getPredictions3Days');

    // Intercept 7-day predictions
    cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*window_days=7*`, {
      fixture: 'predictions-7days.json'
    }).as('getPredictions7Days');

    cy.window().then((win) => {
      win.sessionStorage.setItem('userId', TEST_USER_ID);
    });

    cy.visit('/dashboard');
    cy.wait('@getPredictions3Days');

    // Verify initial state (3 days)
    cy.contains('65% de probabilidade').should('be.visible');

    // Change window selector to 7 days
    cy.get('select#window-select').select('7 dias');

    // Wait for new API call
    cy.wait('@getPredictions7Days');

    // Verify that predictions updated
    cy.contains('72% de probabilidade').should('be.visible');
    cy.contains('58% de probabilidade').should('be.visible');

    // Verify that old values are gone
    cy.contains('65% de probabilidade').should('not.exist');
  });

  it('should handle very small probabilities as 0%', () => {
    cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*`, {
      body: [
        {
          type: 'mood_state',
          probability: 1e-15,
          explanation: 'Very small probability',
          model_version: '1.0.0',
          sensitive: false
        }
      ]
    }).as('getPredictions');

    cy.window().then((win) => {
      win.sessionStorage.setItem('userId', TEST_USER_ID);
    });

    cy.visit('/dashboard');
    cy.wait('@getPredictions');

    // Verify 0% is displayed for very small probabilities
    cy.contains('0% de probabilidade').should('be.visible');
  });

  it('should clamp probabilities > 1 to 100%', () => {
    cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*`, {
      body: [
        {
          type: 'mood_state',
          probability: 1.5,
          explanation: 'Over 100%',
          model_version: '1.0.0',
          sensitive: false
        }
      ]
    }).as('getPredictions');

    cy.window().then((win) => {
      win.sessionStorage.setItem('userId', TEST_USER_ID);
    });

    cy.visit('/dashboard');
    cy.wait('@getPredictions');

    // Verify 100% is displayed for probabilities > 1
    cy.contains('100% de probabilidade').should('be.visible');
  });
});
