# Checklist de Testes - Sistema de Autenticação

## ✅ Testes Manuais Essenciais

### 1. Teste de Cadastro Completo
- [ ] Navegar para `/register`
- [ ] Preencher dados válidos:
  - Nome: "João da Silva" 
  - Email: "joao.teste@gmail.com"
  - Senha: "MinhaSenh@123"
  - Confirmar senha: "MinhaSenh@123"
- [ ] Avançar para etapa 2 (campos opcionais)
- [ ] Aceitar termos e cadastrar
- [ ] **Resultado esperado**: Conta criada e redirecionamento para dashboard
- [ ] **Validação no banco**: Verificar que senha está em hash (não "MinhaSenh@123")

### 2. Teste de Email Duplicado  
- [ ] Tentar cadastrar novamente com o mesmo email
- [ ] **Resultado esperado**: Erro "E-mail já cadastrado. Faça login ou recupere sua senha."

### 3. Teste de Validações de Senha
- [ ] Tentar senha fraca: "123"
- [ ] **Resultado esperado**: Indicadores vermelhos, botão desabilitado
- [ ] Testar senha forte: "MinhaSenh@456"
- [ ] **Resultado esperado**: Indicadores verdes, força "forte" ou "muito forte"

### 4. Teste de Login
- [ ] Navegar para `/login`
- [ ] Usar email: "joao.teste@gmail.com" e senha: "MinhaSenh@123"
- [ ] **Resultado esperado**: Login bem-sucedido, redirecionamento para dashboard
- [ ] Atualizar página (F5)
- [ ] **Resultado esperado**: Usuário continua logado (não volta para login)

### 5. Teste de Proteção contra Força Bruta
- [ ] Tentar login com senha errada 5 vezes seguidas
- [ ] **Resultado esperado**: Conta bloqueada por 2 minutos
- [ ] Aguardar 2 minutos e tentar novamente
- [ ] **Resultado esperado**: Bloqueio removido, pode tentar login normal

### 6. Teste de Logout
- [ ] Fazer logout
- [ ] **Resultado esperado**: Redirecionamento para página inicial, sessão limpa
- [ ] Tentar acessar `/dashboard` diretamente
- [ ] **Resultado esperado**: Redirecionamento para login

### 7. Teste de Recuperação de Senha
- [ ] Na tela de login, clicar "Esqueci minha senha" 
- [ ] Informar email válido
- [ ] **Resultado esperado**: Mensagem "E-mail de recuperação enviado"
- [ ] **Verificar logs**: Email deve ser enviado via Supabase

## ✅ Validações de Segurança

### 1. Verificação no Banco de Dados
```sql
-- Verificar que senhas estão em hash (Supabase Dashboard > Authentication > Users)
-- Senhas nunca devem aparecer em texto claro
-- Verificar que profiles são criados automaticamente
SELECT id, email, created_at, email_confirmed_at FROM auth.users;
SELECT id, full_name, email_verified, role FROM public.profiles;
```

### 2. Verificação de Logs de Auditoria
```sql
-- Verificar que eventos de criação de usuário são registrados
SELECT * FROM public.activity_logs 
WHERE activity_type = 'user_created' 
ORDER BY created_at DESC;
```

### 3. Validação de Tokens de Sessão
- [ ] Inspecionar localStorage/sessionStorage: não deve conter senhas
- [ ] Verificar tokens JWT válidos no Developer Tools > Application
- [ ] Confirmar renovação automática de tokens

## ⚠️ Cenários de Erro para Testar

### Dados Inválidos
- [ ] Nome vazio → "Nome é obrigatório"
- [ ] Email inválido → "Email inválido" 
- [ ] Senha < 8 caracteres → "Senha deve ter pelo menos 8 caracteres"
- [ ] Confirmação diferente → "Senhas não coincidem"
- [ ] Email temporário (10minutemail.com) → "Email inválido ou temporário"

### Casos Extremos
- [ ] Nome com 1 palavra → "Digite pelo menos nome e sobrenome"
- [ ] Email com espaços → Normalização automática
- [ ] Senha só números → Indicador de força baixa
- [ ] Conexão instável → Tratamento de erro gracioso

## 🔍 Auditoria de Segurança

### Verificar que NÃO existem:
- [ ] Senhas em texto claro no banco
- [ ] Senhas nos logs de console
- [ ] Tokens expostos em URLs
- [ ] Stack traces para usuários finais

### Verificar que EXISTEM:
- [ ] Hashes bcrypt para senhas (formato: $2a$...)
- [ ] Logs de auditoria sem dados sensíveis  
- [ ] Validação client-side E server-side
- [ ] Rate limiting funcionando
- [ ] Persistência de sessão estável

## 📋 Relatório de Conclusão

Após executar todos os testes acima, confirmar:

✅ **Cadastro**: Usuários criados com senha hash segura
✅ **Login**: Autenticação funcional com proteções
✅ **Sessão**: Persistência estável entre navegações  
✅ **Segurança**: Validações robustas implementadas
✅ **Auditoria**: Logs criados sem exposição de dados sensíveis
✅ **UX**: Mensagens de erro claras e orientativas

**Status**: ✅ Sistema pronto para produção
**Próximos passos**: Opcional - 2FA, SSO, verificação por SMS