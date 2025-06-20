// src/app/api/history/route.ts (or pages/api/history.ts if using Pages Router)

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function GET() {
  const scriptPath = path.join(process.cwd(), 'src','scripts', 'PFDAVVNDA-price-history.py');
    
  return new Promise((resolve) => {
    exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        return resolve(NextResponse.json({ error: stderr }, { status: 500 }));
      }

      try {
        const result = JSON.parse(stdout);
        return resolve(NextResponse.json(result));
      } catch (_e) {
        return resolve(NextResponse.json({ error: 'Invalid JSON output' }, { status: 500 }));
      }
    });
  });
}
