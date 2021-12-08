import { app } from 'electron';
import * as path from 'path'
import * as fs from 'fs';

export const getRulesPath = () => {
  const rulesPath = path.resolve(app.getPath('userData'), 'rules')
  fs.existsSync(rulesPath) || fs.mkdirSync(rulesPath);
  return rulesPath;
}

export const getRulesList = () => {
  const rulesPath = getRulesPath();
  const files = fs.readdirSync(rulesPath);
  return files.map(file => JSON.parse(fs.readFileSync(path.resolve(rulesPath, file), 'utf8')) as RoomRules)
}