#!/bin/bash

# Setup script for MusicOnTheGo Backend Migration
# This script helps set up the new NestJS + PostgreSQL backend

echo "🚀 MusicOnTheGo Backend Migration Setup"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo "⚠️  Please edit .env and add your DATABASE_URL and other secrets"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Backup old package.json
if [ -f package.json ] && [ ! -f package-old.json ]; then
    echo "💾 Backing up old package.json..."
    mv package.json package-old.json
    echo "✅ Backed up to package-old.json"
    echo ""
fi

# Install new package.json
if [ -f package-new.json ]; then
    echo "📦 Installing new dependencies..."
    mv package-new.json package.json
    echo "✅ package.json updated"
    echo ""
    echo "⏳ Running npm install (this may take a few minutes)..."
    npm install
    echo ""
    echo "✅ Dependencies installed!"
    echo ""
else
    echo "⚠️  package-new.json not found. Make sure it exists."
    exit 1
fi

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=\"postgresql://" .env 2>/dev/null; then
    echo "✅ DATABASE_URL found in .env"
    echo ""
    
    # Generate Prisma Client
    echo "🔧 Generating Prisma Client..."
    npm run prisma:generate
    echo ""
    
    # Ask about migrations
    echo "📊 Ready to run database migrations?"
    echo "This will create all tables in your PostgreSQL database."
    read -p "Run migrations now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Running migrations..."
        npm run prisma:migrate
        echo ""
        echo "✅ Migration complete!"
        echo ""
        echo "🎉 Setup complete! You can now:"
        echo "   - Start dev server: npm run start:dev"
        echo "   - Open Prisma Studio: npm run prisma:studio"
    else
        echo "⏭️  Skipping migrations. Run 'npm run prisma:migrate' when ready."
    fi
else
    echo "⚠️  DATABASE_URL not set in .env"
    echo "Please:"
    echo "1. Set up PostgreSQL (Supabase/Neon/local)"
    echo "2. Add DATABASE_URL to .env file"
    echo "3. Then run: npm run prisma:generate"
    echo "4. Then run: npm run prisma:migrate"
fi

echo ""
echo "✨ Next steps:"
echo "   1. Make sure DATABASE_URL is set in .env"
echo "   2. Run: npm run prisma:generate"
echo "   3. Run: npm run prisma:migrate"
echo "   4. Start developing: npm run start:dev"
echo ""
