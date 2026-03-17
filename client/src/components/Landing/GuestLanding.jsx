import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  FaXTwitter,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaWeibo,
} from "react-icons/fa6";
import heroImage from "./Images/image.jpg";
import springRoomBanner from "./Images/htw_homepage_banner_asset.webp";
import collectorsCabinetBanner from "./Images/paintings_main_image.webp";
import vintageRoadsterImage from "./Images/indian.jpg";
import indianOrnamentImage from "./Images/Pink-South-Indian-Jewellery-Set-04.jpg";
import earlyCoinImage from "./Images/223821284_1_x.webp";
import viratCardImage from "./Images/GkHwDrRaEAAweFF.jpg";
import silkSareeImage from "./Images/mavuri_blog_image_4_-_03.jpg";
import sitarImage from "./Images/ravi-shankar-sitar-1155x770-1.webp";

const browseMenu = [
  {
    name: "Art",
    subcategories: ["Paintings", "Sculpture", "Prints", "Mixed Media"],
  },
  {
    name: "Jewelry",
    subcategories: ["Rings", "Necklaces", "Watches", "Estate Jewelry"],
  },
  {
    name: "Furniture",
    subcategories: ["Mid-Century", "Antique", "Modern", "Outdoor"],
  },
  {
    name: "Collectibles",
    subcategories: ["Cards", "Memorabilia", "Vintage Toys", "Rare Finds"],
  },
  {
    name: "Coins",
    subcategories: ["Gold", "Silver", "Historic", "Certified"],
  },
  {
    name: "Home & Decor",
    subcategories: ["Ceramics", "Lighting", "Rugs", "Decor Objects"],
  },
  {
    name: "Fashion",
    subcategories: ["Luxury", "Vintage", "Accessories", "Designer"],
  },
  {
    name: "Books",
    subcategories: ["First Editions", "Signed", "Art Books", "Rare Books"],
  },
  {
    name: "Musical",
    subcategories: ["Guitars", "Piano", "Strings", "Collectible Gear"],
  },
];

const featuredLots = [
  {
    title: "Estate Finds: Spring Room",
    subtitle: "Riverview Auction House",
    image: springRoomBanner,
    imageAlt: "Spring Room featured auction",
  },
  {
    title: "Collectors Cabinet",
    subtitle: "Maple Street Auctions",
    image: collectorsCabinetBanner,
    imageAlt: "Collectors Cabinet featured auction",
  },
];

const trendingItems = [
  {
    title: "Vintage Roadster Model",
    house: "Rajpath Estates",
    bid: "₹25,800",
    bids: 7,
    time: "3 Days Left",
    image: vintageRoadsterImage,
  },
  {
    title: "Indian Ornament",
    house: "Dakshin Jewels Auctions",
    bid: "₹58,000",
    bids: 7,
    time: "7 Days Left",
    image: indianOrnamentImage,
  },
  {
    title: "Early Coin Collection",
    house: "Heritage Coins India",
    bid: "₹34,000",
    bids: 6,
    time: "1 Day Left",
    image: earlyCoinImage,
  },
  {
    title: "Virat Kohli Signed Sports Card",
    house: "Mumbai Premier Auctions",
    bid: "₹2,95,000",
    bids: 11,
    time: "Ending Soon",
    image: viratCardImage,
  },
  {
    title: "Silk Saree",
    house: "Kanchipuram Collections",
    bid: "₹10,400",
    bids: 4,
    time: "2 Days Left",
    image: silkSareeImage,
  },
  {
    title: "Ravi Shankar Sitar",
    house: "Benaras Strings Auction House",
    bid: "₹62,500",
    bids: 5,
    time: "5 Days Left",
    image: sitarImage,
  },
];

const trendingMarqueeItems = [...trendingItems, ...trendingItems];

const sectionReveal = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren",
      staggerChildren: 0.09,
    },
  },
};

