#!/bin/bash

# NetSafi ISP Billing - Deployment Script
# Automates the deployment process for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}========================================${NC}"
}

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

# Default values
ENVIRONMENT="production"
PLATFORM="docker"
BUILD_ONLY=false
SKIP_TESTS=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -h|--help)
            echo "NetSafi ISP Billing - Deployment Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -e, --environment    Target environment (development, staging, production)"
            echo "  -p, --platform       Deployment platform (docker, netlify, vercel, vps)"
            echo "  --build-only         Only build, don't deploy"
            echo "  --skip-tests         Skip running tests"
            echo "  -h, --help           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --environment production --platform docker"
            echo "  $0 --environment staging --platform netlify"
            echo "  $0 --build-only"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_header "NetSafi ISP Billing Deployment"
print_status "Environment: $ENVIRONMENT"
print_status "Platform: $PLATFORM"
print_status "Build only: $BUILD_ONLY"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    exit 1
fi

# Validate platform
if [[ ! "$PLATFORM" =~ ^(docker|netlify|vercel|vps)$ ]]; then
    print_error "Invalid platform: $PLATFORM"
    exit 1
fi

# Check for required files
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project root?"
    exit 1
fi

# Run pre-deployment checks
print_status "Running pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current: $(node --version)"
    exit 1
fi

# Check if environment file exists
if [ "$ENVIRONMENT" = "production" ] && [ ! -f ".env" ]; then
    print_warning "No .env file found for production deployment"
    print_status "Creating .env from template..."
    if [ -f ".env.production" ]; then
        cp .env.production .env
        print_warning "Please update .env with your production values before continuing"
        read -p "Press Enter to continue or Ctrl+C to abort..."
    else
        print_error "No .env.production template found"
        exit 1
    fi
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Run tests unless skipped
if [ "$SKIP_TESTS" = false ]; then
    print_status "Running tests..."
    if npm test; then
        print_success "All tests passed"
    else
        print_error "Tests failed"
        exit 1
    fi
fi

# Build the application
print_status "Building application..."
if [ -f "scripts/build-production.sh" ]; then
    bash scripts/build-production.sh
else
    npm run build
fi

if [ "$BUILD_ONLY" = true ]; then
    print_success "Build completed successfully"
    exit 0
fi

# Deploy based on platform
case $PLATFORM in
    docker)
        print_header "Docker Deployment"
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed"
            exit 1
        fi
        
        # Check if docker-compose is available
        if command -v docker-compose &> /dev/null; then
            DOCKER_COMPOSE_CMD="docker-compose"
        elif docker compose version &> /dev/null; then
            DOCKER_COMPOSE_CMD="docker compose"
        else
            print_error "Docker Compose is not available"
            exit 1
        fi
        
        print_status "Building Docker images..."
        $DOCKER_COMPOSE_CMD build
        
        print_status "Starting services..."
        $DOCKER_COMPOSE_CMD up -d
        
        print_status "Waiting for services to be ready..."
        sleep 10
        
        # Check health
        if curl -f http://localhost:8080/api/health &> /dev/null; then
            print_success "Application deployed successfully!"
            print_status "Application URL: http://localhost:8080"
        else
            print_error "Health check failed"
            $DOCKER_COMPOSE_CMD logs app
            exit 1
        fi
        ;;
        
    netlify)
        print_header "Netlify Deployment"
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            print_error "Netlify CLI is not installed"
            print_status "Install with: npm install -g netlify-cli"
            exit 1
        fi
        
        print_status "Deploying to Netlify..."
        if [ "$ENVIRONMENT" = "production" ]; then
            netlify deploy --prod
        else
            netlify deploy
        fi
        
        print_success "Netlify deployment completed!"
        ;;
        
    vercel)
        print_header "Vercel Deployment"
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_error "Vercel CLI is not installed"
            print_status "Install with: npm install -g vercel"
            exit 1
        fi
        
        print_status "Deploying to Vercel..."
        if [ "$ENVIRONMENT" = "production" ]; then
            vercel --prod
        else
            vercel
        fi
        
        print_success "Vercel deployment completed!"
        ;;
        
    vps)
        print_header "VPS Deployment"
        
        # Check if PM2 is installed
        if ! command -v pm2 &> /dev/null; then
            print_error "PM2 is not installed"
            print_status "Install with: npm install -g pm2"
            exit 1
        fi
        
        print_status "Deploying to VPS with PM2..."
        
        # Stop existing process if running
        pm2 delete netsafi-billing 2>/dev/null || true
        
        # Start new process
        pm2 start dist/server/production.mjs --name "netsafi-billing"
        pm2 save
        
        print_success "VPS deployment completed!"
        print_status "Check status with: pm2 status"
        print_status "View logs with: pm2 logs netsafi-billing"
        ;;
esac

# Post-deployment checks
print_header "Post-Deployment Validation"

case $PLATFORM in
    docker)
        print_status "Checking Docker services..."
        $DOCKER_COMPOSE_CMD ps
        
        print_status "Application logs:"
        $DOCKER_COMPOSE_CMD logs --tail=20 app
        ;;
        
    vps)
        print_status "Checking PM2 status..."
        pm2 status
        ;;
esac

print_success "🎉 Deployment completed successfully!"

# Display useful information
echo ""
echo "📋 Deployment Summary:"
echo "======================"
echo "Environment: $ENVIRONMENT"
echo "Platform: $PLATFORM"
echo "Timestamp: $(date)"
echo ""

case $PLATFORM in
    docker)
        echo "🔗 Access your application:"
        echo "   Web Interface: http://localhost:8080"
        echo "   Health Check: http://localhost:8080/api/health"
        echo ""
        echo "📝 Useful commands:"
        echo "   View logs: $DOCKER_COMPOSE_CMD logs -f app"
        echo "   Stop services: $DOCKER_COMPOSE_CMD down"
        echo "   Restart: $DOCKER_COMPOSE_CMD restart app"
        ;;
        
    vps)
        echo "📝 Useful commands:"
        echo "   Check status: pm2 status"
        echo "   View logs: pm2 logs netsafi-billing"
        echo "   Restart: pm2 restart netsafi-billing"
        echo "   Stop: pm2 stop netsafi-billing"
        ;;
esac

echo ""
print_status "For detailed documentation, see: DEPLOYMENT_GUIDE.md"
