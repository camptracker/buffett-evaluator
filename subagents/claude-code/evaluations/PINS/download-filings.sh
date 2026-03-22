#!/bin/bash
# Download Pinterest 10-K filings from SEC EDGAR

DOWNLOAD_DIR="filings"
mkdir -p "$DOWNLOAD_DIR"

USER_AGENT="OpenClaw Research Bot (openclaw.ai)"
BASE_URL="https://www.sec.gov/Archives/edgar/data/1506293"

# 10-K filings (last 6 years)
declare -A FILINGS=(
  ["2025"]="000150629326000021/pins-20251231.htm"
  ["2024"]="000150629325000022/pins-20241231.htm"
  ["2023"]="000150629324000018/pins-20231231.htm"
  ["2022"]="000150629323000023/pins-20221231.htm"
  ["2021"]="000150629322000016/pins-20211231.htm"
  ["2020"]="000150629321000025/pins-20201231.htm"
)

echo "Downloading Pinterest 10-K filings..."

for year in "${!FILINGS[@]}"; do
  FILE="${FILINGS[$year]}"
  OUTPUT="$DOWNLOAD_DIR/10K-$year.htm"
  URL="$BASE_URL/$FILE"
  
  echo "Downloading $year 10-K..."
  curl -A "$USER_AGENT" \
    -H "Accept: text/html,application/xhtml+xml" \
    -H "Accept-Language: en-US,en;q=0.9" \
    --limit-rate 50k \
    -o "$OUTPUT" \
    "$URL"
  
  # SEC rate limit: max 10 requests/second, so wait 2 seconds between requests
  sleep 2
  
  if [ -f "$OUTPUT" ]; then
    SIZE=$(du -h "$OUTPUT" | cut -f1)
    echo "✓ Downloaded $year ($SIZE)"
  else
    echo "✗ Failed to download $year"
  fi
done

echo ""
echo "Download complete. Files saved to: $DOWNLOAD_DIR/"
ls -lh "$DOWNLOAD_DIR/"
