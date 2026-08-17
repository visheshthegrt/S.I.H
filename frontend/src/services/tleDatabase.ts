import { SatelliteRecord } from '../types/satellite';

export const SATELLITE_CATALOG: SatelliteRecord[] = [
  // --- SPACE STATIONS ---
  {
    id: '25544',
    noradId: 25544,
    name: 'ISS (ZARYA)',
    category: 'station',
    country: 'International',
    launchYear: 1998,
    orbitType: 'LEO',
    inclinationDeg: 51.64,
    periodMinutes: 92.9,
    apogeeKm: 420,
    perigeeKm: 413,
    description: 'International Space Station - humanity’s microgravity laboratory in Low Earth Orbit.',
    tle: {
      line1: '1 25544U 98067A   26042.54823819  .00014322  00000+0  25641-3 0  9993',
      line2: '2 25544  51.6416 195.4321 0004812 110.2314 250.1245 15.49812345582314'
    }
  },
  {
    id: '48274',
    noradId: 48274,
    name: 'CSS (TIANGONG)',
    category: 'station',
    country: 'China',
    launchYear: 2021,
    orbitType: 'LEO',
    inclinationDeg: 41.47,
    periodMinutes: 91.8,
    apogeeKm: 390,
    perigeeKm: 384,
    description: 'Chinese Space Station Tiangong modular space station.',
    tle: {
      line1: '1 48274U 21035A   26042.41284912  .00018241  00000+0  21045-3 0  9991',
      line2: '2 48274  41.4721 142.1892 0003184  85.4219 274.8192 15.5891245214812'
    }
  },
  {
    id: '20580',
    noradId: 20580,
    name: 'HUBBLE SPACE TELESCOPE',
    category: 'science',
    country: 'USA / NASA',
    launchYear: 1990,
    orbitType: 'LEO',
    inclinationDeg: 28.47,
    periodMinutes: 95.4,
    apogeeKm: 538,
    perigeeKm: 532,
    description: 'Iconic space observatory providing deep space astronomy imagery since 1990.',
    tle: {
      line1: '1 20580U 90037B   26042.31298412  .00001284  00000+0  65412-4 0  9992',
      line2: '2 20580  28.4682 245.1984 0002814 290.1824  69.8124 15.0921849182341'
    }
  },

  // --- EARTH OBSERVATION & SCIENCE ---
  {
    id: '49260',
    noradId: 49260,
    name: 'LANDSAT 9',
    category: 'science',
    country: 'USA / USGS',
    launchYear: 2021,
    orbitType: 'LEO',
    inclinationDeg: 98.2,
    periodMinutes: 98.8,
    apogeeKm: 708,
    perigeeKm: 704,
    description: 'Earth observation satellite collecting multispectral land surface imagery.',
    tle: {
      line1: '1 49260U 21088A   26042.20184912  .00000124  00000+0  21849-4 0  9995',
      line2: '2 49260  98.2045  78.1924 0001482  92.1849 268.0192 14.571829418241'
    }
  },
  {
    id: '40019',
    noradId: 40019,
    name: 'SENTINEL 2A',
    category: 'science',
    country: 'ESA',
    launchYear: 2015,
    orbitType: 'LEO',
    inclinationDeg: 98.62,
    periodMinutes: 100.6,
    apogeeKm: 786,
    perigeeKm: 786,
    description: 'European Copernicus high-resolution optical imaging satellite.',
    tle: {
      line1: '1 40019U 15028A   26042.18492014  .00000095  00000+0  19284-4 0  9998',
      line2: '2 40019  98.6214  42.1982 0001192 120.4812 239.6912 14.308291418294'
    }
  },
  {
    id: '41866',
    noradId: 41866,
    name: 'GOES 16 (EAST)',
    category: 'science',
    country: 'USA / NOAA',
    launchYear: 2016,
    orbitType: 'GEO',
    inclinationDeg: 0.03,
    periodMinutes: 1436.1,
    apogeeKm: 35792,
    perigeeKm: 35780,
    description: 'Geostationary Operational Environmental Satellite monitoring weather over Americas.',
    tle: {
      line1: '1 41866U 16071A   26042.50192841 -.00000182  00000+0  00000+0 0  9990',
      line2: '2 41866   0.0312 280.1982 0001829  45.1924 315.8291  1.0027184918274'
    }
  },
  {
    id: '43226',
    noradId: 43226,
    name: 'GOES 18 (WEST)',
    category: 'science',
    country: 'USA / NOAA',
    launchYear: 2022,
    orbitType: 'GEO',
    inclinationDeg: 0.05,
    periodMinutes: 1436.1,
    apogeeKm: 35796,
    perigeeKm: 35782,
    description: 'NOAA weather satellite stationed over Pacific Ocean monitoring atmosphere.',
    tle: {
      line1: '1 43226U 22021A   26042.51294812 -.00000150  00000+0  00000+0 0  9994',
      line2: '2 43226   0.0521 190.4182 0001924  62.1849 298.1924  1.0027284918294'
    }
  },
  {
    id: '25994',
    noradId: 25994,
    name: 'TERRA (EOS AM-1)',
    category: 'science',
    country: 'USA / NASA',
    launchYear: 1999,
    orbitType: 'LEO',
    inclinationDeg: 98.2,
    periodMinutes: 98.9,
    apogeeKm: 705,
    perigeeKm: 705,
    description: 'NASA flagship climate observation satellite monitoring biosphere & oceans.',
    tle: {
      line1: '1 25994U 99068A   26042.19284102  .00000218  00000+0  31824-4 0  9996',
      line2: '2 25994  98.2104 112.4182 0001284 105.4192 254.8192 14.561928418294'
    }
  },

  // --- GPS & NAVIGATION CONSTELLATION ---
  {
    id: '39741',
    noradId: 39741,
    name: 'GPS IIF-6 (NAVSTAR 70)',
    category: 'gps',
    country: 'USA / USSF',
    launchYear: 2014,
    orbitType: 'MEO',
    inclinationDeg: 55.08,
    periodMinutes: 717.9,
    apogeeKm: 20202,
    perigeeKm: 20170,
    description: 'Medium Earth Orbit Global Positioning System satellite.',
    tle: {
      line1: '1 39741U 14026A   26042.48291042  .00000042  00000+0  00000+0 0  9997',
      line2: '2 39741  55.0841 125.4182 0009182  78.1924 282.1924  2.0056192841829'
    }
  },
  {
    id: '40105',
    noradId: 40105,
    name: 'GPS IIF-7 (NAVSTAR 71)',
    category: 'gps',
    country: 'USA / USSF',
    launchYear: 2014,
    orbitType: 'MEO',
    inclinationDeg: 54.98,
    periodMinutes: 717.9,
    apogeeKm: 20195,
    perigeeKm: 20178,
    description: 'GPS Block IIF atomic clock navigation satellite.',
    tle: {
      line1: '1 40105U 14045A   26042.49201942  .00000038  00000+0  00000+0 0  9991',
      line2: '2 40105  54.9812 185.1924 0008419 142.1829 218.4912  2.0056291841829'
    }
  },
  {
    id: '43873',
    noradId: 43873,
    name: 'GPS III-SV01 (VESPUCCI)',
    category: 'gps',
    country: 'USA / USSF',
    launchYear: 2018,
    orbitType: 'MEO',
    inclinationDeg: 55.15,
    periodMinutes: 717.9,
    apogeeKm: 20210,
    perigeeKm: 20180,
    description: 'Next-generation GPS III satellite providing 3x accuracy and anti-jamming.',
    tle: {
      line1: '1 43873U 18109A   26042.47192841  .00000045  00000+0  00000+0 0  9993',
      line2: '2 43873  55.1524 245.8192 0007812 190.4182 169.8192  2.0056381948192'
    }
  },
  {
    id: '41174',
    noradId: 41174,
    name: 'GALILEO 12 (GSAT0209)',
    category: 'gps',
    country: 'EU / ESA',
    launchYear: 2015,
    orbitType: 'MEO',
    inclinationDeg: 56.04,
    periodMinutes: 844.4,
    apogeeKm: 23225,
    perigeeKm: 23218,
    description: 'European civilian satellite navigation constellation member.',
    tle: {
      line1: '1 41174U 15079B   26042.45192841  .00000012  00000+0  00000+0 0  9999',
      line2: '2 41174  56.0412 310.1824 0002184  42.1982 317.8192  1.7047182941829'
    }
  },

  // --- GEOSTATIONARY SATELLITES ---
  {
    id: '39086',
    noradId: 39086,
    name: 'INMARSAT 5-F1',
    category: 'geostationary',
    country: 'United Kingdom',
    launchYear: 2013,
    orbitType: 'GEO',
    inclinationDeg: 0.08,
    periodMinutes: 1436.1,
    apogeeKm: 35790,
    perigeeKm: 35784,
    description: 'Global Xpress Ka-band broadband satellite over Indian Ocean.',
    tle: {
      line1: '1 39086U 12075A   26042.52184912 -.00000140  00000+0  00000+0 0  9992',
      line2: '2 39086   0.0812  62.4182 0001492  12.1849 347.8192  1.0027192841829'
    }
  },
  {
    id: '40733',
    noradId: 40733,
    name: 'INTELSAT 34',
    category: 'geostationary',
    country: 'Multinational',
    launchYear: 2015,
    orbitType: 'GEO',
    inclinationDeg: 0.04,
    periodMinutes: 1436.1,
    apogeeKm: 35794,
    perigeeKm: 35782,
    description: 'Geostationary telecommunications satellite servicing Latin America & North Atlantic.',
    tle: {
      line1: '1 40733U 15040B   26042.53184912 -.00000160  00000+0  00000+0 0  9995',
      line2: '2 40733   0.0412 305.4182 0001824  88.1924 271.8192  1.0027291841829'
    }
  },

  // --- SPACE DEBRIS ---
  {
    id: '22675',
    noradId: 22675,
    name: 'SL-16 R/B (DEBRIS)',
    category: 'debris',
    country: 'Russia',
    launchYear: 1993,
    orbitType: 'LEO',
    inclinationDeg: 71.02,
    periodMinutes: 101.4,
    apogeeKm: 850,
    perigeeKm: 820,
    description: 'Spent Zenit-2 rocket upper stage orbiting as space junk.',
    tle: {
      line1: '1 22675U 93016B   26042.28491024  .00000841  00000+0  14819-3 0  9998',
      line2: '2 22675  71.0214 168.4192 0021849 140.1824 220.1924 14.201829418294'
    }
  },
  {
    id: '33445',
    noradId: 33445,
    name: 'COSMOS 2251 DEBRIS',
    category: 'debris',
    country: 'Russia',
    launchYear: 1993,
    orbitType: 'LEO',
    inclinationDeg: 74.04,
    periodMinutes: 100.1,
    apogeeKm: 790,
    perigeeKm: 750,
    description: 'Tracked fragment from the 2009 Iridium-Cosmos satellite collision.',
    tle: {
      line1: '1 33445U 93036KC  26042.29481924  .00001429  00000+0  21849-3 0  9994',
      line2: '2 33445  74.0419 210.4182 0028194  98.1829 262.1924 14.381928418294'
    }
  }
];

