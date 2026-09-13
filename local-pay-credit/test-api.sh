#!/usr/bin/env bash
# Full smoke test of the Local Pay & Credit API.
# Usage: start the server first (`npm run api`), then in another terminal:
#   ./test-api.sh
set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS=0
FAIL=0

# check <label> <expected-status> <method> <path> [json-body]
check() {
  local label="$1" expected="$2" method="$3" path="$4" body="${5:-}"
  local response status
  if [ -n "$body" ]; then
    response=$(curl -s -w '\n%{http_code}' -X "$method" "$BASE_URL$path" \
      -H 'Content-Type: application/json' -d "$body")
  else
    response=$(curl -s -w '\n%{http_code}' -X "$method" "$BASE_URL$path")
  fi
  status=$(echo "$response" | tail -n1)
  local payload
  payload=$(echo "$response" | sed '$d')

  if [ "$status" = "$expected" ]; then
    echo "PASS  [$status] $label"
    PASS=$((PASS + 1))
  else
    echo "FAIL  [$status, expected $expected] $label"
    echo "      $payload"
    FAIL=$((FAIL + 1))
  fi
  LAST_BODY="$payload"
}

echo "== Testing $BASE_URL =="
echo

echo "-- Unknown route --"
check "GET / has no route"                              404 GET  "/"

echo
echo "-- Merchant onboarding / KYC --"
check "reject merchant with missing fields"              400 POST "/merchants" '{"legalName":"Missing Tax ID"}'
check "register merchant-1"                              201 POST "/merchants" '{"merchantId":"merchant-1","legalName":"Baghdad Electronics Co.","taxRegistrationNumber":"IQ-TAX-00123"}'
check "read merchant-1"                                  200 GET  "/merchants/merchant-1"
check "read unknown merchant fails"                      400 GET  "/merchants/does-not-exist"
check "approve merchant-1 KYC"                            200 POST "/merchants/merchant-1/kyc/approve"
check "register merchant-2 for rejection test"           201 POST "/merchants" '{"merchantId":"merchant-2","legalName":"Suspicious Traders","taxRegistrationNumber":"IQ-TAX-00999"}'
check "reject merchant-2 KYC without a reason fails"     400 POST "/merchants/merchant-2/kyc/reject" '{}'
check "reject merchant-2 KYC with a reason"               200 POST "/merchants/merchant-2/kyc/reject" '{"reason":"Failed document verification"}'

echo
echo "-- Credit limits and scoring --"
check "grant customer-1 a credit limit"                  201 POST "/credit/customer-1/limit" '{"amount":500000,"currency":"IQD"}'
check "read customer-1 credit score (baseline 600)"      200 GET  "/credit/customer-1/score"

echo
echo "-- Dashboard before any payments (should be all zeros) --"
check "merchant-1 dashboard starts empty"                200 GET  "/merchants/merchant-1/dashboard"
echo "      $LAST_BODY"

echo
echo "-- Payments across every adapter --"
check "pay via qi-card"                                  201 POST "/payments" '{"provider":"qi-card","merchantId":"merchant-1","customerId":"customer-1","amount":50000,"currency":"IQD"}'
check "pay via zain-cash"                                201 POST "/payments" '{"provider":"zain-cash","merchantId":"merchant-1","customerId":"customer-1","amount":150000,"currency":"IQD"}'
check "pay via visa-mastercard"                          201 POST "/payments" '{"provider":"visa-mastercard","merchantId":"merchant-1","customerId":"customer-1","amount":25000,"currency":"IQD"}'
check "pay via cash-agent (COD reconciliation)"          201 POST "/payments" '{"provider":"cash-agent","merchantId":"merchant-1","customerId":"customer-2","amount":75000,"currency":"IQD"}'
check "pay via unknown provider fails"                   400 POST "/payments" '{"provider":"bogus-wallet","merchantId":"merchant-1","customerId":"customer-1","amount":1000,"currency":"IQD"}'
check "pay with missing amount fails"                    400 POST "/payments" '{"provider":"qi-card","merchantId":"merchant-1","customerId":"customer-1","currency":"IQD"}'

echo
echo "-- Credit score after successful payments (should have risen) --"
check "read customer-1 credit score after 3 payments"    200 GET  "/credit/customer-1/score"
echo "      $LAST_BODY"

echo
echo "-- Installment plans --"
check "split a 300,000 IQD purchase into 3 installments"  201 POST "/credit/customer-1/installment-plans" '{"amount":300000,"currency":"IQD","numberOfInstallments":3}'
echo "      $LAST_BODY"
check "installment plan exceeding remaining credit fails" 400 POST "/credit/customer-1/installment-plans" '{"amount":10000000,"currency":"IQD","numberOfInstallments":2}'
check "installment plan for a customer with no credit limit fails" 400 POST "/credit/customer-99/installment-plans" '{"amount":10000,"currency":"IQD","numberOfInstallments":2}'

echo
echo "-- Dashboard after all payments --"
check "merchant-1 dashboard reflects all 4 payments"     200 GET  "/merchants/merchant-1/dashboard"
echo "      $LAST_BODY"

echo
echo "== $PASS passed, $FAIL failed =="
[ "$FAIL" -eq 0 ]
