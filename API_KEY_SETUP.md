# API Key Authentication Setup

## What Changed

Added API key authentication to secure your Lambda function from unauthorized access.

## Steps to Complete Setup

### 1. Update Lambda Handler Code

✅ **Already done** - The `handler.py` code now checks for API key

### 2. Add API_KEY Environment Variable in Lambda

1. Go to **AWS Lambda Console**
2. Open your **DynamoDB Lambda function**
3. Click **Configuration** tab → **Environment variables**
4. Click **Edit**
5. Click **Add environment variable**:
   - **Key**: `API_KEY`
   - **Value**: `nimbus-hr-2025-secure-api-key-12345abcde`
6. Click **Save**

### 3. Update Lambda Code in Console

Copy the updated `aws/lambda/handler.py` to your Lambda function and click **Deploy**.

### 4. Rebuild and Deploy Frontend

```powershell
npm run build
aws s3 sync build/ s3://nimbus-hr-miniproject-grp20/ --delete
```

## How It Works

**Frontend → Lambda:**
```typescript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'nimbus-hr-2025-secure-api-key-12345abcde'
}
```

**Lambda Verification:**
```python
api_key = os.environ.get('API_KEY')
request_key = event.get('headers', {}).get('x-api-key')
if not request_key or request_key != api_key:
    return 401 Unauthorized
```

## Security Benefits

✅ Only requests with correct API key can access Lambda  
✅ Prevents unauthorized API calls  
✅ Blocks brute force attacks  
✅ API key is not exposed in frontend code (stored in .env)

## Important Notes

- **Never commit .env file to Git** (already in .gitignore)
- **Change the API key** to something more secure/random for production
- **Keep API key secret** - don't share publicly
- The API key is included in the build, so keep your S3 bucket files private

## Testing

After setup, try accessing the website:
1. **With API key** (normal use) → Should work ✅
2. **Without API key** (if someone calls Lambda directly) → 401 Unauthorized ❌

Your application is now more secure! 🔒
