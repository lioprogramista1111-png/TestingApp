# Testing Guide

This document provides comprehensive information about testing in the Text Submission Application project.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Frontend Testing](#frontend-testing)
- [Backend Testing](#backend-testing)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Our testing strategy follows the **Test Pyramid** approach:

```
    /\
   /  \     E2E Tests (10%)
  /____\    Integration Tests (20%)
 /______\   Unit Tests (70%)
```

### Technology Stack

- **Frontend**: Angular 18 + Jasmine + Karma
- **Backend**: ASP.NET Core + xUnit (recommended)
- **E2E**: Playwright (recommended)
- **CI/CD**: GitHub Actions

## 🏗️ Test Structure

```
TestingApp/
├── frontend/text-submission-app/
│   ├── src/app/components/
│   │   └── dashboard/
│   │       ├── dashboard.ts
│   │       └── dashboard.spec.ts        # Unit tests
│   ├── e2e/                            # E2E tests (future)
│   └── karma.conf.js                   # Test configuration
├── backend/TextSubmissionAPI/
│   ├── Controllers/
│   │   └── TextSubmissionController.cs
│   └── Tests/                          # Unit tests (future)
│       └── Controllers/
│           └── TextSubmissionControllerTests.cs
└── TEST_README.md                      # This file
```

## 🎨 Frontend Testing

### Current Setup

- **Framework**: Jasmine + Karma
- **Test Runner**: Angular CLI (`ng test`)
- **Browser**: ChromeHeadless (CI-friendly)

### Test Categories

#### 1. Component Tests
- **Location**: `src/app/components/*/**.spec.ts`
- **Purpose**: Test component logic, state management, user interactions
- **Example**: `dashboard.spec.ts` - 11 comprehensive tests

#### 2. Service Tests
- **Location**: `src/app/services/**.spec.ts`
- **Purpose**: Test HTTP calls, data transformation, error handling

### Running Frontend Tests

```bash
# Navigate to frontend directory
cd frontend/text-submission-app

# Run tests once
npm test

# Run tests in watch mode
ng test

# Run tests with coverage
ng test --code-coverage

# Run tests in CI mode (headless)
ng test --watch=false --browsers=ChromeHeadless
```

### Test Examples

```typescript
// Component test example
it('should delete submission when confirmed', () => {
  const mockSubmissions = [
    { id: 1, text: 'Test submission', createdAt: '2025-09-21T10:00:00.000Z' }
  ];
  
  component.submissions.set(mockSubmissions);
  spyOn(window, 'confirm').and.returnValue(true);
  
  component.deleteSubmission(1, 'Test submission');
  
  expect(mockService.deleteSubmission).toHaveBeenCalledWith(1);
  expect(component.submissions().length).toBe(0);
});
```

## 🔧 Backend Testing

### Recommended Setup

```bash
# Install xUnit packages
dotnet add package Microsoft.NET.Test.Sdk
dotnet add package xunit
dotnet add package xunit.runner.visualstudio
dotnet add package Microsoft.AspNetCore.Mvc.Testing
```

### Test Categories

#### 1. Unit Tests
- **Purpose**: Test individual methods, business logic
- **Example**: Controller actions, validation logic

#### 2. Integration Tests
- **Purpose**: Test API endpoints, database interactions
- **Example**: Full HTTP request/response cycles

### Sample Backend Test

```csharp
public class TextSubmissionControllerTests
{
    [Fact]
    public async Task GetTextSubmissions_ReturnsOkResult()
    {
        // Arrange
        var controller = new TextSubmissionController(mockContext);
        
        // Act
        var result = await controller.GetTextSubmissions();
        
        // Assert
        Assert.IsType<OkObjectResult>(result.Result);
    }
}
```

## 🚀 Running Tests

### Quick Commands

```bash
# Frontend tests
cd frontend/text-submission-app
npm test                                    # Interactive mode
ng test --watch=false --browsers=ChromeHeadless  # CI mode

# Backend tests (when implemented)
cd backend/TextSubmissionAPI
dotnet test                                 # Run all tests
dotnet test --logger trx                   # Generate test report
```

### Test Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "test": "ng test",
    "test:ci": "ng test --watch=false --browsers=ChromeHeadless",
    "test:coverage": "ng test --code-coverage --watch=false --browsers=ChromeHeadless",
    "e2e": "playwright test"
  }
}
```

## 📊 Test Coverage

### Current Coverage

```
Statements   : 61.47% ( 75/122 )
Branches     : 16.66% ( 2/12 )
Functions    : 53.33% ( 24/45 )
Lines        : 62.06% ( 72/116 )
```

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 70%
- **Functions**: > 80%
- **Lines**: > 80%

### Viewing Coverage Reports

```bash
# Generate coverage report
ng test --code-coverage --watch=false --browsers=ChromeHeadless

