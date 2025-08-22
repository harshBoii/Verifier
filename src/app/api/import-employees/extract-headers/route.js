import { NextResponse } from 'next/server';
import Papa from 'papaparse';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }

    const fileText = await file.text();

    // PapaParse can preview the file to get just the first few lines
    Papa.parse(fileText, {
      preview: 1, // We only need the first row
      complete: (results) => {
        // results.data[0] will be an array of the header strings
        const headers = results.data[0];
        return NextResponse.json({ headers });
      },
      error: (error) => {
        console.error("Header extraction error:", error);
        return NextResponse.json({ error: 'Failed to parse CSV headers.' }, { status: 500 });
      }
    });

    // The response is sent inside the 'complete' callback.
    // We need to return a promise that resolves when the parsing is done.
    return new Promise(resolve => {
        Papa.parse(fileText, {
            preview: 1,
            complete: (results) => {
                const headers = results.data;
                resolve(NextResponse.json({ headers }));
            },
            error: (err) => {
                resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            }
        });
    });


  } catch (error) {
    console.error("API Extract Headers Error:", error);
    return NextResponse.json({ error: 'Failed to process file.' }, { status: 500 });
  }
}
