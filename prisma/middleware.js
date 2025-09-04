// // prisma/middleware.js
// import prisma from "./client.js";
// import fetch from "node-fetch";

// prisma.$use(async (params, next) => {
//   // Only run for WorkExperience updates
//   if (params.model === "WorkExperience" && params.action === "update") {
//     // Get previous progress
//     const before = await prisma.workExperience.findUnique({
//       where: params.args.where,
//       select: { progress: true, userId: true, id: true },
//     });

//     // Perform the update
//     const result = await next(params);

//     // If progress changed, publish job to QStash
//     if (before.progress !== result.progress) {
//       const payload = {
//         type: "progressUpdate",
//         userId: result.userId,
//         expId: result.id,
//         progress: result.progress,
//       };

//       await fetch("https://qstash.upstash.io/v1/publish/progress-updates", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
//         },
//         body: JSON.stringify({
//           body: payload,
//           delivery: {
//             url: "http://localhost:3000/worker/notification/route.js", // your Next.js worker route
//           },
//         }),
//       });

//       console.log(`Published progress update for userId=${result.userId} to QStash`);
//     }

//     return result;
//   }

//   return next(params);
// });

// middleware.js
import fetch from 'node-fetch';

export const middleware = async (params, next) => {
  if (params.model === "WorkExperience" && params.action === "update") {
    const before = await prisma.workExperience.findUnique({
      where: params.args.where,
      select: { progress: true, userId: true, id: true },
    });

    const result = await next(params);

    if (before.progress !== result.progress) {
      const payload = {
        type: "progressUpdate",
        userId: result.userId,
        expId: result.id,
        progress: result.progress,
      };

      await fetch("https://qstash.upstash.io/v1/publish/progress-updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
        },
        body: JSON.stringify({
          body: payload,
          delivery: {
            url: "http://localhost:3000/worker/notification/route.js", // your Next.js worker route
          },
        }),
      });

      console.log(`Published progress update for userId=${result.userId} to QStash`);
    }

    return result;
  }

  return next(params);
};
