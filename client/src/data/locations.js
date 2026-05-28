export const kenyanLocations = {
  "Nairobi": ["Westlands","Karen","Kilimani","Lavington","Kileleshwa","Parklands","Runda","Muthaiga","Spring Valley","Lang'ata","South C","South B","Embakasi","Kasarani","Ruaka","Donholm","Buruburu","Utawala","Syokimau","Rongai","Upperhill","Hurlingham","Riverside","Loresho","Gigiri","Kahawa West","Roysambu","Zimmerman","Ngara","Ngong Road","Dagoretti","Kitisuru"],
  "Mombasa": ["Nyali","Bamburi","Kisauni","Likoni","Changamwe","Mtwapa","Diani","Shanzu","Mombasa CBD","Tudor","Kizingo"],
  "Kisumu": ["Milimani","Kondele","Mamboleo","Riat Hills","Kisumu CBD","Nyalenda","Migosi","Lolwe","Tom Mboya"],
  "Nakuru": ["Nakuru CBD","Milimani","Langalanga","Lakeview","Pipeline","Bondeni","London","Lanet","Njoro"],
  "Kiambu": ["Thika","Ruiru","Githurai","Juja","Limuru","Kiambu Town","Karuri","Banana","Ridgeways","Tigoni","Kikuyu","Runda Mhasibu"],
  "Kajiado": ["Ngong","Kitengela","Ongata Rongai","Kiserian","Namanga","Kajiado Town","Isinya","Masai"],
  "Machakos": ["Machakos Town","Athi River","Mlolongo","Mavoko","Katani","Syokimau"],
  "Murang'a": ["Murang'a Town","Kenol","Maragua","Kangema","Makuyu"],
  "Nyeri": ["Nyeri Town","Othaya","Karatina","Mukurweini","Tetu"],
  "Meru": ["Meru Town","Nkubu","Timau","Maua","Laare"],
  "Embu": ["Embu Town","Runyenjes","Siakago","Ena"],
  "Uasin Gishu": ["Eldoret","Kapseret","Turbo","Ainabkoi","Kesses"],
  "Nyandarua": ["Ol Kalou","Nyahururu","Engineer","Kinangop"],
  "Laikipia": ["Nanyuki","Nyahururu","Rumuruti","Doldol"],
  "Kwale": ["Ukunda","Diani","Kwale Town","Kinango","Msambweni"],
  "Kilifi": ["Kilifi Town","Malindi","Watamu","Vipingo","Mariakani","Mtwapa"],
  "Taita-Taveta": ["Voi","Wundanyi","Taveta","Mwatate"],
  "Trans Nzoia": ["Kitale","Kiminini","Saboti"],
  "Kericho": ["Kericho Town","Litein","Roret"],
  "Bomet": ["Bomet Town","Longisa","Sotik"],
  "Kisii": ["Kisii Town","Suneka","Ogembo","Masimba"],
  "Migori": ["Migori Town","Awendo","Rongo","Uriri"],
  "Siaya": ["Siaya Town","Bondo","Yala","Ugunja"],
  "Homabay": ["Homa Bay Town","Oyugis","Kendu Bay","Ndhiwa"],
  "Bungoma": ["Bungoma Town","Webuye","Chwele","Kimilili"],
  "Kakamega": ["Kakamega Town","Mumias","Khayega","Butere"],
  "Vihiga": ["Vihiga Town","Mbale","Majengo","Luanda"],
  "Busia": ["Busia Town","Malaba","Port Victoria"],
  "Narok": ["Narok Town","Ololulunga","Kilgoris","Nrok"],
  "Baringo": ["Kabarnet","Eldama Ravine","Marigat","Kampi ya Samaki"],
  "Elgeyo Marakwet": ["Iten","Kapcherop","Chepkorio"],
  "Nandi": ["Kapsabet","Nandi Hills","Mosoriot","Kobujoi"],
  "Samburu": ["Maralal","Baragoi","Wamba"],
  "Turkana": ["Lodwar","Kakuma","Lokichar"],
  "Isiolo": ["Isiolo Town","Merti","Garbatulla"],
  "Tharaka-Nithi": ["Chuka","Marimba","Kathwana"],
  "Kitui": ["Kitui Town","Mutomo","Mwingi","Migwani"],
  "Makueni": ["Wote","Makindu","Sultan Hamud","Emali"],
  "Kirinyaga": ["Kerugoya","Kutus","Sagana","Kagio","Wanguru"],
  "Nyamira": ["Nyamira Town","Keroka","Ekerenyo"],
  "Marsabit": ["Marsabit Town","Moyale","Sololo"],
  "Garissa": ["Garissa Town","Dadaab","Ijara"],
  "Wajir": ["Wajir Town","Habaswein","Buna"],
  "Mandera": ["Mandera Town","Mandera West","Lafey"],
};

