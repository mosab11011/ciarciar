// Direct extraction script - simpler and more reliable
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

// Find the opening brace
const braceStart = fileContent.indexOf('{', countriesStart);
if (braceStart === -1) {
  console.error('Could not find opening brace');
  process.exit(1);
}

// Extract everything from opening brace to the matching closing brace
let braceCount = 1;
let i = braceStart + 1;
let inString = false;
let stringChar = '';
let inComment = false;
let commentType = ''; // '//' or '/*'

while (i < fileContent.length && braceCount > 0) {
  const char = fileContent[i];
  const prevChar = fileContent[i - 1];
  const nextChar = fileContent[i + 1] || '';
  
  // Handle comments
  if (!inString && !inComment) {
    if (char === '/' && nextChar === '/') {
      // Skip single-line comment
      while (i < fileContent.length && fileContent[i] !== '\n') i++;
      continue;
    }
    if (char === '/' && nextChar === '*') {
      inComment = true;
      commentType = '/*';
      i += 2;
      continue;
    }
  }
  
  if (inComment && commentType === '/*') {
    if (char === '*' && nextChar === '/') {
      inComment = false;
      i += 2;
      continue;
    }
    i++;
    continue;
  }
  
  // Handle strings
  if (!inString && !inComment && (char === '"' || char === "'" || char === '`')) {
    inString = true;
    stringChar = char;
  } else if (inString && char === stringChar && prevChar !== '\\') {
    inString = false;
  } else if (!inString && !inComment) {
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

// Now extract each country using a simpler method
// Pattern: identifier: { ... id: "..." ... name: { ... } ... }
let pos = 0;
let count = 0;

while (pos < countriesContent.length) {
  // Find next country key: whitespace + identifier + : + whitespace + {
  const keyMatch = countriesContent.substring(pos).match(/^\s*([a-z_][a-z0-9_]*)\s*:\s*\{/m);
  
  if (!keyMatch) {
    pos++;
    continue;
  }
  
  const countryKey = keyMatch[1];
  const keyStart = pos + keyMatch.index;
  const blockStart = pos + keyMatch.index + keyMatch[0].length;
  
  // Skip keywords
  const skipKeywords = ['export', 'const', 'interface', 'type', 'function', 'return', 'if', 'else', 
    'for', 'while', 'switch', 'case', 'getAllCountries', 'getCountryData', 'Record', 'string', 
    'CountryData', 'dataManager', 'convert', 'sync', 'clean', 'search', 'filter', 'get'];
  
  if (skipKeywords.includes(countryKey)) {
    pos = blockStart;
    continue;
  }
  
  // Find the closing brace for this country block
  let braceCount = 1;
  let j = blockStart;
  let inStr = false;
  let strChar = '';
  let inComm = false;
  
  while (j < countriesContent.length && braceCount > 0) {
    const ch = countriesContent[j];
    const prevCh = countriesContent[j - 1] || '';
    const nextCh = countriesContent[j + 1] || '';
    
    // Handle comments
    if (!inStr && !inComm) {
      if (ch === '/' && nextCh === '/') {
        while (j < countriesContent.length && countriesContent[j] !== '\n') j++;
        continue;
      }
      if (ch === '/' && nextCh === '*') {
        inComm = true;
        j += 2;
        continue;
      }
    }
    
    if (inComm) {
      if (ch === '*' && nextCh === '/') {
        inComm = false;
        j += 2;
        continue;
      }
      j++;
      continue;
    }
    
    // Handle strings
    if (!inStr && !inComm && (ch === '"' || ch === "'" || ch === '`')) {
      inStr = true;
      strChar = ch;
    } else if (inStr && ch === strChar && prevCh !== '\\') {
      inStr = false;
    } else if (!inStr && !inComm) {
      if (ch === '{') braceCount++;
      if (ch === '}') braceCount--;
    }
    
    j++;
  }
  
  if (braceCount !== 0) {
    console.error(`⚠️ Could not find closing brace for ${countryKey}`);
    pos = blockStart;
    continue;
  }
  
  const countryBlock = countriesContent.substring(blockStart, j - 1);
  
  // Extract id
  const idMatch = countryBlock.match(/id\s*:\s*['"]([^'"]+)['"]/);
  if (!idMatch) {
    console.error(`⚠️ No id found for ${countryKey}`);
    pos = j;
    continue;
  }
  const countryId = idMatch[1];
  
  // Extract name object - be more flexible with whitespace
  const namePatterns = [
    /name\s*:\s*\{([\s\S]*?)\}/,
    /name\s*:\s*\{([^}]+)\}/,
    /name\s*:\s*\{([\s\S]*?ar\s*:\s*['"][^'"]+['"][\s\S]*?)\}/
  ];
  
  let nameBlock = null;
  for (const pattern of namePatterns) {
    const match = countryBlock.match(pattern);
    if (match && match[1]) {
      nameBlock = match[1];
      break;
    }
  }
  
  if (!nameBlock) {
    console.error(`⚠️ No name object found for ${countryKey} (${countryId})`);
    pos = j;
    continue;
  }
  
  // Extract ar, en, fr from name block - be flexible with whitespace
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
    // Debug: show first 200 chars of country block
    console.error(`   Block sample: ${countryBlock.substring(0, 200)}...`);
  }
  
  pos = j;
}

console.error(`\n✅ Total extracted: ${count} countries\n`);

if (count < 30) {
  console.error(`⚠️ WARNING: Expected ~31 countries but only extracted ${count}`);
  console.error(`⚠️ This may indicate a parsing issue.`);
}

console.log(JSON.stringify(countries, null, 2));

