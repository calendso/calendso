import { classNames } from "@calcom/lib";

export const Spinner = ({ className }: { className?: string }) => (
  <div
    className={classNames(
      "fixed left-[calc(50%+calc(var(--booker-meta-width,0px)/2))] top-1/2 z-[80] h-10 w-10 -translate-x-1/2 -translate-y-1/2",
      className
    )}>
    <svg className="h-10 w-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        className="fill-default"
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
        opacity=".25"
      />
      <path
        className="animate-spinning fill-emphasis origin-center"
        d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
      />
    </svg>
  </div>
);
