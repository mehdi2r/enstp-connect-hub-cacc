import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function BackLink() {
  return (
    <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
      <ArrowLeft className="h-4 w-4" /> Retour au guide
    </Link>
  );
}
