/**
 * Household record normaliser.
 * Defines: ensureHousehold()
 */
/** Ensure resident has householdMembers array */
function ensureHousehold(r){
  if(!r) return [];
  if(!Array.isArray(r.householdMembers)) r.householdMembers = [];
  return r.householdMembers;
}
