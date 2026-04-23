import { AgeGroup, Gender } from 'src/app.type';
import { getCountryCodeFromText } from './countrycodemapper';
import { FetchProfilesDto } from 'src/app.dto';

export function parseSearchQuery(
  q: string,
  limit: number = 10,
  page: number = 1,
): Partial<FetchProfilesDto> | null {
  const query = q.toLowerCase().trim();
  const result: Partial<FetchProfilesDto> = {};

  // -------------------------
  // GENDER
  // -------------------------
  const hasMale = query.includes('male');
  const hasFemale = query.includes('female');

  if (hasMale && !hasFemale) result.gender = Gender.male;
  else if (!hasMale && hasFemale) result.gender = Gender.female;

  // -------------------------
  // COUNTRY
  // -------------------------
  const countryCode = getCountryCodeFromText(query);
  console.log(countryCode);

  if (countryCode) result.country_id = countryCode;

  // -------------------------
  // AGE
  // -------------------------
  const aboveMatch = query.match(/above (\d+)/);
  if (aboveMatch) result.min_age = parseInt(aboveMatch[1], 10);

  const belowMatch = query.match(/below (\d+)/);
  if (belowMatch) result.max_age = parseInt(belowMatch[1], 10);

  if (!aboveMatch && !belowMatch && query.includes('young')) {
    result.min_age = 16;
    result.max_age = 24;
  }

  // -------------------------
  // AGE GROUP
  // -------------------------
  if (query.includes('adult')) result.age_group = AgeGroup.adult;
  if (query.includes('teenager')) result.age_group = AgeGroup.teenager;
  if (query.includes('senior')) result.age_group = AgeGroup.senior;

  // -------------------------
  // FINAL CHECK
  // -------------------------
  if (Object.keys(result).length === 0) return null;

  return { ...result, limit, page };
}
