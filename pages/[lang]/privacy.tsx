import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import StaticPage from '@/components/StaticPage';
import { getFooterContinents, getActiveLangs } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, pageJsonLd, BASE_URL } from '@/lib/seo';
import { LANGS, type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[]; activeLangs: { code: string; name: string }[]; }

const C = {
  en: {
    title: 'Privacy Policy - Country Pick',
    description: 'Learn how Country Pick collects, uses, and protects your personal data when you visit our travel exploration platform.',
    h: 'Privacy <strong>Policy</strong>',
    updated: 'Last updated: May 30, 2026',
    breadcrumb: 'Privacy Policy',
    intro: 'Country Pick ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains what data we collect when you visit www.countrypick.com (the "Website"), how we use it, and your rights in relation to it.',
    introLink: 'Please read this policy alongside our',
    introLinkTerms: 'Terms and Conditions',
    introLinkAnd: 'and',
    introLinkCookies: 'Cookies Policy',
    s1h: '1. Who We Are',
    s1p: 'Country Pick is a travel exploration platform. If you have any questions about this Privacy Policy or how we handle your data, please contact us at',
    s2h: '2. What Data We Collect',
    s2p: 'As a visitor to Country Pick, we collect only the data necessary to operate and improve the Website.',
    s2a: 'Usage and Technical Data',
    s2ap: 'When you visit the Website, we automatically collect certain technical information, including your IP address (anonymised where possible), browser type and version, operating system, referring URL, pages visited, time spent on pages, and general geographic location (country or city level). This data is collected via Google Analytics and does not identify you personally.',
    s2b: 'Language Preference',
    s2bp: 'Your selected language is reflected in the URL path (e.g. /pt/ or /es/) and is not stored as a cookie.',
    s2c: 'Cookie Data',
    s2cp1: 'We use cookies and similar technologies to operate the Website and serve relevant advertising. For full details, see our',
    s2cp2: 'Cookies Policy',
    s2d: 'Contact Enquiries',
    s2dp: 'If you contact us via email, we collect your name, email address, and the content of your message in order to respond to your enquiry. This data is not used for any other purpose.',
    s3h: '3. How We Use Your Data',
    s3items: ['<strong>Operating the Website</strong> — to deliver pages correctly and restore your interactive map selections.','<strong>Analytics</strong> — to understand how visitors use the Website so we can improve content and performance. We use Google Analytics for this purpose.','<strong>Advertising</strong> — to display relevant advertisements through Google AdSense. Google may use data from your visit to personalise ads shown to you on Country Pick and other websites.','<strong>Responding to enquiries</strong> — to reply to messages sent via email.','<strong>Legal compliance</strong> — to comply with applicable laws and regulations.'],
    s4h: '4. Legal Basis for Processing (GDPR)',
    s4p: 'For visitors in the European Economic Area (EEA), our legal bases for processing personal data are:',
    s4items: ['<strong>Legitimate interests</strong> — for analytics and Website security.','<strong>Consent</strong> — for advertising and non-essential cookies, which we seek via our cookie consent notice.','<strong>Legal obligation</strong> — where processing is required to comply with applicable law.'],
    s5h: '5. Third-Party Services',
    s5items: ['<strong>Google Analytics</strong> — receives anonymised usage data. See <a href="https://policies.google.com/privacy" target="_blank" rel="nofollow">Google\'s Privacy Policy</a>.','<strong>Google AdSense</strong> — serves advertisements and may use cookies to personalise ads. See <a href="https://policies.google.com/privacy" target="_blank" rel="nofollow">Google\'s Privacy Policy</a>.','<strong>Agoda</strong> — when you click on hotel listings, you are directed to Agoda\'s platform. Any data you provide to Agoda is governed by <a href="https://www.agoda.com/info/privacy.html" target="_blank" rel="nofollow">Agoda\'s Privacy Policy</a>.','<strong>GetYourGuide</strong> — when you click on activity and tour links, you are directed to GetYourGuide\'s platform. Any data you provide is governed by <a href="https://www.getyourguide.com/privacy-policy/" target="_blank" rel="nofollow">GetYourGuide\'s Privacy Policy</a>.','<strong>ImageKit</strong> — used to serve and optimise images on the Website.'],
    s5outro: 'We do not sell your personal data to any third party.',
    s5ah: '5a. Local Storage',
    s5ap: 'In addition to cookies, Country Pick stores the following data in your browser\'s local storage. This data never leaves your device:',
    s5aitems: ['<strong>cp_map_v1</strong> — your visited and wishlist country selections for the interactive map.','<strong>cp_geojson_v1</strong> — a cached copy of the map\'s geographic data to improve load times.','<strong>cp_consent</strong> — your cookie consent choice.'],
    s5ap2: 'You can clear all local storage data at any time through your browser\'s developer tools or site settings.',
    s6h: '6. International Transfers',
    s6p: 'Some of our third-party providers (including Google) may process data outside the European Economic Area. Where this occurs, we rely on appropriate safeguards such as Standard Contractual Clauses approved by the European Commission.',
    s7h: '7. Data Retention',
    s7p: 'Analytics data is typically retained for 26 months within Google Analytics. Contact enquiry data is retained for as long as needed to resolve your request and for a reasonable period thereafter.',
    s8h: '8. Your Rights',
    s8p: 'Depending on your location, you may have rights to access, correct, erase, restrict, or port your personal data, to object to processing, and to withdraw consent. To exercise any of these rights, please contact us at',
    s8p2: 'We will respond within 30 days. You also have the right to lodge a complaint with your local data protection authority.',
    s9h: '9. Data Security',
    s9p: 'We take appropriate technical and organisational measures to protect your data against accidental loss, unauthorised access, disclosure, or destruction. However, no transmission over the internet is completely secure.',
    s10h: '10. Children',
    s10p: 'Country Pick is not directed at children under the age of 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.',
    s11h: '11. Changes to This Policy',
    s11p: 'We may update this Privacy Policy from time to time. Changes will be reflected by the "Last updated" date at the top of this page.',
    s12h: '12. Contact Us',
  },
  pt: {
    title: 'Política de Privacidade - Country Pick',
    description: 'Saiba como o Country Pick coleta, usa e protege seus dados pessoais quando você visita nossa plataforma de exploração de viagens.',
    h: 'Política de <strong>Privacidade</strong>',
    updated: 'Última atualização: 30 de maio de 2026',
    breadcrumb: 'Política de Privacidade',
    intro: 'O Country Pick ("nós", "nos" ou "nosso") está comprometido em proteger sua privacidade. Esta Política de Privacidade explica quais dados coletamos quando você visita www.countrypick.com (o "Site"), como os utilizamos e quais são os seus direitos em relação a eles.',
    introLink: 'Leia esta política junto com nossos',
    introLinkTerms: 'Termos e Condições',
    introLinkAnd: 'e nossa',
    introLinkCookies: 'Política de Cookies',
    s1h: '1. Quem Somos',
    s1p: 'O Country Pick é uma plataforma de exploração de viagens. Se você tiver alguma dúvida sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato conosco em',
    s2h: '2. Quais Dados Coletamos',
    s2p: 'Como visitante do Country Pick, coletamos apenas os dados necessários para operar e melhorar o Site.',
    s2a: 'Dados de Uso e Técnicos',
    s2ap: 'Quando você visita o Site, coletamos automaticamente certas informações técnicas, incluindo seu endereço IP (anonimizado quando possível), tipo e versão do navegador, sistema operacional, URL de referência, páginas visitadas, tempo de permanência nas páginas e localização geográfica geral (nível de país ou cidade). Esses dados são coletados por meio do Google Analytics e não identificam você pessoalmente.',
    s2b: 'Preferência de Idioma',
    s2bp: 'O idioma selecionado é refletido no caminho da URL (ex.: /pt/ ou /es/) e não é armazenado como cookie.',
    s2c: 'Dados de Cookies',
    s2cp1: 'Usamos cookies e tecnologias similares para operar o Site e exibir anúncios relevantes. Para mais detalhes, consulte nossa',
    s2cp2: 'Política de Cookies',
    s2d: 'Consultas de Contato',
    s2dp: 'Se você nos contatar por e-mail, coletamos seu nome, endereço de e-mail e o conteúdo da sua mensagem para responder à sua consulta. Esses dados não são utilizados para nenhum outro propósito.',
    s3h: '3. Como Usamos Seus Dados',
    s3items: ['<strong>Operação do Site</strong> — para entregar as páginas corretamente e restaurar suas seleções no mapa interativo.','<strong>Análise</strong> — para entender como os visitantes usam o Site e melhorar o conteúdo e o desempenho. Usamos o Google Analytics para essa finalidade.','<strong>Publicidade</strong> — para exibir anúncios relevantes por meio do Google AdSense. O Google pode usar dados da sua visita para personalizar anúncios exibidos a você no Country Pick e em outros sites.','<strong>Resposta a consultas</strong> — para responder a mensagens enviadas por e-mail.','<strong>Conformidade legal</strong> — para cumprir com as leis e regulamentos aplicáveis.'],
    s4h: '4. Base Legal para o Tratamento (LGPD/GDPR)',
    s4p: 'As bases legais para o tratamento dos seus dados pessoais são:',
    s4items: ['<strong>Interesse legítimo</strong> — para análise e segurança do Site.','<strong>Consentimento</strong> — para publicidade e cookies não essenciais, que solicitamos por meio do nosso aviso de consentimento de cookies.','<strong>Obrigação legal</strong> — quando o tratamento for exigido para cumprir a lei aplicável.'],
    s5h: '5. Serviços de Terceiros',
    s5items: ['<strong>Google Analytics</strong> — recebe dados de uso anonimizados. Veja a <a href="https://policies.google.com/privacy" target="_blank" rel="nofollow">Política de Privacidade do Google</a>.','<strong>Google AdSense</strong> — exibe anúncios e pode usar cookies para personalizá-los. Veja a <a href="https://policies.google.com/privacy" target="_blank" rel="nofollow">Política de Privacidade do Google</a>.','<strong>Agoda</strong> — ao clicar em listagens de hotéis, você é direcionado para a plataforma da Agoda. Quaisquer dados que você fornecer à Agoda são regidos pela <a href="https://www.agoda.com/info/privacy.html" target="_blank" rel="nofollow">Política de Privacidade da Agoda</a>.','<strong>GetYourGuide</strong> — ao clicar em links de atividades e passeios, você é direcionado para a plataforma do GetYourGuide. Quaisquer dados fornecidos são regidos pela <a href="https://www.getyourguide.com/privacy-policy/" target="_blank" rel="nofollow">Política de Privacidade do GetYourGuide</a>.','<strong>ImageKit</strong> — usado para servir e otimizar imagens no Site.'],
    s5outro: 'Não vendemos seus dados pessoais a terceiros.',
    s5ah: '5a. Armazenamento Local',
    s5ap: 'Além dos cookies, o Country Pick armazena os seguintes dados no armazenamento local do seu navegador. Esses dados nunca saem do seu dispositivo:',
    s5aitems: ['<strong>cp_map_v1</strong> — suas seleções de países visitados e na lista de desejos no mapa interativo.','<strong>cp_geojson_v1</strong> — uma cópia em cache dos dados geográficos do mapa para melhorar o tempo de carregamento.','<strong>cp_consent</strong> — sua escolha de consentimento de cookies.'],
    s5ap2: 'Você pode limpar todos os dados do armazenamento local a qualquer momento nas ferramentas do desenvolvedor ou nas configurações do site no seu navegador.',
    s6h: '6. Transferências Internacionais',
    s6p: 'Alguns de nossos fornecedores terceiros (incluindo o Google) podem processar dados fora do Brasil ou da Área Econômica Europeia. Quando isso ocorrer, nos baseamos em salvaguardas adequadas, como Cláusulas Contratuais Padrão aprovadas pela Comissão Europeia.',
    s7h: '7. Retenção de Dados',
    s7p: 'Os dados de análise são normalmente retidos por 26 meses no Google Analytics. Os dados de consultas de contato são retidos pelo tempo necessário para resolver sua solicitação e por um período razoável posteriormente.',
    s8h: '8. Seus Direitos',
    s8p: 'Você pode ter o direito de acessar, corrigir, apagar, restringir ou portar seus dados pessoais, de se opor ao tratamento e de retirar o consentimento. Para exercer qualquer um desses direitos, entre em contato conosco em',
    s8p2: 'Responderemos em até 30 dias. Você também tem o direito de registrar uma reclamação junto à autoridade de proteção de dados competente.',
    s9h: '9. Segurança dos Dados',
    s9p: 'Tomamos medidas técnicas e organizacionais adequadas para proteger seus dados contra perda acidental, acesso não autorizado, divulgação ou destruição. No entanto, nenhuma transmissão pela internet é completamente segura.',
    s10h: '10. Crianças',
    s10p: 'O Country Pick não é direcionado a crianças menores de 13 anos. Não coletamos intencionalmente dados pessoais de crianças. Se você acreditar que uma criança nos forneceu dados pessoais, entre em contato conosco e os excluiremos imediatamente.',
    s11h: '11. Alterações nesta Política',
    s11p: 'Podemos atualizar esta Política de Privacidade periodicamente. As alterações serão refletidas pela data de "Última atualização" no topo desta página.',
    s12h: '12. Fale Conosco',
  },
  es: {
    title: 'Política de Privacidad - Country Pick',
    description: 'Aprende cómo Country Pick recopila, usa y protege tus datos personales cuando visitas nuestra plataforma de exploración de viajes.',
    h: 'Política de <strong>Privacidad</strong>',
    updated: 'Última actualización: 30 de mayo de 2026',
    breadcrumb: 'Política de Privacidad',
    intro: 'Country Pick ("nosotros" o "nuestro") está comprometido con la protección de tu privacidad. Esta Política de Privacidad explica qué datos recopilamos cuando visitas www.countrypick.com (el "Sitio Web"), cómo los utilizamos y cuáles son tus derechos al respecto.',
    introLink: 'Lee esta política junto con nuestros',
    introLinkTerms: 'Términos y Condiciones',
    introLinkAnd: 'y nuestra',
    introLinkCookies: 'Política de Cookies',
    s1h: '1. Quiénes Somos',
    s1p: 'Country Pick es una plataforma de exploración de viajes. Si tienes alguna pregunta sobre esta Política de Privacidad o sobre cómo gestionamos tus datos, contáctanos en',
    s2h: '2. Qué Datos Recopilamos',
    s2p: 'Como visitante de Country Pick, solo recopilamos los datos necesarios para operar y mejorar el Sitio Web.',
    s2a: 'Datos de Uso y Técnicos',
    s2ap: 'Cuando visitas el Sitio Web, recopilamos automáticamente cierta información técnica, incluyendo tu dirección IP (anonimizada cuando sea posible), tipo y versión del navegador, sistema operativo, URL de referencia, páginas visitadas, tiempo en las páginas y ubicación geográfica general (país o ciudad). Estos datos se recopilan a través de Google Analytics y no te identifican personalmente.',
    s2b: 'Preferencia de Idioma',
    s2bp: 'El idioma seleccionado se refleja en la ruta de la URL (p. ej. /es/) y no se almacena como cookie.',
    s2c: 'Datos de Cookies',
    s2cp1: 'Usamos cookies y tecnologías similares para operar el Sitio Web y mostrar publicidad relevante. Para más detalles, consulta nuestra',
    s2cp2: 'Política de Cookies',
    s2d: 'Consultas de Contacto',
    s2dp: 'Si nos contactas por correo electrónico, recopilamos tu nombre, dirección de correo electrónico y el contenido de tu mensaje para responder a tu consulta. Estos datos no se utilizan para ningún otro propósito.',
    s3h: '3. Cómo Usamos Tus Datos',
    s3items: ['<strong>Operación del Sitio Web</strong> — para entregar las páginas correctamente y restaurar tus selecciones en el mapa interactivo.','<strong>Análisis</strong> — para entender cómo los visitantes usan el Sitio Web y mejorar el contenido y el rendimiento. Usamos Google Analytics para este propósito.','<strong>Publicidad</strong> — para mostrar anuncios relevantes a través de Google AdSense. Google puede usar datos de tu visita para personalizar los anuncios que se te muestran en Country Pick y otros sitios web.','<strong>Respuesta a consultas</strong> — para responder a los mensajes enviados por correo electrónico.','<strong>Cumplimiento legal</strong> — para cumplir con las leyes y regulaciones aplicables.'],
    s4h: '4. Base Legal para el Tratamiento (GDPR)',
    s4p: 'Para los visitantes del Área Económica Europea (AEE), las bases legales para el tratamiento de datos personales son:',
    s4items: ['<strong>Intereses legítimos</strong> — para análisis y seguridad del Sitio Web.','<strong>Consentimiento</strong> — para publicidad y cookies no esenciales, que solicitamos a través de nuestro aviso de consentimiento de cookies.','<strong>Obligación legal</strong> — cuando el tratamiento sea necesario para cumplir con la ley aplicable.'],
    s5h: '5. Servicios de Terceros',
    s5items: ['<strong>Google Analytics</strong> — recibe datos de uso anonimizados. Consulta la <a href="https://policies.google.com/privacy" target="_blank" rel="nofollow">Política de Privacidad de Google</a>.','<strong>Google AdSense</strong> — muestra anuncios y puede usar cookies para personalizarlos. Consulta la <a href="https://policies.google.com/privacy" target="_blank" rel="nofollow">Política de Privacidad de Google</a>.','<strong>Agoda</strong> — al hacer clic en listados de hoteles, eres redirigido a la plataforma de Agoda. Cualquier dato que proporciones a Agoda se rige por la <a href="https://www.agoda.com/info/privacy.html" target="_blank" rel="nofollow">Política de Privacidad de Agoda</a>.','<strong>GetYourGuide</strong> — al hacer clic en enlaces de actividades y tours, eres redirigido a la plataforma de GetYourGuide. Cualquier dato proporcionado se rige por la <a href="https://www.getyourguide.com/privacy-policy/" target="_blank" rel="nofollow">Política de Privacidad de GetYourGuide</a>.','<strong>ImageKit</strong> — utilizado para servir y optimizar imágenes en el Sitio Web.'],
    s5outro: 'No vendemos tus datos personales a ningún tercero.',
    s5ah: '5a. Almacenamiento Local',
    s5ap: 'Además de las cookies, Country Pick almacena los siguientes datos en el almacenamiento local de tu navegador. Estos datos nunca salen de tu dispositivo:',
    s5aitems: ['<strong>cp_map_v1</strong> — tus selecciones de países visitados y en lista de deseos en el mapa interactivo.','<strong>cp_geojson_v1</strong> — una copia en caché de los datos geográficos del mapa para mejorar los tiempos de carga.','<strong>cp_consent</strong> — tu elección de consentimiento de cookies.'],
    s5ap2: 'Puedes borrar todos los datos del almacenamiento local en cualquier momento desde las herramientas de desarrollador o la configuración del sitio en tu navegador.',
    s6h: '6. Transferencias Internacionales',
    s6p: 'Algunos de nuestros proveedores externos (incluido Google) pueden procesar datos fuera del Área Económica Europea. Cuando esto ocurra, nos basamos en garantías adecuadas, como las Cláusulas Contractuales Estándar aprobadas por la Comisión Europea.',
    s7h: '7. Retención de Datos',
    s7p: 'Los datos de análisis se retienen generalmente durante 26 meses en Google Analytics. Los datos de consultas de contacto se retienen durante el tiempo necesario para resolver tu solicitud y por un período razonable después.',
    s8h: '8. Tus Derechos',
    s8p: 'Dependiendo de tu ubicación, puedes tener derechos de acceso, rectificación, supresión, limitación o portabilidad de tus datos personales, a oponerte al tratamiento y a retirar el consentimiento. Para ejercer cualquiera de estos derechos, contáctanos en',
    s8p2: 'Responderemos en un plazo de 30 días. También tienes derecho a presentar una reclamación ante tu autoridad local de protección de datos.',
    s9h: '9. Seguridad de los Datos',
    s9p: 'Adoptamos medidas técnicas y organizativas adecuadas para proteger tus datos contra pérdidas accidentales, accesos no autorizados, divulgación o destrucción. Sin embargo, ninguna transmisión por internet es completamente segura.',
    s10h: '10. Menores',
    s10p: 'Country Pick no está dirigido a menores de 13 años. No recopilamos a sabiendas datos personales de menores. Si crees que un menor nos ha proporcionado datos personales, contáctanos y los eliminaremos de inmediato.',
    s11h: '11. Cambios en Esta Política',
    s11p: 'Podemos actualizar esta Política de Privacidad periódicamente. Los cambios se reflejarán en la fecha de "Última actualización" en la parte superior de esta página.',
    s12h: '12. Contacto',
  },
} as const;

