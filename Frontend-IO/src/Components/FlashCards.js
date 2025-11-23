import React, { useMemo } from "react";
import { motion } from "framer-motion";

const FLASH_CARDS = [
  {
    id: 1,
    title: "Gestión de Talleres",
    description: "Sistema integrado para administrar talleres educativos y su progreso.",
    icon: "🎓"
  },
  {
    id: 2,
    title: "Gestion de Estudiantes",
    description: "Monitoreo en tiempo real del estudiante",
    icon: "📊"
  },
  {
    id: 3,
    title: "Gestion de docentes",
    description: "Herramientas para la gestion de docentes",
    icon: "✅"
  }
];

const FlashCards = () => {
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }), []);

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {FLASH_CARDS.map((card) => (
          <motion.div
            key={card.id}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2.5rem',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}
          >
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }}>
              {card.icon}
            </div>
            <h3 style={{ 
              color: 'white', 
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              {card.title}
            </h3>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
              fontSize: '1.1rem'
            }}>
              {card.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default FlashCards;