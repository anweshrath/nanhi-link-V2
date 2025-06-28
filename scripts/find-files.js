import { readdir, stat } from 'fs/promises';
import { join } from 'path';

async function findFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx'], maxResults = 20) {
  const results = [];
  
  async function searchDirectory(currentDir) {
    if (results.length >= maxResults) return;
    
    try {
      const entries = await readdir(currentDir);
      
      for (const entry of entries) {
        if (results.length >= maxResults) break;
        
        const fullPath = join(currentDir, entry);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          // Skip node_modules and other common directories
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry)) {
            await searchDirectory(fullPath);
          }
        } else if (stats.isFile()) {
          const hasValidExtension = extensions.some(ext => entry.endsWith(ext));
          if (hasValidExtension) {
            results.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  await searchDirectory(dir);
  return results;
}

async function main() {
  console.log('🔍 Finding JavaScript/TypeScript files...\n');
  
  try {
    const files = await findFiles('src', ['.js', '.jsx', '.ts', '.tsx'], 20);
    
    if (files.length === 0) {
      console.log('❌ No JavaScript/TypeScript files found in src directory');
    } else {
      console.log(`✅ Found ${files.length} files:\n`);
      files.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
      });
    }
    
    console.log('\n📊 File Analysis:');
    const extensions = {};
    files.forEach(file => {
      const ext = file.split('.').pop();
      extensions[ext] = (extensions[ext] || 0) + 1;
    });
    
    Object.entries(extensions).forEach(([ext, count]) => {
      console.log(`   .${ext}: ${count} files`);
    });
    
  } catch (error) {
    console.log('❌ Error finding files:', error.message);
  }
}

main();
