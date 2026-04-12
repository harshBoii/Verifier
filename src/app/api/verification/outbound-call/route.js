import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { buildOutboundCallIds } from '@/app/lib/outbound-call-ids';

const DEFAULT_VOICE_SERVICE = 'https://vettifyvoice.onrender.com';

function buildWorkExperienceText(experience) {
  const skillsString =
    experience.skills?.map((s) => s.skill.name).join(', ') || '';
  const base = experience.description || '';
  if (!skillsString) return base || 'No additional details provided.';
  return `${base}\n\nSkills: ${skillsString}`.trim();
}

function mapLanguageToDeepgram(language) {
  if (language === 'hi' || language === 'multi') return language;
  return 'en';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { experienceId, externalId, to, language } = body;

    if (!to || typeof to !== 'string' || !to.trim()) {
      return NextResponse.json({ error: 'Phone number (to) is required.' }, { status: 400 });
    }

    const deepgram_language = mapLanguageToDeepgram(language);

    let experience;
    if (externalId) {
      experience = await prisma.workExperience.findFirst({
        where: { external_id: String(externalId) },
        include: {
          user: true,
          skills: { include: { skill: true } },
        },
      });
    } else if (experienceId != null) {
      const numericId = parseInt(experienceId, 10);
      if (Number.isNaN(numericId)) {
        return NextResponse.json({ error: 'Invalid experience ID.' }, { status: 400 });
      }
      experience = await prisma.workExperience.findUnique({
        where: { id: numericId },
        include: {
          user: true,
          skills: { include: { skill: true } },
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Either experienceId or externalId is required.' },
        { status: 400 }
      );
    }

    if (!experience) {
      return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }

    const name =
      experience.user?.fullName?.trim() ||
      [experience.role, experience.companyName].filter(Boolean).join(' at ') ||
      'Verification candidate';

    const profession = (experience.job_title || experience.role || '').trim() || 'Professional';

    const { emp_id, exp_id } = buildOutboundCallIds(experience);

    const payload = {
      to: to.trim(),
      emp_id,
      exp_id,
      deepgram_language,
      context: {
        name,
        profession,
        work_experience: buildWorkExperienceText(experience),
      },
    };

    const base =
      process.env.OUTBOUND_CALL_SERVICE_URL?.replace(/\/$/, '') || DEFAULT_VOICE_SERVICE;
    const url = `${base}/call/question-outbound`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('Outbound call service error:', res.status, errText);
      return NextResponse.json(
        { error: 'Call service request failed.', detail: errText || res.statusText },
        { status: 502 }
      );
    }

    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    return NextResponse.json({ ok: true, data, emp_id, exp_id }, { status: 200 });
  } catch (error) {
    console.error('outbound-call route error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
