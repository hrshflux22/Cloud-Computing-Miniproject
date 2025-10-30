# Quick Start: DynamoDB Setup for Nimbus HR

Follow these steps in order:

## 1. Create DynamoDB Tables (5 minutes)

### Create Employees Table
```
AWS Console → DynamoDB → Create table
- Table name: Employees
- Partition key: email (String)
- Settings: Default, On-demand capacity
→ Create table
```

### Create LeaveRequests Table
```
AWS Console → DynamoDB → Create table
- Table name: LeaveRequests  
- Partition key: requestId (String)
- Settings: Default, On-demand capacity
→ Create table
```

### Add GSI to LeaveRequests (Optional but Recommended)
```
Go to LeaveRequests table → Indexes → Create index
- Partition key: employeeEmail (String)
- Sort key: appliedDate (String)
- Index name: byEmployee
- Projected attributes: All
→ Create index
```

---

## 2. Update Lambda Function (10 minutes)

### Update Function Code
1. Go to **Lambda → Your function → Code tab**
2. Replace `handler.py` with the code from `aws/lambda/handler.py`
3. Click **Deploy**

### Add Environment Variables
1. Go to **Configuration → Environment variables → Edit**
2. Add these:
   ```
   SNS_TOPIC_ARN = (your SNS topic ARN from SNS console)
   EMPLOYEES_TABLE = Employees
   LEAVE_REQUESTS_TABLE = LeaveRequests
   ```
3. Click **Save**

### Update Lambda IAM Role
1. Go to **Configuration → Permissions**
2. Click the Role name (opens IAM)
3. Click **Add permissions → Attach policies**
4. Search and attach: **AmazonDynamoDBFullAccess**
5. Also attach: **AmazonSNSFullAccess** (if not already attached)

---

## 3. Test Lambda Function (5 minutes)

### Test: Create Employee
```json
{
  "action": "createEmployee",
  "employeeEmail": "test@example.com",
  "employeeName": "Test User",
  "password": "TestPass123!",
  "position": "Engineer",
  "department": "IT",
  "salary": 75000
}
```

Expected response: `{"success": true, ...}`

### Test: List Employees
```json
{
  "action": "listEmployees"
}
```

Expected response: Array of employees

---

## 4. Frontend Integration (Next Steps)

After Lambda is working, I'll update:
- `src/services/lambdaService.ts` - Add DynamoDB API calls
- `src/App.tsx` - Replace localStorage with API calls
- Rebuild and redeploy to S3

---

## Quick Command Reference

### Deploy Lambda Code (if you have AWS CLI)
```powershell
cd aws/lambda
Compress-Archive -Path handler.py -DestinationPath function.zip -Force
aws lambda update-function-code `
  --function-name YOUR_FUNCTION_NAME `
  --zip-file fileb://function.zip
```

### Redeploy Frontend
```powershell
npm run build
aws s3 sync build/ s3://nimbus-hr-miniproject-grp20/ --delete
```

---

## What You Get

✅ **Persistent Data** - Employees and leave requests stored in DynamoDB  
✅ **Scalable** - No server management, auto-scales  
✅ **Email Notifications** - Via SNS when employees are added  
✅ **Full CRUD** - Create, read, update, delete operations  
✅ **AWS Academy Compatible** - Uses allowed services only  

---

## Next: Let me know when Lambda is working

Once you've completed steps 1-3 and Lambda test passes, I'll update the frontend to use DynamoDB!
