"use client";

import { Header } from "@/components/layout/Header";
import { AddPlaceForm } from "@/components/forms/AddPlaceForm";

export default function AddPlacePage() {
  return (
    <div>
      <Header />
      <div className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-text-primary mb-6">Add a new place</h1>
        <AddPlaceForm />
      </div>
    </div>
  );
}
