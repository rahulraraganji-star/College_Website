import logo from '../assets/logo.png'

import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaWhatsapp,
} from "react-icons/fa6";

const SOCIALS = [
  { name: "Facebook", icon: FaFacebookF, href: "#" },
  { name: "Instagram", icon: FaInstagram, href: "#" },
  { name: "X (Twitter)", icon: FaXTwitter, href: "#" },


  { name: "WhatsApp", icon: FaWhatsapp, href: "#" },



];

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer({
  brand = "Fr Agnel College Of Arts And Commerce",
  description = "Building careers with trusted education, mentors, and industry-ready programs.",
  addressLines = ["Fr. Agnel College of Arts and Commerce, Pilar – Goa, 403203"],
  phone = "+91-832 2218673",
  email = "principal@fragnelcollege.edu.in",
  mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3845.83479382316!2d73.89128527575181!3d15.439465455988042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbfb91f3b3cbe97%3A0x65e264ebe64eb633!2sFr.%20Agnel%20College%20of%20Arts%20and%20Commerce!5e0!3m2!1sen!2sin!4v1766812210625!5m2!1sen!2sin",
}) {
  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">

          {/* Brand + contact */}
          <div className="lg:col-span-4">
           <div className="flex items-center gap-3">
  <img
  src="df"
  alt={`logo`}
  className="h-12 w-auto object-contain"
/>


  <div>
    <div className="text-lg font-semibold tracking-tight text-white">
      {brand}
    </div>
    <div className="text-xs text-slate-400">
      Learn. Build. Grow.
    </div>
  </div>
</div>


            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
              {description}
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div>
                <div className="font-medium text-slate-200">Address</div>
                <div className="mt-1 text-slate-400">
                  {addressLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="hover:text-white"
                >
                  {phone}
                </a>
                <a
                  href={`mailto:${email}`}
                  className="hover:text-white"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-3">
            <div className="text-sm font-semibold text-white">Quick Links</div>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {["About", "Programs", "Admissions", "Placements", "Contact"].map(
                (item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white">
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <div className="text-sm font-semibold text-white">Support</div>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {["Help Center", "Terms", "Privacy", "Refund Policy"].map(
                (item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white">
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Map + socials */}
          <div className="lg:col-span-3">
            <div className="text-sm font-semibold text-white">Visit us</div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {mapEmbedUrl ? (
                <iframe
                  title="Location map"
                  aria-label="Institute location on map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3845.83479382316!2d73.89128527575181!3d15.439465455988042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbfb91f3b3cbe97%3A0x65e264ebe64eb633!2sFr.%20Agnel%20College%20of%20Arts%20and%20Commerce!5e0!3m2!1sen!2sin!4v1766812210625!5m2!1sen!2sin"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-44 w-full"
                />
              ) : (
                <div className="flex h-44 items-center justify-center px-6 text-center text-sm text-slate-400">
                  
                 
                </div>
              )}
            </div>

            <div className="mt-5 text-sm font-semibold text-white">
              Social media
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {SOCIALS.map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex h-10 w-10 items-center justify-center
                    rounded-xl border border-white/10 bg-white/5
                    text-slate-200 transition
                    hover:-translate-y-0.5 hover:bg-white/10 hover:text-white
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-amber-500 focus-visible:ring-offset-2
                    focus-visible:ring-offset-slate-950
                  "
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-400">
            © {CURRENT_YEAR} {brand}. All rights reserved.
          </div>
          <div className="text-sm text-slate-400">
           

          </div>
        </div>
      </div>
    </footer>
  );
}
