# Logo da franquia

Enquanto esta pasta estiver vazia, o app usa o símbolo do template (`public/favicon.svg`)
como marca provisória, em todas as telas e nos ícones do PWA.

Para usar o logo real:

1. Coloque o arquivo aqui, por exemplo `logo.svg` ou `logo.png` (fundo transparente).
2. Aponte para ele em `src/data/gestao/tenant.ts`, no campo `logoUrl`:
   `logoUrl: "/brand/logo.svg"`.
3. Para trocar também o ícone do celular e a aba do navegador, substitua
   `public/favicon.svg` e regenere `public/icons/*.png` a partir dele.

Se o arquivo apontado não carregar, a interface volta sozinha para o símbolo do template.
Não há tela quebrada por logo ausente.
