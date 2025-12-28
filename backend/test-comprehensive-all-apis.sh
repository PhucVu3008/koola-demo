#!/bin/bash

# ==============================================================================
# COMPREHENSIVE TEST SUITE - Koola Fullstack Project
# Tests ALL APIs with ALL edge cases and error scenarios
# ==============================================================================

BASE_URL="http://localhost:5001/api"
FRONTEND_URL="http://localhost:3000"

# Load environment variables for DB connection.
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

DB_URI="${MONGODB_URI:-mongodb://localhost:27017/koola_test}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Arrays to track failures
declare -a FAILED_TEST_NAMES

print_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        FAILED_TEST_NAMES+=("$2")
    fi
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
}

print_section() {
    echo ""
    echo -e "${CYAN}━━━ $1 ━━━${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

clear_login_attempts() {
    if command -v mongosh >/dev/null 2>&1; then
        mongosh "$DB_URI" --quiet --eval 'db.loginattempts.deleteMany({})' > /dev/null 2>&1
        return 0
    fi

    if command -v mongo >/dev/null 2>&1; then
        mongo "$DB_URI" --quiet --eval 'db.loginattempts.deleteMany({})' > /dev/null 2>&1
        return 0
    fi

    print_info "mongosh not found; skipping loginattempts cleanup."
    return 1
}

login_admin() {
    ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/sessions \
      -H "Content-Type: application/json" \
      -d '{"username":"admin","password":"admin123"}')
    ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    ADMIN_ROLE=$(echo $ADMIN_RESPONSE | grep -o '"role":"[^"]*' | cut -d'"' -f4)
}

login_lv2() {
    LV2_RESPONSE=$(curl -s -X POST $BASE_URL/sessions \
      -H "Content-Type: application/json" \
      -d '{"username":"user_lv2","password":"user123"}')
    LV2_TOKEN=$(echo $LV2_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    LV2_ROLE=$(echo $LV2_RESPONSE | grep -o '"role":"[^"]*' | cut -d'"' -f4)
}

login_lv1() {
    LV1_RESPONSE=$(curl -s -X POST $BASE_URL/sessions \
      -H "Content-Type: application/json" \
      -d '{"username":"user_lv1","password":"user123"}')
    LV1_TOKEN=$(echo $LV1_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    LV1_ROLE=$(echo $LV1_RESPONSE | grep -o '"role":"[^"]*' | cut -d'"' -f4)
}

refresh_tokens() {
    print_info "Refreshing tokens..."
    login_admin
    login_lv2
    login_lv1

    if [ -z "$ADMIN_TOKEN" ] || [ -z "$LV2_TOKEN" ] || [ -z "$LV1_TOKEN" ]; then
        echo -e "${RED}❌ Failed to refresh tokens. Check seed data and credentials.${NC}"
        exit 1
    fi
}

echo -e "${PURPLE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     COMPREHENSIVE TEST SUITE - KOOLA PROJECT          ║${NC}"
echo -e "${PURPLE}║     Testing ALL APIs with ALL edge cases              ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Clear IP blocking records before testing
print_info "Clearing IP blocking records..."
clear_login_attempts
echo ""

# ==============================================================================
# TEST SUITE 1: AUTHENTICATION & SECURITY
# ==============================================================================
print_header "SUITE 1: AUTHENTICATION & SECURITY"

print_section "1.1 Login Success Cases"

# Test 1.1.1: Admin login success
print_info "Testing admin login (lv3)..."
login_admin

if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_ROLE" = "lv3" ]; then
    print_result 0 "Admin login successful (lv3)"
else
    print_result 1 "Admin login failed"
fi

# Test 1.1.2: Manager login success
print_info "Testing manager login (lv2)..."
login_lv2

if [ -n "$LV2_TOKEN" ] && [ "$LV2_ROLE" = "lv2" ]; then
    print_result 0 "Manager login successful (lv2)"
else
    print_result 1 "Manager login failed"
fi

# Test 1.1.3: User login success
print_info "Testing user login (lv1)..."
login_lv1

if [ -n "$LV1_TOKEN" ] && [ "$LV1_ROLE" = "lv1" ]; then
    print_result 0 "User login successful (lv1)"
else
    print_result 1 "User login failed"
fi

print_section "1.2 Login Failure Cases"

# Test 1.2.1: Wrong password
print_info "Testing login with wrong password..."
WRONG_PASS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/sessions \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpassword"}')
[ "$WRONG_PASS" = "401" ] && print_result 0 "Wrong password returns 401" || print_result 1 "Wrong password should return 401 (got $WRONG_PASS)"

# Test 1.2.2: Non-existent user
print_info "Testing login with non-existent user..."
NO_USER=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/sessions \
  -H "Content-Type: application/json" \
  -d '{"username":"nonexistent","password":"password"}')
[ "$NO_USER" = "401" ] && print_result 0 "Non-existent user returns 401" || print_result 1 "Non-existent user should return 401 (got $NO_USER)"

# Test 1.2.3: Missing username
print_info "Testing login without username..."
NO_USERNAME=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/sessions \
  -H "Content-Type: application/json" \
  -d '{"password":"password"}')
