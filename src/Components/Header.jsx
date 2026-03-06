import logo from '../assets/logo.png'

const Header = () => {
  return (
    <header className="bg-white border-y-4 border-black">
      <div className="max-w-7xl mx-auto flex items-center gap-2 px-70 py-4">
        
        {/* Logo */}
        <img
          src= {logo}
          alt="Fr Agnel College Logo"
          className="w-20 h-auto -mt-3  "
        />

        {/* Centered Text */}
        <div className="flex-1 text-center">
          {/* Main heading — Playfair Display Regular */}
          <h1 className="text-2xl md:text-3xl font-Playfair font-serif text-black leading-tight">
            Fr.Agnel College Of Arts & Commerce
          </h1>

          {/* Sub texts — Inter Regular */}
          <p className="text-base font-Inter font-sans-serif text-black mt-1">
            Affiliated to Goa University
          </p>

          <p className="text-sm font-Inter font-sans-serif text-black tracking-wide mt-1 uppercase">
            Accredited by NAAC with Grade ‘A+’ (CGPA of 3.28)
          </p>
        </div>

      </div>
    </header>
  );
};

export default Header;
