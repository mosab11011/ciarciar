import express from 'express';
import { CountryModel, type CountryInput } from '../models/Country';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync, spawn } from 'child_process';

const router = express.Router();

// Helper function to determine continent from country name or other indicators
function getContinentFromCountry(countryData: any): 'africa' | 'asia' | 'europe' | 'america' | 'oceania' {
  const countryId = countryData.id || '';
  const nameEn = (countryData.name?.en || '').toLowerCase();
  
  // African countries
  const africanCountries = ['sudan', 'egypt', 'morocco', 'tunisia', 'algeria', 'libya', 'mauritania', 
    'somalia', 'djibouti', 'comoros', 'ethiopia', 'kenya', 'tanzania', 'uganda', 'rwanda', 'burundi',
    'south africa', 'nigeria', 'ghana', 'senegal', 'mali', 'niger', 'chad', 'cameroon', 'congo'];
  
  // Asian countries
  const asianCountries = ['saudi', 'uae', 'jordan', 'lebanon', 'syria', 'iraq', 'kuwait', 'bahrain',
    'qatar', 'oman', 'yemen', 'palestine', 'turkey', 'iran', 'afghanistan', 'pakistan', 'bangladesh',
    'maldives', 'indonesia', 'malaysia', 'brunei', 'thailand', 'vietnam', 'china', 'japan', 'india'];
  
  // European countries
  const europeanCountries = ['france', 'spain', 'italy', 'germany', 'uk', 'greece', 'portugal', 'netherlands'];
  
  // American countries
  const americanCountries = ['usa', 'canada', 'mexico', 'brazil', 'argentina', 'chile'];
  
  // Oceania countries
  const oceaniaCountries = ['australia', 'new zealand', 'fiji'];
  
  const checkList = (list: string[]) => list.some(c => countryId.includes(c) || nameEn.includes(c));
  
  if (checkList(africanCountries)) return 'africa';
  if (checkList(asianCountries)) return 'asia';
  if (checkList(europeanCountries)) return 'europe';
  if (checkList(americanCountries)) return 'america';
  if (checkList(oceaniaCountries)) return 'oceania';
  
  // Default to asia for Middle Eastern countries
  return 'asia';
}