const PrivacyPage: NextPage<Props> = ({ lang, t, continents, activeLangs }) => {
  const canonical = `${BASE_URL}/${lang}/privacy`;
  const c = C[lang as keyof typeof C] ?? C.en;

  const seo = {
    title: c.title,
    description: c.description,
    canonical,
    hreflang: buildHreflang('/privacy'),
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

      <p>{c.intro}</p>
      <p>{c.introLink}{' '}
        <Link href={`/${lang}/terms`}>{c.introLinkTerms}</Link>{' '}
        {c.introLinkAnd}{' '}
        <Link href={`/${lang}/cookies`}>{c.introLinkCookies}</Link>.
      </p>

      <h2>{c.s1h}</h2>
      <p>{c.s1p} <a href="mailto:contact@countrypick.com">contact@countrypick.com</a>.</p>

      <h2>{c.s2h}</h2>
      <p>{c.s2p}</p>
      <h3>{c.s2a}</h3>
      <p>{c.s2ap}</p>
      <h3>{c.s2b}</h3>
      <p>{c.s2bp}</p>
      <h3>{c.s2c}</h3>
      <p>{c.s2cp1} <Link href={`/${lang}/cookies`}>{c.s2cp2}</Link>.</p>
      <h3>{c.s2d}</h3>
      <p>{c.s2dp}</p>

      <h2>{c.s3h}</h2>
      <ul>{c.s3items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</ul>

      <h2>{c.s4h}</h2>
      <p>{c.s4p}</p>
      <ul>{c.s4items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</ul>

      <h2>{c.s5h}</h2>
      <ul>{c.s5items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</ul>
      <p>{c.s5outro}</p>

      <h2>{c.s5ah}</h2>
      <p>{c.s5ap}</p>
      <ul>{c.s5aitems.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</ul>
      <p>{c.s5ap2}</p>

      <h2>{c.s6h}</h2>
      <p>{c.s6p}</p>

      <h2>{c.s7h}</h2>
      <p>{c.s7p}</p>

      <h2>{c.s8h}</h2>
      <p>{c.s8p} <a href="mailto:contact@countrypick.com">contact@countrypick.com</a>. {c.s8p2}</p>

      <h2>{c.s9h}</h2>
      <p>{c.s9p}</p>

      <h2>{c.s10h}</h2>
      <p>{c.s10p}</p>

      <h2>{c.s11h}</h2>
      <p>{c.s11p}</p>

      <h2>{c.s12h}</h2>
      <p>
        <strong>Country Pick</strong><br />
        Email: <a href="mailto:contact@countrypick.com">contact@countrypick.com</a><br />
        Website: <a href="https://www.countrypick.com">www.countrypick.com</a>
      </p>
    </StaticPage>
  );
};

export default PrivacyPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: (await getActiveLangs()).map(l => ({ params: { lang: l.code } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang = (params?.lang as Lang) ?? 'en';
  const continents = await getFooterContinents(lang);
  const activeLangs = await getActiveLangs();
  return { props: { activeLangs, lang, t: getTranslations(lang), continents } };
};
