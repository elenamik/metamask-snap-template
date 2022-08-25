import type { NextPage } from "next";
import Head from "next/head";
import * as React from "react";
import AvatarSnap from "../components/AvatarSnap";

const Home: NextPage = () => {
  return (
    <div className="flex w-full flex-col items-center p-2">
      <Head>
        <title>Avatar Snap Demo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-fit flex-col content-center justify-center p-4">
        <h1 className="pt-20 text-4xl font-semibold">
          Welcome to the Avatar Snap Demo!
        </h1>

        <p className="pt-2">
          Get started by enabling the snap, if you have not done so already.
          <br />
          To change your image, click the edit button.
        </p>

        <h2 className="flex w-full flex-col content-center justify-center pt-10">
          <div className="w-fit text-3xl font-semibold">Demo</div>
          <div className="w-fit rounded-2xl border p-4">
            <AvatarSnap />
          </div>
        </h2>
      </main>
    </div>
  );
};

export default Home;
