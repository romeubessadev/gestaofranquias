import { useState } from "react";
import { productImages, type EcomProduct } from "@/data/ecommerce";
import { cn } from "@/lib/cn";

/**
 * Product image with graceful fallback: shows the real photo when it loads,
 * otherwise the original emoji-on-gradient placeholder. `children` (e.g. a
 * status badge) render as an overlay in the top-right.
 */
export function ProductThumb({
  product,
  className,
  rounded,
  children,
}: {
  product: EcomProduct;
  className?: string;
  rounded?: string;
  children?: React.ReactNode;
}) {
  const src = productImages[product.id];
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden text-5xl", rounded, className)}
      style={{ background: product.imgBg }}
    >
      {showImg ? (
        <img
          src={src}
          alt={product.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
          style={{ animation: "velaFade .5s ease both" }}
        />
      ) : (
        <span>{product.emoji}</span>
      )}
      {children && <div className="absolute right-2.5 top-2.5">{children}</div>}
    </div>
  );
}
