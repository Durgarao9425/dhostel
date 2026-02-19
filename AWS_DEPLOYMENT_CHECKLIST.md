# AWS EC2 Deployment Checklist - Quick Reference

## Pre-Deployment (Local Machine)
- [ ] All code committed to GitHub
- [ ] `.env.example` files created (check backend and frontend)
- [ ] Build successful: `npm run build` in backend
- [ ] Frontend build successful: `npm run build` in frontend
- [ ] No console errors in development mode
- [ ] Database migrations exist in `backend/migrations/`
- [ ] Environment variables documented

## AWS Setup
- [ ] AWS Account created and verified
- [ ] RDS MySQL database created
  - [ ] Database endpoint noted (e.g., `hostel-management-db.xxx.rds.amazonaws.com`)
  - [ ] Master username and password saved securely
  - [ ] Security group allows inbound traffic on port 3306
- [ ] EC2 instance launched (Ubuntu 22.04 LTS)
  - [ ] Public IP noted
  - [ ] Security group created with SSH, HTTP, HTTPS, 8081 rules
  - [ ] Key pair downloaded and saved securely
  - [ ] Instance is running and initialized

## EC2 Setup
- [ ] SSH connection working: `ssh -i key.pem ubuntu@ec2-ip`
- [ ] System packages updated: `sudo apt update && sudo apt upgrade -y`
- [ ] Node.js installed: `node --version` (should be v18+)
- [ ] npm installed: `npm --version` (should be v9+)
- [ ] Git installed: `git --version`
- [ ] MySQL client installed: `mysql --version`
- [ ] PM2 installed globally: `pm2 --version`
- [ ] Nginx installed: `sudo systemctl status nginx` (should be running)

## Repository Setup on EC2
- [ ] Repository cloned: `git clone <your-repo-url>`
- [ ] Navigated to backend: `cd backend`
- [ ] Dependencies installed: `npm install` (successful without errors)
- [ ] TypeScript built: `npm run build` (dist folder created)

## Environment Configuration
- [ ] `.env` file created in `backend/` directory
- [ ] Database variables set correctly:
  ```
  DB_HOST=<RDS endpoint>
  DB_PORT=3306
  DB_USER=<your username>
  DB_PASSWORD=<your password>
  DB_NAME=Hostel
  ```
- [ ] Node environment set: `NODE_ENV=production`
- [ ] Server host set: `HOST=0.0.0.0`
- [ ] Server port set: `PORT=8081`
- [ ] JWT secret generated and set: `JWT_SECRET=<secure-random-string>`
- [ ] CORS origins set: `ALLOWED_ORIGINS=<your-frontend-domain>`
- [ ] Email credentials set (if needed)
- [ ] Frontend URL set: `FRONTEND_URL=<your-frontend-url>`

## Database Setup
- [ ] Database connectivity verified:
  ```bash
  mysql -h <RDS-endpoint> -u <user> -p -e "SELECT VERSION();"
  ```
- [ ] Database migrations run: `npm run migrate`
  - [ ] Check for migration errors
- [ ] Relations table initialized: `npm run init:relations`
- [ ] ID proof types initialized: `npm run init:id-proof-types`
- [ ] All initialization scripts completed without errors

## Application Startup
- [ ] Backend starts successfully: `npm start` (in backend directory)
- [ ] No connection errors in console
- [ ] No migration errors
- [ ] Cron job initialized successfully
- [ ] Database connection confirmed in logs
- [ ] Server listening on 0.0.0.0:8081

## PM2 Process Management
- [ ] PM2 started: `pm2 start "npm start" --name "hostel-backend"`
- [ ] PM2 saved: `pm2 save`
- [ ] PM2 startup configured: `pm2 startup`
- [ ] Backend shows as online: `pm2 status`
- [ ] Logs are clean: `pm2 logs hostel-backend`

## Health Checks
- [ ] Backend health check passes:
  ```bash
  curl http://localhost:8081/health
  # Should return: {"success":true,"message":"Server is running"...}
  ```
- [ ] API endpoint accessible:
  ```bash
  curl http://localhost:8081/api
  # Should return: {"success":true,"message":"Hostel Management API"...}
  ```