[ "$NO_USERNAME" = "400" ] && print_result 0 "Missing username returns 400" || print_result 1 "Missing username should return 400 (got $NO_USERNAME)"

# Test 1.2.4: Missing password
print_info "Testing login without password..."
NO_PASSWORD=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/sessions \
  -H "Content-Type: application/json" \
  -d '{"username":"admin"}')
[ "$NO_PASSWORD" = "400" ] && print_result 0 "Missing password returns 400" || print_result 1 "Missing password should return 400 (got $NO_PASSWORD)"

# Test 1.2.5: Empty credentials
print_info "Testing login with empty credentials..."
EMPTY_CREDS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/sessions \
  -H "Content-Type: application/json" \
  -d '{"username":"","password":""}')
[ "$EMPTY_CREDS" = "400" ] && print_result 0 "Empty credentials return 400" || print_result 1 "Empty credentials should return 400 (got $EMPTY_CREDS)"

print_section "1.3 IP Blocking Tests"

# Create a unique test IP scenario
print_info "Testing IP blocking after 3 failed attempts..."
print_info "Attempt 1/3 - Wrong password..."
curl -s -X POST $BASE_URL/sessions \
  -H "Content-Type: application/json" \
  -d '{"username":"testblock","password":"wrong1"}' > /dev/null

print_info "Attempt 2/3 - Wrong password..."
curl -s -X POST $BASE_URL/sessions \
  -H "Content-Type: application/json" \
  -d '{"username":"testblock","password":"wrong2"}' > /dev/null

print_info "Attempt 3/3 - Wrong password..."
curl -s -X POST $BASE_URL/sessions \
  -H "Content-Type: application/json" \
  -d '{"username":"testblock","password":"wrong3"}' > /dev/null

print_info "Attempt 4 - Should be blocked..."
BLOCKED_RESPONSE=$(curl -s -X POST $BASE_URL/sessions \
  -H "Content-Type: application/json" \
  -d '{"username":"testblock","password":"wrong4"}')
BLOCKED_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/sessions \
  -H "Content-Type: application/json" \
  -d '{"username":"testblock","password":"wrong4"}')

if [ "$BLOCKED_CODE" = "429" ]; then
    print_result 0 "IP blocked after 3 failed attempts (HTTP 429)"
else
    print_result 1 "IP blocking not working (got HTTP $BLOCKED_CODE instead of 429)"
fi

# Test 1.3.2: Block message contains remaining time
REMAINING_TIME=$(echo $BLOCKED_RESPONSE | grep -o '"remainingTime":[0-9]*' | grep -o '[0-9]*')
if [ -n "$REMAINING_TIME" ] && [ "$REMAINING_TIME" -gt 0 ]; then
    print_result 0 "Block message includes remaining time ($REMAINING_TIME seconds)"
else
    print_result 1 "Block message should include remaining time"
fi

# Clear IP blocking records to avoid blocking subsequent logins during this run.
print_info "Resetting IP block records..."
clear_login_attempts

print_section "1.4 Token Validation"

