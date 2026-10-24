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
  'trocas-e-devolucoes': {
    title: 'Trocas e Devoluções',
    subtitle: 'Compre com tranquilidade',
    content: `Queremos que você compre com tranquilidade. Se a peça não for o que você esperava, veja abaixo como funcionam as trocas e devoluções da {{storeName}}.

## Direito de arrependimento (7 dias)
Conforme o Código de Defesa do Consumidor, você pode desistir da compra feita pelo site em até 7 dias corridos, contados da data de recebimento do pedido, sem precisar justificar. Nesse caso:
- O valor pago é devolvido integralmente, incluindo o frete pago na compra.
- O envio da devolução não gera custo para você.
- A peça deve ser devolvida sem sinais de uso, lavagem ou alteração, com etiquetas e, sempre que possível, na embalagem original.

## Troca por tamanho ou modelo (até 30 dias)
Se o tamanho ou o modelo não ficou como esperado, você pode solicitar a troca em até 30 dias corridos após o recebimento, sujeita à disponibilidade em estoque. A peça precisa estar sem uso, sem lavagem, sem odores e com etiquetas. Se a peça desejada estiver indisponível, oferecemos outra peça ou o reembolso. O frete da nova remessa, quando houver, é informado pelo atendimento antes de você confirmar a troca.

## Produto com defeito ou enviado errado
Se você recebeu uma peça com defeito de fabricação, danificada ou diferente da que comprou, fale com a gente em até 30 dias corridos após o recebimento, conforme o Código de Defesa do Consumidor. Nesses casos, todos os custos de envio e devolução são por nossa conta, e você escolhe entre a troca por outra peça, o reembolso ou o abatimento proporcional do preço.

## Como solicitar
- Entre em contato pelo WhatsApp {{whatsapp}} ou pelo e-mail {{contactEmail}}.
- Informe o número do pedido, seu nome completo, a peça e o motivo. Em caso de defeito ou erro de envio, anexe fotos da peça e da etiqueta.
- Nossa equipe analisa o pedido e responde com as instruções de envio. Não envie a peça antes de receber a confirmação.
- Embale bem a peça e envie conforme as orientações recebidas.
- Ao receber, conferimos a peça em até 5 dias úteis e concluímos a troca ou o reembolso.

## Itens com regras especiais
Por questões de higiene, peças íntimas e de moda praia só podem ser trocadas se estiverem com o lacre ou a etiqueta higiênica intactos e sem uso, exceto em caso de defeito ou de direito de arrependimento, nos termos da lei.

## Reembolso
Os prazos e as formas de reembolso estão descritos na nossa Política de Reembolso.`
  },
  'fale-conosco': {
    title: 'Fale Conosco',
    subtitle: 'Estamos aqui para ajudar',
    content: `Estamos aqui para ajudar antes, durante e depois da sua compra. Escolha o canal que for melhor para você.

## Nossos canais
- WhatsApp: {{whatsapp}}
- E-mail: {{contactEmail}}
- Instagram: {{instagram}}

## Horário de atendimento
{{businessHours}}
Fora desse horário, deixe sua mensagem e respondemos assim que possível.

## Para agilizar seu atendimento
Tenha em mãos o número do pedido e o e-mail usado na compra. Em casos de defeito ou erro no envio, envie fotos da peça e da etiqueta.

## Respostas rápidas
- Acompanhar o pedido: use a opção "Rastrear Pedido" no rodapé do site.
- Trocas e devoluções: veja as regras na página Trocas e Devoluções.
- Dúvidas comuns: consulte as Perguntas Frequentes.

## Nosso compromisso
Respondemos suas mensagens com atenção e respeito, sempre buscando resolver da melhor forma. Se sua solicitação não for atendida como esperado, escreva para {{contactEmail}} com o assunto "Reclamação" e o número do pedido, que nossa equipe revisa o caso.`
  },
  'perguntas-frequentes': {
    title: 'Perguntas Frequentes',
    subtitle: 'As respostas que você procura',
    content: `## Pedidos e pagamento
### Quais formas de pagamento vocês aceitam?
Aceitamos Pix e cartão de crédito. No cartão, você pode parcelar em até 10 vezes sem juros, conforme as condições exibidas no produto e no carrinho.
### Meu pagamento é seguro?
Sim. O pagamento é processado pelo Mercado Pago, em ambiente seguro e criptografado, e a {{storeName}} não armazena os dados completos do seu cartão. Nosso site usa conexão protegida (HTTPS).
### Quando meu pedido é confirmado?
O pedido é confirmado quando o pagamento é aprovado. O Pix costuma ser aprovado em instantes; no cartão, a aprovação pode levar um pouco mais. Você recebe a confirmação por e-mail. Pedidos com Pix não pago no prazo podem ser cancelados automaticamente.
### Posso alterar ou cancelar meu pedido?
Sim, desde que ele ainda não tenha sido enviado. Fale com a gente o quanto antes, informando o número do pedido. Depois do envio, você pode usar o direito de arrependimento ou de troca, conforme a página Trocas e Devoluções.

## Entrega
### Qual o prazo de entrega?
O prazo é de 10 a 20 dias úteis, contados a partir da aprovação do pagamento, e pode variar conforme a região e a transportadora.
### Como rastreio meu pedido?
Quando o pedido é enviado, você recebe um e-mail com o código de rastreio. Você também pode consultar pela opção "Rastrear Pedido", no rodapé do site, ou em "Meus Pedidos".
### Como funciona o frete grátis?
Oferecemos frete grátis nas condições informadas no topo do site e no carrinho (regiões atendidas e valor mínimo de compra). O valor do frete aparece sempre antes de você finalizar o pedido.
### Meu pedido atrasou ou não chegou. O que faço?
Confira o rastreio. Se o prazo informado já passou ou o status não atualiza, fale com a gente com o número do pedido, que verificamos junto à transportadora.
### Posso mudar o endereço de entrega?
Antes do envio, sim. Depois do envio, depende da transportadora. Fale conosco o quanto antes.

## Produtos e trocas
### Como escolho o tamanho certo?
Use a tabela de medidas na página do produto e compare com as suas medidas. Se estiver em dúvida entre dois tamanhos, fale com a gente pelo WhatsApp antes de comprar, que ajudamos você a escolher.
### As cores são iguais às das fotos?
Trabalhamos para que as fotos representem fielmente as peças, mas a cor pode variar um pouco conforme a tela do seu dispositivo.
### Posso trocar se não servir?
Sim. Você tem 7 dias para desistir da compra e até 30 dias para pedir troca de tamanho ou modelo, nas condições da página Trocas e Devoluções.
### Como cuido das minhas peças?
Siga as instruções da etiqueta de cada peça. Em geral, recomendamos lavar à mão ou em ciclo delicado, com água fria, evitar alvejante e secar à sombra.

## Segurança e dados
### Meus dados estão protegidos?
Sim. Tratamos seus dados conforme a LGPD e só os usamos para o que é necessário para sua compra e atendimento. Saiba mais na Política de Privacidade.
### Não encontrei minha dúvida. Como falo com vocês?
Pelo WhatsApp {{whatsapp}} ou pelo e-mail {{contactEmail}}.`
  }
};