- [ ] Database query works (check logs for success message)
- [ ] No errors in PM2 logs

## Nginx Configuration
- [ ] Nginx config file created: `/etc/nginx/sites-available/hostel-backend`
- [ ] Nginx config linked: `sudo ln -s /etc/nginx/sites-available/hostel-backend /etc/nginx/sites-enabled/`
- [ ] Nginx config tested: `sudo nginx -t` (should show "successful")
- [ ] Nginx reloaded: `sudo systemctl reload nginx`
- [ ] Nginx status running: `sudo systemctl status nginx`
- [ ] Reverse proxy working:
  ```bash
  curl http://localhost:8081/health
  # OR
  curl http://your-ec2-public-ip/health
  ```

## SSL/HTTPS Setup (Optional but Recommended)
- [ ] Domain name configured to point to EC2 IP (if using domain)
- [ ] Certbot installed: `sudo apt install -y certbot python3-certbot-nginx`
- [ ] SSL certificate obtained: `sudo certbot --nginx -d your-domain.com`
- [ ] Certificate auto-renewal tested: `sudo certbot renew --dry-run`
- [ ] HTTPS working: `https://your-domain.com/health`

## Frontend Deployment (Optional)
- [ ] Frontend `.env` created with correct API URL
- [ ] Frontend built: `npm run build` (dist folder created)
- [ ] Frontend served from Nginx or S3 + CloudFront
- [ ] CORS origins include frontend URL in backend `.env`

## Production Security
- [ ] Security Group restricts access appropriately
- [ ] SSH access limited to specific IPs (if possible)
- [ ] RDS security group allows traffic only from EC2
- [ ] Passwords are strong and unique
- [ ] JWT secret is strong and randomly generated
- [ ] No sensitive data in git repository
- [ ] `.env` file is `.gitignore`d locally
- [ ] RDS backups enabled (7-30 days)
- [ ] EC2 instance has appropriate IAM role (if needed)

## Monitoring & Alerts
- [ ] CloudWatch monitoring enabled
- [ ] EC2 detailed monitoring enabled
- [ ] RDS performance insights enabled
- [ ] Alarms set for:
  - [ ] High CPU usage
  - [ ] High memory usage
  - [ ] Database connection failures
  - [ ] Backend process down (PM2)

## Backup & Disaster Recovery
- [ ] RDS automated backups enabled (7+ days retention)
- [ ] RDS manual snapshots taken
- [ ] Upload/media files backed up (if using local storage)
- [ ] `.env` backup stored securely (NOT in git)
- [ ] Database credentials saved securely
- [ ] SSH key backed up securely

## Post-Deployment Testing
- [ ] Health check endpoint responds: `/health`
- [ ] API root endpoint responds: `/api`
- [ ] Database queries execute successfully
- [ ] Authentication flows work (login/logout)
- [ ] File uploads work (if applicable)
- [ ] Email notifications work (if applicable)
- [ ] Monthly fees cron job logs appear (check with `pm2 logs`)
- [ ] Frontend can communicate with backend API

## Troubleshooting Commands
```bash
# Check backend status
pm2 status
pm2 logs hostel-backend

# Check if running on port 8081
netstat -tlnp | grep 8081

# Check Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Check database connection
mysql -h <RDS-endpoint> -u <user> -p -e "SELECT 1;"

# Restart backend
pm2 restart hostel-backend

# Check EC2 resources
free -h  # Memory
df -h    # Disk space
top      # Process usage
```

## Important Notes
- Backend must run with `NODE_ENV=production` on AWS
- Server must bind to `HOST=0.0.0.0` for external access
- Database host must be RDS endpoint, NOT localhost
- All environment variables must be set on EC2, not just in `.env`
- PM2 must be configured to restart on EC2 reboot
- Nginx acts as reverse proxy on port 80/443
- Backend runs internally on port 8081
- CORS origins must include your frontend domain
- Keep `.env` file secure and backed up separately

## Deployment Complete! ✅

Your application is now deployed on AWS EC2. Monitor logs regularly and keep the system updated.

```bash
# View logs in real-time
pm2 logs hostel-backend --lines 100

# Monitor system
watch -n 1 'pm2 status && echo "---" && free -h'
```

