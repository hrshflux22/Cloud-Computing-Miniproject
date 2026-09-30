
# Cloud Computing Mini-Project

A modern, serverless web application powered by **React (Vite)** on the frontend and **AWS (Lambda, DynamoDB, SES/EmailJS, CloudFront, S3)** on the backend. This project demonstrates full-stack cloud deployment, serverless RESTful architectures, and secure IAM credential management.

---

## Architecture Overview

```
[ Frontend (React + Vite) ] 
       │
       ├────► [ AWS S3 / CloudFront ] ── (Static Hosting & CDN)
       ├────► [ AWS Lambda ] ───────── (Serverless Business Logic)
       │           └────► [ AWS DynamoDB ] ── (NoSQL Data Store)
       └────► [ EmailJS / AWS SES ] ──── (Notification & Messaging)

```

---

## Tech Stack & Prerequisites

### **Tech Stack**

* **Frontend:** React, Vite, Lucide React, Radix UI, Tailwind CSS, Sonner, EmailJS
* **Backend / Serverless:** Python (`aws/lambda/handler.py`), AWS Lambda
* **Database:** AWS DynamoDB
* **Hosting & Infrastructure:** AWS S3, AWS CloudFront, Netlify
* **CLI & Automation:** AWS CLI, PowerShell / Bash deployment scripts

### **Prerequisites**

* [Node.js](https://nodejs.org/) (v18 or higher)
* [Python 3.x](https://www.python.org/)
* [AWS CLI](https://www.google.com/search?q=INSTALL_AWS_CLI.md) installed and configured with appropriate IAM permissions
* AWS Account with access to S3, DynamoDB, Lambda, and IAM

---

## Project Structure

```text
.
├── aws/
│   ├── iam/
│   │   ├── dynamodb_policy.json         # IAM policy for DynamoDB access
│   │   └── lambda_dynamodb_policy.json  # Execution role policy for Lambda
│   └── lambda/
│       └── handler.py                   # AWS Lambda Python function
├── build/                               # Compiled production output
├── aws-cloudfront-bucket-policy.json    # CloudFront origin bucket policy
├── aws-s3-bucket-policy.json            # S3 public/bucket policy
├── API_KEY_SETUP.md                     # Guide to setting up API keys
├── AWS_DEPLOYMENT_GUIDE.md              # Full AWS setup & deployment guide
├── DEPLOY_NETLIFY.md                    # Alternative frontend deployment
├── DYNAMODB_SETUP.md                    # DynamoDB table setup instructions
├── EMAILJS_SETUP.md                     # Email notification configuration
├── INSTALL_AWS_CLI.md                   # AWS CLI installation guide
├── QUICKSTART_DYNAMODB.md               # Quickstart guide for DynamoDB
├── deploy.sh                            # Shell deployment script (Linux/macOS)
├── deploy.ps1                           # PowerShell deployment script (Windows)
├── .env.example                         # Environment variables template
└── package.json                         # Node.js dependencies and scripts

```

---

## Getting Started

### 1. Environment Setup

Clone the repository and copy the example environment file:

```bash
cp .env.example .env

```

Open `.env` and populate your specific API keys and AWS identifiers. Refer to `API_KEY_SETUP.md` for details.

### 2. Install Dependencies

```bash
npm install

```

### 3. Run Locally

Start the development server with Vite:

```bash
npm run dev

```

---

## Cloud Infrastructure & Setup Guides

For detailed step-by-step setup instructions, refer to the documentation files included in this project:

* **AWS CLI:** See [`INSTALL_AWS_CLI.md`](https://www.google.com/search?q=INSTALL_AWS_CLI.md) for installation and credentials setup.
* **DynamoDB:** Follow [`DYNAMODB_SETUP.md`](https://www.google.com/search?q=DYNAMODB_SETUP.md) or [`QUICKSTART_DYNAMODB.md`](https://www.google.com/search?q=QUICKSTART_DYNAMODB.md) to initialize the database tables and apply policies in `aws/iam/`.
* **Lambda Function:** Deploy `aws/lambda/handler.py` using the execution policy in `aws/iam/lambda_dynamodb_policy.json`.
* **Email Service:** Configure email alerts via EmailJS/SES using [`EMAILJS_SETUP.md`](https://www.google.com/search?q=EMAILJS_SETUP.md).

---

## Deployment

### **Option 1: Automated Deployment (AWS S3 & CloudFront)**

Run the appropriate deployment script for your environment:

* **Linux / macOS:**
```bash
chmod +x deploy.sh
./deploy.sh

```


* **Windows (PowerShell):**
```powershell
.\deploy.ps1

```



For a manual walkthrough of CloudFront CDN configuration and S3 policy attachment, refer to [`AWS_DEPLOYMENT_GUIDE.md`](https://www.google.com/search?q=AWS_DEPLOYMENT_GUIDE.md).

### **Option 2: Frontend Deployment on Netlify**

To host the frontend on Netlify, consult [`DEPLOY_NETLIFY.md`](https://www.google.com/search?q=DEPLOY_NETLIFY.md).

---

## Execution Checklist

1. [ ] Install dependencies (`npm install`).
2. [ ] Configure local environment parameters in `.env`.
3. [ ] Provision the DynamoDB table and attach IAM policies.
4. [ ] Deploy the AWS Lambda function (`aws/lambda/handler.py`).
5. [ ] Build and deploy the frontend using `./deploy.sh` or `.\deploy.ps1`.
6. [ ] Verify CloudFront endpoint routing and service integration.
