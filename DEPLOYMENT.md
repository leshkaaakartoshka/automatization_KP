# CPQ System - Docker Deployment Guide

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Ubuntu 22.04 LTS (recommended)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd cpq-system
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   nano .env
   ```

3. **Start the system:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - API Documentation: http://localhost/api/docs

## Environment Variables

### Required Variables

- `TG_BOT_TOKEN`: Telegram bot token (if using Telegram integration)
- `TG_MANAGER_CHAT_ID`: Telegram chat ID for notifications

### Optional Variables

- `LOOKUP_SOURCE`: Data source (mock, sheets, postgres) - default: mock
- `PDF_STORAGE`: PDF storage type (local, s3) - default: local
- `DB_DSN`: PostgreSQL connection string (if using postgres)
- `HASH_SALT`: Random salt for hashing - **CHANGE IN PRODUCTION**

## Services

### Frontend (Port 80)
- React + Vite application
- Served by Nginx
- Proxy configuration for API calls

### Backend (Port 8000)
- FastAPI application
- Python 3.11 with WeasyPrint
- PDF generation capabilities

### PostgreSQL (Port 5432)
- Database for quote catalog
- Persistent data storage
- Initialized with sample data

## Production Deployment

### Security Considerations

1. **Change default passwords:**
   ```bash
   # In .env file
   POSTGRES_PASSWORD=your_secure_password
   HASH_SALT=your_random_secure_salt
   ```

2. **Configure CORS properly:**
   - Edit `backend/app/main.py`
   - Set `allow_origins` to your domain

3. **Use HTTPS:**
   - Configure SSL certificates
   - Update nginx.conf for HTTPS

### Scaling

- Use external PostgreSQL database
- Configure Redis for caching
- Use S3 for PDF storage
- Set up load balancer

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using port 80
   sudo netstat -tulpn | grep :80
   ```

2. **Permission issues:**
   ```bash
   # Fix PDF directory permissions
   sudo chown -R 1000:1000 backend/pdf/
   ```

3. **Database connection:**
   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgres
   ```

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres
```

## Maintenance

### Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U cpq_user cpq_db > backup.sql

# Backup PDFs
tar -czf pdfs_backup.tar.gz backend/pdf/
```

### Updates

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Monitoring

- Health check: http://localhost/health
- API docs: http://localhost/api/docs
- Database: Connect to localhost:5432

## Support

For issues and questions, please check the logs and ensure all environment variables are properly configured.
