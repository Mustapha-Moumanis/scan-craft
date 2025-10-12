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

```bash
cat > .env << 'EOF'
MONGO_URI=mongodb://host.docker.internal:27017/scan-craft
PORT=3000
NODE_ENV=production
ENABLE_CORS=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF
```

**2. Start MongoDB**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:7-alpine
```

**3. Start the app**

```bash
docker-compose up --build
```

**4. Open in browser**

http://localhost:3001

That's it! 🎉

### Stop the app

```bash
docker-compose down
docker stop mongodb  # if you started MongoDB separately
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

You need these in your `.env` file:

| Variable | What it does | Example |
|----------|-------------|---------|
| `MONGO_URI` | Database connection | `mongodb://localhost:27017/scan-craft` |
| `PORT` | Backend port | `3000` |
| `ENABLE_CORS` | Frontend URL | `http://localhost:3001` |
| `NEXT_PUBLIC_API_URL` | Backend URL for frontend | `http://localhost:3000` |

⚠️ **Important**: Frontend variables must start with `NEXT_PUBLIC_`

---

## Useful Commands

```bash
# Using Makefile
make up        # Start everything
make down      # Stop everything
make logs      # See what's happening
make rebuild   # Start fresh

# Using Docker Compose directly
docker-compose up --build    # Start
docker-compose down          # Stop
docker-compose logs -f       # View logs
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

## Troubleshooting

**Frontend shows "undefined" for API?**
```bash
# Make sure .env has NEXT_PUBLIC_API_URL
# Rebuild the frontend
docker-compose build --no-cache frontend
docker-compose up -d
```

**Can't connect to MongoDB?**
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Start MongoDB if needed
docker run -d -p 27017:27017 --name mongodb mongo:7-alpine
```

**Port already in use?**
```bash
# Find what's using the port
lsof -i :3000
lsof -i :3001

# Change ports in .env file
```

---

## API Documentation

Once running, visit: **http://localhost:3000/api/swagger**

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