'use client';

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChefHat, Utensils, Users, Clock, ArrowRight } from "lucide-react";
import { GridBackground } from "@/components/ui/grid-layout";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="relative flex h-[80vh] w-full items-center justify-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,137,51,0.1),transparent_50%)]"></div>

        <div className="relative z-20 text-center space-y-8 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Cook with Passion
          </h1>
          <p className="text-xl md:text-2xl text-gray-600">
            Share your recipes and enjoy their professional execution in restaurants
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/recipes"
              className="group flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-all"
            >
              Browse Recipes
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/restaurants"
              className="group flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white text-orange-500 border-2 border-orange-500 px-8 py-3 rounded-full font-semibold transition-all"
            >
              Find Restaurants
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-16 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<ChefHat className="w-8 h-8" />}
              title="Create Recipes"
              description="Share your culinary masterpieces with the community"
            />
            <FeatureCard
              icon={<Utensils className="w-8 h-8" />}
              title="Restaurants Cook"
              description="Professional chefs bring your recipes to life"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Enjoy"
              description="Order your favorite dishes for delivery or at the restaurant"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard number="1000+" label="Recipes" />
            <StatCard number="50+" label="Restaurants" />
            <StatCard number="5000+" label="Happy Customers" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              Ready to Share Your Recipe?
            </h2>
            <p className="text-lg text-gray-600">
              Join our culinary community and give your recipes a new life
            </p>
            <Link
              href="/recipes/new"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-all"
            >
              Add Recipe
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-orange-100 transition-all hover:scale-105 hover:shadow-xl">
      <div className="mb-6 text-orange-500">{icon}</div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-orange-100 transition-all hover:bg-white hover:shadow-xl">
      <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}
