# Playwright Pytest Plugin Configuration
# This file configures screenshot capture on failure and other Playwright settings

import pytest
from pathlib import Path


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args, pytestconfig):
    """Configure browser context"""
    return {
        **browser_context_args,
        "viewport": {"width": 1280, "height": 720},
        "locale": "pt-BR",
        "timezone_id": "America/Sao_Paulo",
        "record_video_dir": None,  # Disable video recording by default
    }


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook to capture screenshots on test failure"""
    outcome = yield
    report = outcome.get_result()
    
    if report.when == "call" and report.failed:
        # Get the page fixture if it exists
        page = item.funcargs.get("page")
        if page:
            # Create screenshots directory
            screenshot_dir = Path("test-results/screenshots")
            screenshot_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate screenshot filename
            screenshot_path = screenshot_dir / f"{item.nodeid.replace('::', '_').replace('/', '_')}.png"
            
            try:
                # Take screenshot
                page.screenshot(path=str(screenshot_path), full_page=True)
                print(f"\n📸 Screenshot saved: {screenshot_path}")
            except Exception as e:
                print(f"\n⚠️  Failed to capture screenshot: {e}")