# Open coverage report
open coverage/text-submission-app/index.html
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Automated Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      working-directory: ./frontend/text-submission-app
      
    - name: Run tests
      run: npm run test:ci
      working-directory: ./frontend/text-submission-app
      
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./frontend/text-submission-app/coverage/lcov.info

  backend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '8.0'
        
    - name: Run tests
      run: dotnet test --logger trx --collect:"XPlat Code Coverage"
      working-directory: ./backend
```

## ✅ Best Practices

### 1. Test Naming
```typescript
// ✅ Good - Descriptive and clear
it('should delete submission when user confirms deletion', () => {});

// ❌ Bad - Vague and unclear
it('should work', () => {});
```

### 2. Test Structure (AAA Pattern)
```typescript
it('should update submission count after deletion', () => {
  // Arrange - Set up test data
  const mockSubmissions = [/* test data */];
  component.submissions.set(mockSubmissions);
  
  // Act - Perform the action
  component.deleteSubmission(1, 'Test submission');
  
  // Assert - Verify the result
  expect(component.submissions().length).toBe(0);
});
```

### 3. Mock External Dependencies
```typescript
// ✅ Good - Mock external services
beforeEach(() => {
  mockService = jasmine.createSpyObj('TextSubmissionService', ['deleteSubmission']);
  mockService.deleteSubmission.and.returnValue(of(undefined));
});

// ❌ Bad - Using real services in unit tests
```

### 4. Test One Thing at a Time
```typescript
// ✅ Good - Single responsibility
it('should call service with correct ID', () => {
  component.deleteSubmission(1, 'Test');
  expect(mockService.deleteSubmission).toHaveBeenCalledWith(1);
});

it('should update UI after deletion', () => {
  component.deleteSubmission(1, 'Test');
  expect(component.submissions().length).toBe(0);
});
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Tests Failing in CI but Passing Locally
```bash
# Solution: Use consistent browser
ng test --watch=false --browsers=ChromeHeadless
```

#### 2. Coverage Reports Not Generated
```bash
# Solution: Ensure coverage flag is set
ng test --code-coverage --watch=false
```

#### 3. Async Test Issues
```typescript
// ✅ Good - Handle async operations
it('should handle async operations', fakeAsync(() => {
  component.loadData();
  tick(); // Simulate passage of time
  expect(component.data).toBeDefined();
}));
```

### Debug Commands

```bash
# Run specific test file
ng test --include="**/dashboard.spec.ts"

# Run tests with verbose output
ng test --verbose

# Debug in browser
ng test --browsers=Chrome
```

