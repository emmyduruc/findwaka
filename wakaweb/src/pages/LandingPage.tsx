import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, MapPin, MessageCircle, Phone, CheckCircle, Bike, Car, Truck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useUIStore } from '../stores/ui';
import { useAuthStore } from '../stores/auth';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSignInModalOpen } = useUIStore();
  const { authStatus } = useAuthStore();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const missionRef = useRef(null);
  const featuresRef = useRef(null);
  const comingSoonRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const missionInView = useInView(missionRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 });
  const comingSoonInView = useInView(comingSoonRef, { once: true, amount: 0.3 });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const handleFindDriver = () => {
    if (authStatus === 'guest') {
      setSignInModalOpen(true);
    } else {
      navigate('/nearby');
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity, scale, y }}
        className="relative min-h-screen flex items-center justify-center px-4"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accentPrimary/10 via-background to-accentSecondary/10" />
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-accentPrimary to-accentSecondary bg-clip-text text-transparent">
              WakaJor
            </h1>
            <p className="text-2xl md:text-4xl text-textMuted mb-4 font-light">
              Easy Access to Mobility
            </p>
            <p className="text-lg md:text-xl text-textMuted mb-12 max-w-2xl mx-auto">
            In many villages, transport is stress.
You walk far to the road, you wait long, and sometimes nobody comes.
Students, workers, parents, everyone feels this every day.

You are not alone 💪🏽🤍
We help you find nearby bike and keke close to you.
Open the app, see who is around, and call a rider.
Your ride is closer than you think 🛵            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={handleFindDriver}
                className="text-lg px-8 py-4"
              >
                Find a Driver Nearby
                <ArrowRight className="ml-2 inline" size={20} />
              </Button>
              {authStatus === 'guest' && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setSignInModalOpen(true)}
                  className="text-lg px-8 py-4"
                >
                  Sign In
                </Button>
              )}
            </div>
          </motion.div>

          {/* Vehicle Images */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {[
              { image: '/images/okada.png', label: 'Okada', color: 'from-accentPrimary to-cyan-500' },
              { image: '/images/keke.png', label: 'Keke', color: 'from-accentSecondary to-purple-500' },
              { image: '/images/car.png', label: 'Moto', color: 'from-success to-emerald-500' },
            ].map((vehicle, index) => (
              <motion.div
                key={vehicle.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
                className="relative"
              >
                <div className={`bg-gradient-to-br ${vehicle.color} rounded-3xl p-8 backdrop-blur-sm border border-border/50 overflow-hidden`}>
                  <img 
                    src={vehicle.image} 
                    alt={vehicle.label}
                    className="w-full h-48 object-contain mb-4"
                  />
                  <p className="text-xl font-semibold text-white text-center">{vehicle.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="rotate-90 text-textMuted" size={24} />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        ref={missionRef}
        initial={{ opacity: 0 }}
        animate={missionInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="py-32 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={missionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-textPrimary">
              Our Mission
            </h2>
            <p className="text-xl md:text-2xl text-textMuted leading-relaxed">
              We are on a mission to give rural people easy access to mobility. 
              You live in a rural community. Areas where you have to walk quite some distance 
              to find a bike, or sometimes you come out and you don't see a bike. No worries. 
              We got you covered. You can find nearby moto close to you. Something local rural 
              people connects with their pain.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              { icon: MapPin, title: 'Find Nearby', desc: 'See all available drivers in your area' },
              { icon: MessageCircle, title: 'Easy Communication', desc: 'Chat, call, or WhatsApp directly' },
              { icon: CheckCircle, title: 'Verified Drivers', desc: 'All drivers are verified and trusted' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                animate={missionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-surface rounded-3xl p-8 border border-border hover:border-accentPrimary/50 transition-all"
              >
                <feature.icon size={48} className="text-accentPrimary mb-4" />
                <h3 className="text-2xl font-semibold mb-3 text-textPrimary">{feature.title}</h3>
                <p className="text-textMuted">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        ref={featuresRef}
        initial={{ opacity: 0 }}
        animate={featuresInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="py-32 px-4 bg-surface/50"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-16 text-center text-textPrimary"
          >
            What We Offer
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Find a Driver',
                desc: 'Find nearby moto, okada, and keke close to you. Connect with verified drivers in your area instantly.',
                icon: MapPin,
              },
              {
                title: 'Become a Driver',
                desc: 'Have a bike, keke, or moto? Turn your vehicle into a money-making opportunity. Start earning today.',
                icon: ArrowRight,
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={featuresInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-background rounded-3xl p-8 border border-border hover:border-accentPrimary/50 transition-all"
              >
                <feature.icon size={48} className="text-accentSecondary mb-4" />
                <h3 className="text-3xl font-semibold mb-4 text-textPrimary">{feature.title}</h3>
                <p className="text-lg text-textMuted">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Coming Soon Section */}
      <motion.section
        ref={comingSoonRef}
        initial={{ opacity: 0 }}
        animate={comingSoonInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="py-32 px-4"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={comingSoonInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-8 text-textPrimary"
          >
            Coming Soon
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={comingSoonInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-textMuted mb-12"
          >
            We're working on exciting new features to make transportation even more accessible
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Keke Leasing', image: '/images/keke.png' },
              { title: 'Moto Leasing', image: '/images/car.png' },
              { title: 'Okada Leasing', image: '/images/okada.png' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={comingSoonInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-surface rounded-3xl p-8 border border-border/50 opacity-60 overflow-hidden"
              >
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-32 object-contain mb-4 opacity-50"
                />
                <h3 className="text-2xl font-semibold text-textMuted text-center">{item.title}</h3>
                <p className="text-textMuted mt-2 text-center">Coming Soon</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-32 px-4 bg-gradient-to-r from-accentPrimary/20 to-accentSecondary/20"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-textPrimary">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-textMuted mb-8">
            Join thousands of users who are already using WakaJor for their transportation needs
          </p>
          <Button size="lg" onClick={handleFindDriver} className="text-lg px-8 py-4">
            Find a Driver Nearby
            <ArrowRight className="ml-2 inline" size={20} />
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

