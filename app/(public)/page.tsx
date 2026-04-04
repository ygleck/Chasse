import type { Metadata } from 'next';
import { FuelPriceTestDashboard } from '@/components/FuelPriceTestDashboard';

export const metadata: Metadata = {
  title: 'Prix Essence Test | Prototype',
  description:
    "Prototype de page pour simuler le cout d'essence, comparer des scenarios et estimer un budget carburant.",
};

export default function Home() {
  return <FuelPriceTestDashboard />;
}
