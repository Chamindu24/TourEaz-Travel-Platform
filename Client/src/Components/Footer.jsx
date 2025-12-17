import React, { useState } from "react";
import { Link } from "react-router-dom";
import MagicButton from "./ui/MagicButton";

// Color palette
const palette = {
  platinum: "#E7E9E5",
  ash_gray: "#B7C5C7",
  lapis_lazuli: "#005E84",
  indigo_dye: "#075375",
  indigo_dye2: "#0A435C",
};

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    // simple validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setStatus("Please enter a valid email address.");
      return;
    }
    // simulate subscribe
    setStatus("Thanks for subscribing!");
    setEmail("");
    setTimeout(() => setStatus(""), 3000);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer
      className="py-8 sm:py-10"
      style={{
        background: `linear-gradient(180deg, #ffffff 0%, #f7fafc 100%)`,
        color: palette.lapis_lazuli,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Column 1 - Brand */}
          <div className="flex flex-col gap-3 order-1">
            <div className="flex items-start gap-3">
              <img className="h-16 sm:h-20 md:h-24 w-auto hover:scale-105 transition-transform duration-700" src="/logo12.png" alt="TourEaz logo" />
              <div className="mt-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-widest" style={{ color: palette.lapis_lazuli }}>TourEaz</h2>
                <p className="text-xs sm:text-sm" style={{ color: palette.indigo_dye2 }}>Explore, Experience, Enjoy</p>
              </div>
            </div>
            <p className="text-sm sm:text-base" style={{ color: palette.indigo_dye }}>Discover curated travel experiences for your dream vacations.</p>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="order-3 sm:order-2">
            <h3 className="text-lg font-bold mb-4" style={{ color: palette.indigo_dye2 }}>Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" onClick={scrollToTop} className="hover:underline transition-colors" style={{ color: palette.lapis_lazuli }}>Home</Link></li>
              <li><Link to="/login" onClick={scrollToTop} className="hover:underline transition-colors" style={{ color: palette.lapis_lazuli }}>Login</Link></li>
              <li><Link to="/register" onClick={scrollToTop} className="hover:underline transition-colors" style={{ color: palette.lapis_lazuli }}>Register</Link></li>
              <li><Link to="/about" onClick={scrollToTop} className="hover:underline transition-colors" style={{ color: palette.lapis_lazuli }}>About</Link></li>
            </ul>
          </div>

          {/* Column 3 - Contact & Social */}
          <div className="order-2 sm:order-3">
            <h3 className="text-lg font-bold mb-4" style={{ color: palette.indigo_dye2 }}>Contact</h3>
            <ul className="space-y-3 text-sm" style={{ color: palette.indigo_dye }}>
              <li className="flex items-center gap-2"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg> info@dummy.com</li>
              <li className="flex items-center gap-2"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg> +960 778-1048</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="#" aria-label="Facebook" className="text-blue-700 hover:scale-110 transform transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 rounded">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-pink-500 hover:scale-110 transform transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300 rounded">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-sky-500 hover:scale-110 transform transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-300 rounded">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.844"/></svg>
              </a>
            </div>
          </div>

          {/* Column 4 - Newsletter */}
          <div className="order-4 sm:order-4">
            <h3 className="text-lg font-bold mb-4" style={{ color: palette.indigo_dye2 }}>Newsletter</h3>
            <p className="text-sm mb-3" style={{ color: palette.indigo_dye }}>Get travel tips and special offers — no spam.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="email" className="sr-only">Email</label>
              <input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="px-3 py-1 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <MagicButton
                text="Subscribe"
                type="submit"
                className="px-2 py-2 rounded-md w-full 
                          bg-teal-500 text-white
                          hover:bg-white hover:text-black hover:ring-1 hover:ring-teal-500
                          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              />

            </form>
            {status && <p className="mt-2 text-sm text-green-600" role="status" aria-live="polite">{status}</p>}
          </div>
        </div>

        <div className="mt-6 border-t pt-4 text-center" style={{ borderColor: palette.ash_gray, color: palette.indigo_dye2 }}>
          <p className="text-sm sm:text-base">© {new Date().getFullYear()} TourEaz | Developed by <a href="https://lushware.org/" target="_blank" rel="noopener noreferrer" style={{ color: palette.lapis_lazuli, textDecoration: "underline" }}><span className="font-bold">LushWare Org</span></a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
