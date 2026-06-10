import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_xxxxxxx';
const TEMPLATE_ID = 'template_xxxxxxx';
const PUBLIC_KEY = 'xxxxxxxxxxxxxx';

export const sendRdvEmail = async (data: {
  animalNom: string;
  typeAnimal: string;
  maladie: string;
  dateRdv: string;
  motif: string;
}) => {
  try {
    const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      animal_nom: data.animalNom,
      type_animal: data.typeAnimal,
      maladie: data.maladie || 'Non spécifiée',
      date_rdv: data.dateRdv,
      motif: data.motif || 'Non spécifié',
    }, PUBLIC_KEY);
    return res;
  } catch (err) {
    console.error('EmailJS error:', err);
    throw err;
  }
};
