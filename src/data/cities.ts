import type { CityConfig } from "../types";

export const cityConfigs: CityConfig[] = [
  {
    id: "warsaw",
    label: "Warszawa",
    origins: [
      { label: "Rondo Daszynskiego", lat: 52.2301, lng: 20.9846 },
      { label: "Plac Zawiszy", lat: 52.2243, lng: 20.9902 },
      { label: "Dworzec Centralny", lat: 52.2297, lng: 21.0036 }
    ],
    businessDestinations: [
      { label: "Mordor, Domaniewska", lat: 52.1799, lng: 21.0013 },
      { label: "Warsaw Spire", lat: 52.2326, lng: 20.9849 },
      { label: "Rondo ONZ", lat: 52.2322, lng: 20.9988 },
      { label: "Browary Warszawskie", lat: 52.2339, lng: 20.9858 },
      { label: "Plac Europejski", lat: 52.2327, lng: 20.9833 },
      { label: "Blue City", lat: 52.2194, lng: 20.9573 },
      { label: "Westfield Arkadia", lat: 52.2561, lng: 20.9845 },
      { label: "Galeria Mokotow", lat: 52.1804, lng: 20.9873 },
      { label: "Poleczki Business Park", lat: 52.1608, lng: 20.9843 },
      { label: "Wola Center", lat: 52.2328, lng: 20.9699 }
    ],
    residentialDestinations: [
      { label: "Bialoleka, Glebocka", lat: 52.3219, lng: 21.0518 },
      { label: "Ursynow, Komisji Edukacji", lat: 52.1495, lng: 21.0451 },
      { label: "Wilanow, Aleja Rzeczypospolitej", lat: 52.1621, lng: 21.0825 },
      { label: "Bemowo, Powstancow Slaskich", lat: 52.2409, lng: 20.9148 },
      { label: "Tarchomin, Swiatowida", lat: 52.3111, lng: 20.9996 },
      { label: "Saska Kepa, Francuska", lat: 52.2331, lng: 21.0596 },
      { label: "Zoliborz, Rydygiera", lat: 52.2648, lng: 20.9824 },
      { label: "Wlochy, Popularna", lat: 52.2051, lng: 20.9223 },
      { label: "Praga Poludnie, Grochowska", lat: 52.2482, lng: 21.0892 },
      { label: "Ursus, Skoroszewska", lat: 52.1951, lng: 20.8836 }
    ]
  },
  {
    id: "wroclaw",
    label: "Wroclaw",
    origins: [
      { label: "Rynek", lat: 51.1098, lng: 17.0327 },
      { label: "Plac Grunwaldzki", lat: 51.1113, lng: 17.0605 },
      { label: "Dworzec Glowny", lat: 51.0981, lng: 17.0364 }
    ],
    businessDestinations: [
      { label: "Bielany Wroclawskie", lat: 51.0362, lng: 16.9678 },
      { label: "Wroclaw Business Garden", lat: 51.1349, lng: 16.9921 },
      { label: "Sky Tower", lat: 51.0968, lng: 17.0197 },
      { label: "Magnolia Park", lat: 51.1188, lng: 16.9861 },
      { label: "Wroclaw Airport", lat: 51.1027, lng: 16.8858 },
      { label: "Aleja Bielany", lat: 51.0324, lng: 16.9642 },
      { label: "Green2Day", lat: 51.1083, lng: 17.0548 },
      { label: "Business Stadium", lat: 51.1412, lng: 16.9413 },
      { label: "Quorum", lat: 51.1124, lng: 17.0133 },
      { label: "Renoma", lat: 51.1043, lng: 17.0314 }
    ],
    residentialDestinations: [
      { label: "Jagodno", lat: 51.0637, lng: 17.0832 },
      { label: "Psie Pole", lat: 51.1452, lng: 17.1222 },
      { label: "Lesnica", lat: 51.1424, lng: 16.8662 },
      { label: "Oltaszyn", lat: 51.0518, lng: 17.0017 },
      { label: "Popowice", lat: 51.1248, lng: 16.9976 },
      { label: "Karlowice", lat: 51.1378, lng: 17.0485 },
      { label: "Klecina", lat: 51.0647, lng: 16.9802 },
      { label: "Swojczyce", lat: 51.1297, lng: 17.1239 },
      { label: "Brochow", lat: 51.0809, lng: 17.0803 },
      { label: "Nowy Dwor", lat: 51.1114, lng: 16.9447 }
    ]
  }
];