export const counties = Object.keys(kenyanLocations).sort();

/** Approximate centre-point coordinates for each county — used for map view */
export const countyCoordinates = {
  'Nairobi':         { lat: -1.2921, lng: 36.8219 },
  'Mombasa':         { lat: -4.0435, lng: 39.6682 },
  'Kisumu':          { lat: -0.0917, lng: 34.7680 },
  'Nakuru':          { lat: -0.3031, lng: 36.0800 },
  'Kiambu':          { lat: -1.0314, lng: 36.8200 },
  'Kajiado':         { lat: -1.8500, lng: 36.7820 },
  'Machakos':        { lat: -1.5177, lng: 37.2634 },
  'Kilifi':          { lat: -3.5100, lng: 39.9100 },
  'Uasin Gishu':     { lat:  0.5143, lng: 35.2698 },
  'Meru':            { lat:  0.0467, lng: 37.6500 },
  'Embu':            { lat: -0.5318, lng: 37.4571 },
  'Nyeri':           { lat: -0.4167, lng: 36.9500 },
  'Kwale':           { lat: -4.1735, lng: 39.4520 },
  'Kirinyaga':       { lat: -0.5580, lng: 37.2634 },
  "Murang'a":        { lat: -0.7229, lng: 37.1527 },
  'Nyandarua':       { lat: -0.1824, lng: 36.3523 },
  'Laikipia':        { lat:  0.3606, lng: 36.7820 },
  'Samburu':         { lat:  1.0748, lng: 37.1000 },
  'Trans Nzoia':     { lat:  1.0166, lng: 35.0100 },
  'Baringo':         { lat:  0.4997, lng: 35.9700 },
  'Elgeyo Marakwet': { lat:  1.0500, lng: 35.5000 },
  'Nandi':           { lat:  0.1830, lng: 35.1400 },
  'Kericho':         { lat: -0.3686, lng: 35.2862 },
  'Bomet':           { lat: -0.7859, lng: 35.3416 },
  'Kakamega':        { lat:  0.2827, lng: 34.7519 },
  'Vihiga':          { lat:  0.0795, lng: 34.7233 },
  'Bungoma':         { lat:  0.5635, lng: 34.5597 },
  'Busia':           { lat:  0.4600, lng: 34.1111 },
  'Siaya':           { lat: -0.0607, lng: 34.2873 },
  'Homabay':         { lat: -0.5270, lng: 34.4571 },
  'Migori':          { lat: -1.0634, lng: 34.4731 },
  'Kisii':           { lat: -0.6817, lng: 34.7660 },
  'Nyamira':         { lat: -0.5668, lng: 34.9357 },
  'Narok':           { lat: -1.0820, lng: 35.8728 },
  'Tharaka-Nithi':   { lat:  0.3000, lng: 37.9000 },
  'Kitui':           { lat: -1.3667, lng: 38.0100 },
  'Makueni':         { lat: -1.8036, lng: 37.6236 },
  'Garissa':         { lat: -0.4532, lng: 39.6460 },
  'Wajir':           { lat:  1.7471, lng: 40.0573 },
  'Mandera':         { lat:  3.9366, lng: 41.8670 },
  'Marsabit':        { lat:  2.3284, lng: 37.9899 },
  'Isiolo':          { lat:  0.3540, lng: 37.5820 },
  'Taita-Taveta':    { lat: -3.3167, lng: 38.4833 },
  'Turkana':         { lat:  3.1167, lng: 35.5960 },
};

export const propertyTypes = ['House','Apartment','Land','Commercial','Bedsitter','Studio','Villa','Townhouse','Maisonette'];

export const amenitiesList = [
  'Parking','Swimming Pool','Gym','Security','Generator','Borehole','CCTV',
  'Garden','Balcony','Servant Quarter','WiFi','Water 24/7','Gated Community',
  'Kids Play Area','Backup Water','Solar','Intercom','Lift/Elevator','Furnished',
];

export function formatPrice(price, period) {
  const formatted = new Intl.NumberFormat('en-KE', { style:'currency', currency:'KES', minimumFractionDigits:0, maximumFractionDigits:0 }).format(price);
  if (period === 'monthly') return `${formatted}/mo`;
  if (period === 'yearly')  return `${formatted}/yr`;
  return formatted;
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7)  return `${d} days ago`;
  if (d < 30) return `${Math.floor(d/7)} weeks ago`;
  return `${Math.floor(d/30)} months ago`;
}
