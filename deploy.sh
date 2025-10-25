#!/bin/bash

# 5zn-web Production Deployment Script
set -e

echo "🚀 Starting 5zn-web production deployment..."

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the right directory?"
    exit 1
fi

print_status "Checking production files..."

# Verify production files exist
required_files=("index.prod.html" "styles.min.css" "app.min.js" "server.prod.py")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required production file missing: $file"
        exit 1
    fi
done

print_success "All production files found"

# Check if Docker is available
if command -v docker &> /dev/null; then
    print_status "Docker detected. Building production image..."
    
    # Build Docker image
    docker build -t 5zn-web:latest .
    print_success "Docker image built successfully"
    
    # Stop existing container if running
    if docker ps -q -f name=5zn-web | grep -q .; then
        print_status "Stopping existing container..."
        docker stop 5zn-web || true
        docker rm 5zn-web || true
    fi
    
    # Run production container
    print_status "Starting production container..."
    docker run -d \
        --name 5zn-web \
        -p 8000:8000 \
        -e PORT=8000 \
        -e HOST=0.0.0.0 \
        --restart unless-stopped \
        5zn-web:latest
    
    print_success "Production container started"
    print_success "🌐 Application available at: http://localhost:8000"
    
elif command -v docker-compose &> /dev/null; then
    print_status "Docker Compose detected. Starting services..."
    docker-compose up -d --build
    print_success "Services started with Docker Compose"
    print_success "🌐 Application available at: http://localhost:8000"
    
else
    print_warning "Docker not available. Starting with Python server..."
    
    # Kill any existing processes on port 8000
    if lsof -ti:8000 > /dev/null 2>&1; then
        print_status "Killing existing processes on port 8000..."
        lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    fi
    
    # Start production server
    print_status "Starting production server..."
    python3 server.prod.py &
    SERVER_PID=$!
    
    print_success "Production server started (PID: $SERVER_PID)"
    print_success "🌐 Application available at: http://localhost:8000"
    print_warning "Press Ctrl+C to stop the server"
    
    # Wait for user to stop
    trap "kill $SERVER_PID 2>/dev/null; exit 0" INT
    wait $SERVER_PID
fi

print_success "🎉 Deployment completed successfully!"
