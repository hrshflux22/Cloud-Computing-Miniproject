# Build the project
Write-Host "Building project..." -ForegroundColor Green
npm run build

# Check if build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Configuration - UPDATE THESE VALUES
$BUCKET_NAME = "your-bucket-name"
$DISTRIBUTION_ID = "YOUR_DISTRIBUTION_ID"

# Upload to S3
Write-Host "Uploading to S3..." -ForegroundColor Green
aws s3 sync build/ s3://$BUCKET_NAME --delete

# Check if upload was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "S3 upload failed!" -ForegroundColor Red
    exit 1
}

# Invalidate CloudFront cache
Write-Host "Invalidating CloudFront cache..." -ForegroundColor Green
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

# Check if invalidation was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "CloudFront invalidation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment complete! 🎉" -ForegroundColor Green
Write-Host "Your site will be updated in 1-2 minutes." -ForegroundColor Cyan
