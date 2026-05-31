/**
 * AgodaHotels — fetches hotel listings client-side so they don't slow
 * down static generation and are always fresh.
 */
import { useEffect, useState } from 'react';

interface Hotel {
  hotelId: number;
  hotelName: string;
  starRating: number;
  reviewScore: number;
  reviewScoreText: string;
  dailyRate: number;
  imageURL: string;
  landingURL: string;
  cityName?: string;
  countryName?: string;
}

interface Props {
  cityId: number;
  cityName: string;
  countryName: string;
  label: string; // "Best Places To Stay in {city}"
}

const AGODA_AUTH = process.env.NEXT_PUBLIC_AGODA_AUTH ?? '';

function reviewLabel(score: number): string {
  if (score >= 9) return 'Exceptional';
  if (score >= 8) return 'Excellent';
  if (score >= 7) return 'Very Good';
  if (score >= 6) return 'Good';
  return 'Review Score';
}

export default function AgodaHotels({ cityId, cityName, countryName, label }: Props) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cityId) return;

    const checkIn  = new Date(); checkIn.setMonth(checkIn.getMonth() + 1);
    const checkOut = new Date(checkIn); checkOut.setDate(checkOut.getDate() + 2);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    const body = JSON.stringify({
      criteria: {
        additional: {
          currency: 'USD', dailyRate: { maximum: 10000, minimum: 1 },
          discountOnly: false, language: 'en-us', maxResult: 3,
          minimumReviewScore: 0, minimumStarRating: 0,
          occupancy: { numberOfAdult: 2, numberOfChildren: 0 },
          sortBy: 'Recommended',
        },
        checkInDate:  fmt(checkIn),
        checkOutDate: fmt(checkOut),
        cityId,
      },
    });

    fetch('http://affiliateapi7643.agoda.com/affiliateservice/lt_v1', {
      method: 'POST',
      headers: { Authorization: AGODA_AUTH, 'Content-Type': 'application/json' },
      body,
    })
      .then(r => r.json())
      .then(data => {
        const results: Hotel[] = (data.results ?? []).map((h: Record<string, unknown>) => ({
          hotelId:         h.hotelId,
          hotelName:       h.hotelName,
          starRating:      (h.starRating as number) * 10,
          reviewScore:     h.reviewScore,
          reviewScoreText: reviewLabel(h.reviewScore as number),
          dailyRate:       Math.round((h.dailyRate as number) * 100) / 100,
          imageURL: ((h.imageURL as string) ?? '')
            .replace('http://pix6.agoda.net', 'https://ik.imagekit.io/bwvxkqzwak0rq')
            .replace('?s=800x600', '/tr:w-252?v=2'),
          landingURL:  h.landingURL as string,
          cityName,
          countryName,
        }));
        setHotels(results);
      })
      .catch(() => {/* silently fail — Agoda is non-critical */})
      .finally(() => setLoading(false));
  }, [cityId, cityName, countryName]);

  if (loading || hotels.length === 0) return null;

  return (
    <div>
      <h2 className="main_title">{label}</h2>
      <div className="hotels-list">
        {hotels.map(h => (
          <div key={h.hotelId} className="hotel-item">
            <a href={h.landingURL} target="_blank" rel="nofollow noreferrer">
              <div className="background-c">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" src={h.imageURL} height={168} width={252} alt={`${h.hotelName} - ${h.cityName}`} />
              </div>
              <div className="content-c">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  className="logo-c"
                  src="https://ik.imagekit.io/bwvxkqzwak0rq/images/mvc/default/agoda-logo.svg?v=2"
                  alt="Agoda hotels"
                />
                <div className="hotel-name">{h.hotelName}</div>
                <div className="rating-location-c">
                  <i className={`rating-c ficon ficon-star-${h.starRating} orange-yellow`} />
                  <div className="location-c">
                    <i className="ficon ficon-pin-star" />
                    <span className="location">{h.cityName}, {h.countryName}</span>
                  </div>
                </div>
                <div className="rating-offer-c">
                  <span className="rating-text">{h.reviewScoreText}</span>
                  <span className="rating-value">{h.reviewScore}</span>
                </div>
                <div className="price-c">${h.dailyRate}</div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
