/**
 * @fileOverview Conteúdo e mapeamento das páginas institucionais da Toda Bela.
 */

export const FOOTER_LABEL_TO_SLUG: Record<string, string> = {
  'sobre nos': 'sobre-nos',
  'nossa historia': 'nossa-historia',
  'trabalhe conosco': 'trabalhe-conosco',
  'trocas e devolucoes': 'trocas-e-devolucoes',
  'fale conosco': 'fale-conosco',
  'perguntas frequentes': 'perguntas-frequentes',
  'termos de uso': 'termos-de-uso',
  'politica de privacidade': 'politica-de-privacidade',
  'politica de reembolso': 'politica-de-reembolso',
};

export interface InstitucionalPageData {
  title: string;
  subtitle?: string;
  updatedAt?: string;
  content: string;
}

export const INSTITUCIONAL_PAGES: Record<string, InstitucionalPageData> = {
  'sobre-nos': {
    title: 'Sobre Nós',
    subtitle: 'Moda feminina com elegância, conforto e confiança',
    content: `A {{storeName}} é uma loja de moda feminina criada para mulheres que gostam de se vestir bem em qualquer momento da vida. Aqui, estilo e conforto andam juntos: cada peça é escolhida para valorizar quem a veste, com modelagens pensadas para diferentes corpos e um olhar especial para a moda plus size.

## O que nos move
Acreditamos que moda boa é a que faz você se sentir confiante, e não a que exige que você se encaixe em um padrão. Por isso, selecionamos peças atemporais, versáteis e fáceis de combinar, para você montar looks bonitos no dia a dia, no trabalho e nas ocasiões especiais.

## Nossos compromissos
- Qualidade: peças selecionadas com atenção a caimento, acabamento e conforto.
- Transparência: informações claras sobre produtos, prazos, valores e políticas, sem letras miúdas.
- Atendimento próximo: uma equipe pronta para ajudar antes, durante e depois da compra.
- Compra segura: pagamento processado por plataforma reconhecida, conexão protegida e respeito aos seus dados.
- Respeito: tratamos cada cliente com carinho e sem julgamentos.

## Como cuidamos da sua compra
Da escolha da peça à entrega, acompanhamos cada etapa. Você recebe a confirmação do pedido por e-mail, é avisada quando o pedido é enviado e pode acompanhar o rastreio quando quiser. Se algo não sair como esperado, nossa política de trocas e devoluções foi feita para resolver com tranquilidade e dentro da lei.

## Fale com a gente
Sua opinião ajuda a {{storeName}} a melhorar. Conte como foi sua experiência, tire dúvidas ou envie sugestões pelos nossos canais de atendimento.`
  },
  'nossa-historia': {
    title: 'Nossa História',
    subtitle: 'Moda que acolhe, do jeito que toda mulher merece',
    content: `## Uma ideia simples
A {{storeName}} nasceu de uma ideia simples: toda mulher merece encontrar roupas bonitas, confortáveis e feitas para ela, sem abrir mão do estilo. Começamos com muito carinho pelas escolhas e atenção a cada detalhe, e seguimos crescendo ao lado das clientes que confiam na gente.

## Moda que acolhe
Percebemos que muitas mulheres ainda têm dificuldade de encontrar peças modernas e sofisticadas com boa modelagem para o seu corpo. Foi dessa necessidade que surgiu o nosso olhar especial para a moda plus size: peças com caimento cuidadoso, tecidos agradáveis e um visual elegante que valoriza quem as usa.

## Crescendo com você
Cada avaliação, mensagem e sugestão que recebemos ajuda a moldar a loja, das peças que escolhemos ao jeito que atendemos. Seguimos evoluindo para entregar uma experiência de compra cada vez mais simples, segura e acolhedora.

## O que vem pela frente
Queremos continuar trazendo novidades, ampliar nossas coleções e fazer da {{storeName}} uma referência de moda feminina com elegância e confiança. Obrigada por fazer parte dessa história.`
  },
  'trabalhe-conosco': {
    title: 'Trabalhe Conosco',
    subtitle: 'Venha fazer parte da equipe {{storeName}}',
    content: `Na {{storeName}}, acreditamos que boas equipes fazem boas experiências. Se você gosta de moda, de atender bem e de trabalhar em um ambiente respeitoso, queremos conhecer você.

## Áreas de interesse
- Atendimento ao cliente
- Moda e estilo
- Produção de conteúdo e redes sociais
- Logística, estoque e expedição
- Vendas e relacionamento

## Como participar
- Envie seu currículo para {{contactEmail}} com o assunto "Trabalhe Conosco" e a área de interesse.
- Conte um pouco sobre você e inclua, se tiver, links de portfólio ou de redes sociais profissionais.
- Mantemos os currículos em nosso banco de talentos e entramos em contato quando surgir uma oportunidade compatível.

## Nossos princípios
Valorizamos respeito, responsabilidade e vontade de aprender. Todas as pessoas são bem-vindas, independentemente de gênero, idade, cor, orientação sexual, religião, deficiência ou corpo.

## Segurança dos seus dados
Os dados do seu currículo são usados apenas em processos seletivos da {{storeName}}, conforme nossa Política de Privacidade. Você pode pedir a exclusão do seu currículo a qualquer momento pelo mesmo e-mail.

> Importante: nunca cobramos qualquer valor para participar de processos seletivos.`
  },
  'fale-conosco': {
    title: 'Fale Conosco',
    subtitle: 'Estamos aqui para ouvir você e ajudar no que for preciso',
    content: `## Atendimento VIP
Na {{storeName}}, valorizamos cada contato. Se você tem dúvidas sobre um produto, precisa de ajuda com um pedido ou quer fazer uma sugestão, escolha o canal de sua preferência.

## Horário de Atendimento
{{businessHours}}

## Nossos Canais
- WhatsApp: {{whatsapp}}
- E-mail: {{contactEmail}}
- Instagram: {{instagram}}

## Endereço
{{companyName}}
{{cnpj}}
{{address}}`
  }
};
