import React from 'react';
import PromoBoxes from '../components/PromoBoxes';
import { NewOnSite } from '../components/NewOnSite';
import { NewInMarket } from '../components/NewInMarket';

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-3xl mb-4">ברוכים הבאים לספרי קודש תלפיות</h1>
        <p>חנות מקוונת למבחר ספרי קודש איכותיים.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PromoBoxes />
      </div>

      <NewOnSite />
      <NewInMarket />
    </div>
  );
}
