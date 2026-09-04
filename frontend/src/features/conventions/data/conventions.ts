import type { Convention } from '../types';

export const CONVENTIONS: Convention[] = [
  {
    id: 'awa',
    name: 'Anime Weekend Atlanta',
    slug: 'awa',
    venue: 'Hyatt Regency Atlanta',
    city: 'Atlanta',
    country: 'USA',
    startsAt: '2026-10-01',
    endsAt: '2026-10-04',
    websiteUrl: 'https://awa-con.com',
    description:
      'One of the largest anime conventions on the East Coast, with panels, concerts, and a massive exhibit hall.',
    status: 'active',
  },
  {
    id: 'anime-fest-dallas',
    name: 'Anime Fest Dallas',
    slug: 'anime-fest-dallas',
    venue: 'Sheraton Dallas Hotel',
    city: 'Dallas',
    country: 'USA',
    startsAt: '2026-10-16',
    endsAt: '2026-10-18',
    websiteUrl: 'https://animefestdallas.com',
    description:
      'A convention focused on anime, gaming, and Japanese culture with cosplay events and industry guests.',
    status: 'active',
  },
  {
    id: 'anime-los-angeles',
    name: 'Anime Los Angeles',
    slug: 'anime-los-angeles',
    venue: 'Ontario Convention Center',
    city: 'Los Angeles',
    country: 'USA',
    startsAt: '2027-01-08',
    endsAt: '2027-01-10',
    websiteUrl: 'https://animelosangeles.org',
    description:
      'A welcoming convention for anime fans of all ages, featuring guests, panels, and a family-friendly floor.',
    status: 'upcoming',
  },
  {
    id: 'katsucon',
    name: 'Katsucon',
    slug: 'katsucon',
    venue: 'Gaylord National Resort',
    city: 'National Harbor',
    country: 'USA',
    startsAt: '2027-02-19',
    endsAt: '2027-02-21',
    websiteUrl: 'https://www.katsucon.org',
    description:
      'Held at the stunning Gaylord National Resort, known for its indoor atriums and cosplay photography.',
    status: 'upcoming',
  },
  {
    id: 'sakura-con',
    name: 'Sakura-Con',
    slug: 'sakura-con',
    venue: 'Seattle Convention Center',
    city: 'Seattle',
    country: 'USA',
    startsAt: '2027-03-26',
    endsAt: '2027-03-28',
    websiteUrl: 'https://sakuracon.org',
    description:
      'The Pacific Northwest\u2019s largest anime convention, with concerts, industry panels, and an artist alley.',
    status: 'upcoming',
  },
];