const itemReveal = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const GuestLanding = () => {
  const [openCategory, setOpenCategory] = useState(null);
  const hideTimerRef = useRef(null);

  const handleMenuEnter = (categoryName) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setOpenCategory(categoryName);
  };

  const handleMenuLeave = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setOpenCategory(null);
      hideTimerRef.current = null;
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <main className="bg-white text-[#233128]">
      <section className="relative z-40 border-y border-[#d3ddd3] bg-[#f6f9f6]">
        <div className="mx-auto flex max-w-350 flex-wrap items-center justify-center gap-4 px-6 py-4 text-base sm:px-8">
          {browseMenu.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => handleMenuEnter(item.name)}
              onMouseLeave={handleMenuLeave}
            >
              <div className="whitespace-nowrap rounded-full px-4 py-2 text-[#4a5f54] transition hover:bg-[#e4efe8] hover:text-[#213229]">
                {item.name}
              </div>

              <div
                className={`absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-xl border border-[#c9d8cc] bg-[#f5faf6] p-3 shadow-lg transition duration-150 ${
                  openCategory === item.name
                    ? "visible opacity-100"
                    : "invisible opacity-0"
                }`}
              >
                <p className="mb-2 text-xs uppercase tracking-wide text-[#5e796c]">
                  Subcategories
                </p>
                <div className="space-y-1">
                  {item.subcategories.map((sub) => (
                    <div
                      key={sub}
                      className="rounded-md px-2 py-1.5 text-sm text-[#33463c] hover:bg-[#e5efe9]"
                    >
                      {sub}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-350 px-6 pb-24 pt-14 sm:px-8">
        <div className="grid gap-12 rounded-3xl border border-[#c8d8cc] bg-[#e6efe8] p-8 md:grid-cols-[1.1fr_1fr] md:p-12">
          <div className="rounded-2xl border border-[#c8d8cc] bg-[#eef5f0] p-6">
            <div className="overflow-hidden rounded-xl border border-[#d7e3db] bg-white/80">
              <img
                src={heroImage}
                alt="Spring collection preview"
                className="h-96 w-full object-cover"
              />
            </div>
          </div>

          <div className="self-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#557767]">
              Spring Collection
            </p>
            <h1 className="font-classic mt-4 text-5xl leading-tight text-[#1f3027] sm:text-6xl">
              Discover pieces worth
              <br />
              collecting.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4b6158]">
              A calmer auction experience focused on craft, history, and
              memorable finds. Browse, bid, and build your collection in real
              time.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="rounded-md bg-primary-700 px-8 py-4 text-base font-semibold text-[#f7fbf8] transition hover:bg-primary-800"
              >
                Join & Start Bidding
              </Link>
              <Link
                to="/auction"
                className="rounded-md border border-[#8fae9f] px-8 py-4 text-base font-semibold text-[#355446] transition hover:bg-[#edf5f0]"
              >
                Explore Auctions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-350 px-6 pb-20 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionReveal}
        >
          <div className="mb-7 flex items-center justify-between">
            <motion.h2
              variants={itemReveal}
              className="font-classic text-5xl text-[#213229]"
            >
              Featured Auctions
            </motion.h2>
            <motion.div variants={itemReveal}>
              <Link
                to="/auction"
                className="text-base font-semibold text-[#426958] hover:text-[#315242]"
              >
                View All
              </Link>
            </motion.div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {featuredLots.map((lot) => (
              <motion.article
                key={lot.title}
                variants={itemReveal}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-[#cfddd3] bg-[#eef5f0] p-7"
              >
                <div className="overflow-hidden rounded-xl border border-[#d7e3db] bg-white/80">
                  <img
                    src={lot.image}
                    alt={lot.imageAlt}
                    className="h-80 w-full object-cover"
                  />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-[#24362d]">
                  {lot.title}
                </h3>
                <p className="mt-2 text-base text-[#51665c]">{lot.subtitle}</p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-350 px-6 pb-20 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionReveal}
        >
          <motion.h2
            variants={itemReveal}
            className="font-classic text-5xl text-[#213229]"
          >
            Trending Items
          </motion.h2>
          <div className="mt-7 overflow-hidden rounded-2xl border border-[#d3dfd6] bg-[#f6faf7] py-3">
            <motion.div
              className="flex w-max gap-5 px-3"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
            >
              {trendingMarqueeItems.map((item, index) => (
                <motion.article
                  key={`${item.title}-${index}`}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="w-62.5 sm:w-67.5 shrink-0 rounded-2xl border border-[#d3dfd6] bg-[#f4f8f5] p-5"
                >
                  <div className="overflow-hidden rounded-xl border border-[#d8e4dc] bg-white">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-36 w-full object-cover"
                    />
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#4f6761]">
                    {item.time}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-[#24362d]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#4f655c]">{item.house}</p>
                  <p className="mt-3 text-2xl font-semibold text-[#1f3027]">
                    {item.bid}
                  </p>
                  <p className="text-sm text-[#5a7066]">({item.bids} bids)</p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="border-t border-[#cedbce] bg-[#f6f9f6] px-6 py-16 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={sectionReveal}
          className="mx-auto max-w-5xl text-center"
        >
          <motion.p
            variants={itemReveal}
            className="font-classic text-4xl text-[#203028] sm:text-4xl mb-8"
          >
            Follow Us
          </motion.p>
          <div className="flex items-center justify-center gap-8 sm:gap-10">
            <motion.a
              variants={itemReveal}
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#203028] transition hover:text-primary-700"
              aria-label="X (Twitter)"
              whileHover={{ y: -3 }}
            >
              <FaXTwitter size={32} />
            </motion.a>
            <motion.a
              variants={itemReveal}
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#203028] transition hover:text-primary-700"
              aria-label="Facebook"
              whileHover={{ y: -3 }}
            >
              <FaFacebook size={32} />
            </motion.a>
            <motion.a
              variants={itemReveal}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#203028] transition hover:text-primary-700"
              aria-label="Instagram"
              whileHover={{ y: -3 }}
            >
              <FaInstagram size={32} />
            </motion.a>
            <motion.a
              variants={itemReveal}
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#203028] transition hover:text-primary-700"
              aria-label="YouTube"
              whileHover={{ y: -3 }}
            >
              <FaYoutube size={32} />
            </motion.a>
            <motion.a
              variants={itemReveal}
              href="https://weibo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#203028] transition hover:text-primary-700"
              aria-label="Weibo"
              whileHover={{ y: -3 }}
            >
              <FaWeibo size={32} />
            </motion.a>
          </div>
        </motion.div>
      </section>

      <section className="border-t border-[#cedbce] bg-white px-6 py-28 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={sectionReveal}
          className="mx-auto max-w-5xl text-center"
        >
          <motion.p
            variants={itemReveal}
            className="font-classic text-5xl leading-tight text-[#203028] sm:text-6xl"
          >
            Learn More About Private Sales at
            <span className="mt-3 block font-brand-hi text-[56px] leading-none text-[#203028] sm:text-[68px] whitespace-nowrap">
              {"बोली\u00A0बाज़ार"}
            </span>
          </motion.p>
          <motion.div
            variants={itemReveal}
            className="mx-auto mt-6 h-1 w-28 bg-[#5f7e71]"
          />
        </motion.div>
      </section>
    </main>
  );
};
