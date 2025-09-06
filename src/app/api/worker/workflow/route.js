// In app/api/worker/workflow/route.js

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { Client, Receiver } from '@upstash/qstash';

const qstashClient = new Client({ token: process.env.QSTASH_TOKEN });

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});

async function executeAction(node, exp_id, ver_mail, ver_number, message) {
  const { channel } = node.config;
  let qstashPayload;
  let targetUrl;

  const node_with_wf= await prisma.workflowNode.findUnique({
    where:{id:node.id},
    include:{
      workflow:true
    }
  })
  switch (channel) {
    case 'email':
      targetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/notification/email`;
      qstashPayload = {
        companyId: node_with_wf.workflow.companyId,
        verifierEmail: ver_mail,
        subject: `Verification for Experience #${exp_id}`,
        htmlContent: message, // Assuming message is HTML
      };
      break;
    case 'sms':
      targetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/notification/sms`;
      qstashPayload = {
        companyId: node_with_wf.workflow.companyId,
        verifierNumber: ver_number,
        message: message,
      };
      break;
    case 'whatsapp':
      targetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/notification/whatsapp`;
      qstashPayload = {
        companyId: node_with_wf.workflow.companyId,
        verifierNumber: ver_number,
        message: message,
      };
      break;
    default:
      console.warn(`Unsupported channel: ${channel}`);
      return;
  }

  // Publish a new, dedicated job to the correct notification worker
  await qstashClient.publishJSON({
    url: targetUrl,
    body: qstashPayload,
  });

  console.log(`Dispatched job for channel '${channel}' for experience #${exp_id}`);
}

export async function POST(request) {
  const timestamp = new Date().toISOString();
  console.log(`\n--- [${timestamp}] Worker received a new job ---`);

  try {
    const signature = request.headers.get("upstash-signature");
    if (!signature) {
      console.error("[ERROR] Missing QStash signature.");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
    
    const body = await request.text();
    const isValid = await receiver.verify({
      signature,
      body,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/workflow`,
    });

    if (!isValid) {
      console.error("[ERROR] Invalid QStash signature.");
      return NextResponse.json({ error: "Unauthorized: Invalid signature" }, { status: 401 });
    }

    const { progressId } = JSON.parse(body);
    if (!progressId) {
      console.error("[ERROR] Missing progressId in request body.");
      return NextResponse.json({ error: "Missing progressId" }, { status: 400 });
    }
    console.log(`[INFO] Processing job for progressId: ${progressId}`);

    const progress = await prisma.workExperienceWorkflowProgress.findUnique({
      where: { id: progressId },
      include: {
        currentNode: {
          include: { sourceEdges: true },
        },
      },
    });

    const exp = await prisma.workExperience.findUnique({
      where: { id: progress.workExperienceId },
        select:{
          progress:true,
          id:true,
          verifier_email:true,
          verifier_number:true,
      }
    })

    const exp_status=exp?.progress

    if (!progress || !progress.currentNode) {
      console.warn(`[WARN] Progress or current node not found for ID: ${progressId}. Ignoring job.`);
      return NextResponse.json({ message: "Job ignored: progress not found." });
    }

    const { currentNode } = progress;
    let nextNodeId = null;
    console.log(`[INFO] Current Node ID: ${currentNode.id}, Type: ${currentNode.type}`);

    switch (currentNode.type) {

        case 'START':
        console.log(`[INFO] Processing START node. Finding next step.`);
        const startEdge = currentNode.sourceEdges.find(edge => edge.condition === 'ALWAYS');
        if (startEdge) {
          nextNodeId = startEdge.targetNodeId;
          console.log(`[INFO] Found next node for START: ${nextNodeId}`);
        } else {
          console.warn(`[WARN] START node has no outgoing edge. Halting.`);
        }
        break;

      case 'ACTION':
        await executeAction(currentNode,exp.id,exp.verifier_email,exp.verifier_number,currentNode.config?.message);
        const alwaysEdge = currentNode.sourceEdges.find(edge => edge.condition === 'ALWAYS');
        if (alwaysEdge) {
          nextNodeId = alwaysEdge.targetNodeId;
          console.log(`[INFO] Found next node for ACTION: ${nextNodeId}`);
        }
        break;

      case 'DELAY':
        const delay = currentNode.config.delay || 0;
        console.log(`[INFO] DELAY node config found. Delay value: ${delay} seconds.`);
        const delayEdge = currentNode.sourceEdges.find(edge => edge.condition === 'ALWAYS');
        if (delayEdge) {
            nextNodeId = delayEdge.targetNodeId;
            console.log(`[INFO] Next node after delay is: ${nextNodeId}`);

            const qstashPayload = {
                url: `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/workflow`,
                body: { progressId: progress.id },
                delay: `${delay}s`,
            };
            console.log(`[INFO] Publishing next job to QStash with payload:`, JSON.stringify(qstashPayload, null, 2));

            await qstashClient.publishJSON(qstashPayload);
            
            await prisma.workExperienceWorkflowProgress.update({
                where: { id: progress.id },
                data: { currentNodeId: nextNodeId },
            });
            
            console.log(`[SUCCESS] Job successfully scheduled for ${delay}s delay. Exiting worker.`);
            return NextResponse.json({ message: `Job delayed for ${delay} seconds.` });
        }
        break;
      
      case 'CONDITION':
        // Placeholder logic, you can expand this
        console.log(`[INFO] Processing CONDITION node.`);
        let conditionResult = true; 
        if (exp_status=="Verified"){
          conditionResult = false
        }

        if (exp_status=="Beginning"){
          console.log("Mail Shold be sent to Employee To Add Email ")
        }
        const conditionEdge = currentNode.sourceEdges.find(edge => edge.condition === (conditionResult ? 'TRUE' : 'FALSE'));
        if (conditionEdge) {
          nextNodeId = conditionEdge.targetNodeId;
          console.log(`[INFO] Condition result is ${conditionResult}, next node is ${nextNodeId}`);
        }
        break;

      case 'END':
        console.log(`[SUCCESS] Reached END node. Completing workflow.`);
        await prisma.workExperienceWorkflowProgress.update({
          where: { id: progress.id },
          data: { status: 'completed', completedAt: new Date() },
        });
        return NextResponse.json({ message: "Workflow completed." });

      default:
        console.warn(`[WARN] Unknown node type encountered: ${currentNode.type}`);
    }

    if (nextNodeId) {
      console.log(`[INFO] Transitioning to next step. Updating progress to node ${nextNodeId}`);
      await prisma.workExperienceWorkflowProgress.update({
        where: { id: progress.id },
        data: { currentNodeId: nextNodeId },
      });

      const qstashPayload = {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/workflow`,
          body: { progressId: progress.id },
      };
      console.log(`[INFO] Publishing next job to QStash with IMMEDIATE execution. Payload:`, JSON.stringify(qstashPayload, null, 2));
      
      await qstashClient.publishJSON(qstashPayload);
      return NextResponse.json({ message: `Transitioned to node ${nextNodeId}` });
    } else {
      console.log(`[INFO] Workflow has no further steps from node ${currentNode.id}. Halting.`);
      return NextResponse.json({ message: "Workflow halted: no further steps." });
    }

  } catch (error) {
    console.error("--- [FATAL] Error in workflow worker ---");
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
