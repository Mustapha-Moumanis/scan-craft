#!/bin/sh
set -e

echo "🚀 Starting Nginx with automatic SSL setup..."

DOMAIN="${DOMAIN:-localhost}"
EMAIL="${SSL_EMAIL:-}"
CERT_PATH="/etc/nginx/ssl/cert.pem"
KEY_PATH="/etc/nginx/ssl/key.pem"
LETSENCRYPT_LIVE="/etc/letsencrypt/live/$DOMAIN"

# Check if Let's Encrypt certificates already exist
if [ -d "$LETSENCRYPT_LIVE" ] && [ -f "$LETSENCRYPT_LIVE/fullchain.pem" ]; then
    echo "✅ Found existing Let's Encrypt certificates"
    echo "📋 Copying to nginx ssl directory..."
    cp "$LETSENCRYPT_LIVE/fullchain.pem" "$CERT_PATH"
    cp "$LETSENCRYPT_LIVE/privkey.pem" "$KEY_PATH"
    chmod 644 "$CERT_PATH"
    chmod 600 "$KEY_PATH"
    echo "✅ Using Let's Encrypt certificates"
else
    echo "ℹ️  No Let's Encrypt certificates found"
    echo "📋 Using build-time certificates (self-signed for development)"
    echo ""
    echo "💡 To get valid Let's Encrypt certificates:"
    echo "   Run './setup-ssl.sh' after deployment"
    echo "   Or let the certbot container obtain them automatically"
fi

# Show certificate info
echo ""
echo "📜 Certificate Information:"
openssl x509 -in "$CERT_PATH" -noout -subject -dates 2>/dev/null || echo "Could not read certificate"
echo ""

# Validate nginx configuration at runtime
echo "🔍 Validating Nginx configuration..."
if nginx -t 2>&1; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
    echo "Please check the configuration and try again."
    exit 1
fi

# Start nginx in foreground
echo "🚀 Starting Nginx..."
exec nginx -g "daemon off;"

