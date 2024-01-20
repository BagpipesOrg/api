// handledb.ts
import fs from 'fs/promises';
import path from 'path';
import shortid from 'shortid';

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
   // console.log(`read raw data:`, data);
    return JSON.parse(data) as Database;
  } catch (error) {
    return { urls: [] };
  }
};

const writeDatabase = async (data: Database): Promise<void> => {
 //  console.log(`wrote to db`);
  await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

const saveUrl = async (longUrl: any): Promise<string> => {
 //  console.log( `saveurl start`)
  const data = await readDatabase();
 //  console.log(`input:`, longUrl);
//  console.log(`db cache:`, data);
// enable caching, dont save the same entry multiple times
//console.log(`data:`, data.urls[0].longUrl.url);

  //const existingUrlMapping = data.urls.find((url) => url.longUrl.url === longUrl);
  for (let i = 0; i < data.urls.length; i++) {
    const urlData = data.urls[i];
    const shortUrl = urlData.shortUrl;
    const longUrl2 = urlData.longUrl;
  //  console.log(`URL ${i + 1}: Short URL - ${shortUrl}, Long URL - ${longUrl2}, input: ${longUrl}`);
   // console.log(`raw url data:`, urlData);
//   console.log(`searching for: `, longUrl2 );
 //  console.log(`searching against: `, longUrl );
   if (!longUrl.url){
    if (longUrl2 == longUrl) {
      return shortUrl;
    }
   }
    if (longUrl.url == longUrl2) {
   //    console.log(`found it!`);
      return shortUrl;
    }
    // Perform operations with shortUrl and longUrl
  }




  const shortUrl = shortid.generate();
/*
  console.log(`saving url...`)
  console.log(`[saving url]saveUrl:`, shortUrl);
 console.log(`[saving url]longUrl:`, longUrl);
*/
 const fullurldata = longUrl.url;
  if (!fullurldata) {
    data.urls.push({ shortUrl, longUrl: longUrl });
  } else {
  data.urls.push({ shortUrl, longUrl: fullurldata });
};
  await writeDatabase(data);
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