// Improved script to extract countries from TypeScript file
const fs = require('fs');
const path = require('path');

const countriesFilePath = path.join(__dirname, '../../client/data/countries.ts');
const fileContent = fs.readFileSync(countriesFilePath, 'utf-8');

const countries = {};

// Find the start of countries object
const countriesStart = fileContent.indexOf('export const countries:');
if (countriesStart === -1) {
  console.error('Could not find countries object');
  process.exit(1);
}

// Extract the countries object content - find the opening brace
const braceStart = fileContent.indexOf('{', countriesStart);
if (braceStart === -1) {
  console.error('Could not find opening brace');
  process.exit(1);
}

// Find the matching closing brace for the main countries object
let braceCount = 1;
let i = braceStart + 1;
let inString = false;
let stringChar = '';
let commentMode = false;
let commentChar = '';

while (i < fileContent.length && braceCount > 0) {
  const char = fileContent[i];
  const prevChar = fileContent[i - 1];
  const nextChar = fileContent[i + 1] || '';
  
  // Handle comments
  if (!inString && !commentMode) {
    if (char === '/' && nextChar === '/') {
      // Skip to end of line
      while (i < fileContent.length && fileContent[i] !== '\n') i++;
      continue;
    }
    if (char === '/' && nextChar === '*') {
      commentMode = true;
      commentChar = '*/';
      i += 2;
      continue;
    }
  }
  
  if (commentMode) {
    if (char === '*' && nextChar === '/') {
      commentMode = false;
      i += 2;
      continue;
    }
    i++;
    continue;
  }
  
  // Handle strings
  if (!inString && (char === '"' || char === "'" || char === '`')) {
    inString = true;
    stringChar = char;
  } else if (inString && char === stringChar && prevChar !== '\\') {
    inString = false;
  } else if (!inString) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
  }
  i++;
}

if (braceCount !== 0) {
  console.error('Could not find matching closing brace');
  process.exit(1);
}

const countriesContent = fileContent.substring(braceStart + 1, i - 1);

console.error(`Countries content length: ${countriesContent.length} characters`);

// Use a better approach: find all country keys first
// Pattern: any whitespace + identifier (country key) + : + {
const skipKeywords = ['export', 'const', 'interface', 'type', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'getAllCountries', 'getCountryData', 'Record', 'string', 'CountryData'];

// Find all country key patterns - look for pattern: identifier: {
// But we need to be careful - we want country keys at the root level
let pos = 0;
const countryMatches = [];

while (pos < countriesContent.length) {
  // Look for pattern: whitespace + identifier + : + whitespace + {
  const pattern = /(\s+)([a-z_][a-z0-9_]*)\s*:\s*\{/;
  const match = countriesContent.substring(pos).match(pattern);
  
  if (!match) {
    pos++;
    continue;
  }
  
  const countryKey = match[2];
  const matchStart = pos + match.index;
  const matchEnd = matchStart + match[0].length;
  
  // Skip if it's a keyword
  if (skipKeywords.includes(countryKey)) {
    pos = matchEnd;
    continue;
  }
  
  // Check if this is at the root level (not nested)
  // Count braces before this match to see if we're at root level
  let levelCount = 0;
  for (let k = 0; k < matchStart; k++) {
    const ch = countriesContent[k];
    if (ch === '{' && !isInString(countriesContent, k)) levelCount++;
    if (ch === '}' && !isInString(countriesContent, k)) levelCount--;
  }
  
  // If levelCount is 0 or 1, we're at root level
  if (levelCount <= 1) {
    countryMatches.push({
      key: countryKey,
      startPos: matchStart,
      matchLength: match[0].length,
      fullStart: matchEnd
    });
  }
  
  pos = matchEnd;
}

function isInString(content, pos) {
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < pos; i++) {
    const ch = content[i];
    const prevCh = content[i - 1];
    if (!inString && (ch === '"' || ch === "'" || ch === '`')) {
      inString = true;
      stringChar = ch;
    } else if (inString && ch === stringChar && prevCh !== '\\') {
      inString = false;
    }
  }
  return inString;
}

console.error(`Found ${countryMatches.length} potential country entries`);

// Now extract each country
let count = 0;
for (let matchIdx = 0; matchIdx < countryMatches.length; matchIdx++) {
  const match = countryMatches[matchIdx];
  const countryKey = match.key;
  const countryStartPos = match.fullStart;
  
  // Find the end position (either next country start or end of content)
  const nextMatchStart = matchIdx < countryMatches.length - 1 
    ? countryMatches[matchIdx + 1].startPos 
    : countriesContent.length;
  
  // Find the closing brace for this country (within the section before next country)
  let braceCount = 1;
  let j = countryStartPos;
  let inString = false;
  let stringChar = '';
  const searchEnd = Math.min(nextMatchStart, countriesContent.length);
  
  while (j < searchEnd && braceCount > 0) {
    const char = countriesContent[j];
    const prevChar = countriesContent[j - 1] || '';
    
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
    } else if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    j++;
  }
  
  if (braceCount !== 0) {
    console.error(`⚠️ Could not find closing brace for ${countryKey}`);
    continue;
  }
  
  const countryBlock = countriesContent.substring(countryStartPos, j - 1);
  
  // Extract id
  const idMatch = countryBlock.match(/id\s*:\s*['"]([^'"]+)['"]/);
  if (!idMatch) {
    console.error(`⚠️ No id found for ${countryKey}`);
    continue;
  }
  const countryId = idMatch[1];
  
  // Extract name object - find name: { ... } using non-greedy match
  const nameObjMatch = countryBlock.match(/name\s*:\s*\{([\s\S]*?)\}/);
  if (!nameObjMatch) {
    console.error(`⚠️ No name object found for ${countryKey}`);
    continue;
  }
  
  const nameBlock = nameObjMatch[1];
  
  // Extract ar, en, fr from name block
  const arMatch = nameBlock.match(/ar\s*:\s*['"]([^'"]+)['"]/);
  const enMatch = nameBlock.match(/en\s*:\s*['"]([^'"]+)['"]/);
  const frMatch = nameBlock.match(/fr\s*:\s*['"]([^'"]+)['"]/);
  
  const nameAr = arMatch?.[1] || '';
  const nameEn = enMatch?.[1] || '';
  const nameFr = frMatch?.[1] || '';
  
  // Only add if we have at least one name
  if (nameAr || nameEn || nameFr) {
    countries[countryId] = {
      id: countryId,
      name: {
        ar: nameAr,
        en: nameEn,
        fr: nameFr
      }
    };
    count++;
    console.error(`✅ [${count}] Extracted ${countryId}: ${nameAr || nameEn || nameFr}`);
  } else {
    console.error(`⚠️ Skipping ${countryKey} (${countryId}) - no name found`);
  }
}

console.error(`\n✅ Total extracted: ${count} countries\n`);
console.log(JSON.stringify(countries, null, 2));
