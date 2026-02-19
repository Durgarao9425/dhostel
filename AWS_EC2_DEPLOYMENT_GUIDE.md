# AWS EC2 Deployment Guide - Hostel Management System

## Overview
This guide provides step-by-step instructions to deploy the Hostel Management System backend on AWS EC2.

## Prerequisites
- AWS Account with EC2 access
- Basic knowledge of AWS console
- SSH client (Terminal on Mac/Linux, PuTTY/PowerShell on Windows)
- Domain name (optional, for production)

---

## STEP 1: Create AWS RDS MySQL Database

### 1.1 Create RDS Instance
1. Go to AWS Console → RDS → Databases → Create database
2. Select **MySQL** as database engine (version 8.0 or later)
3. Choose **Free tier** template (for testing) or appropriate instance class
4. Set DB instance identifier: `hostel-management-db`
5. Set Master username: `dbadmin` (or your choice)
6. Set Master password: `[Strong password - save this!]`
7. Configure VPC security group:
   - Create new security group: `hostel-db-sg`
   - Allow inbound traffic on port 3306 from EC2 security group
8. Under Additional configuration:
   - Initial database name: `Hostel`
   - Backup retention: 7 days
   - Enable Multi-AZ: No (for dev), Yes (for production)
9. Click **Create database**
10. Wait for database to be available (5-10 minutes)
11. Note the **Endpoint** (e.g., `hostel-management-db.c9akciq32.us-east-1.rds.amazonaws.com`)

### 1.2 Security Group Configuration
1. In RDS → Databases → Select your database
2. Under Security group rules, modify inbound rules
3. Add rule:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: EC2 security group (e.g., `hostel-backend-sg`)
4. Save rules

---

## STEP 2: Create EC2 Instance

### 2.1 Launch EC2 Instance
1. Go to AWS Console → EC2 → Instances → Launch instances
2. Choose AMI: **Ubuntu Server 22.04 LTS** (free tier eligible)
3. Instance type: **t2.micro** (free tier) or **t3.small** (recommended)
4. Configure instance details:
   - Number of instances: 1
   - Network: Default VPC
   - Auto-assign public IP: Enable
5. Add storage: 20 GB (default)
6. Add tags:
   - Key: `Name`, Value: `hostel-backend-server`
7. Create security group: `hostel-backend-sg`
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere
   - Allow HTTPS (port 443) from anywhere
   - Allow custom TCP (port 8081) from anywhere
8. Review and launch
9. Create/select key pair: `hostel-backend-key`
   - Download the `.pem` file (save securely!)
10. Launch instance
11. Wait for instance to be running and note the **Public IP** (e.g., `54.123.45.67`)

---

## STEP 3: Connect to EC2 Instance

### 3.1 SSH Connection (Mac/Linux/Windows 10+)
```bash
# Change permissions on key file
chmod 400 hostel-backend-key.pem

# Connect to instance
ssh -i hostel-backend-key.pem ubuntu@your-ec2-public-ip
# Example: ssh -i hostel-backend-key.pem ubuntu@54.123.45.67
```

### 3.2 Windows Users (PuTTY)
1. Download PuTTY and PuTTYgen
2. Convert `.pem` to `.ppk`:
   - Open PuTTYgen → Load → Select your `.pem` file → Save private key
3. Open PuTTY:
   - Host: `ubuntu@your-ec2-public-ip`
   - Connection → SSH → Auth → Browse and select `.ppk` file
   - Open connection

---

## STEP 4: Prepare EC2 Instance

### 4.1 Update System Packages
```bash
sudo apt update
sudo apt upgrade -y
```

### 4.2 Install Node.js and npm
```bash
# Install Node.js 18+ using NodeSource repository
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 4.3 Install MySQL Client (to test database connection)
```bash
sudo apt install -y mysql-client-core-8.0
```

### 4.4 Install PM2 (Process Manager for Node.js)
```bash
sudo npm install -g pm2

