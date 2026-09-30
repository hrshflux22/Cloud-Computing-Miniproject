
# Employee Management System

[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Build--Tool-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind--CSS-UI--Styling-38B2AC.svg)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB.svg)](https://www.python.org/)
[![AWS Lambda](https://img.shields.io/badge/AWS--Lambda-Serverless-FF9900.svg)](https://aws.amazon.com/lambda/)
[![AWS DynamoDB](https://img.shields.io/badge/AWS--DynamoDB-NoSQL--Database-4053D6.svg)](https://aws.amazon.com/dynamodb/)
[![AWS S3](https://img.shields.io/badge/AWS--S3-Object--Storage-569A31.svg)](https://aws.amazon.com/s3/)
[![AWS CloudFront](https://img.shields.io/badge/AWS--CloudFront-CDN-8C4FFF.svg)](https://aws.amazon.com/cloudfront/)
[![EmailJS](https://img.shields.io/badge/EmailJS-Notifications-FF6C37.svg)](https://www.emailjs.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployment-00C7B7.svg)](https://www.netlify.com/)

**An end-to-end Serverless Cloud Application & Deployment Pipeline designed for reliable web performance, automated infrastructure orchestration, and secure event-driven workflows. Built on a high-performance React (Vite) frontend and an AWS (Lambda, DynamoDB, CloudFront, S3) serverless backend, this project processes real-time user requests through Python microservices, manages persistence with NoSQL data structures, and orchestrates global asset distribution through CloudFront CDN caching and automated deployment scripts.**
---

## 📌 Table of Contents

* [Architecture Overview](https://www.google.com/search?q=%23-architecture-overview)
* [Prerequisites](https://www.google.com/search?q=%23-prerequisites)
* [Interactive Project Tree](https://www.google.com/search?q=%23-interactive-project-tree)
* [Getting Started](https://www.google.com/search?q=%23-getting-started)
* [Infrastructure & Setup Guides](https://www.google.com/search?q=%23-infrastructure--setup-guides)
* [Deployment Options](https://www.google.com/search?q=%23-deployment-options)
* [Interactive Execution Tracker](https://www.google.com/search?q=%23-interactive-execution-tracker)

---

## 🏗 Architecture Overview

```
[ Frontend (React + Vite) ] 
       │
       ├────► [ AWS S3 / CloudFront ] ── (Static Hosting & CDN)
       ├────► [ AWS Lambda ] ───────── (Serverless Business Logic)
       │           └────► [ AWS DynamoDB ] ── (NoSQL Data Store)
       └────► [ EmailJS / AWS SES ] ──── (Notification & Messaging)

```

---

## ⚡ Prerequisites

Before running or deploying this application, ensure you have the following installed and configured:

| Tool | Version / Requirement | Link |
| --- | --- | --- |
| **Node.js** | `v18.0.0` or higher | [Download](https://www.google.com/search?q=https://nodejs.org/) |
| **Python** | `3.x` | [Download](https://www.python.org/) |
| **AWS CLI** | Configured with IAM credentials | [Installation Guide](https://www.google.com/search?q=INSTALL_AWS_CLI.md) |
| **AWS Account** | Access to S3, DynamoDB, Lambda, IAM | [AWS Console](https://www.google.com/search?q=https://aws.amazon.com/console/) |

---

## 📂 Interactive Project Tree

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

## 🚀 Getting Started

Copy the template environment file to create your local `.env`:

```bash
cp .env.example .env

```

> [!NOTE]
> Populate your specific API keys and AWS identifiers in `.env`. Refer to [`API_KEY_SETUP.md`](https://www.google.com/search?q=API_KEY_SETUP.md) for details.

```bash
npm install

```

Launch the Vite development server:

```bash
npm run dev

```

---

## 📚 Infrastructure & Setup Guides

Click on any guide below to review detailed deployment instructions:

* 📄 **[AWS CLI Configuration Guide](https://www.google.com/search?q=INSTALL_AWS_CLI.md)** — Step-by-step credentials and CLI setup.
* 📄 **[DynamoDB Database Setup](https://www.google.com/search?q=DYNAMODB_SETUP.md)** | **[Quickstart](https://www.google.com/search?q=QUICKSTART_DYNAMODB.md)** — Provision database tables and apply policies from `aws/iam/`.
* 📄 **[Lambda Function Deployment](https://www.google.com/search?q=AWS_DEPLOYMENT_GUIDE.md)** — Deploy `aws/lambda/handler.py` with `aws/iam/lambda_dynamodb_policy.json`.
* 📄 **[EmailJS Integration](https://www.google.com/search?q=EMAILJS_SETUP.md)** — Configure notifications and messaging handlers.

---

## 🛠 Deployment Options

### **Option A: Automated Script Deployment (AWS S3 + CloudFront)**

Select the command corresponding to your operating system:

```bash
chmod +x deploy.sh
./deploy.sh

```

```powershell
.\deploy.ps1

```

---

### **Option B: Frontend Deployment on Netlify**

For step-by-step instructions on linking your repository and deploying the frontend via Netlify, refer to [`DEPLOY_NETLIFY.md`](https://www.google.com/search?q=DEPLOY_NETLIFY.md).

---

## ✅ Interactive Execution Tracker

Track your progress setting up and deploying the project:

* [ ] **Step 1:** Install Node.js dependencies (`npm install`).
* [ ] **Step 2:** Populate local variables in `.env` (Reference: [`API_KEY_SETUP.md`](https://www.google.com/search?q=API_KEY_SETUP.md)).
* [ ] **Step 3:** Provision DynamoDB table and set IAM permissions.
* [ ] **Step 4:** Deploy AWS Lambda backend logic (`aws/lambda/handler.py`).
* [ ] **Step 5:** Build and deploy static assets using `./deploy.sh` or `.\deploy.ps1`.
* [ ] **Step 6:** Validate CloudFront distribution and test endpoints.
