// Script to extract countries from TypeScript file and output as JSON
const fs = require('fs');
const path = require('path');

const countriesFilePath = path.join(__dirname, '../../client/data/countries.ts');
const fileContent = fs.readFileSync(countriesFilePath, 'utf-8');

const countries = {};

// Extract country IDs
const countryIdMatches = Array.from(fileContent.matchAll(/\s+([a-z_]+):\s*\{/g));
const countryIds = [];
const seenIds = new Set();

for (const match of countryIdMatches) {
  const countryId = match[1];
  if (!['export', 'const', 'interface', 'type', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'getAllCountries', 'getCountryData'].includes(countryId) && !seenIds.has(countryId)) {
    countryIds.push(countryId);
    seenIds.add(countryId);
  }
}

console.error(`Found ${countryIds.length} country IDs`);

// For each country, extract data
for (const countryId of countryIds) {
  try {
    // Find country block
    const startPattern = new RegExp(`\\s+${countryId}:\\s*\\{`, 'm');
    const startMatch = fileContent.search(startPattern);
    if (startMatch === -1) continue;
    
    const braceStart = fileContent.indexOf('{', startMatch);
    if (braceStart === -1) continue;
    
    // Find matching closing brace
    let braceCount = 1;
    let i = braceStart + 1;
    let inString = false;
    let stringChar = '';
    
    while (i < fileContent.length && braceCount > 0) {
      const char = fileContent[i];
      const prevChar = fileContent[i - 1];
      
      if (!inString && (char === '"' || char === "'")) {
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
    
    if (braceCount !== 0) continue;
    
    const blockContent = fileContent.substring(braceStart + 1, i - 1);
    
    // Extract name object - use multiple patterns
    const extractName = () => {
      // Try to find name object
      const namePatterns = [
        /name:\s*\{\s*ar:\s*['"]([^'"]+)['"][\s\S]*?en:\s*['"]([^'"]+)['"][\s\S]*?fr:\s*['"]([^'"]+)['"]/,
        /name\s*:\s*\{\s*ar\s*:\s*['"]([^'"]+)['"][\s\S]*?en\s*:\s*['"]([^'"]+)['"][\s\S]*?fr\s*:\s*['"]([^'"]+)['"]/,
      ];
      
      for (const pattern of namePatterns) {
        const match = blockContent.match(pattern);
        if (match) {
          return {
            ar: match[1] || '',
            en: match[2] || '',
            fr: match[3] || ''
          };
        }
      }
      
      // Fallback: extract individually
      const arMatch = blockContent.match(/ar:\s*['"]([^'"]+)['"]/);
      const enMatch = blockContent.match(/en:\s*['"]([^'"]+)['"]/);
      const frMatch = blockContent.match(/fr:\s*['"]([^'"]+)['"]/);
      
      return {
        ar: arMatch?.[1] || '',
        en: enMatch?.[1] || '',
        fr: frMatch?.[1] || ''
      };
    };
    
    const extractObject = (field) => {
      const fieldIndex = blockContent.indexOf(`${field}:`);
      if (fieldIndex === -1) return { ar: '', en: '', fr: '' };
      
      const objStart = blockContent.indexOf('{', fieldIndex);
      if (objStart === -1) return { ar: '', en: '', fr: '' };
      
      let braceCount = 1;
      let i = objStart + 1;
      let inString = false;
      let stringChar = '';
      
      while (i < blockContent.length && braceCount > 0) {
        const char = blockContent[i];
        const prevChar = blockContent[i - 1];
        
        if (!inString && (char === '"' || char === "'")) {
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
      
      if (braceCount !== 0) return { ar: '', en: '', fr: '' };
      
      const objContent = blockContent.substring(objStart + 1, i - 1);
      
      return {
        ar: objContent.match(/ar:\s*['"]([^'"]+)['"]/)?.[1] || '',
        en: objContent.match(/en:\s*['"]([^'"]+)['"]/)?.[1] || '',
        fr: objContent.match(/fr:\s*['"]([^'"]+)['"]/)?.[1] || ''
      };
    };
    
    const extractString = (field) => {
      const match = blockContent.match(new RegExp(`${field}:\\s*['"]([^'"]+)['"]`, 'm'));
      return match?.[1] || '';
    };
    
    const name = extractName();
    
    // Only add if we have at least one name
    if (name.ar || name.en || name.fr) {
      countries[countryId] = {
        id: countryId,
        name: name,
        capital: extractObject('capital'),
        description: extractObject('description'),
        mainImage: extractString('mainImage') || 'https://images.pexels.com/photos/1239162/pexels-photo-1239162.jpeg',
        currency: extractObject('currency'),
        language: extractObject('language'),
        bestTime: extractObject('bestTime'),
        rating: parseFloat(blockContent.match(/rating:\s*([\d.]+)/)?.[1] || '4.5'),
        totalReviews: parseInt(blockContent.match(/totalReviews:\s*(\d+)/)?.[1] || '0'),
        totalTours: parseInt(blockContent.match(/totalTours:\s*(\d+)/)?.[1] || '0'),
        gallery: []
      };
    } else {
      console.error(`⚠️ Skipping ${countryId} - no name found`);
    }
  } catch (error) {
    console.error(`❌ Error extracting ${countryId}:`, error.message);
  }
}

console.log(JSON.stringify(countries, null, 2));
