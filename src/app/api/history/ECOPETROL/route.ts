import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function GET(): Promise<Response> {
  const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'ECOPETROL-price-history.py');

  return new Promise((resolve) => {
    exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        resolve(
          new Response(JSON.stringify({ error: stderr }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        );
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(
          new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      } catch {
        resolve(
          new Response(JSON.stringify({ error: 'Invalid JSON output' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
    });
  });
}
