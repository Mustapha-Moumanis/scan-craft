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

**2. Start the app (includes MongoDB)**

```bash
docker-compose up --build
```

This will start:
- **MongoDB** database on port 27017 (with persistent data storage)
- **Backend** (NestJS) on port 3001
- **Frontend** (Next.js) on port 80

**3. Open in browser**

http://localhost

That's it! 🎉

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
- Server-Sent Events (real-time updates)

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

---

## Useful Commands

```bash
# Using Makefile
make up         # Start everything
make down       # Stop everything
make restart    # Restart all services
make logs       # See what's happening
make status     # Check container status
make clean      # Stop and remove all data
make rebuild    # Complete rebuild (no cache)
make db-reset   # Reset only the database

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