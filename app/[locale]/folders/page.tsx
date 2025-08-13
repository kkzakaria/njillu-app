import { redirect } from 'next/navigation';

export default function Page() {
  // Redirect to active folders by default
  redirect('/folders/active');
}