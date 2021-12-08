import * as https from 'https';
import type { Release } from '@octokit/webhooks-types';
import type { NextApiRequest, NextApiResponse } from 'next';

export const getLatestRelease = async () => {
  return await fetch(
    'https://api.github.com/repos/baranwang/wkr/releases/latest'
  ).then((res) => res.json() as Promise<Release>);
}

export const APIGateway = async (req: NextApiRequest, res: NextApiResponse, url: string) => {
  https
    .request(url, {
      headers: req.headers,
      method: req.method,
      rejectUnauthorized: false,
    }, (response) => {
      res.writeHead(response.statusCode!, response.headers);
      response.on('data', (chunk) => {
        res.write(chunk);
      });
      response.on('end', () => {
        res.end();
      });
    })
    .on('error', (e) => {
      res.writeHead(500);
      res.end(e.message);
    })
    .end();
}