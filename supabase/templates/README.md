# Templates de e-mail (Auth)

Arquivos HTML para colar no Supabase Dashboard → **Authentication → Emails**.

| Arquivo | Template no Dashboard |
|---------|------------------------|
| `reset-password.html` | **Reset password** |

## Como aplicar

1. Abra o arquivo `.html`
2. Copie **só o HTML** (pode incluir o comentário do topo; o Dashboard usa o corpo)
4. Cole em **Email Templates → Reset password**
5. **Subject:** `Seu código para redefinir a senha`

## OTP (só dígitos no hospedado)

O Supabase Auth **hospedado** gera OTP **numérico** (ex.: 6 dígitos). Não há toggle no Dashboard para letra+número ainda.

O app aceita A–Z e 0–9 por compatibilidade futura; hoje o e-mail chega só com números.

## Logo

O template usa a marca **WE** em bloco com o gradiente Vela/WeDash (sem imagem externa), para funcionar em qualquer cliente de e-mail. Quando tiver logo hospedado (CDN / Storage público), dá para trocar o bloco `WE` por `<img src="URL_PUBLICA" width="40" height="40" alt="WeDash" />`.
