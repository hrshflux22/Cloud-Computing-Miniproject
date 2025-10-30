# Install AWS CLI on Windows

## Method 1: Using MSI Installer (Recommended)

### Step 1: Download AWS CLI
1. Download the AWS CLI installer from:
   - **64-bit**: https://awscli.amazonaws.com/AWSCLIV2.msi
   - Or visit: https://aws.amazon.com/cli/

### Step 2: Install
1. Run the downloaded `.msi` file
2. Follow the installation wizard
3. Click "Next" → "Next" → "Install"
4. Click "Finish"

### Step 3: Verify Installation
1. **Close and reopen** PowerShell/Terminal
2. Run:
```powershell
aws --version
```

You should see something like:
```
aws-cli/2.x.x Python/3.x.x Windows/10 exe/AMD64
```

## Method 2: Using Winget (Windows Package Manager)

If you have Windows 11 or updated Windows 10:

```powershell
winget install Amazon.AWSCLI
```

Then restart your terminal.

## Method 3: Using Chocolatey

If you have Chocolatey installed:

```powershell
choco install awscli
```

## Configure AWS CLI

After installation, configure your AWS credentials:

```powershell
aws configure
```

You'll be prompted for:
1. **AWS Access Key ID**: Get from AWS Console → IAM → Users → Security credentials
2. **AWS Secret Access Key**: Get from AWS Console (shown only once when created)
3. **Default region name**: `us-east-1` (or your preferred region)
4. **Default output format**: `json`

## Get AWS Credentials

### Step 1: Go to AWS Console
1. Sign in to: https://console.aws.amazon.com/
2. Search for **IAM** in the search bar
3. Click **Users** in the left sidebar
4. Click your username (or create a new user)

### Step 2: Create Access Keys
1. Go to **Security credentials** tab
2. Scroll to **Access keys** section
3. Click **Create access key**
4. Select **Use case**: Command Line Interface (CLI)
5. Check the acknowledgment box
6. Click **Next**
7. Add description (optional): "S3 Deployment"
8. Click **Create access key**
9. **IMPORTANT**: Save both:
   - Access key ID
   - Secret access key (you won't see this again!)
10. Click **Done**

## Test AWS CLI

After configuration, test it:

```powershell
# List your S3 buckets
aws s3 ls

# Check your AWS identity
aws sts get-caller-identity
```

## Now Deploy Your App

Once AWS CLI is installed and configured, you can run:

```powershell
# Upload to S3
aws s3 sync build/ s3://nimbus-hr-miniproject-grp20 --delete

# Or use the deployment script
.\deploy.ps1
```

## Troubleshooting

### "aws: command not found" after installation
- **Solution**: Restart your terminal/PowerShell completely
- Close all terminal windows and open a new one
- If still not working, restart your computer

### "Unable to locate credentials"
- **Solution**: Run `aws configure` and enter your credentials

### "Access Denied" errors
- **Solution**: Check your IAM user has permissions:
  - `AmazonS3FullAccess` (or custom S3 policy)
  - `CloudFrontFullAccess` (if using CloudFront)

### PowerShell Execution Policy Error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Alternative: Use AWS Console

If you can't install AWS CLI or prefer a GUI:

1. Go to your S3 bucket in AWS Console
2. Click **Upload**
3. Open your local `build` folder
4. Select all files and folders inside `build` (including `index.html` and `assets` folder)
5. Drag and drop them into the S3 upload interface
6. Click **Upload**

This works but is slower and doesn't sync automatically.

---

**After installation, return to the main deployment guide:** `AWS_DEPLOYMENT_GUIDE.md`
