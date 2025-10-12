FROM nginx:alpine

# Build argument to specify environment
ARG BUILD_ENV=development
ARG DOMAIN=localhost

# Install required packages
RUN apk add --no-cache \
    openssl \
    bash \
    wget \
    certbot

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# ================================
# BUILD-TIME SSL CERTIFICATE GENERATION
# ================================
# For DEVELOPMENT: Generate self-signed certificates (no domain verification needed)
# For PRODUCTION: Certbot certificates must be obtained at RUNTIME after deployment
# 
# Why not use Certbot at build time?
# - Certbot requires domain DNS to be configured and pointing to the server
# - Let's Encrypt must verify domain ownership via HTTP-01/DNS-01 challenge
# - Build happens BEFORE deployment, so verification is impossible
# - Therefore: Build-time certs are for development only
# ================================

WORKDIR /etc/nginx/ssl

# Generate self-signed certificates at BUILD TIME
# These work immediately for localhost development
# Production environments will override these with Let's Encrypt certificates via volume mounts
RUN if [ "$BUILD_ENV" = "development" ]; then \
        echo "🔨 Building for DEVELOPMENT - Generating self-signed SSL certificates..."; \
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout key.pem \
            -out cert.pem \
            -subj "/C=US/ST=Development/L=Local/O=ScanCraft/OU=Dev/CN=${DOMAIN}" \
            -addext "subjectAltName=DNS:localhost,DNS:*.localhost,DNS:${DOMAIN},IP:127.0.0.1" && \
        chmod 644 cert.pem && \
        chmod 600 key.pem && \
        echo "✅ Self-signed certificates generated for ${DOMAIN}"; \
    else \
        echo "🏭 Building for PRODUCTION - Creating placeholder certificates..."; \
        echo "⚠️  Production certificates must be obtained via Certbot AFTER deployment"; \
        openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
            -keyout key.pem \
            -out cert.pem \
            -subj "/C=US/ST=Temporary/L=Temporary/O=ScanCraft/OU=Prod/CN=temporary" && \
        chmod 644 cert.pem && \
        chmod 600 key.pem && \
        echo "⚠️  Temporary certificates created - REPLACE WITH CERTBOT CERTIFICATES"; \
    fi

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create webroot directory for Let's Encrypt ACME challenges
RUN mkdir -p /var/www/certbot

# Note: nginx -t validation is skipped at build time because
# upstream hosts (frontend, backend) don't exist yet.
# Validation happens automatically at runtime when nginx starts.

EXPOSE 80 443

# Copy entrypoint script for automatic SSL setup
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]

