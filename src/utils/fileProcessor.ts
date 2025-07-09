import * as XLSX from 'xlsx';

export interface ExtractedData {
  id: string;
  name: string;
  phoneNumber: string;
  nameType: 'Chinese' | 'Malay' | 'Indian' | 'Other';
  source: string;
}

export interface ProcessingProgress {
  stage: 'reading' | 'extracting' | 'processing' | 'classifying' | 'complete';
  progress: number;
  message: string;
}

// Phone number normalization function
export const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Malaysian phone number patterns
  if (digits.startsWith('60')) {
    // Remove country code and format
    const number = digits.substring(2);
    if (number.length >= 9) {
      return `0${number.substring(0, number.length)}`;
    }
  } else if (digits.startsWith('0')) {
    // Already starts with 0
    return digits.substring(0, 10);
  } else if (digits.length >= 8) {
    // Add leading 0
    return `0${digits.substring(0, 9)}`;
  }
  
  return '';
};

// Name classification function
export const classifyName = (name: string): 'Chinese' | 'Malay' | 'Indian' | 'Other' => {
  const lowerName = name.toLowerCase();
  
  // Simple classification based on common patterns
  if (/[李王张刘陈杨黄吴赵周]/.test(name) || 
      /\b(lim|tan|lee|wong|ng|ong|teo|goh|koh)\b/i.test(lowerName)) {
    return 'Chinese';
  } else if (/\b(ahmad|ali|hassan|ibrahim|mohamed|abdullah|ismail|rahman)\b/i.test(lowerName) ||
             /\b(siti|nur|fatimah|noraini|rohani)\b/i.test(lowerName)) {
    return 'Malay';
  } else if (/\b(kumar|raj|devi|lakshmi|ravi|suresh|anand|prakash)\b/i.test(lowerName)) {
    return 'Indian';
  }
  
  return 'Other';
};

