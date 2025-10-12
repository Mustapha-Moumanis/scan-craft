#!/bin/bash

# Certbot/Let's Encrypt SSL Certificate Setup Script
# This script helps you obtain valid SSL certificates from Let's Encrypt

set -e

echo "🔒 Let's Encrypt SSL Certificate Setup"
echo "======================================"
echo ""

# Check if domain is provided
if [ -z "$1" ]; then
    echo "❌ Error: Domain name required"
    echo ""
    echo "Usage: ./certbot-setup.sh your-domain.com [email@example.com]"
    echo ""
    echo "Example:"
    echo "  ./certbot-setup.sh scan-craft.example.com admin@example.com"
    echo ""
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-""}
SSL_DIR="./ssl"
WEBROOT_DIR="./webroot"

# Create necessary directories
mkdir -p "$SSL_DIR"
mkdir -p "$WEBROOT_DIR"

echo "📝 Configuration:"
echo "   Domain: $DOMAIN"
if [ -n "$EMAIL" ]; then
    echo "   Email: $EMAIL"
else
    echo "   Email: (none - using --register-unsafely-without-email)"
fi
echo ""

# Check if running in Docker
if [ -f /.dockerenv ]; then
    echo "🐳 Running inside Docker container"
    CERTBOT_CMD="certbot"
else
    echo "💻 Running on host machine"
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        echo "⚠️  Certbot not found. Installing..."
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update
            sudo apt-get install -y certbot
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install certbot
        else
            echo "❌ Please install certbot manually: https://certbot.eff.org/"
            exit 1
        fi
    fi
    
    CERTBOT_CMD="sudo certbot"
fi

echo ""
echo "🚀 Obtaining SSL certificate from Let's Encrypt..."
echo ""

# Build certbot command
CERTBOT_ARGS="certonly --webroot -w $WEBROOT_DIR -d $DOMAIN"

if [ -n "$EMAIL" ]; then
    CERTBOT_ARGS="$CERTBOT_ARGS --email $EMAIL --agree-tos --no-eff-email"
else
    CERTBOT_ARGS="$CERTBOT_ARGS --register-unsafely-without-email --agree-tos"
fi

# Non-interactive mode
CERTBOT_ARGS="$CERTBOT_ARGS --non-interactive"

# Run certbot
if $CERTBOT_CMD $CERTBOT_ARGS; then
    echo ""
    echo "✅ Certificate obtained successfully!"
    echo ""
    
    # Copy certificates to nginx ssl directory
    if [ -f /.dockerenv ]; then
        CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
    else
        CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
    fi
    
    echo "📋 Copying certificates to nginx/ssl/..."
    
    if [ -d "$CERT_PATH" ]; then
        sudo cp "$CERT_PATH/fullchain.pem" "$SSL_DIR/cert.pem"
        sudo cp "$CERT_PATH/privkey.pem" "$SSL_DIR/key.pem"
        sudo chmod 644 "$SSL_DIR/cert.pem"
        sudo chmod 600 "$SSL_DIR/key.pem"
        
        echo "✅ Certificates copied to:"
        echo "   - $SSL_DIR/cert.pem"
        echo "   - $SSL_DIR/key.pem"
        echo ""
        echo "🔄 Restart nginx to use new certificates:"
        echo "   docker-compose restart nginx"
        echo "   or"
        echo "   make nginx-restart"
    else
        echo "❌ Certificate path not found: $CERT_PATH"
        exit 1
    fi
else
    echo ""
    echo "❌ Failed to obtain certificate"
    echo ""
    echo "Common issues:"
    echo "  - Domain doesn't point to this server"
    echo "  - Port 80 is not accessible"
    echo "  - Firewall blocking traffic"
    echo "  - DNS not propagated yet"
    echo ""
    exit 1
fi

echo ""
echo "📅 Certificate auto-renewal:"
echo "   Let's Encrypt certificates expire in 90 days"
echo "   Set up a cron job to renew automatically:"
echo ""
echo "   0 0 * * * certbot renew --quiet && docker-compose restart nginx"
echo ""

