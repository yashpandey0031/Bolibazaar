import { Link } from "react-router";
import { useSelector } from "react-redux";

const appFooterLinks = {
  Platform: [
    { label: "Browse Auctions", to: "/auction" },
    { label: "How It Works", to: "/about" },
    { label: "Credit Plans", to: "/signup" },
    { label: "Contact Us", to: "/contact" },
  ],
  Legal: [
    { label: "Terms of Service", to: "/legal/terms-of-service" },
    { label: "Privacy Policy", to: "/legal/privacy-policy" },
    { label: "DMCA Policy", to: "/legal/dmca" },
    { label: "Code of Conduct", to: "/legal/code-of-conduct" },
  ],
  Company: [
    { label: "About बोली बाज़ार", to: "/about" },
    { label: "Acceptable Use", to: "/legal/acceptable-use-policy" },
    { label: "Legal Hub", to: "/legal" },
  ],
};

const guestFooterLinks = {
  Company: [
    { label: "About बोली बाज़ार", to: "/about" },
    { label: "Careers", to: "/about" },
    { label: "Reviews", to: "/about" },
  ],
  Winning: [
    { label: "How Auctions Work", to: "/about" },
    { label: "Auction Calendar", to: "/auction" },
    { label: "Auctions Near Me", to: "/auction" },
    { label: "Auction Price Results", to: "/auction" },
  ],
  Selling: [
    { label: "Seller Sign-In", to: "/login" },
    { label: "Why Sell", to: "/about" },
    { label: "Become a Seller", to: "/signup" },
    { label: "Seller Resource Center", to: "/about" },
  ],
  "Help Center": [
    { label: "Get Help", to: "/contact" },
    { label: "Send Feedback", to: "/contact" },
    { label: "Terms and Conditions", to: "/legal/terms-of-service" },
    { label: "Privacy Policy", to: "/legal/privacy-policy" },
  ],
};

export const Footer = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.user?.role === "admin";

  if (!user) {
    return (
      <footer className="border-t border-[#c9d8cb] bg-[#edf4ef] text-[#223229]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#cbdbcf] pb-8">
            <p className="font-classic text-3xl leading-tight text-[#223128]">
              Bid in curated auctions for art, antiques, luxury, and
              collectibles.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-md border border-[#8da99b] px-6 py-3 text-sm font-semibold text-[#35594c] transition hover:bg-[#e8f1eb]"
              >
                LOG IN
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-primary-700 px-6 py-3 text-sm font-semibold text-[#f7fbf8] transition hover:bg-primary-800"
              >
                JOIN
              </Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(guestFooterLinks).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-2xl font-classic text-[#213128]">
                  {heading}
                </h4>
                <ul className="mt-3 space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-[15px] text-[#4e655b] transition hover:text-[#2a4338]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-[#cbdbcf] pt-5 text-center text-sm text-[#51665c]">
            <p>
              &copy; {new Date().getFullYear()} बोली बाज़ार. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  const authFooterTheme = isAdmin
    ? {
        wrapper: "bg-rose-950",
        logoBox: "bg-rose-600",
        brandGradient: "from-rose-200 via-orange-200 to-amber-200",
        bodyText: "text-rose-200/80",
        headingText: "text-rose-300/90",
        linkText: "text-rose-200/75 hover:text-white",
        border: "border-rose-900",
        copyrightText: "text-rose-300/70",
        buildText: "text-rose-300/55",
      }
    : {
        wrapper: "bg-[#111b17]",
        logoBox: "bg-primary-700",
        brandGradient: "from-[#dbe7e0] via-[#c6d8ce] to-[#a5c1b3]",
        bodyText: "text-[#a8beb3]",
        headingText: "text-[#b7cbc1]",
        linkText: "text-[#a8beb3] hover:text-white",
        border: "border-[#23342d]",
        copyrightText: "text-[#8fa69b]",
        buildText: "text-[#7f988d]",
      };

  return (
    <footer className={`${authFooterTheme.wrapper} text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-8 h-8 rounded-lg ${authFooterTheme.logoBox} flex items-center justify-center text-sm font-bold`}
              >
                CB
              </div>
              <span
                className={`font-brand-hi text-lg font-bold text-gradient bg-linear-to-r ${authFooterTheme.brandGradient} bg-clip-text text-transparent select-none`}
              >
                बोली बाज़ार
              </span>
            </div>
            <p
              className={`text-sm ${authFooterTheme.bodyText} leading-relaxed max-w-xs`}
            >
              The next-generation auction platform with real-time bidding and
              gamified experiences.
            </p>
          </div>

          {Object.entries(appFooterLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4
                className={`text-xs font-semibold ${authFooterTheme.headingText} uppercase tracking-wider mb-4`}
              >
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className={`text-sm ${authFooterTheme.linkText} transition-colors`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className={`border-t ${authFooterTheme.border} pt-6 flex flex-col sm:flex-row items-center justify-between gap-4`}
        >
          <p className={`text-xs ${authFooterTheme.copyrightText}`}>
            &copy; {new Date().getFullYear()} बोली बाज़ार. All rights reserved.
          </p>
          <p className={`text-xs ${authFooterTheme.buildText}`}>
            Built with React, Node.js & Socket.IO
          </p>
        </div>
      </div>
    </footer>
  );
};
