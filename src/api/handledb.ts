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

const DB_FILE_PATH = path.join(__dirname, 'urls.json');

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

const saveUrl = async (longUrl: string): Promise<string> => {
  const data = await readDatabase();
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