# Enable PM2 auto-startup
pm2 startup
# Copy and run the command shown by pm2 startup
```

### 4.5 Install Nginx (Reverse Proxy)
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## STEP 5: Clone Repository and Setup Backend

### 5.1 Clone Repository
```bash
# Install git
sudo apt install -y git

# Clone your repository
cd /home/ubuntu
git clone https://github.com/your-username/your-hostel-repo.git
cd your-hostel-repo
```

### 5.2 Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### 5.3 Create .env File
```bash
nano .env
```

**Paste the following and update with your actual values:**
```env
NODE_ENV=production
PORT=8081
HOST=0.0.0.0

# AWS RDS Database
DB_HOST=hostel-management-db.c9akciq32.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=dbadmin
DB_PASSWORD=your_rds_password_here
DB_NAME=Hostel

# JWT
JWT_SECRET=your_production_jwt_secret_here
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM=noreply@hostelmanagement.com
PASSWORD_RESET_EXPIRES_IN=1h

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com
```

**Save:** `Ctrl+O` → `Enter` → `Ctrl+X`

### 5.4 Test Database Connection
```bash
# Test RDS connection
mysql -h hostel-management-db.c9akciq32.us-east-1.rds.amazonaws.com \
  -u dbadmin -p -e "SELECT VERSION();"

# When prompted, enter your RDS password
# You should see the MySQL version if connection is successful
```

### 5.5 Run Database Migrations
```bash
npm run migrate
```

### 5.6 Initialize Database Tables
```bash
npm run init:relations
npm run init:id-proof-types
```

---

## STEP 6: Start Backend Server

### 6.1 Start with PM2
```bash
# Start the server
pm2 start "npm start" --name "hostel-backend"

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs hostel-backend
```

### 6.2 Verify Server is Running
```bash
# Test health check endpoint
curl http://localhost:8081/health

# You should see:
# {"success":true,"message":"Server is running","timestamp":"2024-01-26T10:30:45.123Z"}
```

---

## STEP 7: Configure Nginx Reverse Proxy

### 7.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/hostel-backend
```

**Paste the following configuration:**
```nginx
upstream hostel_backend {
    server localhost:8081;
}

server {
    listen 80;
    server_name your-backend-domain.com;

    # Redirect HTTP to HTTPS (optional, requires SSL certificate)
    # return 301 https://$server_name$request_uri;

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

        # Increase timeout for large uploads
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;
}
```

### 7.2 Enable Nginx Configuration
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/hostel-backend /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## STEP 8: Setup Frontend (Optional)

### 8.1 Build Frontend
```bash
# Go to frontend directory
cd /home/ubuntu/your-hostel-repo/frontend

# Install dependencies
npm install

# Create production .env file
nano .env
```

**Paste:**
```env
VITE_API_URL=http://your-backend-domain.com/api
VITE_APP_NAME=Hostel Management System
VITE_ENVIRONMENT=production
```

**Build frontend:**
```bash
npm run build
# This creates a 'dist' folder with production-ready files
```

### 8.2 Deploy Frontend with Nginx
```bash
# Copy frontend build to web root
sudo cp -r dist/* /var/www/html/

# Or create separate Nginx config for frontend
sudo nano /etc/nginx/sites-available/hostel-frontend
```

---

## STEP 9: SSL Certificate (HTTPS) - Let's Encrypt

### 9.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 9.2 Get SSL Certificate
```bash
sudo certbot --nginx -d your-backend-domain.com

# Follow the prompts to provide your email and accept terms
# Certbot will automatically configure Nginx with SSL
```

### 9.3 Auto-renewal
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certificate will auto-renew 30 days before expiration
```

---

## STEP 10: Monitor and Maintain

### 10.1 Monitor Application Logs
```bash
# View logs
pm2 logs hostel-backend

# View specific number of lines
pm2 logs hostel-backend --lines 100

