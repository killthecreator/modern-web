import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-[100svh] justify-center md:h-screen ">
      <div className="grid w-full grid-rows-[auto_1fr] overflow-hidden md:max-w-2xl">
        {props.children}
      </div>
    </main>
  );
};
