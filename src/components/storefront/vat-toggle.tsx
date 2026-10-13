'use client';

import React from 'react';
import { TactileVatRocker, TactileVatRockerProps } from './tactile-vat-rocker';

export interface VatToggleProps extends TactileVatRockerProps {}

export function VatToggle(props: VatToggleProps) {
  return <TactileVatRocker {...props} />;
}
