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
    title: 'Cookies Policy - Country Pick',
    description: 'Learn how Country Pick uses cookies and similar technologies to operate the website and serve relevant advertising.',
    h: 'Cookies <strong>Policy</strong>',
    updated: 'Last updated: May 30, 2026',
    breadcrumb: 'Cookies Policy',
    intro1: 'Country Pick uses cookies and similar technologies to operate the Website, remember your preferences, analyse traffic, and serve relevant advertising.',
    intro2Link1: 'For information on how we handle your personal data more broadly, please see our',
    intro2Privacy: 'Privacy Policy',
    whatH: 'What Is a Cookie?',
    whatP: 'A cookie is a small text file placed on your device by a website you visit. Cookies are widely used to make websites work efficiently and to provide information to website owners. They do not contain executable code and cannot access other data on your device.',
    typesH: 'Types of Cookies We Use',
    essH: 'Essential Cookies',
    essP: 'These cookies are strictly necessary for the Website to function. Without them, parts of the site would not work. They do not require your consent.',
    funH: 'Functional Cookies',
    funP: 'These cookies remember choices you have made so the Website can provide a more personalised experience on return visits.',
    anaH: 'Analytics Cookies',
    anaP: 'We use Google Analytics to understand how visitors interact with the Website — which pages are most visited, how long people stay, and where they come from. This helps us improve content and performance. The data collected is aggregated and anonymised.',
    advH: 'Advertising Cookies',
    advP: 'We use Google AdSense to display advertisements on the Website. Google and its partners use cookies to show ads based on your previous visits to this and other websites. You can opt out of personalised advertising at any time via',
    advPLink: "Google's Ad Settings",
    gygP: 'Destination pages also feature activity links powered by',
    gygLink: 'GetYourGuide',
    gygP2: '. If you click a GetYourGuide link, GetYourGuide may set its own cookies on their platform in accordance with their privacy policy. Country Pick does not control those cookies.',
    tableH: 'Cookies We Use',
    thCat: 'Category',
    thName: 'Name / Key',
    thPurpose: 'Purpose',
    thExpiry: 'Expiry',
    cookies: [
      { cat: 'Analytics',   name: '_ga',  purpose: 'Google Analytics — distinguishes unique visitors and tracks usage statistics.', expiry: '2 years' },
      { cat: 'Analytics',   name: '_gid', purpose: 'Google Analytics — identifies a user session.',                                  expiry: '24 hours' },
      { cat: 'Analytics',   name: '_gat', purpose: 'Google Analytics — throttles the request rate to Google servers.',               expiry: '1 minute' },
      { cat: 'Advertising', name: 'NID',  purpose: "Google — stores your preferences to personalise ads shown on Google's network.", expiry: '6 months' },
      { cat: 'Advertising', name: 'IDE',  purpose: 'Google DoubleClick — records and reports actions after viewing or clicking an ad.', expiry: '1 year' },
    ],
    lsH: 'Local Storage (Not Cookies)',
    lsP: "In addition to cookies, Country Pick stores the following data in your browser's local storage. Unlike cookies, this data is never sent to any server — it stays entirely on your device.",
    lsThKey: 'Key',
    lsThPurpose: 'Purpose',
    lsThPersists: 'Persists',
    lsItems: [
      { key: 'cp_consent',     purpose: 'Stores your cookie consent preference (accepted or declined) so we do not ask again on every visit.',                                               persists: 'Until cleared' },
      { key: 'cp_map_v1',      purpose: 'Saves your visited and wishlist country selections for the interactive map, so your map is restored when you return to the site.',                  persists: 'Until cleared' },
      { key: 'cp_geojson_v1',  purpose: "Caches the map's geographic data to speed up load times on return visits.",                                                                        persists: 'Until cleared' },
    ],
    manageH: 'Managing Your Cookie Preferences',
    manageP1: 'You can control and manage cookies in several ways. Please be aware that removing or blocking cookies may affect your experience on the Website.',
    manageBrowser: 'Via your browser settings: most browsers allow you to view, block, or delete cookies.',
    browsers: [
      { label: 'Google Chrome',  url: 'https://support.google.com/chrome/answer/95647' },
      { label: 'Mozilla Firefox', url: 'https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences' },
      { label: 'Apple Safari',   url: 'https://support.apple.com/en-gb/guide/safari/sfri11471/mac' },
      { label: 'Microsoft Edge', url: 'https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
    ],
    optOutGA: 'Opt out of Google Analytics: install the',
    optOutGALink: 'Google Analytics Opt-out Browser Add-on',
    optOutGAUrl: 'https://tools.google.com/dlpage/gaoptout',
    optOutAds: 'Opt out of personalised advertising: visit',
    optOutAdsLinks: [
      { label: 'Google Ad Settings', url: 'https://adssettings.google.com' },
      { label: 'Your Online Choices (EU)', url: 'https://www.youronlinechoices.eu' },
      { label: 'AboutAds (US)', url: 'https://optout.aboutads.info' },
    ],
    changesH: 'Changes to This Policy',
    changesP: 'We may update this Cookies Policy from time to time. Changes will be reflected by the "Last updated" date above.',
    contactH: 'Contact Us',
    contactP: 'If you have any questions about our use of cookies, please contact us at',
  },
  pt: {
    title: 'Política de Cookies - Country Pick',
    description: 'Saiba como o Country Pick usa cookies e tecnologias similares para operar o site e exibir publicidade relevante.',
    h: 'Política de <strong>Cookies</strong>',
    updated: 'Última atualização: 30 de maio de 2026',
    breadcrumb: 'Política de Cookies',
    intro1: 'O Country Pick usa cookies e tecnologias similares para operar o Site, lembrar suas preferências, analisar o tráfego e exibir publicidade relevante.',
    intro2Link1: 'Para saber como tratamos seus dados pessoais de forma mais ampla, consulte nossa',
    intro2Privacy: 'Política de Privacidade',
    whatH: 'O Que É um Cookie?',
    whatP: 'Um cookie é um pequeno arquivo de texto colocado no seu dispositivo por um site que você visita. Os cookies são amplamente usados para fazer os sites funcionarem de forma eficiente e para fornecer informações aos proprietários dos sites. Eles não contêm código executável e não podem acessar outros dados no seu dispositivo.',
    typesH: 'Tipos de Cookies que Usamos',
    essH: 'Cookies Essenciais',
    essP: 'Esses cookies são estritamente necessários para o funcionamento do Site. Sem eles, partes do site não funcionariam. Eles não requerem seu consentimento.',
    funH: 'Cookies Funcionais',
    funP: 'Esses cookies lembram as escolhas que você fez para que o Site possa oferecer uma experiência mais personalizada nas suas próximas visitas.',
    anaH: 'Cookies de Análise',
    anaP: 'Usamos o Google Analytics para entender como os visitantes interagem com o Site — quais páginas são mais visitadas, quanto tempo as pessoas ficam e de onde vêm. Isso nos ajuda a melhorar o conteúdo e o desempenho. Os dados coletados são agregados e anonimizados.',
    advH: 'Cookies de Publicidade',
    advP: 'Usamos o Google AdSense para exibir anúncios no Site. O Google e seus parceiros usam cookies para mostrar anúncios com base nas suas visitas anteriores a este e a outros sites. Você pode cancelar a publicidade personalizada a qualquer momento em',
    advPLink: 'Configurações de Anúncios do Google',
    gygP: 'As páginas de destinos também apresentam links de atividades do',
    gygLink: 'GetYourGuide',
    gygP2: '. Se você clicar em um link do GetYourGuide, ele poderá definir seus próprios cookies em sua plataforma de acordo com a política de privacidade deles. O Country Pick não controla esses cookies.',
    tableH: 'Cookies que Usamos',
    thCat: 'Categoria',
    thName: 'Nome / Chave',
    thPurpose: 'Finalidade',
    thExpiry: 'Validade',
    cookies: [
      { cat: 'Análise',    name: '_ga',  purpose: 'Google Analytics — distingue visitantes únicos e rastreia estatísticas de uso.', expiry: '2 anos' },
      { cat: 'Análise',    name: '_gid', purpose: 'Google Analytics — identifica uma sessão de usuário.',                          expiry: '24 horas' },
      { cat: 'Análise',    name: '_gat', purpose: 'Google Analytics — limita a taxa de solicitações aos servidores do Google.',     expiry: '1 minuto' },
      { cat: 'Publicidade', name: 'NID', purpose: 'Google — armazena suas preferências para personalizar anúncios exibidos na rede do Google.', expiry: '6 meses' },
      { cat: 'Publicidade', name: 'IDE', purpose: 'Google DoubleClick — registra e reporta ações após visualizar ou clicar em um anúncio.', expiry: '1 ano' },
    ],
    lsH: 'Armazenamento Local (Não São Cookies)',
    lsP: 'Além dos cookies, o Country Pick armazena os seguintes dados no armazenamento local do seu navegador. Ao contrário dos cookies, esses dados nunca são enviados a nenhum servidor — ficam inteiramente no seu dispositivo.',
    lsThKey: 'Chave',
    lsThPurpose: 'Finalidade',
    lsThPersists: 'Persistência',
    lsItems: [
      { key: 'cp_consent',    purpose: 'Armazena sua preferência de consentimento de cookies (aceito ou recusado) para não perguntarmos novamente a cada visita.', persists: 'Até ser limpo' },
      { key: 'cp_map_v1',     purpose: 'Salva suas seleções de países visitados e na lista de desejos no mapa interativo, para que seu mapa seja restaurado ao retornar ao site.', persists: 'Até ser limpo' },
      { key: 'cp_geojson_v1', purpose: 'Armazena em cache os dados geográficos do mapa para acelerar o carregamento nas visitas seguintes.', persists: 'Até ser limpo' },
    ],
    manageH: 'Gerenciando Suas Preferências de Cookies',
    manageP1: 'Você pode controlar e gerenciar cookies de diversas formas. Esteja ciente de que remover ou bloquear cookies pode afetar sua experiência no Site.',
    manageBrowser: 'Pelas configurações do navegador: a maioria dos navegadores permite visualizar, bloquear ou excluir cookies.',
    browsers: [
      { label: 'Google Chrome',  url: 'https://support.google.com/chrome/answer/95647' },
      { label: 'Mozilla Firefox', url: 'https://support.mozilla.org/pt-BR/kb/ative-e-desative-os-cookies-que-os-sites-usam' },
      { label: 'Apple Safari',   url: 'https://support.apple.com/pt-br/guide/safari/sfri11471/mac' },
      { label: 'Microsoft Edge', url: 'https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
    ],
    optOutGA: 'Cancelar o Google Analytics: instale o',
    optOutGALink: 'Complemento de Navegador para Desativação do Google Analytics',
    optOutGAUrl: 'https://tools.google.com/dlpage/gaoptout',
    optOutAds: 'Cancelar publicidade personalizada: acesse',
    optOutAdsLinks: [
      { label: 'Configurações de Anúncios do Google', url: 'https://adssettings.google.com' },
      { label: 'Your Online Choices (EU)', url: 'https://www.youronlinechoices.eu' },
      { label: 'AboutAds (EUA)', url: 'https://optout.aboutads.info' },
    ],
    changesH: 'Alterações nesta Política',
    changesP: 'Podemos atualizar esta Política de Cookies periodicamente. As alterações serão refletidas pela data de "Última atualização" acima.',
    contactH: 'Fale Conosco',
    contactP: 'Se você tiver alguma dúvida sobre o uso de cookies, entre em contato conosco em',
  },
  es: {
    title: 'Política de Cookies - Country Pick',
    description: 'Aprende cómo Country Pick usa cookies y tecnologías similares para operar el sitio web y mostrar publicidad relevante.',
    h: 'Política de <strong>Cookies</strong>',
    updated: 'Última actualización: 30 de mayo de 2026',
    breadcrumb: 'Política de Cookies',
    intro1: 'Country Pick utiliza cookies y tecnologías similares para operar el Sitio Web, recordar tus preferencias, analizar el tráfico y mostrar publicidad relevante.',
    intro2Link1: 'Para información sobre cómo gestionamos tus datos personales en general, consulta nuestra',
    intro2Privacy: 'Política de Privacidad',
    whatH: '¿Qué Es una Cookie?',
    whatP: 'Una cookie es un pequeño archivo de texto que un sitio web coloca en tu dispositivo. Las cookies se usan ampliamente para que los sitios web funcionen de forma eficiente y para proporcionar información a los propietarios de los sitios. No contienen código ejecutable y no pueden acceder a otros datos de tu dispositivo.',
    typesH: 'Tipos de Cookies que Usamos',
    essH: 'Cookies Esenciales',
    essP: 'Estas cookies son estrictamente necesarias para el funcionamiento del Sitio Web. Sin ellas, partes del sitio no funcionarían. No requieren tu consentimiento.',
    funH: 'Cookies Funcionales',
    funP: 'Estas cookies recuerdan las elecciones que has realizado para que el Sitio Web pueda ofrecerte una experiencia más personalizada en tus próximas visitas.',
    anaH: 'Cookies de Análisis',
    anaP: 'Usamos Google Analytics para entender cómo los visitantes interactúan con el Sitio Web — qué páginas son más visitadas, cuánto tiempo permanecen y de dónde vienen. Esto nos ayuda a mejorar el contenido y el rendimiento. Los datos recopilados son agregados y anonimizados.',
    advH: 'Cookies de Publicidad',
    advP: 'Usamos Google AdSense para mostrar anuncios en el Sitio Web. Google y sus socios utilizan cookies para mostrar anuncios basados en tus visitas anteriores a este y otros sitios web. Puedes cancelar la publicidad personalizada en cualquier momento en',
    advPLink: 'Configuración de Anuncios de Google',
    gygP: 'Las páginas de destinos también incluyen enlaces de actividades de',
    gygLink: 'GetYourGuide',
    gygP2: '. Si haces clic en un enlace de GetYourGuide, GetYourGuide puede establecer sus propias cookies en su plataforma de acuerdo con su política de privacidad. Country Pick no controla esas cookies.',
    tableH: 'Cookies que Usamos',
    thCat: 'Categoría',
    thName: 'Nombre / Clave',
    thPurpose: 'Propósito',
    thExpiry: 'Caducidad',
    cookies: [
      { cat: 'Análisis',    name: '_ga',  purpose: 'Google Analytics — distingue visitantes únicos y registra estadísticas de uso.', expiry: '2 años' },
      { cat: 'Análisis',    name: '_gid', purpose: 'Google Analytics — identifica una sesión de usuario.',                          expiry: '24 horas' },
      { cat: 'Análisis',    name: '_gat', purpose: 'Google Analytics — limita la tasa de solicitudes a los servidores de Google.',   expiry: '1 minuto' },
      { cat: 'Publicidad',  name: 'NID',  purpose: 'Google — almacena tus preferencias para personalizar los anuncios mostrados en la red de Google.', expiry: '6 meses' },
      { cat: 'Publicidad',  name: 'IDE',  purpose: 'Google DoubleClick — registra y reporta acciones tras ver o hacer clic en un anuncio.', expiry: '1 año' },
    ],
    lsH: 'Almacenamiento Local (No Son Cookies)',
    lsP: 'Además de las cookies, Country Pick almacena los siguientes datos en el almacenamiento local de tu navegador. A diferencia de las cookies, estos datos nunca se envían a ningún servidor — permanecen íntegramente en tu dispositivo.',
    lsThKey: 'Clave',
    lsThPurpose: 'Propósito',
    lsThPersists: 'Persistencia',
    lsItems: [
      { key: 'cp_consent',    purpose: 'Almacena tu preferencia de consentimiento de cookies (aceptado o rechazado) para no preguntarte de nuevo en cada visita.', persists: 'Hasta ser borrado' },
      { key: 'cp_map_v1',     purpose: 'Guarda tus selecciones de países visitados y en lista de deseos en el mapa interactivo, para que tu mapa se restaure al volver al sitio.', persists: 'Hasta ser borrado' },
      { key: 'cp_geojson_v1', purpose: 'Almacena en caché los datos geográficos del mapa para acelerar la carga en visitas posteriores.', persists: 'Hasta ser borrado' },
    ],
    manageH: 'Gestión de tus Preferencias de Cookies',
    manageP1: 'Puedes controlar y gestionar las cookies de varias formas. Ten en cuenta que eliminar o bloquear cookies puede afectar tu experiencia en el Sitio Web.',
    manageBrowser: 'A través de la configuración del navegador: la mayoría de los navegadores permiten ver, bloquear o eliminar cookies.',
    browsers: [
      { label: 'Google Chrome',  url: 'https://support.google.com/chrome/answer/95647' },
      { label: 'Mozilla Firefox', url: 'https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias' },
      { label: 'Apple Safari',   url: 'https://support.apple.com/es-es/guide/safari/sfri11471/mac' },
      { label: 'Microsoft Edge', url: 'https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
    ],
    optOutGA: 'Cancelar Google Analytics: instala el',
    optOutGALink: 'Complemento de inhabilitación para navegadores de Google Analytics',
    optOutGAUrl: 'https://tools.google.com/dlpage/gaoptout',
    optOutAds: 'Cancelar la publicidad personalizada: visita',
    optOutAdsLinks: [
      { label: 'Configuración de Anuncios de Google', url: 'https://adssettings.google.com' },
      { label: 'Your Online Choices (UE)', url: 'https://www.youronlinechoices.eu' },
      { label: 'AboutAds (EE. UU.)', url: 'https://optout.aboutads.info' },
    ],
    changesH: 'Cambios en Esta Política',
    changesP: 'Podemos actualizar esta Política de Cookies periódicamente. Los cambios se reflejarán en la fecha de "Última actualización" indicada arriba.',
    contactH: 'Contacto',
    contactP: 'Si tienes alguna pregunta sobre el uso de cookies, contáctanos en',
  },
} as const;

const CookiesPage: NextPage<Props> = ({ lang, t, continents, activeLangs }) => {
  const canonical = `${BASE_URL}/${lang}/cookies`;
  const c = C[lang as keyof typeof C] ?? C.en;

  const seo = {
    title: c.title,
    description: c.description,
    canonical,
    hreflang: buildHreflang('/cookies', activeLangs),
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

      <p>{c.intro1}</p>
      <p>{c.intro2Link1}{' '}<Link href={`/${lang}/privacy`}>{c.intro2Privacy}</Link>.</p>

      <h2>{c.whatH}</h2>
      <p>{c.whatP}</p>

      <h2>{c.typesH}</h2>
      <h3>{c.essH}</h3>
      <p>{c.essP}</p>
      <h3>{c.funH}</h3>
      <p>{c.funP}</p>
      <h3>{c.anaH}</h3>
      <p>{c.anaP}</p>
      <h3>{c.advH}</h3>
      <p>{c.advP} <a href="https://adssettings.google.com" target="_blank" rel="nofollow">{c.advPLink}</a>.</p>
      <p>{c.gygP} <a href="https://www.getyourguide.com" target="_blank" rel="nofollow">{c.gygLink}</a>{c.gygP2}</p>

      <h2>{c.tableH}</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th style={{ width: 140 }}>{c.thCat}</th>
              <th style={{ width: 180 }}>{c.thName}</th>
              <th>{c.thPurpose}</th>
              <th style={{ width: 130 }}>{c.thExpiry}</th>
            </tr>
          </thead>
          <tbody>
            {c.cookies.map((row, i) => (
              <tr key={i}>
                <td>{row.cat}</td>
                <td>{row.name}</td>
                <td>{row.purpose}</td>
                <td>{row.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{c.lsH}</h2>
      <p>{c.lsP}</p>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th style={{ width: 180 }}>{c.lsThKey}</th>
              <th>{c.lsThPurpose}</th>
              <th style={{ width: 130 }}>{c.lsThPersists}</th>
            </tr>
          </thead>
          <tbody>
            {c.lsItems.map((row, i) => (
              <tr key={i}>
                <td><code>{row.key}</code></td>
                <td>{row.purpose}</td>
                <td>{row.persists}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{c.manageH}</h2>
      <p>{c.manageP1}</p>
      <p><strong>{c.manageBrowser}</strong></p>
      <ul>
        {c.browsers.map((b, i) => (
          <li key={i}><a href={b.url} target="_blank" rel="nofollow">{b.label}</a></li>
        ))}
      </ul>
      <p><strong>{c.optOutGA}:</strong>{' '}<a href={c.optOutGAUrl} target="_blank" rel="nofollow">{c.optOutGALink}</a>.</p>
      <p><strong>{c.optOutAds}:</strong>{' '}
        {c.optOutAdsLinks.map((l, i) => (
          <span key={i}><a href={l.url} target="_blank" rel="nofollow">{l.label}</a>{i < c.optOutAdsLinks.length - 1 ? ', ' : '.'}</span>
        ))}
      </p>

      <h2>{c.changesH}</h2>
      <p>{c.changesP}</p>

      <h2>{c.contactH}</h2>
      <p>{c.contactP} <a href="mailto:contact@countrypick.com">contact@countrypick.com</a>.</p>
    </StaticPage>
  );
};

export default CookiesPage;

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
