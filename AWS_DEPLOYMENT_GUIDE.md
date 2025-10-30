# AWS S3 and CloudFront Deployment Guide

This guide will walk you through deploying your Employee Management System using AWS S3 for storage and CloudFront for global content delivery.

## Prerequisites

- AWS Account (free tier available)
- AWS CLI installed on your machine
- Your application built and ready for production

## Part 1: Build Your Application

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build for Production
```bash
npm run build
```

This creates a `build` folder with your production-ready files.

## Part 2: AWS S3 Setup

### Step 1: Create an S3 Bucket

1. **Go to AWS Console**
   - Navigate to: https://console.aws.amazon.com/s3/
   - Click **"Create bucket"**

2. **Bucket Configuration**
   - **Bucket name**: `your-app-name-unique` (must be globally unique)
   - **AWS Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Uncheck** "Block all public access" (we need public access for website hosting)
   - Check the acknowledgment box
   - Click **"Create bucket"**

### Step 2: Configure S3 for Static Website Hosting

1. **Open your bucket** and go to **Properties** tab
2. Scroll to **Static website hosting** section
3. Click **Edit**
4. Configure:
   - **Static website hosting**: Enable
   - **Hosting type**: Host a static website
   - **Index document**: `index.html`
   - **Error document**: `index.html` (important for React Router)
5. Click **Save changes**
6. **Note the website endpoint URL** (e.g., `http://your-bucket.s3-website-us-east-1.amazonaws.com`)

### Step 3: Set Bucket Policy for Public Access

1. Go to **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **Edit** and paste this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

**Replace** `your-bucket-name` with your actual bucket name.

4. Click **Save changes**

### Step 4: Upload Your Build Files

**Option A: Using AWS Console**
1. Go to **Objects** tab
2. Click **Upload**
3. Drag and drop all files from your `build` folder
4. Click **Upload**

**Option B: Using AWS CLI** (Recommended)

First, configure AWS CLI:
```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format: `json`

Then upload:
```bash
aws s3 sync build/ s3://your-bucket-name --delete
```

## Part 3: AWS CloudFront Setup (CDN)

CloudFront provides:
- HTTPS support
- Global content delivery (faster load times)
- Custom domain support
- Caching

### Step 1: Create CloudFront Distribution

1. **Go to CloudFront Console**
   - Navigate to: https://console.aws.amazon.com/cloudfront/
   - Click **"Create distribution"**

2. **Origin Settings**
   - **Origin domain**: Select your S3 bucket from dropdown
     - OR manually enter: `your-bucket-name.s3.us-east-1.amazonaws.com`
   - **Origin access**: Select "Origin access control settings (recommended)"
   - Click **"Create control setting"** if needed
   - **Name**: Use default or custom name
   - Click **Create**

3. **Default Cache Behavior Settings**
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD, OPTIONS
   - **Cache policy**: CachingOptimized (recommended)
   - Leave other settings as default

4. **Settings**
   - **Price class**: Use all edge locations (best performance) or select specific regions
   - **Alternate domain names (CNAMEs)**: (Optional) Add your custom domain
   - **Custom SSL certificate**: (If using custom domain) Request or import certificate
   - **Default root object**: `index.html`
   - **Standard logging**: Off (or On if you want logs)

5. Click **"Create distribution"**

⏱️ **Wait 10-20 minutes** for distribution to deploy (Status: "Enabled")

### Step 2: Update S3 Bucket Policy for CloudFront

After creating the distribution, CloudFront will show you a policy to add:

1. Go back to your **S3 bucket** → **Permissions** → **Bucket policy**
2. Update to allow CloudFront access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
                }
            }
        }
    ]
}
```

Replace:
- `your-bucket-name`
- `YOUR_ACCOUNT_ID` (12-digit AWS account number)
- `YOUR_DISTRIBUTION_ID` (from CloudFront console)

### Step 3: Configure Error Pages for React Router

1. In CloudFront console, open your distribution
2. Go to **Error pages** tab
3. Click **Create custom error response**
4. Configure:
   - **HTTP error code**: 403
   - **Customize error response**: Yes
   - **Response page path**: `/index.html`
   - **HTTP response code**: 200
5. Click **Create**
6. Repeat for error code **404**

This ensures React Router handles all routes properly.

## Part 4: Custom Domain (Optional)

### Step 1: Get SSL Certificate

1. Go to **AWS Certificate Manager** (ACM)
   - Region: **us-east-1** (required for CloudFront)
