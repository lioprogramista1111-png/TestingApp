# 🚀 Continuous Deployment (CD) Guide

## 📋 Overview

This document explains the **Continuous Deployment (CD)** implementation that extends your CI pipeline with automated deployment capabilities. The CD pipeline automatically deploys your application to staging and production environments after successful testing.

## 🎯 CD Pipeline Architecture

```
CI Pipeline (Tests Pass)
    ↓
┌─────────────────────────────────────┐
│      Deploy to Staging             │  ← Automatic
│  (Frontend + Backend + Smoke Tests) │
└─────────────────────────────────────┘
    ↓ (Manual Approval Required)
┌─────────────────────────────────────┐
│     Deploy to Production           │  ← Manual Approval
│  (Frontend + Backend + Smoke Tests) │
└─────────────────────────────────────┘
```

## 🔧 CD Jobs Implementation

### **Job 5: Deploy to Staging**
- **Trigger**: Automatic on main branch push (after CI passes)
- **Environment**: Azure Static Web Apps + Azure App Service
- **Purpose**: Automated testing environment for validation

### **Job 6: Deploy to Production**
- **Trigger**: Manual approval after staging deployment
- **Environment**: Production Azure resources
- **Purpose**: Live application serving real users

## 📊 Deployment Workflow Details

### **Staging Deployment Process**

#### **1. Conditions for Staging Deployment**
```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push' && success()
```
- ✅ **Main branch only**: No deployments from feature branches
- ✅ **Push events only**: No deployments from pull requests
- ✅ **All tests pass**: CI must succeed before deployment

#### **2. Staging Deployment Steps**
1. **Download Build Artifacts** (from build-verification job)
2. **Deploy Frontend** to Azure Static Web Apps (staging)
3. **Deploy Backend** to Azure App Service (staging)
4. **Run Smoke Tests** to verify deployment health

#### **3. Smoke Tests Performed**
```bash
# Backend API health check
curl -f https://your-textsubmission-api-staging.azurewebsites.net/health

# Frontend availability check  
curl -f https://your-app-staging.azurewebsites.net

# API endpoint functionality
curl -f https://your-textsubmission-api-staging.azurewebsites.net/api/TextSubmission
```

### **Production Deployment Process**

#### **1. Manual Approval Required**
- **Environment Protection**: Production environment requires manual approval
- **Reviewers**: Team leads, DevOps engineers, or designated approvers
- **Wait Timer**: Optional delay before deployment (configurable)

#### **2. Production Deployment Steps**
1. **Download Build Artifacts** (same artifacts as staging)
2. **Deploy Frontend** to Azure Static Web Apps (production)
3. **Deploy Backend** to Azure App Service (production)
4. **Run Production Smoke Tests**
5. **Notify Team** of successful deployment

## 🔐 Required Secrets Configuration

### **GitHub Secrets Setup**

Navigate to **Settings** → **Secrets and variables** → **Actions** in your GitHub repository and add:

#### **Staging Environment Secrets**
```
AZURE_STATIC_WEB_APPS_API_TOKEN
- Description: Azure Static Web Apps deployment token for staging
- Value: Get from Azure Portal → Static Web Apps → Manage deployment token

AZURE_WEBAPP_PUBLISH_PROFILE
- Description: Azure App Service publish profile for staging backend
- Value: Download from Azure Portal → App Service → Get publish profile
```

#### **Production Environment Secrets**
```
AZURE_STATIC_WEB_APPS_API_TOKEN_PROD
- Description: Azure Static Web Apps deployment token for production
- Value: Get from Azure Portal → Static Web Apps → Manage deployment token

AZURE_WEBAPP_PUBLISH_PROFILE_PROD
- Description: Azure App Service publish profile for production backend
- Value: Download from Azure Portal → App Service → Get publish profile
```

## 🏗️ Azure Infrastructure Setup

### **Required Azure Resources**

#### **Frontend Hosting (Angular App)**
```
Resource Type: Azure Static Web Apps
Staging: your-app-staging.azurewebsites.net
Production: your-app.azurewebsites.net

Configuration:
- Build preset: Angular
- App location: /
- Output location: dist/text-submission-app
```

#### **Backend Hosting (.NET API)**
```
Resource Type: Azure App Service
Staging: your-textsubmission-api-staging.azurewebsites.net
Production: your-textsubmission-api-prod.azurewebsites.net

Configuration:
- Runtime: .NET 9
- Operating System: Linux
- Pricing Tier: B1 (Basic) or higher
```

