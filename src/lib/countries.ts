const countryCodes: Record<string, string> = {
  Argentina: 'AR',
  Australia: 'AU',
  Belgium: 'BE',
  Brazil: 'BR',
  Canada: 'CA',
  Colombia: 'CO',
  Croatia: 'HR',
  Denmark: 'DK',
  Ecuador: 'EC',
  England: 'GB-ENG',
  France: 'FR',
  Germany: 'DE',
  Ghana: 'GH',
  Haiti: 'HT',
  Iran: 'IR',
  Italy: 'IT',
  Japan: 'JP',
  Mexico: 'MX',
  Morocco: 'MA',
  Netherlands: 'NL',
  Nigeria: 'NG',
  Norway: 'NO',
  Paraguay: 'PY',
  Poland: 'PL',
  Portugal: 'PT',
  Qatar: 'QA',
  Scotland: 'GB-SCT',
  Senegal: 'SN',
  Serbia: 'RS',
  Spain: 'ES',
  Switzerland: 'CH',
  Turkey: 'TR',
  Uruguay: 'UY',
  Wales: 'GB-WLS',
};

const specialFlags: Record<string, string> = {
  'Bosnia and Herzegovina': '🇧🇦',
  England: '🏴',
  Scotland: '🏴',
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