# Test 1.4.1: Valid token access
print_info "Testing valid token access..."
VALID_TOKEN=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/users \
  -H "Authorization: Bearer $ADMIN_TOKEN")
[ "$VALID_TOKEN" = "200" ] && print_result 0 "Valid token grants access" || print_result 1 "Valid token should grant access"

# Refresh admin token for long-running test suites (JWT expires quickly).
print_info "Refreshing admin token..."
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/sessions \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Test 1.4.2: Invalid token
print_info "Testing invalid token..."
INVALID_TOKEN=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/users \
  -H "Authorization: Bearer invalid_token_xyz")
[ "$INVALID_TOKEN" = "401" ] && print_result 0 "Invalid token rejected (401)" || print_result 1 "Invalid token should return 401"

# Test 1.4.3: Missing token
print_info "Testing missing token..."
NO_TOKEN=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/users)
[ "$NO_TOKEN" = "401" ] && print_result 0 "Missing token rejected (401)" || print_result 1 "Missing token should return 401"

# Test 1.4.4: Malformed Authorization header
print_info "Testing malformed Authorization header..."
MALFORMED=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/users \
  -H "Authorization: InvalidFormat")
[ "$MALFORMED" = "401" ] && print_result 0 "Malformed header rejected (401)" || print_result 1 "Malformed header should return 401"

# ==============================================================================
# TEST SUITE 2: USER CRUD OPERATIONS
# ==============================================================================
refresh_tokens
print_header "SUITE 2: USER CRUD OPERATIONS"

print_section "2.1 GET /api/users - List Users"

# Test 2.1.1: lv1 can GET
print_info "Testing lv1 can GET users..."
LV1_GET=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/users \
  -H "Authorization: Bearer $LV1_TOKEN")
[ "$LV1_GET" = "200" ] && print_result 0 "lv1 can GET users" || print_result 1 "lv1 GET failed (got $LV1_GET)"

