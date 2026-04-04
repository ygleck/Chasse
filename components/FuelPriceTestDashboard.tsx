'use client';

import { useState } from 'react';

const currencyFormatter = new Intl.NumberFormat('fr-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 2,
});

const oneDecimalFormatter = new Intl.NumberFormat('fr-CA', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const scenarioPresets = [
  {
    label: 'Baisse moderee',
    delta: -0.12,
    note: 'Si le prix recule apres une promo locale.',
    accent: 'from-emerald-400/20 to-emerald-200/10',
    border: 'border-emerald-300/30',
    text: 'text-emerald-100',
  },
  {
    label: 'Reference',
    delta: 0,
    note: 'Ton prix de base pour le test actuel.',
    accent: 'from-white/10 to-white/10',
    border: 'border-white/15',
    text: 'text-white',
  },
  {
    label: 'Hausse rapide',
    delta: 0.18,
    note: 'Si le prix remonte pendant une fin de semaine.',
    accent: 'from-rose-400/20 to-orange-300/10',
    border: 'border-rose-200/30',
    text: 'text-rose-100',
  },
];

function toCurrency(value: number) {
  return currencyFormatter.format(value);
}

function toDecimal(value: number) {
  return oneDecimalFormatter.format(value);
}

function toPositiveNumber(value: string) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.max(parsedValue, 0);
}

type InputFieldProps = {
  label: string;
  hint: string;
  step: string;
  value: number;
  onChange: (value: number) => void;
};

function InputField({ label, hint, step, value, onChange }: InputFieldProps) {
  return (
    <label className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
      <span className="block text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
        {label}
      </span>
      <input
        type="number"
        step={step}
        min="0"
        value={value}
        onChange={(event) => onChange(toPositiveNumber(event.target.value))}
        className="mt-3 w-full border-0 bg-transparent p-0 text-3xl font-semibold text-white outline-none"
      />
      <span className="mt-2 block text-sm text-slate-400">{hint}</span>
    </label>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-heading text-white md:text-5xl">{value}</p>
      <p className="mt-3 text-sm text-slate-300">{detail}</p>
    </div>
  );
}

