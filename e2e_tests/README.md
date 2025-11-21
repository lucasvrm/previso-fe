# E2E Testing Suite - Previso FE

## Overview

This directory contains End-to-End (E2E) tests for the Previso Frontend application using Python and Playwright.

## Test Coverage

### Implemented Test Scenarios

1. **Home Page Journey**
   - ✅ Home page loads correctly
   - ✅ Redirects to login for unauthenticated users
   - ✅ Login page elements are visible

2. **Settings Architecture (New Modular Structure)**
   - ✅ `/settings` route structure validation
   - ✅ Redirection behavior for different user roles
   - ⚠️  Admin tab navigation (requires authentication setup)

3. **Navigation Flow**
   - ✅ Login to signup navigation
   - ⚠️  Settings dashboard to data management tab (requires auth)

### Known Limitations

- **Authentication**: Current tests validate route structure but don't implement full authentication flow
- **Role-based Testing**: Admin-specific features require authenticated session setup
- Future enhancement: Add authentication helpers for complete E2E coverage

## Setup Instructions

### 1. Create Python Virtual Environment

```bash
# From the e2e_tests directory
cd e2e_tests

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

### 2. Install Dependencies

```bash
# Install Python packages
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium
```

### 3. Start the Development Server

In a separate terminal, start the Previso frontend:

```bash
# From the project root
cd /path/to/previso-fe
npm run dev
```

The dev server should start on `http://localhost:5173` (or another port - note it for the next step).

## Running Tests

### Basic Test Execution

```bash
# With default BASE_URL (http://localhost:5173)
pytest test_user_journey.py -v

# Or run directly
python test_user_journey.py
```

### Custom BASE_URL

```bash
# Against a different environment
BASE_URL=http://localhost:3000 pytest test_user_journey.py -v

# Against production/staging
BASE_URL=https://previso-staging.vercel.app pytest test_user_journey.py -v
```

### Test Options

```bash
# Run with detailed output
pytest test_user_journey.py -v --tb=long

# Run specific test
pytest test_user_journey.py::TestUserJourney::test_home_page_loads -v

# Run with HTML report
pytest test_user_journey.py --html=report.html --self-contained-html
```

### Screenshots on Failure

Playwright automatically captures screenshots on test failures. They are saved in the `test-results/` directory.

```bash
# View test results
ls -la test-results/
```

## Test Structure

```
e2e_tests/
├── test_user_journey.py    # Main test suite
├── requirements.txt         # Python dependencies
├── pytest.ini              # Pytest configuration
├── README.md               # This file
└── venv/                   # Virtual environment (created during setup)
```

## Adding New Tests

### Example: Adding a new test case

```python
def test_new_feature(self, page: Page):
    """Test: New feature works correctly"""
    page.goto(f"{BASE_URL}/new-feature")
    
    # Use data-testid for resilient selectors
    element = page.locator('[data-testid="feature-button"]')
    expect(element).to_be_visible()
    
    element.click()
    expect(page).to_have_url(f"{BASE_URL}/success")
```

### Best Practices

1. **Use `data-testid` attributes** for stable selectors
2. **Use `expect()` with timeouts** for async operations
3. **Add descriptive test names and docstrings**
4. **Group related tests in classes**
5. **Handle authentication in fixtures** for reusability

## Troubleshooting

### Issue: Tests fail with timeout

**Solution**: Ensure dev server is running and accessible at BASE_URL

```bash
# Check if server is running
curl http://localhost:5173

# Increase timeout in test if needed
page.set_default_timeout(30000)  # 30 seconds
```

### Issue: Playwright browser not found

**Solution**: Install browsers

```bash
playwright install
```

### Issue: Module not found error

**Solution**: Activate virtual environment and install dependencies

```bash
source venv/bin/activate
pip install -r requirements.txt
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build application
        run: npm run build
      
      - name: Start dev server
        run: npm run dev &
        
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install Python dependencies
        run: |
          cd e2e_tests
          pip install -r requirements.txt
          playwright install chromium
      
      - name: Run E2E tests
        run: |
          cd e2e_tests
          pytest test_user_journey.py -v
      
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: e2e_tests/test-results/
```

## Future Enhancements

- [ ] Add authentication helper fixtures
- [ ] Implement full admin user journey tests
- [ ] Add visual regression testing
- [ ] Implement parallel test execution
- [ ] Add performance metrics collection
- [ ] Create test data factories

## Resources

- [Playwright Python Docs](https://playwright.dev/python/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Playwright Best Practices](https://playwright.dev/python/docs/best-practices)