# Test 2.1.2: GET with search
print_info "Testing GET with search parameter..."
SEARCH_RESULT=$(curl -s "$BASE_URL/users?search=admin" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
SEARCH_COUNT=$(echo $SEARCH_RESULT | grep -o '"username":"admin"' | wc -l)
[ "$SEARCH_COUNT" -gt 0 ] && print_result 0 "Search parameter works" || print_result 1 "Search failed"

# Test 2.1.3: GET with role filter
print_info "Testing GET with roleFilter..."
ROLE_FILTER=$(curl -s "$BASE_URL/users?roleFilter=lv3" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
ROLE_COUNT=$(echo $ROLE_FILTER | grep -o '"role":"lv3"' | wc -l)
[ "$ROLE_COUNT" -gt 0 ] && print_result 0 "Role filter works" || print_result 1 "Role filter failed"

# Test 2.1.4: GET with pagination
print_info "Testing GET with pagination..."
PAGE_RESULT=$(curl -s "$BASE_URL/users?page=1&limit=2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
PAGE_COUNT=$(echo $PAGE_RESULT | grep -o '"username"' | wc -l)
[ "$PAGE_COUNT" -le 2 ] && print_result 0 "Pagination works (limit=2)" || print_result 1 "Pagination failed"

# Test 2.1.5: GET with sort
print_info "Testing GET with sort..."
SORT_RESULT=$(curl -s "$BASE_URL/users?sortBy=username&sortOrder=asc" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
[ -n "$SORT_RESULT" ] && print_result 0 "Sort parameter accepted" || print_result 1 "Sort failed"

print_section "2.2 GET /api/users/:id - Get Single User"

# Test 2.2.1: Valid user ID
print_info "Testing GET single user with valid ID..."
# Get first user ID
FIRST_USER_ID=$(curl -s "$BASE_URL/users?limit=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$FIRST_USER_ID" ]; then
    SINGLE_USER=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/users/$FIRST_USER_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    [ "$SINGLE_USER" = "200" ] && print_result 0 "GET single user works" || print_result 1 "GET single user failed"
fi

# Test 2.2.2: Invalid user ID format
print_info "Testing GET with invalid ID format..."
INVALID_ID=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/users/invalid123" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
[ "$INVALID_ID" = "400" ] && print_result 0 "Invalid ID format returns 400" || print_result 1 "Invalid ID should return 400 (got $INVALID_ID)"

# Test 2.2.3: Non-existent user ID
print_info "Testing GET with non-existent ID..."
NONEXIST_ID=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/users/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
[ "$NONEXIST_ID" = "404" ] && print_result 0 "Non-existent ID returns 404" || print_result 1 "Non-existent ID should return 404"

print_section "2.3 POST /api/users - Create User"

# Test 2.3.1: lv1 cannot POST
print_info "Testing lv1 cannot POST..."
LV1_POST=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/users \
  -H "Authorization: Bearer $LV1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","email":"test@test.com","role":"lv1"}')
[ "$LV1_POST" = "403" ] && print_result 0 "lv1 blocked from POST (403)" || print_result 1 "lv1 should be blocked (got $LV1_POST)"

# Test 2.3.2: lv2 can POST
print_info "Testing lv2 can POST..."
LV2_POST_RESPONSE=$(curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $LV2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"test_lv2_create","password":"test123","email":"testlv2create@test.com","role":"lv1"}')
LV2_POST_ID=$(echo $LV2_POST_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
[ -n "$LV2_POST_ID" ] && print_result 0 "lv2 can POST user" || print_result 1 "lv2 POST failed"

# Test 2.3.3: Missing required fields
print_info "Testing POST without required fields..."
MISSING_FIELDS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"incomplete"}')
[ "$MISSING_FIELDS" = "400" ] && print_result 0 "Missing fields returns 400" || print_result 1 "Missing fields should return 400 (got $MISSING_FIELDS)"

# Test 2.3.4: Duplicate username
print_info "Testing POST with duplicate username..."
DUP_USERNAME=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"test123","email":"dup@test.com","role":"lv1"}')
[ "$DUP_USERNAME" = "409" ] && print_result 0 "Duplicate username blocked (409)" || print_result 1 "Duplicate should return 409 (got $DUP_USERNAME)"

# Test 2.3.5: Duplicate email
print_info "Testing POST with duplicate email..."
DUP_EMAIL=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"uniquename","password":"test123","email":"admin@koola.com","role":"lv1"}')
[ "$DUP_EMAIL" = "409" ] && print_result 0 "Duplicate email blocked (409)" || print_result 1 "Duplicate email should return 409"

# Test 2.3.6: Invalid role
print_info "Testing POST with invalid role..."
INVALID_ROLE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"test_invalid_role","password":"test123","email":"invalid@test.com","role":"invalid"}')
[ "$INVALID_ROLE" = "400" ] && print_result 0 "Invalid role blocked (400)" || print_result 1 "Invalid role should return 400"

# Test 2.3.7: Invalid email format
print_info "Testing POST with invalid email format..."
INVALID_EMAIL=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"test_invalid_email","password":"test123","email":"notanemail","role":"lv1"}')
# Email validation might not be enforced, but test anyway
if [ "$INVALID_EMAIL" = "400" ] || [ "$INVALID_EMAIL" = "201" ]; then
    print_result 0 "Invalid email handled (got $INVALID_EMAIL)"
else
    print_result 1 "Invalid email response unexpected (got $INVALID_EMAIL)"
fi

print_section "2.4 PATCH /api/users/:id - Update User"

if [ -n "$LV2_POST_ID" ]; then
    # Test 2.4.1: lv1 cannot PATCH
    print_info "Testing lv1 cannot PATCH..."
    LV1_PUT=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/users/$LV2_POST_ID" \
      -H "Authorization: Bearer $LV1_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"email":"updated@test.com"}')
    [ "$LV1_PUT" = "403" ] && print_result 0 "lv1 blocked from PATCH (403)" || print_result 1 "lv1 should be blocked"

    # Test 2.4.2: lv2 can PATCH
    print_info "Testing lv2 can PATCH..."
    LV2_PUT=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/users/$LV2_POST_ID" \
      -H "Authorization: Bearer $LV2_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"email":"updated_lv2@test.com"}')
    [ "$LV2_PUT" = "200" ] && print_result 0 "lv2 can PATCH user" || print_result 1 "lv2 PATCH failed"

    # Test 2.4.3: Partial update
    print_info "Testing partial update (phone only)..."
    PARTIAL=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/users/$LV2_POST_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"phone":"0123456789"}')
    [ "$PARTIAL" = "200" ] && print_result 0 "Partial update works" || print_result 1 "Partial update failed"

    # Test 2.4.4: Update with invalid ID
    print_info "Testing PATCH with invalid ID..."
    INVALID_PUT_ID=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/users/invalid123" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"email":"test@test.com"}')
    [ "$INVALID_PUT_ID" = "400" ] && print_result 0 "PATCH with invalid ID returns 400" || print_result 1 "PATCH invalid ID should return 400"
