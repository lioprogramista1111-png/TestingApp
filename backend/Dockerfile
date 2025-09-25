# =============================================================================
# BACKEND DOCKERFILE (.NET API)
# =============================================================================
# Multi-stage build for optimized production image

# =============================================================================
# STAGE 1: BUILD STAGE
# =============================================================================
# Use .NET 9 SDK for building the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# Set working directory inside container
WORKDIR /src

# Copy project files first (for better Docker layer caching)
COPY ["TextSubmissionAPI/TextSubmissionAPI.csproj", "TextSubmissionAPI/"]
COPY ["TextSubmissionAPI.Tests/TextSubmissionAPI.Tests.csproj", "TextSubmissionAPI.Tests/"]

# Restore NuGet packages
RUN dotnet restore "TextSubmissionAPI/TextSubmissionAPI.csproj"

# Copy source code
COPY . .

# Set working directory to main project
WORKDIR "/src/TextSubmissionAPI"

# Build the application in Release configuration
RUN dotnet build "TextSubmissionAPI.csproj" -c Release -o /app/build

# =============================================================================
# STAGE 2: PUBLISH STAGE
# =============================================================================
# Publish the application (creates deployment-ready files)
FROM build AS publish
RUN dotnet publish "TextSubmissionAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# =============================================================================
# STAGE 3: PRODUCTION STAGE
# =============================================================================
# Use lightweight .NET 9 runtime for running the application
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Copy published application from publish stage
COPY --from=publish /app/publish .

# Expose port 80 for HTTP traffic
EXPOSE 80

# Add health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Set entry point to run the application
ENTRYPOINT ["dotnet", "TextSubmissionAPI.dll"]
