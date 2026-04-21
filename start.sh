#!/bin/bash

# LeetMetrices Startup Script
# This script is a fallback for build systems like Railpack that look for a root entry point.

echo "🚀 Bootstrapping LeetMetrices Monorepo..."

# Navigate to backend and start
echo "📂 Moving to backend directory..."
cd backend

# Start the application
echo "⚡ Starting LeetMetrices Backend..."
npm start