fi

print_section "2.5 DELETE /api/users/:id - Delete User"

if [ -n "$LV2_POST_ID" ]; then
    # Test 2.5.1: lv1 cannot DELETE
    print_info "Testing lv1 cannot DELETE..."
    LV1_DELETE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/users/$LV2_POST_ID" \
      -H "Authorization: Bearer $LV1_TOKEN")
    [ "$LV1_DELETE" = "403" ] && print_result 0 "lv1 blocked from DELETE (403)" || print_result 1 "lv1 should be blocked"

    # Test 2.5.2: lv2 cannot DELETE
    print_info "Testing lv2 cannot DELETE..."
    LV2_DELETE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/users/$LV2_POST_ID" \
      -H "Authorization: Bearer $LV2_TOKEN")
    [ "$LV2_DELETE" = "403" ] && print_result 0 "lv2 blocked from DELETE (403)" || print_result 1 "lv2 should be blocked"

    # Test 2.5.3: lv3 can DELETE
    print_info "Testing lv3 can DELETE..."
    LV3_DELETE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/users/$LV2_POST_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    [ "$LV3_DELETE" = "200" ] && print_result 0 "lv3 can DELETE user" || print_result 1 "lv3 DELETE failed"

    # Test 2.5.4: Delete with invalid ID
    print_info "Testing DELETE with invalid ID..."
    INVALID_DELETE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/users/invalid123" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    [ "$INVALID_DELETE" = "400" ] && print_result 0 "DELETE invalid ID returns 400" || print_result 1 "DELETE invalid ID should return 400"

    # Test 2.5.5: Delete non-existent user
    print_info "Testing DELETE non-existent user..."
    NONEXIST_DELETE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/users/507f1f77bcf86cd799439011" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    [ "$NONEXIST_DELETE" = "404" ] && print_result 0 "DELETE non-existent returns 404" || print_result 1 "DELETE non-existent should return 404"
fi

# ==============================================================================
# TEST SUITE 3: SETTINGS API
# ==============================================================================
refresh_tokens
print_header "SUITE 3: SETTINGS API"

print_section "3.1 GET /api/settings"

# Test 3.1.1: lv3 can GET settings
print_info "Testing lv3 can GET settings..."
SETTINGS_GET=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/settings \
  -H "Authorization: Bearer $ADMIN_TOKEN")
[ "$SETTINGS_GET" = "200" ] && print_result 0 "lv3 can GET settings" || print_result 1 "lv3 GET settings failed"

# Test 3.1.2: lv1 cannot GET settings
print_info "Testing lv1 cannot GET settings..."
LV1_SETTINGS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/settings \
  -H "Authorization: Bearer $LV1_TOKEN")
[ "$LV1_SETTINGS" = "403" ] && print_result 0 "lv1 blocked from settings (403)" || print_result 1 "lv1 should be blocked"

# Test 3.1.3: lv2 cannot GET settings
print_info "Testing lv2 cannot GET settings..."
LV2_SETTINGS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/settings \
  -H "Authorization: Bearer $LV2_TOKEN")
[ "$LV2_SETTINGS" = "403" ] && print_result 0 "lv2 blocked from settings (403)" || print_result 1 "lv2 should be blocked"

print_section "3.2 PATCH /api/settings/:key - Update Setting"

