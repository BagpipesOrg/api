import {readDatabase, UrlData} from "./handledb";
import { decompressString, scenario_detailed_info } from "../scenarios/parse_db";

// return a list of scenariosummary for all scenarios
export async function build_scenario_cache(): Promise<any[]> {
    const db = await readDatabase();

   // console.log(`get data:`, db);
    console.log(`get url called!`);
    var scenario_listan: any[] = [];
 

    for await (const urlData of db.urls) {
    //  console.log(`Short URL: ${urlData.shortUrl}`);
      const get_data = urlData.longUrl;
      const decoded = await decompressString(get_data);
     // console.log(`decoded: `, decoded)
      const deep_coded = await scenario_detailed_info(JSON.parse(decoded));
    //  console.log(`Deep: ${deep_coded}`)
        scenario_listan.push(deep_coded)
    //      console.log('------')
    }


    return scenario_listan;
}


function template_stats(){}