2. Click **Request certificate**
3. **Request public certificate**
4. **Domain names**: `yourdomain.com` and `www.yourdomain.com`
5. **Validation method**: DNS validation (recommended)
6. Click **Request**
7. Follow DNS validation steps (add CNAME records to your domain provider)
8. Wait for **Status: Issued**

### Step 2: Add Domain to CloudFront

1. Open your CloudFront distribution
2. Click **Edit**
3. **Alternate domain names (CNAMEs)**: Add `yourdomain.com`, `www.yourdomain.com`
4. **Custom SSL certificate**: Select your ACM certificate
5. Click **Save changes**

### Step 3: Update DNS Records

In your domain registrar (GoDaddy, Namecheap, etc.):

1. Add **CNAME record**:
   - **Name**: `www`
   - **Value**: `d123abc456def.cloudfront.net` (your CloudFront domain)
   - **TTL**: 300

2. For root domain, create **ALIAS** or **ANAME** record pointing to CloudFront
   - OR use a service like Route 53

## Part 5: Environment Variables

If your app uses environment variables (like EmailJS), ensure they're included at build time.

### Step 1: Create Production .env File

Create `.env.production`:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### Step 2: Build with Production Variables

```bash
npm run build
```

Vite automatically uses `.env.production` during build.

## Part 6: Continuous Deployment Script

Create a deployment script for easy updates.

### Create `deploy.sh` (Linux/Mac):

```bash
#!/bin/bash

# Build the project
echo "Building project..."
npm run build

# Upload to S3
echo "Uploading to S3..."
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "Deployment complete!"
```

### Create `deploy.ps1` (Windows PowerShell):

```powershell
# Build the project
Write-Host "Building project..." -ForegroundColor Green
npm run build

# Upload to S3
Write-Host "Uploading to S3..." -ForegroundColor Green
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
Write-Host "Invalidating CloudFront cache..." -ForegroundColor Green
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

Write-Host "Deployment complete!" -ForegroundColor Green
```

Make it executable and run:

**Windows:**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## Part 7: Security Best Practices

### 1. Enable CloudFront Security Headers

Add custom headers in CloudFront:

1. Go to your distribution → **Behaviors** tab
2. Edit the default behavior
3. Under **Response headers policy**, create new policy with:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

### 2. Restrict S3 Bucket Access

If using CloudFront OAC (Origin Access Control):
- Block all public S3 access
- Only allow CloudFront to access bucket
- Update bucket policy accordingly

### 3. Enable CloudFront WAF (Optional)

For additional protection:
1. Go to **WAF & Shield** in AWS Console
2. Create Web ACL
3. Add rules (SQL injection, XSS protection)
4. Associate with CloudFront distribution

## Cost Estimation

### Free Tier (12 months):
- **S3**: 5 GB storage, 20,000 GET requests, 2,000 PUT requests
- **CloudFront**: 1 TB data transfer out, 10,000,000 HTTP/HTTPS requests
- **Route 53**: First hosted zone ($0.50/month after trial)

### Beyond Free Tier:
- **S3**: ~$0.023 per GB/month
- **CloudFront**: ~$0.085 per GB (first 10 TB)
- **Very affordable for small to medium applications**

## Monitoring

### CloudWatch Metrics

1. Go to **CloudWatch Console**
2. View metrics for:
   - S3: Storage, Requests
   - CloudFront: Requests, Data Transfer, Error Rate
3. Set up alarms for unusual activity

## Troubleshooting

### Issue: 403 Forbidden
- Check bucket policy allows public read
- Verify CloudFront OAC settings
- Ensure files uploaded correctly

### Issue: 404 Not Found on Routes
- Add error page configurations in CloudFront
- Both 403 and 404 should redirect to `/index.html` with 200 status

### Issue: Old Content Showing
- Invalidate CloudFront cache
- Wait 1-2 minutes for propagation

### Issue: CORS Errors
- Add CORS policy to S3 bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

## Quick Reference Commands

```bash
# Build project
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"

# List S3 buckets
aws s3 ls

# List CloudFront distributions
aws cloudfront list-distributions
```

## Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS CLI Installation](https://aws.amazon.com/cli/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

## Support

For AWS support:
- Free tier: Community forums
- Paid: AWS Support plans available

---

**Your application will be accessible at:**
- S3 Direct: `http://your-bucket.s3-website-us-east-1.amazonaws.com`
- CloudFront: `https://d123abc456def.cloudfront.net`
- Custom Domain: `https://yourdomain.com` (if configured)

🎉 **Deployment Complete!**
