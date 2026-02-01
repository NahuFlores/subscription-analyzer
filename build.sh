#!/bin/bash
set -e

echo "🔧 Installing Python dependencies..."
pip install -r requirements.txt

echo "📦 Building React dashboard..."
cd dashboard
npm install
npm run build
cd ..

echo "✅ Build complete!"