export function FuelPriceTestDashboard() {
  const [pricePerLitre, setPricePerLitre] = useState(1.74);
  const [tankSize, setTankSize] = useState(58);
  const [weeklyDistance, setWeeklyDistance] = useState(340);
  const [consumptionPer100Km, setConsumptionPer100Km] = useState(8.4);
  const [monthlyBudget, setMonthlyBudget] = useState(320);

  const weeklyLitres = (weeklyDistance / 100) * consumptionPer100Km;
  const fullTankCost = tankSize * pricePerLitre;
  const weeklyCost = weeklyLitres * pricePerLitre;
  const monthlyCost = weeklyCost * 4.33;
  const annualCost = weeklyCost * 52;
  const budgetGap = monthlyBudget - monthlyCost;
  const budgetFriendlyPrice = weeklyLitres === 0 ? 0 : monthlyBudget / (weeklyLitres * 4.33);

  return (
    <main
      className="min-h-screen overflow-hidden bg-slate-950 text-white"
      style={{
        backgroundImage:
          'radial-gradient(circle at top left, rgba(251, 191, 36, 0.16), transparent 28%), radial-gradient(circle at top right, rgba(249, 115, 22, 0.18), transparent 24%), linear-gradient(180deg, #020617 0%, #0f172a 52%, #111827 100%)',
      }}
    >
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-10 md:px-10 lg:px-12 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[36px] border border-white/10 bg-white/10 p-8 shadow-[0_30px_120px_rgba(2,6,23,0.45)] backdrop-blur md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.36em] text-amber-300">
              Prototype autonome
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-heading leading-none text-white md:text-7xl">
              TEST PRIX
              <br />
              D&apos;ESSENCE
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Cette branche sert maintenant a tester un concept distinct du site de chasse.
              Ajuste le prix, la consommation et la distance pour voir l&apos;impact reel sur
              le plein, le mois et l&apos;annee.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-amber-100">Prix courant</p>
                <p className="mt-3 text-3xl font-heading text-white">{toCurrency(pricePerLitre)}</p>
                <p className="mt-2 text-sm text-amber-50/80">{toDecimal(pricePerLitre * 100)} c/L</p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Volume hebdo</p>
                <p className="mt-3 text-3xl font-heading text-white">{toDecimal(weeklyLitres)} L</p>
                <p className="mt-2 text-sm text-slate-400">Selon ton usage entre dans les champs plus bas.</p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Budget cible</p>
                <p className="mt-3 text-3xl font-heading text-white">{toCurrency(monthlyBudget)}</p>
                <p className="mt-2 text-sm text-slate-400">Point de repere pour tes scenarios mensuels.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-white/10 bg-slate-950/55 p-8 shadow-[0_30px_120px_rgba(2,6,23,0.45)] md:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Reglages
                </p>
                <h2 className="mt-3 text-3xl font-heading text-white md:text-4xl">
                  Parametres du test
                </h2>
              </div>
              <div className="rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
                CAD
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              <InputField
                label="Prix au litre"
                hint="Exemple: 1.74 CAD par litre"
                step="0.01"
                value={pricePerLitre}
                onChange={setPricePerLitre}
              />
              <InputField
                label="Taille du reservoir"
                hint="Capacite du plein complet en litres"
                step="1"
                value={tankSize}
                onChange={setTankSize}
              />
              <InputField
                label="Distance par semaine"
                hint="Kilometres parcourus chaque semaine"
                step="10"
                value={weeklyDistance}
                onChange={setWeeklyDistance}
              />
              <InputField
                label="Consommation"
                hint="Litres aux 100 km"
                step="0.1"
                value={consumptionPer100Km}
                onChange={setConsumptionPer100Km}
              />
              <InputField
                label="Budget mensuel"
                hint="Montant maximal vise pour le carburant"
                step="10"
                value={monthlyBudget}
                onChange={setMonthlyBudget}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Cout d'un plein"
            value={toCurrency(fullTankCost)}
            detail="Montant estime pour remplir le reservoir selon le prix courant."
          />
          <MetricCard
            label="Depense hebdo"
            value={toCurrency(weeklyCost)}
            detail="Projection basee sur la distance et la consommation hebdomadaires."
          />
          <MetricCard
            label="Projection mensuelle"
            value={toCurrency(monthlyCost)}
            detail="Calculee sur 4.33 semaines pour approcher un mois moyen."
          />
          <MetricCard
            label="Projection annuelle"
            value={toCurrency(annualCost)}
            detail="Utile pour comparer rapidement l'impact a plus long terme."
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[36px] border border-white/10 bg-white/10 p-8 backdrop-blur md:p-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Scenarios
                </p>
                <h2 className="mt-2 text-3xl font-heading text-white md:text-4xl">
                  Variation du prix
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-slate-300">
                Trois lectures rapides pour voir comment une baisse ou une hausse du marche
                change ton budget mensuel.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {scenarioPresets.map((scenario) => {
                const scenarioPrice = Math.max(pricePerLitre + scenario.delta, 0);
                const scenarioMonthlyCost = scenarioPrice * weeklyLitres * 4.33;
                const scenarioDelta = scenarioMonthlyCost - monthlyCost;

                return (
                  <div
                    key={scenario.label}
                    className={`rounded-[28px] border bg-gradient-to-b p-6 ${scenario.accent} ${scenario.border}`}
                  >
                    <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${scenario.text}`}>
                      {scenario.label}
                    </p>
                    <p className="mt-4 text-4xl font-heading text-white">
                      {toCurrency(scenarioPrice)}
                    </p>
                    <p className="mt-3 text-sm text-slate-300">{scenario.note}</p>
                    <div className="mt-6 rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                        Impact mensuel
                      </p>
                      <p className="mt-2 text-2xl font-heading text-white">
                        {toCurrency(scenarioMonthlyCost)}
                      </p>
                      <p
                        className={`mt-2 text-sm ${
                          scenarioDelta < 0 ? 'text-emerald-200' : scenarioDelta > 0 ? 'text-rose-200' : 'text-slate-300'
                        }`}
                      >
                        {scenarioDelta === 0
                          ? 'Aucun ecart par rapport au test courant.'
                          : `${scenarioDelta > 0 ? '+' : ''}${toCurrency(scenarioDelta)} sur le mois.`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[36px] border border-white/10 bg-slate-950/60 p-8 shadow-[0_30px_120px_rgba(2,6,23,0.4)] md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Lecture budget
            </p>
            <h2 className="mt-2 text-3xl font-heading text-white md:text-4xl">
              Zone de decision
            </h2>

            <div className="mt-8 space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-white/10 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Prix max viable</p>
                <p className="mt-3 text-5xl font-heading text-white">{toCurrency(budgetFriendlyPrice)}</p>
                <p className="mt-3 text-sm text-slate-300">
                  Prix moyen maximum au litre pour rester dans ton budget mensuel cible.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/10 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Ecart budgetaire</p>
                <p
                  className={`mt-3 text-5xl font-heading ${
                    budgetGap >= 0 ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {budgetGap >= 0 ? '+' : ''}
                  {toCurrency(budgetGap)}
                </p>
                <p className="mt-3 text-sm text-slate-300">
                  {budgetGap >= 0
                    ? 'Le test reste sous le budget vise.'
                    : "Le scenario actuel depasse le budget mensuel fixe."}
                </p>
              </div>

              <div className="rounded-[28px] border border-amber-300/20 bg-amber-400/10 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-amber-100">Note de test</p>
                <p className="mt-3 text-base leading-7 text-amber-50/90">
                  Les valeurs ici sont manuelles. Si tu veux, la prochaine etape peut etre de
                  brancher cette page sur une vraie source de prix ou sur un formulaire qui
                  enregistre plusieurs villes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