export const processExcelFile = async (file: File, onProgress?: (progress: ProcessingProgress) => void): Promise<ExtractedData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        onProgress?.({ stage: 'reading', progress: 25, message: 'Reading Excel file...' });
        
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        onProgress?.({ stage: 'extracting', progress: 50, message: 'Extracting data from sheets...' });
        
        const results: ExtractedData[] = [];
        let recordId = 1;
        
        // Process each sheet
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
          
          // Find rows with potential names and phone numbers
          jsonData.forEach((row, rowIndex) => {
            if (rowIndex === 0) return; // Skip header row
            
            row.forEach((cell, colIndex) => {
              const cellValue = String(cell || '').trim();
              if (!cellValue) return;
              
              // Check if cell contains a phone number
              const phoneMatch = cellValue.match(/[\d\s\-\+\(\)]{8,}/);
              if (phoneMatch) {
                const normalizedPhone = normalizePhoneNumber(cellValue);
                if (normalizedPhone) {
                  // Look for name in adjacent cells
                  const possibleNames = [
                    row[colIndex - 1], // Left cell
                    row[colIndex + 1], // Right cell
                    jsonData[rowIndex - 1]?.[colIndex], // Above cell
                    jsonData[rowIndex + 1]?.[colIndex]  // Below cell
                  ].filter(name => name && typeof name === 'string' && name.trim().length > 2);
                  
                  if (possibleNames.length > 0) {
                    const name = String(possibleNames[0]).trim();
                    results.push({
                      id: `${recordId++}`,
                      name,
                      phoneNumber: normalizedPhone,
                      nameType: classifyName(name),
                      source: file.name
                    });
                  }
                }
              }
              
              // Also check if cell looks like a name followed by phone
              const namePhoneMatch = cellValue.match(/^([A-Za-z\s]+)\s+([\d\s\-\+\(\)]{8,})$/);
              if (namePhoneMatch) {
                const [, name, phone] = namePhoneMatch;
                const normalizedPhone = normalizePhoneNumber(phone);
                if (normalizedPhone && name.trim().length > 2) {
                  results.push({
                    id: `${recordId++}`,
                    name: name.trim(),
                    phoneNumber: normalizedPhone,
                    nameType: classifyName(name.trim()),
                    source: file.name
                  });
                }
              }
            });
          });
        });
        
        onProgress?.({ stage: 'processing', progress: 75, message: 'Processing extracted data...' });
        
        // Remove duplicates based on phone number
        const uniqueResults = results.filter((item, index, self) => 
          index === self.findIndex(t => t.phoneNumber === item.phoneNumber)
        );
        
        onProgress?.({ stage: 'complete', progress: 100, message: 'Processing complete!' });
        
        resolve(uniqueResults);
      } catch (error) {
        reject(new Error(`Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const processTextFile = async (file: File, onProgress?: (progress: ProcessingProgress) => void): Promise<ExtractedData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        onProgress?.({ stage: 'reading', progress: 25, message: 'Reading text file...' });
        
        const text = e.target?.result as string;
        
        onProgress?.({ stage: 'extracting', progress: 50, message: 'Extracting names and phone numbers...' });
        
        const results: ExtractedData[] = [];
        let recordId = 1;
        
        // Split into lines and process each line
        const lines = text.split('\n');
        
        lines.forEach(line => {
          const cleanLine = line.trim();
          if (!cleanLine) return;
          
          // Pattern 1: Name followed by phone number
          const namePhonePattern = /([A-Za-z\s]{3,30})\s*([\d\s\-\+\(\)]{8,})/g;
          let match;
          
          while ((match = namePhonePattern.exec(cleanLine)) !== null) {
            const [, name, phone] = match;
            const normalizedPhone = normalizePhoneNumber(phone);
            
            if (normalizedPhone && name.trim().length > 2) {
              results.push({
                id: `${recordId++}`,
                name: name.trim(),
                phoneNumber: normalizedPhone,
                nameType: classifyName(name.trim()),
                source: file.name
              });
            }
          }
          
          // Pattern 2: Phone number followed by name
          const phoneNamePattern = /([\d\s\-\+\(\)]{8,})\s*([A-Za-z\s]{3,30})/g;
          
          while ((match = phoneNamePattern.exec(cleanLine)) !== null) {
            const [, phone, name] = match;
            const normalizedPhone = normalizePhoneNumber(phone);
            
            if (normalizedPhone && name.trim().length > 2) {
              // Check if we already have this phone number
              const exists = results.some(r => r.phoneNumber === normalizedPhone);
              if (!exists) {
                results.push({
                  id: `${recordId++}`,
                  name: name.trim(),
                  phoneNumber: normalizedPhone,
                  nameType: classifyName(name.trim()),
                  source: file.name
                });
              }
            }
          }
          
          // Pattern 3: Comma or tab separated values
          if (cleanLine.includes(',') || cleanLine.includes('\t')) {
            const parts = cleanLine.split(/[,\t]/).map(p => p.trim());
            
            for (let i = 0; i < parts.length - 1; i++) {
              const part1 = parts[i];
              const part2 = parts[i + 1];
              
              const phone1 = normalizePhoneNumber(part1);
              const phone2 = normalizePhoneNumber(part2);
              
              if (phone1 && part2.length > 2 && !/\d/.test(part2)) {
                results.push({
                  id: `${recordId++}`,
                  name: part2,
                  phoneNumber: phone1,
                  nameType: classifyName(part2),
                  source: file.name
                });
              } else if (phone2 && part1.length > 2 && !/\d/.test(part1)) {
                results.push({
                  id: `${recordId++}`,
                  name: part1,
                  phoneNumber: phone2,
                  nameType: classifyName(part1),
                  source: file.name
                });
              }
            }
          }
        });
        
        onProgress?.({ stage: 'processing', progress: 75, message: 'Processing extracted data...' });
        
        // Remove duplicates based on phone number
        const uniqueResults = results.filter((item, index, self) => 
          index === self.findIndex(t => t.phoneNumber === item.phoneNumber)
        );
        
        onProgress?.({ stage: 'complete', progress: 100, message: 'Processing complete!' });
        
        resolve(uniqueResults);
      } catch (error) {
        reject(new Error(`Failed to process text file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const processFiles = async (
  files: File[], 
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ExtractedData[]> => {
  const allResults: ExtractedData[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileProgress = (i / files.length) * 100;
    
    onProgress?.({ 
      stage: 'reading', 
      progress: fileProgress, 
      message: `Processing file ${i + 1} of ${files.length}: ${file.name}` 
    });
    
    try {
      let fileResults: ExtractedData[] = [];
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        fileResults = await processExcelFile(file, (progress) => {
          const adjustedProgress = fileProgress + (progress.progress / files.length);
          onProgress?.({ ...progress, progress: adjustedProgress });
        });
      } else if (file.name.endsWith('.txt')) {
        fileResults = await processTextFile(file, (progress) => {
          const adjustedProgress = fileProgress + (progress.progress / files.length);
          onProgress?.({ ...progress, progress: adjustedProgress });
        });
      }
      
      allResults.push(...fileResults);
    } catch (error) {
      console.error(`Failed to process file ${file.name}:`, error);
      // Continue with other files even if one fails
    }
  }
  
  // Final deduplication across all files
  const uniqueResults = allResults.filter((item, index, self) => 
    index === self.findIndex(t => t.phoneNumber === item.phoneNumber)
  );
  
  onProgress?.({ 
    stage: 'complete', 
    progress: 100, 
    message: `Processing complete! Extracted ${uniqueResults.length} unique records from ${files.length} files.` 
  });
  
  return uniqueResults;
};