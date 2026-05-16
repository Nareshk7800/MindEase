import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const HomePageNew: React.FC = () => {
  const navigate = useNavigate();

  const goLogin = () => navigate("/login");
  const goSignup = () => navigate("/signup");

  return (
    <Layout hideNavigation backgroundClassName="bg-surface">
      <div className="min-h-screen bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
        <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-6 md:px-12 bg-[#faf9f5]/70 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-[#88A67E] font-headline tracking-tight">
              The Digital Sanctuary
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a
              className="text-sm font-semibold font-label text-on-surface-variant hover:text-primary transition-colors"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Our Philosophy
            </a>
            <a
              className="text-sm font-semibold font-label text-on-surface-variant hover:text-primary transition-colors"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Practices
            </a>
            <button
              type="button"
              onClick={goLogin}
              className="px-6 py-2 rounded-full border border-outline-variant/30 text-sm font-bold font-label hover:bg-surface-container transition-all"
            >
              Sign In
            </button>
          </nav>

          <div className="md:hidden">
            <span className="material-symbols-outlined text-on-surface">
              menu
            </span>
          </div>
        </header>

        <main className="min-h-screen pt-24 pb-12 overflow-hidden relative">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-container/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-20 -left-20 w-96 h-96 bg-tertiary-container/10 blur-[100px] rounded-full" />

          <section className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-12 order-2 lg:order-1">
              <div className="space-y-6">
                <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold font-label uppercase tracking-wider">
                  Your space for peace
                </span>
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-headline font-extrabold text-on-surface tracking-tight leading-[1.05]">
                  Exhale the noise.{" "}
                  <span className="text-primary italic font-medium">Inhale</span>{" "}
                  the calm.
                </h1>
                <p className="text-lg md:text-xl text-on-surface-variant max-w-lg leading-relaxed">
                  A curated editorial experience for your mind. Rediscover
                  clarity through light, sound, and intentional stillness in
                  our Digital Sanctuary.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={goSignup}
                  className="px-8 py-5 rounded-full bg-primary text-on-primary font-bold font-label text-lg shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Join the Sanctuary
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </button>
                <button
                  type="button"
                  onClick={goSignup}
                  className="px-8 py-5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold font-label text-lg hover:bg-secondary-fixed-dim transition-all flex items-center justify-center gap-3"
                >
                  Start Free Session
                  <span className="material-symbols-outlined">spa</span>
                </button>
              </div>

              <div className="pt-8 flex items-center gap-12 border-t border-outline-variant/10">
                <div>
                  <p className="text-3xl font-headline font-bold text-on-surface">
                    2.4M+
                  </p>
                  <p className="text-sm font-label text-on-surface-variant">
                    Peaceful Minds
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-headline font-bold text-on-surface">
                    4.9/5
                  </p>
                  <p className="text-sm font-label text-on-surface-variant">
                    Session Rating
                  </p>
                </div>
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-primary-container flex items-center justify-center overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      data-alt="close up portrait of a smiling woman in soft natural lighting"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi2CNheNHzP3tWBT8sE4b8O5SqJqJ1WQg_VHGNsxajZd556wfHLki20-z4dEVR8jnJBFe9ygUKSkDVYNa6NgBIN4_vw575Z9CiaNb0tH6gmuapb3m2TbAXiVKXqq6D-QSflYr0blG1tY0wcez0eR2FR8y1NbqFjpbGYR0up_j5gXqm1yEeIepnYYUcDN1ayWRX7AFG5jcVQTnY19FYE180c7XUV41yR83dJ0A59Dr37NjiQg0Me04oaytpFabhXoKe6U4bj6E8WlgA"
                      alt=""
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-secondary-container flex items-center justify-center overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      data-alt="portrait of a calm man with a beard looking peacefully at camera"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQVmfKQsDsV0SJzQG0dfCIFW59utc3aEyZ1glmGgQZ1YQZBCdAgGxoG8PoxIWw0JaOrPy4Z_s2KFGm0pxV_Sm-03EbOLRnp1v3A1kuzo_tXb-O53WWM14N9KxuUGZYGw2JP_iY0h0o8KnJmyoTR-e86f7pGsTvoTZANw0SC_cx0QC4Ug0i4iIJCi1zpxhHbDFyBfpwt257vKRC1SL5t4kHHK0n_rx3NaRr6QJtdQGdbCvRCdHYDhrUKdpc4pQpJvY3HgYUEcjnZyKY"
                      alt=""
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-tertiary-container flex items-center justify-center overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      data-alt="portrait of a woman with a kind expression in warm golden hour light"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6XtEGbHoBKZnp4jYWPykUYXRHjqSv-tk8tGAAGoYW1UdcyYxsLTDOl05KQRtkETQ7LdHemJbwV0JfLx1iipFVEbZYO6mU0fWFeGnvXkUP4vWwZPnHtDLWOImfsZlMicafyuT8gC7ry6D7F27kiKgD9Ph6uh5du5sPpVS_ZGKL698-DTSe9RUYMqfTnpRUdiH9vgiZSWkLNAtq-9QYH05VPJYVvF_Ae1OcS1jduZecXPrYDdxrY9NMI2F2qVdqy_6oG20VH5uMrzf5"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 order-1 lg:order-2 w-full relative">
              <div className="relative w-full aspect-square md:aspect-[4/5] flex items-center justify-center">
                <div className="absolute inset-0 bg-primary-container/30 organic-shape-1 scale-95 rotate-3" />
                <div className="absolute inset-0 bg-secondary-container/20 organic-shape-2 -rotate-6" />

                <div className="relative z-10 w-[85%] h-[85%] rounded-xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                  <img
                    className="w-full h-full object-cover"
                    data-alt="meditating person sitting peacefully on a yoga mat in a sunlit room with plants"
                    src="/welcome-hero.png"
                    alt=""
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/40 to-transparent">
                    <div className="flex items-center gap-4 text-white">
                      <span
                        className="material-symbols-outlined text-4xl"
                        data-weight="fill"
                      >
                        play_circle
                      </span>
                      <div>
                        <p className="font-bold font-headline">
                          Daily Breathe Practice
                        </p>
                        <p className="text-sm opacity-80">
                          12 Minutes • Gentle Guidance
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-10 -left-12 z-20 bg-surface-container-lowest p-6 rounded-lg shadow-xl shadow-on-surface/5 flex items-center gap-4 animate-bounce duration-[3000ms]">
                  <div className="p-3 rounded-full bg-tertiary-container/30 text-tertiary">
                    <span className="material-symbols-outlined">
                      favorite
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Heart Rate Stabilized</p>
                    <p className="text-xs text-on-surface-variant">2 mins ago</p>
                  </div>
                </div>

                <div className="absolute bottom-10 -right-8 z-20 bg-surface-container-lowest p-6 rounded-lg shadow-xl shadow-on-surface/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      Live Session
                    </span>
                  </div>
                  <p className="font-headline font-bold text-lg leading-tight">
                    Finding Inner
                    <br />
                    Forest Flow
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-headline font-bold">
                Design your sanctuary.
              </h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">
                Explore different paths to tranquility, tailored to your
                emotional architecture.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group bg-surface-container-low p-10 rounded-xl hover:bg-surface-container-high transition-all duration-500 cursor-pointer border border-transparent hover:border-primary/10">
                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span
                    className="material-symbols-outlined text-3xl text-primary"
                    data-weight="fill"
                  >
                    forest
                  </span>
                </div>
                <h3 className="text-2xl font-headline font-bold mb-4">
                  Deep Focus
                </h3>
                <p className="text-on-surface-variant leading-relaxed mb-8">
                  Bio-acoustic soundscapes designed to lock your mind into a
                  state of rhythmic flow.
                </p>
                <span className="text-primary font-bold flex items-center gap-2">
                  Explore{" "}
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </span>
              </div>

              <div className="group bg-tertiary-container/10 p-10 rounded-xl hover:bg-tertiary-container/20 transition-all duration-500 cursor-pointer border border-transparent hover:border-tertiary/10 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-tertiary-container rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <span
                      className="material-symbols-outlined text-3xl text-tertiary"
                      data-weight="fill"
                    >
                      bedtime
                    </span>
                  </div>
                  <h3 className="text-2xl font-headline font-bold mb-4">
                    Dreamscape
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed mb-8">
                    Weighted audio journeys to guide your nervous system into
                    restorative sleep cycles.
                  </p>
                  <span className="text-tertiary font-bold flex items-center gap-2">
                    Sleep well{" "}
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </div>

              <div className="group bg-secondary-container/20 p-10 rounded-xl hover:bg-secondary-container/30 transition-all duration-500 cursor-pointer border border-transparent hover:border-secondary/10">
                <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span
                    className="material-symbols-outlined text-3xl text-secondary"
                    data-weight="fill"
                  >
                    self_improvement
                  </span>
                </div>
                <h3 className="text-2xl font-headline font-bold mb-4">
                  Gentle Guidance
                </h3>
                <p className="text-on-surface-variant leading-relaxed mb-8">
                  Non-clinical, warm conversational guides that walk with you
                  through anxious moments.
                </p>
                <span className="text-secondary font-bold flex items-center gap-2">
                  Get support{" "}
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </span>
              </div>
            </div>
          </section>

          <section className="max-w-5xl mx-auto px-6 mb-32">
            <div className="relative bg-on-surface text-surface rounded-xl p-12 md:p-20 overflow-hidden text-center flex flex-col items-center justify-center">
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary opacity-20 blur-3xl rounded-full" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-tertiary opacity-20 blur-3xl rounded-full" />

              <h2 className="text-4xl md:text-6xl font-headline font-extrabold mb-8 max-w-2xl leading-tight relative z-10">
                Ready to reclaim your headspace?
              </h2>

              <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                <button
                  type="button"
                  onClick={goSignup}
                  className="px-12 py-6 bg-primary text-on-primary rounded-full font-bold text-xl hover:scale-105 transition-all"
                >
                  Sign Up Free
                </button>
                <button
                  type="button"
                  onClick={goLogin}
                  className="px-12 py-6 bg-surface/10 backdrop-blur-md text-surface rounded-full font-bold text-xl hover:bg-surface/20 transition-all"
                >
                  Log In
                </button>
              </div>

              <p className="mt-8 text-surface/60 font-medium relative z-10">
                No credit card required. Start your journey today.
              </p>
            </div>
          </section>
        </main>

        <footer className="bg-surface-container py-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <span className="text-2xl font-extrabold text-[#88A67E] font-headline">
                The Digital Sanctuary
              </span>
              <p className="text-on-surface-variant max-w-sm">
                A mindful platform dedicated to lowering the collective
                cortisol of the digital world. Built with care and sunlight.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center hover:bg-primary-container transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-xl">
                    camera
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center hover:bg-primary-container transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-xl">
                    share
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-headline font-bold text-on-surface">
                Explore
              </h4>
              <ul className="space-y-4 text-on-surface-variant font-medium">
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    Daily Practice
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    Sonic Journeys
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    Philosophy
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-headline font-bold text-on-surface">
                Community
              </h4>
              <ul className="space-y-4 text-on-surface-variant font-medium">
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    Sanctuary Blog
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    Workplace Wellness
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-20 border-t border-outline-variant/10 text-center text-sm text-on-surface-variant/60 font-medium">
            © 2024 The Digital Sanctuary. All rights reserved. Breathe freely.
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default HomePageNew;

