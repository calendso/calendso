import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as Tooltip from "@radix-ui/react-tooltip";
import Image from "next/image";

import classNames from "@lib/classNames";
import { defaultAvatarSrc } from "@lib/profile";

import { Maybe } from "@trpc/server";

export type AvatarProps = {
  className?: string;
  width?: number;
  height?: number;
  size?: number;
  imageSrc?: Maybe<string>;
  title?: string;
  alt: string;
  gravatarFallbackMd5?: string;
};

export default function Avatar(props: AvatarProps) {
  const { imageSrc, gravatarFallbackMd5, size, alt, title, width = 24, height = 24 } = props;
  const className = classNames("rounded-full", props.className, size && `h-${size} w-${size}`);
  const avatar = (
    <AvatarPrimitive.Root>
      <AvatarPrimitive.Image
        src={imageSrc ?? undefined}
        alt={alt}
        className={classNames("rounded-full", `h-auto w-${size}`, props.className)}
      />
      <AvatarPrimitive.Fallback delayMs={600}>
        {gravatarFallbackMd5 && (
          <Image
            src={defaultAvatarSrc({ md5: gravatarFallbackMd5 })}
            alt={alt}
            width={width}
            height={height}
            className={className}
            layout="fixed"
          />
        )}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );

  return title ? (
    <Tooltip.Tooltip delayDuration={300}>
      <Tooltip.TooltipTrigger className="cursor-default">{avatar}</Tooltip.TooltipTrigger>
      <Tooltip.Content className="rounded-sm bg-black p-2 text-sm text-white shadow-sm">
        <Tooltip.Arrow />
        {title}
      </Tooltip.Content>
    </Tooltip.Tooltip>
  ) : (
    <>{avatar}</>
  );
}
