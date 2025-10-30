#!/bin/bash

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Configuration - UPDATE THESE VALUES
BUCKET_NAME="your-bucket-name"
DISTRIBUTION_ID="YOUR_DISTRIBUTION_ID"

# Upload to S3
echo "📤 Uploading to S3..."
aws s3 sync build/ s3://$BUCKET_NAME --delete

# Check if upload was successful
if [ $? -ne 0 ]; then
    echo "❌ S3 upload failed!"
    exit 1
fi

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

# Check if invalidation was successful
if [ $? -ne 0 ]; then
    echo "❌ CloudFront invalidation failed!"
    exit 1
fi

echo "✅ Deployment complete! 🎉"
echo "🌐 Your site will be updated in 1-2 minutes."
