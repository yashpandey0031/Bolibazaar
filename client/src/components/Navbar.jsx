import { cloneElement, useEffect, useState, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/auth/authSlice";
import { usePrefetchHandlers } from "../hooks/useAuction.js";
import {
  MdOutlineCreate,
  MdOutlineDashboard,
  MdMailOutline,
  MdAttachMoney,
  MdOutlineAccountCircle,
  MdOutlineHome,
  MdOutlinePrivacyTip,
  MdAdminPanelSettings,
} from "react-icons/md";
import {
  IoCloseSharp,
  IoDocumentTextOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { RiAuctionLine } from "react-icons/ri";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { FiTarget } from "react-icons/fi";
import { NotificationBell } from "./NotificationBell";

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [guestRailPinned, setGuestRailPinned] = useState(false);
  const [guestRailHovered, setGuestRailHovered] = useState(false);
  const [authRailPinned, setAuthRailPinned] = useState(false);
  const [authRailHovered, setAuthRailHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const {
    prefetchAuctions,
    prefetchMyAuctions,
    prefetchMyBids,
    prefetchDashboard,
  } = usePrefetchHandlers();

  const handlePrefetch = useCallback(
    (link) => {
      const prefetchMap = {
        "/": prefetchDashboard,
        "/auction": prefetchAuctions,
        "/myauction": prefetchMyAuctions,
        "/mybids": prefetchMyBids,
      };
      prefetchMap[link]?.();
    },
    [prefetchAuctions, prefetchMyAuctions, prefetchMyBids, prefetchDashboard],
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      setIsScrolled(scrollTop > 12);
      setScrollProgress(
        maxScroll > 0 ? Math.min(100, (scrollTop / maxScroll) * 100) : 0,
      );
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navItems = user ? getNavLinks(user.user.role) : navMenu;
  const drawerItems = user ? getAllLinks(user.user.role) : navMenu;
  const isGuest = !user;
  const isAdmin = user?.user?.role === "admin";
  const isGuestRailExpanded = guestRailPinned || guestRailHovered;
  const isAuthRailExpanded = authRailPinned || authRailHovered;

  const authAccent = isAdmin
    ? {
        logo: "bg-rose-600 text-white group-hover:bg-rose-700",
        activeNav: "text-rose-600 bg-rose-50",
        profileActive: "text-rose-600 bg-rose-50",
        avatar: "bg-rose-100 text-rose-700",
        drawerActive: "text-rose-600 bg-rose-50",
        signup: "bg-rose-600 text-white hover:bg-rose-700",
      }
    : {
        logo: "bg-[#355d4c] text-white group-hover:bg-[#2b4d3e]",
        activeNav: "text-[#355d4c] bg-[#e6efe8]",
        profileActive: "text-[#355d4c] bg-[#e6efe8]",
        avatar: "bg-[#e6efe8] text-[#355d4c]",
        drawerActive: "text-[#355d4c] bg-[#e6efe8]",
        signup: "bg-[#355d4c] text-white hover:bg-[#2b4d3e]",
      };

  if (isGuest) {
    return (
      <>
        <header
          className={`sticky top-0 z-40 border-[#cad8cd] border-b overflow-hidden transition-[border-color,box-shadow] duration-500 ease-out lg:hidden ${
            isScrolled
              ? "shadow-[0_10px_28px_rgba(18,40,33,0.14)]"
              : "shadow-none"
          }`}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-primary-900/90" />
          <div
            className="pointer-events-none absolute left-0 top-0 h-1 bg-primary-500 transition-[width] duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />

          <div className="bg-[#f4f8f5]">
            <div className="px-6 sm:px-8">
              <div
                className={`flex justify-between items-center transition-[height] duration-500 ease-out ${
                  isScrolled ? "h-[4.55rem]" : "h-20"
                }`}
              >
                <Link
                  to="/"
                  className={`flex items-center gap-3.5 group transition-all duration-700 ease-out ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
                >
                  <div className="bg-primary-700 text-[#f7fbf8] p-2 rounded-lg transition">
                    <RiAuctionLine className="h-6 w-6" />
                  </div>
                  <span className="font-brand-hi text-[34px] leading-none text-[#203028]">
                    बोली बाज़ार
                  </span>
                </Link>

                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg transition text-[#4a6358] hover:text-[#274138] hover:bg-[#e2ece5]"
                  aria-expanded={isMenuOpen}
                  aria-label="Toggle menu"
                >
                  <HiOutlineMenuAlt3 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <aside
          className={`hidden lg:flex fixed left-5 top-1/2 -translate-y-1/2 z-50 rounded-3xl border border-[#c8d8cc] bg-[#f4f8f5]/95 backdrop-blur-xl shadow-[0_20px_55px_rgba(18,40,33,0.18)] transition-all duration-300 ease-out hover:-translate-y-[51%] ${
            isGuestRailExpanded ? "w-72" : "w-20"
          } ${animateIn ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
          onMouseEnter={() => setGuestRailHovered(true)}
          onMouseLeave={() => setGuestRailHovered(false)}
        >
          <div className="w-full px-3 py-4 flex flex-col gap-3 max-h-[calc(100vh-3rem)]">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className={`flex items-center ${isGuestRailExpanded ? "gap-3" : "justify-center w-full"}`}
              >
                <div className="bg-primary-700 text-[#f7fbf8] p-2 rounded-xl transition">
                  <RiAuctionLine className="h-6 w-6" />
                </div>
                {isGuestRailExpanded && (
                  <span className="font-brand-hi text-[22px] leading-none text-[#203028] whitespace-nowrap">
                    बोली बाज़ार
                  </span>
                )}
              </Link>

              {isGuestRailExpanded && (
                <button
                  onClick={() => setGuestRailPinned((v) => !v)}
                  className="p-2 rounded-lg text-[#4a6358] hover:text-[#274138] hover:bg-[#e2ece5] transition"
                  aria-label="Toggle sidebar pin"
                  title={guestRailPinned ? "Unpin sidebar" : "Pin sidebar"}
                >
                  <HiOutlineMenuAlt3 className="h-5 w-5" />
                </button>
              )}
            </div>

            {isGuestRailExpanded && (
              <div className="pt-1">
                <input
                  type="search"
                  placeholder="Search items and auction houses"
                  className="w-full rounded-xl border border-[#c7d8cc] bg-[#f8fcf9] px-4 py-3 text-sm text-[#2f463d] placeholder:text-[#6d8578] focus:outline-none"
                />
              </div>
            )}

            <nav className="flex flex-col gap-1.5 pt-1 overflow-y-auto">
              {navMenu.map((item) => (
                <NavLink
                  to={item.link}
                  key={item.link}
                  end={item.link === "/"}
                  className={({ isActive }) =>
                    `rounded-xl font-medium transition-all flex items-center ${
                      isGuestRailExpanded
                        ? "gap-3 px-3 py-3 text-base"
                        : "justify-center px-0 py-3"
                    } ${
                      isActive
                        ? "text-[#325342] bg-[#dce9e1]"
                        : "text-[#4a6358] hover:text-[#274138] hover:bg-[#e8f1eb]"
                    }`
                  }
                  title={item.name}
                >
                  <span>
                    {cloneElement(item.icon, { className: "h-6 w-6" })}
                  </span>
                  {isGuestRailExpanded && <span>{item.name}</span>}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto space-y-2 pt-3 border-t border-[#d3ddd3]">
              <Link
                to="/login"
                className={`rounded-xl border border-[#9ab5a7] text-sm font-medium text-[#3e5a4e] transition hover:bg-[#e8f1eb] flex items-center ${
                  isGuestRailExpanded
                    ? "justify-center px-4 py-2.5"
                    : "justify-center px-0 py-3"
                }`}
                title="Log in"
              >
                {isGuestRailExpanded ? (
                  "Log in"
                ) : (
                  <MdOutlineAccountCircle className="h-6 w-6" />
                )}
              </Link>
              <Link
                to="/signup"
                className={`rounded-xl bg-primary-700 text-sm font-medium text-[#f7fbf8] transition hover:bg-primary-800 flex items-center ${
                  isGuestRailExpanded
                    ? "justify-center px-4 py-2.5"
                    : "justify-center px-0 py-3"
                }`}
                title="Sign up"
              >
                {isGuestRailExpanded ? (
                  "Sign up"
                ) : (
                  <MdOutlineCreate className="h-6 w-6" />
                )}
              </Link>
            </div>
          </div>
        </aside>

        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        <div
          className={`fixed top-0 right-0 h-full w-80 bg-[#f4f8f5] z-50 transform transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center px-5 h-16 border-b border-[#cad8cd]">
            <Link
              to="/"
              className="flex items-center gap-2.5"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="bg-primary-700 text-[#f7fbf8] p-1.5 rounded-lg">
                <RiAuctionLine className="h-5 w-5" />
              </div>
              <span className="font-brand-hi text-[26px] leading-none text-[#203028]">
                बोली बाज़ार
              </span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              aria-label="Close menu"
            >
              <IoCloseSharp className="h-5 w-5" />
            </button>
          </div>

          <nav
            className="px-3 py-3 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 180px)" }}
          >
            <div className="space-y-0.5">
              {drawerItems.map((item) => (
                <NavLink
                  to={item.link}
                  key={item.link}
                  end={item.link === "/"}
                  onMouseEnter={() => handlePrefetch(item.link)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "text-[#325342] bg-[#dce9e1]"
                        : "text-[#4a6358] hover:text-[#274138] hover:bg-[#e8f1eb]"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 px-1">
              <Link
                to="/login"
                className="block w-full py-2.5 px-4 text-center rounded-xl text-sm font-medium transition text-[#3e5a4e] border border-[#9ab5a7] hover:bg-[#e8f1eb]"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="block w-full py-2.5 px-4 text-center text-sm font-medium rounded-xl transition bg-primary-700 text-[#f7fbf8] hover:bg-primary-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </nav>
        </div>
      </>
    );
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b overflow-hidden transition-[border-color,box-shadow] duration-500 ease-out lg:hidden ${
          isGuest ? "border-[#cad8cd]" : "border-gray-200/60"
        } ${
          isScrolled
            ? "shadow-[0_10px_28px_rgba(18,40,33,0.14)]"
            : "shadow-none"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-primary-900/90" />
        <div
          className="pointer-events-none absolute left-0 top-0 h-1 bg-primary-500 transition-[width] duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
        <div
          className={`transition-[background-color,backdrop-filter] duration-500 ease-out ${
            isGuest
              ? "bg-[#f4f8f5]"
              : isScrolled
                ? "bg-white/85 backdrop-blur-2xl"
                : "bg-white/70 backdrop-blur-xl"
          }`}
        >
          <div
            className={`mx-auto ${isGuest ? "max-w-350 px-6 sm:px-8" : "max-w-7xl px-4 sm:px-6"}`}
          >
            <div
              className={`flex justify-between items-center transition-[height,padding] duration-500 ease-out ${
                isGuest
                  ? isScrolled
                    ? "h-[4.55rem]"
                    : "h-20"
                  : isScrolled
                    ? "h-14"
                    : "h-16"
              }`}
            >
              {/* Logo */}
              <Link
                to="/"
                className={`flex items-center group ${isGuest ? "gap-3.5" : "gap-2.5"} ${isAdmin ? "md:min-w-56" : ""} transition-all duration-700 ease-out ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
              >
                <div
                  className={`${
                    isGuest ? "bg-primary-700 text-[#f7fbf8]" : authAccent.logo
                  } ${isGuest ? "p-2" : "p-1.5"} rounded-lg transition`}
                >
                  <RiAuctionLine
                    className={`${isGuest ? "h-6 w-6" : "h-5 w-5"}`}
                  />
                </div>
                <span
                  className={`${
                    isGuest
                      ? "font-brand-hi text-[34px] leading-none text-[#203028]"
                      : "text-lg font-bold text-gray-900 tracking-tight"
                  }`}
                >
                  बोली बाज़ार
                </span>
              </Link>

              {isGuest && (
                <div
                  className={`hidden lg:block flex-1 max-w-2xl mx-8 transition-all duration-700 delay-75 ease-out ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
                >
                  <input
                    type="search"
                    placeholder="Search items and auction houses"
                    className="w-full rounded-md border border-[#c7d8cc] bg-[#f8fcf9] px-5 py-3 text-base text-[#2f463d] placeholder:text-[#6d8578] focus:outline-none"
                  />
                </div>
              )}

              {/* Desktop Navigation — main links only */}
              <nav
                className={`hidden md:flex items-center ${
                  isGuest
                    ? "gap-2"
                    : isAdmin
                      ? "flex-1 justify-center gap-0.5 mx-4"
                      : "gap-1"
                } transition-all duration-700 delay-100 ease-out ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
              >
                {navItems.map((item) => (
                  <NavLink
                    to={item.link}
                    key={item.link}
                    end={item.link === "/"}
                    onMouseEnter={() => handlePrefetch(item.link)}
                    className={({ isActive }) =>
                      `rounded-lg font-medium transition-all ${
                        isGuest
                          ? isActive
                            ? "text-[#325342] bg-[#dce9e1] px-4 py-2.5 text-base"
                            : "text-[#4a6358] hover:text-[#274138] hover:bg-[#e8f1eb] px-4 py-2.5 text-base"
                          : isActive
                            ? `${authAccent.activeNav} ${isAdmin ? "px-2.5 py-1.5 text-[13px]" : "px-3.5 py-2 text-sm"}`
                            : `${isAdmin ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2.5 py-1.5 text-[13px]" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3.5 py-2 text-sm"}`
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>

              {/* Right Section */}
              <div
                className={`flex items-center ${isGuest ? "gap-3" : "gap-2"} ${isAdmin ? "md:min-w-56 md:justify-end" : ""} transition-all duration-700 delay-150 ease-out ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
              >
                {/* Desktop auth buttons */}
                {!user && (
                  <div className="hidden md:flex items-center gap-3">
                    <LoginSignup isGuest={isGuest} />
                  </div>
                )}
                {user && (
                  <div className="hidden md:flex items-center gap-2">
                    <NotificationBell />
                    <NavLink
                      to="/profile"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? authAccent.profileActive
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`
                      }
                    >
                      <div
                        className={`w-7 h-7 rounded-full ${authAccent.avatar} flex items-center justify-center text-xs font-bold`}
                      >
                        {user.user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span>{user.user.name?.split(" ")[0]}</span>
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Sign out"
                    >
                      <IoLogOutOutline className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* Hamburger — always visible */}
                <button
                  onClick={toggleMenu}
                  className={`p-2 rounded-lg transition ${
                    isGuest
                      ? "text-[#4a6358] hover:text-[#274138] hover:bg-[#e2ece5]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  aria-expanded={isMenuOpen}
                  aria-label="Toggle menu"
                >
                  <HiOutlineMenuAlt3 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <aside
        className={`hidden lg:flex fixed left-5 top-1/2 -translate-y-1/2 z-50 rounded-3xl border bg-white/95 backdrop-blur-xl shadow-[0_20px_55px_rgba(15,23,42,0.2)] transition-all duration-300 ease-out hover:-translate-y-[51%] ${
          isAdmin ? "border-rose-200/70" : "border-[#c8d8cc]"
        } ${isAuthRailExpanded ? "w-72" : "w-20"} ${animateIn ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
        onMouseEnter={() => setAuthRailHovered(true)}
        onMouseLeave={() => setAuthRailHovered(false)}
      >
        <div className="w-full px-3 py-4 flex flex-col gap-3 max-h-[calc(100vh-3rem)]">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className={`flex items-center ${isAuthRailExpanded ? "gap-3" : "justify-center w-full"}`}
            >
              <div className={`${authAccent.logo} p-2 rounded-xl transition`}>
                <RiAuctionLine className="h-6 w-6" />
              </div>
              {isAuthRailExpanded && (
                <span className="font-brand-hi text-[22px] leading-none text-gray-900 whitespace-nowrap">
                  बोली बाज़ार
                </span>
              )}
            </Link>

            {isAuthRailExpanded && (
              <button
                onClick={() => setAuthRailPinned((v) => !v)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition"
                aria-label="Toggle sidebar pin"
                title={authRailPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                <HiOutlineMenuAlt3 className="h-5 w-5" />
              </button>
            )}
          </div>

          {isAuthRailExpanded && (
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5">
              <div
                className={`w-9 h-9 rounded-full ${authAccent.avatar} flex items-center justify-center text-xs font-bold shrink-0`}
              >
                {user.user.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.user.email}
                </p>
              </div>
            </div>
          )}

          <nav className="flex flex-col gap-1.5 pt-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                to={item.link}
                key={item.link}
                end={item.link === "/"}
                onMouseEnter={() => handlePrefetch(item.link)}
                className={({ isActive }) =>
                  `rounded-xl font-medium transition-all flex items-center ${
                    isAuthRailExpanded
                      ? "gap-3 px-3 py-3 text-base"
                      : "justify-center px-0 py-3"
                  } ${
                    isActive
                      ? authAccent.activeNav
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`
                }
                title={item.name}
              >
                <span>{cloneElement(item.icon, { className: "h-6 w-6" })}</span>
                {isAuthRailExpanded && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-2 pt-3 border-t border-gray-200">
            <div
              className={`rounded-xl transition ${
                isAuthRailExpanded
                  ? "px-2 py-1 bg-gray-50"
                  : "flex justify-center py-2"
              }`}
              title="Notifications"
            >
              <NotificationBell />
            </div>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `rounded-xl transition-all flex items-center ${
                  isAuthRailExpanded
                    ? "gap-3 px-3 py-2.5 text-sm font-medium"
                    : "justify-center px-0 py-3"
                } ${
                  isActive
                    ? authAccent.profileActive
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`
              }
              title="Profile"
            >
              <MdOutlineAccountCircle className="h-6 w-6" />
              {isAuthRailExpanded && <span>Profile</span>}
            </NavLink>

            <button
              onClick={toggleMenu}
              className={`w-full rounded-xl transition-all flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${
                isAuthRailExpanded
                  ? "gap-3 px-3 py-2.5 text-sm font-medium"
                  : "justify-center px-0 py-3"
              }`}
              title="More menu"
              aria-label="Open more menu"
            >
              <HiOutlineMenuAlt3 className="h-6 w-6" />
              {isAuthRailExpanded && <span>More</span>}
            </button>

            <button
              onClick={handleLogout}
              className={`w-full rounded-xl transition-all flex items-center text-red-500 hover:text-red-600 hover:bg-red-50 ${
                isAuthRailExpanded
                  ? "gap-3 px-3 py-2.5 text-sm font-medium"
                  : "justify-center px-0 py-3"
              }`}
              title="Sign out"
            >
              <IoLogOutOutline className="h-6 w-6" />
              {isAuthRailExpanded && <span>Sign out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 ${isGuest ? "bg-[#f4f8f5]" : "bg-white"} z-50 transform transition-transform duration-300 ease-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div
          className={`flex justify-between items-center px-5 h-16 ${isGuest ? "border-b border-[#cad8cd]" : "border-b border-gray-100"}`}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5"
            onClick={() => setIsMenuOpen(false)}
          >
            <div
              className={`${isGuest ? "bg-primary-700 text-[#f7fbf8]" : authAccent.logo} p-1.5 rounded-lg`}
            >
              <RiAuctionLine className="h-5 w-5" />
            </div>
            <span
              className={`${isGuest ? "font-brand-hi text-[26px] leading-none text-[#203028]" : "text-lg font-bold text-gray-900 tracking-tight"}`}
            >
              बोली बाज़ार
            </span>
          </Link>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close menu"
          >
            <IoCloseSharp className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile (logged in) */}
        {user && (
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full ${authAccent.avatar} flex items-center justify-center overflow-hidden`}
              >
                {user.user.avatar ? (
                  <img
                    src={user.user.avatar}
                    alt={user.user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold">
                    {user.user.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {user.user.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Drawer Links — ALL pages */}
        <nav
          className="px-3 py-3 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 180px)" }}
        >
          <div className="space-y-0.5">
            {drawerItems.map((item) => (
              <NavLink
                to={item.link}
                key={item.link}
                end={item.link === "/"}
                onMouseEnter={() => handlePrefetch(item.link)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isGuest
                      ? isActive
                        ? "text-[#325342] bg-[#dce9e1]"
                        : "text-[#4a6358] hover:text-[#274138] hover:bg-[#e8f1eb]"
                      : isActive
                        ? authAccent.drawerActive
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </div>

          {user ? (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
              >
                <IoLogOutOutline className="h-5 w-5" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 px-1">
              <Link
                to="/login"
                className={`block w-full py-2.5 px-4 text-center rounded-xl text-sm font-medium transition ${
                  isGuest
                    ? "text-[#3e5a4e] border border-[#9ab5a7] hover:bg-[#e8f1eb]"
                    : "text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className={`block w-full py-2.5 px-4 text-center text-sm font-medium rounded-xl transition ${
                  isGuest
                    ? "bg-primary-700 text-[#f7fbf8] hover:bg-primary-800"
                    : authAccent.signup
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export const LoginSignup = ({ isGuest = false }) => {
  return (
    <>
      <Link
        to="/login"
        className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
          isGuest
            ? "text-[#3e5a4e] border border-[#9ab5a7] hover:bg-[#e8f1eb]"
            : "text-gray-700 border border-gray-200 hover:bg-gray-50"
        }`}
      >
        Log in
      </Link>
      <Link
        to="/signup"
        className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
          isGuest
            ? "bg-primary-700 text-[#f7fbf8] hover:bg-primary-800"
            : "bg-primary-700 text-white hover:bg-primary-800"
        }`}
      >
        Sign up
      </Link>
    </>
  );
};

const navMenu = [
  {
    name: "Home",
    link: "/",
    icon: <MdOutlineHome className="h-5 w-5" />,
  },
  {
    name: "About",
    link: "/about",
    icon: <MdOutlineAccountCircle className="h-5 w-5" />,
  },
  {
    name: "Contact",
    link: "/contact",
    icon: <MdMailOutline className="h-5 w-5" />,
  },
  {
    name: "Legal",
    link: "/legal",
    icon: <IoDocumentTextOutline className="h-5 w-5" />,
  },
];

const protectedNavLink = [
  {
    name: "Dashboard",
    link: "/",
    icon: <MdOutlineDashboard className="h-5 w-5" />,
  },
  {
    name: "Create Auction",
    link: "/create",
    icon: <MdOutlineCreate className="h-5 w-5" />,
  },
  {
    name: "Auctions",
    link: "/auction",
    icon: <RiAuctionLine className="h-5 w-5" />,
  },
  {
    name: "My Auctions",
    link: "/myauction",
    icon: <MdAttachMoney className="h-5 w-5" />,
  },
  {
    name: "My Bids",
    link: "/mybids",
    icon: <FiTarget className="h-5 w-5" />,
  },
  {
    name: "Auction House",
    link: "/live-house",
    icon: <RiAuctionLine className="h-5 w-5" />,
  },
  {
    name: "Credit Wallet",
    link: "/wallet",
    icon: <MdAttachMoney className="h-5 w-5" />,
  },
  {
    name: "Contact",
    link: "/contact",
    icon: <MdMailOutline className="h-5 w-5" />,
  },
  {
    name: "Profile",
    link: "/profile",
    icon: <MdOutlineAccountCircle className="h-5 w-5" />,
  },
  {
    name: "Privacy",
    link: "/privacy",
    icon: <MdOutlinePrivacyTip className="h-5 w-5" />,
  },
];

const adminNavLink = [
  {
    name: "Admin Panel",
    link: "/admin",
    icon: <MdAdminPanelSettings className="h-5 w-5" />,
  },
  {
    name: "Create Auction",
    link: "/create",
    icon: <MdOutlineCreate className="h-5 w-5" />,
  },
  {
    name: "Dashboard",
    link: "/",
    icon: <MdOutlineDashboard className="h-5 w-5" />,
  },
  {
    name: "Manage Auctions",
    link: "/admin/auctions",
    icon: <RiAuctionLine className="h-5 w-5" />,
  },
  {
    name: "Credits",
    link: "/admin/credits",
    icon: <MdAttachMoney className="h-5 w-5" />,
  },
  {
    name: "Analytics",
    link: "/admin/analytics",
    icon: <MdOutlineDashboard className="h-5 w-5" />,
  },
  {
    name: "Auction House",
    link: "/live-house",
    icon: <RiAuctionLine className="h-5 w-5" />,
  },
  {
    name: "Auctions",
    link: "/auction",
    icon: <RiAuctionLine className="h-5 w-5" />,
  },
];

// Top nav bar links (limited set for desktop)
const getNavLinks = (userRole) => {
  if (userRole === "admin") {
    return adminNavLink;
  }
  return protectedNavLink.slice(0, 6);
};

// Links for the hamburger drawer
const getAllLinks = (userRole) => {
  if (userRole === "admin") {
    return [
      ...adminNavLink,
      protectedNavLink[6], // Credit Wallet
      protectedNavLink[7], // Contact
      protectedNavLink[8], // Profile
      protectedNavLink[9], // Privacy
    ];
  }
  return protectedNavLink; // All 8 links
};
