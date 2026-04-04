import PrixEssenceApp from "@/components/PrixEssenceApp";

export const metadata = {
  title: "Prix Essence Québec | Trouver les meilleures stations",
  description: "Trouvez les meilleures stations essence à proximité en recherchant les prix les plus bas et la distance optimale. Données en temps réel de l'Ordre des ingénieurs du Québec.",
};

export default function PrixEssencePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ⛽ Prix Essence Québec
          </h1>
          <p className="text-lg text-gray-600">
            Trouvez les meilleures stations par prix et proximité
          </p>
        </div>
        <PrixEssenceApp />
      </div>
    </main>
  );
}
