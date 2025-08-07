# Docker Deployment Guide

This guide explains how to deploy the Chat Assistant Web application using Docker, both locally and on cloud platforms like AWS EC2.

## Prerequisites

- Docker installed on your system
- Docker Compose (included with Docker Desktop)
- Environment variables configured (see `.env.example`)

## Quick Start

### 1. Environment Setup

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `OPENAI_API_KEY`: Your OpenAI API key for transcription services
- `NEXT_PUBLIC_API_URL`: API URL (will be auto-configured for Docker)
- Other optional services as needed

### 2. Local Development with Docker

```bash
# Build and run the application
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The application will be available at `http://localhost:3000`

### 3. Production Deployment

For production environments:

```bash
# Use the production compose file
docker-compose -f docker-compose.prod.yml up -d --build

# Check health status
curl http://localhost/api/health
```

## Docker Commands

### Build Only
```bash
docker build -t chat-assistant-web .
```

### Run Container Directly
```bash
docker run -p 3000:3000 --env-file .env chat-assistant-web
```

### Health Check
```bash
# Check if the application is healthy
curl http://localhost:3000/api/health
```

## AWS EC2 Deployment

### 1. EC2 Instance Setup

Launch an EC2 instance with the following specifications:
- **Instance Type**: t3.small or larger (minimum 2GB RAM)
- **AMI**: Amazon Linux 2 or Ubuntu 20.04+
- **Security Group**: Allow inbound traffic on ports 80, 443, and 22

### 2. Install Docker on EC2

For Amazon Linux 2:
```bash
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

For Ubuntu:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ubuntu
```

### 3. Deploy Application

```bash
# Clone your repository
git clone <your-repo-url>
cd chat-assistant-web

# Configure environment variables
cp .env.example .env
nano .env  # Edit with your production values

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Configure Reverse Proxy (Optional)

For production, consider using nginx as a reverse proxy:

```bash
# Install nginx
sudo yum install -y nginx  # Amazon Linux
# or
sudo apt install -y nginx  # Ubuntu

# Configure nginx (create /etc/nginx/conf.d/chat-assistant.conf)
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Environment Variables for Production

Update your `.env` file for production:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXTAUTH_URL=https://your-domain.com
OPENAI_API_KEY=your_actual_openai_key
# Add other production-specific variables
```

## Monitoring and Maintenance

### Health Checks
```bash
# Check application health
curl http://your-domain.com/api/health

# Check Docker container status
docker-compose ps

# View logs
docker-compose logs -f chat-assistant-web
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup and Recovery
```bash
# Export environment variables
docker-compose config > backup-config.yml

# Create image backup
docker save chat-assistant-web:latest | gzip > chat-assistant-backup.tar.gz
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find and kill process using port 3000
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Permission denied**
   ```bash
   # Add user to docker group
   sudo usermod -a -G docker $USER
   # Logout and login again
   ```

3. **Out of memory**
   ```bash
   # Check memory usage
   docker stats
   # Consider upgrading EC2 instance or adding swap
   ```

4. **Environment variables not loading**
   ```bash
   # Verify .env file exists and has correct permissions
   ls -la .env
   # Check if variables are loaded in container
   docker-compose exec chat-assistant-web env
   ```

## Security Considerations

- Never commit `.env` files to version control
- Use secrets management for production API keys
- Configure proper firewall rules on EC2
- Enable HTTPS with SSL certificates (Let's Encrypt recommended)
- Regularly update Docker images and dependencies
- Monitor logs for security issues

## Performance Optimization

- Use multi-stage Docker builds (already implemented)
- Enable gzip compression in nginx
- Configure proper caching headers
- Monitor resource usage and scale as needed
- Consider using Docker Swarm or Kubernetes for high availability
