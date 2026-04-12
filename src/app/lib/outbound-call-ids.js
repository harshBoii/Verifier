/**
 * IDs sent to the voice microservice (echoed back on webhook).
 * exp_id: EXP_<numeric db id>
 * emp_id: EMP_<employee user id> when linked; else EMP_ORPHAN_<exp id> (webhook resolves user from experience)
 */

export function buildOutboundCallIds(experience) {
  const exp_id = `EXP_${experience.id}`;
  const emp_id =
    experience.userId != null ? `EMP_${experience.userId}` : `EMP_ORPHAN_${experience.id}`;
  return { emp_id, exp_id };
}

export function parseExperienceIdFromExpToken(exp_id) {
  const m = String(exp_id ?? '').match(/^EXP_(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

/** Returns user id when token is EMP_<digits>, else null */
export function parseEmployeeUserIdFromEmpToken(emp_id) {
  const m = String(emp_id ?? '').match(/^EMP_(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}