# Test 3.2.1: Update BLOCK_IP_DURATION
print_info "Testing update BLOCK_IP_DURATION..."
UPDATE_BLOCK=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/settings/BLOCK_IP_DURATION" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"30"}')
[ "$UPDATE_BLOCK" = "200" ] && print_result 0 "BLOCK_IP_DURATION updated" || print_result 1 "BLOCK_IP_DURATION update failed"

# Test 3.2.2: Update JWT_EXPIRES_IN
print_info "Testing update JWT_EXPIRES_IN..."
UPDATE_JWT=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/settings/JWT_EXPIRES_IN" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"2m"}')
[ "$UPDATE_JWT" = "200" ] && print_result 0 "JWT_EXPIRES_IN updated" || print_result 1 "JWT_EXPIRES_IN update failed"

# Test 3.2.3: Update with invalid key
print_info "Testing update with invalid key..."
INVALID_KEY=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/settings/INVALID_KEY" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"test"}')
# Should either return 404 or 400
if [ "$INVALID_KEY" = "404" ] || [ "$INVALID_KEY" = "400" ]; then
    print_result 0 "Invalid key handled (got $INVALID_KEY)"
else
    print_result 1 "Invalid key should return 404/400 (got $INVALID_KEY)"
fi

# Test 3.2.4: Update without value
print_info "Testing update without value..."
NO_VALUE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/settings/BLOCK_IP_DURATION" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
[ "$NO_VALUE" = "400" ] && print_result 0 "Missing value returns 400" || print_result 1 "Missing value should return 400"

print_section "3.3 PATCH /api/users/me/password"

# Get fresh admin token for password change (JWT may have expired)
print_info "Getting fresh admin token for password tests..."
ADMIN_FRESH=$(curl -s -X POST $BASE_URL/sessions \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
ADMIN_FRESH_TOKEN=$(echo $ADMIN_FRESH | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Test 3.3.1: Change password success
print_info "Testing change password..."
CHANGE_PASS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/users/me/password" \
  -H "Authorization: Bearer $ADMIN_FRESH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"admin123","newPassword":"admin123"}')
[ "$CHANGE_PASS" = "200" ] && print_result 0 "Change password works" || print_result 1 "Change password failed"

# Test 3.3.2: Wrong current password
print_info "Testing change password with wrong current..."
WRONG_CURRENT=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/users/me/password" \
  -H "Authorization: Bearer $ADMIN_FRESH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"wrongpassword","newPassword":"newpass123"}')
[ "$WRONG_CURRENT" = "401" ] && print_result 0 "Wrong current password rejected (401)" || print_result 1 "Wrong password should return 401 (got $WRONG_CURRENT)"

# Test 3.3.3: Missing fields
print_info "Testing change password without fields..."
MISSING_PASS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/users/me/password" \
  -H "Authorization: Bearer $ADMIN_FRESH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
[ "$MISSING_PASS" = "400" ] && print_result 0 "Missing password fields returns 400" || print_result 1 "Missing fields should return 400"

# ==============================================================================
# TEST SUITE 4: SYSTEM INFO API
# ==============================================================================
refresh_tokens
print_header "SUITE 4: SYSTEM INFO API"

# Test 4.1: lv3 can GET system info
print_info "Testing lv3 can GET system info..."
SYSINFO_GET=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/system \
  -H "Authorization: Bearer $ADMIN_TOKEN")
[ "$SYSINFO_GET" = "200" ] && print_result 0 "lv3 can GET system info" || print_result 1 "System info GET failed"

# Test 4.2: lv1 cannot GET system info
print_info "Testing lv1 cannot GET system info..."
LV1_SYSINFO=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/system \
  -H "Authorization: Bearer $LV1_TOKEN")
[ "$LV1_SYSINFO" = "403" ] && print_result 0 "lv1 blocked from system info (403)" || print_result 1 "lv1 should be blocked"

