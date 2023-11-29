// handledb.ts
import fs from 'fs/promises';
import path from 'path';
import shortid from 'shortid';

interface UrlData {
  shortUrl: string;
  longUrl: any;
}

interface Database {
  urls: UrlData[];
}

const DB_FILE_PATH = path.join(__dirname, 'urls2.json');

const readDatabase = async (): Promise<Database> => {
  try {
    const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data) as Database;
  } catch (error) {
    return { urls: [] };
  }
};

const writeDatabase = async (data: Database): Promise<void> => {
  await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

const saveUrl = async (longUrl: any): Promise<string> => {
  const data = await readDatabase();
 // console.log(`input:`, longUrl.longUrl);
// enable caching, dont save the same entry multiple times
//console.log(`data:`, data.urls[0].longUrl.url);

  //const existingUrlMapping = data.urls.find((url) => url.longUrl.url === longUrl);
  for (let i = 0; i < data.urls.length; i++) {
    const urlData = data.urls[i];
    const shortUrl = urlData.shortUrl;
    const longUrl2 = urlData.longUrl.longUrl;
  //  console.log(`URL ${i + 1}: Short URL - ${shortUrl}, Long URL - ${longUrl2}, input: ${longUrl}`);
   // console.log(`raw url data:`, urlData);
    if (longUrl.longUrl == longUrl2) {
  //    console.log(`found it!`);
      return shortUrl;
    }
    // Perform operations with shortUrl and longUrl
  }




  const shortUrl = shortid.generate();
  data.urls.push({ shortUrl, longUrl });
  await writeDatabase(data);
  console.log(`saveUrl:`, shortUrl);
  return shortUrl;
};

const getUrl = async (shortUrl: string): Promise<string | null> => {
  const data = await readDatabase();
  const urlMapping = data.urls.find((url) => url.shortUrl === shortUrl);
  return urlMapping ? urlMapping.longUrl : null;
};

export { saveUrl, getUrl };