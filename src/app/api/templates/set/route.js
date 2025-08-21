import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma'; // Ensure this path is correct

/**
 * POST -> Sets a specific email template as the default for a company and type.
 * @body { companyId: number, templateId: number }
 */
export async function POST(request) {
  try {
    const { companyId, templateId } = await request.json();

    if (!companyId || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields: companyId and templateId are required.' },
        { status: 400 }
      );
    }

    // --- Validation Step ---
    // 1. Fetch the template to get its type and verify it exists.
    const templateToSet = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!templateToSet) {
      return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
    }
    
    // 2. Optional but recommended: Check if the template belongs to the company
    // or is a "System Default" template that any company can use.
    // This prevents one company from using another's private template.
    const systemDefaultCompany = await prisma.company.findUnique({ where: { name: 'System Default' }});
    if (templateToSet.companyId !== companyId && templateToSet.companyId !== systemDefaultCompany?.id) {
        return NextResponse.json({ error: 'This template cannot be assigned to the specified company.' }, { status: 403 });
    }

    // --- Update Logic ---
    // 3. Determine which field on the Company model to update based on the template's type.
    const updateData = {};
    switch (templateToSet.type) {
      case 'Verification_Request':
        updateData.defaultVerificationRequestTemplateId = templateId;
        break;
      case 'Verification_Result':
        updateData.defaultVerificationResultTemplateId = templateId;
        break;
      case 'Request_Hr_Mail':
        updateData.defaultRequestHrMailTemplateId = templateId;
        break;
      case 'WELCOME_EMAIL':
        updateData.defaultWelcomeEmailTemplateId = templateId;
        break;
      case 'PASSWORD_RESET':
        updateData.defaultPasswordResetTemplateId = templateId;
        break;
      // Add cases for other template types...
      default:
        return NextResponse.json({ error: `Unsupported template type: ${templateToSet.type}` }, { status: 400 });
    }

    // 4. Update the company record with the new default template ID.
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });

    return NextResponse.json({
      message: `Successfully set default template for ${templateToSet.type}.`,
      company: updatedCompany,
    });

  } catch (error) {
    console.error("API Error - Set Template:", error);
    return NextResponse.json({ error: 'Failed to set default template.' }, { status: 500 });
  }
}
