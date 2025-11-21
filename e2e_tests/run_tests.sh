#!/bin/bash
# E2E Test Runner Script
# Automates the setup and execution of E2E tests

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Previso E2E Test Suite Runner${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Check if we're in the e2e_tests directory
if [ ! -f "test_user_journey.py" ]; then
    echo -e "${YELLOW}Navigating to e2e_tests directory...${NC}"
    cd "$(dirname "$0")"
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import playwright" 2>/dev/null; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pip install -q -r requirements.txt
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    
    echo -e "${YELLOW}Installing Playwright browsers...${NC}"
    playwright install chromium
    echo -e "${GREEN}✓ Browsers installed${NC}"
fi

# Get BASE_URL from argument or use default
BASE_URL=${1:-"http://localhost:5173"}

echo ""
echo -e "${GREEN}Configuration:${NC}"
echo -e "  BASE_URL: ${YELLOW}${BASE_URL}${NC}"
echo ""

# Check if server is accessible
echo -e "${YELLOW}Checking if application is accessible...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ Application is accessible${NC}"
else
    echo -e "${RED}✗ Application not accessible at ${BASE_URL}${NC}"
    echo -e "${YELLOW}Please ensure the dev server is running:${NC}"
    echo -e "  npm run dev"
    echo ""
    echo -e "${YELLOW}Or specify a different BASE_URL:${NC}"
    echo -e "  ./run_tests.sh http://localhost:3000"
    exit 1
fi

echo ""
echo -e "${GREEN}Running E2E tests...${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Run the tests
BASE_URL="${BASE_URL}" pytest test_user_journey.py -v

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo -e "${GREEN}=====================================${NC}"
else
    echo ""
    echo -e "${RED}=====================================${NC}"
    echo -e "${RED}✗ Some tests failed${NC}"
    echo -e "${RED}=====================================${NC}"
    echo ""
    echo -e "${YELLOW}Check test-results/ directory for screenshots${NC}"
    exit 1
fi