# Clear logs
pm2 flush
```

### 10.2 Monitor EC2 Resources
1. Go to AWS Console → CloudWatch → Dashboards
2. Create dashboard to monitor:
   - EC2 CPU usage
   - Memory usage
   - Network in/out
   - RDS database metrics

### 10.3 Setup CloudWatch Alarms
```bash
# Example: Alert if CPU > 80%
# Create via AWS Console → CloudWatch → Alarms → Create alarm
```

### 10.4 Backup RDS Database
1. Go to AWS Console → RDS → Databases → Select your database
2. Actions → Create snapshot
3. Set backup retention to 7-30 days for automatic backups

---

## Troubleshooting

### Problem: Backend not connecting to RDS
```bash
# Check security group allows MySQL port 3306
# Verify DB_HOST is correct RDS endpoint
# Test connection:
mysql -h your-rds-endpoint -u dbadmin -p
```

### Problem: Port 8081 not accessible
```bash
# Check EC2 security group allows port 8081
# Verify backend is running:
pm2 status
pm2 logs hostel-backend

# Check if port is listening:
netstat -tlnp | grep 8081
```

### Problem: CORS errors
```bash
# Update ALLOWED_ORIGINS in .env with your frontend domain
# Restart backend:
pm2 restart hostel-backend
```

### Problem: Database migrations failed
```bash
# Check migration files exist
ls backend/migrations/

# Run migrations manually
npm run migrate

# Check database connection
npm run migrate -- --verbose
```

### Problem: Email not sending
```bash
# Verify Gmail app password is correct (16 chars, no spaces)
# Enable "Less secure app access" or use App Password
# Check email configuration in .env
```

---

## Environment Variables Summary

| Variable | Value | Description |
|----------|-------|-------------|
| NODE_ENV | production | Set to production for AWS |
| PORT | 8081 | Port where backend runs |
| HOST | 0.0.0.0 | Listen on all network interfaces |
| DB_HOST | RDS endpoint | AWS RDS endpoint |
| DB_USER | dbadmin | Database user |
| DB_PASSWORD | ✓ Secure | RDS password |
| DB_NAME | Hostel | Database name |
| JWT_SECRET | ✓ Secure | Generate: `openssl rand -base64 32` |
| ALLOWED_ORIGINS | Your domain | Frontend URL for CORS |
| EMAIL_USER | Gmail | Gmail address |
| EMAIL_PASSWORD | App password | Google app-specific password |
| FRONTEND_URL | Your frontend | For password reset links |

---

## Performance Tips

### 1. Enable Gzip Compression
Already configured in Nginx setup above

### 2. Optimize RDS
- Set appropriate instance class
- Enable read replicas for high traffic
- Set automated backups

### 3. Use CloudFront for Static Files
- Set up AWS CloudFront distribution for uploaded files
- Cache assets for better performance

### 4. Implement Rate Limiting
Already in code via `express-rate-limit`

### 5. Monitor Database Performance
1. AWS Console → RDS → Performance Insights
2. Monitor slow queries
3. Optimize indexes as needed

---

## Security Checklist

- [ ] Change RDS password from default
- [ ] Generate strong JWT secret: `openssl rand -base64 32`
- [ ] Use HTTPS/SSL certificate (Let's Encrypt)
- [ ] Restrict Security Groups to minimum required ports
- [ ] Enable VPC flow logs for monitoring
- [ ] Set backup retention for RDS (7-30 days)
- [ ] Use IAM roles instead of hardcoded credentials
- [ ] Enable EC2 detailed monitoring
- [ ] Regular database backups
- [ ] Keep Node.js and packages updated

---

## Useful Commands

```bash
# SSH into EC2
ssh -i key.pem ubuntu@your-ec2-ip

# View EC2 files
ls /home/ubuntu/your-repo/backend

# Check running processes
pm2 status

# Restart backend
pm2 restart hostel-backend

# Stop backend
pm2 stop hostel-backend

# Start backend
pm2 start "npm start" --name "hostel-backend"

# View Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory
free -h

# View running ports
netstat -tlnp
```

---

## Support & Documentation

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

## Next Steps

1. Deploy frontend (React) to AWS S3 + CloudFront or EC2
2. Set up CI/CD pipeline with GitHub Actions
3. Implement monitoring and alerting
4. Setup automated backups
5. Scale with Auto Scaling Groups
6. Use AWS Lambda for cron jobs instead of in-process cron

