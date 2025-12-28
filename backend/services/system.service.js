/**
 * ============================================================================
 * SYSTEM SERVICE
 * ============================================================================
 *
 * Purpose:
 * - Build diagnostic payloads for the admin UI
 * - Collect package metadata and system stats
 * ============================================================================
 */

// System service gathers runtime and dependency details for diagnostics.
const fs = require('fs');
const path = require('path');
const os = require('os');

const readJsonIfExists = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const getSystemInfo = async () => {
  const backendPackagePath = path.join(__dirname, '../package.json');
  const backendPackage = readJsonIfExists(backendPackagePath);

  const frontendPackagePath = path.join(__dirname, '../../frontend/package.json');
  const frontendPackage = readJsonIfExists(frontendPackagePath);

  const backendDeps = backendPackage?.dependencies || {};
  const backendDevDeps = backendPackage?.devDependencies || {};
  const frontendDeps = frontendPackage?.dependencies || {};
  const frontendDevDeps = frontendPackage?.devDependencies || {};

  const systemStats = {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    cpus: os.cpus().length,
    uptime: `${(process.uptime() / 60).toFixed(2)} minutes`
  };

  const backendTech = {
    name: backendPackage?.name,
    version: backendPackage?.version,
    description: backendPackage?.description,
    runtime: {
      name: 'Node.js',
      version: process.version
    },
    framework: {
      name: 'Express.js',
      version: backendDeps.express || 'N/A'
    },
    database: {
      name: 'MongoDB',
      driver: 'Mongoose',
      version: backendDeps.mongoose || 'N/A'
    },
    authentication: {
      name: 'JWT',
      library: 'jsonwebtoken',
      version: backendDeps.jsonwebtoken || 'N/A'
    },
    security: [
      { name: 'bcryptjs', version: backendDeps.bcryptjs || 'N/A', purpose: 'Password hashing' },
      { name: 'cors', version: backendDeps.cors || 'N/A', purpose: 'Cross-Origin Resource Sharing' },
      { name: 'helmet', version: backendDeps.helmet || 'N/A', purpose: 'Security headers' }
    ],
    utilities: [
      { name: 'dotenv', version: backendDeps.dotenv || 'N/A', purpose: 'Environment variables' },
      { name: 'morgan', version: backendDeps.morgan || 'N/A', purpose: 'HTTP request logger' }
    ],
    devDependencies: Object.keys(backendDevDeps).map((key) => ({
      name: key,
      version: backendDevDeps[key]
    }))
  };

  let frontendTech = null;
  if (frontendPackage) {
    frontendTech = {
      name: frontendPackage.name,
      version: frontendPackage.version,
      description: frontendPackage.description,
      framework: {
        name: 'Next.js',
        version: frontendDeps.next || 'N/A'
      },
      runtime: {
        name: 'React',
        version: frontendDeps.react || 'N/A'
      },
      styling: [
        { name: 'Tailwind CSS', version: frontendDevDeps.tailwindcss || frontendDeps.tailwindcss || 'N/A' },
        { name: 'Radix UI', version: 'Multiple packages', purpose: 'UI Components' }
      ],
      stateManagement: {
        name: 'React Hooks',
        description: 'Built-in state management'
      },
      httpClient: {
        name: 'Fetch API',
        description: 'Native browser fetch'
      },
      icons: {
        name: 'Lucide React',
        version: frontendDeps['lucide-react'] || 'N/A'
      },
      utilities: Object.keys(frontendDeps)
        .filter((dep) => !['next', 'react', 'react-dom', 'lucide-react'].includes(dep))
        .map((key) => ({
          name: key,
          version: frontendDeps[key]
        })),
      devDependencies: Object.keys(frontendDevDeps).map((key) => ({
        name: key,
        version: frontendDevDeps[key]
      }))
    };
  }

  const architecture = {
    pattern: 'MVC (Model-View-Controller)',
    frontend: 'Next.js (React) with App Router',
    backend: 'Node.js with Express.js',
    database: 'MongoDB (NoSQL)',
    authentication: 'JWT (JSON Web Tokens)',
    authorization: '3-Level Role System (lv1, lv2, lv3)',
    apiStyle: 'RESTful API',
    deployment: 'Separate frontend and backend'
  };

  const features = {
    authentication: ['Login', 'Logout', 'JWT Token', 'Password hashing'],
    authorization: ['Role-based access (lv1, lv2, lv3)', 'Route protection', 'Permission checking'],
    userManagement: ['CRUD operations', 'Search', 'Filter by role', 'Sort', 'Pagination'],
    settings: ['Change password', 'User profile management'],
    security: ['Protected routes', 'Token expiration', 'Password encryption', 'CORS', 'Helmet'],
    logging: ['Activity logging', 'HTTP request logging'],
    errorHandling: ['404 pages', 'Error boundaries', 'Unauthorized pages', 'API error handling']
  };

  return {
    systemStats,
    backend: backendTech,
    frontend: frontendTech,
    architecture,
    features,
    generatedAt: new Date().toISOString()
  };
};

module.exports = { getSystemInfo };
