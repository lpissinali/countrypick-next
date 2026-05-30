import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import StaticPage from '@/components/StaticPage';
import { getFooterContinents, getActiveLangs } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, pageJsonLd, BASE_URL } from '@/lib/seo';
import { LANGS, type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[]; activeLangs: { code: string; name: string }[]; }

// ─── Per-language content ─────────────────────────────────────────────────────

const C = {
  en: {
    title: 'Terms and Conditions - Country Pick',
    description: 'Read the Terms and Conditions governing your use of Country Pick, the travel platform for exploring countries and discovering hidden gems worldwide.',
    h: 'Terms and <strong>Conditions</strong>',
    updated: 'Last updated: May 30, 2026',
    intro: 'Welcome to Country Pick. By accessing or using <a href="https://www.countrypick.com">www.countrypick.com</a> (the "Website"), you agree to be bound by these Terms and Conditions. Please read them carefully. If you do not agree with any part of these terms, you must not use our Website.',
    s1h: '1. About Country Pick',
    s1p1: 'Country Pick is a travel exploration platform that allows visitors to discover countries, cities, and hidden gems around the world; browse curated lists of top attractions, historical cities, natural wonders, and adventure destinations; and find hotel accommodation through our partner Agoda.',
    s1p2: 'Country Pick is operated by Country Pick ("we", "us", or "our"). You can reach us at <a href="mailto:contact@countrypick.com">contact@countrypick.com</a>.',
    s2h: '2. Acceptable Use',
    s2intro: 'When using Country Pick, you agree not to:',
    s2items: ['Use the Website for any unlawful purpose or in any way that violates applicable local, national, or international law;','Use automated tools (bots, scrapers, or crawlers) to access or extract data from the Website without our prior written consent;','Attempt to gain unauthorised access to any part of the Website or its infrastructure;','Transmit any malware, viruses, or other harmful code;','Interfere with or disrupt the integrity or performance of the Website.'],
    s3h: '3. Intellectual Property',
    s3p1: 'All content on Country Pick — including text, graphics, logos, icons, images, country data, and software — is the property of Country Pick or its licensors and is protected by applicable intellectual property laws.',
    s3p2: 'You may view and print pages from the Website for personal, non-commercial use only. You must not republish, sell, rent, reproduce, or redistribute any material from Country Pick without our express written permission.',
    s4h: '4. Travel Information and Accuracy',
    s4p1: 'Country Pick provides travel information, destination guides, and attraction listings for informational purposes only. While we strive to keep content accurate and up to date, we make no warranties regarding the completeness, accuracy, or timeliness of any travel information on the Website.',
    s4p2: 'Travel conditions, visa requirements, entry restrictions, safety advisories, and local regulations change frequently. You are solely responsible for verifying all travel-related information with official sources before making any travel decisions. Country Pick accepts no liability for any loss or inconvenience arising from reliance on information published on the Website.',
    s5h: '5. Third-Party Services and Links',
    s5intro: 'Country Pick integrates with or links to third-party services, including:',
    s5items: ['<strong>Agoda</strong> — hotel and accommodation search. Any booking you make is governed solely by Agoda\'s own terms and conditions. Country Pick is not a party to any such transaction.','<strong>GetYourGuide</strong> — activity and tour listings displayed on destination pages. Any booking you make is governed solely by GetYourGuide\'s own terms and conditions. Country Pick earns a referral commission but is not a party to any transaction.','<strong>Google Analytics</strong> — used to analyse Website usage. Data collection is governed by Google\'s Privacy Policy.','<strong>Google AdSense</strong> — used to display relevant advertisements. Ad content is served and governed by Google.','<strong>Social platforms</strong> — links to Facebook and X for sharing. Your use of those platforms is governed by their respective terms.'],
    s5outro: 'We are not responsible for the content, policies, or practices of any third-party websites or services linked from the Website.',
    s6h: '6. Local Storage',
    s6p: 'Country Pick stores certain data in your browser\'s local storage (not cookies) to provide core functionality: your visited and wishlist country selections for the interactive map (<code>cp_map_v1</code>), a cached copy of the map\'s geographic data to improve load times (<code>cp_geojson_v1</code>), and your cookie consent preference (<code>cp_consent</code>). This data is stored only on your device and is never transmitted to our servers. You can clear it at any time by clearing your browser\'s site data.',
    s7h: '7. Advertising',
    s7p: 'Country Pick displays third-party advertisements through Google AdSense. Advertisements are clearly distinguished from editorial content. We do not endorse any advertised products or services.',
    s8h: '8. Privacy and Cookies',
    s8p: 'Your use of Country Pick is also governed by our Privacy Policy and Cookies Policy, both of which are incorporated into these Terms by reference.',
    s9h: '9. Disclaimer of Warranties',
    s9p: 'The Website and all its content are provided on an "as is" and "as available" basis without any warranty of any kind, express or implied. To the fullest extent permitted by law, Country Pick disclaims all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
    s10h: '10. Limitation of Liability',
    s10p: 'To the maximum extent permitted by applicable law, Country Pick shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Website, including loss of data, revenue, or profits. Nothing in these Terms limits our liability for death or personal injury caused by our negligence, or any other liability that cannot be excluded by law.',
    s11h: '11. Changes to These Terms',
    s11p: 'We may update these Terms and Conditions from time to time. When we do, we will revise the "Last updated" date at the top of this page. Your continued use of the Website after changes are posted constitutes your acceptance of the revised Terms.',
    s12h: '12. Governing Law',
    s12p: 'These Terms and Conditions are governed by and construed in accordance with applicable law. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts.',
    s13h: '13. Contact Us',
    s13p: 'If you have any questions about these Terms and Conditions, please contact us:',
    breadcrumb: 'Terms and Conditions',
  },
  pt: {
    title: 'Termos e Condições - Country Pick',
    description: 'Leia os Termos e Condições que regem o uso do Country Pick, a plataforma de viagens para explorar países e descobrir destinos incríveis no mundo todo.',
    h: 'Termos e <strong>Condições</strong>',
    updated: 'Última atualização: 30 de maio de 2026',
    intro: 'Bem-vindo ao Country Pick. Ao acessar ou usar o <a href="https://www.countrypick.com">www.countrypick.com</a> (o "Site"), você concorda com estes Termos e Condições. Leia-os com atenção. Se não concordar com qualquer parte destes termos, não utilize o nosso Site.',
    s1h: '1. Sobre o Country Pick',
    s1p1: 'O Country Pick é uma plataforma de exploração de viagens que permite aos visitantes descobrir países, cidades e destinos incríveis ao redor do mundo; navegar por listas de principais atrações, cidades históricas, maravilhas naturais e destinos de aventura; e encontrar hospedagem pelo nosso parceiro Agoda.',
    s1p2: 'O Country Pick é operado pela Country Pick ("nós", "nos" ou "nosso"). Você pode nos contatar em <a href="mailto:contact@countrypick.com">contact@countrypick.com</a>.',
    s2h: '2. Uso Aceitável',
    s2intro: 'Ao usar o Country Pick, você concorda em não:',
    s2items: ['Utilizar o Site para qualquer finalidade ilegal ou de forma que viole leis locais, nacionais ou internacionais aplicáveis;','Utilizar ferramentas automatizadas (bots, scrapers ou crawlers) para acessar ou extrair dados do Site sem o nosso consentimento prévio por escrito;','Tentar obter acesso não autorizado a qualquer parte do Site ou da sua infraestrutura;','Transmitir malware, vírus ou qualquer outro código prejudicial;','Interferir ou interromper a integridade ou o desempenho do Site.'],
    s3h: '3. Propriedade Intelectual',
    s3p1: 'Todo o conteúdo do Country Pick — incluindo textos, gráficos, logos, ícones, imagens, dados de países e software — é propriedade do Country Pick ou de seus licenciadores e está protegido pelas leis de propriedade intelectual aplicáveis.',
    s3p2: 'Você pode visualizar e imprimir páginas do Site apenas para uso pessoal e não comercial. Não é permitido republicar, vender, alugar, reproduzir ou redistribuir qualquer material do Country Pick sem nossa autorização expressa por escrito.',
    s4h: '4. Informações de Viagem e Precisão',
    s4p1: 'O Country Pick fornece informações de viagem, guias de destinos e listagens de atrações apenas para fins informativos. Embora nos esforcemos para manter o conteúdo preciso e atualizado, não oferecemos garantias quanto à completude, precisão ou atualidade das informações de viagem disponíveis no Site.',
    s4p2: 'As condições de viagem, requisitos de visto, restrições de entrada, avisos de segurança e regulamentos locais mudam com frequência. Você é o único responsável por verificar todas as informações relacionadas à viagem em fontes oficiais antes de tomar qualquer decisão. O Country Pick não aceita nenhuma responsabilidade por perdas ou inconvenientes decorrentes da confiança em informações publicadas no Site.',
    s5h: '5. Serviços e Links de Terceiros',
    s5intro: 'O Country Pick integra ou estabelece links com serviços de terceiros, incluindo:',
    s5items: ['<strong>Agoda</strong> — busca de hotéis e acomodações. Qualquer reserva que você fizer é regida exclusivamente pelos próprios termos e condições da Agoda. O Country Pick não é parte de nenhuma transação.','<strong>GetYourGuide</strong> — listagens de atividades e passeios exibidas nas páginas de destinos. Qualquer reserva que você fizer é regida exclusivamente pelos próprios termos e condições do GetYourGuide. O Country Pick recebe uma comissão de indicação, mas não é parte de nenhuma transação.','<strong>Google Analytics</strong> — usado para analisar o uso do Site. A coleta de dados é regida pela Política de Privacidade do Google.','<strong>Google AdSense</strong> — usado para exibir anúncios relevantes. O conteúdo dos anúncios é veiculado e regido pelo Google.','<strong>Plataformas sociais</strong> — links para Facebook e X para compartilhamento. O uso dessas plataformas é regido pelos respectivos termos de cada uma.'],
    s5outro: 'Não somos responsáveis pelo conteúdo, políticas ou práticas de sites ou serviços de terceiros vinculados ao Site.',
    s6h: '6. Armazenamento Local',
    s6p: 'O Country Pick armazena determinados dados no armazenamento local do seu navegador (não em cookies) para fornecer funcionalidades essenciais: suas seleções de países visitados e na lista de desejos no mapa interativo (<code>cp_map_v1</code>), uma cópia em cache dos dados geográficos do mapa para melhorar o tempo de carregamento (<code>cp_geojson_v1</code>), e sua preferência de consentimento de cookies (<code>cp_consent</code>). Esses dados são armazenados apenas no seu dispositivo e nunca são transmitidos aos nossos servidores. Você pode apagá-los a qualquer momento limpando os dados do site no seu navegador.',
    s7h: '7. Publicidade',
    s7p: 'O Country Pick exibe anúncios de terceiros por meio do Google AdSense. Os anúncios são claramente distinguidos do conteúdo editorial. Não endossamos nenhum produto ou serviço anunciado.',
    s8h: '8. Privacidade e Cookies',
    s8p: 'O uso do Country Pick também é regido pela nossa Política de Privacidade e pela nossa Política de Cookies, ambas incorporadas a estes Termos por referência.',
    s9h: '9. Isenção de Garantias',
    s9p: 'O Site e todo o seu conteúdo são fornecidos "no estado em que se encontram" e "conforme disponíveis", sem qualquer garantia de qualquer tipo, expressa ou implícita. Na máxima extensão permitida por lei, o Country Pick se isenta de todas as garantias, incluindo garantias implícitas de comercialização, adequação a um propósito específico e não violação.',
    s10h: '10. Limitação de Responsabilidade',
    s10p: 'Na máxima extensão permitida pela lei aplicável, o Country Pick não será responsável por quaisquer danos indiretos, incidentais, especiais, consequentes ou punitivos decorrentes do uso do Site, incluindo perda de dados, receita ou lucros. Nada nestes Termos limita a nossa responsabilidade por morte ou danos pessoais causados por nossa negligência, ou qualquer outra responsabilidade que não possa ser excluída por lei.',
    s11h: '11. Alterações nestes Termos',
    s11p: 'Podemos atualizar estes Termos e Condições periodicamente. Quando isso ocorrer, revisaremos a data de "Última atualização" no topo desta página. O uso continuado do Site após a publicação das alterações constitui aceitação dos Termos revisados.',
    s12h: '12. Lei Aplicável',
    s12p: 'Estes Termos e Condições são regidos e interpretados de acordo com a lei aplicável. Quaisquer disputas relacionadas a estes Termos estarão sujeitas à jurisdição exclusiva dos tribunais competentes.',
    s13h: '13. Fale Conosco',
    s13p: 'Se tiver alguma dúvida sobre estes Termos e Condições, entre em contato conosco:',
    breadcrumb: 'Termos e Condições',
  },
  es: {
    title: 'Términos y Condiciones - Country Pick',
    description: 'Lee los Términos y Condiciones que rigen el uso de Country Pick, la plataforma de viajes para explorar países y descubrir destinos increíbles en todo el mundo.',
    h: 'Términos y <strong>Condiciones</strong>',
    updated: 'Última actualización: 30 de mayo de 2026',
    intro: 'Bienvenido a Country Pick. Al acceder o utilizar <a href="https://www.countrypick.com">www.countrypick.com</a> (el "Sitio Web"), aceptas estos Términos y Condiciones. Léelos detenidamente. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro Sitio Web.',
    s1h: '1. Acerca de Country Pick',
    s1p1: 'Country Pick es una plataforma de exploración de viajes que permite a los visitantes descubrir países, ciudades y destinos únicos en todo el mundo; navegar por listas curadas de las mejores atracciones, ciudades históricas, maravillas naturales y destinos de aventura; y encontrar alojamiento a través de nuestro socio Agoda.',
    s1p2: 'Country Pick es operado por Country Pick ("nosotros" o "nuestro"). Puedes contactarnos en <a href="mailto:contact@countrypick.com">contact@countrypick.com</a>.',
    s2h: '2. Uso Aceptable',
    s2intro: 'Al utilizar Country Pick, aceptas no:',
    s2items: ['Utilizar el Sitio Web para ningún propósito ilegal o de manera que viole las leyes locales, nacionales o internacionales aplicables;','Utilizar herramientas automatizadas (bots, scrapers o crawlers) para acceder o extraer datos del Sitio Web sin nuestro consentimiento previo por escrito;','Intentar obtener acceso no autorizado a ninguna parte del Sitio Web o su infraestructura;','Transmitir malware, virus u otro código dañino;','Interferir o interrumpir la integridad o el rendimiento del Sitio Web.'],
    s3h: '3. Propiedad Intelectual',
    s3p1: 'Todo el contenido de Country Pick — incluyendo texto, gráficos, logotipos, iconos, imágenes, datos de países y software — es propiedad de Country Pick o de sus licenciantes y está protegido por las leyes de propiedad intelectual aplicables.',
    s3p2: 'Puedes ver e imprimir páginas del Sitio Web únicamente para uso personal y no comercial. No puedes republicar, vender, alquilar, reproducir o redistribuir ningún material de Country Pick sin nuestro permiso expreso por escrito.',
    s4h: '4. Información de Viaje y Precisión',
    s4p1: 'Country Pick proporciona información de viaje, guías de destinos y listados de atracciones únicamente con fines informativos. Aunque nos esforzamos por mantener el contenido actualizado y preciso, no ofrecemos garantías sobre la integridad, precisión o actualidad de ninguna información de viaje en el Sitio Web.',
    s4p2: 'Las condiciones de viaje, los requisitos de visado, las restricciones de entrada, los avisos de seguridad y las normativas locales cambian frecuentemente. Eres el único responsable de verificar toda la información relacionada con viajes en fuentes oficiales antes de tomar cualquier decisión. Country Pick no acepta ninguna responsabilidad por pérdidas o inconvenientes derivados de la confianza en información publicada en el Sitio Web.',
    s5h: '5. Servicios y Enlaces de Terceros',
    s5intro: 'Country Pick se integra o enlaza con servicios de terceros, incluyendo:',
    s5items: ['<strong>Agoda</strong> — búsqueda de hoteles y alojamientos. Cualquier reserva que realices se rige exclusivamente por los propios términos y condiciones de Agoda. Country Pick no es parte de ninguna transacción.','<strong>GetYourGuide</strong> — listados de actividades y tours en páginas de destinos. Cualquier reserva que realices se rige exclusivamente por los propios términos y condiciones de GetYourGuide. Country Pick recibe una comisión por referencia pero no es parte de ninguna transacción.','<strong>Google Analytics</strong> — utilizado para analizar el uso del Sitio Web. La recopilación de datos se rige por la Política de Privacidad de Google.','<strong>Google AdSense</strong> — utilizado para mostrar anuncios relevantes. El contenido publicitario es gestionado por Google.','<strong>Plataformas sociales</strong> — enlaces a Facebook y X para compartir. Tu uso de esas plataformas se rige por sus respectivos términos.'],
    s5outro: 'No somos responsables del contenido, las políticas ni las prácticas de ningún sitio web o servicio de terceros enlazado desde el Sitio Web.',
    s6h: '6. Almacenamiento Local',
    s6p: 'Country Pick almacena ciertos datos en el almacenamiento local de tu navegador (no en cookies) para proporcionar funcionalidades esenciales: tus selecciones de países visitados y en lista de deseos en el mapa interactivo (<code>cp_map_v1</code>), una copia en caché de los datos geográficos del mapa para mejorar los tiempos de carga (<code>cp_geojson_v1</code>), y tu preferencia de consentimiento de cookies (<code>cp_consent</code>). Estos datos se almacenan únicamente en tu dispositivo y nunca se transmiten a nuestros servidores. Puedes eliminarlos en cualquier momento borrando los datos del sitio en tu navegador.',
    s7h: '7. Publicidad',
    s7p: 'Country Pick muestra anuncios de terceros a través de Google AdSense. Los anuncios se distinguen claramente del contenido editorial. No respaldamos ningún producto o servicio anunciado.',
    s8h: '8. Privacidad y Cookies',
    s8p: 'Tu uso de Country Pick también se rige por nuestra Política de Privacidad y nuestra Política de Cookies, ambas incorporadas a estos Términos por referencia.',
    s9h: '9. Exclusión de Garantías',
    s9p: 'El Sitio Web y todo su contenido se proporcionan "tal cual" y "según disponibilidad" sin ninguna garantía de ningún tipo, expresa o implícita. En la máxima medida permitida por la ley, Country Pick renuncia a todas las garantías, incluidas las garantías implícitas de comerciabilidad, idoneidad para un propósito particular y no infracción.',
    s10h: '10. Limitación de Responsabilidad',
    s10p: 'En la máxima medida permitida por la ley aplicable, Country Pick no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo derivado del uso del Sitio Web, incluida la pérdida de datos, ingresos o ganancias. Nada en estos Términos limita nuestra responsabilidad por muerte o lesiones personales causadas por nuestra negligencia, ni cualquier otra responsabilidad que no pueda ser excluida por ley.',
    s11h: '11. Cambios en estos Términos',
    s11p: 'Podemos actualizar estos Términos y Condiciones periódicamente. Cuando lo hagamos, revisaremos la fecha de "Última actualización" en la parte superior de esta página. El uso continuado del Sitio Web tras la publicación de los cambios constituye tu aceptación de los Términos revisados.',
    s12h: '12. Ley Aplicable',
    s12p: 'Estos Términos y Condiciones se rigen e interpretan de acuerdo con la ley aplicable. Cualquier disputa relacionada con estos Términos estará sujeta a la jurisdicción exclusiva de los tribunales competentes.',
    s13h: '13. Contacto',
    s13p: 'Si tienes alguna pregunta sobre estos Términos y Condiciones, contáctanos:',
    breadcrumb: 'Términos y Condiciones',
  },
} as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

