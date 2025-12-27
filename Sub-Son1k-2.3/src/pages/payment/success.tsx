import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function PaymentSuccess() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { session_id } = router.query;

  useEffect(() => {
    if (router.isReady) {
      if (session_id === 'mock') {
        // Handle mock payment
        setIsLoading(false);
        return;
      }

      // In a real app, you would verify the payment with your backend here
      const verifyPayment = async () => {
        try {
          // Replace with your actual API endpoint
          const response = await fetch('/api/stripe/verify-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId: session_id }),
          });

          if (!response.ok) {
            throw new Error('Error verifying payment');
          }

          setIsLoading(false);
        } catch (error) {
          console.error('Error verifying payment:', error);
          setIsError(true);
          setIsLoading(false);
        }
      };

      if (session_id) {
        verifyPayment();
      } else {
        setIsError(true);
        setIsLoading(false);
      }
    }
  }, [router.isReady, session_id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-900">Verificando tu pago...</p>
          <p className="mt-2 text-sm text-gray-500">Esto puede tomar unos segundos.</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="rounded-full bg-red-100 p-4 mx-auto">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Error en el pago
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hubo un problema al procesar tu pago. Por favor, intenta nuevamente o contacta a soporte si el problema persiste.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/pricing')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver a planes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Pago exitoso | Son1k</title>
      </Head>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              ¡Pago exitoso!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Gracias por tu compra. Tu suscripción ha sido activada exitosamente.
            </p>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900">Detalles de la compra</h3>
            <dl className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">ID de transacción</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {session_id === 'mock' ? 'MOCK-PAYMENT' : (session_id as string).substring(0, 8) + '...'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Fecha</dt>
                <dd className="text-sm text-gray-900">
                  {new Date().toLocaleDateString()}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">Total pagado</dt>
                <dd className="text-base font-medium text-gray-900">
                  ${'9.99'} USD
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-500 text-center">
              Te hemos enviado un correo electrónico con los detalles de tu compra.
            </p>
            <div className="mt-6">
              <a
                href="/dashboard"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ir al panel de control
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// This function gets called at build time
export async function getStaticProps() {
  return {
    props: {}, // will be passed to the page component as props
  };
}
