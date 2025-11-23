import { API_URL } from "../Api.js";

// Función reutilizable para descargar cualquier PDF
export function downloadPDF(tipo) {
    const endpoints = {
        estudiante: '/pdf/estudiante/:id',
        admin: '/pdf/admin',
        docenteGuia: '/pdf/docente-guia/:id',
        docenteRevisor: '/pdf/docente-revisor/:id'
    };
    
    const filenames = {
        estudiante: 'estudiante.pdf',
        admin: 'admin.pdf',
        docenteGuia: 'docenteguia.pdf',
        docenteRevisor: 'docenterevisor.pdf'
    };
    
    const url = `${API_URL}${endpoints[tipo]}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al descargar el PDF');
            }
            return response.blob();
        })
        .then(blob => {
            const link = document.createElement('a');
            const blobUrl = window.URL.createObjectURL(blob);
            
            link.href = blobUrl;
            link.download = filenames[tipo];
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('No se pudo descargar el PDF');
        });
}

// Funciones específicas
export const buildPDFAdmin = () => downloadPDF('admin');
export const buildPDFEstudiante = () => downloadPDF('estudiante');
export const buildPDFDocenteGuia = () => downloadPDF('docenteGuia');
export const buildPDFDocenteRevisor = () => downloadPDF('docenteRevisor');