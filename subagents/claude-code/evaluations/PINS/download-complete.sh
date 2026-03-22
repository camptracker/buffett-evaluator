#!/bin/bash
# Download Pinterest SEC filings and earnings reports

DOWNLOAD_DIR="filings"
mkdir -p "$DOWNLOAD_DIR"

USER_AGENT="OpenClaw Research Bot (openclaw.ai)"
BASE_URL="https://www.sec.gov/Archives/edgar/data/1506293"

echo "Downloading remaining 10-Ks..."

# 10-K 2023
curl -A "$USER_AGENT" --limit-rate 50k -o "$DOWNLOAD_DIR/10K-2023.htm" \
  "$BASE_URL/000150629324000018/pins-20231231.htm"
sleep 2

# 10-K 2024
curl -A "$USER_AGENT" --limit-rate 50k -o "$DOWNLOAD_DIR/10K-2024.htm" \
  "$BASE_URL/000150629325000022/pins-20241231.htm"
sleep 2

# 10-K 2025
curl -A "$USER_AGENT" --limit-rate 50k -o "$DOWNLOAD_DIR/10K-2025.htm" \
  "$BASE_URL/000150629326000021/pins-20251231.htm"
sleep 2

echo ""
echo "Downloading earnings reports (8-K filings with earnings releases)..."

# Recent quarterly earnings (8-K filings)
# Q4 2024 (Feb 2025)
curl -A "$USER_AGENT" --limit-rate 50k -o "$DOWNLOAD_DIR/8K-Q4-2024.htm" \
  "$BASE_URL/000150629325000013/pins-20250212.htm"
sleep 2

# Q3 2024 (Oct 2024)
curl -A "$USER_AGENT" --limit-rate 50k -o "$DOWNLOAD_DIR/8K-Q3-2024.htm" \
  "$BASE_URL/000150629324000034/pins-20241031.htm"
sleep 2

# Q2 2024 (Jul 2024)
curl -A "$USER_AGENT" --limit-rate 50k -o "$DOWNLOAD_DIR/8K-Q2-2024.htm" \
  "$BASE_URL/000150629324000027/pins-20240730.htm"
sleep 2

# Q1 2024 (Apr 2024)
curl -A "$USER_AGENT" --limit-rate 50k -o "$DOWNLOAD_DIR/8K-Q1-2024.htm" \
  "$BASE_URL/000150629324000020/pins-20240425.htm"
sleep 2

echo ""
echo "Download complete!"
ls -lh "$DOWNLOAD_DIR/" | grep -E '10K|8K'
