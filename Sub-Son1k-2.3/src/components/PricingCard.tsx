import React from 'react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { PRICING_PLANS } from '@/lib/stripe';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

type PlanId = keyof typeof PRICING_PLANS;

interface PricingCardProps {
  planId: PlanId;
  isYearly?: boolean;
  isPopular?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  planId,
  isYearly = false,
  isPopular = false,
}) => {
  const plan = PRICING_PLANS[planId];
  const { handleCheckout, isLoading } = useStripeCheckout();
  
  if (!plan) return null;

  const price = isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price;
  const priceSuffix = plan.price === 0 ? '' : isYearly ? '/año' : '/mes';
  const buttonText = planId === 'FREE' ? 'Comenzar gratis' : 'Suscríbete ahora';

  return (
    <div className={`relative flex flex-col p-6 bg-white rounded-lg border border-gray-200 shadow-sm ${isPopular ? 'ring-2 ring-blue-500' : ''}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
          Más popular
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
      
      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-extrabold text-gray-900">
          ${price.toFixed(2)}
        </span>
        <span className="ml-1 text-lg text-gray-500">{priceSuffix}</span>
      </div>
      
      <p className="mt-4 text-sm text-gray-500">
        {plan.features[0]}
      </p>
      
      <ul className="mt-6 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" aria-hidden="true" />
            <span className="ml-2 text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      <div className="mt-8">
        <button
          type="button"
          onClick={() => handleCheckout(planId, isYearly ? 'yearly' : 'monthly')}
          disabled={isLoading || planId === 'FREE'}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            planId === 'FREE'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isLoading ? 'Procesando...' : buttonText}
        </button>
      </div>
    </div>
  );
};