#### **Database**
```
Resource Type: Azure SQL Database
Staging: textsubmission-db-staging
Production: textsubmission-db-prod

Configuration:
- Service Tier: Basic (staging) / Standard (production)
- Connection strings configured in App Service settings
```

## 🛡️ Environment Protection Rules

### **Staging Environment**
- **No protection rules** (automatic deployment)
- **Purpose**: Fast feedback and testing
- **Access**: Development team

### **Production Environment**
- **Required reviewers**: 1-2 team leads or DevOps engineers
- **Wait timer**: Optional 5-minute delay
- **Deployment branches**: Only main branch
- **Purpose**: Controlled, safe production releases

### **Setting Up Protection Rules**

1. Go to **Settings** → **Environments** in GitHub repository
2. Create **staging** and **production** environments
3. Configure protection rules for production:
   - Add required reviewers
   - Set deployment branch restrictions
   - Configure wait timers if needed

## 📈 Deployment Monitoring

### **GitHub Actions UI**
- **Deployments tab**: Shows all deployment history
- **Environment status**: Current state of each environment
- **Approval queue**: Pending production deployments

### **Azure Monitoring**
- **Application Insights**: Application performance monitoring
- **Azure Monitor**: Infrastructure health and metrics
- **Log Analytics**: Centralized logging and diagnostics

## 🔄 Rollback Strategy

### **Automatic Rollback Triggers**
- Smoke tests fail after deployment
- Health checks fail for more than 5 minutes
- Critical errors detected in Application Insights

### **Manual Rollback Process**
1. **Identify issue** in production environment
2. **Trigger rollback** via GitHub Actions or Azure Portal
3. **Revert to previous version** using deployment slots
4. **Investigate and fix** the issue in development
5. **Redeploy** after validation

## 🎯 Deployment Metrics

### **Key Performance Indicators**
- **Deployment Frequency**: How often you deploy to production
- **Lead Time**: Time from commit to production
- **Deployment Success Rate**: % of successful deployments
- **Mean Time to Recovery**: Time to fix failed deployments

### **Target Metrics**
- 🎯 **Deploy to staging**: Every main branch push
- 🎯 **Deploy to production**: 1-3 times per week
- 🎯 **Deployment success rate**: >95%
- 🎯 **Lead time**: <2 hours (commit to production)

## 🚀 Getting Started

### **Phase 1: Setup Azure Resources**
1. Create Azure Static Web Apps for frontend
2. Create Azure App Services for backend
3. Configure Azure SQL Databases
4. Set up Application Insights monitoring

### **Phase 2: Configure Secrets**
1. Add deployment tokens to GitHub Secrets
2. Configure publish profiles
3. Test secret access in workflow

### **Phase 3: Enable CD Pipeline**
1. Push updated workflow to main branch
2. Verify staging deployment works
3. Set up production environment protection
4. Test end-to-end deployment flow

### **Phase 4: Monitor and Optimize**
1. Set up monitoring dashboards
2. Configure alerting rules
3. Optimize deployment performance
4. Implement advanced rollback strategies

## 🔧 Troubleshooting

### **Common Issues**

#### **Deployment Fails**
- Check Azure resource availability
- Verify secrets are correctly configured
- Review deployment logs in GitHub Actions

#### **Smoke Tests Fail**
- Verify application URLs are correct
- Check if services are fully started
- Review application logs in Azure

#### **Manual Approval Stuck**
- Check if reviewers are notified
- Verify environment protection rules
- Review approval requirements

## 🎉 Benefits of CD Implementation

### **Development Team**
- ✅ **Automated deployments** reduce manual work
- ✅ **Fast feedback** from staging environment
- ✅ **Consistent deployment process** across environments
- ✅ **Reduced deployment errors** through automation

### **Operations Team**
- ✅ **Controlled production releases** with approval gates
- ✅ **Automated smoke testing** validates deployments
- ✅ **Deployment history** and audit trail
- ✅ **Rollback capabilities** for quick recovery

### **Business**
- ✅ **Faster time to market** with automated releases
- ✅ **Higher reliability** through consistent processes
- ✅ **Reduced downtime** with automated testing
- ✅ **Better user experience** with frequent, stable releases

Your CD pipeline is now ready to automate deployments and accelerate your delivery process! 🚀
