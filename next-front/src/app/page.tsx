import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full">
        <Image
          src="/hero.jpg"
          alt="Delicious food"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="mb-6 text-center text-5xl font-bold md:text-6xl">
            Share Your Culinary Magic
          </h1>
          <p className="mb-8 text-center text-xl md:text-2xl">
            A platform for food lovers to share and discover amazing recipes, cook it, and buy it!
          </p>
          <Link
            href="/recipes"
            className="rounded-full bg-orange-500 px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-orange-600"
          >
            Explore Recipes
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Share Your Recipes?</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              title="Share Your Passion"
              description="Share your favorite recipes with food lovers around the world"
              icon="👨‍🍳"
            />
            <FeatureCard
              title="Get Inspired"
              description="Discover new recipes and cooking techniques from other chefs"
              icon="💡"
            />
            <FeatureCard
              title="Build Community"
              description="Connect with other food enthusiasts and share your culinary journey"
              icon="🤝"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-50 py-16 text-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">Ready to Share Your Recipe?</h2>
          <p className="mb-8 text-lg text-gray-600">
            Join our community of food lovers and share your culinary creations
          </p>
          <Link
            href="/recipes/new"
            className="inline-block rounded-full bg-orange-500 px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-orange-600"
          >
            Add Your Recipe
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-lg bg-white p-6 text-center shadow-lg transition-all hover:shadow-xl text-black">
      <div className="mb-4 text-4xl text-black">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
