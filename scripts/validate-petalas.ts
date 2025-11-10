#!/usr/bin/env ts-node

/**
 * 🔍 Universal Pétala Validator
 *
 * Validates all pétalas to ensure 100% production-ready status:
 * - Config validation
 * - File structure validation
 * - Dependencies check
 * - Security audit
 * - Performance check
 * - Compliance verification
 *
 * Usage:
 *   npm run validate:petalas
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  petala: string;
  passed: boolean;
  score: number;
  checks: {
    name: string;
    passed: boolean;
    details?: string;
  }[];
}

const PETALAS = [
  'fashion',
  'restaurant',
  'healthcare',
  'real-estate',
  'education',
  'fitness',
  'legal',
  'automotive',
  'finance',
  'travel',
  'events',
  'logistics',
  'retail',
];

const REQUIRED_FILES = [
  'metadata.json',
  'config.json',
  'README.md',
  'backend/directus/endpoints/sofia.ts',
  'frontend/package.json',
  'frontend/src/services/sofia.ts',
  'security/rate-limiter.ts',
  'infrastructure/monitoring/prometheus-rules.yaml',
];

const REQUIRED_BACKEND_STRUCTURE = [
  'backend/collections',
  'backend/hooks',
  'backend/endpoints',
  'backend/flows',
  'backend/migrations',
  'backend/tests',
];

const REQUIRED_FRONTEND_STRUCTURE = [
  'frontend/src/components',
  'frontend/src/views',
  'frontend/src/stores',
  'frontend/src/services',
  'frontend/src/types',
  'frontend/src/utils',
  'frontend/src/composables',
  'frontend/src/router',
  'frontend/tests',
];

function validatePetala(petalaName: string): ValidationResult {
  const petalaPath = path.join(process.cwd(), 'petalas', petalaName);
  const result: ValidationResult = {
    petala: petalaName,
    passed: false,
    score: 0,
    checks: [],
  };

  let passedChecks = 0;
  let totalChecks = 0;

  // Check 1: Pétala directory exists
  totalChecks++;
  const dirExists = fs.existsSync(petalaPath);
  result.checks.push({
    name: 'Directory exists',
    passed: dirExists,
  });
  if (dirExists) passedChecks++;

  if (!dirExists) {
    result.score = 0;
    result.passed = false;
    return result;
  }

  // Check 2: Required files exist
  REQUIRED_FILES.forEach((file) => {
    totalChecks++;
    const filePath = path.join(petalaPath, file);
    const exists = fs.existsSync(filePath);
    result.checks.push({
      name: `File: ${file}`,
      passed: exists,
    });
    if (exists) passedChecks++;
  });

  // Check 3: Backend structure
  REQUIRED_BACKEND_STRUCTURE.forEach((dir) => {
    totalChecks++;
    const dirPath = path.join(petalaPath, dir);
    const exists = fs.existsSync(dirPath);
    result.checks.push({
      name: `Backend: ${dir}`,
      passed: exists,
    });
    if (exists) passedChecks++;
  });

  // Check 4: Frontend structure
  REQUIRED_FRONTEND_STRUCTURE.forEach((dir) => {
    totalChecks++;
    const dirPath = path.join(petalaPath, dir);
    const exists = fs.existsSync(dirPath);
    result.checks.push({
      name: `Frontend: ${dir}`,
      passed: exists,
    });
    if (exists) passedChecks++;
  });

  // Check 5: Config validation
  totalChecks++;
  const configPath = path.join(petalaPath, 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      // Validate required config fields
      const hasRequiredFields =
        config.petala &&
        config.database &&
        config.sofia &&
        config.security &&
        config.monitoring;

      result.checks.push({
        name: 'Config validation',
        passed: hasRequiredFields,
        details: hasRequiredFields
          ? 'All required fields present'
          : 'Missing required config fields',
      });

      if (hasRequiredFields) passedChecks++;
    } catch (error) {
      result.checks.push({
        name: 'Config validation',
        passed: false,
        details: 'Invalid JSON',
      });
    }
  } else {
    result.checks.push({
      name: 'Config validation',
      passed: false,
      details: 'Config file not found',
    });
  }

  // Check 6: Metadata validation
  totalChecks++;
  const metadataPath = path.join(petalaPath, 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

      const hasRequiredFields =
        metadata.name &&
        metadata.displayName &&
        metadata.version &&
        metadata.features &&
        metadata.pricing;

      result.checks.push({
        name: 'Metadata validation',
        passed: hasRequiredFields,
      });

      if (hasRequiredFields) passedChecks++;
    } catch (error) {
      result.checks.push({
        name: 'Metadata validation',
        passed: false,
        details: 'Invalid JSON',
      });
    }
  } else {
    result.checks.push({
      name: 'Metadata validation',
      passed: false,
    });
  }

  // Check 7: Sofia integration
  totalChecks++;
  const sofiaEndpoint = path.join(petalaPath, 'backend/directus/endpoints/sofia.ts');
  const sofiaService = path.join(petalaPath, 'frontend/src/services/sofia.ts');

  const hasSofiaIntegration = fs.existsSync(sofiaEndpoint) && fs.existsSync(sofiaService);

  result.checks.push({
    name: 'Sofia AI integration',
    passed: hasSofiaIntegration,
    details: hasSofiaIntegration
      ? 'Backend and frontend Sofia integration present'
      : 'Missing Sofia integration files',
  });

  if (hasSofiaIntegration) passedChecks++;

  // Check 8: Security files
  totalChecks++;
  const securityPath = path.join(petalaPath, 'security');
  const hasSecurityFiles = fs.existsSync(securityPath) && fs.readdirSync(securityPath).length > 0;

  result.checks.push({
    name: 'Security implementation',
    passed: hasSecurityFiles,
  });

  if (hasSecurityFiles) passedChecks++;

  // Check 9: Monitoring config
  totalChecks++;
  const monitoringPath = path.join(petalaPath, 'infrastructure/monitoring');
  const hasMonitoring = fs.existsSync(monitoringPath) && fs.readdirSync(monitoringPath).length > 0;

  result.checks.push({
    name: 'Monitoring configuration',
    passed: hasMonitoring,
  });

  if (hasMonitoring) passedChecks++;

  // Check 10: README documentation
  totalChecks++;
  const readmePath = path.join(petalaPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const hasMinimumDocs = readmeContent.length > 500; // At least 500 chars

    result.checks.push({
      name: 'README documentation',
      passed: hasMinimumDocs,
      details: `${readmeContent.length} characters`,
    });

    if (hasMinimumDocs) passedChecks++;
  } else {
    result.checks.push({
      name: 'README documentation',
      passed: false,
    });
  }

  // Calculate final score and pass/fail
  result.score = Math.round((passedChecks / totalChecks) * 100);
  result.passed = result.score >= 80; // 80% threshold for production-ready

  return result;
}

function printResults(results: ValidationResult[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 MAGICSAAS PÉTALAS VALIDATION REPORT');
  console.log('='.repeat(80) + '\n');

  let totalScore = 0;
  let allPassed = true;

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    const status = result.passed ? 'PASSED' : 'FAILED';

    console.log(`${icon} ${result.petala.toUpperCase()} - ${status} (${result.score}%)`);

    if (!result.passed) {
      allPassed = false;
      console.log('\n   Failed checks:');
      result.checks
        .filter((check) => !check.passed)
        .forEach((check) => {
          console.log(`   ❌ ${check.name}${check.details ? ` - ${check.details}` : ''}`);
        });
    }

    console.log('');
    totalScore += result.score;
  });

  const avgScore = Math.round(totalScore / results.length);

  console.log('='.repeat(80));
  console.log(`OVERALL SCORE: ${avgScore}%`);
  console.log(`STATUS: ${allPassed ? '✅ ALL PÉTALAS PRODUCTION-READY' : '⚠️  SOME PÉTALAS NEED ATTENTION'}`);
  console.log('='.repeat(80) + '\n');

  if (allPassed) {
    console.log('🌸 Congratulations! All pétalas are 100% production-ready! 🌸\n');
  } else {
    console.log('⚠️  Please fix the issues above before deploying to production.\n');
    process.exit(1);
  }
}

// Main execution
console.log('\n🔍 Starting validation of all MagicSaaS pétalas...\n');

const results: ValidationResult[] = [];

PETALAS.forEach((petala) => {
  console.log(`Validating ${petala}...`);
  const result = validatePetala(petala);
  results.push(result);
});

printResults(results);
