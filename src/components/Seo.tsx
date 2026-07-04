import { Helmet } from "react-helmet-async";

const SITE_URL = "https://allengradeassist.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/lovable-uploads/d644e2ea-e597-4168-bff4-35ee20a31995.png`;

interface SeoProps {
  title: string;
  description: string;
  /** Path only, e.g. "/pricing". Used for canonical + og:url. */
  path: string;
  image?: string;
  /** Optional JSON-LD object rendered into the head. */
  jsonLd?: Record<string, unknown>;
}

/**
 * Per-route document head. react-helmet-async lets each page override the
 * static tags in index.html so every marketing route has its own title,
 * description, and canonical for search + social.
 */
const Seo = ({ title, description, path, image = DEFAULT_OG_IMAGE, jsonLd }: SeoProps) => {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default Seo;
