import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaWhatsapp,
} from "react-icons/fa6";

const iconMap = {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaWhatsapp,
};

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer({ data }) {

  if (!data) return null;

  return (
    <footer className="bg-slate-950 text-slate-200">

      <div className="mx-auto max-w-6xl px-4 py-14">

        <div className="grid gap-10 lg:grid-cols-12">

          {/* BRAND */}
          <div className="lg:col-span-4">

            <div className="flex items-center gap-3">
            {/*  <img
                src={data.logo}
                alt="logo"
                className="h-12 w-auto"
              /> */}

              <div>
                <div className="text-lg font-semibold text-white">
                  {data.brand}
                </div>

                <div className="text-xs text-slate-400">
                  {data.tagline}
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-300">
              {data.description}
            </p>

            <div className="mt-6 text-sm">

              {data.addressLines?.map((line, i) => (
                <div key={i}>{line}</div>
              ))}

              <div className="mt-3 flex gap-4">
                <a href={`tel:${data.phone}`}>{data.phone}</a>
                <a href={`mailto:${data.email}`}>{data.email}</a>
              </div>

            </div>

          </div>

          {/* QUICK LINKS */}
          <div className="lg:col-span-3">
            <div className="text-white font-semibold">Quick Links</div>

            <ul className="mt-4 space-y-2">
              {data.quickLinks?.map((link, i) => (
                <li key={i}>
                  <a href={link.url}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* SUPPORT */}
          <div className="lg:col-span-2">
            <div className="text-white font-semibold">Support</div>

            <ul className="mt-4 space-y-2">
              {data.supportLinks?.map((link, i) => (
                <li key={i}>
                  <a href={link.url}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* MAP + SOCIAL */}
          <div className="lg:col-span-3">

            <iframe
              src={data.mapEmbedUrl}
              className="w-full h-40"
              loading="lazy"
            />

            <div className="mt-4 flex gap-2">

              {data.socials?.map((s, i) => {
                const Icon = iconMap[s.icon];

                return (
                  <a key={i} href={s.url}>
                    {Icon && <Icon />}
                  </a>
                );
              })}

            </div>

          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-10 text-sm text-slate-400">
          Â© {CURRENT_YEAR} {data.brand}
        </div>

      </div>
    </footer>
  );
}
