import { useState } from 'react';
import Head from 'next/head';
import { PricingCard } from '@/components/PricingCard';
import { PRICING_PLANS } from '@/lib/stripe';

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(false);
  const plans = Object.keys(PRICING_PLANS) as Array<keyof typeof PRICING_PLANS>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Planes de Suscripción | Son1k</title>
        <meta name="description" content="Elige el plan que mejor se adapte a tus necesidades" />
      </Head>

      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Elige tu plan perfecto
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Obtén acceso ilimitado a todas las funciones de Son1k
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="flex items-center">
            <span className={`mr-3 text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Mensual
            </span>
            <button
              type="button"
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="switch"
              aria-checked={isYearly}
              onClick={() => setIsYearly(!isYearly)}
            >
              <span
                aria-hidden="true"
                className={`${isYearly ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
            <span className="ml-3">
              <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Anual <span className="text-sm text-green-600">(Ahorra 20%)</span>
              </span>
            </span>
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-3">
          {plans.map((planId, index) => (
            <PricingCard 
              key={planId}
              planId={planId}
              isYearly={isYearly}
              isPopular={planId === 'PRO'}
            />
          ))}
        </div>

        <div className="mt-12 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">¿Necesitas un plan personalizado?</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>¿Tienes necesidades específicas? Contáctanos para crear un plan a tu medida.</p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Contactar ventas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
