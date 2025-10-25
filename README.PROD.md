# 5zn-web Production Deployment

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
# Build and run with Docker
docker build -t 5zn-web:latest .
docker run -d --name 5zn-web -p 8000:8000 5zn-web:latest
```

### Option 2: Docker Compose
```bash
# Start with Docker Compose
docker-compose up -d --build
```

### Option 3: Python Server
```bash
# Start production server directly
python3 server.prod.py
```

### Option 4: Automated Deployment
```bash
# Run deployment script
./deploy.sh
```

## 📁 Production Files

- `index.prod.html` - Optimized HTML
- `styles.min.css` - Minified CSS
- `app.min.js` - Minified JavaScript
- `server.prod.py` - Production server
- `Dockerfile` - Docker container
- `docker-compose.yml` - Docker Compose config

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 8000)
- `HOST` - Server host (default: 0.0.0.0)

### Production Features
- ✅ Minified CSS and JavaScript
- ✅ Security headers
- ✅ Caching optimization
- ✅ Health checks
- ✅ Docker support
- ✅ Non-root user security

## 🌐 Access

Once deployed, the application will be available at:
- **Local**: http://localhost:8000
- **Network**: http://[your-ip]:8000

## 🐳 Docker Commands

```bash
# Build image
docker build -t 5zn-web:latest .

# Run container
docker run -d --name 5zn-web -p 8000:8000 5zn-web:latest

# View logs
docker logs 5zn-web

# Stop container
docker stop 5zn-web

# Remove container
docker rm 5zn-web
```

## 🔍 Health Check

The application includes health checks:
- **Docker**: Built-in health check
- **Manual**: `curl http://localhost:8000/`

## 📊 Performance

Production optimizations:
- Minified assets (90% size reduction)
- Gzip compression
- Browser caching
- Security headers
- Optimized server configuration

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
PORT=8001 python3 server.prod.py
```

### Docker Issues
```bash
# Clean up Docker
docker system prune -f
docker volume prune -f

# Rebuild from scratch
docker build --no-cache -t 5zn-web:latest .
```

## 🔒 Security

Production security features:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Non-root container user

## 📈 Monitoring

Monitor your deployment:
```bash
# Check container status
docker ps

# View logs
docker logs -f 5zn-web

# Check resource usage
docker stats 5zn-web
```

## 🎯 Production Checklist

- [ ] All production files created
- [ ] Docker image built successfully
- [ ] Health checks passing
- [ ] Security headers configured
- [ ] Caching optimized
- [ ] Non-root user configured
- [ ] Application accessible
- [ ] Performance optimized

## 🆘 Support

For production issues:
1. Check container logs: `docker logs 5zn-web`
2. Verify health status: `curl http://localhost:8000/`
3. Check resource usage: `docker stats 5zn-web`
4. Review configuration files
