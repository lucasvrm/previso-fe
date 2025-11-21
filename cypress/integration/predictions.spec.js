/**
 * E2E Tests for Predictions Feature
 * Tests the predictions grid, window selector, and API integration
 */
describe('Predictions Integration Tests', () => {
  const TEST_USER_ID = 'test-user-123';
  const API_URL = Cypress.env('API_URL') || 'https://bipolar-engine.onrender.com';

  beforeEach(() => {
    // Visit the app home page
    cy.visit('/');
  });

  describe('Initial State', () => {
    it('should load predictions with 3-day window by default', () => {
      // Intercept the initial predictions API call for 3 days
      cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*window_days=3*`, {
        fixture: 'predictions-3days.json'
      }).as('getPredictions3Days');

      // Set up user session
      cy.window().then((win) => {
        win.sessionStorage.setItem('userId', TEST_USER_ID);
      });

      // Navigate to dashboard/predictions page
      cy.visit('/dashboard');

      // Wait for API call to complete
      cy.wait('@getPredictions3Days');

      // Verify initial state: 5 prediction cards are rendered
      cy.get('[role="group"]').should('have.length', 5);

      // Verify the window selector shows "3 dias" as selected
      cy.get('select#window-select').should('have.value', '3');

      // Verify predictions are displayed with correct percentages from 3-day window
      cy.contains('65% de probabilidade').should('be.visible');
      cy.contains('42% de probabilidade').should('be.visible');
      cy.contains('15% de probabilidade').should('be.visible');
      cy.contains('30% de probabilidade').should('be.visible');
      cy.contains('55% de probabilidade').should('be.visible');
    });

    it('should display all 5 prediction types', () => {
      cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*window_days=3*`, {
        fixture: 'predictions-3days.json'
      }).as('getPredictions');

      cy.window().then((win) => {
        win.sessionStorage.setItem('userId', TEST_USER_ID);
      });

      cy.visit('/dashboard');
      cy.wait('@getPredictions');

      // Verify all prediction types are displayed
      cy.contains('Estado de Humor').should('be.visible');
      cy.contains('Risco de Recaída').should('be.visible');
      cy.contains('Risco de Suicidalidade').should('be.visible');
      cy.contains('Risco de Não-Adesão à Medicação').should('be.visible');
      cy.contains('Risco de Distúrbios do Sono').should('be.visible');
    });

    it('should show sensitive warning for suicidality prediction', () => {
      cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*`, {
        fixture: 'predictions-3days.json'
      }).as('getPredictions');

      cy.window().then((win) => {
        win.sessionStorage.setItem('userId', TEST_USER_ID);
      });

      cy.visit('/dashboard');
      cy.wait('@getPredictions');

      // Find the suicidality card and verify sensitive warning
      cy.contains('Risco de Suicidalidade').parents('.bg-white').within(() => {
        cy.get('[data-testid="sensitive-warning"]').should('exist');
        cy.contains('Atenção:').should('be.visible');
        cy.contains('CVV').should('be.visible');
      });
    });
  });

  describe('Window Selector Change', () => {
    it('should re-fetch predictions when changing from 3 to 7 days', () => {
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

      // Verify initial state with 3-day predictions
      cy.contains('65% de probabilidade').should('be.visible');
      cy.contains('42% de probabilidade').should('be.visible');

      // Change window selector to 7 days
      cy.get('select#window-select').select('7 dias');

      // Wait for new API call with 7-day window
      cy.wait('@getPredictions7Days');

      // Verify that predictions updated to 7-day values
      cy.contains('72% de probabilidade').should('be.visible');
      cy.contains('58% de probabilidade').should('be.visible');

      // Verify that old 3-day values are no longer displayed
      cy.contains('65% de probabilidade').should('not.exist');
      cy.contains('42% de probabilidade').should('not.exist');
    });

    it('should re-fetch predictions when changing from 7 to 3 days', () => {
      // Set initial state to 7 days
      cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*window_days=7*`, {
        fixture: 'predictions-7days.json'
      }).as('getPredictions7Days');

      cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*window_days=3*`, {
        fixture: 'predictions-3days.json'
      }).as('getPredictions3Days');

      cy.window().then((win) => {
        win.sessionStorage.setItem('userId', TEST_USER_ID);
      });

      // Visit with 7-day window parameter
      cy.visit('/dashboard?window_days=7');
      cy.wait('@getPredictions7Days');

      // Verify 7-day predictions are loaded
      cy.contains('72% de probabilidade').should('be.visible');

      // Change window selector back to 3 days
      cy.get('select#window-select').select('3 dias');

      // Wait for 3-day predictions
      cy.wait('@getPredictions3Days');

      // Verify predictions changed back to 3-day values
      cy.contains('65% de probabilidade').should('be.visible');
      cy.contains('42% de probabilidade').should('be.visible');

      // Verify 7-day values are gone
      cy.contains('72% de probabilidade').should('not.exist');
      cy.contains('58% de probabilidade').should('not.exist');
    });

    it('should maintain API intercept stubs when switching between windows', () => {
      // Stub both 3-day and 7-day responses
      cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*window_days=3*`, {
        fixture: 'predictions-3days.json'
      }).as('getPredictions3Days');

      cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*window_days=7*`, {
        fixture: 'predictions-7days.json'
      }).as('getPredictions7Days');

      cy.window().then((win) => {
        win.sessionStorage.setItem('userId', TEST_USER_ID);
      });

      cy.visit('/dashboard');
      cy.wait('@getPredictions3Days');

      // Switch to 7 days
      cy.get('select#window-select').select('7 dias');
      cy.wait('@getPredictions7Days');

      // Switch back to 3 days
      cy.get('select#window-select').select('3 dias');
      cy.wait('@getPredictions3Days');

      // Verify the request was made again (new intercept)
      cy.get('@getPredictions3Days.all').should('have.length', 2);
      cy.get('@getPredictions7Days.all').should('have.length', 1);
    });
  });

  describe('Progress Bar Rendering', () => {
    it('should render progress bars with correct widths for 3-day window', () => {
      cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*window_days=3*`, {
        fixture: 'predictions-3days.json'
      }).as('getPredictions');

      cy.window().then((win) => {
        win.sessionStorage.setItem('userId', TEST_USER_ID);
      });

      cy.visit('/dashboard');
      cy.wait('@getPredictions');

      // Verify progress bars have correct widths based on probability using aria-label
      // mood_state: 0.65 = 65%
      cy.get('[aria-label="Estado de Humor probability"]')
        .should('have.attr', 'aria-valuenow', '65');
      
      // relapse_risk: 0.42 = 42%
      cy.get('[aria-label="Risco de Recaída probability"]')
        .should('have.attr', 'aria-valuenow', '42');

      // suicidality_risk: 0.15 = 15%
      cy.get('[aria-label="Risco de Suicidalidade probability"]')
        .should('have.attr', 'aria-valuenow', '15');
    });

    it('should render progress bars with correct widths for 7-day window', () => {
      cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*window_days=7*`, {
        fixture: 'predictions-7days.json'
      }).as('getPredictions');

      cy.window().then((win) => {
        win.sessionStorage.setItem('userId', TEST_USER_ID);
      });

      cy.visit('/dashboard?window_days=7');
      cy.wait('@getPredictions');

      // Verify progress bars for 7-day window using aria-label
      // mood_state: 0.72 = 72%
      cy.get('[aria-label="Estado de Humor probability"]')
        .should('have.attr', 'aria-valuenow', '72');
      
      // relapse_risk: 0.58 = 58%
      cy.get('[aria-label="Risco de Recaída probability"]')
        .should('have.attr', 'aria-valuenow', '58');
    });
  });

  describe('API Response Handling', () => {
    it('should handle empty predictions response', () => {
      cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*`, {
        body: []
      }).as('getEmptyPredictions');

      cy.window().then((win) => {
        win.sessionStorage.setItem('userId', TEST_USER_ID);
      });

      cy.visit('/dashboard');
      cy.wait('@getEmptyPredictions');

      // Should still render the grid container but possibly with empty state
      cy.get('body').should('exist');
    });

    it('should handle null probability values', () => {
      cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*`, {
        body: [
          {
            type: 'mood_state',
            probability: null,
            explanation: 'Insufficient data',
            model_version: '1.0.0',
            sensitive: false
          }
        ]
      }).as('getNullPredictions');

      cy.window().then((win) => {
        win.sessionStorage.setItem('userId', TEST_USER_ID);
      });

      cy.visit('/dashboard');
      cy.wait('@getNullPredictions');

      // Should display "Sem dados suficientes" message
      cy.contains('Sem dados suficientes').should('be.visible');
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
      }).as('getOverPredictions');

      cy.window().then((win) => {
        win.sessionStorage.setItem('userId', TEST_USER_ID);
      });

      cy.visit('/dashboard');
      cy.wait('@getOverPredictions');

      // Should display clamped value
      cy.contains('100% de probabilidade').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on progress bars', () => {
      cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*`, {
        fixture: 'predictions-3days.json'
      }).as('getPredictions');

      cy.window().then((win) => {
        win.sessionStorage.setItem('userId', TEST_USER_ID);
      });

      cy.visit('/dashboard');
      cy.wait('@getPredictions');

      // Check for progressbar role
      cy.get('[role="progressbar"]').should('have.length.at.least', 1);

      // Verify ARIA attributes
      cy.get('[role="progressbar"]').first().should('have.attr', 'aria-valuenow');
      cy.get('[role="progressbar"]').first().should('have.attr', 'aria-valuemin', '0');
      cy.get('[role="progressbar"]').first().should('have.attr', 'aria-valuemax', '100');
    });

    it('should have descriptive labels for sensitive content', () => {
      cy.intercept('GET', `${API_URL}/data/predictions/${TEST_USER_ID}*`, {
        fixture: 'predictions-3days.json'
      }).as('getPredictions');

      cy.window().then((win) => {
        win.sessionStorage.setItem('userId', TEST_USER_ID);
      });

      cy.visit('/dashboard');
      cy.wait('@getPredictions');

      // Verify alert icon has aria-label
      cy.get('[aria-label="Sensível"]').should('exist');
    });
  });
});
