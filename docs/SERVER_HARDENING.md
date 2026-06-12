# Guía de Hardening del Servidor VPS

## 1. SSH — Cambio de puerto y deshabilitación de root

```bash
# /etc/ssh/sshd_config
Port 2222                    # ✅ Puerto no estándar (elige uno entre 1024-65535)
PermitRootLogin no           # ✅ Nunca login como root
PasswordAuthentication no    # ✅ Solo autenticación por clave SSH
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 30
AllowUsers tuusuario         # Solo el usuario específico

# Reiniciar SSH (NO cerres la sesión actual hasta verificar)
sudo systemctl restart sshd
```

## 2. Firewall (UFW)

```bash
# ✅ Solo los puertos estrictamente necesarios
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp      # SSH (puerto elegido)
sudo ufw allow 80/tcp        # HTTP (para redirect y Certbot)
sudo ufw allow 443/tcp       # HTTPS
sudo ufw enable
sudo ufw status verbose

# FTP DESHABILITADO — usar SFTP a través del puerto SSH
sudo systemctl disable vsftpd 2>/dev/null || true
```

## 3. DNS y Cloudflare

```
Registro A:     tallertohan.com     → IP_DEL_SERVIDOR    [Proxy: ON (nube naranja)]
Registro CNAME: www                 → tallertohan.com    [Proxy: ON]

✅ La nube naranja de Cloudflare oculta la IP real del servidor.
✅ Cloudflare fuerza HTTPS automáticamente.
✅ Configurar Page Rule: http://* → https:// (301 redirect)
```

## 4. Certbot (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tallertohan.com -d www.tallertohan.com
# Renovación automática
sudo systemctl enable certbot.timer
```

## 5. Fail2ban (protección anti brute-force SSH)

```bash
sudo apt install fail2ban
# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = 2222
maxretry = 3
bantime = 3600
```

## 6. Actualizaciones automáticas de seguridad

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## 7. Supabase / Base de datos expuesta públicamente

Si usas Supabase en lugar de PostgreSQL propio:
- Habilitar **Row Level Security (RLS)** en TODAS las tablas
- Configurar alertas de costo en el dashboard
- NUNCA usar la anon key en el frontend para operaciones sensibles
- Usar siempre el backend como intermediario

## 8. Checklist de producción

- [ ] `.env` en `.gitignore` y NUNCA en el repositorio
- [ ] Contraseña del admin del seed cambiada
- [ ] Puertos innecesarios cerrados
- [ ] SSH con clave, sin root, puerto cambiado
- [ ] HTTPS activo con redirect automático desde HTTP
- [ ] Rate limiting configurado y probado
- [ ] Alertas de costo/uso en el proveedor cloud
- [ ] Backups automáticos de PostgreSQL configurados
