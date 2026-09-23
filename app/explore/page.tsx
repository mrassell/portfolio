import type { Metadata } from 'next';
import ExploreClient from './ExploreClient';

export const metadata: Metadata = {
  title: "Explore - Maheen's World",
  description: "Walk around a 3D world to explore Maheen Rassell's experience, projects, and hackathon wins.",
};

export default function ExplorePage() {
  return <ExploreClient />;
}
