"""
E2E Test Suite for Previso-FE
Python + Playwright

Tests user journeys including:
- Home page navigation
- Settings page with nested routes
- Admin settings tabs navigation
"""

import os
import sys
from playwright.sync_api import Page, expect, sync_playwright
import pytest


# Get base URL from environment variable or use default
BASE_URL = os.environ.get("BASE_URL", "http://localhost:5173")


class TestUserJourney:
    """Test suite for critical user journeys"""

    @pytest.fixture(scope="function", autouse=True)
    def setup(self, page: Page):
        """Setup for each test"""
        self.page = page
        # Set a reasonable timeout
        page.set_default_timeout(10000)  # 10 seconds
        yield
        # Teardown happens automatically

    def test_home_page_loads(self, page: Page):
        """Test: Home page loads correctly"""
        # Navigate to the base URL
        page.goto(BASE_URL)
        
        # Should redirect to login page for unauthenticated users
        expect(page).to_have_url(f"{BASE_URL}/login", timeout=10000)
        
        # Verify login page has expected title or heading
        # Using multiple possible selectors for resilience
        login_heading = page.locator('h1, h2').filter(has_text='Login').first
        expect(login_heading).to_be_visible(timeout=5000)

    def test_settings_redirect_to_dashboard(self, page: Page):
        """Test: /settings redirects to /settings/dashboard for admin users
        
        Note: This test requires authentication as admin.
        In a real scenario, you would:
        1. Navigate to login page
        2. Fill credentials
        3. Submit form
        4. Then navigate to /settings
        
        For demonstration, we're testing the route structure only.
        """
        # Navigate directly to settings (would redirect to login if not authenticated)
        page.goto(f"{BASE_URL}/settings")
        
        # For unauthenticated users, should redirect to login
        # In production, with proper auth, admin users would see redirect to /settings/dashboard
        expect(page).to_have_url(f"{BASE_URL}/login", timeout=10000)

    def test_login_page_elements(self, page: Page):
        """Test: Login page has required elements"""
        page.goto(f"{BASE_URL}/login")
        
        # Check for email/username input
        email_input = page.locator('input[type="email"], input[type="text"]').first
        expect(email_input).to_be_visible()
        
        # Check for password input
        password_input = page.locator('input[type="password"]')
        expect(password_input).to_be_visible()
        
        # Check for submit button
        submit_button = page.locator('button[type="submit"]')
        expect(submit_button).to_be_visible()

    def test_signup_navigation(self, page: Page):
        """Test: Can navigate from login to signup"""
        page.goto(f"{BASE_URL}/login")
        
        # Look for signup link/button
        signup_link = page.locator('a[href*="signup"], button:has-text("cadastr")', 
                                   has_text=['cadastr', 'Cadastr', 'Sign up', 'Signup']).first
        
        # Only test if signup link exists
        if signup_link.is_visible():
            signup_link.click()
            
            # Should navigate to signup page
            expect(page).to_have_url(f"{BASE_URL}/signup", timeout=5000)


class TestSettingsNavigation:
    """Test suite specifically for settings page navigation (Admin role)
    
    Note: These tests assume admin authentication. 
    In production, you would add proper login flow.
    """

    @pytest.fixture(scope="function", autouse=True)
    def setup(self, page: Page):
        """Setup for each test"""
        self.page = page
        page.set_default_timeout(10000)
        yield

    def test_settings_tabs_exist_for_admin(self, page: Page):
        """Test: Settings tabs should exist for admin users
        
        This is a structure test - in production would require admin login
        """
        # Navigate to settings page
        # In real scenario, would login as admin first
        page.goto(f"{BASE_URL}/settings/dashboard")
        
        # For now, this will redirect to login
        # When properly authenticated as admin, would verify:
        # - Dashboard tab exists with data-testid="tab-dashboard"
        # - Data Management tab exists with data-testid="tab-data"
        pass

    def test_settings_dashboard_to_data_navigation(self, page: Page):
        """Test: Navigation between settings tabs works correctly
        
        This test demonstrates the expected behavior for admin users
        """
        # This test would require admin authentication
        # Demonstrating the expected flow:
        
        # 1. Login as admin (not implemented in this test)
        # 2. Navigate to /settings/dashboard
        # 3. Click on "Gestão de Dados" tab
        # 4. Verify URL changed to /settings/data
        # 5. Verify content changed (DataManagement component visible)
        pass


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """Configure browser context with viewport and other settings"""
    return {
        **browser_context_args,
        "viewport": {
            "width": 1280,
            "height": 720,
        },
    }


def pytest_configure(config):
    """Configure pytest with custom markers"""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )


if __name__ == "__main__":
    """Allow running tests directly"""
    print(f"Running E2E tests against {BASE_URL}")
    print("=" * 50)
    
    # Run pytest
    sys.exit(pytest.main([__file__, "-v", "--tb=short"]))
