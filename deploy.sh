#!/bin/bash

# Immigratic Deployment Script
# This script builds and deploys the custom 404 page and search functionality

echo "🚀 Immigratic Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: Build directory 'dist' not found"
    exit 1
fi

echo ""
echo "🎯 Deployment Options:"
echo "1. Deploy to Netlify (drag & drop dist folder)"
echo "2. Deploy to Vercel (vercel --prod)"
echo "3. Deploy to GitHub Pages"
echo "4. Manual deployment (copy dist folder)"
echo ""

read -p "Choose deployment method (1-4): " choice

case $choice in
    1)
        echo "🌐 Deploying to Netlify..."
        echo "📁 Please drag the 'dist' folder to Netlify's deploy area"
        echo "🔗 Or use: netlify deploy --dir=dist --prod"
        ;;
    2)
        echo "🚀 Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            echo "❌ Vercel CLI not found. Please install it first:"
            echo "   npm i -g vercel"
        fi
        ;;
    3)
        echo "📚 Deploying to GitHub Pages..."
        echo "📁 Please push the 'dist' folder to your gh-pages branch"
        echo "🔗 Or use: gh-pages -d dist"
        ;;
    4)
        echo "📋 Manual Deployment Instructions:"
        echo "1. Copy the contents of the 'dist' folder to your web server"
        echo "2. Ensure your server is configured to serve the 404.html file"
        echo "3. Test by visiting a non-existent page on your domain"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process initiated!"
echo ""
echo "🔍 Testing your 404 page:"
echo "   - Visit a non-existent page on your domain (e.g., yourdomain.com/404-test)"
echo "   - You should see the custom Immigratic 404 page"
echo "   - Test the search functionality"
echo ""
echo "📱 Features to verify:"
echo "   ✅ Custom 404 page with immigration theme"
echo "   ✅ Interactive navigation cards"
echo "   ✅ Search functionality"
echo "   ✅ Mobile responsive design"
echo "   ✅ Smooth animations and effects"
echo ""
echo "�� Happy deploying!"
