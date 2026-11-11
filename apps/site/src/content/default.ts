// Modelo de conteúdo do site. Tudo aqui pode ser alterado pelo portal.
export interface Item { t: string; d: string }
export interface Fact { k: string; v: string }
export interface Qa { q: string; a: string }

export interface Content {
  brand: { name: string; tag: string; logo: string };
  hero: { title: string; title2: string; sub: string; cta1: string; cta2: string; facts: string[]; photo: string };
  services: { title: string; lead: string; items: Item[] };
  photos: string[];
  where: { title: string; lead: string; items: Item[] };
  steps: { title: string; items: Item[] };
  about: { title: string; text: string; facts: Fact[] };
  faq: { title: string; items: Qa[] };
  contact: { title: string; sub: string; address: string; phone: string; whatsapp: string; email: string; hours: string };
  footer: string;
  theme: { accent: string; ink: string; paper: string };
}

export interface Lead { id: string | number; at: string; name: string; contact: string; service?: string; message?: string }

export const DEFAULT: Content = {
  brand: { name: 'HS Logística', tag: 'e Armazenagem', logo: '' },
  hero: {
    title: 'Armazenagem e logística em', title2: 'Foz do Iguaçu.',
    sub: 'Sua carga em movimento, seu negócio em crescimento. Armazém geral, transporte e carga e descarga na BR-277, a minutos do Paraguai e da Argentina.',
    cta1: 'Pedir cotação', cta2: 'Ver serviços',
    facts: ['BR-277, Foz do Iguaçu — PR', 'Em operação desde 2013', 'Armazém geral com emissão de warrant'],
    photo: '',
  },
  services: {
    title: 'Serviços de armazenagem e transporte',
    lead: 'Do recebimento à expedição, sua carga fica guardada, conferida e pronta para o próximo trecho.',
    items: [
      { t: 'Armazéns gerais', d: 'Guarda e conservação de mercadorias de terceiros, com controle de entradas e saídas.' },
      { t: 'Emissão de warrant', d: 'Conhecimento de depósito e warrant sobre a mercadoria armazenada, para usar como garantia de crédito.' },
      { t: 'Transporte', d: 'Transporte seguro, rastreado e preparado para atender às demandas da sua operação.' },
      { t: 'Carga e descarga', d: 'Equipe e equipamentos para movimentar sua carga com agilidade e cuidado.' },
      { t: 'Organização de estoque', d: 'Espaço e mercadorias organizados para uma operação mais eficiente.' },
      { t: 'Apoio à fronteira', d: 'Ponto de apoio para cargas de importação e exportação que cruzam a Tríplice Fronteira.' },
    ],
  },
  photos: ['', '', ''],
  where: {
    title: 'A última parada da BR‑277 antes da fronteira',
    lead: 'A rodovia começa no Porto de Paranaguá e termina cerca de 730 km depois, na Ponte da Amizade. A HS fica nesse último trecho.',
    items: [
      { t: 'Paraguai', d: 'Pela Ponte Internacional da Amizade, a ligação com Ciudad del Este.' },
      { t: 'Argentina', d: 'Pela Ponte Tancredo Neves, o acesso a Puerto Iguazú.' },
      { t: 'Porto de Paranaguá', d: 'Pela BR-277 de ponta a ponta, cruzando o Paraná até o litoral.' },
    ],
  },
  steps: {
    title: 'Quatro etapas da carga no armazém',
    items: [
      { t: 'Recebimento', d: 'O veículo chega e a carga é descarregada pela nossa equipe.' },
      { t: 'Conferência', d: 'Volumes e documentos são conferidos e registrados.' },
      { t: 'Armazenagem', d: 'A mercadoria fica guardada pelo tempo que a operação pedir.' },
      { t: 'Expedição', d: 'Carregamos e liberamos para o próximo destino.' },
    ],
  },
  about: {
    title: 'Empresa de Foz do Iguaçu desde 2013',
    text: 'A HS Logística e Armazenagem nasceu em dezembro de 2013 em Foz do Iguaçu, uma das fronteiras terrestres mais movimentadas da América do Sul.\n\nAtendemos transportadoras, importadores e exportadores que precisam de um ponto confiável perto da fronteira.',
    facts: [
      { k: 'Razão social', v: 'HS Logística e Armazenagem Ltda.' },
      { k: 'CNPJ', v: '19.417.696/0001-84' },
      { k: 'Fundação', v: '05/12/2013' },
      { k: 'Atividade', v: 'Armazéns gerais com emissão de warrant; carga e descarga' },
    ],
  },
  faq: {
    title: 'Perguntas sobre armazenagem',
    items: [
      { q: 'Que tipo de carga vocês recebem?', a: 'Diga o produto, o volume e o prazo. Avaliamos cada caso e respondemos com as condições de armazenagem.' },
      { q: 'O que é warrant?', a: 'É um título emitido pelo armazém geral junto com o conhecimento de depósito. Ele representa a mercadoria armazenada e pode ser usado como garantia.' },
      { q: 'Como peço uma cotação?', a: 'Preencha o formulário no fim da página ou ligue. Retornamos com a proposta.' },
    ],
  },
  contact: {
    title: 'Cotação de armazenagem e transporte', sub: 'Conte o que precisa guardar ou movimentar. Respondemos com uma proposta.',
    address: 'Rodovia BR-277, km 730, Novo Mundo, Foz do Iguaçu — PR',
    phone: '(45) 3522-1013', whatsapp: '', email: '', hours: 'Segunda a sexta, horário comercial',
  },
  footer: 'HS Logística e Armazenagem Ltda. · CNPJ 19.417.696/0001-84 · Foz do Iguaçu — PR',
  theme: { accent: '#67AA4B', ink: '#0E234E', paper: '#FFFFFF' },
};
