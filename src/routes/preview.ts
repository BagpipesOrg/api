import { Router } from 'express'
import { getUrl } from './../api/handledb'
import {
    decompressString,
    scenario_info,
  } from './../scenarios/parse_db'
  
import { save_site } from './../api/screenshot';

const router = Router()



router.get('/preview', async (req, res) => {

    const { scenario_id } = req.params //: { scenario_id: string } 


    const get_data = await getUrl(scenario_id)
    if (!get_data) {
      return res.json({ result: 'Could not find the scenario data' })
    }
    const website = `https://alpha.bagpipes.io/#/create/?diagramData=${scenario_id}`;
    //  console.log(`get_data is:`, get_data);
    const decoded = await decompressString(get_data)
    //  console.log(`decoded: `, decoded);
    const out = await scenario_info(decoded)
    const img_b64 = await save_site(website);
    return res.json({ info: out, img: img_b64 })
})



export default router;