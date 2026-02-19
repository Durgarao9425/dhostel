# Quick Start - AWS EC2 Deployment (TL;DR)

## 5-Minute Summary of What Changed

Your backend wasn't deploying on AWS because:
1. ❌ Database host was hardcoded to `localhost` (AWS RDS is NOT localhost)
2. ❌ Server wasn't binding to `0.0.0.0` (couldn't accept external traffic)
3. ❌ No environment variable validation (cryptic errors)
4. ❌ Database migrations weren't running on startup

**Fixed:** All code is now AWS-ready! ✅

---

## What Was Changed

### Code Changes (4 files):
1. **server.ts** - Now binds to `0.0.0.0:8081` instead of localhost
2. **database.ts** - Validates required environment variables, supports RDS
3. **package.json** - Start script runs migrations automatically
4. **monthlyFeesGeneration.ts** - Cron jobs aware of production/development

### New Files Created (6 files):
1. **backend/.env.example** - Environment variable template
2. **frontend/.env.example** - Frontend environment template
3. **AWS_EC2_DEPLOYMENT_GUIDE.md** - Step-by-step deployment guide
4. **AWS_DEPLOYMENT_CHECKLIST.md** - Deployment verification checklist
5. **CHANGES_FOR_AWS_DEPLOYMENT.md** - Detailed change documentation
6. **QUICK_START_AWS.md** - This file

---

## Deploy in 10 Steps

### 1. Create AWS RDS Database (MySQL)
```
AWS Console → RDS → Create Database
- Engine: MySQL 8.0
- Instance: db.t3.micro (free tier)
- DB instance identifier: hostel-management-db
- Master username: dbadmin
- Master password: [Your secure password]
- Database name: Hostel
- Note the Endpoint when complete (e.g., hostel-mgmt-db.xxx.rds.amazonaws.com)
```

### 2. Create EC2 Instance (Ubuntu 22.04)
```
AWS Console → EC2 → Launch Instances
- AMI: Ubuntu Server 22.04 LTS
- Instance type: t2.micro (free tier) or t3.small
- Public IP: Enable
- Security Group: Create new
  - Allow SSH port 22 (from your IP)
  - Allow HTTP port 80 (from anywhere)
  - Allow HTTPS port 443 (from anywhere)
  - Allow TCP port 8081 (from anywhere)
- Key pair: Create and download hostel-backend-key.pem
- Launch and note Public IP
```

### 3. Connect to EC2
```bash
# Mac/Linux
chmod 400 hostel-backend-key.pem
ssh -i hostel-backend-key.pem ubuntu@your-ec2-public-ip

# Windows: Use PuTTY with converted .ppk file
```

### 4. Install Required Tools
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install other tools
sudo apt install -y git mysql-client-core-8.0 nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 5. Clone and Build Repository
```bash
cd /home/ubuntu
git clone https://github.com/your-username/your-hostel-repo.git
cd your-hostel-repo/backend

npm install
npm run build
```

### 6. Create .env File
```bash
nano .env
```
**Copy and paste (update with your values):**
```env
NODE_ENV=production
PORT=8081
HOST=0.0.0.0

DB_HOST=your-rds-endpoint.c9akciq32.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=dbadmin
DB_PASSWORD=your_rds_password
DB_NAME=Hostel

JWT_SECRET=generate_with_openssl_rand_base64_32
JWT_EXPIRES_IN=7d

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

ALLOWED_ORIGINS=https://your-frontend-domain.com

EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@hostelmanagement.com
PASSWORD_RESET_EXPIRES_IN=1h

FRONTEND_URL=https://your-frontend-domain.com
```

**Save:** Press `Ctrl+O` → `Enter` → `Ctrl+X`

### 7. Test Database Connection
```bash
# Test RDS connection
mysql -h your-rds-endpoint.c9akciq32.us-east-1.rds.amazonaws.com \
  -u dbadmin -p -e "SELECT VERSION();"

# Should show MySQL version
```

### 8. Initialize Database
```bash
npm run migrate
npm run init:relations
npm run init:id-proof-types
```

