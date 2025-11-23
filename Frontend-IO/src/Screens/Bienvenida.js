import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";

import ParticleSystem from '../Components/Particulas';
import Slideshow from '../Components/Slides';
import FlashCards from '../Components/FlashCards';
import TeamSection from '../Components/TeamSeccion';

function Bienvenida() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  
  const logoOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.1]);
  const logoScale = useTransform(scrollYProgress, [0, 0.3], [1, 2]);
  const logoY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);

  return (
    <>
      <ParticleSystem />
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <main ref={containerRef} style={{ 
          flex: '1',
          position: 'relative',
          zIndex: 1
        }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem',
              position: 'relative'
            }}
          >
            <motion.h1 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ 
                color: 'white',
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                marginBottom: '1rem',
                fontWeight: '800',
                position: 'relative',
                zIndex: 10
              }}
            >
              Sistema SAT
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                marginBottom: '3rem',
                maxWidth: '600px',
                margin: '0 auto 3rem',
                lineHeight: '1.6'
              }}
            >
              Plataforma integral para la gestión académica y seguimiento estudiantil
            </motion.p>

            <motion.div
              style={{
                position: 'fixed',
                left: '50%',
                top: '50%',
                x: '-50%',
                y: '-50%',
                opacity: logoOpacity,
                scale: logoScale,
                translateY: logoY,
                zIndex: -1,
                pointerEvents: 'none'
              }}
            >
              <img 
                src="/Logo-USB-3.png" 
                alt="Logo Sistema SAT" 
                style={{ 
                  width: '300px',
                  height: 'auto',
                  filter: 'blur(1px)'
                }} 
              />
            </motion.div>
          </motion.div>

          <Slideshow />

          <FlashCards />

          <TeamSection />
        </main>

        <footer style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(20px)',
          padding: '3rem 2rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              <div>
                <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.3rem' }}>
                  Contacto
                </h4>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
                  correo@sistemaSAT.com<br/>
                  +591 123 456 789
                </p>
              </div>
              <div>
                <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.3rem' }}>
                  Enlaces Rápidos
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
                  <li>
                    <button 
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: 'inherit'
                      }}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      Inicio
                    </button>
                  </li>
                  <li>
                    <button 
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: 'inherit'
                      }}
                      onClick={() => alert('Sección de talleres en desarrollo')}
                    >
                      Talleres
                    </button>
                  </li>
                  <li>
                    <button 
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: 'inherit'
                      }}
                      onClick={() => alert('Sistema de ayuda en desarrollo')}
                    >
                      Ayuda
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.3rem' }}>
                  Acerca de SAT
                </h4>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
                  SItema Academico Fineciero de Titulacion
                </p>
              </div>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              paddingTop: '2rem', 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              © 2024 Sistema SAT. Todos los derechos reservados.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Bienvenida;