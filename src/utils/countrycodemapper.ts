import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(en);

export function getCountryCodeFromText(query: string): string | undefined {
  const lower = query.toLowerCase();

  // 1. Direct match (full country names)
  const allCountries = countries.getNames('en', { select: 'official' });

  //   The lib returns something like the below
  // {
  //   NG: "Nigeria",
  //   NE: "Niger",
  //   US: "United States of America",
  //   ...
  // }
  //   Therefore the for loop is that way

  for (const [code, name] of Object.entries(allCountries)) {
    // if (lower.includes(name.toLowerCase())) {
    //   return code;
    // }
    // The below is better cause it uses regex to find exact matches and avoid partial matches (e.g., "United States" matching "United Kingdom" Or "Niger" matching "Nigeria")
    const regex = new RegExp(`\\b${name.toLowerCase()}\\b`);
    if (regex.test(lower)) {
      return code;
    }
  }

  // 2. Common aliases (VERY IMPORTANT)
  const aliases: Record<string, string> = {
    usa: 'US',
    'united states': 'US',
    america: 'US',
    uk: 'GB',
    britain: 'GB',
    england: 'GB',
    uae: 'AE',
    russia: 'RU',
    'south korea': 'KR',
    'north korea': 'KP',
    vietnam: 'VN',
    laos: 'LA',
    syria: 'SY',
    iran: 'IR',
    bolivia: 'BO',
    tanzania: 'TZ',
    venezuela: 'VE',
  };

  //   The aliases defined above is different therefore the for loop is presented in a way that is different from the one for direct match. The loop goes through the alias name and not the country name because the alias is what we are trying to match in the user query and not the country name (e.g., "United States" is what we are trying to match in the user query and not "US")
  for (const [alias, code] of Object.entries(aliases)) {
    // if (lower.includes(alias)) {
    //   return code;
    // }
    // The below is better cause it uses regex to find exact matches and avoid partial matches (e.g., "United States" matching "United Kingdom" Or "Niger" matching "Nigeria")
    const regex = new RegExp(`\\b${alias.toLowerCase()}\\b`);
    if (regex.test(lower)) {
      return code;
    }
  }

  return undefined;
}
