#!/bin/bash

# File where API routes are stored (one per line)
ROUTES_FILE="routes.txt"

# Output Markdown file
DOC_FILE="API_DOCS.md"

# Start fresh
echo "# API Documentation" > $DOC_FILE
echo "" >> $DOC_FILE

while IFS= read -r route
do
  # Clean double "/api/api" into "/api"
  clean_route=$(echo "$route" | sed 's|/api/api|/api|')

  echo "### [METHOD?] $clean_route" >> $DOC_FILE
  echo "**Task:** (Describe here in plain words)" >> $DOC_FILE
  echo "" >> $DOC_FILE
  echo "**Request Parameters:**" >> $DOC_FILE
  echo "- Query params: ..." >> $DOC_FILE
  echo "- Body params: ..." >> $DOC_FILE
  echo "" >> $DOC_FILE
  echo "**Example Request:**" >> $DOC_FILE
  echo "\`\`\`json" >> $DOC_FILE
  echo "{ \"key\": \"value\" }" >> $DOC_FILE
  echo "\`\`\`" >> $DOC_FILE
  echo "" >> $DOC_FILE
  echo "**Response:**" >> $DOC_FILE
  echo "- **200 OK**" >> $DOC_FILE
  echo "\`\`\`json" >> $DOC_FILE
  echo "{ \"message\": \"Success\" }" >> $DOC_FILE
  echo "\`\`\`" >> $DOC_FILE
  echo "- **400 Bad Request**" >> $DOC_FILE
  echo "\`\`\`json" >> $DOC_FILE
  echo "{ \"error\": \"Something went wrong\" }" >> $DOC_FILE
  echo "\`\`\`" >> $DOC_FILE
  echo "" >> $DOC_FILE
  echo "**Auth Required:** Yes/No" >> $DOC_FILE
  echo "" >> $DOC_FILE
  echo "---" >> $DOC_FILE
  echo "" >> $DOC_FILE

done < "$ROUTES_FILE"

echo "✅ API_DOCS.md generated with skeletons for all routes!"