const TermsPage: NextPage<Props> = ({ lang, t, continents, activeLangs }) => {
  const canonical = `${BASE_URL}/${lang}/terms`;
  const c = C[lang as keyof typeof C] ?? C.en;

  const seo = {
    title: c.title,
    description: c.description,
    canonical,
    hreflang: buildHreflang('/terms'),
    jsonLd: pageJsonLd({
      url: canonical, name: c.title, description: c.description, lang,
      breadcrumbs: [
        { name: t['home'] ?? 'Home', item: `${BASE_URL}/${lang}` },
        { name: c.breadcrumb, item: canonical },
      ],
    }),
  };

  return (
    <StaticPage activeLangs={activeLangs} lang={lang} t={t} continents={continents} seo={seo} breadcrumb={c.breadcrumb}>
      <div className="main_title add_bottom_30">
        <h3 dangerouslySetInnerHTML={{ __html: c.h }} />
        <p>{c.updated}</p>
        <span><em /></span>
      </div>

      <p dangerouslySetInnerHTML={{ __html: c.intro }} />

      <h2>{c.s1h}</h2>
      <p>{c.s1p1}</p>
      <p dangerouslySetInnerHTML={{ __html: c.s1p2 }} />

      <h2>{c.s2h}</h2>
      <p>{c.s2intro}</p>
      <ol>{c.s2items.map((item, i) => <li key={i}>{item}</li>)}</ol>

      <h2>{c.s3h}</h2>
      <p>{c.s3p1}</p>
      <p>{c.s3p2}</p>

      <h2>{c.s4h}</h2>
      <p>{c.s4p1}</p>
      <p>{c.s4p2}</p>

      <h2>{c.s5h}</h2>
      <p>{c.s5intro}</p>
      <ol>{c.s5items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</ol>
      <p>{c.s5outro}</p>

      <h2>{c.s6h}</h2>
      <p dangerouslySetInnerHTML={{ __html: c.s6p }} />

      <h2>{c.s7h}</h2>
      <p>{c.s7p}</p>

      <h2>{c.s8h}</h2>
      <p>{c.s8p}{' '}
        <Link href={`/${lang}/privacy`}>{lang === 'pt' ? 'Política de Privacidade' : lang === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}</Link>
        {' '}{lang === 'pt' ? 'e' : lang === 'es' ? 'y' : 'and'}{' '}
        <Link href={`/${lang}/cookies`}>{lang === 'pt' ? 'Política de Cookies' : lang === 'es' ? 'Política de Cookies' : 'Cookies Policy'}</Link>.
      </p>

      <h2>{c.s9h}</h2>
      <p>{c.s9p}</p>

      <h2>{c.s10h}</h2>
      <p>{c.s10p}</p>

      <h2>{c.s11h}</h2>
      <p>{c.s11p}</p>

      <h2>{c.s12h}</h2>
      <p>{c.s12p}</p>

      <h2>{c.s13h}</h2>
      <p>{c.s13p}</p>
      <p>
        <strong>Country Pick</strong><br />
        Email: <a href="mailto:contact@countrypick.com">contact@countrypick.com</a><br />
        Website: <a href="https://www.countrypick.com">www.countrypick.com</a>
      </p>
    </StaticPage>
  );
};

export default TermsPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: LANGS.map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang = (params?.lang as Lang) ?? 'en';
  const continents = await getFooterContinents(lang);
  const activeLangs = await getActiveLangs();
  return { props: { activeLangs, lang, t: getTranslations(lang), continents } };
};
