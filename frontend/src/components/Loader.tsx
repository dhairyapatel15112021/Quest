import clsx from "clsx";

interface LoaderProps {
  className?: string;
}

export const Loader = ({ className }: LoaderProps) => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <span
        className={clsx(
          "loading loading-spinner loading-md text-[#00704A]",
          className
        )}
      ></span>
    </div>
  );
};
