import config from '@payload-config';
import { generatePageMetadata, RootPage } from '@payloadcms/next/views';
import type { Metadata } from 'next';

import { importMap } from '../importMap';

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
  const metadata = await generatePageMetadata({ config, params, searchParams });

  // Keep the panel out of search results in every environment
  // (docs/SECURITY.md C9, CP-2.1); robots.txt disallows /admin as well.
  return { ...metadata, robots: { index: false, follow: false } };
};

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams, importMap });

export default Page;
