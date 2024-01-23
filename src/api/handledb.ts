// handledb.ts
import fs from 'fs/promises';
import path from 'path';
import shortid from 'shortid';

import { memoryCache } from './cache'; // Import memoryCache from cache.ts


interface UrlData {
  shortUrl: string;
  longUrl: string;
}

interface Database {
  urls: UrlData[];
}

const DB_FILE_PATH = path.join(__dirname, 'urls2.json');

const readDatabase = async (): Promise<Database> => {
  try {
    const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
  //   console.log(`read raw data:`, data);
  //   console.log(`data read`)
    return JSON.parse(data) as Database;
  } catch (error) {
    console.log(`read error`);
    return { urls: [] };
  }
};

const writeDatabase = async (data: Database): Promise<void> => {
  // console.log(`wrote to db`);
  try {
       // Validate JSON format
       JSON.stringify(data);
    //const existingData = await readDatabase();
   //  console.log(`json ok`);
    // Merge the new data with the existing data
 //   const newData = { ...existingData, ...data };
   //  console.log(`writing data:`, data);
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    // Create a temporary file path
//    const tempFilePath = DB_FILE_PATH + '.temp';
  
    // Write to the temporary file
  //  await fs.writeFile(tempFilePath, JSON.stringify(newData, null, 2), 'utf-8');

    // Replace the original file with the temporary one
//    await fs.rename(tempFilePath, DB_FILE_PATH);

//    await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
} catch (error) {
  console.log(`json not ok`);
  console.error('Error writing to the database:', error);
}

};

const saveUrl = async (longUrl: any): Promise<string> => {
   //console.log( `saveurl start, longUrl input:`, longUrl);
 
 for (const key in memoryCache) {
  if (memoryCache.hasOwnProperty(key)) {
    const value = memoryCache[key];
    if (value == longUrl.url) {
     //  console.log(`found it`);
      return key;
    }
 //   console.log(`Key: ${key}, Value: ${value}`);
  }
}

const urlList = { urls: [] };



 // const data = await readDatabase();
 //  console.log(`input:`, longUrl);
//  console.log(`db cache:`, data);
// enable caching, dont save the same entry multiple times
//console.log(`data:`, data.urls[0].longUrl.url);

  //const existingUrlMapping = data.urls.find((url) => url.longUrl.url === longUrl);
 
//  const keyValueList = Object.entries(memoryCache).map(([key, value]) => ({ shortUrl:key, longUrl: value }));


 /*
 
  for (let i = 0; i < data.urls.length; i++) {
    const urlData = data.urls[i];
    const shortUrl = urlData.shortUrl;
    const longUrl2 = urlData.longUrl;
  //  console.log(`URL ${i + 1}: Short URL - ${shortUrl}, Long URL - ${longUrl2}, input: ${longUrl}`);
    console.log(`raw url data:`, urlData);
   console.log(`searching for: `, longUrl2 );
   console.log(`searching against: `, longUrl );
   if (!longUrl.url){
    if (longUrl2 == longUrl) {
      console.log(`found it!`);
      return shortUrl;
    }
   }
    if (longUrl.url == longUrl2) {
       console.log(`found it!`);
      return shortUrl;
    }
    // Perform operations with shortUrl and longUrl
  }

*/


  const shortUrl = shortid.generate();
  memoryCache[shortUrl] = longUrl.url;
  for (const [key, value] of Object.entries(memoryCache)) {
    urlList.urls.push({ shorturl: key, longurl: value });
  }
 //  console.log('writing:', urlList)
 //  console.log(`saving url...`)
 //  console.log(`[saving url]saveUrl:`, shortUrl);
 // console.log(`[saving url]longUrl:`, longUrl);
/*

 const fullurldata = longUrl.url;
  if (!fullurldata) {
    data.urls.push({ shortUrl, longUrl: longUrl });
  } else {
  data.urls.push({ shortUrl, longUrl: fullurldata });
};
*/  
await writeDatabase(urlList);


 // console.log(`db write:`, data);
  return shortUrl;
};

// get all storage keys
export function get_all_keys() {}

const getUrl = async (shortUrl: string): Promise<string | null> => {
  const data = await readDatabase();
 /*
  console.log(`get url called!`);
  console.log(`geturl input: `, shortUrl);
  data.urls.forEach((urlData: UrlData) => {
    console.log(`Short URL: ${urlData.shortUrl}`);
    console.log(`Long URL: ${urlData.longUrl}`);
    console.log("------");
  });
  */
  const urlMapping = data.urls.find((url) => url.shortUrl === shortUrl);
 // console.log(`url mapping is:`, urlMapping);
  return urlMapping ? urlMapping.longUrl : null;
};

export { saveUrl, getUrl };