/**
 * constants.js — shared constants for the Subscription Manager.
 *
 * Extracted from SubscriptionManager.jsx to allow other modules
 * (e.g. AppStoreConnect, price-setting utilities) to import these
 * without pulling in the full React component tree.
 */

/**
 * localStorage key used across SubscriptionManager and AppStoreConnect
 * to read/write the encrypted private key cipher-text.
 */
export const ENCRYPTED_KEY_STORAGE = 'asc-encrypted-p8-key'

/**
 * ISO 3166-1 alpha-2 → alpha-3 country code mapping.
 * Required by the App Store Connect API which expects ISO3 territory codes
 * for subscription price-point endpoints.
 *
 * Covers all territories currently supported by App Store Connect.
 */
export const ISO2_TO_ISO3 = {
  AF: 'AFG', AL: 'ALB', DZ: 'DZA', AO: 'AGO', AI: 'AIA', AG: 'ATG', AR: 'ARG', AM: 'ARM',
  AU: 'AUS', AT: 'AUT', AZ: 'AZE', BS: 'BHS', BH: 'BHR', BB: 'BRB', BY: 'BLR', BE: 'BEL',
  BZ: 'BLZ', BJ: 'BEN', BM: 'BMU', BT: 'BTN', BO: 'BOL', BA: 'BIH', BW: 'BWA', BR: 'BRA',
  VG: 'VGB', BN: 'BRN', BG: 'BGR', BF: 'BFA', KH: 'KHM', CM: 'CMR', CA: 'CAN', CV: 'CPV',
  KY: 'CYM', TD: 'TCD', CL: 'CHL', CN: 'CHN', CO: 'COL', CG: 'COG', CR: 'CRI', HR: 'HRV',
  CY: 'CYP', CZ: 'CZE', CI: 'CIV', CD: 'COD', DK: 'DNK', DM: 'DMA', DO: 'DOM', EC: 'ECU',
  EG: 'EGY', SV: 'SLV', EE: 'EST', SZ: 'SWZ', FJ: 'FJI', FI: 'FIN', FR: 'FRA', GA: 'GAB',
  GM: 'GMB', GE: 'GEO', DE: 'DEU', GH: 'GHA', GR: 'GRC', GD: 'GRD', GT: 'GTM', GW: 'GNB',
  GY: 'GUY', HN: 'HND', HK: 'HKG', HU: 'HUN', IS: 'ISL', IN: 'IND', ID: 'IDN', IQ: 'IRQ',
  IE: 'IRL', IL: 'ISR', IT: 'ITA', JM: 'JAM', JP: 'JPN', JO: 'JOR', KZ: 'KAZ', KE: 'KEN',
  KR: 'KOR', KW: 'KWT', KG: 'KGZ', LA: 'LAO', LV: 'LVA', LB: 'LBN', LR: 'LBR', LY: 'LBY',
  LT: 'LTU', LU: 'LUX', MO: 'MAC', MK: 'MKD', MG: 'MDG', MW: 'MWI', MY: 'MYS', MV: 'MDV',
  ML: 'MLI', MT: 'MLT', MR: 'MRT', MU: 'MUS', MX: 'MEX', FM: 'FSM', MD: 'MDA', MN: 'MNG',
  ME: 'MNE', MS: 'MSR', MA: 'MAR', MZ: 'MOZ', MM: 'MMR', NA: 'NAM', NR: 'NRU', NP: 'NPL',
  NL: 'NLD', NZ: 'NZL', NI: 'NIC', NE: 'NER', NG: 'NGA', NO: 'NOR', OM: 'OMN', PK: 'PAK',
  PW: 'PLW', PA: 'PAN', PG: 'PNG', PY: 'PRY', PE: 'PER', PH: 'PHL', PL: 'POL', PT: 'PRT',
  QA: 'QAT', RO: 'ROU', RU: 'RUS', RW: 'RWA', KN: 'KNA', LC: 'LCA', VC: 'VCT', ST: 'STP',
  SA: 'SAU', SN: 'SEN', RS: 'SRB', SC: 'SYC', SL: 'SLE', SG: 'SGP', SK: 'SVK', SI: 'SVN',
  SB: 'SLB', ZA: 'ZAF', ES: 'ESP', LK: 'LKA', SR: 'SUR', SE: 'SWE', CH: 'CHE', TW: 'TWN',
  TJ: 'TJK', TZ: 'TZA', TH: 'THA', TO: 'TON', TT: 'TTO', TN: 'TUN', TR: 'TUR', TM: 'TKM',
  TC: 'TCA', UG: 'UGA', UA: 'UKR', AE: 'ARE', GB: 'GBR', US: 'USA', UY: 'URY', UZ: 'UZB',
  VU: 'VUT', VE: 'VEN', VN: 'VNM', YE: 'YEM', ZM: 'ZMB', ZW: 'ZWE',
}
