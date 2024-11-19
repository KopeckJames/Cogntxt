import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const PricingPlans = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Pricing Plans</h2>
        <p className="text-muted-foreground mt-2">Choose the perfect plan for your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Starter', 'Pro', 'Enterprise'].map((plan) => (
          <Card key={plan}>
            <CardHeader>
              <CardTitle>{plan}</CardTitle>
              <CardDescription>
                {plan === 'Starter' && 'Perfect for getting started'}
                {plan === 'Pro' && 'Best for professionals'}
                {plan === 'Enterprise' && 'For large organizations'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                {plan === 'Starter' && '$9'}
                {plan === 'Pro' && '$29'}
                {plan === 'Enterprise' && 'Custom'}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    <span>Feature {i}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                {plan === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PricingPlans;