import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, Users, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-16 pb-32">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between mb-16">
            <div className="text-2xl font-bold">GCT CoachHelper</div>
            <div className="flex items-center gap-4">
              <Link href="/pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link href="/demo">
                <Button variant="ghost">Demo</Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Start Free Trial</Button>
              </Link>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transform Your Coaching Practice with{' '}
              <span className="text-primary">Scientific Precision</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              White-label coaching platform powered by Grounded Coherence Theory. 
              Track real transformation, predict breakthroughs, and scale your impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Start 14-Day Free Trial <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Scale Your Coaching Business
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Scientific Measurement"
              description="Track client progress with mathematical precision using four-dimensional coherence scores"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="White-Label Platform"
              description="Your brand, your domain, your client experience. Fully customizable coaching portal"
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Real-Time Monitoring"
              description="Live coherence tracking with color-coded triage system for immediate intervention"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Enterprise Security"
              description="HIPAA-ready infrastructure with OAuth authentication and encrypted data storage"
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Choose Your Plan
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="$49"
              features={[
                '10 Clients',
                'Basic Coherence Tracking',
                'Standard Assessments',
                'Email Support',
              ]}
            />
            <PricingCard
              name="Professional"
              price="$149"
              featured
              features={[
                '50 Clients',
                'Advanced Analytics',
                'Custom Domain',
                'Web Store',
                'Chrome Extension',
                'Priority Support',
              ]}
            />
            <PricingCard
              name="Enterprise"
              price="$499"
              features={[
                'Unlimited Clients',
                'Multi-Coach Support',
                'Custom Integrations',
                'Dedicated Support',
                'SLA Guarantee',
              ]}
            />
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
    <div className="p-6 rounded-lg border bg-card">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  features,
  featured = false,
}: {
  name: string;
  price: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        'p-8 rounded-lg border',
        featured && 'border-primary shadow-lg scale-105'
      )}
    >
      {featured && (
        <div className="text-center text-primary font-semibold mb-4">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <div className="text-3xl font-bold mb-6">
        {price}<span className="text-lg text-muted-foreground">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/signup" className="block">
        <Button className="w-full" variant={featured ? 'default' : 'outline'}>
          Start Free Trial
        </Button>
      </Link>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}