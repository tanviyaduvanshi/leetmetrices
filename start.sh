#!/bin/bash

# LeetMetrices Startup Script
echo "------------------------------------------------"
echo "🚀 [ROOT] Bootstrapping LeetMetrices Monorepo..."
echo "📍 [ROOT] Current Path: $(pwd)"
echo "📌 [ROOT] Files in root: $(ls -F)"

# Verify backend directory exists
if [ -d "backend" ]; then
    echo "✅ [ROOT] Backend directory found."
    echo "📂 [ROOT] Navigating to /backend..."
    cd backend
    
    echo "⚡ [ROOT] Starting LeetMetrices Backend..."
    # Use npm start from within the backend folder
    npm start
else
    echo "❌ [ROOT] ERROR: backend directory not found!"
    echo "📜 [ROOT] Listing root contents for debugging:"
    ls -R
    exit 1
fi