// Generate synthetic Starlink Constellation entries (50 satellites in orbital shells)
const STARLINK_SHELLS = [
  { inc: 53.0, alt: 550 },
  { inc: 53.2, alt: 540 },
  { inc: 70.0, alt: 570 }
];

export const generateStarlinkConstellation = (): SatelliteRecord[] => {
  const list: SatelliteRecord[] = [];
  let noradStart = 50001;

  for (let s = 0; s < STARLINK_SHELLS.length; s++) {
    const shell = STARLINK_SHELLS[s];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const raan = (360 / count) * i + s * 30;
      const meanMotion = 15.06; // ~95 min period
      const norad = noradStart++;
      const name = `STARLINK-${norad}`;
      
      // Synthesize realistic TLE format
      const line1 = `1 ${norad}U 21${String(s * 20 + i).padStart(3, '0')}A   26042.40000000  .00010000  00000+0  10000-3 0  9990`;
      const incStr = shell.inc.toFixed(4).padStart(7, ' ');
      const raanStr = (raan % 360).toFixed(4).padStart(8, ' ');
      const mmStr = meanMotion.toFixed(8).padStart(11, ' ');
      const line2 = `2 ${norad} ${incStr} ${raanStr} 0001000  90.0000 270.0000 ${mmStr}12345`;

      list.push({
        id: String(norad),
        noradId: norad,
        name,
        category: 'starlink',
        country: 'USA / SpaceX',
        launchYear: 2021 + (s % 4),
        orbitType: 'LEO',
        inclinationDeg: shell.inc,
        periodMinutes: 95.2,
        apogeeKm: shell.alt + 5,
        perigeeKm: shell.alt - 5,
        description: 'Starlink broadband internet constellation satellite in Low Earth Orbit shell.',
        tle: { line1, line2 }
      });
    }
  }

  return list;
};

// Combine full database catalog
export const FULL_SATELLITE_CATALOG: SatelliteRecord[] = [
  ...SATELLITE_CATALOG,
  ...generateStarlinkConstellation()
];
