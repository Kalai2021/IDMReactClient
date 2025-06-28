#!/bin/bash

# IDM React Client Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up IDM React Client..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and Docker Compose."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ Created .env file. Please review and update the configuration if needed."
else
    echo "✅ .env file already exists"
fi

# Create fluentd log directories
echo "📁 Creating log directories..."
mkdir -p fluentd/logs/error
mkdir -p fluentd/logs/info
mkdir -p fluentd/logs/warn
mkdir -p fluentd/logs/debug
mkdir -p fluentd/buffer

echo "✅ Log directories created"

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start the React development server: npm start"
echo "2. Access the application: http://localhost:3000"
echo "3. View logs in Kibana: http://localhost:5601"
echo "4. Check Elasticsearch: http://localhost:9200"
echo ""
echo "📚 For more information, see README.md and LOGGING.md"
echo ""
echo "🛠️  Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - Clean up: docker-compose down -v" 