// Helper function to convert CountryData to CountryInput
function convertCountryDataToInput(countryData: any): CountryInput {
  const continent = getContinentFromCountry(countryData);
  
  // Debug: Log the country data being converted
  if (!countryData.name?.ar && !countryData.name_ar) {
    console.warn(`⚠️ Country ${countryData.id} has no Arabic name!`, countryData);
  }
  
  const result = {
    name_ar: countryData.name?.ar || countryData.name_ar || '',
    name_en: countryData.name?.en || countryData.name_en || '',
    name_fr: countryData.name?.fr || countryData.name_fr || '',
    capital_ar: countryData.capital?.ar || countryData.capital_ar || '',
    capital_en: countryData.capital?.en || countryData.capital_en || '',
    capital_fr: countryData.capital?.fr || countryData.capital_fr || '',
    description_ar: countryData.description?.ar || countryData.description_ar || '',
    description_en: countryData.description?.en || countryData.description_en || '',
    description_fr: countryData.description?.fr || countryData.description_fr || '',
    continent: continent,
    main_image: countryData.mainImage || countryData.main_image || 'https://images.pexels.com/photos/1239162/pexels-photo-1239162.jpeg',
    gallery: countryData.gallery || [],
    currency_ar: countryData.currency?.ar || countryData.currency_ar || '',
    currency_en: countryData.currency?.en || countryData.currency_en || '',
    currency_fr: countryData.currency?.fr || countryData.currency_fr || '',
    language_ar: countryData.language?.ar || countryData.language_ar || '',
    language_en: countryData.language?.en || countryData.language_en || '',
    language_fr: countryData.language?.fr || countryData.language_fr || '',
    best_time_ar: countryData.bestTime?.ar || countryData.best_time_ar || '',
    best_time_en: countryData.bestTime?.en || countryData.best_time_en || '',
    best_time_fr: countryData.bestTime?.fr || countryData.best_time_fr || '',
    rating: countryData.rating || 4.5,
    total_reviews: countryData.totalReviews || countryData.total_reviews || 0,
    total_tours: countryData.totalTours || countryData.total_tours || 0,
    highlights_ar: countryData.highlights?.ar || countryData.highlights_ar || [],
    highlights_en: countryData.highlights?.en || countryData.highlights_en || [],
    highlights_fr: countryData.highlights?.fr || countryData.highlights_fr || [],
    culture_ar: Array.isArray(countryData.culture?.ar) ? countryData.culture.ar : (countryData.culture?.ar ? [countryData.culture.ar] : []),
    culture_en: Array.isArray(countryData.culture?.en) ? countryData.culture.en : (countryData.culture?.en ? [countryData.culture.en] : []),
    culture_fr: Array.isArray(countryData.culture?.fr) ? countryData.culture.fr : (countryData.culture?.fr ? [countryData.culture.fr] : []),
    cuisine_ar: countryData.cuisine?.ar || countryData.cuisine_ar || [],
    cuisine_en: countryData.cuisine?.en || countryData.cuisine_en || [],
    cuisine_fr: countryData.cuisine?.fr || countryData.cuisine_fr || [],
    transportation_ar: countryData.transportation?.ar || countryData.transportation_ar || [],
    transportation_en: countryData.transportation?.en || countryData.transportation_en || [],
    transportation_fr: countryData.transportation?.fr || countryData.transportation_fr || [],
    safety_ar: Array.isArray(countryData.safety?.ar) ? countryData.safety.ar : (countryData.safety?.ar ? [countryData.safety.ar] : []),
    safety_en: Array.isArray(countryData.safety?.en) ? countryData.safety.en : (countryData.safety?.en ? [countryData.safety.en] : []),
    safety_fr: Array.isArray(countryData.safety?.fr) ? countryData.safety.fr : (countryData.safety?.fr ? [countryData.safety.fr] : []),
    is_active: true
  };
  
  // Validate that we have at least one name
  if (!result.name_ar && !result.name_en && !result.name_fr) {
    console.error(`❌ Country ${countryData.id} has no names at all!`, result);
  }
  
  return result;
}

/**
 * DELETE /api/countries/seed
 * Delete all countries without names (cleanup)
 */
router.delete('/seed', async (req, res) => {
  try {
    const db = (await import('../database/database')).getDatabase();
    const dbInstance = await db;
    
    // Delete countries where all name fields are empty or null
    const result = await dbInstance.run(`
      DELETE FROM countries 
      WHERE (name_ar IS NULL OR name_ar = '') 
      AND (name_en IS NULL OR name_en = '') 
      AND (name_fr IS NULL OR name_fr = '')
    `);
    
    res.json({
      success: true,
      message: `Deleted ${result.changes} countries without names`,
      deleted: result.changes
    });
  } catch (error: any) {
    console.error('❌ Error deleting countries:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete countries'
    });
  }
});

/**
 * PUT /api/countries/seed/update-names
 * Update all countries without names
 */
