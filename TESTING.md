# Testing Guide for Previso Frontend

This document describes how to run and write tests for the Previso frontend application.

## Test Structure

We use three types of tests:
- **Unit Tests**: Jest + React Testing Library for testing utilities and components
- **E2E Tests**: Cypress for end-to-end testing of user workflows
- **Linting**: ESLint for code quality

## Running Tests

### Unit Tests

Run all unit tests:
```bash
npm test
```

Run tests in watch mode (for development):
```bash
npm run test:watch
```

Run tests with coverage report:
```bash
npm run test:coverage
```

### E2E Tests

Start the dev server (in one terminal):
```bash
npm run dev
```

Run Cypress tests (in another terminal):
```bash
# Interactive mode (recommended for development)
npm run cypress:open

# Headless mode (for CI)
npm run cypress:run
```

### Linting

Run ESLint:
```bash
npm run lint
```

## Test Files

### Unit Tests
- `tests/utils/probability.test.js` - Tests for probability utilities
- `tests/components/ProgressBar.test.js` - Tests for ProgressBar component
- `tests/components/PredictionCard.test.js` - Tests for PredictionCard component

### E2E Tests
- `cypress/e2e/predictions.cy.js` - E2E tests for predictions grid

### Test Fixtures
- `cypress/fixtures/predictions-3days.json` - Mock API response for 3-day predictions
- `cypress/fixtures/predictions-7days.json` - Mock API response for 7-day predictions

## Writing Tests

### Unit Tests

Unit tests should be placed in `tests/` directory, mirroring the `src/` structure.

Example:
```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from '../../src/components/MyComponent';

describe('MyComponent', () => {
  test('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Tests

E2E tests should be placed in `cypress/e2e/` directory.

Example:
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should do something', () => {
    cy.get('[data-testid="button"]').click();
    cy.contains('Expected Text').should('be.visible');
  });
});
```

## Test Coverage

Current test coverage:
- ✅ Probability utilities: 100% (16 tests)
- ✅ ProgressBar component: 100% (11 tests)
- ✅ PredictionCard component: 100% (6 tests)
- ✅ E2E predictions workflow: Covered

## CI/CD

Tests are automatically run in CI when:
- Pull requests are opened or updated
- Code is pushed to main branch

All tests must pass before merging.

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Testing Library Queries**: Prefer `getByRole` and `getByText` over `getByTestId`
3. **Mock External Dependencies**: Use fixtures for API responses
4. **Keep Tests Independent**: Each test should be able to run in isolation
5. **Don't Test Third-Party Libraries**: Trust that libraries like React work correctly

## Troubleshooting

### Tests fail with "Cannot find module"
- Run `npm install` to ensure all dependencies are installed
- Check that import paths are correct

### Cypress tests fail to start
- Ensure dev server is running on port 5173
- Check that `baseUrl` in `cypress.config.js` matches your dev server URL

### Snapshot tests fail
- Review the snapshot changes with `npm test -- -u` to update if changes are intentional
- Snapshots are stored in `tests/components/__snapshots__/`

## Security Testing

### What We Check
- No hardcoded service keys or secrets in code
- Sensitive data is not logged in production
- API calls don't expose authentication tokens
- Environment variables are properly used

### How to Verify
```bash
# Scan for hardcoded secrets
grep -r "SERVICE.*KEY\|service.*role" src/ --include="*.js" --include="*.jsx"

# Should return no results (or only import.meta.env references)
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
