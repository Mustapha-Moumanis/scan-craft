# Nginx Reverse Proxy with SSL

This directory contains the Nginx configuration for the Scan-Craft application with SSL/TLS support.

## 🔒 Features

- **Reverse Proxy**: Routes traffic between frontend and backend
- **SSL/TLS Encryption**: All traffic encrypted with HTTPS
- **HTTP to HTTPS Redirect**: Automatically redirects HTTP to HTTPS
- **Rate Limiting**: API rate limiting to prevent abuse
- **Compression**: Gzip compression for better performance
- **Security Headers**: HSTS, X-Frame-Options, CSP, etc.
- **Server-Sent Events Support**: Optimized for real-time progress updates

## 📁 Structure

```
nginx/
├── Dockerfile          # Nginx container with SSL generation
├── nginx.conf          # Nginx configuration
├── generate-ssl.sh     # Script to generate SSL certificates
└── ssl/               # SSL certificates (auto-generated, gitignored)
    ├── cert.pem       # SSL certificate
    └── key.pem        # Private key
```

## 🚀 Quick Start

The SSL certificates are automatically generated when you build the Docker image:

```bash
docker-compose build nginx
docker-compose up -d
```

Access your application:
- **HTTPS**: https://localhost (recommended)
- **HTTP**: http://localhost (redirects to HTTPS)

## 🔐 SSL Certificates

### Quick Setup

Use the automated setup script from the project root:

```bash
# Interactive setup
../setup-ssl.sh

# Or use Make
make ssl-setup
```

### Option 1: Development (Self-Signed)

Self-signed certificates are **automatically generated at Docker build time**.

**How it works:**
- Certificates are baked into the nginx Docker image
- Generated during `docker-compose build` or `docker build`
- No manual generation needed
- No runtime overhead

**Rebuild to regenerate certificates:**
```bash
docker-compose build --no-cache nginx
docker-compose up -d
```

**Accept in browser:**
1. Visit https://localhost
2. Click "Advanced" → "Proceed to localhost (unsafe)"
3. Click "Accept the Risk and Continue"

### Option 2: Production (Let's Encrypt)

Get **free, valid SSL certificates** from Let's Encrypt.

**Prerequisites:**
- Domain name pointing to your server
- Ports 80 and 443 accessible
- No other service using these ports

**Automated Setup (Recommended):**

```bash
# From project root
./setup-ssl.sh
# Choose option 2 and follow prompts
```

**Manual Setup:**

1. **Start services:**
   ```bash
   docker-compose up -d nginx certbot
   ```

2. **Obtain certificate:**
   ```bash
   docker-compose run --rm certbot certonly \
     --webroot \
     --webroot-path=/var/www/certbot \
     --email your-email@example.com \
     --agree-tos \
     -d yourdomain.com
   ```

3. **Copy certificates:**
   ```bash
   docker run --rm \
     -v scan-craft_certbot_conf:/etc/letsencrypt \
     -v $(pwd)/ssl:/app/ssl \
     alpine \
     sh -c "cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /app/ssl/cert.pem && \
            cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /app/ssl/key.pem"
   ```

4. **Restart nginx:**
   ```bash
   docker-compose restart nginx
   ```

**Auto-Renewal:**

The certbot container automatically renews certificates:
- Runs twice daily
- Renews when < 30 days until expiry
- Zero downtime

**Manual Renewal (if needed):**

```bash
# Renew all certificates and restart nginx
make ssl-renew

# Or manually:
docker-compose run --rm certbot renew
docker-compose restart nginx
```

**Check Certificate Expiry:**

```bash
docker-compose run --rm certbot certificates
```

### Custom Certificates

Place your certificates in `nginx/ssl/`:

```
nginx/ssl/cert.pem  # Your certificate or fullchain
nginx/ssl/key.pem   # Your private key
```

Then restart nginx:
```bash
docker-compose restart nginx
```

## 📋 Configuration Details

### Ports

- **80**: HTTP (redirects to HTTPS)
- **443**: HTTPS (main entry point)

### Routes

| Path | Destination | Description |
|------|------------|-------------|
| `/api/*` | Backend (port 3001) | API endpoints |
| `/api/pdf/progress` | Backend (SSE) | Real-time progress updates |
| `/` | Frontend (port 3000) | Main application |
| `/health` | Nginx | Health check endpoint |

### Security Headers

- `Strict-Transport-Security`: Force HTTPS for 1 year
- `X-Frame-Options`: Prevent clickjacking
- `X-Content-Type-Options`: Prevent MIME sniffing
- `X-XSS-Protection`: Enable XSS filter

### Rate Limiting

- API endpoints: 10 requests/second per IP
- Burst: up to 20 requests

### File Upload

- Maximum file size: 100MB
- Buffering: Disabled for streaming

## 🔧 Customization

### Change SSL Settings

Edit `nginx.conf`:

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
```

### Adjust Rate Limits

Edit `nginx.conf`:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```

### Change Upload Size

Edit `nginx.conf`:

```nginx
client_max_body_size 100M;
```

## 🐛 Troubleshooting

### Certificate Errors

**Problem**: Browser shows "Your connection is not private"
**Solution**: This is normal for self-signed certificates. Click "Advanced" → "Proceed to localhost"

**Problem**: Certificate expired
**Solution**: Regenerate certificates:
```bash
cd nginx
rm -rf ssl/
./generate-ssl.sh
docker-compose restart nginx
```

### Connection Issues

**Check Nginx logs:**
```bash
docker logs scan-craft-nginx
```

**Test configuration:**
```bash
docker exec scan-craft-nginx nginx -t
```

**Reload configuration:**
```bash
docker exec scan-craft-nginx nginx -s reload
```

### Port Conflicts

If ports 80 or 443 are already in use:

```bash
# Find process using port
sudo lsof -i :443
sudo lsof -i :80

# Stop conflicting service
sudo systemctl stop apache2  # or nginx, etc.
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost/health
# or
curl -k https://localhost/health
```

### SSL Certificate Info

```bash
openssl x509 -in nginx/ssl/cert.pem -text -noout
```

### Test SSL Configuration

```bash
curl -k -I https://localhost
```

## 🔄 Updates

After changing nginx configuration:

```bash
# Test configuration
docker exec scan-craft-nginx nginx -t

# Reload without downtime
docker exec scan-craft-nginx nginx -s reload

# Or restart container
docker-compose restart nginx
```

## 📝 Notes

- SSL certificates in `nginx/ssl/` are gitignored for security
- Self-signed certificates are for development only
- Use Let's Encrypt or commercial CA for production
- The nginx container builds with certificates pre-generated
- Certificates are valid for 365 days

