/**
 * Arogya API Connection Test
 *
 * This script tests the connection to the backend API
 * Run with: node test_connection.js
 */

const API_BASE_URL = "http://192.168.100.40:8000";

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'bold');
  console.log('='.repeat(60) + '\n');
}

async function testConnection() {
  header('Testing Backend Connection');

  try {
    log(`Attempting to connect to: ${API_BASE_URL}`, 'blue');

    const response = await fetch(API_BASE_URL);

    if (response.ok || response.status === 404) {
      log('✓ Server is reachable!', 'green');
      return true;
    } else {
      log(`✗ Server returned status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log('✗ Cannot connect to server!', 'red');
    log(`Error: ${error.message}`, 'red');
    log('\nPossible issues:', 'yellow');
    log('  1. Backend server is not running', 'yellow');
    log('  2. Wrong IP address in config', 'yellow');
    log('  3. Firewall blocking connection', 'yellow');
    log('  4. Not on the same network', 'yellow');
    return false;
  }
}

async function testRegistration() {
  header('Testing Registration Endpoint');

  const randomId = Math.floor(Math.random() * 100000);
  const testUser = {
    username: `test${randomId}@example.com`,
    email: `test${randomId}@example.com`,
    password: 'test123456',
    first_name: 'Test User',
    role: 'patient'
  };

  try {
    log('Sending registration request...', 'blue');

    const response = await fetch(`${API_BASE_URL}/accounts/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    if (response.status === 201) {
      log('✓ Registration successful!', 'green');

      if (data.token) {
        log(`✓ Token received: ${data.token.substring(0, 20)}...`, 'green');
      } else {
        log('✗ No token in response!', 'red');
        return { success: false };
      }

      if (data.user) {
        log(`✓ User ID: ${data.user.id}`, 'green');
        log(`✓ Username: ${data.user.username}`, 'green');
        log(`✓ Role: ${data.user.role}`, 'green');
      } else {
        log('✗ No user data in response!', 'red');
        return { success: false };
      }

      return { success: true, username: testUser.username, password: testUser.password, token: data.token };
    } else {
      log(`✗ Registration failed with status: ${response.status}`, 'red');
      log(`Response: ${JSON.stringify(data, null, 2)}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log(`✗ Registration error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testLogin(username, password) {
  header('Testing Login Endpoint');

  try {
    log('Sending login request...', 'blue');

    const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.status === 200) {
      log('✓ Login successful!', 'green');

      if (data.token) {
        log(`✓ Token received: ${data.token.substring(0, 20)}...`, 'green');
      } else {
        log('✗ No token in response!', 'red');
        return false;
      }

      if (data.user) {
        log(`✓ User data received`, 'green');
        log(`✓ Role: ${data.user.role}`, 'green');
      } else {
        log('✗ No user data in response!', 'red');
        return false;
      }

      return true;
    } else {
      log(`✗ Login failed with status: ${response.status}`, 'red');
      log(`Response: ${JSON.stringify(data, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Login error: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  header('AROGYA API CONNECTION TESTS');

  log(`API Base URL: ${API_BASE_URL}`, 'blue');
  log(`Current Time: ${new Date().toLocaleString()}`, 'blue');

  const results = [];

  // Test 1: Server Connection
  const connectionOk = await testConnection();
  results.push({ name: 'Server Connection', passed: connectionOk });

  if (!connectionOk) {
    header('TESTS ABORTED');
    log('Cannot proceed without server connection!', 'red');
    log('\nMake sure to:', 'yellow');
    log('  1. Start the backend server: python manage.py runserver 0.0.0.0:8000', 'yellow');
    log('  2. Check firewall settings', 'yellow');
    log('  3. Verify IP address is correct', 'yellow');
    return;
  }

  // Test 2: Registration
  const regResult = await testRegistration();
  results.push({ name: 'Registration', passed: regResult.success });

  // Test 3: Login
  if (regResult.success) {
    const loginOk = await testLogin(regResult.username, regResult.password);
    results.push({ name: 'Login', passed: loginOk });
  } else {
    log('Skipping login test (registration failed)', 'yellow');
  }

  // Summary
  header('TEST SUMMARY');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    if (result.passed) {
      log(`✓ ${result.name}`, 'green');
    } else {
      log(`✗ ${result.name}`, 'red');
    }
  });

  console.log(`\n${colors.bold}Results: ${passed}/${total} tests passed${colors.reset}\n`);

  if (passed === total) {
    log('🎉 All tests passed! Your authentication is working!', 'green');
    log('\nYou can now:', 'blue');
    log('  1. Start your React Native app', 'blue');
    log('  2. Try registering a new user', 'blue');
    log('  3. Try logging in', 'blue');
  } else {
    log('⚠️  Some tests failed!', 'red');
    log('\nCheck the errors above and:', 'yellow');
    log('  1. Ensure migrations are run: python manage.py migrate', 'yellow');
    log('  2. Verify rest_framework.authtoken is in INSTALLED_APPS', 'yellow');
    log('  3. Check server logs for errors', 'yellow');
  }
}

// Run the tests
runTests().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
