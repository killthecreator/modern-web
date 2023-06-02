import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

import { Button, Input } from "~/components/ui";

const PostSearcher = ({ inputVal = "" }: { inputVal?: string }) => {
  type SearchFormData = { search: string };
  const { register, handleSubmit } = useForm<SearchFormData>();
  const router = useRouter();

  const onSubmit = async ({ search }: SearchFormData) => {
    await router.push({ pathname: "search", query: { result: search } });
  };

  return (
    <form
      className="flex w-full items-center gap-3 p-3 shadow sm:p-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        defaultValue={inputVal}
        {...register("search")}
        placeholder="Search for posts"
      />
      <Button type="submit">Search</Button>
    </form>
  );
};

export default PostSearcher;
