#!/bin/bash

# Super-Son1k-2.0 Deployment Script
# Automated deployment to Vercel and Railway

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed. Please install it first:"
        echo "npm i -g vercel"
        exit 1
    fi
    
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI is not installed. Please install it first:"
        echo "npm i -g @railway/cli"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Build all applications
build_applications() {
    print_status "Building all applications..."
    
    # Install dependencies
    npm install
    
    # Build shared packages first
    print_status "Building shared packages..."
    cd packages/backend && npm run build && cd ../..
    cd packages/shared-utils && npm run build && cd ../..
    
    # Build frontend applications
    print_status "Building frontend applications..."
    cd apps/web-classic && npm run build && cd ../..
    cd apps/the-generator && npm run build && cd ../..
    cd apps/ghost-studio && npm run build && cd ../..
    cd apps/nova-post-pilot && npm run build && cd ../..
    
    print_success "All applications built successfully"
}

# Deploy to Railway (Backend)
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    # Login to Railway
    railway login
    
    # Link project
    railway link
    
    # Set environment variables
    print_status "Setting environment variables..."
    
    # Database
    railway variables set DATABASE_URL="$DATABASE_URL"
    
    # Redis
    railway variables set REDIS_URL="$REDIS_URL"
    
    # JWT
    railway variables set JWT_SECRET="$JWT_SECRET"
    
    # Supabase
    railway variables set SUPABASE_URL="$SUPABASE_URL"
    railway variables set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
    
    # Suno API
    railway variables set SUNO_API_URL="https://api.suno.ai/v1"
    railway variables set SUNO_API_KEY="$SUNO_API_KEY"
    
    # Stripe
    railway variables set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
    railway variables set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"
    railway variables set STRIPE_PRO_PRICE_ID="$STRIPE_PRO_PRICE_ID"
    railway variables set STRIPE_PREMIUM_PRICE_ID="$STRIPE_PREMIUM_PRICE_ID"
    railway variables set STRIPE_ENTERPRISE_PRICE_ID="$STRIPE_ENTERPRISE_PRICE_ID"
    
    # Frontend URL
    railway variables set FRONTEND_URL="$FRONTEND_URL"
    
    # Token Pool Configuration
    railway variables set MIN_TOKENS="20"
    railway variables set MAX_TOKENS="500"
    railway variables set ROTATION_INTERVAL="180000"
    railway variables set HEALTH_CHECK_INTERVAL="30000"
    
    # Deploy
    railway up
    
    print_success "Backend deployed to Railway"
}

# Deploy to Vercel (Frontend)
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    # Login to Vercel
    vercel login
    
    # Link project
    vercel link
    
    # Set environment variables
    print_status "Setting environment variables..."
    
    vercel env add NEXT_PUBLIC_SUPABASE_URL
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
    vercel env add NEXT_PUBLIC_API_URL
    vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    
    # Deploy
    vercel --prod
    
    print_success "Frontend deployed to Vercel"
}

# Deploy Chrome Extension
deploy_extension() {
    print_status "Preparing Chrome Extension for deployment..."
    
    cd extensions/suno-extension
    
    # Create production build
    npm run build
    
    # Create zip file
    zip -r suno-extension.zip . -x "*.DS_Store" "node_modules/*" "*.log"
    
    print_success "Chrome Extension ready for upload"
    print_warning "Please upload suno-extension.zip to Chrome Web Store manually"
    
    cd ../..
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd packages/backend
    
    # Generate Prisma client
    npm run db:generate
    
    # Push schema to database
    npm run db:push
    
    print_success "Database migrations completed"
    
    cd ../..
}

# Main deployment function
main() {
    echo "🚀 Super-Son1k-2.0 Deployment Script"
    echo "====================================="
    
    # Check if .env file exists
    if [ ! -f ".env.local" ]; then
        print_error "Environment file .env.local not found"
        print_warning "Please create .env.local with your configuration"
        exit 1
    fi
    
    # Load environment variables
    source .env.local
    
    # Check dependencies
    check_dependencies
    
    # Build applications
    build_applications
    
    # Run migrations
    run_migrations
    
    # Deploy backend
    deploy_backend
    
    # Deploy frontend
    deploy_frontend
    
    # Deploy extension
    deploy_extension
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Upload Chrome Extension to Chrome Web Store"
    echo "2. Configure custom domains"
    echo "3. Setup monitoring and alerts"
    echo "4. Test all functionality"
    echo ""
    echo "Documentation: https://docs.super-son1k.com"
    echo "Support: https://github.com/super-son1k/super-son1k-2.0/issues"
}

# Run main function
main "$@"
