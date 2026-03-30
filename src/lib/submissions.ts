import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import { Submission } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'submissions.json');

export async function readSubmissions(): Promise<Submission[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Submission[];
  } catch {
    return [];
  }
}

export async function writeSubmissions(submissions: Submission[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
}
