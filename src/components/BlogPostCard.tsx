import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import { formatDate, readingTimeMinutes } from "@/lib/format";
import { IMG_BLUR } from "@/lib/image";

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="card group block overflow-hidden">
      {post.hero_image && (
        <div className="relative aspect-[16/9] overflow-hidden bg-sand-deep">
          <Image
            src={post.hero_image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL={IMG_BLUR}
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        </div>
      )}
      <div className="p-5">
        <p className="text-[12px] font-bold tracking-wide text-accent uppercase">
          {post.category ?? "Conseils"}
        </p>
        <h2 className="mt-2 line-clamp-2 text-[16px] leading-snug font-bold text-ink group-hover:text-primary">
          {post.title}
        </h2>
        <p className="mt-3 text-[12.5px] text-ink/50">
          {post.published_at ? formatDate(post.published_at) : ""} ·{" "}
          {readingTimeMinutes(post.body_md)} min
        </p>
      </div>
    </Link>
  );
}
