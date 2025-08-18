export const SIERRA_LEONE_DISTRICTS = [
  "Western Area Urban", // Freetown
  "Western Area Rural",
  "Northern Province",
  "Bombali",
  "Kambia", 
  "Koinadugu",
  "Port Loko",
  "Tonkolili",
  "Southern Province",
  "Bo",
  "Bonthe",
  "Moyamba",
  "Pujehun",
  "Eastern Province",
  "Kailahun",
  "Kenema",
  "Kono"
] as const;

export type SierraLeoneDistrict = typeof SIERRA_LEONE_DISTRICTS[number];

export const DISTRICT_CITIES: Record<SierraLeoneDistrict, string[]> = {
  "Western Area Urban": ["Freetown"],
  "Western Area Rural": ["Waterloo", "Lumley", "Hastings"],
  "Northern Province": [],
  "Bombali": ["Makeni", "Magburaka"],
  "Kambia": ["Kambia", "Rokupr"],
  "Koinadugu": ["Kabala", "Yifin"],
  "Port Loko": ["Port Loko", "Lungi"],
  "Tonkolili": ["Magburaka", "Mile 91"],
  "Southern Province": [],
  "Bo": ["Bo", "Kakua"],
  "Bonthe": ["Bonthe", "Mattru Jong"],
  "Moyamba": ["Moyamba", "Rotifunk"],
  "Pujehun": ["Pujehun", "Potoru"],
  "Eastern Province": [],
  "Kailahun": ["Kailahun", "Koidu"],
  "Kenema": ["Kenema", "Blama"],
  "Kono": ["Koidu", "Yengema"]
};

export function getDefaultCityForDistrict(district: SierraLeoneDistrict): string {
  const cities = DISTRICT_CITIES[district];
  return cities.length > 0 ? cities[0] : "";
}

export function formatCurrency(amount: number): string {
  return `Le ${amount.toLocaleString()}`;
} 