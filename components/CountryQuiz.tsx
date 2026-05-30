import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Lang } from '@/types';
import type { QuizCountry, TripType } from '@/lib/quiz-data';

interface CountryQuizProps {
  lang: Lang;
  t: Record<string, string>;
  countries: QuizCountry[];
}

type Step = 'intro' | 'season' | 'type' | 'results';

interface SeasonOption {
  key: string;
  icon: string;
  months: number[];
  labelKey: string;
}

interface TypeOption {
  key: TripType;
  icon: string;
  labelKey: string;
}

const SEASON_OPTIONS: SeasonOption[] = [
  { key: 'spring', icon: '🌸', months: [3, 4, 5],    labelKey: 'quiz.spring' },
  { key: 'summer', icon: '☀️', months: [6, 7, 8],    labelKey: 'quiz.summer' },
  { key: 'autumn', icon: '🍂', months: [9, 10, 11],  labelKey: 'quiz.autumn' },
  { key: 'winter', icon: '❄️', months: [12, 1, 2],   labelKey: 'quiz.winter' },
];

const TYPE_OPTIONS: TypeOption[] = [
  { key: 'beach',     icon: '🏖️', labelKey: 'quiz.type_beach' },
  { key: 'culture',   icon: '🏛️', labelKey: 'quiz.type_culture' },
  { key: 'nature',    icon: '🌿', labelKey: 'quiz.type_nature' },
  { key: 'adventure', icon: '⛰️', labelKey: 'quiz.type_adventure' },
  { key: 'history',   icon: '🏺', labelKey: 'quiz.type_history' },
];

function matchCountries(
  countries: QuizCountry[],
  seasonMonths: number[],
  type: TripType,
): QuizCountry[] {
  return countries
    .filter(c => c.tags.includes(type) && c.bestMonths.length > 0)
    .map(c => {
      const overlap = c.bestMonths.filter(m => seasonMonths.includes(m)).length;
      // Proportional score: overlap relative to how many best months the country has.
      // A country with 3/4 best months in winter scores higher than one with 1/8.
      const score = overlap / c.bestMonths.length;
      return { ...c, score, overlap };
    })
    .filter(c => c.overlap > 0)          // only genuine season matches
    .sort((a, b) => b.score - a.score)   // best proportional fit first
    .slice(0, 6);
}

export default function CountryQuiz({ lang, t, countries }: CountryQuizProps) {
  const [step, setStep] = useState<Step>('intro');
  const [selectedSeason, setSelectedSeason] = useState<SeasonOption | null>(null);
  const [results, setResults] = useState<QuizCountry[]>([]);
  const [animating, setAnimating] = useState(false);

  const tr = (key: string, fallback: string) => t[key] ?? fallback;

  const advance = useCallback((nextStep: Step) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setAnimating(false);
    }, 220);
  }, []);

  const pickSeason = useCallback((option: SeasonOption) => {
    setSelectedSeason(option);
    advance('type');
  }, [advance]);

  const pickType = useCallback((type: TripType) => {
    if (!selectedSeason) return;
    const matched = matchCountries(countries, selectedSeason.months, type);
    setResults(matched);
    advance('results');
  }, [selectedSeason, countries, advance]);

  const reset = useCallback(() => {
    advance('intro');
    setTimeout(() => {
      setSelectedSeason(null);
      setResults([]);
    }, 220);
  }, [advance]);

  return (
    <section className="quiz-section">
      <div className="container">

        <div className={`quiz-stage${animating ? ' quiz-fade-out' : ' quiz-fade-in'}`}>

          {/* ── Intro ── */}
          {step === 'intro' && (
            <div className="quiz-intro">
              <div className="quiz-badge">{tr('quiz.badge', '✦ Travel Quiz')}</div>
              <h2 className="quiz-heading">
                {tr('quiz.heading1', 'Find Your Perfect')}
                <br />
                <strong>{tr('quiz.heading2', 'Next Destination')}</strong>
              </h2>
              <p className="quiz-subheading">
                {tr('quiz.subheading', 'Two quick questions. Dozens of possibilities.')}
              </p>
              <button className="quiz-start-btn" onClick={() => advance('season')}>
                {tr('quiz.start', 'Start the quiz')} <span>→</span>
              </button>
            </div>
          )}

          {/* ── Season ── */}
          {step === 'season' && (
            <div className="quiz-step">
              <div className="quiz-progress">
                <span className="quiz-progress-dot active" />
                <span className="quiz-progress-dot" />
              </div>
              <p className="quiz-step-label">{tr('quiz.step', 'Step')} 1 / 2</p>
              <h2 className="quiz-question">{tr('quiz.q1', 'When do you want to travel?')}</h2>
              <div className="quiz-options quiz-options--4">
                {SEASON_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    className="quiz-option"
                    onClick={() => pickSeason(opt)}
                  >
                    <span className="quiz-option-icon">{opt.icon}</span>
                    <span className="quiz-option-label">{tr(opt.labelKey, opt.key)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Type ── */}
          {step === 'type' && (
            <div className="quiz-step">
              <div className="quiz-progress">
                <span className="quiz-progress-dot active" />
                <span className="quiz-progress-dot active" />
              </div>
              <p className="quiz-step-label">{tr('quiz.step', 'Step')} 2 / 2</p>
              <h2 className="quiz-question">{tr('quiz.q2', 'What kind of trip are you dreaming of?')}</h2>
              <div className="quiz-options quiz-options--5">
                {TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    className="quiz-option"
                    onClick={() => pickType(opt.key)}
                  >
                    <span className="quiz-option-icon">{opt.icon}</span>
                    <span className="quiz-option-label">{tr(opt.labelKey, opt.key)}</span>
                  </button>
                ))}
              </div>
              <button className="quiz-back-btn" onClick={() => advance('season')}>
                ← {tr('quiz.back', 'Back')}
              </button>
            </div>
          )}

          {/* ── Results ── */}
          {step === 'results' && (
            <div className="quiz-results">
              <h2 className="quiz-results-heading">
                {tr('quiz.results_heading', 'Your perfect destinations')}
              </h2>
              <p className="quiz-results-sub">
                {tr('quiz.results_sub', 'Based on your travel style, we think you\'ll love these.')}
              </p>

              {results.length > 0 ? (
                <div className="quiz-cards">
                  {results.map(c => (
                    <Link
                      key={c.identifier}
                      href={`/${lang}/${c.identifier}`}
                      className="quiz-card"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://ik.imagekit.io/bwvxkqzwak0rq/tr:w-400,h-280,fo-auto/static/img/gallery/${c.alpha2.toLowerCase()}.jpg`}
                        alt={c.name}
                        loading="lazy"
                      />
                      <div className="quiz-card-overlay">
                        <span className="quiz-card-name">{c.name}</span>
                        <span className="quiz-card-cta">{tr('quiz.explore', 'Explore')} →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="quiz-no-results">{tr('quiz.no_results', 'No matches found — try different options.')}</p>
              )}

              <button className="quiz-retry-btn" onClick={reset}>
                ↺ {tr('quiz.retry', 'Try again')}
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
