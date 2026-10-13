import React from 'react';
import Link from 'next/link';
import { OrderTimelineStepper } from '@/components/storefront/order-timeline-stepper';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-tc-text-secondary">
        <Link href="/account" className="hover:text-tc-ink flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Account Orders</span>
        </Link>
        <span>/</span>
        <span className="text-tc-ink font-semibold">Order #{params.id}</span>
      </div>

      <div className="border-b border-tc-border pb-4">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink">
          Order #{params.id} Fulfillment Tracking
        </h1>
        <p className="text-xs text-tc-text-secondary mt-1">
          Real-time supplier order state machine monitoring and audit log trail.
        </p>
      </div>

      <OrderTimelineStepper orderId={params.id} />
    </div>
  );
}