### 9. Start with PM2
```bash
pm2 start "npm start" --name "hostel-backend"
pm2 save
pm2 startup
# Run the command shown by pm2 startup

# Verify
pm2 status
pm2 logs hostel-backend
```

### 10. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/hostel-backend
```
**Paste this:**
```nginx
upstream hostel_backend {
    server localhost:8081;
}

server {
    listen 80;
    server_name your-backend-domain.com;

    location / {
        proxy_pass http://hostel_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Enable and reload:**
```bash
sudo ln -s /etc/nginx/sites-available/hostel-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Verify Deployment

```bash
# Test health endpoint
curl http://localhost:8081/health
# Should return: {"success":true,"message":"Server is running"...}

# Check logs
pm2 logs hostel-backend

# Check if backend is running
pm2 status
```

---

## Production Checklist

- [ ] Database created on RDS with strong password
- [ ] EC2 instance running and accessible
- [ ] Node.js v18+ installed
- [ ] Code built successfully
- [ ] .env file configured with RDS endpoint
- [ ] Database migrations completed
- [ ] Backend starts without errors
- [ ] PM2 process is running
- [ ] Health check endpoint responds
- [ ] Nginx configured as reverse proxy
- [ ] Security groups allow traffic
- [ ] JWT secret is strong (not the default)
- [ ] Frontend domain configured in CORS

---

## Security Reminders

⚠️ **IMPORTANT:**
- Never commit `.env` file to GitHub
- Use strong, unique passwords for RDS
- Generate JWT secret: `openssl rand -base64 32`
- Use Gmail app-specific passwords (not your main password)
- Restrict security groups to necessary ports only
- Keep SSH key file safe and private
- Enable RDS automated backups

---

## Troubleshooting

### Backend won't connect to database
```bash
# Check RDS endpoint is correct in .env
# Test connection manually:
mysql -h your-rds-endpoint -u dbadmin -p
# Type your RDS password when prompted
```

### Port 8081 not accessible
```bash
# Check security group allows port 8081
# Verify backend is running:
pm2 status
pm2 logs hostel-backend

# Check if port is listening:
netstat -tlnp | grep 8081
```

### Nginx not working
```bash
# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Database migrations failed
```bash
# Run migrations with verbose output
npm run migrate -- --verbose

# Check if tables exist
mysql -h your-rds-endpoint -u dbadmin -p -e "USE Hostel; SHOW TABLES;"
```

---

## Useful Commands

```bash
# SSH into EC2
ssh -i hostel-backend-key.pem ubuntu@your-ec2-public-ip

# View backend status
pm2 status
pm2 logs hostel-backend -f  # Follow logs

# Restart backend
pm2 restart hostel-backend

# Check running processes
netstat -tlnp

# Check disk space
df -h

# Check memory
free -h

# Stop backend
pm2 stop hostel-backend

# Start backend
pm2 start "npm start" --name "hostel-backend"

# Reload Nginx
sudo systemctl reload nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Add SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-backend-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## What's Different From Before?

### Before (Broken)
```env
DB_HOST=localhost          # ❌ Fails on AWS
HOST=default              # ❌ Only localhost
ALLOWED_ORIGINS=hardcoded # ❌ Breaks with different domain
```

### Now (Working)
```env
DB_HOST=your-rds-endpoint # ✅ Uses AWS RDS
HOST=0.0.0.0             # ✅ Accepts external traffic
ALLOWED_ORIGINS=env-based # ✅ Configurable per environment
```

---

## Next Steps

1. Follow the **10 steps** above
2. Verify with the **Troubleshooting** section
3. Deploy frontend (optional)
4. Set up monitoring
5. Enable automated backups

---

## Need Help?

- **Deployment Guide:** See `AWS_EC2_DEPLOYMENT_GUIDE.md`
- **Checklist:** See `AWS_DEPLOYMENT_CHECKLIST.md`
- **Code Changes:** See `CHANGES_FOR_AWS_DEPLOYMENT.md`

---

## Success! 🎉

If you see this in `pm2 logs hostel-backend`:
```
🚀 Server running on Port 8081
📍 Listening on 0.0.0.0:8081
✅ Database connected successfully
✓ Monthly fees generation cron job scheduled
```

Your backend is running on AWS! 🚀

