#!/bin/bash

# SSL Certificate Setup Script
# Supports both development (self-signed) and production (Let's Encrypt)

set -e

echo "🔒 SSL Certificate Setup for Scan-Craft"
echo "========================================"
echo ""
echo "Choose your setup:"
echo "  1) Development - Self-signed certificates (localhost)"
echo "  2) Production - Let's Encrypt (requires domain)"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "📝 Setting up self-signed certificates for development..."
        echo ""
        
        cd nginx
        ./generate-ssl.sh
        cd ..
        
        echo ""
        echo "✅ Self-signed certificates created!"
        echo ""
        echo "Next steps:"
        echo "  1. Start the application:"
        echo "     docker-compose up --build"
        echo ""
        echo "  2. Access your app:"
        echo "     https://localhost"
        echo ""
        echo "  3. Accept the browser security warning"
        echo "     (Self-signed certificates are not trusted by browsers)"
        echo ""
        ;;
        
    2)
        echo ""
        read -p "Enter your domain name (e.g., example.com): " domain
        read -p "Enter your email address (for Let's Encrypt notifications): " email
        
        if [ -z "$domain" ]; then
            echo "❌ Error: Domain name is required"
            exit 1
        fi
        
        echo ""
        echo "📝 Configuration:"
        echo "   Domain: $domain"
        echo "   Email: ${email:-"(none)"}"
        echo ""
        echo "⚠️  Important prerequisites:"
        echo "   ✓ Domain $domain must point to this server's IP"
        echo "   ✓ Ports 80 and 443 must be accessible from the internet"
        echo "   ✓ No other service using ports 80/443"
        echo ""
        read -p "Have you completed these prerequisites? (y/n): " confirm
        
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            echo "❌ Setup cancelled. Please complete the prerequisites first."
            exit 1
        fi
        
        echo ""
        echo "🚀 Starting setup..."
        echo ""
        
        # Create necessary directories
        mkdir -p nginx/webroot
        mkdir -p nginx/ssl
        
        # Start nginx and certbot containers
        echo "📦 Starting nginx and certbot services..."
        docker-compose up -d nginx certbot
        
        # Wait for nginx to be ready
        echo "⏳ Waiting for nginx to start..."
        sleep 5
        
        # Run certbot to obtain certificate
        echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
        
        if [ -n "$email" ]; then
            docker-compose run --rm certbot certonly \
                --webroot \
                --webroot-path=/var/www/certbot \
                --email $email \
                --agree-tos \
                --no-eff-email \
                -d $domain
        else
            docker-compose run --rm certbot certonly \
                --webroot \
                --webroot-path=/var/www/certbot \
                --register-unsafely-without-email \
                --agree-tos \
                -d $domain
        fi
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Certificate obtained successfully!"
            echo ""
            echo "🔄 Restarting nginx to use new certificates..."
            docker-compose restart nginx
            
            echo ""
            echo "✅ Setup complete!"
            echo ""
            echo "Your application is now accessible at:"
            echo "   https://$domain"
            echo ""
            echo "📅 Auto-renewal:"
            echo "   Certificates will auto-renew via the certbot container"
            echo "   It checks twice daily and renews when needed"
            echo ""
            echo "📊 Manual renewal (if needed):"
            echo "   docker-compose run --rm certbot renew"
            echo "   docker-compose restart nginx"
            echo ""
        else
            echo ""
            echo "❌ Failed to obtain certificate"
            echo ""
            echo "Common issues:"
            echo "  - Domain doesn't point to this server"
            echo "  - Port 80 is not accessible"
            echo "  - Firewall blocking traffic"
            echo "  - DNS not fully propagated (wait 10-30 minutes)"
            echo ""
            echo "Try again after fixing the issue:"
            echo "   ./setup-ssl.sh"
            echo ""
            exit 1
        fi
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

