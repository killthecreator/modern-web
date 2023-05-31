import { ClerkProvider } from "@clerk/nextjs";
import { type AppType } from "next/app";
import Head from "next/head";

import "~/styles/globals.css";

import { Toaster } from "~/components/ui";
import { api } from "~/utils/api";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Toaster />
      <Head>
        <meta name="description" content="Modern Web Tutorial" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
