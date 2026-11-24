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
    {/* CP-2.2: no staff page renders without a verified second factor. */}
    <Suspense fallback={null}>
      <TOTPGuard config={config} forceSetup>
        <TOTPGate>{children}</TOTPGate>
      </TOTPGuard>
    </Suspense>
  </RootLayout>
);

export default Layout;
