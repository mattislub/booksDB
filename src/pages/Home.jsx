import React from 'react';
import PromoBoxes from '../components/PromoBoxes';
import { NewOnSite } from '../components/NewOnSite';
import { NewInMarket } from '../components/NewInMarket';
import Catalog from '../components/Catalog';

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PromoBoxes />
      </div>

      <NewOnSite />
      <NewInMarket />
      <Catalog />
    </div>
  );
}
