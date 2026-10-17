# Meta Velha — projeto para iOS

Aplicativo web responsivo preparado para empacotamento nativo no iPhone usando Capacitor. Mantém as regras principais do jogo: tabuleiro principal 3×3, minijogos 3×3, empate reinicia o minijogo, jogador X contra bot # e dificuldades Fácil/Médio/Difícil.

## Requisitos para compilar o `.ipa`

- Node.js LTS e npm.
- Um Mac compatível com a versão do Xcode usada.
- Xcode instalado; para instalar em dispositivo físico, uma identidade de assinatura válida. Distribuição pela App Store exige conta Apple Developer.

## Compilar a parte web

```bash
npm install
npm run test:logic
npm run build
```

## Preparar o projeto iOS (no Mac)

```bash
npm run ios:add
npm run ios:sync
npm run ios:open
```

No Xcode, selecione a equipe de assinatura (Signing & Capabilities), defina o destino e faça primeiro um teste em simulador ou iPhone. Para exportar um `.ipa`, use Product > Archive e depois Distribute App, conforme o tipo de distribuição pretendido.

## Observações importantes

- O ZIP contém o código-fonte e a configuração para gerar o aplicativo; não contém um `.ipa` assinado. Um `.ipa` instalável precisa ser compilado e assinado no ambiente Apple.
- O ícone fornecido foi incluído em `assets/meta-velha.png`; o Xcode pode exigir os tamanhos de ícone do catálogo `AppIcon` para a distribuição final.
- O som usa Web Audio e pode depender do primeiro toque para ser ativado no iOS.
- A fonte DM Sans / Space Grotesk é carregada online; o jogo continua funcional sem ela, usando fontes de sistema como alternativa.

## Testes feitos neste pacote

`npm run test:logic` valida as funções de detecção de vitória e algumas decisões da IA. Isso é teste automatizado de lógica em Node.js, não equivale a um teste de compilação/execução dentro do Xcode ou no iPhone. Esses passos ainda precisam ser feitos no ambiente Apple.
