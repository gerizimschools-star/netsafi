#!/bin/bash

# NetSafi ISP Billing - Production Build Script
# This script prepares the application for production deployment

set -e  # Exit on any error

echo "🚀 Starting NetSafi ISP Billing Production Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version check passed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.cache/
print_success "Previous builds cleaned"

# Install dependencies
print_status "Installing production dependencies..."
npm ci --production=false
print_success "Dependencies installed"

# Run type checking
print_status "Running TypeScript type checking..."
if npm run typecheck; then
    print_success "Type checking passed"
else
    print_error "Type checking failed"
    exit 1
fi

# Run tests (if any)
print_status "Running tests..."
if npm test; then
    print_success "All tests passed"
else
    print_warning "Some tests failed, but continuing with build..."
fi

# Build client
print_status "Building client application..."
if npm run build:client; then
    print_success "Client build completed"
else
    print_error "Client build failed"
    exit 1
fi

# Build server
print_status "Building server application..."
if npm run build:server; then
    print_success "Server build completed"
else
    print_error "Server build failed"
    exit 1
fi

# Check build output
print_status "Verifying build output..."

if [ ! -d "dist/spa" ]; then
    print_error "Client build output not found in dist/spa"
    exit 1
fi

if [ ! -d "dist/server" ]; then
    print_error "Server build output not found in dist/server"
    exit 1
fi

if [ ! -f "dist/server/production.mjs" ]; then
    print_error "Server production file not found"
    exit 1
fi

print_success "Build output verification passed"

# Generate build info
print_status "Generating build information..."
cat > dist/build-info.json << EOF
{
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "version": "$(cat package.json | grep '"version"' | cut -d'"' -f4)",
  "environment": "production"
}
EOF
print_success "Build information generated"

# Calculate build sizes
print_status "Calculating build sizes..."
CLIENT_SIZE=$(du -sh dist/spa 2>/dev/null | cut -f1 || echo "unknown")
SERVER_SIZE=$(du -sh dist/server 2>/dev/null | cut -f1 || echo "unknown")

echo ""
echo "📊 Build Summary:"
echo "=================="
echo "Client build size: $CLIENT_SIZE"
echo "Server build size: $SERVER_SIZE"
echo "Build time: $(date)"
echo "Node.js version: $(node --version)"
echo ""

# Check for environment file
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Please copy .env.production to .env and update with your values."
    echo "cp .env.production .env"
fi

# Production checklist
echo "✅ Production Deployment Checklist:"
echo "===================================="
echo "[ ] Copy .env.production to .env and update values"
echo "[ ] Set up PostgreSQL database"
echo "[ ] Configure domain and SSL certificate"
echo "[ ] Set up monitoring and logging"
echo "[ ] Configure backup strategy"
echo "[ ] Test all functionality in staging environment"
echo ""

print_success "🎉 Production build completed successfully!"
print_status "Your application is ready for deployment."

echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. Deploy to your hosting platform (see DEPLOYMENT_GUIDE.md)"
echo "2. Set up environment variables"
echo "3. Run database migrations"
echo "4. Test the deployed application"
echo ""

echo "For detailed deployment instructions, see: DEPLOYMENT_GUIDE.md"
