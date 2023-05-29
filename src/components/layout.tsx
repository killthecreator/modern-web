import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen justify-center ">
      <div className="relative h-screen w-full overflow-hidden md:max-w-2xl">
        {props.children}
      </div>
    </main>
  );
};
