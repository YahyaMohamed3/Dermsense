import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Dermatology Patient',
    content: "DermaSense helped me identify a suspicious mole that turned out to be an early stage melanoma. The early detection was crucial for my treatment and recovery.",
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    rating: 5
  },
  {
    id: 2,
    name: 'Michael Torres',
    role: 'Healthcare Professional',
    content: "As a healthcare provider, I've recommended DermaSense to many of my patients. It's an excellent preliminary screening tool that helps educate patients about potential skin concerns.",
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    rating: 5
  },
  {
    id: 3,
    name: 'Emily Chen',
    role: 'Regular User',
    content: "I use DermaSense regularly to monitor my skin. The app is intuitive, and the detailed explanations help me understand my skin health better than ever before.",
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    rating: 4
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  };

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-primary-600 dark:text-secondary-400 font-medium"
          >
            Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mt-2 mb-4"
          >
            What Our Users Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-300"
          >
            Don't just take our word for it. Hear from people who have used DermaSense to improve their skin health.
          </motion.p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden py-10">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-8">
                <img
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg"
                />
                <div className="absolute -bottom-3 -right-3 bg-primary-600 text-white rounded-full p-2">
                  <Star className="w-4 h-4 fill-white" strokeWidth={1.5} />
                </div>
              </div>
              
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < testimonials[currentIndex].rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              
              <blockquote className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-300 mb-6 max-w-3xl">
                "{testimonials[currentIndex].content}"
              </blockquote>
              
              <div>
                <p className="font-semibold text-lg">{testimonials[currentIndex].name}</p>
                <p className="text-slate-500 dark:text-slate-400">{testimonials[currentIndex].role}</p>
              </div>
            </motion.div>
          </div>
          
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </div>
          
          <div className="flex justify-center mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 mx-1 rounded-full ${
                  index === currentIndex
                    ? 'bg-primary-600 dark:bg-secondary-400'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}