import type { NextApiRequest, NextApiResponse } from 'next';
import { APIGateway, getLatestRelease } from '@/utils';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Blob>
) {
  const { filename } = req.query
  const { assets } = await getLatestRelease()
  const asset = assets.find(item => item.name === filename)
  if (!asset) {
    return res.status(404).end()
  }
  APIGateway(req, res, asset.browser_download_url)
}