## 📚 Additional Resources

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [xUnit Documentation](https://xunit.net/)
- [Playwright Documentation](https://playwright.dev/)

## 🤝 Contributing

When adding new features:

1. **Write tests first** (TDD approach)
2. **Maintain coverage** above 80%
3. **Follow naming conventions**
4. **Update this README** if adding new test types

## 🎯 Test Scenarios Coverage

### Dashboard Component Tests

| Test Case | Description | Status |
|-----------|-------------|---------|
| Component Creation | Verifies component instantiation | ✅ |
| Service Integration | Tests ngOnInit and service calls | ✅ |
| Date Formatting | Validates date utility method | ✅ |
| Error Handling | Tests graceful error management | ✅ |
| Initial State | Confirms proper signal initialization | ✅ |
| Refresh Functionality | Tests manual data reload | ✅ |
| Edit Mode Activation | Verifies inline editing setup | ✅ |
| Edit Mode Cancellation | Tests edit operation cancellation | ✅ |
| **Delete - Success** | Complete happy path deletion | ✅ |
| **Delete - Cancelled** | User cancellation handling | ✅ |
| **Delete - Error** | Error handling during deletion | ✅ |

### API Endpoint Tests (Recommended)

| Endpoint | Test Cases | Priority |
|----------|------------|----------|
| `GET /api/TextSubmission` | Success, Empty list, Error | High |
| `POST /api/TextSubmission` | Success, Validation errors | High |
| `PUT /api/TextSubmission/{id}` | Success, Not found, Validation | Medium |
| `DELETE /api/TextSubmission/{id}` | Success, Not found, Error | High |

## 🔍 Test Data Management

### Mock Data Examples

```typescript
// Standard test submission
const mockSubmission = {
  id: 1,
  text: 'Test submission text',
  createdAt: '2025-09-21T10:00:00.000Z'
};

// Multiple submissions for list tests
const mockSubmissions = [
  { id: 1, text: 'First submission', createdAt: '2025-09-21T10:00:00.000Z' },
  { id: 2, text: 'Second submission', createdAt: '2025-09-21T11:00:00.000Z' },
  { id: 3, text: 'Third submission', createdAt: '2025-09-21T12:00:00.000Z' }
];

// Error scenarios
const networkError = new Error('Network connection failed');
const validationError = new Error('Text must be between 10-50 characters');
```

### Test Utilities

```typescript
// Helper function for creating mock submissions
function createMockSubmission(overrides = {}) {
  return {
    id: 1,
    text: 'Default test text',
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

// Helper for setting up component with data
function setupComponentWithSubmissions(submissions) {
  component.submissions.set(submissions);
  fixture.detectChanges();
}
```

## 🚨 Testing Checklist

### Before Committing Code

- [ ] All existing tests pass
- [ ] New features have corresponding tests
- [ ] Test coverage meets minimum thresholds
- [ ] No console errors in test output
- [ ] Tests run successfully in CI environment

### Code Review Checklist

- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Test names are descriptive and clear
- [ ] External dependencies are properly mocked
- [ ] Edge cases and error scenarios are covered
- [ ] Tests are independent and can run in any order

## 🎨 Advanced Testing Patterns

### Testing Angular Signals

```typescript
it('should update signal value', () => {
  // Test signal updates
  expect(component.submissions()).toEqual([]);

  component.submissions.set([mockSubmission]);

  expect(component.submissions()).toEqual([mockSubmission]);
  expect(component.submissions().length).toBe(1);
});
```

### Testing Async Operations

```typescript
it('should handle async service calls', fakeAsync(() => {
  const mockData = [mockSubmission];
  mockService.getSubmissions.and.returnValue(of(mockData).pipe(delay(100)));

  component.ngOnInit();

  expect(component.isLoading()).toBe(true);

  tick(100); // Simulate 100ms delay

  expect(component.isLoading()).toBe(false);
  expect(component.submissions()).toEqual(mockData);
}));
```

### Testing Error Scenarios

```typescript
it('should handle service errors gracefully', () => {
  const errorMessage = 'Service unavailable';
  mockService.getSubmissions.and.returnValue(
    throwError(() => new Error(errorMessage))
  );

  spyOn(console, 'error');

  component.ngOnInit();

  expect(component.errorMessage()).toContain('Failed to load');
  expect(console.error).toHaveBeenCalledWith(
    'Error loading submissions:',
    jasmine.any(Error)
  );
});
```

## 📈 Performance Testing

### Load Testing Considerations

```typescript
it('should handle large datasets efficiently', () => {
  // Create large dataset
  const largeDataset = Array.from({ length: 1000 }, (_, i) =>
    createMockSubmission({ id: i + 1, text: `Submission ${i + 1}` })
  );

  const startTime = performance.now();
  component.submissions.set(largeDataset);
  const endTime = performance.now();

  expect(endTime - startTime).toBeLessThan(100); // Should complete in <100ms
  expect(component.submissions().length).toBe(1000);
});
```

## 🔧 Custom Test Utilities

### Angular Testing Utilities

```typescript
// Custom test bed setup
export function createTestBed(component: any, providers: any[] = []) {
  return TestBed.configureTestingModule({
    imports: [component],
    providers: [
      ...providers,
      { provide: TextSubmissionService, useValue: createMockService() }
    ]
  });
}

// Mock service factory
export function createMockService() {
  return jasmine.createSpyObj('TextSubmissionService', {
    getSubmissions: of([]),
    deleteSubmission: of(undefined),
    updateSubmission: of(undefined),
    createSubmission: of({ id: 1 })
  });
}
```

## 📊 Metrics and Reporting

### Test Metrics to Track

- **Test Count**: Total number of tests
- **Coverage Percentage**: Code coverage metrics
- **Test Execution Time**: How long tests take to run
- **Flaky Test Rate**: Tests that intermittently fail
- **Test Maintenance Effort**: Time spent updating tests

### Reporting Tools

```bash
# Generate detailed test report
ng test --code-coverage --watch=false --reporters=progress,kjhtml

# Generate JUnit XML report for CI
ng test --watch=false --reporters=junit

# Custom coverage thresholds
ng test --code-coverage --coverageReporters=text-summary --watch=false
```

---

**Last Updated**: 2025-09-21
**Maintained By**: Development Team
**Version**: 1.0.0
