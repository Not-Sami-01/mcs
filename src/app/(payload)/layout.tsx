import { TOTPGate, TOTPGuard } from '@purposeinplay/payload-totp/guard';
import config from '@payload-config';
import '@payloadcms/next/css';
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts';
import type { ServerFunctionClient } from 'payload';
import React, { Suspense } from 'react';

import { importMap } from './admin/importMap.js';
import './custom.scss';

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  'use server';
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {/* Enrolled accounts must verify; unenrolled accounts are not redirected
        to setup because two-factor is optional (2026-11-24). */}
    <Suspense fallback={null}>
      <TOTPGuard config={config} forceSetup={false}>
        <TOTPGate>{children}</TOTPGate>
      </TOTPGuard>
    </Suspense>
  </RootLayout>
);

export default Layout;
