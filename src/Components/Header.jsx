import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";


const Header = ({ data }) => {
  if (!data) return null;

  return (
    <header className="w-full bg-[#FAF8F5] border-b border-[#E8E1D5]">

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">

        <div className="flex items-center justify-center gap-5 md:gap-6">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src={logo}
              alt="College Logo"
              className="w-16 md:w-20 h-auto object-contain"
            />
          </Link>

          {/* Text Content */}
          <div className="text-center">

            {/* College Name */}
            <h1
              className="
                text-[#233044]
                text-2xl
                md:text-[3.2rem]
                leading-none
                tracking-wide
                font-normal
                font-[Jaini_Purva]
              "
            >
              {data.title}
            </h1>

            {/* Subtitle */}
            {data.subtitle && (
              <p
                className="
                  mt-2
                  text-[#9A7B4F]
                  md:text-[19px]
                  text-sm
                  md:text-base
                  tracking-[0.08em]
                  font-medium
                "
              >
                {data.subtitle}
              </p>
            )}

            {/* Tagline */}
            {data.tagline && (
              <p
                className="
                  mt-1.5
                  text-[#6B7280]
                  text-[10px]
                  md:text-[12px]
                  uppercase
                  tracking-[0.22em]
                  font-normal
                "
              >
                {data.tagline}
              </p>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;