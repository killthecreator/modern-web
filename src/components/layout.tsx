import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen justify-center ">
      <div className="flex w-full flex-col px-3 md:max-w-2xl md:px-0">
        {props.children}
      </div>
    </main>
  );
};
