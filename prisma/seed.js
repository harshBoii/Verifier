const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // --- 1. Clean up the database ---
  console.log('🗑️ Deleting existing data...');
  await prisma.workExperienceSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.workExperience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.campaignUser.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  console.log('✅ Existing data deleted.');

  // --- 2. Create Skills (Global) ---
  console.log('🎨 Creating skills...');
  const skills = await prisma.skill.createManyAndReturn({
    data: [
      { name: 'ReactJS', category: 'DEVELOPMENT_AND_TECH', skillType: 'ROLE', endorsements: 12, isVerified: true, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
      { name: 'Node.js', category: 'DEVELOPMENT_AND_TECH', skillType: 'ROLE', endorsements: 9, isVerified: true, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
      { name: 'Figma', category: 'DESIGN', skillType: 'ROLE', endorsements: 22, isVerified: true, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
      { name: 'Project Management', category: 'BUSINESS', skillType: 'INTEREST', endorsements: 8, isVerified: false, imageUrl: 'https://cdn-icons-png.flaticon.com/512/1087/1087927.png' },
      { name: 'PostgreSQL', category: 'DEVELOPMENT_AND_TECH', skillType: 'ROLE', endorsements: 7, isVerified: false, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
      { name: 'Google Ads', category: 'MARKETING', skillType: 'ROLE', endorsements: 15, isVerified: true, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg' },
    ],
  });
  console.log(`✅ ${skills.length} skills created.`);
  
  // --- 3. Create Companies, Users, and Campaigns ---
  console.log('🏢 Creating companies and users...');

  // --- COMPANY 1: Innovate Inc. ---
  const innovateInc = await prisma.company.create({ data: { name: 'Innovate Inc.' } });
  const innovateAdmin = await prisma.user.create({
    data: {
      username: 'innovate_admin', fullName: 'Harsh Vardhan', email: 'h.rvardhan3@gmail.com',
      password: await bcrypt.hash('adminpass1', 10), role: 'ADMIN', position: 'CEO',
      verifier_email: 'ceo.verifier@example.com', companyId: innovateInc.id,
    },
  });
  await prisma.company.update({ where: { id: innovateInc.id }, data: { adminId: innovateAdmin.id } });
  console.log(`✅ Created company: ${innovateInc.name} with admin: ${innovateAdmin.fullName}`);

  console.log(`🚀 Creating campaigns for ${innovateInc.name}...`);
  const innovateCampaigns = await prisma.campaign.createManyAndReturn({
      data: [
          { name: 'Innovate Inc. - Q4 Marketing', description: 'End-of-year marketing for Innovate Inc.', startDate: new Date('2025-10-01'), endDate: new Date('2025-12-31'), companyId: innovateInc.id },
          { name: 'Innovate Inc. - Project Phoenix', description: 'Launch campaign for the new AI features.', startDate: new Date('2025-09-15'), endDate: new Date('2025-11-15'), companyId: innovateInc.id },
      ]
  });
  console.log(`✅ ${innovateCampaigns.length} campaigns created for ${innovateInc.name}.`);

  const innovateEmployeeData = [
    { username: 'harsh_v', fullName: 'Harsh', email: 'iamharsh4ever@gmail.com', position: 'Senior Frontend Developer', verifier_email: 'harshdbugger@gmail.com'},
    { username: 'bob_w', fullName: 'Bob Williams', email: 'bob@innovate.com', position: 'Backend Developer', verifier_email: 'bob.verifier@example.com' },
  ];
  const createdInnovateEmployees = [];
  for (const emp of innovateEmployeeData) {
    const newUser = await prisma.user.create({ data: { ...emp, password: await bcrypt.hash('password123', 10), role: 'EMPLOYEE', companyId: innovateInc.id } });
    createdInnovateEmployees.push(newUser);
  }
  console.log(`✅ Created ${createdInnovateEmployees.length} employees for Innovate Inc.`);
  
  await prisma.campaignUser.createMany({
      data: [
          { userId: createdInnovateEmployees[0].id, campaignId: innovateCampaigns.find(c => c.name.includes('Phoenix')).id },
          { userId: createdInnovateEmployees[1].id, campaignId: innovateCampaigns.find(c => c.name.includes('Phoenix')).id },
          { userId: createdInnovateEmployees[1].id, campaignId: innovateCampaigns.find(c => c.name.includes('Marketing')).id },
      ]
  });
  console.log('✅ Assigned employees to campaigns for Innovate Inc.');

  // --- COMPANY 2: Solutions Co. ---
  const solutionsCo = await prisma.company.create({ data: { name: 'Solutions Co.' } });
  const solutionsAdmin = await prisma.user.create({
    data: {
      username: 'solutions_admin', fullName: 'Carol White', email: 'carol.w@solutions.co',
      password: await bcrypt.hash('adminpass2', 10), role: 'ADMIN', position: 'Director of Engineering',
      verifier_email: 'carol.verifier@example.com', companyId: solutionsCo.id,
    },
  });
  await prisma.company.update({ where: { id: solutionsCo.id }, data: { adminId: solutionsAdmin.id } });
  console.log(`✅ Created company: ${solutionsCo.name} with admin: ${solutionsAdmin.fullName}`);

  console.log(`🚀 Creating campaigns for ${solutionsCo.name}...`);
  const solutionsCampaigns = await prisma.campaign.createManyAndReturn({
      data: [
          { name: 'Solutions Co. - Client Outreach 2025', description: 'New client acquisition campaign.', startDate: new Date('2025-08-01'), endDate: new Date('2025-10-30'), companyId: solutionsCo.id },
      ]
  });
  console.log(`✅ ${solutionsCampaigns.length} campaigns created for ${solutionsCo.name}.`);

  const solutionsEmployeeData = [
    { username: 'frank_g', fullName: 'Frank Green', email: 'frank@solutions.co', position: 'DevOps Engineer', verifier_email: 'frank.verifier@example.com' },
    { username: 'grace_h', fullName: 'Grace Hopper', email: 'grace@solutions.co', position: 'Senior Software Engineer', verifier_email: 'grace.verifier@example.com' },
  ];
  const createdSolutionsEmployees = [];
  for (const emp of solutionsEmployeeData) {
    const newUser = await prisma.user.create({ data: { ...emp, password: await bcrypt.hash('password123', 10), role: 'EMPLOYEE', companyId: solutionsCo.id } });
    createdSolutionsEmployees.push(newUser);
  }
  console.log(`✅ Created ${createdSolutionsEmployees.length} employees for Solutions Co.`);

  await prisma.campaignUser.createMany({
      data: [
          { userId: createdSolutionsEmployees[0].id, campaignId: solutionsCampaigns.find(c => c.name.includes('Outreach')).id },
          { userId: createdSolutionsEmployees[1].id, campaignId: solutionsCampaigns.find(c => c.name.includes('Outreach')).id },
      ]
  });
  console.log('✅ Assigned employees to campaigns for Solutions Co.');

  console.log('🏁 Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });