import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { Client } from '@upstash/qstash';

const qstashClient = new Client({ token: process.env.QSTASH_TOKEN });
const BATCH_SIZE = 100; // Process 100 records per batch worker

export async function POST(request) {
  try {
    const { companyId, workflowId } = await request.json();

    if (!companyId || !workflowId) {
      return NextResponse.json({ error: 'companyId and workflowId are required' }, { status: 400 });
    }
    
    // Step 1: Count the total number of records to process without fetching them.
    const totalRecords = await prisma.workExperience.count({
        where: {
            user: { 
            companyId: parseInt(companyId, 10), // And then on the user's companyId
            },
        progress: { in: ['Email_added', 'Mail_sent'] }, // ✅ correct enum values
      },
    });

    if (totalRecords === 0) {
      return NextResponse.json({ message: 'No records to process.', totalRecords: 0 });
    }

    // Step 2: Calculate the number of batches needed.
    const totalPages = Math.ceil(totalRecords / BATCH_SIZE);

    // Step 3: Enqueue a job for each batch.
    const batchPromises = [];
    for (let page = 0; page < totalPages; page++) {
      const job = qstashClient.publishJSON({
        // Call the new batch processing worker
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/workflow/process-batch`,
        body: {
          companyId,
          workflowId,
          page, // Send the page number to the worker
          pageSize: BATCH_SIZE,
        },
        // Optional: Stagger the start of each batch to smooth the load
        delay: `${page * 5}s`, 
      });
      batchPromises.push(job);
    }

    await Promise.all(batchPromises);

    return NextResponse.json({
      message: `Successfully scheduled ${totalRecords} records to be processed in ${totalPages} batches.`,
      totalRecords,
      totalPages,
    });

  } catch (error) {
    console.error("Error initiating batch workflow trigger:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
