#!/usr/bin/env bash
# The balanced hard-gate. Each command runs under a hard timeout and we capture
# the REAL exit code (never a pipe's). Exit 124 from `timeout` means the command
# HUNG — investigate, do not treat as pass. ALL codes must be 0.
set +e

timeout 300 pnpm typecheck            ; tc=$?
timeout 180 pnpm lint                 ; ln=$?
timeout 120 pnpm guard                ; gd=$?
timeout 120 pnpm lint:content         ; lc=$?
timeout 600 pnpm test 2>&1 | tee /tmp/siddur-test.log ; tst=${PIPESTATUS[0]}
timeout 300 pnpm build                ; bd=$?

echo ""
echo "================ GATE RESULT ================"
echo "typecheck=$tc  lint=$ln  guard=$gd  content=$lc  test=$tst  build=$bd"
# Surface the recorded test counts so a silent drop is visible.
grep -E "Test Files|Tests" /tmp/siddur-test.log | sed 's/^/  /'
echo "============================================"

if [ $tc -eq 0 ] && [ $ln -eq 0 ] && [ $gd -eq 0 ] && [ $lc -eq 0 ] && [ $tst -eq 0 ] && [ $bd -eq 0 ]; then
  echo "✓ ALL GREEN"
  exit 0
else
  echo "✗ GATE RED"
  exit 1
fi
