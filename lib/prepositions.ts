import type { Lang } from '@/types';

/** Returns the preposition (with surrounding spaces) to place between a phrase and a country name. */
export function getCountryPrep(alpha2: string, lang: Lang): string {
  const a = alpha2.toUpperCase();
  switch (lang) {
    case 'pt': return countryPrepPT(a);
    case 'es': return countryPrepES(a);
    case 'ru': return ' в ';
    default:   return ' in ';
  }
}

/** Returns the preposition for a city name. */
export function getCityPrep(cityName: string, lang: Lang): string {
  switch (lang) {
    case 'pt': return cityPrepPT(cityName);
    case 'es': return ' en ';
    case 'ru': return ' в ';
    default:   return ' in ';
  }
}

function countryPrepPT(alpha2: string): string {
  const na = new Set(['AL','AM','AT','BA','BE','BG','BO','BY','CD','CF','CH','CI','CN','CO',
    'CR','CZ','DE','DK','DO','DZ','EE','ER','ES','ET','FI','FM','FR','GE','GM','GN','GQ',
    'GR','GT','GW','GY','HR','HU','ID','IE','IN','IS','IT','JM','JO','KP','KR','LR','LT',
    'LV','LY','MD','MK','MN','MR','MY','NA','NG','NI','NO','NZ','PG','PL','PS','RO','RS',
    'RU','SA','SE','SI','SK','SL','SO','SY','TH','TN','TR','TZ','UA','VE','ZA','ZM']);
  const no = new Set(['AF','AZ','BH','BI','BJ','BR','BT','BW','CA','CG','CL','CY','EC','EG',
    'GA','GB','HT','IQ','IR','JP','KE','KG','KH','KW','KZ','LA','LB','LK','LS','MA','MC',
    'ME','ML','MM','MW','MX','NE','NP','PA','PE','PK','PY','QA','RW','SD','SN','SR','SS',
    'TD','TG','TJ','TM','UY','UZ','VA','VN','XK','YE','ZW']);
  const nos = new Set(['AE','CM','NL','US']);
  const nas = new Set(['BS','KM','MH','MU','MV','PH','SB','SC']);

  if (na.has(alpha2))  return ' na ';
  if (no.has(alpha2))  return ' no ';
  if (nos.has(alpha2)) return ' nos ';
  if (nas.has(alpha2)) return ' nas ';
  return ' em ';
}

function countryPrepES(alpha2: string): string {
  if (['AE','NL','US'].includes(alpha2)) return ' en los ';
  if (['BS','KM','MH','MV','PH','SB','SC'].includes(alpha2)) return ' en las ';
  return ' en ';
}

function cityPrepPT(cityName: string): string {
  const no = new Set(['Rio de Janeiro','Porto','Cairo','Lagos','Recife','Salvador','Havre','Vaticano']);
  const na = new Set(['Cidade do Cabo']);
  const nas = new Set(['Cataratas do Iguaçu']);
  if (no.has(cityName)) return ' no ';
  if (na.has(cityName)) return ' na ';
  if (nas.has(cityName)) return ' nas ';
  return ' em ';
}
