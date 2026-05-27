import type { GetStaticProps } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Root / → redirect to /en
export default function RootRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/en'); }, [router]);
  return null;
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};
