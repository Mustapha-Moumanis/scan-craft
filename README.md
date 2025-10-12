# 📄 Scan-Craft

**Extract and validate QR codes from PDF files automatically.**

[![Live Demo](https://img.shields.io/badge/🌐_Try_Live-scan--craft.mustapha--moumanis.me-success?style=for-the-badge)](http://scan-craft.mustapha-moumanis.me)

A simple web tool that scans your PDF files, finds all QR codes, and tells you which ones work.

---

## What Does It Do?

Upload a PDF file and Scan-Craft will:
- 🔍 Find every QR code in the document
- ✅ Tell you which codes are valid
- ❌ Show you which ones are broken or duplicates
- 💾 Keep a history of all your processed files

**Perfect for**: Anyone who needs to check QR codes in documents quickly.

---

## Try It Online

Visit **[scan-craft.mustapha-moumanis.me](http://scan-craft.mustapha-moumanis.me)**

1. **Upload** - Drag a PDF file onto the page (or click to select one)
2. **Wait** - Watch the progress bar as it processes
3. **View Results** - See all QR codes with their status
4. **Filter** - Click "Valid" or "Invalid" to sort them
5. **History** - Check past files anytime in the History tab

No signup needed. Just upload and go!

---

## Features

### 📊 Dashboard
- Upload PDF files (up to 50 MB)
- Real-time progress updates
- See all QR codes as cards
- Filter by status (Valid, Invalid, Unreadable, Duplicate)
- Navigate with pagination (8 items per page)

### 📚 History
- View all previously processed files
- Click any file to see its QR codes
- See how many QR codes each file has
- Files sorted by most recent first

### 🎯 QR Validation
- **Valid** ✅ - QR code decoded successfully
- **Invalid** ❌ - Couldn't decode the QR code
- **Unreadable** ⚠️ - QR structure found but data unreadable
- **Duplicate** ⚡ - Same QR code appears multiple times

---

## Run It Yourself

### Quick Setup with Docker

**1. Create environment file**

Copy the example environment file:

```bash
cp .env-example .env
```

The `.env` file contains all necessary configuration:

```env
# CORS Configuration
ENABLE_CORS=http://localhost

# Frontend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# MongoDB Connection (for Backend)
MONGO_URI=mongodb://admin:admin123@mongodb:27017/scancraft?authSource=admin

# MongoDB Initialization (for Docker)
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=admin123
MONGO_INITDB_DATABASE=scancraft
```

**2. Start the app**

```bash
docker-compose up --build
```

This will start:
- **MongoDB** database (with persistent data storage)
- **Backend** (NestJS)
- **Frontend** (Next.js)
- **Nginx** reverse proxy with **automatic SSL setup**

**What happens automatically:**
- ✅ Nginx builds with temporary certificates
- ✅ On first start, attempts to get Let's Encrypt certificates
- ✅ Falls back to self-signed if domain not configured
- ✅ Auto-renews certificates every 12 hours

**3. Open in browser**

🔒 **HTTPS (Recommended):** https://localhost or https://your-domain.com  
🌐 **HTTP:** http://localhost (redirects to HTTPS)

⚠️ **Note**: For localhost, you'll see a browser warning for self-signed certificates. Click "Advanced" → "Proceed to localhost" to continue.

That's it! 🎉 **One command deployment with automatic SSL!**

### Stop the app

```bash
docker-compose down
```

To stop and remove all data (including database):
```bash
docker-compose down -v
```

---

## Built With

**Backend:**
- NestJS (Node.js framework)
- MongoDB (database)
- Sharp (image processing)
- jsQR (QR code reading)

**Frontend:**
- Next.js (React framework)
- Material-UI (components)
- TypeScript

**Infrastructure:**
- Docker (containers)
- Nginx (reverse proxy with SSL/TLS)
- Server-Sent Events (real-time updates)
- Self-signed SSL certificates (auto-generated)

---

## Configuration

### Environment Variables

All configuration is managed through the `.env` file in the root directory:

#### Frontend Variables
| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (must start with `NEXT_PUBLIC_`) | `http://localhost:3001` |

#### Backend Variables
| Variable | Description | Default Value |
|----------|-------------|---------------|
| `ENABLE_CORS` | Allowed CORS origin | `http://localhost` |
| `MONGO_URI` | MongoDB connection string | `mongodb://admin:admin123@mongodb:27017/scancraft?authSource=admin` |

#### MongoDB Variables (Docker Initialization)
| Variable | Description | Default Value |
|----------|-------------|---------------|
| `MONGO_INITDB_ROOT_USERNAME` | MongoDB admin username | `admin` |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB admin password | `admin123` |
| `MONGO_INITDB_DATABASE` | Initial database name | `scancraft` |

⚠️ **Important Notes**: 
- Frontend variables **must** start with `NEXT_PUBLIC_` to be accessible in the browser
- The `mongodb` in `MONGO_URI` refers to the Docker container service name
- **Change default credentials in production!**
- MongoDB credentials must match between `MONGO_URI` and `MONGO_INITDB_*` variables

### SSL/HTTPS Configuration

The application uses Nginx with **automatic SSL certificate management**.

#### 🚀 One-Command Deployment

Simply run:

```bash
docker-compose up --build
```

**What happens automatically:**

1. **Build Time**: Creates temporary certificates
2. **First Start**: Attempts to obtain Let's Encrypt certificates
   - If domain is configured and accessible → Gets valid certificates ✅
   - If localhost or domain not ready → Uses self-signed certificates
3. **Runtime**: Auto-renews certificates every 12 hours

#### Configuration

**Development (localhost):**
```bash
# No configuration needed - just run:
docker-compose up --build
```
- Uses self-signed certificates automatically
- Browser warnings are normal

**Production (with domain):**

1. **Set your email in `.env`:**
   ```env
   SSL_EMAIL=your-email@example.com
   ```

2. **Ensure DNS is configured:**
   - Domain points to your server IP
   - Ports 80 and 443 are accessible

3. **Deploy:**
   ```bash
   docker-compose up --build
   ```
   
4. **Done!** Let's Encrypt certificates are obtained automatically

#### Manual SSL Setup (Optional)

For production with a real domain:

**Prerequisites:**
- Domain name pointing to your server
- Ports 80 and 443 accessible from internet
- No other service using these ports

**Automated Setup:**
```bash
./setup-ssl.sh
# Choose option 2 and follow prompts
```

**Manual Setup:**
```bash
# 1. Start nginx and certbot
docker-compose up -d nginx certbot

# 2. Obtain certificate
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  -d your-domain.com

# 3. Copy certificates
docker run --rm \
  -v scan-craft_certbot_conf:/etc/letsencrypt \
  -v $(pwd)/nginx/ssl:/app/ssl \
  alpine \
  sh -c "cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /app/ssl/cert.pem && \
         cp /etc/letsencrypt/live/your-domain.com/privkey.pem /app/ssl/key.pem"

# 4. Restart nginx
docker-compose restart nginx
```

**Auto-Renewal:**
The certbot container automatically renews certificates:
- Checks twice daily
- Renews when certificate is within 30 days of expiry
- No manual intervention needed

**Manual Renewal (if needed):**
```bash
docker-compose run --rm certbot renew
docker-compose restart nginx
```

#### Nginx Features

- 🔒 **HTTPS**: TLS 1.2/1.3 encryption
- 🔄 **Auto-redirect**: HTTP → HTTPS
- 🛡️ **Security headers**: HSTS, X-Frame-Options, CSP
- ⚡ **Rate limiting**: 10 req/sec per IP
- 📦 **Gzip compression**: Faster page loads
- 📊 **SSE support**: Real-time progress updates
- 📁 **Large uploads**: 100MB file limit
- 🔐 **Let's Encrypt ready**: Valid SSL certificates

For detailed SSL documentation, see [`nginx/README.md`](nginx/README.md)

---

## Useful Commands

```bash
# Using Makefile - General
make up              # Start everything
make down            # Stop everything
make restart         # Restart all services
make logs            # See what's happening
make status          # Check container status
make clean           # Stop and remove all data
make rebuild         # Complete rebuild (no cache)

# Database
make db-reset        # Reset only the database

# SSL/Certificates
make ssl-setup       # Interactive SSL setup (for Let's Encrypt)
make ssl-renew       # Renew Let's Encrypt certificates

# Using Docker Compose directly
docker-compose up --build     # Start
docker-compose down           # Stop
docker-compose logs -f        # View logs
docker-compose ps             # Check status
docker-compose restart        # Restart services
```

---

## How to Use

### Upload and Process

1. Go to Dashboard
2. Drag your PDF file or click "Select PDF"
3. Wait for processing to complete
4. View your QR codes

### Filter Results

- Click filter buttons: All, Valid, Invalid, Unreadable, Duplicate
- Use pagination if you have many results

### View History

1. Click "History" in sidebar
2. See all your processed files
3. Click any file to view its QR codes
4. Click back arrow to return to file list

---


---

## API Documentation

Once running, visit: **http://localhost:3001/api**

### Main Endpoints

- `POST /api/pdf/upload` - Upload a PDF file
- `GET /api/pdf/progress?fileName=xxx` - Get processing progress
- `GET /api/pdf/results?fileName=xxx` - Get QR codes from a file
- `GET /api/pdf/history` - Get all processed files

---

## Contributing

Want to improve Scan-Craft?

1. Fork the repo
2. Make your changes
3. Test everything works
4. Send a pull request

**Ideas welcome:**
- Better QR detection
- Export to Excel/CSV
- Image file support
- Batch processing

---

## License

MIT License - Use it however you want!

---

## Contact

**Mustapha Moumanis**

🌐 Portfolio: [mustapha-moumanis.me](http://mustapha-moumanis.me)  
🚀 Demo: [scan-craft.mustapha-moumanis.me](http://scan-craft.mustapha-moumanis.me)

Built with ❤️ using NestJS, Next.js, and MongoDB

---

⭐ **Star this repo if you find it useful!**