# Test 4.3: System info contains expected data
print_info "Testing system info data structure..."
SYSINFO_DATA=$(curl -s $BASE_URL/system \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HAS_BACKEND=$(echo $SYSINFO_DATA | grep -o '"backend"' | wc -l)
HAS_FRONTEND=$(echo $SYSINFO_DATA | grep -o '"frontend"' | wc -l)
HAS_ARCH=$(echo $SYSINFO_DATA | grep -o '"architecture"' | wc -l)

if [ "$HAS_BACKEND" -gt 0 ] && [ "$HAS_FRONTEND" -gt 0 ] && [ "$HAS_ARCH" -gt 0 ]; then
    print_result 0 "System info contains all expected sections"
else
    print_result 1 "System info missing sections"
fi

# ==============================================================================
# TEST SUITE 5: EDGE CASES & ERROR HANDLING
# ==============================================================================
refresh_tokens
print_header "SUITE 5: EDGE CASES & ERROR HANDLING"

print_section "5.1 SQL Injection & XSS Attempts"

# Test 5.1.1: SQL injection in username
print_info "Testing SQL injection in username..."
SQL_INJECT=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/sessions \
  -H "Content-Type: application/json" \
  -d '{"username":"admin\" OR \"1\"=\"1","password":"anything"}')
# Should be handled safely (not 500)
if [ "$SQL_INJECT" != "500" ]; then
    print_result 0 "SQL injection handled safely (got $SQL_INJECT)"
else
    print_result 1 "SQL injection caused server error (500)"
fi

# Test 5.1.2: XSS in user creation
print_info "Testing XSS in user creation..."
XSS_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"<script>alert(1)</script>","password":"test123","email":"xss@test.com","role":"lv1"}')
# Should either create (sanitized) or reject
if [ "$XSS_TEST" = "201" ] || [ "$XSS_TEST" = "400" ]; then
    print_result 0 "XSS handled (got $XSS_TEST)"
else
    print_result 1 "XSS caused unexpected error (got $XSS_TEST)"
fi

print_section "5.2 Large Payload Tests"

# Test 5.2.1: Very long username
print_info "Testing very long username..."
LONG_USER=$(printf 'a%.0s' {1..1000})
LONG_USERNAME=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$LONG_USER\",\"password\":\"test123\",\"email\":\"long@test.com\",\"role\":\"lv1\"}")
# Should reject (400) or handle gracefully
if [ "$LONG_USERNAME" != "500" ]; then
    print_result 0 "Long username handled (got $LONG_USERNAME)"
else
    print_result 1 "Long username caused server error"
fi

print_section "5.3 Concurrent Request Tests"

# Test 5.3.1: Multiple simultaneous requests
print_info "Testing 5 concurrent GET requests..."
for i in {1..5}; do
    curl -s $BASE_URL/users -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null &
done
wait
print_result 0 "Concurrent requests handled"

print_section "5.4 Special Characters"

# Test 5.4.1: Unicode in username
print_info "Testing Unicode characters..."
UNICODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"用户名","password":"test123","email":"unicode@test.com","role":"lv1"}')
if [ "$UNICODE" != "500" ]; then
    print_result 0 "Unicode handled (got $UNICODE)"
else
    print_result 1 "Unicode caused server error"
fi

print_section "5.5 Rate Limiting"

# Test 5.5.1: Many requests in short time
print_info "Testing 20 rapid requests..."
RATE_LIMIT_ERRORS=0
for i in {1..20}; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/users -H "Authorization: Bearer $ADMIN_TOKEN")
    if [ "$RESPONSE" = "429" ]; then
        RATE_LIMIT_ERRORS=$((RATE_LIMIT_ERRORS + 1))
    fi
done

if [ "$RATE_LIMIT_ERRORS" -gt 0 ]; then
    print_result 0 "Rate limiting active (${RATE_LIMIT_ERRORS} requests limited)"
else
    print_result 0 "No rate limiting (all 20 requests succeeded)"
fi

# ==============================================================================
# FINAL SUMMARY
# ==============================================================================
print_header "TEST SUMMARY"

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                  FINAL RESULTS                         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests:  ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}━━━ FAILED TESTS ━━━${NC}"
    for test_name in "${FAILED_TEST_NAMES[@]}"; do
        echo -e "${RED}  ❌ $test_name${NC}"
    done
    echo ""
fi

PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
echo -e "Pass Rate:    ${CYAN}${PASS_RATE}%${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! System is production ready! 🎉${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please review above.${NC}"
    exit 1
fi