router.put('/seed/update-names', async (req, res) => {
  try {
    console.log('🔄 Starting to update countries without names...');
    
    // Get all countries without names
    const existing = await CountryModel.findAll(false);
    const countriesWithoutNames = existing.filter(c => 
      (!c.name_ar || c.name_ar === '') && 
      (!c.name_en || c.name_en === '') && 
      (!c.name_fr || c.name_fr === '')
    );
    
    console.log(`📊 Found ${countriesWithoutNames.length} countries without names`);
    
    if (countriesWithoutNames.length === 0) {
      return res.json({
        success: true,
        message: 'No countries without names found',
        updated: 0
      });
    }
    
    // Load countries from file
    const countriesFilePath = join(process.cwd(), 'client', 'data', 'countries.ts');
    const fileContent = readFileSync(countriesFilePath, 'utf-8');
    
    // Extract country IDs
    const countryIdMatches = Array.from(fileContent.matchAll(/\s+([a-z_]+):\s*\{[\s\S]*?id:\s*['"][^'"]+['"]/g));
    const countryIds: string[] = [];
    const seenIds = new Set<string>();
    
    for (const match of countryIdMatches) {
      const countryId = match[1];
      if (!['export', 'const', 'interface', 'type', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case'].includes(countryId) && !seenIds.has(countryId)) {
        countryIds.push(countryId);
        seenIds.add(countryId);
      }
    }
    
    let updated = 0;
    let errors = 0;
    
    // For each country without name, try to find and update it
    for (const countryWithoutName of countriesWithoutNames) {
      try {
        // Try to find matching country in file by ID pattern
        const matchingCountryId = countryIds.find(id => 
          id === countryWithoutName.id || 
          id.replace(/_/g, '') === countryWithoutName.id.replace(/_/g, '')
        );
        
        if (matchingCountryId) {
          // Extract country data from file
          const startPattern = new RegExp(`\\s+${matchingCountryId}:\\s*\\{`, 'm');
          const startMatch = fileContent.search(startPattern);
          
          if (startMatch !== -1) {
            const braceStart = fileContent.indexOf('{', startMatch);
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
            
            if (braceCount === 0) {
              const blockContent = fileContent.substring(braceStart + 1, i - 1);
              
              // Extract name
              const extractObject = (field: string): { ar: string; en: string; fr: string } => {
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
                
                const extractLang = (lang: string): string => {
                  const patterns = [
                    new RegExp(`${lang}:\\s*['"]([^'"]+)['"]`, 'm'),
                    new RegExp(`${lang}\\s*:\\s*['"]([^'"]+)['"]`, 'm')
                  ];
                  for (const pattern of patterns) {
                    const match = objContent.match(pattern);
                    if (match && match[1]) return match[1];
                  }
                  return '';
                };
                
                return {
                  ar: extractLang('ar'),
                  en: extractLang('en'),
                  fr: extractLang('fr')
                };
              };
              
              const name = extractObject('name');
              
              if (name.ar || name.en || name.fr) {
                const updatedCountry = await CountryModel.update(countryWithoutName.id, {
                  name_ar: name.ar,
                  name_en: name.en,
                  name_fr: name.fr,
                });
                
                if (updatedCountry) {
                  updated++;
                  console.log(`✅ Updated country ${countryWithoutName.id}: ${name.ar || name.en}`);
                }
              }
            }
          }
        }
      } catch (error: any) {
        console.error(`❌ Error updating country ${countryWithoutName.id}:`, error.message);
        errors++;
      }
    }
    
    res.json({
      success: true,
      message: `Updated ${updated} countries, ${errors} errors`,
      updated,
      errors
    });
  } catch (error: any) {
    console.error('❌ Error updating countries:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update countries'
    });
  }
});

/**
 * POST /api/countries/seed
 * Seed countries from static data
 * This endpoint loads all countries from the static data file and imports them into the database
 */
router.post('/seed', async (req, res) => {
  console.log('🌱 Countries seed endpoint called');
  try {
    console.log('🌱 Starting countries seeding...');
    
    let countriesObj: any = {};
    
    // Method 1: Use the direct extraction script to extract countries
    try {
      const extractScriptPath = join(process.cwd(), 'server', 'scripts', 'extract-countries-direct.cjs');
      
      const output = await new Promise<string>((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        const child = spawn('node', [extractScriptPath], {
          cwd: process.cwd(),
          stdio: ['ignore', 'pipe', 'pipe']
        });
        
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
          const stderrLine = data.toString();
          stderr += stderrLine;
          // Log progress from stderr (console.error in script)
          if (stderrLine.includes('✅') || stderrLine.includes('⚠️') || stderrLine.includes('Total') || stderrLine.includes('Extracted')) {
            console.log(stderrLine.trim());
          }
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            resolve(stdout.trim());
          } else {
            reject(new Error(`Script exited with code ${code}: ${stderr}`));
          }
        });
        
        child.on('error', (error) => {
          reject(error);
        });
        
        setTimeout(() => {
          child.kill();
          reject(new Error('Script timeout'));
        }, 60000); // Increased timeout to 60 seconds
      });
      
      const parsedOutput = JSON.parse(output);
      const extractedCount = Object.keys(parsedOutput).length;
      console.log(`✅ Successfully extracted ${extractedCount} countries using script`);
      
      // Log all extracted country IDs for debugging
      const extractedIds = Object.keys(parsedOutput);
      console.log(`📋 Extracted country IDs: ${extractedIds.join(', ')}`);
      
      // Merge with countriesObj if we already have some from previous methods
      if (extractedCount > 0) {
        countriesObj = parsedOutput;
      }
      
      // If we got less than 30 countries, log a warning
      if (extractedCount < 30) {
        console.warn(`⚠️ WARNING: Expected ~31 countries but only extracted ${extractedCount}. The script may not be parsing all countries correctly.`);
        console.warn(`⚠️ This means only ${extractedCount} countries will be seeded into the database.`);
      }
      
      if (extractedCount === 0 && Object.keys(countriesObj).length === 0) {
        throw new Error('Script extracted 0 countries');
      }
      
      // Log first few countries to verify extraction
      const firstFew = Object.keys(countriesObj).slice(0, 5);
      console.log(`📋 Sample extracted countries: ${firstFew.join(', ')}`);
      for (const id of firstFew) {
        const country = countriesObj[id];
        console.log(`  - ${id}: ${country.name?.ar || country.name?.en || 'no name'}`);
      }
      
      // Use the countries from the script directly - they already have names
      // No need to re-extract using regex
    } catch (error: any) {
      console.log('⚠️ Direct import failed, trying script method...');
      console.log('Error:', error.message);
      
      // Method 2: Use Node.js script (fallback)
      try {
        const extractScriptPath = join(process.cwd(), 'server', 'scripts', 'extract-countries-direct.cjs');
        
        console.log('📝 Running extraction script...');
        const output = await new Promise<string>((resolve, reject) => {
          let stdout = '';
          let stderr = '';
          
          const child = spawn('node', [extractScriptPath], {
            cwd: process.cwd(),
            stdio: ['ignore', 'pipe', 'pipe']
          });
          
          child.stdout.on('data', (data) => {
            stdout += data.toString();
          });
          
          child.stderr.on('data', (data) => {
            const stderrLine = data.toString();
            stderr += stderrLine;
            // Log progress from stderr (console.error in script)
            if (stderrLine.includes('✅') || stderrLine.includes('⚠️') || stderrLine.includes('Total')) {
              console.log(stderrLine.trim());
            }
          });
          
          child.on('close', (code) => {
            if (code === 0) {
              resolve(stdout.trim());
            } else {
              reject(new Error(`Script exited with code ${code}: ${stderr}`));
            }
          });
          
          child.on('error', (error) => {
            reject(error);
          });
          
          setTimeout(() => {
            child.kill();
            reject(new Error('Script timeout after 60 seconds'));
          }, 60000); // Increased timeout to 60 seconds
        });
        
        countriesObj = JSON.parse(output);
        console.log(`✅ Successfully extracted ${Object.keys(countriesObj).length} countries using script`);
        
        // Now we need to extract full data for each country
        // The script only extracts names, so we'll get the rest from the file
        const countriesModulePath = join(process.cwd(), 'client', 'data', 'countries.ts');
        const fileContent = readFileSync(countriesModulePath, 'utf-8');
        
        // For each country with a name, extract full data
        for (const countryId in countriesObj) {
          const countryKey = Object.keys(countriesObj).find(key => countriesObj[key].id === countryId);
          if (!countryKey) continue;
          
          // Find the country block in the file
          const countryPattern = new RegExp(`\\s+${countryKey}:\\s*\\{`, 'm');
          const match = fileContent.match(countryPattern);
          if (!match) continue;
          
          // Extract the country block (we already have name from script, so we'll use that)
          // The script output already has names, so we can proceed
        }
        
      } catch (scriptError: any) {
        console.log('⚠️ Script extraction failed, using file parsing method...');
        console.log('Error:', scriptError.message);
        
        // Method 2: Parse the file manually
      const countriesFilePath = join(process.cwd(), 'client', 'data', 'countries.ts');
      const fileContent = readFileSync(countriesFilePath, 'utf-8');
      
      // Extract country IDs - use a more specific pattern
      const countryIdMatches = Array.from(fileContent.matchAll(/\s+([a-z_]+):\s*\{[\s\S]*?id:\s*['"][^'"]+['"]/g));
      const countryIds: string[] = [];
      const seenIds = new Set<string>();
      
      for (const match of countryIdMatches) {
        const countryId = match[1];
        // Skip common false positives
        if (!['export', 'const', 'interface', 'type', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case'].includes(countryId) && !seenIds.has(countryId)) {
          countryIds.push(countryId);
          seenIds.add(countryId);
        }
      }
      
      console.log(`📦 Found ${countryIds.length} country IDs in file:`, countryIds.slice(0, 10).join(', '), '...');
      
      // For each country, extract data
      for (const countryId of countryIds) {
        try {
          // Find the country block by searching for the pattern
          const startPattern = new RegExp(`\\s+${countryId}:\\s*\\{`, 'm');
          const startMatch = fileContent.search(startPattern);
          if (startMatch === -1) continue;
          
          // Find the opening brace
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
            
            // Handle strings
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
          
          // Extract fields using improved regex
          const extractString = (field: string): string => {
            const patterns = [
              new RegExp(`${field}:\\s*['"]([^'"]+)['"]`, 'm'),
              new RegExp(`${field}\\s*:\\s*['"]([^'"]+)['"]`, 'm')
            ];
            for (const pattern of patterns) {
              const match = blockContent.match(pattern);
              if (match && match[1]) return match[1];
            }
            return '';
          };
          
          const extractObject = (field: string): { ar: string; en: string; fr: string } => {
            // Find the object
            const fieldIndex = blockContent.indexOf(`${field}:`);
            if (fieldIndex === -1) return { ar: '', en: '', fr: '' };
            
            const objStart = blockContent.indexOf('{', fieldIndex);
            if (objStart === -1) return { ar: '', en: '', fr: '' };
            
            // Find matching closing brace
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
            
            const extractLang = (lang: string): string => {
              const patterns = [
                new RegExp(`${lang}:\\s*['"]([^'"]+)['"]`, 'm'),
                new RegExp(`${lang}\\s*:\\s*['"]([^'"]+)['"]`, 'm')
              ];
              for (const pattern of patterns) {
                const match = objContent.match(pattern);
                if (match && match[1]) return match[1];
              }
              return '';
            };
            
            return {
              ar: extractLang('ar'),
              en: extractLang('en'),
              fr: extractLang('fr')
            };
          };
          
          const extractArray = (field: string): string[] => {
            const arrayMatch = blockContent.match(new RegExp(`${field}:\\s*\\[([\\s\\S]*?)\\]`, 'm'));
            if (!arrayMatch) return [];
            const items = arrayMatch[1].match(/['"]([^'"]+)['"]/g) || [];
            return items.map(item => item.replace(/['"]/g, ''));
          };
          
          // Extract name - use multiple methods
          let extractedName = extractObject('name');
          
          // If extraction failed, try direct regex patterns
          if (!extractedName.ar && !extractedName.en && !extractedName.fr) {
            // Try to find name object directly
            const nameObjMatch = blockContent.match(/name:\s*\{[\s\S]*?ar:\s*['"]([^'"]+)['"][\s\S]*?en:\s*['"]([^'"]+)['"][\s\S]*?fr:\s*['"]([^'"]+)['"]/);
            if (nameObjMatch) {
              extractedName = {
                ar: nameObjMatch[1] || '',
                en: nameObjMatch[2] || '',
                fr: nameObjMatch[3] || ''
              };
            } else {
              // Try individual extraction
              const arMatch = blockContent.match(/ar:\s*['"]([^'"]+)['"]/);
              const enMatch = blockContent.match(/en:\s*['"]([^'"]+)['"]/);
              const frMatch = blockContent.match(/fr:\s*['"]([^'"]+)['"]/);
              
              if (arMatch || enMatch || frMatch) {
                extractedName = {
                  ar: arMatch?.[1] || '',
                  en: enMatch?.[1] || '',
                  fr: frMatch?.[1] || ''
                };
              }
            }
            
            // If still no name, log warning
            if (!extractedName.ar && !extractedName.en && !extractedName.fr) {
              console.warn(`⚠️ Failed to extract name for country ${countryId}`);
              console.log('Block content sample:', blockContent.substring(0, 500));
            } else {
              console.log(`✅ Extracted name for ${countryId}: ${extractedName.ar || extractedName.en || extractedName.fr}`);
            }
          }
          
          // Only proceed if we have at least one name
          if (!extractedName.ar && !extractedName.en && !extractedName.fr) {
            console.warn(`⚠️ Skipping country ${countryId} - no name found`);
            continue;
          }
          
          const countryData: any = {
            id: countryId,
            name: extractedName,
            capital: extractObject('capital'),
            description: extractObject('description'),
            mainImage: extractString('mainImage'),
            currency: extractObject('currency'),
            language: extractObject('language'),
            bestTime: extractObject('bestTime'),
            rating: parseFloat(blockContent.match(/rating:\\s*([\\d.]+)/)?.[1] || '4.5'),
            totalReviews: parseInt(blockContent.match(/totalReviews:\\s*(\\d+)/)?.[1] || '0'),
            totalTours: parseInt(blockContent.match(/totalTours:\\s*(\\d+)/)?.[1] || '0'),
            highlights: {
              ar: extractArray('highlights'),
              en: extractArray('highlights'),
              fr: extractArray('highlights')
            },
            cuisine: {
              ar: extractArray('cuisine'),
              en: extractArray('cuisine'),
              fr: extractArray('cuisine')
            },
            transportation: {
              ar: extractArray('transportation'),
              en: extractArray('transportation'),
              fr: extractArray('transportation')
            },
            gallery: extractArray('gallery')
          };
          
          // Extract culture and safety
          const cultureObj = extractObject('culture');
          if (cultureObj.ar || cultureObj.en || cultureObj.fr) {
            countryData.culture = cultureObj;
          }
          
          const safetyObj = extractObject('safety');
          if (safetyObj.ar || safetyObj.en || safetyObj.fr) {
            countryData.safety = safetyObj;
          }
          
          // Convert to CountryInput to validate
          const countryInput = convertCountryDataToInput(countryData);
          
          // Only add if we have at least one name
          if (countryInput.name_ar || countryInput.name_en || countryInput.name_fr) {
            countriesObj[countryId] = countryData;
            console.log(`✅ Extracted ${countryId}: ${countryInput.name_ar || countryInput.name_en || countryInput.name_fr}`);
          } else {
            console.warn(`⚠️ Skipping ${countryId} - no name after conversion`);
          }
        } catch (error: any) {
          console.error(`❌ Error parsing country ${countryId}:`, error.message);
        }
      }
      }
    }
    
    // Convert all countries to CountryInput format
    const countriesData: CountryInput[] = [];
    for (const [countryId, countryData] of Object.entries(countriesObj)) {
      try {
        const countryDataObj = typeof countryData === 'object' && countryData !== null ? countryData : {};
        const countryInput = convertCountryDataToInput({ ...countryDataObj, id: countryId });
        
        // Only add if it has at least one name
        if (countryInput.name_ar || countryInput.name_en || countryInput.name_fr) {
          countriesData.push(countryInput);
        } else {
          console.warn(`⚠️ Skipping country ${countryId} - no names found`);
        }
      } catch (error: any) {
        console.error(`❌ Error converting country ${countryId}:`, error.message);
      }
    }
    
    console.log(`📦 Prepared ${countriesData.length} countries to seed (with names)`);
    
    // Check database directly for total count
    const db = (await import('../database/database')).getDatabase();
    const dbInstance = await db;
    const totalCountResult = await dbInstance.get('SELECT COUNT(*) as count FROM countries');
    const countriesWithoutNames = await dbInstance.all(`
      SELECT id FROM countries 
      WHERE (name_ar IS NULL OR name_ar = '') 
      AND (name_en IS NULL OR name_en = '') 
      AND (name_fr IS NULL OR name_fr = '')
    `);
    
    console.log(`📊 Database status: ${totalCountResult?.count || 0} total countries, ${countriesWithoutNames.length} without names`);
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    let updated = 0;

    console.log(`🌱 Processing ${countriesData.length} countries...`);
    
    // Get all existing countries once
    const existing = await CountryModel.findAll(false);
    console.log(`📊 Found ${existing.length} existing countries in database`);

    for (const countryData of countriesData) {
      try {
        // Check if country already exists by name
        const existsByName = existing.some(c => 
          (c.name_ar && c.name_ar === countryData.name_ar) || 
          (c.name_en && c.name_en === countryData.name_en) ||
          (c.name_ar === countryData.name_ar && c.name_en === countryData.name_en)
        );

        // Check if country exists by ID (for countries without names)
        const existingById = existing.find(c => 
          c.id === countryData.name_ar?.toLowerCase().replace(/\s+/g, '_') ||
          c.id === countryData.name_en?.toLowerCase().replace(/\s+/g, '_')
        );

        // Find countries without names (to update them)
        const countriesWithoutNames = existing.filter(c => 
          (!c.name_ar || c.name_ar === '') && 
          (!c.name_en || c.name_en === '') && 
          (!c.name_fr || c.name_fr === '')
        );

        if (existsByName) {
          skipped++;
        } else if (countriesWithoutNames.length > 0 && countryData.name_ar && countryData.name_en) {
          // Update first country without name
          const countryToUpdate = countriesWithoutNames[0];
          console.log(`🔄 Updating country without name: ${countryToUpdate.id} -> ${countryData.name_ar}`);
          const updatedCountry = await CountryModel.update(countryToUpdate.id, {
            name_ar: countryData.name_ar,
            name_en: countryData.name_en,
            name_fr: countryData.name_fr,
            capital_ar: countryData.capital_ar,
            capital_en: countryData.capital_en,
            capital_fr: countryData.capital_fr,
            description_ar: countryData.description_ar,
            description_en: countryData.description_en,
            description_fr: countryData.description_fr,
            continent: countryData.continent,
            main_image: countryData.main_image,
            currency_ar: countryData.currency_ar,
            currency_en: countryData.currency_en,
            currency_fr: countryData.currency_fr,
            language_ar: countryData.language_ar,
            language_en: countryData.language_en,
            language_fr: countryData.language_fr,
            best_time_ar: countryData.best_time_ar,
            best_time_en: countryData.best_time_en,
            best_time_fr: countryData.best_time_fr,
          });
          if (updatedCountry) {
            updated++;
            console.log(`✅ Updated country: ${countryData.name_ar}`);
          } else {
            errors++;
          }
        } else {
          // Create new country
          const newCountry = await CountryModel.create(countryData);
          if (newCountry) {
            created++;
            if (created % 10 === 0) {
              console.log(`✅ Created ${created} countries so far...`);
            }
          } else {
            console.error(`❌ Failed to create country: ${countryData.name_en || countryData.name_ar} - returned null`);
            errors++;
          }
        }
      } catch (error: any) {
        console.error(`❌ Error processing country ${countryData.name_en || countryData.name_ar}:`, error.message);
        errors++;
      }
    }

    console.log(`🌱 Seeding completed: ${created} created, ${updated} updated, ${skipped} skipped, ${errors} errors`);

    res.json({
      success: true,
      message: `Countries seeding completed: ${created} created, ${updated} updated, ${skipped} skipped, ${errors} errors`,
      created,
      updated,
      skipped,
      errors
    });
  } catch (error: any) {
    console.error('❌ Error seeding countries:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to seed countries'
    });
  }
});

/**
 * POST /api/countries/seed/step
 * Add countries step by step (5 countries at a time)
 * Query params: ?skip=0 (optional, default 0)
 */
router.post('/seed/step', async (req, res) => {
  console.log('🌱 Step-by-step countries seed endpoint called');
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = 5; // Add 5 countries at a time
    
    console.log(`🌱 Starting step-by-step seeding: skip=${skip}, limit=${limit}...`);
    
    // Extract countries using the script
    let countriesObj: any = {};
    
    try {
      const extractScriptPath = join(process.cwd(), 'server', 'scripts', 'extract-countries-direct.cjs');
      
      const output = await new Promise<string>((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        const child = spawn('node', [extractScriptPath], {
          cwd: process.cwd(),
          stdio: ['ignore', 'pipe', 'pipe']
        });
        
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            resolve(stdout.trim());
          } else {
            reject(new Error(`Script exited with code ${code}: ${stderr}`));
          }
        });
        
        child.on('error', (error) => {
          reject(error);
        });
        
        setTimeout(() => {
          child.kill();
          reject(new Error('Script timeout'));
        }, 60000);
      });
      
      countriesObj = JSON.parse(output);
      console.log(`✅ Successfully extracted ${Object.keys(countriesObj).length} countries using script`);
      
    } catch (error: any) {
      console.error('❌ Script execution failed:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to extract countries using script.'
      });
    }
    
    // Convert to array and get the slice we need
    const countriesArray = Object.values(countriesObj);
    const totalCountries = countriesArray.length;
    const countriesToProcess = countriesArray.slice(skip, skip + limit);
    
    console.log(`📦 Processing ${countriesToProcess.length} countries (${skip} to ${skip + limit - 1} of ${totalCountries})`);
    
    // Get all existing countries
    const existing = await CountryModel.findAll(false);
    const existingIds = new Set(existing.map(c => c.id));
    const existingNames = new Set(
      existing
        .filter(c => c.name_ar || c.name_en || c.name_fr)
        .map(c => c.name_ar?.toLowerCase() || c.name_en?.toLowerCase() || c.name_fr?.toLowerCase())
    );
    
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const processedCountries: string[] = [];
    
    for (const countryData of countriesToProcess) {
      try {
        const countryId = countryData.id;
        const countryName = (countryData.name?.ar || countryData.name?.en || countryData.name?.fr || '').toLowerCase();
        
        // Check if country already exists by ID
        if (existingIds.has(countryId)) {
          skipped++;
          processedCountries.push(`${countryId} (exists by ID)`);
          continue;
        }
        
        // Check if country already exists by name
        if (countryName && existingNames.has(countryName)) {
          skipped++;
          processedCountries.push(`${countryId} (exists by name)`);
          continue;
        }
        
        // Convert to CountryInput format
        const countryInput = convertCountryDataToInput(countryData);
        
        // Only add if we have at least one name
        if (!countryInput.name_ar && !countryInput.name_en && !countryInput.name_fr) {
          skipped++;
          processedCountries.push(`${countryId} (no name)`);
          continue;
        }
        
        // Create new country
        const newCountry = await CountryModel.create(countryInput);
        if (newCountry) {
          created++;
          processedCountries.push(`${countryId}: ${countryInput.name_ar || countryInput.name_en || countryInput.name_fr}`);
          console.log(`✅ Created country: ${countryInput.name_ar || countryInput.name_en}`);
        } else {
          errors++;
          processedCountries.push(`${countryId} (failed)`);
          console.error(`❌ Failed to create country: ${countryId}`);
        }
      } catch (error: any) {
        errors++;
        processedCountries.push(`${countryData.id} (error: ${error.message})`);
        console.error(`❌ Error processing country ${countryData.id}:`, error.message);
      }
    }
    
    const nextSkip = skip + limit;
    const hasMore = nextSkip < totalCountries;
    
    console.log(`🌱 Step completed: ${created} created, ${updated} updated, ${skipped} skipped, ${errors} errors`);
    
    res.json({
      success: true,
      message: `Step completed: ${created} created, ${skipped} skipped, ${errors} errors`,
      created,
      updated,
      skipped,
      errors,
      processed: processedCountries,
      currentSkip: skip,
      nextSkip: hasMore ? nextSkip : null,
      totalCountries,
      hasMore,
      progress: `${skip + countriesToProcess.length} / ${totalCountries}`
    });
  } catch (error: any) {
    console.error('❌ Error in step-by-step seeding:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to seed countries step by step'
    });
  }
});

export default router;
