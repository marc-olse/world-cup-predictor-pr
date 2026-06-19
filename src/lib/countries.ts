const countryCodes: Record<string, string> = {
  Argentina: 'AR',
  Algeria: 'DZ',
  Australia: 'AU',
  Austria: 'AT',
  Belgium: 'BE',
  Brazil: 'BR',
  Canada: 'CA',
  'Cape Verde': 'CV',
  Colombia: 'CO',
  Croatia: 'HR',
  Curacao: 'CW',
  'Czech Republic': 'CZ',
  Denmark: 'DK',
  'DR Congo': 'CD',
  Ecuador: 'EC',
  Egypt: 'EG',
  England: 'GB',
  France: 'FR',
  Germany: 'DE',
  Ghana: 'GH',
  Haiti: 'HT',
  Iran: 'IR',
  Iraq: 'IQ',
  'Ivory Coast': 'CI',
  Italy: 'IT',
  Japan: 'JP',
  Jordan: 'JO',
  Mexico: 'MX',
  Morocco: 'MA',
  Netherlands: 'NL',
  'New Zealand': 'NZ',
  Nigeria: 'NG',
  Norway: 'NO',
  Panama: 'PA',
  Paraguay: 'PY',
  Poland: 'PL',
  Portugal: 'PT',
  Qatar: 'QA',
  'Saudi Arabia': 'SA',
  Scotland: 'GB',
  Senegal: 'SN',
  Serbia: 'RS',
  'South Korea': 'KR',
  Spain: 'ES',
  Sweden: 'SE',
  Switzerland: 'CH',
  Tunisia: 'TN',
  Turkey: 'TR',
  Uruguay: 'UY',
  USA: 'US',
  Uzbekistan: 'UZ',
  Wales: 'GB-WLS',
};

const specialFlags: Record<string, string> = {
  'Bosnia & Herzegovina': '🇧🇦',
  'Bosnia and Herzegovina': '🇧🇦',
   England: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}',
   Scotland: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}',
   Wales: '🏴',
  'South Africa': '🇿🇦',
  'United States': '🇺🇸',
};

export function countryFlag(country: string) {
  const specialFlag = specialFlags[country];

  if (specialFlag) {
    return specialFlag;
  }

  const code = countryCodes[country];

  if (!code || code.includes('-')) {
    return '🏳';
  }

  return code
    .toUpperCase()
    .split('')
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join('');
}
