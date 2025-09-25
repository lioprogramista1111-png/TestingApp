# =============================================================================
# DEPLOYMENT SCRIPT FOR TEXTSUBMISSIONAPI
# =============================================================================
# PowerShell script for deploying the application using Docker Compose

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("local", "staging", "production")]
    [string]$Environment = "local",
    
    [Parameter(Mandatory=$false)]
    [switch]$Build = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Clean = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Logs = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Stop = $false
)

# =============================================================================
# SCRIPT CONFIGURATION
# =============================================================================
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ComposeFile = Join-Path $ProjectRoot "docker-compose.yml"

# Environment-specific configurations
$EnvironmentConfigs = @{
    "local" = @{
        "ComposeProject" = "textsubmission-local"
        "FrontendPort" = "4200"
        "BackendPort" = "5000"
        "DatabasePort" = "1433"
    }
    "staging" = @{
        "ComposeProject" = "textsubmission-staging"
        "FrontendPort" = "4201"
        "BackendPort" = "5001"
        "DatabasePort" = "1434"
    }
    "production" = @{
        "ComposeProject" = "textsubmission-prod"
        "FrontendPort" = "80"
        "BackendPort" = "443"
        "DatabasePort" = "1433"
    }
}

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================
function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)
    Write-Host "🔄 $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-DockerInstalled {
    try {
        docker --version | Out-Null
        docker-compose --version | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Wait-ForService {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$TimeoutSeconds = 120
    )
    
    Write-Step "Waiting for $ServiceName to be healthy..."
    $timeout = (Get-Date).AddSeconds($TimeoutSeconds)
    
    do {
        try {
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "$ServiceName is healthy!"
                return $true
            }
        }
        catch {
            Start-Sleep -Seconds 5
        }
    } while ((Get-Date) -lt $timeout)
    
    Write-Error "$ServiceName failed to become healthy within $TimeoutSeconds seconds"
    return $false
}

# =============================================================================
# MAIN DEPLOYMENT LOGIC
# =============================================================================
function Deploy-Application {
    Write-Header "DEPLOYING TEXTSUBMISSIONAPI TO $($Environment.ToUpper())"
    
    # Validate prerequisites
    if (-not (Test-DockerInstalled)) {
        Write-Error "Docker and Docker Compose are required but not installed"
        exit 1
    }
    
    if (-not (Test-Path $ComposeFile)) {
        Write-Error "Docker Compose file not found: $ComposeFile"
        exit 1
    }
    
    $config = $EnvironmentConfigs[$Environment]
    $projectName = $config.ComposeProject
    
    try {
        # Clean up if requested
        if ($Clean) {
            Write-Step "Cleaning up existing containers and volumes..."
            docker-compose -f $ComposeFile -p $projectName down -v --remove-orphans
            docker system prune -f
            Write-Success "Cleanup completed"
        }
        
        # Stop services if requested
        if ($Stop) {
            Write-Step "Stopping services..."
            docker-compose -f $ComposeFile -p $projectName down
            Write-Success "Services stopped"
            return
        }
        
        # Build images if requested
        if ($Build) {
            Write-Step "Building Docker images..."
            docker-compose -f $ComposeFile -p $projectName build --no-cache
            Write-Success "Images built successfully"
        }
        
        # Start services
        Write-Step "Starting services..."
        docker-compose -f $ComposeFile -p $projectName up -d
        
        # Wait for services to be healthy
        $frontendUrl = "http://localhost:$($config.FrontendPort)/health"
        $backendUrl = "http://localhost:$($config.BackendPort)/health"
        
        if ((Wait-ForService "Database" "http://localhost:$($config.DatabasePort)") -and
            (Wait-ForService "Backend API" $backendUrl) -and
            (Wait-ForService "Frontend" $frontendUrl)) {
            
            Write-Success "Deployment completed successfully!"
            Write-Host ""
            Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
            Write-Host "   Frontend: http://localhost:$($config.FrontendPort)" -ForegroundColor White
            Write-Host "   Backend API: http://localhost:$($config.BackendPort)" -ForegroundColor White
            Write-Host "   Database: localhost:$($config.DatabasePort)" -ForegroundColor White
            Write-Host ""
            Write-Host "📊 Monitoring Commands:" -ForegroundColor Cyan
            Write-Host "   View logs: .\scripts\deploy.ps1 -Environment $Environment -Logs" -ForegroundColor White
            Write-Host "   Stop services: .\scripts\deploy.ps1 -Environment $Environment -Stop" -ForegroundColor White
        }
        else {
            Write-Error "Some services failed to start properly"
            exit 1
        }
        
        # Show logs if requested
        if ($Logs) {
            Write-Step "Showing service logs..."
            docker-compose -f $ComposeFile -p $projectName logs -f
        }
    }
    catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
        exit 1
    }
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================
if ($Logs -and -not $Stop) {
    $config = $EnvironmentConfigs[$Environment]
    $projectName = $config.ComposeProject
    Write-Header "SHOWING LOGS FOR $($Environment.ToUpper())"
    docker-compose -f $ComposeFile -p $projectName logs -f
}
else {
    Deploy-Application
}

Write-Host ""
Write-Host "🎉 Script execution completed!" -ForegroundColor Green
