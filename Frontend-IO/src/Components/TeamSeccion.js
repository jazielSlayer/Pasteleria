import { motion } from "framer-motion";


import Jaziel from './Images/Jaziel.jpeg';


const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Cespedes',
    role: 'Desarrolladora Frontend',
    image: Jaziel
  },
  {
    id: 2,
    name: 'Katy',
    role: 'Desarrollador Backend',
    image: Jaziel
  },
  {
    id: 3,
    name: 'Roke',
    role: 'Diseñadora UI/UX',
    image: Jaziel
  },
  {
    id: 4,
    name: 'David',
    role: 'Desarrolladora Frontend',
    image: Jaziel
  },
  {
    id: 5,
    name: 'Jaziel',
    role: 'Desarrollador Frontend',
    image: Jaziel
  },
  {
    id: 6,
    name: 'Lizet Graviela',
    role: 'Desarrollador Frontend',
    image: Jaziel
  },
   {
    id: 7,
    name: 'Gustabo Quispe',
    role: 'Desarrollador Frontend',
    image: Jaziel
  }
];

const TeamSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <motion.h2 
        variants={itemVariants}
        style={{ 
          color: 'white', 
          textAlign: 'center', 
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          marginBottom: '3rem',
          fontWeight: '700'
        }}
      >
        Nuestro Equipo
      </motion.h2>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '3rem',
        justifyContent: 'center'
      }}>
        {TEAM_MEMBERS.map((member) => (
          <motion.div
            key={member.id}
            variants={itemVariants}
            whileHover={{ y: -10, scale: 1.02 }}
            style={{
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2rem',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              maxWidth: '280px',
              width: '100%'
            }}
          >
            <img 
              src={member.image}
              alt={`Foto de ${member.name}`}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                margin: '0 auto 1.5rem',
                objectFit: 'cover',
                border: '3px solid rgba(255, 255, 255, 0.3)'
              }}
            />
            <h3 style={{ 
              color: 'white', 
              marginBottom: '0.5rem', 
              fontSize: '1.4rem',
              fontWeight: '600'
            }}>
              {member.name}
            </h3>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '1.1rem' 
            }}>
              {member.role}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default TeamSection;