
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Star, Zap, BarChart, FileText, ChevronRight, Upload, Layout, Download, Quote } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SignInPromptModal } from "@/components/SignInPromptModal";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      const elements = document.querySelectorAll('.reveal');
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setShowSignInModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden font-sans">
      {/* Hero Section - Redesigned */}
      <section className="relative min-h-[90vh] flex items-center pt-20 bg-gradient-to-b from-blue-50/50 to-white">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/40 to-transparent"></div>
          <div className="absolute h-full w-full bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
        </div>

        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-8 border border-blue-200 shadow-sm">
                <Zap size={16} className="mr-2 fill-blue-500" /> Voted #1 Resume Builder
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 leading-[1.1]">
                Land your dream job with a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">better resume</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
                Create a professional, ATS-friendly resume in minutes. our AI-powered builder ensures you stand out from the crowd.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                <Button
                  size="lg"
                  onClick={handleButtonClick}
                  className="w-full sm:w-auto rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all py-6 px-8 text-lg font-bold"
                >
                  Build Your Resume <ArrowRight size={20} className="ml-2" />
                </Button>

                <div className="flex items-center text-sm text-slate-500 font-medium">
                  <div className="flex -space-x-2 mr-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden`}>
                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  Join 10,000+ users
                </div>
              </div>

              {/* Floating Companies - Marquee Effect */}
              <div className="mt-12 overflow-hidden relative fade-mask-x">
                <div className="flex items-center gap-12 animate-marquee whitespace-nowrap opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  <span className="text-xl font-bold font-serif">Google</span>
                  <span className="text-xl font-bold font-sans tracking-tight">Netflix</span>
                  <span className="text-xl font-bold font-mono">Spotify</span>
                  <span className="text-xl font-bold font-serif italic">Amazon</span>
                  <span className="text-xl font-bold font-sans uppercase">Meta</span>
                  <span className="text-xl font-bold font-serif">Microsoft</span>
                  {/* Duplicate for seamless loop */}
                  <span className="text-xl font-bold font-serif">Google</span>
                  <span className="text-xl font-bold font-sans tracking-tight">Netflix</span>
                  <span className="text-xl font-bold font-mono">Spotify</span>
                  <span className="text-xl font-bold font-serif italic">Amazon</span>
                  <span className="text-xl font-bold font-sans uppercase">Meta</span>
                  <span className="text-xl font-bold font-serif">Microsoft</span>
                </div>
              </div>
            </div>

            {/* Image/Visualization using generated asset */}
            <div
              ref={heroImgRef}
              className={`relative lg:h-[600px] flex items-center justify-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
            >
              <div className="relative w-full max-w-lg aspect-[4/3] md:aspect-square">
                {/* Main Image - Using the generated artifact */}
                <img
                  src="/hero-illustration.png"
                  alt="Professional Resumes"
                  className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Badge */}
                <div className="absolute bottom-10 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="text-green-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">ATS Score</div>
                      <div className="text-2xl font-bold text-slate-900">98%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resume Templates Showcase Section */}
      <section className="py-24 bg-slate-50" id="templates">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 reveal fade-bottom">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Designed to win interviews</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Choose from our gallery of recruiter-approved templates. Minimalist, creative, or professional — we have it all.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Modern Card */}
            <div className="group reveal fade-bottom delay-300">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200 transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 h-full flex flex-col">
                <div className="relative aspect-[1/1.4] bg-slate-100 overflow-hidden group-hover:opacity-95 transition-opacity">
                  <img
                    src="/modern-resume.png"
                    alt="Modern Resume Template"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                    <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-full px-8 py-6 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Use This Template</Button>
                  </div>
                </div>
                <div className="p-6 text-center mt-auto">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Modern</h3>
                  <p className="text-slate-500">Best for tech & startups</p>
                </div>
              </div>
            </div>

            {/* Classic Card */}
            <div className="group reveal fade-bottom delay-500">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200 transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 h-full flex flex-col">
                <div className="relative aspect-[1/1.4] bg-slate-100 overflow-hidden group-hover:opacity-95 transition-opacity">
                  <img
                    src="/classic-resume.png"
                    alt="Classic Resume Template"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                    <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-full px-8 py-6 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Use This Template</Button>
                  </div>
                </div>
                <div className="p-6 text-center mt-auto">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Classic</h3>
                  <p className="text-slate-500">Timeless & professional</p>
                </div>
              </div>
            </div>

            {/* Minimalist Card */}
            <div className="group reveal fade-bottom delay-700">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200 transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 h-full flex flex-col">
                <div className="relative aspect-[1/1.4] bg-slate-100 overflow-hidden group-hover:opacity-95 transition-opacity">
                  <img
                    src="/minimalist-resume.png"
                    alt="Minimalist Resume Template"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                    <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-full px-8 py-6 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Use This Template</Button>
                  </div>
                </div>
                <div className="p-6 text-center mt-auto">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Minimalist</h3>
                  <p className="text-slate-500">Clean & effective</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - New Scrollable Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 reveal fade-bottom">
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-6">Simple Process</div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">How it works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Build your professional resume in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent -z-10"></div>

            {/* Step 1 */}
            <div className="reveal fade-bottom delay-300 text-center">
              <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-blue-50 shadow-xl flex items-center justify-center mb-8 relative z-10">
                <span className="text-4xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Pick a Template</h3>
              <p className="text-slate-600 leading-relaxed">Choose from our selection of recruiter-approved templates designed for various industries.</p>
            </div>

            {/* Step 2 */}
            <div className="reveal fade-bottom delay-500 text-center">
              <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-blue-50 shadow-xl flex items-center justify-center mb-8 relative z-10">
                <span className="text-4xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Enter Your Info</h3>
              <p className="text-slate-600 leading-relaxed">Fill in your details manually or let our AI help you write compelling descriptions.</p>
            </div>

            {/* Step 3 */}
            <div className="reveal fade-bottom delay-700 text-center">
              <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-blue-50 shadow-xl flex items-center justify-center mb-8 relative z-10">
                <span className="text-4xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Download & Apply</h3>
              <p className="text-slate-600 leading-relaxed">Export your flawless resume as a PDF and start applying to your dream jobs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Social Proof - Redesigned */}
      <section className="py-20 bg-[#1a365d] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/grid-pattern.svg')]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">35%</div>
              <div className="text-blue-200">Higher Salary</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">2x</div>
              <div className="text-blue-200">More Interviews</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">15k+</div>
              <div className="text-blue-200">Resumes Built</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">4.9</div>
              <div className="text-blue-200">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section - Conserved but enhanced */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Loved by professionals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-blue-50/50 p-8 rounded-3xl hover:shadow-lg transition-all duration-300 relative group">
              <div className="absolute top-4 left-4 text-blue-200/50 transform -scale-x-100">
                <Quote size={80} fill="currentColor" />
              </div>
              <div className="relative z-10">
                <div className="mb-6 text-blue-500">
                  <Quote size={40} className="fill-blue-100 text-blue-500" />
                </div>
                <p className="text-slate-700 mb-8 leading-relaxed font-medium text-lg">"Before using AI Resume Pro, my resume was getting lost in the ATS systems. Now I'm getting callbacks from 80% of the positions I apply to."</p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img src="https://i.pravatar.cc/150?img=32" alt="User" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">James Donovan</div>
                    <div className="text-sm text-blue-600 font-medium">Product Manager @ Microsoft</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-blue-50/50 p-8 rounded-3xl hover:shadow-lg transition-all duration-300 relative group">
              <div className="absolute top-4 left-4 text-blue-200/50 transform -scale-x-100">
                <Quote size={80} fill="currentColor" />
              </div>
              <div className="relative z-10">
                <div className="mb-6 text-blue-500">
                  <Quote size={40} className="fill-blue-100 text-blue-500" />
                </div>
                <p className="text-slate-700 mb-8 leading-relaxed font-medium text-lg">"The templates are just beautiful. Enhancv charge way more for this quality. This tool is a game changer for job seekers."</p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img src="https://i.pravatar.cc/150?img=11" alt="User" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Mark T.</div>
                    <div className="text-sm text-blue-600 font-medium">Software Engineer @ Spotify</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-blue-50/50 p-8 rounded-3xl hover:shadow-lg transition-all duration-300 relative group">
              <div className="absolute top-4 left-4 text-blue-200/50 transform -scale-x-100">
                <Quote size={80} fill="currentColor" />
              </div>
              <div className="relative z-10">
                <div className="mb-6 text-blue-500">
                  <Quote size={40} className="fill-blue-100 text-blue-500" />
                </div>
                <p className="text-slate-700 mb-8 leading-relaxed font-medium text-lg">"Simple, fast, and effective. The resume check feature helped me spot errors I would have missed otherwise. Highly recommended!"</p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img src="https://i.pravatar.cc/150?img=5" alt="User" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Emily R.</div>
                    <div className="text-sm text-blue-600 font-medium">Marketing Lead @ Amazon</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-50"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to upgrade your career?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Join thousands of job seekers who have successfully landed jobs at top companies.</p>
          <Button
            size="lg"
            onClick={handleButtonClick}
            className="bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 transition-all rounded-full px-10 py-6 text-lg font-bold shadow-xl"
          >
            Create My Resume Now
          </Button>
          <p className="mt-6 text-blue-200 text-sm">No credit card required · Free to start</p>
        </div>
      </section>

      <style>{`
        .reveal {
          position: relative;
          opacity: 0;
          transition: all 0.8s ease;
        }
        
        .reveal.active {
          opacity: 1;
        }
        
        .fade-bottom {
          transform: translateY(40px);
        }
        
        .fade-bottom.active {
          transform: translateY(0);
        }
        
        .delay-300 {
          transition-delay: 0.3s;
        }
        
        .delay-500 {
          transition-delay: 0.5s;
        }
        
        .delay-700 {
          transition-delay: 0.7s;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee {
          animation: marquee 20s linear infinite;
        }

        .fade-mask-x {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
      <SignInPromptModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
    </div>
  );
};

export default Home;
